// @ts-ignore
/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Interface para requisição de geração de conteúdo
 */
interface GenerationRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  context?: string;
}

/**
 * Interface para resposta da Gemini API
 */
interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}

/**
 * Valida e sanitiza a entrada do usuário
 */
function validateAndSanitizeInput(request: GenerationRequest): { valid: boolean; error?: string; sanitized?: GenerationRequest } {
  // Validar prompt
  if (!request.prompt || typeof request.prompt !== 'string') {
    return { valid: false, error: 'Prompt is required and must be a string' };
  }

  const prompt = request.prompt.trim();
  if (prompt.length === 0) {
    return { valid: false, error: 'Prompt cannot be empty' };
  }

  if (prompt.length > 5000) {
    return { valid: false, error: 'Prompt too long (max 5000 characters)' };
  }

  // Validar maxTokens
  const maxTokens = request.maxTokens || 1000;
  if (typeof maxTokens !== 'number' || maxTokens < 1 || maxTokens > 2000) {
    return { valid: false, error: 'maxTokens must be between 1 and 2000' };
  }

  // Validar temperature
  const temperature = request.temperature || 0.7;
  if (typeof temperature !== 'number' || temperature < 0 || temperature > 1) {
    return { valid: false, error: 'temperature must be between 0 and 1' };
  }

  // Validar context
  const context = request.context || '';
  if (typeof context !== 'string' || context.length > 2000) {
    return { valid: false, error: 'context must be a string with max 2000 characters' };
  }

  return {
    valid: true,
    sanitized: {
      prompt,
      maxTokens,
      temperature,
      context: context.trim()
    }
  };
}

/**
 * Verifica se o usuário tem permissão para usar a API
 */
async function checkUserPermissions(userId: string, supabaseClient: any): Promise<{ allowed: boolean; reason?: string }> {
  try {
    // Verificar se o usuário existe e está ativo
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, premium_status, created_at')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return { allowed: false, reason: 'User profile not found' };
    }

    // Verificar rate limiting (máximo 10 gerações por hora para usuários gratuitos)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: recentGenerations, error: countError } = await supabaseClient
      .from('api_usage_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('api_type', 'content_generation')
      .gte('created_at', oneHourAgo);

    if (countError) {
      console.error('Error checking rate limit:', countError);
      return { allowed: false, reason: 'Error checking rate limit' };
    }

    const hourlyLimit = profile.premium_status === 'active' ? 50 : 10;
    if (recentGenerations && recentGenerations.length >= hourlyLimit) {
      return { allowed: false, reason: `Rate limit exceeded (${hourlyLimit} requests per hour)` };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking user permissions:', error);
    return { allowed: false, reason: 'Permission check failed' };
  }
}

/**
 * Registra o uso da API para rate limiting
 */
async function logApiUsage(userId: string, supabaseClient: any, success: boolean, tokensUsed: number = 0): Promise<void> {
  try {
    await supabaseClient
      .from('api_usage_logs')
      .insert({
        user_id: userId,
        api_type: 'content_generation',
        success,
        tokens_used: tokensUsed,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error logging API usage:', error);
  }
}

/**
 * Chama a Gemini API de forma segura
 */
async function callGeminiApi(request: GenerationRequest): Promise<{ success: boolean; content?: string; error?: string; tokensUsed?: number }> {
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  
  if (!GEMINI_API_KEY) {
    return { success: false, error: 'Gemini API key not configured' };
  }

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
    
    const requestBody = {
      contents: [{
        parts: [{
          text: request.context ? `${request.context}\n\n${request.prompt}` : request.prompt
        }]
      }],
      generationConfig: {
        temperature: request.temperature,
        maxOutputTokens: request.maxTokens,
        topP: 0.8,
        topK: 40
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Gemini API error: ${response.status} - ${errorText}` };
    }

    const data: GeminiResponse = await response.json();

    if (data.error) {
      return { success: false, error: `Gemini API error: ${data.error.message}` };
    }

    if (!data.candidates || data.candidates.length === 0) {
      return { success: false, error: 'No content generated' };
    }

    const content = data.candidates[0].content.parts[0].text;
    const tokensUsed = content.split(' ').length; // Estimativa simples

    return { success: true, content, tokensUsed };
  } catch (error) {
    console.error('Gemini API call failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

serve(async (req: Request) => {
  // Tratar preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar método HTTP
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Autenticar usuário
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cliente admin para operações no banco
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar permissões do usuário
    const permissionCheck = await checkUserPermissions(user.id, supabaseAdmin);
    if (!permissionCheck.allowed) {
      await logApiUsage(user.id, supabaseAdmin, false);
      return new Response(
        JSON.stringify({ error: permissionCheck.reason }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar entrada
    const requestData = await req.json();
    const validation = validateAndSanitizeInput(requestData);
    
    if (!validation.valid) {
      await logApiUsage(user.id, supabaseAdmin, false);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Chamar Gemini API
    const result = await callGeminiApi(validation.sanitized!);
    
    // Registrar uso da API
    await logApiUsage(user.id, supabaseAdmin, result.success, result.tokensUsed);

    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          content: '', 
          success: false, 
          error: result.error 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        content: result.content, 
        success: true,
        tokensUsed: result.tokensUsed
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Generate content function error:', error);
    
    return new Response(
      JSON.stringify({ 
        content: '', 
        success: false, 
        error: 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
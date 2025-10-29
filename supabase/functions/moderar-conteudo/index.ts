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
 * Valida e sanitiza entrada do usuário
 */
function validateInput(data: any): { valid: boolean; error?: string; sanitized?: any } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const { texto, content_type, content_id } = data;

  // Validar texto
  if (!texto || typeof texto !== 'string') {
    return { valid: false, error: 'O campo "texto" é obrigatório e deve ser uma string' };
  }

  const sanitizedText = texto.trim();
  if (sanitizedText.length === 0) {
    return { valid: false, error: 'O texto não pode estar vazio' };
  }

  if (sanitizedText.length > 10000) {
    return { valid: false, error: 'Texto muito longo (máximo 10.000 caracteres)' };
  }

  // Validar content_type
  const validContentTypes = ['post', 'comment', 'message', 'text'];
  const sanitizedContentType = content_type || 'text';
  if (!validContentTypes.includes(sanitizedContentType)) {
    return { valid: false, error: 'Tipo de conteúdo inválido' };
  }

  // Validar content_id (opcional)
  let sanitizedContentId = null;
  if (content_id) {
    if (typeof content_id !== 'string' || content_id.length > 100) {
      return { valid: false, error: 'ID de conteúdo inválido' };
    }
    sanitizedContentId = content_id.trim();
  }

  return {
    valid: true,
    sanitized: {
      texto: sanitizedText,
      content_type: sanitizedContentType,
      content_id: sanitizedContentId
    }
  };
}

/**
 * Verifica rate limiting para moderação
 */
async function checkRateLimit(userId: string, supabaseAdmin: any): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: recentModerations, error } = await supabaseAdmin
      .from('api_usage_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('api_type', 'content_moderation')
      .gte('created_at', oneHourAgo);

    if (error) {
      console.error('Error checking rate limit:', error);
      return { allowed: false, reason: 'Error checking rate limit' };
    }

    const hourlyLimit = 100; // 100 moderações por hora
    if (recentModerations && recentModerations.length >= hourlyLimit) {
      return { allowed: false, reason: 'Rate limit exceeded' };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return { allowed: false, reason: 'Rate limit check failed' };
  }
}

/**
 * Registra uso da API de moderação
 */
async function logModerationUsage(userId: string, supabaseAdmin: any, success: boolean): Promise<void> {
  try {
    await supabaseAdmin
      .from('api_usage_logs')
      .insert({
        user_id: userId,
        api_type: 'content_moderation',
        success,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error logging moderation usage:', error);
  }
}

/**
 * Chama a Perspective API de forma segura
 */
async function callPerspectiveApi(texto: string): Promise<{ success: boolean; data?: any; error?: string }> {
  const PERSPECTIVE_API_KEY = Deno.env.get('PERSPECTIVE_API_KEY');
  
  if (!PERSPECTIVE_API_KEY) {
    return { success: false, error: 'Perspective API key not configured' };
  }

  const PERSPECTIVE_API_URL = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${PERSPECTIVE_API_KEY}`;

  try {
    const perspectiveRequest = {
      comment: { text: texto },
      languages: ['pt', 'en'],
      requestedAttributes: {
        TOXICITY: {}, SEVERE_TOXICITY: {}, IDENTITY_ATTACK: {},
        INSULT: {}, PROFANITY: {}, THREAT: {},
      },
    };

    const response = await fetch(PERSPECTIVE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(perspectiveRequest),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Perspective API error:', errorBody);
      return { success: false, error: `Perspective API request failed with status ${response.status}` };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Perspective API call failed:', error);
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verificar rate limiting
    const rateLimitCheck = await checkRateLimit(user.id, supabaseAdmin);
    if (!rateLimitCheck.allowed) {
      await logModerationUsage(user.id, supabaseAdmin, false);
      return new Response(
        JSON.stringify({ error: rateLimitCheck.reason }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar entrada
    const requestData = await req.json();
    const validation = validateInput(requestData);
    
    if (!validation.valid) {
      await logModerationUsage(user.id, supabaseAdmin, false);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { texto, content_type, content_id } = validation.sanitized!;

    // Chamar Perspective API de forma segura
    const perspectiveResult = await callPerspectiveApi(texto);
    
    if (!perspectiveResult.success) {
      await logModerationUsage(user.id, supabaseAdmin, false);
      return new Response(
        JSON.stringify({ error: perspectiveResult.error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const scores = perspectiveResult.data.attributeScores;

    // Definir threshold para considerar conteúdo tóxico
    const THRESHOLD = 0.7;

    // Verificar se algum dos atributos excede o threshold
    const toxicAttributes = Object.keys(scores).filter(key => 
      scores[key].summaryScore.value > THRESHOLD
    );
    const isToxic = toxicAttributes.length > 0;

    // Calcular score máximo
    const maxScore = Math.max(...Object.values(scores).map((attr: any) => attr.summaryScore.value));

    if (isToxic) {
      try {
        // Inserir na fila de moderação
        const { error: insertError } = await supabaseAdmin
          .from('moderation_queue')
          .insert({
            content_id: content_id || null,
            content_type: content_type,
            content_text: texto,
            author_id: user.id,
            severity_score: maxScore,
            violation_types: toxicAttributes,
            status: 'pending',
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error inserting into moderation queue:', insertError);
          await logModerationUsage(user.id, supabaseAdmin, false);
          return new Response(
            JSON.stringify({ error: 'Failed to queue content for moderation' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (error) {
        console.error('Error processing toxic content:', error);
        await logModerationUsage(user.id, supabaseAdmin, false);
        return new Response(
          JSON.stringify({ error: 'Error processing moderation' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Registrar uso bem-sucedido
    await logModerationUsage(user.id, supabaseAdmin, true);

    // Preparar resposta com scores normalizados
    const normalizedScores = Object.fromEntries(
      Object.entries(scores).map(([key, value]: [string, any]) => [
        key,
        Math.round(value.summaryScore.value * 100) / 100 // Arredondar para 2 casas decimais
      ])
    );

    return new Response(JSON.stringify({
      isToxic,
      scores: normalizedScores,
      maxScore: Math.round(maxScore * 100) / 100,
      violationTypes: toxicAttributes,
      message: isToxic ? 'Conteúdo enviado para moderação' : 'Conteúdo aprovado',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in moderation function:', error);
    
    // Tentar registrar o erro se possível
    try {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
      
      // Tentar obter user ID do token se disponível
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          { global: { headers: { Authorization: authHeader } } }
        );
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
          await logModerationUsage(user.id, supabaseAdmin, false);
        }
      }
    } catch (logError) {
      console.error('Error logging failed moderation:', logError);
    }

    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: 'Erro interno do servidor. Tente novamente mais tarde.',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
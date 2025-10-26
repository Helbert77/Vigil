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

const PERSPECTIVE_API_URL = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${Deno.env.get('PERSPECTIVE_API_KEY')}`;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Autenticar o usuário que está fazendo a requisição
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Cliente admin para operações no banco
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { texto, content_type, content_id } = await req.json();
    if (!texto) {
      return new Response(JSON.stringify({ error: 'O campo "texto" é obrigatório' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

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
      throw new Error(`Perspective API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const scores = data.attributeScores;
    const toxicityScore = scores.TOXICITY.summaryScore.value;
    
    const THRESHOLD = 0.7;
    const isToxic = toxicityScore > THRESHOLD;

    if (isToxic) {
      const violationTypes = Object.keys(scores).filter(attr => scores[attr].summaryScore.value > THRESHOLD);
      
      // Adiciona à fila de moderação
      await supabaseAdmin.from('moderation_queue').insert({
        content_id: content_id, // Opcional, pode ser nulo para novos posts
        content_type: content_type || 'text',
        content_text: texto,
        author_id: user.id,
        severity_score: Math.round(toxicityScore * 100),
        violation_types: violationTypes,
        status: 'pending',
        source: 'auto',
      });

      return new Response(JSON.stringify({ action: 'queued_for_moderation' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ action: 'approved' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})
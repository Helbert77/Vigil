import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[check-trial-expirations] Iniciando verificação de trials expirados...');

    // Buscar todos os trials que expiraram
    const { data: expiredTrials, error: fetchError } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan, trial_ends_at, status')
      .eq('status', 'trialing')
      .lt('trial_ends_at', new Date().toISOString());

    if (fetchError) {
      console.error('[check-trial-expirations] Erro ao buscar trials:', fetchError);
      throw fetchError;
    }

    if (!expiredTrials || expiredTrials.length === 0) {
      console.log('[check-trial-expirations] Nenhum trial expirado encontrado.');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhum trial expirado encontrado',
          processed: 0 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[check-trial-expirations] Encontrados ${expiredTrials.length} trials expirados`);

    let processedCount = 0;
    let errorCount = 0;

    // Processar cada trial expirado
    for (const trial of expiredTrials) {
      try {
        console.log(`[check-trial-expirations] Processando trial do usuário ${trial.user_id} (plano: ${trial.plan})`);

        // 1. Atualizar status da subscription para 'expired'
        const { error: subError } = await supabase
          .from('subscriptions')
          .update({ 
            status: 'expired',
            end_date: new Date().toISOString()
          })
          .eq('user_id', trial.user_id);

        if (subError) {
          console.error(`[check-trial-expirations] Erro ao atualizar subscription: ${trial.user_id}`, subError);
          errorCount++;
          continue;
        }

        // 2. Reverter profile para plano 'free'
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ plan: 'free' })
          .eq('id', trial.user_id);

        if (profileError) {
          console.error(`[check-trial-expirations] Erro ao atualizar profile: ${trial.user_id}`, profileError);
          errorCount++;
          continue;
        }

        // 3. Criar notificação para o usuário
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            recipient_id: trial.user_id,
            actor_id: trial.user_id,
            type: 'trial_expired',
            metadata: { 
              previous_plan: trial.plan,
              expired_at: new Date().toISOString(),
              message: `Seu período de teste do plano ${trial.plan.toUpperCase()} expirou. Para continuar aproveitando os recursos premium, assine um plano.`
            }
          });

        if (notifError) {
          console.error(`[check-trial-expirations] Erro ao criar notificação: ${trial.user_id}`, notifError);
          // Não incrementar errorCount aqui, pois o principal foi feito
        }

        console.log(`[check-trial-expirations] Trial expirado processado com sucesso: ${trial.user_id}`);
        processedCount++;

      } catch (error) {
        console.error(`[check-trial-expirations] Erro ao processar trial ${trial.user_id}:`, error);
        errorCount++;
      }
    }

    const response = {
      success: true,
      message: `Verificação concluída`,
      processed: processedCount,
      errors: errorCount,
      total: expiredTrials.length,
      details: expiredTrials.map(t => ({
        user_id: t.user_id,
        plan: t.plan,
        expired_at: t.trial_ends_at
      }))
    };

    console.log('[check-trial-expirations] Resultado:', response);

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('[check-trial-expirations] Erro fatal:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});


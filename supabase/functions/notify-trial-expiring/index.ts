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
    console.log('[notify-trial-expiring] Verificando trials próximos de expirar...');

    // Calcular data de 3 dias a partir de agora
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const fourDaysFromNow = new Date();
    fourDaysFromNow.setDate(fourDaysFromNow.getDate() + 4);

    // Buscar trials que expiram nos próximos 3 dias (janela de 24h para evitar duplicatas)
    const { data: expiringTrials, error: fetchError } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan, trial_ends_at, status')
      .eq('status', 'trialing')
      .gte('trial_ends_at', threeDaysFromNow.toISOString())
      .lt('trial_ends_at', fourDaysFromNow.toISOString());

    if (fetchError) {
      console.error('[notify-trial-expiring] Erro ao buscar trials:', fetchError);
      throw fetchError;
    }

    if (!expiringTrials || expiringTrials.length === 0) {
      console.log('[notify-trial-expiring] Nenhum trial expirando nos próximos 3 dias.');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhum trial expirando encontrado',
          notified: 0 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[notify-trial-expiring] Encontrados ${expiringTrials.length} trials expirando em breve`);

    let notifiedCount = 0;
    let errorCount = 0;

    // Processar cada trial
    for (const trial of expiringTrials) {
      try {
        // Verificar se já enviamos notificação para este trial
        const { data: existingNotif } = await supabase
          .from('notifications')
          .select('id')
          .eq('recipient_id', trial.user_id)
          .eq('type', 'trial_expiring')
          .eq('metadata->>trial_id', trial.id)
          .single();

        if (existingNotif) {
          console.log(`[notify-trial-expiring] Notificação já enviada para ${trial.user_id}`);
          continue;
        }

        // Calcular dias restantes
        const daysRemaining = Math.ceil(
          (new Date(trial.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        // Criar notificação
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            recipient_id: trial.user_id,
            actor_id: trial.user_id,
            type: 'trial_expiring',
            metadata: { 
              trial_id: trial.id,
              plan: trial.plan,
              days_remaining: daysRemaining,
              expires_at: trial.trial_ends_at,
              message: `Seu período de teste do plano ${trial.plan.toUpperCase()} expira em ${daysRemaining} dia${daysRemaining > 1 ? 's' : ''}! Assine agora para continuar aproveitando todos os recursos premium.`
            }
          });

        if (notifError) {
          console.error(`[notify-trial-expiring] Erro ao criar notificação: ${trial.user_id}`, notifError);
          errorCount++;
          continue;
        }

        console.log(`[notify-trial-expiring] Notificação enviada para ${trial.user_id} (${daysRemaining} dias restantes)`);
        notifiedCount++;

      } catch (error) {
        console.error(`[notify-trial-expiring] Erro ao processar trial ${trial.user_id}:`, error);
        errorCount++;
      }
    }

    const response = {
      success: true,
      message: `Notificações enviadas`,
      notified: notifiedCount,
      errors: errorCount,
      total: expiringTrials.length,
      details: expiringTrials.map(t => ({
        user_id: t.user_id,
        plan: t.plan,
        expires_at: t.trial_ends_at,
        days_remaining: Math.ceil(
          (new Date(t.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
      }))
    };

    console.log('[notify-trial-expiring] Resultado:', response);

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('[notify-trial-expiring] Erro fatal:', error);
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


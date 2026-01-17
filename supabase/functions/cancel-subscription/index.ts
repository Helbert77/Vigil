// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, reason, details } = await req.json();

    if (!userId) {
      throw new Error('Missing userId');
    }

    console.log(`[cancel-subscription] Processing cancellation for user: ${userId}`);

    // 1. Buscar subscription ativa do usuário
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (subError || !subscription) {
      console.error('[cancel-subscription] Subscription not found:', subError);
      throw new Error('Subscription not found');
    }

    console.log(`[cancel-subscription] Found subscription:`, {
      plan: subscription.plan,
      status: subscription.status,
      stripe_subscription_id: subscription.stripe_subscription_id
    });

    // 2. Verificar se tem stripe_subscription_id
    if (!subscription.stripe_subscription_id) {
      console.error('[cancel-subscription] No Stripe subscription ID found');
      throw new Error('No Stripe subscription found');
    }

    // 3. Buscar dados do usuário para notificações
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, first_name, last_name')
      .eq('id', userId)
      .single();

    const userName = profile?.first_name || profile?.username || 'Usuário';

    // 4. ✅ CANCELAR NO STRIPE (no fim do período)
    console.log(`[cancel-subscription] Canceling Stripe subscription: ${subscription.stripe_subscription_id}`);
    
    const stripeResponse = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: true,
        metadata: {
          canceled_by_user: 'true',
          canceled_at: new Date().toISOString(),
          cancellation_reason: reason || 'not_specified',
          cancellation_details: details || '',
        }
      }
    );

    console.log(`[cancel-subscription] Stripe subscription updated successfully`);

    // 5. Atualizar banco de dados local
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        cancellation_reason: reason,
        cancellation_details: details,
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('[cancel-subscription] Error updating subscription:', updateError);
    }

    // 6. Registrar evento de analytics
    await supabase.from('conversion_events').insert({
      user_id: userId,
      event_type: 'canceled_trial',
      event_data: {
        plan: subscription.plan,
        status: subscription.status,
        canceled_at: new Date().toISOString(),
        active_until: subscription.current_period_end,
        reason: reason,
        details: details,
        stripe_subscription_id: subscription.stripe_subscription_id,
      }
    });

    console.log(`[cancel-subscription] Analytics event recorded`);

    // 7. Enviar notificação no app
    const periodEndDate = new Date(subscription.current_period_end);
    const formattedDate = periodEndDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const notificationMessage = `Sua assinatura ${subscription.plan.toUpperCase()} foi cancelada e permanecerá ativa até ${formattedDate}. Após essa data, seu plano será alterado para FREE. Você pode reativar sua assinatura a qualquer momento antes dessa data.`;

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cancel-subscription/index.ts:129',message:'BEFORE notification insert',data:{userId,notificationData:{recipient_id:userId,actor_id:userId,type:'subscription_canceled',metadata:{plan:subscription.plan,active_until:subscription.current_period_end,active_until_formatted:formattedDate,can_reactivate:true,message:notificationMessage,title:'Assinatura Cancelada'}}},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    const { error: notifError, data: notifData } = await supabase.from('notifications').insert({
      recipient_id: userId,
      actor_id: userId,
      type: 'subscription_canceled',
      metadata: {
        plan: subscription.plan,
        active_until: subscription.current_period_end,
        active_until_formatted: formattedDate,
        can_reactivate: true,
        message: notificationMessage,
        title: 'Assinatura Cancelada',
      }
    }).select();

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cancel-subscription/index.ts:147',message:'AFTER notification insert',data:{notifError:notifError?JSON.stringify(notifError):null,notifData:notifData?JSON.stringify(notifData):null,success:!notifError},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    if (notifError) {
      console.error('[cancel-subscription] Error inserting notification:', notifError);
    } else {
      console.log(`[cancel-subscription] App notification sent`);
    }

    // 8. Enviar email de confirmação (assíncrono, não aguardar resposta)
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cancel-subscription/index.ts:150',message:'BEFORE fetching user email',data:{userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cancel-subscription/index.ts:162',message:'AFTER getUserById call',data:{authError:authError?JSON.stringify(authError):null,authUserExists:!!authUser,userExists:!!authUser?.user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    if (authError) {
      console.error('[cancel-subscription] Error fetching user from auth:', authError);
    }

    const userEmail = authUser?.user?.email;

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cancel-subscription/index.ts:172',message:'AFTER extracting email',data:{userEmail:userEmail||null,hasEmail:!!userEmail,emailLength:userEmail?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    // ✅ SEMPRE tentar enviar email, mesmo se userEmail for null/undefined
    // A função send-cancellation-email tem fallback para buscar do auth.users
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cancel-subscription/index.ts:178',message:'BEFORE invoking send-cancellation-email',data:{userEmail:userEmail||null,invokeParams:{userId,userName,userEmail:userEmail||null,plan:subscription.plan,activeUntil:subscription.current_period_end,reason}},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion

    // Disparar email de forma assíncrona (não aguardar)
    // Passar userEmail mesmo se for null/undefined - a função de email tem fallback
    supabase.functions.invoke('send-cancellation-email', {
      body: {
        userId,
        userName,
        userEmail: userEmail || null, // Pode ser null, a função vai buscar do auth.users
        plan: subscription.plan,
        activeUntil: subscription.current_period_end,
        reason: reason,
      }
    }).then(({ error: emailError, data: emailData }) => {
      // #region agent log
      const emailSuccess = !emailError && emailData?.success !== false;
      fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cancel-subscription/index.ts:193',message:'AFTER send-cancellation-email invocation',data:{emailError:emailError?JSON.stringify(emailError):null,emailData:emailData?JSON.stringify(emailData):null,emailDataSuccess:emailData?.success,success:emailSuccess},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
      // #endregion

      if (emailError || emailData?.success === false) {
        const errorMsg = emailError ? JSON.stringify(emailError) : emailData?.error || 'Unknown error';
        console.error('[cancel-subscription] Error sending email:', errorMsg);
      } else {
        const sentToEmail = emailData?.email || userEmail || 'user';
        console.log(`[cancel-subscription] Cancellation email sent successfully to ${sentToEmail}`);
      }
    }).catch((err) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cancel-subscription/index.ts:205',message:'send-cancellation-email invocation CATCH',data:{error:err.toString(),errorMessage:err.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
      // #endregion

      console.error('[cancel-subscription] Email invocation failed:', err);
    });
    
    if (userEmail) {
      console.log(`[cancel-subscription] Email dispatch initiated for ${userEmail}`);
    } else {
      console.log(`[cancel-subscription] Email dispatch initiated (will fetch email from auth.users for userId: ${userId})`);
    }

    console.log(`[cancel-subscription] Cancellation completed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Assinatura cancelada com sucesso',
        plan: subscription.plan,
        activeUntil: subscription.current_period_end,
        activeUntilFormatted: formattedDate,
        canReactivate: true,
        stripeSubscriptionId: stripeResponse.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('[cancel-subscription] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message, 
        details: error.toString() 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // 200 para que o cliente possa ler o erro
      }
    );
  }
});


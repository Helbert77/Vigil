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

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

// Função para calcular bônus de créditos
function calculateBonus(amount: number): number {
  if (amount >= 500) return amount * 0.20; // 20%
  if (amount >= 250) return amount * 0.15; // 15%
  if (amount >= 100) return amount * 0.10; // 10%
  if (amount >= 50) return amount * 0.05;  // 5%
  return 0;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validar método
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Obter body da requisição
    const body = await req.text();
    
    // Verificar assinatura e construir evento
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(JSON.stringify({ error: 'Invalid signature', details: err.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing Stripe event:', event.type);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stripe-webhook/index.ts:69',message:'WEBHOOK EVENT RECEIVED',data:{eventType:event.type,eventId:event.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    // Processar eventos do Stripe
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const subscriptionId = session.subscription as string;
        const paymentIntentId = session.payment_intent as string;

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stripe-webhook/index.ts:78',message:'CHECKOUT SESSION COMPLETED',data:{userId,subscriptionId,paymentIntentId,hasMetadata:!!session.metadata,metadata:session.metadata},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion

        // Verificar se é pagamento de anúncio
        // Verificar metadata com diferentes formatos de chave
        const rawAdId = session.metadata?.ad_id || session.metadata?.adId;
        const paymentType = session.metadata?.payment_type;
        
        if (rawAdId || paymentType) {
          // Garantir que adId seja tratado corretamente (null, undefined ou string vazia = undefined)
          const adId = rawAdId && String(rawAdId).trim() !== '' 
            ? String(rawAdId).trim()
            : undefined;
          const userIdFromMeta = session.metadata?.user_id;

          if (paymentType === 'package' && adId) {
            // Pagamento de pacote de anúncio
            const packageType = session.metadata.package_type;
            const durationDays = parseInt(session.metadata.duration_days || '7');
            const maxImpressions = parseInt(session.metadata.max_impressions || '0');

            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + durationDays);

            const amountTotal = (session.amount_total || 0) / 100; // Converter de centavos para euros

            await supabase.from('anuncios').update({
              payment_status: 'paid',
              stripe_payment_intent_id: paymentIntentId,
              approval_status: 'pending_approval',
              status: 'paused', // Manter pausado até aprovação
              start_date: startDate.toISOString(),
              end_date: endDate.toISOString(),
              max_impressions: maxImpressions,
              budget: amountTotal,
              spent: 0,
            }).eq('id', adId);

            console.log(`Ad package payment completed: ${adId}, package: ${packageType}`);

            // Enviar notificações para moderadores/admins sobre novo anúncio pendente
            try {
              const { data: moderators, error: moderatorsError } = await supabase
                .from('profiles')
                .select('id')
                .in('role', ['admin', 'moderator']);

              if (moderatorsError) {
                console.error('Error fetching moderators:', moderatorsError);
              } else if (moderators && moderators.length > 0) {
                const notifications = moderators.map((mod: { id: string }) => ({
                  recipient_id: mod.id,
                  actor_id: userIdFromMeta || null,
                  type: 'ad_approval_pending',
                  metadata: { ad_id: adId }
                }));

                const { error: notificationError } = await supabase
                  .from('notifications')
                  .insert(notifications);

                if (notificationError) {
                  console.error('Error sending notifications:', notificationError);
                }
              }
            } catch (error) {
              console.error('Error in notification process:', error);
            }

          } else if (paymentType === 'credits' && adId) {
            // Compra de créditos COM anúncio associado
            const creditAmount = parseFloat(session.metadata.credit_amount || '0');
            const bonus = calculateBonus(creditAmount);
            const totalCredits = creditAmount + bonus;

            // Inserir/atualizar créditos do usuário
            const { data: existingCredits } = await supabase
              .from('user_ad_credits')
              .select('id, balance, total_purchased')
              .eq('user_id', userIdFromMeta)
              .single();

            if (existingCredits) {
              await supabase.from('user_ad_credits').update({
                balance: existingCredits.balance + totalCredits,
                total_purchased: existingCredits.total_purchased + creditAmount,
              }).eq('user_id', userIdFromMeta);
            } else {
              await supabase.from('user_ad_credits').insert({
                user_id: userIdFromMeta,
                balance: totalCredits,
                total_purchased: creditAmount,
              });
            }

            // Registrar transação
            await supabase.from('ad_credit_transactions').insert({
              user_id: userIdFromMeta,
              amount: creditAmount,
              transaction_type: 'purchase',
              stripe_payment_intent_id: paymentIntentId,
              description: `Compra de €${creditAmount} em créditos (+ €${bonus.toFixed(2)} bônus)`,
            });

            // Atualizar anúncio para aprovação (IGUAL AOS OUTROS PLANOS)
            const { error: updateError } = await supabase.from('anuncios').update({
              payment_status: 'paid',
              stripe_payment_intent_id: paymentIntentId,
              approval_status: 'pending_approval',
              status: 'paused', // Manter pausado até aprovação
              budget: creditAmount,
              spent: 0,
              payment_type: 'credits',
            }).eq('id', adId);

            if (updateError) {
              console.error('Error updating ad with credits:', updateError);
            }

            // Enviar notificações para moderadores/admins sobre novo anúncio pendente
            try {
              const { data: moderators, error: moderatorsError } = await supabase
                .from('profiles')
                .select('id')
                .in('role', ['admin', 'moderator']);

              if (moderatorsError) {
                console.error('Error fetching moderators:', moderatorsError);
              } else if (moderators && moderators.length > 0) {
                const notifications = moderators.map((mod: { id: string }) => ({
                  recipient_id: mod.id,
                  actor_id: userIdFromMeta || null,
                  type: 'ad_approval_pending',
                  metadata: { ad_id: adId }
                }));

                const { error: notificationError } = await supabase
                  .from('notifications')
                  .insert(notifications);

                if (notificationError) {
                  console.error('Error sending notifications:', notificationError);
                }
              }
            } catch (error) {
              console.error('Error in notification process:', error);
            }

          } else if (paymentType === 'credits' && !adId) {
            // Compra de créditos SEM anúncio associado (apenas recarga)
            const creditAmount = parseFloat(session.metadata.credit_amount || '0');
            const bonus = calculateBonus(creditAmount);
            const totalCredits = creditAmount + bonus;

            // Inserir/atualizar créditos do usuário
            const { data: existingCredits } = await supabase
              .from('user_ad_credits')
              .select('id, balance, total_purchased')
              .eq('user_id', userIdFromMeta)
              .single();

            if (existingCredits) {
              await supabase.from('user_ad_credits').update({
                balance: existingCredits.balance + totalCredits,
                total_purchased: existingCredits.total_purchased + creditAmount,
              }).eq('user_id', userIdFromMeta);
            } else {
              await supabase.from('user_ad_credits').insert({
                user_id: userIdFromMeta,
                balance: totalCredits,
                total_purchased: creditAmount,
              });
            }

            // Registrar transação
            await supabase.from('ad_credit_transactions').insert({
              user_id: userIdFromMeta,
              amount: creditAmount,
              transaction_type: 'purchase',
              stripe_payment_intent_id: paymentIntentId,
              description: `Compra de €${creditAmount} em créditos (+ €${bonus.toFixed(2)} bônus)`,
            });

            console.log(`Credits purchased (no ad): €${creditAmount} + €${bonus.toFixed(2)} bonus for user ${userIdFromMeta}`);

          } else if (paymentType === 'cpm' && adId) {
            // Pagamento de anúncio CPM
            const cpmBudget = parseFloat(session.metadata.cpm_budget || '0');

            await supabase.from('anuncios').update({
              payment_status: 'paid',
              stripe_payment_intent_id: paymentIntentId,
              approval_status: 'pending_approval',
              status: 'paused', // Manter pausado até aprovação
              budget: cpmBudget,
              spent: 0,
            }).eq('id', adId);

            console.log(`Ad CPM payment completed: ${adId}, budget: €${cpmBudget}`);

            // Enviar notificações para moderadores/admins sobre novo anúncio pendente
            try {
              const { data: moderators, error: moderatorsError } = await supabase
                .from('profiles')
                .select('id')
                .in('role', ['admin', 'moderator']);

              if (moderatorsError) {
                console.error('Error fetching moderators:', moderatorsError);
              } else if (moderators && moderators.length > 0) {
                const notifications = moderators.map((mod: { id: string }) => ({
                  recipient_id: mod.id,
                  actor_id: userIdFromMeta || null,
                  type: 'ad_approval_pending',
                  metadata: { ad_id: adId }
                }));

                const { error: notificationError } = await supabase
                  .from('notifications')
                  .insert(notifications);

                if (notificationError) {
                  console.error('Error sending notifications:', notificationError);
                }
              }
            } catch (error) {
              console.error('Error in notification process:', error);
            }
          }
        }

        if (userId && subscriptionId) {
          try {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stripe-webhook/index.ts:308',message:'SUBSCRIPTION PROCESSING START',data:{userId,subscriptionId,sessionMetadata:session.metadata},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion

            console.log(`[webhook] Processing subscription for user: ${userId}, subscription: ${subscriptionId}`);
            
            // Pagamento de assinatura (código existente)
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            console.log(`[webhook] Subscription retrieved:`, JSON.stringify({
              id: subscription.id,
              status: subscription.status,
              trial_end: subscription.trial_end,
              current_period_start: subscription.current_period_start,
              current_period_end: subscription.current_period_end
            }));

            // Determinar status e trial_ends_at
            const status = subscription.status; // 'trialing', 'active', etc
            const trialEnd = subscription.trial_end 
              ? new Date(subscription.trial_end * 1000).toISOString() 
              : null;

            console.log(`[webhook] Upserting subscription to database...`);
            const { error: subError } = await supabase.from('subscriptions').upsert({
              user_id: userId,
              plan: session.metadata?.plan || 'basic',
              status: status,
              billing_cycle: session.metadata?.billingCycle || 'monthly',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscriptionId,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              trial_ends_at: trialEnd,
            }, { onConflict: 'user_id' });

            if (subError) {
              console.error(`[webhook] Error upserting subscription:`, subError);
              throw subError;
            }

            console.log(`[webhook] Updating profile plan...`);
            const { error: profileError } = await supabase.from('profiles').update({
              plan: session.metadata?.plan || 'basic',
            }).eq('id', userId);

            if (profileError) {
              console.error(`[webhook] Error updating profile:`, profileError);
              throw profileError;
            }

            console.log(`[webhook] SUCCESS: Subscription created/updated: ${subscriptionId}, status: ${status}, trial_ends_at: ${trialEnd}`);

            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stripe-webhook/index.ts:357',message:'BEFORE notification/email logic',data:{userId,plan:session.metadata?.plan,status,trialEnd,shouldSendNotification:true,shouldSendEmail:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion

            // ✅ CORREÇÃO: Enviar notificação e email ao usuário
            const plan = session.metadata?.plan || 'basic';
            const periodEnd = new Date(subscription.current_period_end * 1000);
            const formattedDate = periodEnd.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            });

            // Determinar tipo de email baseado no status
            const emailType = status === 'trialing' ? 'trial' : 'new';
            const trialDays = trialEnd ? Math.ceil((new Date(trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

            // 1. Enviar notificação no app
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stripe-webhook/index.ts:373',message:'BEFORE inserting notification',data:{userId,plan,status,emailType,trialDays},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion

            const notificationMessage = status === 'trialing' 
              ? `Seu período de teste de ${trialDays} dias do plano ${plan.toUpperCase()} foi ativado! Aproveite todos os recursos até ${formattedDate}.`
              : `Sua assinatura do plano ${plan.toUpperCase()} foi ativada com sucesso! Próxima cobrança em ${formattedDate}.`;

            const { error: notifError } = await supabase.from('notifications').insert({
              recipient_id: userId,
              actor_id: userId,
              type: status === 'trialing' ? 'subscription_trial_started' : 'subscription_activated',
              metadata: {
                plan: plan,
                status: status,
                next_billing_date: subscription.current_period_end,
                next_billing_date_formatted: formattedDate,
                trial_days: trialDays > 0 ? trialDays : undefined,
                message: notificationMessage,
                title: status === 'trialing' ? 'Período de Teste Ativado' : 'Assinatura Ativada',
              }
            });

            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stripe-webhook/index.ts:397',message:'AFTER inserting notification',data:{notifError:notifError?JSON.stringify(notifError):null,success:!notifError},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion

            if (notifError) {
              console.error(`[webhook] Error inserting notification:`, notifError);
            } else {
              console.log(`[webhook] Notification sent to user ${userId}`);
            }

            // 2. Buscar dados do usuário para o email
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stripe-webhook/index.ts:410',message:'BEFORE fetching user profile',data:{userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion

            const { data: profile } = await supabase
              .from('profiles')
              .select('username, first_name, last_name')
              .eq('id', userId)
              .single();

            const userName = profile?.first_name || profile?.username || 'Usuário';

            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stripe-webhook/index.ts:424',message:'AFTER fetching user profile',data:{userName,hasProfile:!!profile},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion

            // 3. Buscar email do usuário
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stripe-webhook/index.ts:430',message:'BEFORE fetching user email',data:{userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion

            const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);

            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stripe-webhook/index.ts:437',message:'AFTER fetching user email',data:{authError:authError?JSON.stringify(authError):null,hasAuthUser:!!authUser,userEmail:authUser?.user?.email||null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion

            if (authError) {
              console.error(`[webhook] Error fetching user email:`, authError);
            }

            const userEmail = authUser?.user?.email;

            // 4. Enviar email (assíncrono, não aguardar)
            if (userEmail) {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stripe-webhook/index.ts:451',message:'BEFORE invoking send-subscription-email',data:{userId,userName,userEmail,plan,emailType,trialDays,currentPeriodEnd:subscription.current_period_end},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
              // #endregion

              // Validar e formatar nextBillingDate
              const nextBillingDate = subscription.current_period_end 
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // Fallback: 30 dias no futuro

              supabase.functions.invoke('send-subscription-email', {
                body: {
                  userId,
                  userName,
                  userEmail,
                  plan,
                  type: emailType,
                  trialDays: trialDays > 0 ? trialDays : undefined,
                  nextBillingDate: nextBillingDate,
                }
              }).then(({ error: emailError, data: emailData }) => {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stripe-webhook/index.ts:468',message:'AFTER send-subscription-email invocation',data:{emailError:emailError?JSON.stringify(emailError):null,emailData:emailData?JSON.stringify(emailData):null,success:!emailError&&emailData?.success!==false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion

                if (emailError || emailData?.success === false) {
                  console.error(`[webhook] Error sending subscription email:`, emailError || emailData?.error);
                } else {
                  console.log(`[webhook] Subscription email sent successfully to ${userEmail}`);
                }
              }).catch((err) => {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stripe-webhook/index.ts:480',message:'send-subscription-email invocation CATCH',data:{error:err.toString()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion

                console.error(`[webhook] Email invocation failed:`, err);
              });

              console.log(`[webhook] Email dispatch initiated for ${userEmail}`);
            } else {
              console.log(`[webhook] No email found for user ${userId}, skipping email`);
            }

          } catch (error) {
            console.error(`[webhook] FATAL ERROR processing subscription:`, error);
            throw error; // Re-throw para retornar 500
          }
        } else {
          console.log(`[webhook] Skipping subscription processing: userId=${userId}, subscriptionId=${subscriptionId}`);
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Buscar usuário pelo customer_id
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (subscriptionData) {
          await supabase.from('subscriptions').update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          }).eq('stripe_subscription_id', subscription.id);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Buscar usuário pelo customer_id
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (subscriptionData) {
          await supabase.from('subscriptions').update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          }).eq('stripe_subscription_id', subscription.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Atualizar status da subscription
        await supabase.from('subscriptions').update({
          status: 'canceled',
        }).eq('stripe_subscription_id', subscription.id);

        // Buscar usuário e reverter para plano free
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (subscriptionData) {
          await supabase.from('profiles').update({
            plan: 'free',
          }).eq('id', subscriptionData.user_id);
        }
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;

        // Aqui você pode implementar lógica para notificar o usuário
        // que o trial está acabando (ex: enviar email)
        console.log(`Trial will end for subscription: ${subscription.id}`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const paymentIntentId = paymentIntent.id;

        // Verificar se é pagamento de anúncio
        const { data: ad } = await supabase
          .from('anuncios')
          .select('id')
          .eq('stripe_payment_intent_id', paymentIntentId)
          .single();

        if (ad) {
          await supabase.from('anuncios').update({
            payment_status: 'failed',
          }).eq('id', ad.id);

          console.log(`Ad payment failed: ${ad.id}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          await supabase.from('subscriptions').update({
            status: 'past_due',
          }).eq('stripe_subscription_id', subscriptionId);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          await supabase.from('subscriptions').update({
            status: 'active',
          }).eq('stripe_subscription_id', subscriptionId);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({
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

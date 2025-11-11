import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.11.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

serve(async (req) => {
  try {
    // Validar método
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing signature' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Processar eventos do Stripe
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const subscriptionId = session.subscription as string;

        if (userId && subscriptionId) {
          // Buscar detalhes da subscription
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          // Atualizar subscription no Supabase
          await supabase.from('subscriptions').upsert({
            user_id: userId,
            plan: session.metadata?.plan || 'basic',
            status: 'active',
            billing_cycle: session.metadata?.billingCycle || 'monthly',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscriptionId,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          }, { onConflict: 'user_id' });

          // Atualizar plano do usuário
          await supabase.from('profiles').update({
            plan: session.metadata?.plan || 'basic',
          }).eq('id', userId);
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
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});


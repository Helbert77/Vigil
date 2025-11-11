import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.11.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

serve(async (req) => {
  try {
    // Validar método
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { userId, plan, billingCycle, successUrl, cancelUrl } = await req.json();

    // Validar parâmetros
    if (!userId || !plan || !billingCycle || !successUrl || !cancelUrl) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validar plano
    if (!['basic', 'pro', 'premium'].includes(plan)) {
      return new Response(JSON.stringify({ error: 'Invalid plan' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validar ciclo de cobrança
    if (!['monthly', 'annually'].includes(billingCycle)) {
      return new Response(JSON.stringify({ error: 'Invalid billing cycle' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // NOTA: Esta é uma implementação placeholder
    // Para produção, você precisará:
    // 1. Criar produtos e preços no Stripe Dashboard
    // 2. Mapear os IDs dos preços aqui
    // 3. Implementar lógica de customer existente
    // 4. Adicionar metadata para rastreamento

    const priceIds: Record<string, Record<string, string>> = {
      basic: {
        monthly: 'price_basic_monthly_id', // Substituir com ID real do Stripe
        annually: 'price_basic_annually_id',
      },
      pro: {
        monthly: 'price_pro_monthly_id',
        annually: 'price_pro_annually_id',
      },
      premium: {
        monthly: 'price_premium_monthly_id',
        annually: 'price_premium_annually_id',
      },
    };

    const priceId = priceIds[plan][billingCycle];

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: {
        userId,
        plan,
        billingCycle,
      },
    });

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
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


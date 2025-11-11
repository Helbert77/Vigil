import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.11.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[create-checkout-session] Request received');
    console.log('[create-checkout-session] Method:', req.method);
    
    // Validar método
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    console.log('[create-checkout-session] Body received:', JSON.stringify(body));
    
    const { userId, plan, billingCycle, successUrl, cancelUrl } = body;

    // Validar parâmetros
    if (!userId || !plan || !billingCycle || !successUrl || !cancelUrl) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validar plano
    if (!['basic', 'pro', 'premium'].includes(plan)) {
      return new Response(JSON.stringify({ error: 'Invalid plan' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validar ciclo de cobrança
    if (!['monthly', 'annually'].includes(billingCycle)) {
      return new Response(JSON.stringify({ error: 'Invalid billing cycle' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // NOTA: Esta é uma implementação placeholder
    // Para produção, você precisará:
    // 1. Criar produtos e preços no Stripe Dashboard
    // 2. Mapear os IDs dos preços aqui
    // 3. Implementar lógica de customer existente
    // 4. Adicionar metadata para rastreamento

    // Verificar se a promoção está ativa
    const promotionActive = new Date() < new Date('2026-02-11');
    
    // IDs de preços do Stripe
    const priceIds = promotionActive ? {
      // Preços promocionais (20% OFF)
      basic: {
        monthly: 'price_1SSJDMIcSthxxcjg57Ee5FFF',   // $3.19/mês (promo)
        annually: 'price_1SSJDMIcSthxxcjgBnhP1HNC',  // $38.30/ano (promo)
      },
      pro: {
        monthly: 'price_1SSJHtIcSthxxcjgrLWOhTIH',   // $7.19/mês (promo)
        annually: 'price_1SSJHtIcSthxxcjgTN8hVZGN',  // $86.30/ano (promo)
      },
      premium: {
        monthly: 'price_1SSJKeIcSthxxcjgzDHV7CbT',   // $15.99/mês (promo)
        annually: 'price_1SSJKeIcSthxxcjgIS0LaNrs',  // $191.90/ano (promo)
      },
    } : {
      // Preços padrão
      basic: {
        monthly: 'price_1SSJDMIcSthxxcjgPoQbQfwg',   // $3.99/mês
        annually: 'price_1SSJDMIcSthxxcjgWjhdNVNN',  // $47.88/ano
      },
      pro: {
        monthly: 'price_1SSJHtIcSthxxcjg9nW91dHw',   // $8.99/mês
        annually: 'price_1SSJHtIcSthxxcjg7ExDnb6A',  // $107.88/ano
      },
      premium: {
        monthly: 'price_1SSJKeIcSthxxcjgjDtvT99x',   // $19.99/mês
        annually: 'price_1SSJKeIcSthxxcjg0adwDz3v',  // $239.88/ano
      },
    };

    const priceId = priceIds[plan][billingCycle];
    console.log('[create-checkout-session] Using priceId:', priceId);
    console.log('[create-checkout-session] Stripe key configured:', !!Deno.env.get('STRIPE_SECRET_KEY'));

    // Criar sessão de checkout
    console.log('[create-checkout-session] Creating Stripe session...');
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

    console.log('[create-checkout-session] Session created successfully:', session.id);

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[create-checkout-session] ERROR:', error);
    console.error('[create-checkout-session] Error type:', error.constructor.name);
    console.error('[create-checkout-session] Error message:', error.message);
    console.error('[create-checkout-session] Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        details: error.toString(),
        type: error.constructor.name,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});


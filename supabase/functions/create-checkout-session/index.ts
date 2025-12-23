import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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
    
    const { userId, plan, billingCycle, successUrl, cancelUrl, trialDays = 0 } = body;

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

    // IDs de preços do Stripe (MODO TEST)
    const priceIds = {
      basic: {
        monthly: 'price_1SSNWuEm3YwS3vjoPN2gZz3J',   // $3.99/mês
        annually: 'price_1SSNWuEm3YwS3vjoBVZ9p08K',  // $47.88/ano
      },
      pro: {
        monthly: 'price_1SSNd3Em3YwS3vjoOHhpgdJD',   // $8.99/mês
        annually: 'price_1SSNd3Em3YwS3vjo1P8tPy0d',  // $107.88/ano
      },
      premium: {
        monthly: 'price_1SSNgkEm3YwS3vjo0sKZLrb5',   // $19.99/mês
        annually: 'price_1SSNgkEm3YwS3vjoux4B6EGa',  // $239.88/ano
      },
    };

    const priceId = priceIds[plan][billingCycle];
    console.log('[create-checkout-session] Using priceId:', priceId);
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    console.log('[create-checkout-session] Stripe key configured:', !!stripeKey);

    // Criar sessão de checkout usando API REST diretamente
    console.log('[create-checkout-session] Creating Stripe session via REST API...');
    
    // Construir form data para a API do Stripe
    const formData = new URLSearchParams();
    formData.append('mode', 'subscription');
    formData.append('payment_method_types[0]', 'card');
    formData.append('line_items[0][price]', priceId);
    formData.append('line_items[0][quantity]', '1');
    formData.append('success_url', successUrl);
    formData.append('cancel_url', cancelUrl);
    formData.append('client_reference_id', userId);
    formData.append('metadata[userId]', userId);
    formData.append('metadata[plan]', plan);
    formData.append('metadata[billingCycle]', billingCycle);
    
    // Adicionar trial se especificado
    if (trialDays > 0) {
      formData.append('subscription_data[trial_period_days]', trialDays.toString());
      formData.append('metadata[trialDays]', trialDays.toString());
      
      // CRÍTICO: Configurar para NÃO cobrar durante o trial
      // payment_behavior = 'default_incomplete' garante que não haverá cobrança até o fim do trial
      formData.append('subscription_data[trial_settings][end_behavior][missing_payment_method]', 'cancel');
      
      // Permite que o Stripe processe o pagamento após o trial
      formData.append('payment_method_collection', 'always');
      
      console.log(`[create-checkout-session] Trial configured: ${trialDays} days (no immediate charge)`);
    }
    
    console.log('[create-checkout-session] Form data prepared');
    
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    
    if (!stripeResponse.ok) {
      const errorText = await stripeResponse.text();
      console.error('[create-checkout-session] Stripe API error:', errorText);
      throw new Error(`Stripe API error: ${errorText}`);
    }
    
    const session = await stripeResponse.json();
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


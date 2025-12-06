import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { 
      userId, 
      adId, 
      paymentType, // 'package' | 'credits' | 'cpm'
      packageType, // 'bronze' | 'silver' | 'gold' | 'platinum'
      creditAmount, // Para compra de créditos
      cpmBudget, // Para anúncios CPM
      successUrl,
      cancelUrl,
    } = body;

    // Validações
    if (!userId || !successUrl || !cancelUrl) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!paymentType || !['package', 'credits', 'cpm'].includes(paymentType)) {
      return new Response(JSON.stringify({ error: 'Invalid payment type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Se for package ou cpm, precisa do adId
    if ((paymentType === 'package' || paymentType === 'cpm') && !adId) {
      return new Response(JSON.stringify({ error: 'adId is required for package/cpm payment' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Para créditos, se adId foi fornecido, validar que existe
    if (paymentType === 'credits' && adId) {
      const { data: ad, error: adError } = await supabase
        .from('anuncios')
        .select('id, advertiser_id')
        .eq('id', adId)
        .single();

      if (adError || !ad) {
        return new Response(JSON.stringify({ error: 'Ad not found for credits payment' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (ad.advertiser_id !== userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Validar anúncio para package e cpm (créditos valida depois)
    if ((paymentType === 'package' || paymentType === 'cpm') && adId) {
      const { data: ad, error: adError } = await supabase
        .from('anuncios')
        .select('id, advertiser_id, title, description')
        .eq('id', adId)
        .single();

      if (adError || !ad) {
        return new Response(JSON.stringify({ error: 'Ad not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (ad.advertiser_id !== userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    let priceId: string;
    let amount: number;
    let description: string;
    let metadata: Record<string, string> = {
      user_id: userId,
      payment_type: paymentType,
    };

    if (paymentType === 'package') {
      // Buscar pacote no banco
      const { data: packageData, error: packageError } = await supabase
        .from('ad_packages')
        .select('stripe_price_id, price_eur, display_name, duration_days, max_impressions')
        .eq('name', packageType)
        .eq('is_active', true)
        .single();

      if (packageError || !packageData || !packageData.stripe_price_id) {
        return new Response(JSON.stringify({ error: 'Package not found or not configured' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      priceId = packageData.stripe_price_id;
      amount = Math.round(packageData.price_eur * 100);
      description = `Vigil Ads - Pacote ${packageData.display_name}`;
      metadata = {
        ...metadata,
        ad_id: adId!,
        package_type: packageType!,
        duration_days: packageData.duration_days.toString(),
        max_impressions: packageData.max_impressions.toString(),
      };

    } else if (paymentType === 'credits') {
      // Compra de créditos
      if (!creditAmount || creditAmount < 10 || creditAmount > 500) {
        return new Response(JSON.stringify({ error: 'Invalid credit amount' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Para créditos, criar price on-the-fly ou usar price_ids pré-configurados
      // Por simplicidade, vamos criar dinamicamente
      amount = Math.round(creditAmount * 100);
      description = `Vigil Ads - Créditos €${creditAmount}`;
      metadata = {
        ...metadata,
        credit_amount: creditAmount.toString(),
      };
      
      // SEMPRE incluir ad_id se fornecido e válido
      if (adId && typeof adId === 'string' && adId.trim() !== '') {
        metadata.ad_id = adId.trim();
      }

      // Criar sessão sem price_id, usando amount direto
      priceId = ''; // Vai usar amount

    } else if (paymentType === 'cpm') {
      // Anúncio CPM com orçamento personalizado
      if (!cpmBudget || cpmBudget < 10 || cpmBudget > 500) {
        return new Response(JSON.stringify({ error: 'Invalid CPM budget' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      amount = Math.round(cpmBudget * 100);
      description = `Vigil Ads - Anúncio CPM (Orçamento €${cpmBudget})`;
      metadata = {
        ...metadata,
        ad_id: adId!,
        cpm_budget: cpmBudget.toString(),
      };

      priceId = ''; // Vai usar amount

    } else {
      return new Response(JSON.stringify({ error: 'Invalid payment configuration' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Criar sessão de checkout
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      customer_email: undefined, // Pode adicionar email do usuário se disponível
    };

    // Se tem priceId, usar line_items com price
    if (priceId) {
      sessionParams.line_items = [
        {
          price: priceId,
          quantity: 1,
        },
      ];
    } else {
      // Senão, usar price_data
      sessionParams.line_items = [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: description,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Atualizar anúncio com session_id se aplicável
    if (adId) {
      await supabase
        .from('anuncios')
        .update({
          stripe_session_id: session.id,
          payment_status: 'pending',
          payment_type: paymentType,
          ...(packageType && { package_type: packageType }),
          ...(cpmBudget && { budget: cpmBudget, cpm_rate: 8.00 }),
        })
        .eq('id', adId);
    }

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});


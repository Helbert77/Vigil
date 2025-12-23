import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code, userId } = await req.json();

    if (!code || !userId) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Código de cupom ou ID de usuário não fornecido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Buscar cupom
    const { data: coupon, error: couponError } = await supabase
      .from('trial_coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (couponError || !coupon) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Cupom inválido ou expirado' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Verificar validade temporal
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;

    if (now < validFrom || (validUntil && now > validUntil)) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Cupom fora do período de validade' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2.1. Verificar se trial_days não excede 30 dias (regra de negócio)
    if (coupon.trial_days > 30) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Cupom inválido: período de teste excede o limite permitido' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Verificar limite de uso
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Cupom esgotado' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Verificar se usuário já usou este cupom
    const { data: previousUsage } = await supabase
      .from('trial_coupon_usage')
      .select('id')
      .eq('coupon_id', coupon.id)
      .eq('user_id', userId)
      .single();

    if (previousUsage) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Você já utilizou este cupom' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Verificar plano do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single();

    if (!profile) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Perfil não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar elegibilidade do plano
    if (!coupon.eligible_plans.includes(profile.plan)) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: `Este cupom não está disponível para o plano ${profile.plan.toUpperCase()}` 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Cupom válido!
    return new Response(
      JSON.stringify({ 
        valid: true, 
        coupon: {
          id: coupon.id,
          code: coupon.code,
          plan: coupon.plan,
          trialDays: coupon.trial_days,
          description: coupon.description
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[validate-trial-coupon] ERROR:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Erro ao validar cupom', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


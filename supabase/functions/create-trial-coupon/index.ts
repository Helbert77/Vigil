// @ts-ignore
/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateCouponRequest {
  code: string;
  plan: 'basic' | 'pro' | 'premium';
  trial_days: number;
  max_uses?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Validar método HTTP
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405
      }
    );
  }

  try {
    // 1. Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Token de autenticação não fornecido',
          code: 'UNAUTHORIZED'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('[create-trial-coupon] Auth error:', authError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Usuário não autenticado',
          code: 'UNAUTHORIZED',
          details: authError?.message
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      );
    }

    // 2. Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 3. Verify admin role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('[create-trial-coupon] Profile error:', profileError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Erro ao verificar permissões do usuário',
          code: 'PROFILE_ERROR',
          details: profileError.message
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    if (!profile || !['admin', 'moderator'].includes(profile.role)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Acesso negado. Apenas administradores podem criar cupons',
          code: 'FORBIDDEN'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403
        }
      );
    }

    // 4. Parse request body
    let body: CreateCouponRequest;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('[create-trial-coupon] JSON parse error:', parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Formato de dados inválido',
          code: 'INVALID_JSON',
          details: parseError instanceof Error ? parseError.message : 'Erro ao processar JSON'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
    
    // 5. Validate input
    const missingFields: string[] = [];
    if (!body.code || typeof body.code !== 'string' || !body.code.trim()) {
      missingFields.push('code');
    }
    if (!body.plan || typeof body.plan !== 'string') {
      missingFields.push('plan');
    }
    if (!body.trial_days || typeof body.trial_days !== 'number') {
      missingFields.push('trial_days');
    }

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Campos obrigatórios ausentes: ${missingFields.join(', ')}`,
          code: 'MISSING_FIELDS',
          missingFields
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const trimmedCode = body.code.trim().toUpperCase();
    if (trimmedCode.length < 3 || trimmedCode.length > 20) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'O código do cupom deve ter entre 3 e 20 caracteres',
          code: 'INVALID_CODE_LENGTH'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    if (!['basic', 'pro', 'premium'].includes(body.plan)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Plano inválido. Deve ser: basic, pro ou premium',
          code: 'INVALID_PLAN',
          receivedPlan: body.plan
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    if (body.trial_days < 1 || body.trial_days > 30) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Dias de trial devem estar entre 1 e 30',
          code: 'INVALID_TRIAL_DAYS',
          receivedDays: body.trial_days
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    if (body.max_uses !== null && body.max_uses !== undefined && body.max_uses < 1) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Máximo de usos deve ser nulo ou maior que 0',
          code: 'INVALID_MAX_USES',
          receivedMaxUses: body.max_uses
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // 6. Check if coupon code already exists
    const { data: existingCoupon, error: checkError } = await supabaseAdmin
      .from('trial_coupons')
      .select('id, code')
      .eq('code', trimmedCode)
      .maybeSingle();

    if (checkError) {
      console.error('[create-trial-coupon] Check existing coupon error:', checkError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Erro ao verificar código do cupom',
          code: 'DATABASE_ERROR',
          details: checkError.message
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    if (existingCoupon) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `O código "${trimmedCode}" já está em uso`,
          code: 'CODE_ALREADY_EXISTS',
          existingCode: trimmedCode
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409
        }
      );
    }

    // 7. Validate dates
    let validFrom: string | null = null;
    let validUntil: string | null = null;

    if (body.valid_from && body.valid_from.trim()) {
      const fromDate = new Date(body.valid_from);
      if (isNaN(fromDate.getTime())) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Data de início inválida',
            code: 'INVALID_DATE_FROM',
            receivedDate: body.valid_from
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        );
      }
      validFrom = fromDate.toISOString();
    }

    if (body.valid_until && body.valid_until.trim()) {
      const untilDate = new Date(body.valid_until);
      if (isNaN(untilDate.getTime())) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Data de término inválida',
            code: 'INVALID_DATE_UNTIL',
            receivedDate: body.valid_until
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        );
      }
      validUntil = untilDate.toISOString();
      
      // Check if valid_until is after valid_from
      if (validFrom && untilDate <= new Date(validFrom)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'A data de término deve ser posterior à data de início',
            code: 'INVALID_DATE_RANGE',
            validFrom,
            validUntil
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        );
      }
    }

    // 8. Create coupon
    const couponData: any = {
      code: trimmedCode,
      plan: body.plan,
      trial_days: body.trial_days,
      max_uses: body.max_uses || null,
      valid_from: validFrom,
      valid_until: validUntil,
      current_uses: 0,
      is_active: true
    };

    // Adicionar created_by se a coluna existir (será adicionada via SQL)
    // Verificar se a coluna existe tentando fazer um SELECT primeiro
    // Se não existir, simplesmente não incluímos o campo
    // Por enquanto, vamos incluir e tratar o erro se a coluna não existir

    // Tentar inserir com created_by primeiro
    let insertData = { ...couponData, created_by: user.id };
    let { data: newCoupon, error: insertError } = await supabaseAdmin
      .from('trial_coupons')
      .insert(insertData)
      .select()
      .single();

    // Se der erro de coluna não encontrada (PGRST204), tentar sem created_by
    if (insertError && insertError.code === 'PGRST204' && insertError.message?.includes('created_by')) {
      console.log('[create-trial-coupon] created_by column not found, inserting without it');
      insertData = couponData; // Remover created_by
      const retryResult = await supabaseAdmin
        .from('trial_coupons')
        .insert(insertData)
        .select()
        .single();
      
      newCoupon = retryResult.data;
      insertError = retryResult.error;
    }

    if (insertError) {
      console.error('[create-trial-coupon] Insert error:', insertError);
      
      // Tratar erros específicos do banco de dados
      let errorMessage = 'Erro ao criar cupom';
      let errorCode = 'DATABASE_ERROR';
      
      if (insertError.code === '23505') { // Unique violation
        errorMessage = `O código "${trimmedCode}" já está em uso`;
        errorCode = 'CODE_ALREADY_EXISTS';
      } else if (insertError.code === '23503') { // Foreign key violation
        errorMessage = 'Erro de referência: usuário não encontrado';
        errorCode = 'FOREIGN_KEY_ERROR';
      } else if (insertError.code === '23502') { // Not null violation
        errorMessage = 'Campos obrigatórios não fornecidos';
        errorCode = 'NOT_NULL_VIOLATION';
      } else if (insertError.code === 'PGRST204') { // Column not found
        errorMessage = 'Estrutura da tabela incompleta. Execute o SQL de migração primeiro.';
        errorCode = 'SCHEMA_ERROR';
      } else if (insertError.message) {
        errorMessage = `Erro ao criar cupom: ${insertError.message}`;
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          code: errorCode,
          details: insertError.message,
          dbCode: insertError.code
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // 9. Log admin action (optional - table may not exist)
    try {
      await supabaseAdmin.from('admin_actions').insert({
        admin_id: user.id,
        action_type: 'create_coupon',
        target_type: 'trial_coupon',
        target_id: newCoupon.id,
        details: {
          coupon_code: newCoupon.code,
          plan: newCoupon.plan,
          trial_days: newCoupon.trial_days,
          max_uses: newCoupon.max_uses
        }
      });
    } catch (logError) {
      // Log error silently - admin_actions table may not exist
      console.log('Could not log admin action:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        coupon: newCoupon,
        message: 'Coupon created successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201
      }
    );

  } catch (error) {
    console.error('[create-trial-coupon] Unexpected error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Erro desconhecido ao processar requisição';
    
    const errorStack = error instanceof Error && error.stack
      ? error.stack
      : undefined;
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        code: 'UNEXPECTED_ERROR',
        details: errorStack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
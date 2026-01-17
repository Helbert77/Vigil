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

interface ManageCouponRequest {
  couponId: string;
  action: 'toggle_status' | 'delete';
  isActive?: boolean;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // 1. Authenticate user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized: User not found');
    }

    // 2. Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 3. Verify admin role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'moderator'].includes(profile.role)) {
      throw new Error('Forbidden: User is not an admin');
    }

    // 4. Parse request body
    const body: ManageCouponRequest = await req.json();
    
    // 5. Validate input
    if (!body.couponId || !body.action) {
      throw new Error('Missing required fields: couponId, action');
    }

    // 6. Get existing coupon
    const { data: existingCoupon, error: fetchError } = await supabaseAdmin
      .from('trial_coupons')
      .select('*')
      .eq('id', body.couponId)
      .single();

    if (fetchError || !existingCoupon) {
      throw new Error('Coupon not found');
    }

    let result;
    let actionDescription;

    // 7. Handle different actions
    switch (body.action) {
      case 'toggle_status':
        if (body.isActive === undefined) {
          throw new Error('isActive field is required for toggle_status action');
        }

        const { data: updatedCoupon, error: updateError } = await supabaseAdmin
          .from('trial_coupons')
          .update({ is_active: body.isActive })
          .eq('id', body.couponId)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Failed to update coupon: ${updateError.message}`);
        }

        result = updatedCoupon;
        actionDescription = `${body.isActive ? 'activated' : 'deactivated'} coupon`;
        break;

      case 'delete':
        // Check if coupon has been used
        const { data: usageCount } = await supabaseAdmin
          .from('trial_coupon_usage')
          .select('id', { count: 'exact' })
          .eq('coupon_id', body.couponId);

        if (usageCount && usageCount.length > 0) {
          throw new Error('Cannot delete coupon that has been used. Deactivate it instead.');
        }

        const { error: deleteError } = await supabaseAdmin
          .from('trial_coupons')
          .delete()
          .eq('id', body.couponId);

        if (deleteError) {
          throw new Error(`Failed to delete coupon: ${deleteError.message}`);
        }

        result = { deleted: true };
        actionDescription = 'deleted coupon';
        break;

      default:
        throw new Error('Invalid action. Must be: toggle_status or delete');
    }

    // 8. Log admin action (optional - table may not exist)
    try {
      await supabaseAdmin.from('admin_actions').insert({
        admin_id: user.id,
        action_type: `coupon_${body.action}`,
        target_type: 'trial_coupon',
        target_id: body.couponId,
        details: {
          coupon_code: existingCoupon.code,
          previous_status: existingCoupon.is_active,
          new_status: body.action === 'toggle_status' ? body.isActive : null,
          action: body.action
        }
      });
    } catch (logError) {
      // Log error silently - admin_actions table may not exist
      console.log('Could not log admin action:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        result: result,
        message: `Successfully ${actionDescription} ${existingCoupon.code}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('[manage-trial-coupon] Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
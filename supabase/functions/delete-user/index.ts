// @ts-ignore
/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />

// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

// Declare Deno as a global to satisfy TypeScript in a non-Deno environment
declare const Deno: any;

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigins = [
    Deno.env.get('FRONTEND_URL'),
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080'
  ].filter(Boolean)

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
  }

  if (origin && allowedOrigins.includes(origin)) {
    corsHeaders['Access-Control-Allow-Origin'] = origin
  } else {
    corsHeaders['Access-Control-Allow-Origin'] = allowedOrigins[0] || 'http://localhost:5173'
  }

  return corsHeaders
};

serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    // Create a Supabase client with the user's authorization
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the user from the session
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Additional security check: verify user email is confirmed
    if (!user.email_confirmed_at) {
      return new Response(JSON.stringify({ error: 'Email not confirmed' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create a Supabase admin client to perform the deletion
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Log the deletion attempt for audit purposes
    console.log(`Account deletion requested for user: ${user.id} (${user.email}) at ${new Date().toISOString()}`);

    // Check if user has any active subscriptions before deletion
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (subscription && subscription.plan !== 'free') {
      return new Response(JSON.stringify({ 
        error: 'Cannot delete account with active subscription',
        details: `Active ${subscription.plan} subscription found`
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Send notification about account deletion (for audit trail)
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: user.id,
        type: 'account_deletion',
        title: 'Conta excluída',
        message: 'Sua conta foi excluída permanentemente.',
        created_at: new Date().toISOString()
      })
      .catch((err: unknown) => console.warn('Failed to create deletion notification:', err));

    // Delete the user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteError) {
      throw deleteError
    }

    return new Response(JSON.stringify({ message: 'User deleted successfully' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
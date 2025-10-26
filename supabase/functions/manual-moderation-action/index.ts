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

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // 1. Authenticate the moderator
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    const { data: { user: moderatorUser } } = await supabaseClient.auth.getUser();
    if (!moderatorUser) throw new Error('Unauthorized: Could not get moderator user.');

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify moderator role
    const { data: moderatorProfile } = await supabaseAdmin.from('profiles').select('role').eq('id', moderatorUser.id).single();
    if (!moderatorProfile || !['admin', 'moderator'].includes(moderatorProfile.role)) {
      throw new Error('Forbidden: User is not a moderator.');
    }

    // 2. Get request body
    const { targetUserId, action, reason } = await req.json();
    if (!targetUserId || !action || !reason) throw new Error('Missing required parameters: targetUserId, action, and reason.');

    // 3. Add violation to user_violations table
    const points = action === 'warn' ? 10 : action === 'suspend' ? 25 : 100;
    const expiresAt = action !== 'ban' ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) : null;

    const { error: violationError } = await supabaseAdmin.from('user_violations').insert({
      user_id: targetUserId,
      violation_type: 'manual_action',
      points: points,
      action_taken: action,
      moderator_id: moderatorUser.id,
      reason: reason,
      expires_at: expiresAt?.toISOString(),
    });
    if (violationError) throw violationError;

    // 4. Send a DM to the user
    const messageToUser = `Olá, uma ação de moderação foi aplicada à sua conta.\n\nAção: ${action.toUpperCase()}\nMotivo: ${reason}`;
    
    const { data: commonConvoData } = await supabaseAdmin.rpc('get_common_conversation', { user1_id: moderatorUser.id, user2_id: targetUserId });
    let conversationId = commonConvoData?.[0]?.conversation_id;

    if (!conversationId) {
      const { data: newConvo } = await supabaseAdmin.from('conversations').insert({}).select('id').single();
      if (newConvo) {
        conversationId = newConvo.id;
        await supabaseAdmin.from('conversation_participants').insert([
          { conversation_id: conversationId, user_id: moderatorUser.id },
          { conversation_id: conversationId, user_id: targetUserId },
        ]);
      }
    }

    if (conversationId) {
      await supabaseAdmin.from('messages').insert({
        conversation_id: conversationId,
        sender_id: moderatorUser.id,
        content: messageToUser,
      });

      // 5. Create a notification for the new message
      await supabaseAdmin.from('notifications').insert({
        recipient_id: targetUserId,
        actor_id: moderatorUser.id,
        type: 'message',
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
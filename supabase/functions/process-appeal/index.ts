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
    // 1. Authenticate moderator
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    const { data: { user: moderatorUser } } = await supabaseClient.auth.getUser();
    if (!moderatorUser) throw new Error('Unauthorized');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: moderatorProfile } = await supabaseAdmin.from('profiles').select('role').eq('id', moderatorUser.id).single();
    if (!moderatorProfile || !['admin', 'moderator'].includes(moderatorProfile.role)) {
      throw new Error('Forbidden: User is not a moderator.');
    }

    // 2. Get request body
    const { appealId, violationId, action, notes } = await req.json();
    if (!appealId || !violationId || !action) throw new Error('Missing parameters.');

    // 3. Fetch appeal to get user_id
    const { data: appealData } = await supabaseAdmin.from('moderation_appeals').select('user_id').eq('id', appealId).single();
    if (!appealData) throw new Error('Appeal not found.');
    const targetUserId = appealData.user_id;

    // 4. Process the appeal using the appropriate method
    if (action === 'approved') {
      // Use the dedicated RPC function for approvals to ensure atomicity
      const { error: rpcError } = await supabaseAdmin.rpc('process_approved_appeal', {
        p_appeal_id: appealId,
        p_violation_id: violationId,
        p_moderator_id: moderatorUser.id,
        p_moderator_notes: notes,
      });
      if (rpcError) throw rpcError;
    } else { // For 'rejected' or other statuses
      // Update the appeal status manually
      await supabaseAdmin.from('moderation_appeals').update({
        status: action,
        reviewed_by: moderatorUser.id,
        reviewed_at: new Date().toISOString(),
        moderator_notes: notes,
      }).eq('id', appealId);
    }

    // 5. Send DM and notification to the user
    const messageToUser = `Sua apelação foi revisada e a decisão foi: ${action.toUpperCase()}.\n\nNotas do moderador: ${notes || 'Nenhuma nota adicional.'}`;
    
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
        created_at: new Date().toISOString(),
      });
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
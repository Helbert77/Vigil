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
    // 1. Authenticate the moderator making the request
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    const { data: { user: moderatorUser } } = await supabaseClient.auth.getUser();
    if (!moderatorUser) throw new Error('Unauthorized: Could not get moderator user.');

    // Create admin client for all subsequent operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Check if the user is a moderator/admin
    const { data: moderatorProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', moderatorUser.id)
      .single();
    if (!moderatorProfile || !['admin', 'moderator'].includes(moderatorProfile.role)) {
      throw new Error('Forbidden: User is not a moderator.');
    }

    // 2. Get request body
    const { itemId: queueItemId, action, reason, duration } = await req.json();
    if (!queueItemId || !action) throw new Error('Missing required parameters: itemId and action.');

    // 3. Fetch the queue item to get author_id, content_id, etc.
    const { data: queueItem, error: queueError } = await supabaseAdmin
      .from('moderation_queue')
      .select('author_id, violation_types, content_id, content_type, content_text')
      .eq('id', queueItemId)
      .single();
    if (queueError || !queueItem) throw new Error('Moderation queue item not found.');

    const { author_id, violation_types, content_id, content_type, content_text } = queueItem;

    // 4. Perform the primary moderation action
    let messageToUser = '';

    if (action === 'approved') {
      messageToUser = `Olá, sua postagem foi revisada e aprovada pela nossa equipe de moderação. Obrigado por sua contribuição!\n\nConteúdo: "${content_text.substring(0, 100)}..."`;
    } else { // rejected, warn, suspend
      messageToUser = `Olá, seu conteúdo foi revisado e uma ação foi tomada pela nossa equipe de moderação.\n\nAção: ${action.toUpperCase()}\nMotivo: ${reason || 'Violação das diretrizes da comunidade.'}\n\nConteúdo: "${content_text.substring(0, 100)}..."`;
      
      // Delete the offending content if it exists
      if (content_id && content_type) {
        const table = content_type === 'post' ? 'posts' : 'comments';
        await supabaseAdmin.from(table).delete().eq('id', content_id);
      }

      // If it's a disciplinary action, add to user_violations
      if (['warn', 'suspend', 'ban'].includes(action)) {
        const points = action === 'warn' ? 10 : action === 'suspend' ? 25 : 100;
        const expiresAt = action !== 'ban' ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) : null;

        await supabaseAdmin.from('user_violations').insert({
          user_id: author_id,
          violation_type: violation_types?.[0] || 'general',
          points: points,
          action_taken: action,
          content_id: content_id,
          content_text: content_text, // Save original content
          moderator_id: moderatorUser.id,
          reason: reason,
          expires_at: expiresAt?.toISOString(),
        });
      }
    }

    // 5. Update the queue item status
    await supabaseAdmin
      .from('moderation_queue')
      .update({ status: action, reviewed_at: new Date().toISOString(), assigned_moderator_id: moderatorUser.id })
      .eq('id', queueItemId);

    // 6. Log the action
    await supabaseAdmin.from('moderation_actions').insert({
      queue_item_id: queueItemId,
      moderator_id: moderatorUser.id,
      action_type: action,
      reason: reason,
    });

    // 7. Send a DM to the user
    if (author_id) {
      // Find or create a conversation
      const { data: commonConvoData } = await supabaseAdmin.rpc('get_common_conversation', { user1_id: moderatorUser.id, user2_id: author_id });
      let conversationId = commonConvoData?.[0]?.conversation_id;

      if (!conversationId) {
        const { data: newConvo } = await supabaseAdmin.from('conversations').insert({}).select('id').single();
        if (newConvo) {
          conversationId = newConvo.id;
          await supabaseAdmin.from('conversation_participants').insert([
            { conversation_id: conversationId, user_id: moderatorUser.id },
            { conversation_id: conversationId, user_id: author_id },
          ]);
        }
      }

      // Send the message
      if (conversationId) {
        await supabaseAdmin.from('messages').insert({
          conversation_id: conversationId,
          sender_id: moderatorUser.id,
          content: messageToUser,
          created_at: new Date().toISOString(),
        });

        // 8. Create a notification for the new message
        await supabaseAdmin.from('notifications').insert({
          recipient_id: author_id,
          actor_id: moderatorUser.id,
          type: 'message',
        });
      }
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
})
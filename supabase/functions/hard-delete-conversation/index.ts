// @ts-ignore
/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />

// @ts-ignore
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
    // 1. Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Unauthorized: Missing Authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error(`Authentication failed: ${authError?.message || 'No user found'}`);
    }

    // 2. Get conversation_id from request body
    const { conversation_id } = await req.json();
    if (!conversation_id) {
      throw new Error('Missing conversation_id in request body');
    }

    // 3. Create admin client for elevated privileges
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 4. Verify user is a participant of the conversation
    const { data: participant, error: participantError } = await supabaseAdmin
      .from('conversation_participants')
      .select('user_id')
      .match({ conversation_id: conversation_id, user_id: user.id })
      .single();

    if (participantError || !participant) {
      throw new Error('Forbidden: User is not a participant of this conversation.');
    }

    // 5. Perform hard delete. Order: messages, participants, then conversation.
    const { error: messagesError } = await supabaseAdmin
      .from('messages')
      .delete()
      .eq('conversation_id', conversation_id);
    if (messagesError) throw new Error(`Failed to delete messages: ${messagesError.message}`);

    const { error: participantsError } = await supabaseAdmin
      .from('conversation_participants')
      .delete()
      .eq('conversation_id', conversation_id);
    if (participantsError) throw new Error(`Failed to delete participants: ${participantsError.message}`);

    const { error: conversationError } = await supabaseAdmin
      .from('conversations')
      .delete()
      .eq('id', conversation_id);
    if (conversationError) throw new Error(`Failed to delete conversation: ${conversationError.message}`);

    // 6. Return success
    return new Response(JSON.stringify({ success: true, message: 'Conversation permanently deleted.' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
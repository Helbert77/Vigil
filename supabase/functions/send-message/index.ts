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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('=== Send Message Function Started ===');
    
    // 1. Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('ERROR: No authorization header present');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No auth header', success: false }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('ERROR: Auth error or no user:', authError);
      return new Response(
        JSON.stringify({ error: `Authentication failed: ${authError?.message || 'No user found'}`, success: false }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('User authenticated successfully:', user.id);

    // 2. Parse request body
    const { target_user_id, content, conversation_id: existing_convo_id } = await req.json();
    
    // 3. Validate input
    if (!content || content.trim() === '') {
      return new Response(JSON.stringify({ error: 'Message content is required', success: false }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!target_user_id && !existing_convo_id) {
      return new Response(JSON.stringify({ error: 'Either target_user_id or conversation_id is required', success: false }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 4. Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    let conversationId = existing_convo_id;

    // 5. Find or create conversation
    if (!conversationId) {
      const { data: commonConvoData, error: rpcError } = await supabaseAdmin
        .rpc('get_common_conversation', { user1_id: user.id, user2_id: target_user_id });

      if (rpcError) throw rpcError;

      if (commonConvoData && commonConvoData.length > 0) {
        conversationId = commonConvoData[0].conversation_id;
      } else {
        const { data: newConvo, error: createConvoError } = await supabaseAdmin
          .from('conversations').insert({}).select('id').single();
        if (createConvoError) throw createConvoError;
        
        conversationId = newConvo.id;

        const { error: participantsError } = await supabaseAdmin
          .from('conversation_participants')
          .insert([
            { conversation_id: conversationId, user_id: user.id },
            { conversation_id: conversationId, user_id: target_user_id },
          ]);
        if (participantsError) throw participantsError;
      }
    }

    // 6. Undelete conversation for the sender if they had previously deleted it
    console.log('Checking for and removing deleted_conversations entry...');
    const { error: deleteRecordError } = await supabaseAdmin
      .from('deleted_conversations')
      .delete()
      .match({ user_id: user.id, conversation_id: conversationId });

    if (deleteRecordError) {
      // Log the error but don't block message sending
      console.error('Could not undelete conversation:', deleteRecordError);
    } else {
      console.log('Undelete successful or no record found.');
    }

    // 7. Insert the message
    const { data: newMessage, error: messageError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (messageError) throw messageError;

    // 8. Return success response
    const response = { success: true, message: newMessage, conversation_id: conversationId };
    
    return new Response(JSON.stringify(response), {
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
})
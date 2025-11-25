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
    // 1. Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
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
      return new Response(
        JSON.stringify({ error: `Authentication failed: ${authError?.message || 'No user found'}`, success: false }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parse request body
    const { room_id } = await req.json();
    
    // 3. Validate input
    if (!room_id) {
      return new Response(
        JSON.stringify({ error: 'ID da sala é obrigatório', success: false }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 5. Verify user is the creator of the room or admin/moderator
    const { data: existingRoom, error: fetchError } = await supabaseAdmin
      .from('chat_rooms')
      .select('created_by')
      .eq('id', room_id)
      .single();

    if (fetchError || !existingRoom) {
      return new Response(
        JSON.stringify({ error: 'Sala não encontrada', success: false }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin/moderator or creator
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdminOrModerator = profile?.role === 'admin' || profile?.role === 'moderator';
    const isCreator = existingRoom.created_by === user.id;

    if (!isAdminOrModerator && !isCreator) {
      return new Response(
        JSON.stringify({ error: 'Você não tem permissão para excluir esta sala', success: false }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Delete the chat room (CASCADE will handle participants and messages)
    const { error: deleteError } = await supabaseAdmin
      .from('chat_rooms')
      .delete()
      .eq('id', room_id);

    if (deleteError) {
      console.error('Error deleting chat room:', deleteError);
      return new Response(
        JSON.stringify({ error: `Erro ao excluir sala: ${deleteError.message}`, success: false }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Return success response
    return new Response(
      JSON.stringify({ success: true, message: 'Sala excluída com sucesso' }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao excluir sala';
    console.error('Error in delete-chat-room:', error);
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})


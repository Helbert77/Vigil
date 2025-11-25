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
    const { room_id, name, description, category, is_public, max_participants, is_hot, is_new } = await req.json();
    
    // 3. Validate input
    if (!room_id) {
      return new Response(
        JSON.stringify({ error: 'ID da sala é obrigatório', success: false }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (name && name.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Nome da sala deve ter no máximo 100 caracteres', success: false }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 5. Verify user is the creator of the room
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
        JSON.stringify({ error: 'Você não tem permissão para editar esta sala', success: false }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (category !== undefined) updateData.category = category;
    if (is_public !== undefined) updateData.is_public = is_public;
    if (max_participants !== undefined) updateData.max_participants = max_participants;
    if (is_hot !== undefined) updateData.is_hot = is_hot;
    if (is_new !== undefined) updateData.is_new = is_new;
    updateData.updated_at = new Date().toISOString();

    // 7. Update the chat room
    const { data: updatedRoom, error: updateError } = await supabaseAdmin
      .from('chat_rooms')
      .update(updateData)
      .eq('id', room_id)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating chat room:', updateError);
      return new Response(
        JSON.stringify({ error: `Erro ao atualizar sala: ${updateError.message}`, success: false }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch creator info separately if needed
    let creatorInfo = null;
    if (updatedRoom.created_by) {
      const { data: creator } = await supabaseAdmin
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', updatedRoom.created_by)
        .single();
      creatorInfo = creator;
    }

    // 8. Return success response
    const responseRoom = {
      ...updatedRoom,
      creator: creatorInfo
    };

    return new Response(
      JSON.stringify({ success: true, room: responseRoom }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao atualizar sala';
    console.error('Error in update-chat-room:', error);
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})


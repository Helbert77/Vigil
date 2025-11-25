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
    const { name, description, category, is_public, max_participants } = await req.json();
    
    // 3. Validate input
    if (!name || name.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Nome da sala é obrigatório', success: false }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (name.length > 100) {
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

    // 5. Create the chat room
    const roomData: any = {
      name: name.trim(),
      description: description?.trim() || null,
      category: category || 'normal',
      is_public: is_public !== undefined ? is_public : true,
      max_participants: max_participants || 100,
      created_by: user.id,
      participant_count: 0,
      users_online: 0,
      is_hot: false,
      is_new: true
    };

    const { data: newRoom, error: createError } = await supabaseAdmin
      .from('chat_rooms')
      .insert(roomData)
      .select('*')
      .single();

    if (createError) {
      console.error('Error creating chat room:', createError);
      return new Response(
        JSON.stringify({ error: `Erro ao criar sala: ${createError.message}`, success: false }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch creator info separately if needed
    let creatorInfo = null;
    if (newRoom.created_by) {
      const { data: creator } = await supabaseAdmin
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', newRoom.created_by)
        .single();
      creatorInfo = creator;
    }

    // 6. Return success response
    const responseRoom = {
      ...newRoom,
      creator: creatorInfo
    };

    return new Response(
      JSON.stringify({ success: true, room: responseRoom }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao criar sala';
    console.error('Error in create-chat-room:', error);
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})


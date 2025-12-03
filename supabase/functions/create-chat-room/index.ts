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

    // 2. Parse request body com tratamento de erro
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao processar dados da requisição', 
          details: parseError instanceof Error ? parseError.message : String(parseError),
          success: false 
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { name, description, category, is_public, max_participants, invited_user_ids } = requestBody;
    
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

    // 4. Verificar se service role key está configurada ANTES de criar o cliente
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Configuração do servidor inválida', success: false }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Create admin client (service role bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey,
      { 
        auth: { 
          autoRefreshToken: false, 
          persistSession: false 
        }
      }
    );

    // 6. Validate plan for private rooms
    const isPrivate = is_public === false;
    if (isPrivate) {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single();
      
      if (profileError || !profile || (profile.plan !== 'pro' && profile.plan !== 'premium')) {
        return new Response(
          JSON.stringify({ 
            error: 'Apenas usuários Pro ou Premium podem criar salas privadas', 
            success: false 
          }), 
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 7. Determine is_hot and is_new based on category
    const categoryValue = category || 'normal';
    const isHot = categoryValue === 'hot';
    const isNew = categoryValue === 'new';

    // 8. Create the chat room
    // IMPORTANTE: NÃO incluir users_online - essa coluna não existe mais na tabela
    const roomData: any = {
      name: name.trim(),
      description: description?.trim() || null,
      category: categoryValue,
      is_public: is_public !== undefined ? is_public : true,
      max_participants: max_participants || 100,
      created_by: user.id,
      participant_count: 0,
      is_hot: isHot,
      is_new: isNew
    };
    
    // Tentar inserir usando o cliente admin (bypass RLS)
    const { data: newRoom, error: createError } = await supabaseAdmin
      .from('chat_rooms')
      .insert(roomData)
      .select('*')
      .single();

    if (createError) {
      // Se o erro for sobre coluna não existir, tentar sem os campos opcionais
      if (createError.code === '42703' || createError.message?.includes('column') || createError.message?.includes('does not exist')) {
        const minimalRoomData: any = {
          name: name.trim(),
          description: description?.trim() || null,
          category: categoryValue,
          participant_count: 0,
          is_hot: isHot,
          is_new: isNew
        };
        
        const { data: retryRoom, error: retryError } = await supabaseAdmin
          .from('chat_rooms')
          .insert(minimalRoomData)
          .select('*')
          .single();
        
        if (retryError) {
          return new Response(
            JSON.stringify({ 
              error: `Erro ao criar sala: ${retryError.message || createError.message}`,
              details: retryError.details || createError.details || null,
              hint: retryError.hint || createError.hint || null,
              code: retryError.code || createError.code || null,
              success: false 
            }), 
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Se funcionou com dados mínimos, usar esse resultado
        const responseRoom = {
          ...retryRoom
        };
        
        return new Response(
          JSON.stringify({ success: true, room: responseRoom }), 
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Retornar erro completo para debug
      const errorResponse = {
        error: `Erro ao criar sala: ${createError.message || 'Erro desconhecido'}`,
        details: createError.details || null,
        hint: createError.hint || null,
        code: createError.code || null,
        message: createError.message || null,
        success: false
      };
      
      return new Response(
        JSON.stringify(errorResponse), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 9. Add creator as participant
    const { error: participantError } = await supabaseAdmin
      .from('chat_room_participants')
      .insert({
        room_id: newRoom.id,
        user_id: user.id,
        joined_at: new Date().toISOString(),
        last_activity: new Date().toISOString()
      });
    
    if (participantError) {
      // Não falha a criação da sala se houver erro ao adicionar participante
    }

    // 10. Fetch creator info separately if needed
    let creatorInfo = null;
    if (newRoom.created_by) {
      try {
        const { data: creator, error: creatorError } = await supabaseAdmin
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', newRoom.created_by)
          .single();
        
        if (!creatorError) {
          creatorInfo = creator;
        }
      } catch (creatorFetchError) {
        // Continuar mesmo se houver erro ao buscar creator
      }
    }

    // 11. Invitations for private rooms
    if (isPrivate && Array.isArray(invited_user_ids) && invited_user_ids.length > 0) {
      const invites = invited_user_ids
        .filter((invitee: string) => invitee && invitee !== user.id)
        .map((invitee: string) => ({
          room_id: newRoom.id,
          inviter_id: user.id,
          invitee_id: invitee,
          status: 'pending'
        }));
      if (invites.length > 0) {
        await supabaseAdmin.from('chat_room_invitations').insert(invites);
      }
    }

    // 12. Return success response
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
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})


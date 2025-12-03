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

    const { request_id } = requestBody;
    
    if (!request_id) {
      return new Response(
        JSON.stringify({ error: 'request_id é obrigatório', success: false }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Create admin client
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Configuração do servidor inválida', success: false }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // 4. Fetch access request
    const { data: accessRequest, error: requestError } = await supabaseAdmin
      .from('room_access_requests')
      .select('*')
      .eq('id', request_id)
      .single();

    if (requestError || !accessRequest) {
      console.error('[reject-room-access] Error fetching access request:', requestError);
      return new Response(
        JSON.stringify({ 
          error: 'Pedido de acesso não encontrado', 
          details: requestError?.message || 'Request not found',
          success: false 
        }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4.1. Fetch room info separately
    const { data: room, error: roomError } = await supabaseAdmin
      .from('chat_rooms')
      .select('id, name, created_by, is_public')
      .eq('id', accessRequest.room_id)
      .single();

    if (roomError || !room) {
      console.error('[reject-room-access] Error fetching room:', roomError);
      return new Response(
        JSON.stringify({ 
          error: 'Sala não encontrada', 
          details: roomError?.message || 'Room not found',
          success: false 
        }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Verify user is the room creator
    if (room.created_by !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Apenas o criador da sala pode rejeitar pedidos', success: false }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Verify request is still pending
    if (accessRequest.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'Este pedido já foi processado', success: false }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Update request status to rejected
    const { error: updateError } = await supabaseAdmin
      .from('room_access_requests')
      .update({ 
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', request_id);

    if (updateError) {
      console.error('[reject-room-access] Error updating request:', updateError);
      return new Response(
        JSON.stringify({ 
          error: `Erro ao rejeitar pedido: ${updateError.message}`, 
          success: false 
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 8. Create notification for requester
    const { error: notificationError } = await supabaseAdmin
      .from('notifications')
      .insert({
        recipient_id: accessRequest.requester_id,
        actor_id: user.id,
        type: 'room_access_rejected',
        metadata: {
          room_id: accessRequest.room_id,
          room_name: room.name
        }
      });

    if (notificationError) {
      console.error('[reject-room-access] Error creating notification:', notificationError);
      // Don't fail the request if notification fails
    }

    return new Response(
      JSON.stringify({ success: true }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao rejeitar pedido';
    console.error('[reject-room-access] Unexpected error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})


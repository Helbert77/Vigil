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

    const { room_id } = requestBody;
    
    if (!room_id) {
      return new Response(
        JSON.stringify({ error: 'room_id é obrigatório', success: false }), 
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

    // 4. Verify room exists and is private
    const { data: room, error: roomError } = await supabaseAdmin
      .from('chat_rooms')
      .select('id, name, is_public, created_by')
      .eq('id', room_id)
      .single();

    if (roomError || !room) {
      return new Response(
        JSON.stringify({ error: 'Sala não encontrada', success: false }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (room.is_public) {
      return new Response(
        JSON.stringify({ error: 'Esta sala é pública, não é necessário pedir acesso', success: false }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Check if user is the creator
    if (room.created_by === user.id) {
      return new Response(
        JSON.stringify({ error: 'Você é o criador desta sala', success: false }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Check if user already has an invitation
    const { data: existingInvitation } = await supabaseAdmin
      .from('chat_room_invitations')
      .select('id')
      .eq('room_id', room_id)
      .eq('invitee_id', user.id)
      .eq('status', 'pending')
      .single();

    if (existingInvitation) {
      return new Response(
        JSON.stringify({ error: 'Você já possui um convite pendente para esta sala', success: false }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Check if user already has a pending request
    const { data: existingRequest } = await supabaseAdmin
      .from('room_access_requests')
      .select('id, status')
      .eq('room_id', room_id)
      .eq('requester_id', user.id)
      .maybeSingle();

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return new Response(
          JSON.stringify({ error: 'Você já possui um pedido de acesso pendente', success: false }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else if (existingRequest.status === 'approved') {
        return new Response(
          JSON.stringify({ error: 'Seu pedido de acesso já foi aprovado. Verifique seus convites.', success: false }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else if (existingRequest.status === 'rejected') {
        // Allow new request after rejection - delete the old one first
        await supabaseAdmin
          .from('room_access_requests')
          .delete()
          .eq('id', existingRequest.id);
        // Continue to create new request below
      }
    }

    // 8. Create access request
    const { data: accessRequest, error: requestError } = await supabaseAdmin
      .from('room_access_requests')
      .insert({
        room_id: room_id,
        requester_id: user.id,
        status: 'pending'
      })
      .select()
      .single();

    if (requestError) {
      console.error('[request-room-access] Error creating access request:', requestError);
      
      // Check if it's a unique constraint violation (duplicate request)
      const isDuplicateError = 
        requestError.code === '23505' || // PostgreSQL unique violation
        requestError.message?.includes('duplicate key') ||
        requestError.message?.includes('unique constraint') ||
        requestError.message?.includes('room_access_requests_room_id_requester_id_key');
      
      if (isDuplicateError) {
        // Double-check if request exists (race condition handling)
        const { data: existingRequestCheck } = await supabaseAdmin
          .from('room_access_requests')
          .select('id, status')
          .eq('room_id', room_id)
          .eq('requester_id', user.id)
          .maybeSingle();
        
        if (existingRequestCheck) {
          if (existingRequestCheck.status === 'pending') {
            return new Response(
              JSON.stringify({ 
                error: 'Você já possui um pedido de acesso pendente', 
                success: false 
              }), 
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } else if (existingRequestCheck.status === 'approved') {
            return new Response(
              JSON.stringify({ 
                error: 'Seu pedido de acesso já foi aprovado. Verifique seus convites.', 
                success: false 
              }), 
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } else {
            return new Response(
              JSON.stringify({ 
                error: 'Você já possui um pedido de acesso para esta sala', 
                success: false 
              }), 
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
        
        return new Response(
          JSON.stringify({ 
            error: 'Você já possui um pedido de acesso para esta sala', 
            success: false 
          }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: `Erro ao criar pedido de acesso: ${requestError.message}`, 
          success: false 
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 9. Create notification for room creator
    const { error: notificationError } = await supabaseAdmin
      .from('notifications')
      .insert({
        recipient_id: room.created_by,
        actor_id: user.id,
        type: 'room_access_request',
        metadata: {
          room_id: room_id,
          room_name: room.name,
          request_id: accessRequest.id
        }
      });

    if (notificationError) {
      console.error('[request-room-access] Error creating notification:', notificationError);
      // Don't fail the request if notification fails
    }

    return new Response(
      JSON.stringify({ success: true, request: accessRequest }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao criar pedido de acesso';
    console.error('[request-room-access] Unexpected error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})


// ============================================================================
// VERSÃO SIMPLIFICADA PARA TESTE
// Use esta versão primeiro para identificar o problema
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPPORT_EMAIL = 'seu-email@gmail.com'; // ← ALTERE AQUI!

serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    console.log('🎫 Recebendo ticket...');
    
    const ticket = await req.json();
    console.log('📋 Dados do ticket:', ticket);

    // Verificar API Key
    if (!RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY não configurada!');
      throw new Error('RESEND_API_KEY não configurada');
    }
    console.log('✅ API Key encontrada');

    // Verificar email de suporte
    if (!SUPPORT_EMAIL || SUPPORT_EMAIL === 'seu-email@gmail.com') {
      console.error('❌ SUPPORT_EMAIL não configurado!');
      throw new Error('Configure o SUPPORT_EMAIL na função');
    }
    console.log('✅ Email de suporte configurado:', SUPPORT_EMAIL);

    // Enviar email simples
    console.log('📧 Enviando email...');
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev', // Domínio de teste do Resend
        to: [SUPPORT_EMAIL],
        subject: `🎫 Novo Ticket: ${ticket.subject}`,
        html: `
          <h1>Novo Ticket de Suporte</h1>
          <p><strong>Usuário:</strong> ${ticket.userName}</p>
          <p><strong>Email:</strong> ${ticket.userEmail}</p>
          <p><strong>Assunto:</strong> ${ticket.subject}</p>
          <p><strong>Descrição:</strong></p>
          <p>${ticket.description}</p>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error('❌ Erro do Resend:', errorText);
      throw new Error(`Resend error: ${errorText}`);
    }

    const emailResult = await resendResponse.json();
    console.log('✅ Email enviado com sucesso!', emailResult);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Ticket enviado com sucesso!',
        emailId: emailResult.id
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );

  } catch (error) {
    console.error('💥 Erro geral:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro desconhecido',
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
});


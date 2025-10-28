/// <reference path="./deno.d.ts" />
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigins = [
    Deno.env.get('FRONTEND_URL'),
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080'
  ].filter(Boolean)

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
  }

  if (origin && allowedOrigins.includes(origin)) {
    corsHeaders['Access-Control-Allow-Origin'] = origin
  } else {
    corsHeaders['Access-Control-Allow-Origin'] = allowedOrigins[0] || 'http://localhost:5173'
  }

  return corsHeaders
}

interface EmailRequest {
  type: 'deletion_scheduled' | 'deletion_cancelled' | 'deletion_reminder'
  userEmail: string
  userName?: string
  scheduledDate?: string
  gracePeriodDays?: number
}

serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verify user session
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Parse request body
    const { type, userEmail, userName, scheduledDate, gracePeriodDays }: EmailRequest = await req.json()

    // Generate email content based on type
    let subject: string
    let htmlContent: string

    switch (type) {
      case 'deletion_scheduled':
        subject = 'Exclusão de Conta Agendada - Vigil'
        htmlContent = generateDeletionScheduledEmail(userName || 'Usuário', scheduledDate!, gracePeriodDays!)
        break
      case 'deletion_cancelled':
        subject = 'Exclusão de Conta Cancelada - Vigil'
        htmlContent = generateDeletionCancelledEmail(userName || 'Usuário')
        break
      case 'deletion_reminder':
        subject = 'Lembrete: Exclusão de Conta em Breve - Vigil'
        htmlContent = generateDeletionReminderEmail(userName || 'Usuário', scheduledDate!)
        break
      default:
        return new Response(JSON.stringify({ error: 'Invalid email type' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    // Create admin client for sending emails
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Send email using Supabase Auth (this requires SMTP configuration in Supabase)
    // Note: In production, you might want to use a dedicated email service like SendGrid, Resend, etc.
    const { error: emailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(userEmail, {
      data: {
        custom_email: true,
        subject,
        html_content: htmlContent
      }
    })

    if (emailError) {
      console.error('Error sending email:', emailError)
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Log the email sending for audit purposes
    console.log(`Email sent: ${type} to ${userEmail} at ${new Date().toISOString()}`)

    return new Response(JSON.stringify({ success: true, message: 'Email sent successfully' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in send-deletion-email function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function generateDeletionScheduledEmail(userName: string, scheduledDate: string, gracePeriodDays: number): string {
  const formattedDate = new Date(scheduledDate).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Exclusão de Conta Agendada</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #dc3545; margin: 0;">⚠️ Exclusão de Conta Agendada</h1>
      </div>
      
      <p>Olá, <strong>${userName}</strong>,</p>
      
      <p>Sua solicitação de exclusão de conta foi processada com sucesso. Sua conta está agendada para ser excluída permanentemente em:</p>
      
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #856404;">
          📅 ${formattedDate}
        </p>
      </div>
      
      <h3>⏰ Período de Carência</h3>
      <p>Você tem <strong>${gracePeriodDays} dias</strong> para cancelar esta exclusão caso mude de ideia. Durante este período:</p>
      <ul>
        <li>Sua conta permanece ativa e acessível</li>
        <li>Todos os seus dados permanecem intactos</li>
        <li>Você pode cancelar a exclusão a qualquer momento nas configurações</li>
      </ul>
      
      <h3>🗑️ O que será excluído</h3>
      <p>Após a data agendada, os seguintes dados serão permanentemente removidos:</p>
      <ul>
        <li>Perfil de usuário e informações pessoais</li>
        <li>Todos os posts e comentários</li>
        <li>Mensagens e conversas</li>
        <li>Configurações e preferências</li>
        <li>Histórico de atividades</li>
      </ul>
      
      <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0; color: #0c5460;">
          <strong>💡 Dica:</strong> Se você ainda não fez, recomendamos baixar uma cópia dos seus dados antes da exclusão.
        </p>
      </div>
      
      <p>Se você não deseja mais excluir sua conta, acesse as configurações da sua conta e cancele a exclusão.</p>
      
      <p>Obrigado por ter sido parte da comunidade Vigil.</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="font-size: 12px; color: #666;">
        Este é um email automático. Se você não solicitou a exclusão da conta, entre em contato conosco imediatamente.
      </p>
    </body>
    </html>
  `
}

function generateDeletionCancelledEmail(userName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Exclusão de Conta Cancelada</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #155724; margin: 0;">✅ Exclusão de Conta Cancelada</h1>
      </div>
      
      <p>Olá, <strong>${userName}</strong>,</p>
      
      <p>Sua solicitação de exclusão de conta foi <strong>cancelada com sucesso</strong>.</p>
      
      <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0; color: #155724;">
          <strong>🎉 Sua conta está segura!</strong> Todos os seus dados permanecem intactos e você pode continuar usando o Vigil normalmente.
        </p>
      </div>
      
      <p>Se você cancelou por engano ou deseja agendar uma nova exclusão, você pode fazer isso a qualquer momento nas configurações da sua conta.</p>
      
      <p>Obrigado por continuar sendo parte da comunidade Vigil!</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="font-size: 12px; color: #666;">
        Este é um email automático. Se você não cancelou a exclusão da conta, entre em contato conosco imediatamente.
      </p>
    </body>
    </html>
  `
}

function generateDeletionReminderEmail(userName: string, scheduledDate: string): string {
  const formattedDate = new Date(scheduledDate).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Lembrete: Exclusão de Conta em Breve</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #856404; margin: 0;">⏰ Lembrete: Exclusão em Breve</h1>
      </div>
      
      <p>Olá, <strong>${userName}</strong>,</p>
      
      <p>Este é um lembrete de que sua conta está agendada para exclusão permanente em:</p>
      
      <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #721c24;">
          📅 ${formattedDate}
        </p>
      </div>
      
      <h3>🚨 Ação Necessária</h3>
      <p>Se você <strong>NÃO</strong> deseja mais excluir sua conta:</p>
      <ol>
        <li>Acesse as configurações da sua conta</li>
        <li>Clique em "Cancelar Exclusão"</li>
        <li>Sua conta será preservada</li>
      </ol>
      
      <h3>📥 Última Chance para Baixar Dados</h3>
      <p>Se você decidir prosseguir com a exclusão, esta é sua última oportunidade para baixar uma cópia dos seus dados.</p>
      
      <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0; color: #0c5460;">
          <strong>⚠️ Importante:</strong> Após a exclusão, não será possível recuperar seus dados.
        </p>
      </div>
      
      <p>Se você não tomar nenhuma ação, sua conta será excluída automaticamente na data agendada.</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="font-size: 12px; color: #666;">
        Este é um email automático. Se você não solicitou a exclusão da conta, entre em contato conosco imediatamente.
      </p>
    </body>
    </html>
  `
}
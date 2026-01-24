import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPPORT_EMAIL = 'suporte@myvigil.co';

interface SupportTicketRequest {
  userId: string;
  userEmail: string;
  userName: string;
  userPlan: string;
  category: string;
  subject: string;
  description: string;
  priority: string;
  userAgent: string;
  timestamp: string;
  attachments?: Array<{ name: string; content: string; type: string }>;
}

serve(async (req) => {
  // CORS headers
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
    const ticket: SupportTicketRequest = await req.json();

    // Validação
    if (!ticket.subject || !ticket.description || !ticket.userEmail) {
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios faltando' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Determinar prioridade visual
    const priorityEmoji = {
      high: '🔴',
      medium: '🟡',
      low: '🟢'
    }[ticket.priority] || '⚪';

    const categoryEmoji = {
      technical: '🔧',
      billing: '💳',
      feature: '💡',
      other: '📝'
    }[ticket.category] || '📝';

    // Criar ticket no banco de dados
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: ticketData, error: dbError } = await supabaseAdmin
      .from('support_tickets')
      .insert({
        user_id: ticket.userId,
        category: ticket.category,
        subject: ticket.subject,
        description: ticket.description,
        priority: ticket.priority,
        status: 'open',
        user_agent: ticket.userAgent,
        user_plan: ticket.userPlan
      })
      .select()
      .single();

    if (dbError) {
      console.error('Erro ao criar ticket no banco:', dbError);
    }

    const ticketNumber = ticketData?.id?.slice(0, 8).toUpperCase() || 'UNKNOWN';

    // Configurações de cores por plano (com contraste adequado)
    const planConfig = {
      premium: {
        bg: '#fee2e2',
        badgeBg: '#dc2626',
        border: '#dc2626',
        textColor: '#7f1d1d',
        emoji: '💎'
      },
      pro: {
        bg: '#fef3c7',
        badgeBg: '#f59e0b',
        border: '#f59e0b',
        textColor: '#78350f',
        emoji: '⭐'
      },
      basic: {
        bg: '#d1fae5',
        badgeBg: '#10b981',
        border: '#10b981',
        textColor: '#064e3b',
        emoji: '✓'
      },
      free: {
        bg: '#e5e7eb',
        badgeBg: '#6b7280',
        border: '#6b7280',
        textColor: '#1f2937',
        emoji: '○'
      }
    };

    const plan = planConfig[ticket.userPlan.toLowerCase()] || planConfig.free;

    // Iniciais do usuário para avatar
    const userInitials = ticket.userName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    // Enviar email usando Resend com template moderno (estilo React Email)
    const emailHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ticket de Suporte - Vigil</title>
  <!--[if gte mso 9]>
  <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="680" cellpadding="0" cellspacing="0" style="max-width: 680px; width: 100%;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #7c3aed; padding: 48px 32px; text-align: center; border-radius: 16px 16px 0 0;">
              <img src="https://myvigil.co/logo.png" alt="Vigil Logo" style="width: 80px; height: 80px; margin: 0 auto 16px; display: block;" />
              <h1 style="margin: 0 0 16px 0; color: #ffffff; font-size: 36px; font-weight: 700;">Novo Ticket de Suporte</h1>
              <table cellpadding="0" cellspacing="0" align="center" style="background-color: rgba(255, 255, 255, 0.2); border-radius: 24px;">
                <tr>
                  <td style="padding: 8px 24px; color: #ffffff; font-size: 14px; font-weight: 600; letter-spacing: 1px;">
                    #${ticketNumber}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Badge -->
          <tr>
            <td style="background-color: #ffffff; padding: 32px 32px 0 32px;">
              <table cellpadding="0" cellspacing="0" style="background-color: #10b981; border-radius: 24px;">
                <tr>
                  <td style="padding: 10px 20px; color: #ffffff; font-size: 14px; font-weight: 600;">
                    <span style="display: inline-block; width: 8px; height: 8px; background-color: #ffffff; border-radius: 50%; margin-right: 8px; vertical-align: middle;"></span>
                    Ticket Recebido
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- User Card -->
          <tr>
            <td style="background-color: #ffffff; padding: 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${plan.bg}; border-radius: 16px; border: 2px solid ${plan.border};">
                <!-- User Header -->
                <tr>
                  <td style="padding: 32px 32px 24px 32px; border-bottom: 2px solid ${plan.border};">
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="width: 56px; vertical-align: top;">
                          <table cellpadding="0" cellspacing="0" style="width: 56px; height: 56px; background-color: #7c3aed; border-radius: 14px;">
                            <tr>
                              <td style="text-align: center; vertical-align: middle; color: #ffffff; font-size: 24px; font-weight: 700; height: 56px;">
                                ${userInitials}
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td style="padding-left: 16px; vertical-align: top;">
                          <h3 style="margin: 0 0 4px 0; font-size: 20px; font-weight: 700; color: #1f2937;">${ticket.userName}</h3>
                          <p style="margin: 0; font-size: 14px; color: #4b5563;">${ticket.userEmail}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- User Info Grid -->
                <tr>
                  <td style="padding: 24px 32px 32px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding-right: 8px; padding-bottom: 16px; vertical-align: top;">
                          <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: ${plan.textColor};">Plano</p>
                          <table cellpadding="0" cellspacing="0" style="background-color: ${plan.badgeBg}; border-radius: 12px;">
                            <tr>
                              <td style="padding: 8px 16px; color: #ffffff; font-size: 12px; font-weight: 700; white-space: nowrap;">
                                ${plan.emoji} ${ticket.userPlan.toUpperCase()}
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td width="50%" style="padding-left: 8px; padding-bottom: 16px; vertical-align: top;">
                          <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: ${plan.textColor};">Prioridade</p>
                          <p style="margin: 0; font-size: 16px; font-weight: 700; color: ${ticket.priority === 'high' ? '#991b1b' : ticket.priority === 'medium' ? '#92400e' : '#065f46'};">
                            ${priorityEmoji} ${ticket.priority.toUpperCase()}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding-right: 8px; vertical-align: top;">
                          <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: ${plan.textColor};">Categoria</p>
                          <p style="margin: 0; font-size: 15px; font-weight: 600; color: #1f2937;">${categoryEmoji} ${ticket.category}</p>
                        </td>
                        <td width="50%" style="padding-left: 8px; vertical-align: top;">
                          <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: ${plan.textColor};">Data/Hora</p>
                          <p style="margin: 0; font-size: 13px; font-weight: 600; color: #1f2937;">${new Date(ticket.timestamp).toLocaleString('pt-BR')}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Subject Section -->
          <tr>
            <td style="background-color: #ffffff; padding: 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #7c3aed; border-radius: 16px;">
                <tr>
                  <td style="padding: 32px; text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #ffffff;">📋 Assunto</p>
                    <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; line-height: 1.4;">${ticket.subject}</h2>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Description Section -->
          <tr>
            <td style="background-color: #ffffff; padding: 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 2px solid #e5e7eb; border-radius: 16px;">
                <tr>
                  <td style="padding: 32px;">
                    <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #111827;">💬 Descrição Detalhada</h3>
                    <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #374151; white-space: pre-wrap;">${ticket.description}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${ticket.attachments && ticket.attachments.length > 0 ? `
          <!-- Attachments Section -->
          <tr>
            <td style="background-color: #ffffff; padding: 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-radius: 16px;">
                <tr>
                  <td style="padding: 32px;">
                    <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #1e40af;">📎 Anexos (${ticket.attachments.length})</h3>
                    ${ticket.attachments.map(att => `
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 2px solid #dbeafe; border-radius: 12px; margin-bottom: 12px;">
                        <tr>
                          <td style="padding: 16px; width: 40px; vertical-align: middle;">
                            <table cellpadding="0" cellspacing="0" style="width: 40px; height: 40px; background-color: #7c3aed; border-radius: 10px;">
                              <tr>
                                <td style="text-align: center; vertical-align: middle; font-size: 20px;">📄</td>
                              </tr>
                            </table>
                          </td>
                          <td style="padding: 16px 16px 16px 0; vertical-align: middle;">
                            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111827;">${att.name}</p>
                          </td>
                        </tr>
                      </table>
                    `).join('')}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Technical Info Section -->
          <tr>
            <td style="background-color: #ffffff; padding: 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #111827; border-radius: 16px;">
                <tr>
                  <td style="padding: 32px;">
                    <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #d1d5db;">🖥️ Informações Técnicas</h3>
                    <p style="margin: 0 0 8px 0; font-family: 'Courier New', monospace; font-size: 12px; color: #9ca3af;">
                      <span style="color: #e5e7eb; font-weight: 600;">User ID:</span> ${ticket.userId}
                    </p>
                    <p style="margin: 0 0 8px 0; font-family: 'Courier New', monospace; font-size: 12px; color: #9ca3af;">
                      <span style="color: #e5e7eb; font-weight: 600;">User Agent:</span> ${ticket.userAgent}
                    </p>
                    <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 12px; color: #9ca3af;">
                      <span style="color: #e5e7eb; font-weight: 600;">Timestamp:</span> ${ticket.timestamp}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 32px; text-align: center; border-top: 2px solid #e5e7eb; border-radius: 0 0 16px 16px;">
              <img src="https://myvigil.co/logo.png" alt="Vigil Logo" style="width: 48px; height: 48px; margin: 0 auto 12px; display: block; object-fit: contain;" />
              <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #111827;">Vigil Support System</p>
              <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">Este é um email automático do sistema de suporte.</p>
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Para responder, envie um email para <a href="mailto:suporte@myvigil.co" style="color: #7c3aed; font-weight: 600; text-decoration: none;">suporte@myvigil.co</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Preparar anexos para o Resend (formato correto)
    const attachments = ticket.attachments?.map(att => ({
      filename: att.name,
      content: att.content, // Base64 string (sem prefixo data:)
    })) || [];

    // Enviar email via Resend
    const emailBody: any = {
      from: 'suporte@myvigil.co', // Domínio personalizado do Vigil
      to: [ticket.userEmail], // Email do usuário que abriu o ticket
      subject: `[${ticket.userPlan.toUpperCase()}] ${priorityEmoji} ${ticket.subject} - #${ticketNumber}`,
      html: emailHtml,
    };

    // Adicionar anexos se houver
    if (attachments.length > 0) {
      emailBody.attachments = attachments;
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailBody),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      console.error('Erro ao enviar email:', error);
      throw new Error('Falha ao enviar email');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        ticketNumber,
        message: 'Ticket enviado com sucesso!' 
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
    console.error('Erro ao processar ticket:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro ao processar ticket' }),
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


import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const APP_URL = Deno.env.get('APP_URL') || 'https://vigil.app';

interface PasswordResetRequest {
  email: string;
  resetLink: string;
  userName?: string;
}

/**
 * Gera o HTML do email de recuperação de senha
 */
function generatePasswordResetEmailHtml(
  email: string,
  resetLink: string,
  userName?: string
): string {
  const displayName = userName || email.split('@')[0];
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperação de Senha - Vigil</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 32px; text-align: center; position: relative;">
              <div style="font-size: 64px; margin-bottom: 16px;">🔐</div>
              <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Recuperação de Senha</h1>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Vigil</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 48px 40px;">
              <p style="margin: 0 0 24px 0; font-size: 18px; line-height: 1.6; color: #1f2937;">
                Olá <strong style="color: #667eea;">${displayName}</strong>,
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.7; color: #4b5563;">
                Recebemos uma solicitação para redefinir a senha da sua conta no Vigil. Se você não fez essa solicitação, pode ignorar este email com segurança.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                      <tr>
                        <td align="center" style="padding: 18px 48px;">
                          <a href="${resetLink}" style="display: inline-block; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; letter-spacing: 0.3px;">
                            Redefinir Minha Senha
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Alternative Link -->
              <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
              </p>
              <p style="margin: 12px 0 0 0; font-size: 13px; line-height: 1.6; color: #667eea; word-break: break-all;">
                ${resetLink}
              </p>

              <!-- Security Notice -->
              <div style="margin-top: 32px; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
                <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #92400e;">
                  🔒 Segurança
                </p>
                <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #78350f;">
                  Este link expira em <strong>1 hora</strong>. Por segurança, não compartilhe este link com ninguém. A equipe do Vigil nunca solicitará sua senha por email.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 32px 40px; text-align: center; border-top: 2px solid #e5e7eb;">
              <div style="font-size: 32px; margin-bottom: 12px;">⚡</div>
              <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #111827;">Vigil</p>
              <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">
                A plataforma para compartilhar e discutir teorias
              </p>
              <p style="margin: 16px 0 0 0; font-size: 12px; color: #9ca3af;">
                Se você não solicitou esta recuperação de senha, pode ignorar este email com segurança.
              </p>
              
              <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding: 0 8px;">
                      <a href="${APP_URL}" style="color: #667eea; text-decoration: none; font-size: 13px; font-weight: 600;">Início</a>
                    </td>
                    <td align="center" style="padding: 0 8px;">
                      <a href="${APP_URL}/support" style="color: #667eea; text-decoration: none; font-size: 13px; font-weight: 600;">Suporte</a>
                    </td>
                    <td align="center" style="padding: 0 8px;">
                      <a href="${APP_URL}/privacy" style="color: #667eea; text-decoration: none; font-size: 13px; font-weight: 600;">Privacidade</a>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
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
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { email, resetLink, userName }: PasswordResetRequest = await req.json();

    if (!email || !resetLink) {
      return new Response(
        JSON.stringify({ error: 'Email e resetLink são obrigatórios' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Gerar HTML do email
    const emailHtml = generatePasswordResetEmailHtml(email, resetLink, userName);

    // Enviar email via Resend
    if (RESEND_API_KEY) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Vigil <noreply@vigil.app>',
          to: [email],
          subject: '🔐 Recuperação de Senha - Vigil',
          html: emailHtml,
        }),
      });

      if (!resendResponse.ok) {
        const error = await resendResponse.text();
        console.error('Erro ao enviar email via Resend:', error);
        throw new Error('Falha ao enviar email');
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Email enviado com sucesso' }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    } else {
      // Fallback: usar Supabase Auth para enviar email
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Nota: O Supabase Auth não permite customizar completamente o template,
      // mas podemos usar o método admin para enviar email customizado
      const { error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
          redirectTo: resetLink,
        },
      });

      if (error) {
        console.error('Erro ao gerar link de recuperação:', error);
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Link de recuperação gerado' }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  } catch (error) {
    console.error('Erro ao processar recuperação de senha:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro ao processar solicitação' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});


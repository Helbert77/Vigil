// @ts-nocheck
/**
 * IMPORTANTE: Esta função está configurada para modo de TESTE do Resend.
 * 
 * LIMITAÇÃO ATUAL:
 * - Resend em modo de teste só permite enviar emails para: suporte@myvigil.co
 * - Todos os emails serão enviados para este endereço até que um domínio seja verificado
 * 
 * PARA PRODUÇÃO:
 * 1. Acesse: https://resend.com/domains
 * 2. Adicione e verifique seu domínio (ex: myvigil.co)
 * 3. Altere o 'from' de 'onboarding@resend.dev' para 'noreply@myvigil.co'
 * 4. Remova a variável 'testEmail' e use 'email' diretamente no 'to'
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para gerar HTML do email de confirmação de assinatura
function generateSubscriptionEmail(
  userName: string,
  plan: string,
  type: 'new' | 'upgrade' | 'trial',
  amount?: number,
  trialDays?: number,
  nextBillingDate?: string
): string {
  const formattedDate = nextBillingDate 
    ? new Date(nextBillingDate).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    : '';

  const planNames: Record<string, string> = {
    basic: 'Basic',
    pro: 'Pro',
    premium: 'Premium'
  };

  const planColors: Record<string, { bg: string; badge: string; border: string }> = {
    basic: { bg: '#d1fae5', badge: '#10b981', border: '#10b981' },
    pro: { bg: '#fef3c7', badge: '#f59e0b', border: '#f59e0b' },
    premium: { bg: '#fee2e2', badge: '#dc2626', border: '#dc2626' }
  };

  const planName = planNames[plan] || plan.toUpperCase();
  const colors = planColors[plan] || planColors.basic;

  const titles = {
    new: '🎉 Bem-vindo ao Vigil Premium!',
    upgrade: '🚀 Upgrade Realizado com Sucesso!',
    trial: '🎁 Período de Teste Ativado!'
  };

  const subtitles = {
    new: 'Sua assinatura foi confirmada',
    upgrade: 'Seu plano foi atualizado',
    trial: 'Aproveite todos os recursos gratuitamente'
  };

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titles[type]} - Vigil</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 32px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 16px;">${type === 'trial' ? '🎁' : type === 'upgrade' ? '🚀' : '🎉'}</div>
              <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">${titles[type]}</h1>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">${subtitles[type]}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 48px 40px;">
              <p style="margin: 0 0 24px 0; font-size: 18px; line-height: 1.6; color: #1f2937;">
                Olá <strong style="color: #667eea;">${userName}</strong>,
              </p>
              
              <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.7; color: #4b5563;">
                ${type === 'trial' 
                  ? `Parabéns! Seu período de teste de <strong>${trialDays} dias</strong> foi ativado com sucesso. Você tem acesso completo a todos os recursos do plano <strong>${planName}</strong> gratuitamente até <strong>${formattedDate}</strong>.`
                  : type === 'upgrade'
                  ? `Seu plano foi atualizado para <strong>${planName}</strong> com sucesso! Agora você tem acesso a recursos ainda mais poderosos.`
                  : `Sua assinatura do plano <strong>${planName}</strong> foi confirmada! Agora você tem acesso completo a todos os recursos premium.`
                }
              </p>

              <!-- Plan Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${colors.bg}; border: 2px solid ${colors.border}; border-radius: 16px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 16px;">
                          <table cellpadding="0" cellspacing="0" style="background-color: ${colors.badge}; border-radius: 12px;">
                            <tr>
                              <td style="padding: 10px 20px; color: #ffffff; font-size: 18px; font-weight: 700;">
                                ${planName}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      ${amount ? `
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <p style="margin: 0; font-size: 14px; color: #6b7280;">Valor</p>
                          <p style="margin: 4px 0 0 0; font-size: 24px; font-weight: 700; color: #1f2937;">R$ ${(amount / 100).toFixed(2)}/mês</p>
                        </td>
                      </tr>
                      ` : ''}
                      ${nextBillingDate ? `
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 14px; color: #6b7280;">${type === 'trial' ? 'Período de teste até' : 'Próxima cobrança'}</p>
                          <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 600; color: #1f2937;">${formattedDate}</p>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Features -->
              <div style="margin-bottom: 32px;">
                <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #111827;">✨ O que você pode fazer agora:</h2>
                <table width="100%" cellpadding="0" cellspacing="0">
                  ${plan === 'premium' ? `
                  <tr>
                    <td style="padding: 12px 0;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top;">
                            <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 6px; text-align: center; line-height: 24px; font-size: 14px;">✓</div>
                          </td>
                          <td style="padding-left: 12px;">
                            <p style="margin: 0; font-size: 15px; font-weight: 600; color: #1f2937;">Criar posts ilimitados</p>
                            <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">Sem limites de publicações</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top;">
                            <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 6px; text-align: center; line-height: 24px; font-size: 14px;">✓</div>
                          </td>
                          <td style="padding-left: 12px;">
                            <p style="margin: 0; font-size: 15px; font-weight: 600; color: #1f2937;">Badge Premium exclusivo</p>
                            <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">Destaque-se na comunidade</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top;">
                            <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 6px; text-align: center; line-height: 24px; font-size: 14px;">✓</div>
                          </td>
                          <td style="padding-left: 12px;">
                            <p style="margin: 0; font-size: 15px; font-weight: 600; color: #1f2937;">Suporte prioritário</p>
                            <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">Atendimento VIP</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top;">
                            <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 6px; text-align: center; line-height: 24px; font-size: 14px;">✓</div>
                          </td>
                          <td style="padding-left: 12px;">
                            <p style="margin: 0; font-size: 15px; font-weight: 600; color: #1f2937;">Acesso antecipado a novos recursos</p>
                            <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">Seja o primeiro a testar</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  ` : plan === 'pro' ? `
                  <tr>
                    <td style="padding: 12px 0;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top;">
                            <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 6px; text-align: center; line-height: 24px; font-size: 14px;">✓</div>
                          </td>
                          <td style="padding-left: 12px;">
                            <p style="margin: 0; font-size: 15px; font-weight: 600; color: #1f2937;">Até 50 posts por mês</p>
                            <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">Mais espaço para compartilhar</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top;">
                            <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 6px; text-align: center; line-height: 24px; font-size: 14px;">✓</div>
                          </td>
                          <td style="padding-left: 12px;">
                            <p style="margin: 0; font-size: 15px; font-weight: 600; color: #1f2937;">Badge Pro</p>
                            <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">Mostre seu status</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top;">
                            <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 6px; text-align: center; line-height: 24px; font-size: 14px;">✓</div>
                          </td>
                          <td style="padding-left: 12px;">
                            <p style="margin: 0; font-size: 15px; font-weight: 600; color: #1f2937;">Análises avançadas</p>
                            <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">Acompanhe seu desempenho</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  ` : `
                  <tr>
                    <td style="padding: 12px 0;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top;">
                            <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 6px; text-align: center; line-height: 24px; font-size: 14px;">✓</div>
                          </td>
                          <td style="padding-left: 12px;">
                            <p style="margin: 0; font-size: 15px; font-weight: 600; color: #1f2937;">Até 10 posts por mês</p>
                            <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">Comece a compartilhar suas ideias</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top;">
                            <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 6px; text-align: center; line-height: 24px; font-size: 14px;">✓</div>
                          </td>
                          <td style="padding-left: 12px;">
                            <p style="margin: 0; font-size: 15px; font-weight: 600; color: #1f2937;">Sem anúncios</p>
                            <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">Experiência limpa</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  `}
                </table>
              </div>

              ${type === 'trial' ? `
              <!-- Trial Notice -->
              <div style="padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; margin-bottom: 32px;">
                <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #92400e;">
                  ⏰ Lembre-se
                </p>
                <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #78350f;">
                  Seu período de teste termina em <strong>${formattedDate}</strong>. Após essa data, você será cobrado automaticamente. Você pode cancelar a qualquer momento antes do término do período de teste.
                </p>
              </div>
              ` : ''}

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                      <tr>
                        <td align="center" style="padding: 18px 48px;">
                          <a href="${supabaseUrl.replace('.supabase.co', '')}" style="display: inline-block; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; letter-spacing: 0.3px;">
                            Começar a Usar
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #6b7280; text-align: center;">
                Tem dúvidas? Nossa equipe de suporte está sempre disponível para ajudar.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 32px 40px; text-align: center; border-top: 2px solid #e5e7eb;">
              <div style="font-size: 32px; margin-bottom: 12px;">🛡️</div>
              <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #111827;">Vigil</p>
              <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">
                Plataforma de Comunidade e Engajamento
              </p>
              <p style="margin: 16px 0 0 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} Vigil. Todos os direitos reservados.
              </p>
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

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-subscription-email/index.ts:339',message:'FUNCTION ENTRY',data:{hasBody:!!req.body},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    const { userId, userName, userEmail, plan, type, amount, trialDays, nextBillingDate } = await req.json();

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-subscription-email/index.ts:346',message:'AFTER parsing request body',data:{userId,userEmail:userEmail||null,plan,type,userEmailType:typeof userEmail,userEmailLength:userEmail?.length||0,hasRequiredParams:!!userId&&!!userEmail&&!!plan&&!!type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    if (!userId || !plan || !type) {
      throw new Error('Missing required parameters: userId, plan, or type');
    }

    // Garantir que temos o email do usuário
    let email = userEmail && typeof userEmail === 'string' && userEmail.trim() ? userEmail.trim() : null;
    
    if (!email) {
      // Tentar buscar email do auth.users
      console.log(`[send-subscription-email] Email not provided, fetching from auth.users for userId: ${userId}`);
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-subscription-email/index.ts:365',message:'AFTER getUserById fallback',data:{authError:authError?JSON.stringify(authError):null,authUserExists:!!authUser,userExists:!!authUser?.user,foundEmail:authUser?.user?.email||null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

      if (authError) {
        console.error('[send-subscription-email] Error fetching user from auth:', authError);
        throw new Error(`Failed to fetch user email: ${authError.message}`);
      }
      
      email = authUser?.user?.email;
      
      if (!email || typeof email !== 'string' || !email.trim()) {
        console.error(`[send-subscription-email] User email not found for userId: ${userId}`);
        throw new Error(`User email not found for userId: ${userId}`);
      }
      
      email = email.trim();
    }

    console.log(`[send-subscription-email] Sending ${type} email to ${email} for plan ${plan}`);

    // Gerar HTML do email
    const htmlContent = generateSubscriptionEmail(userName, plan, type, amount, trialDays, nextBillingDate);

    // Enviar email via Resend
    if (!RESEND_API_KEY) {
      console.error('[send-subscription-email] RESEND_API_KEY not configured');
      throw new Error('Email service not configured');
    }

    const subjectMap = {
      new: '🎉 Bem-vindo ao Vigil Premium!',
      upgrade: '🚀 Upgrade Realizado com Sucesso!',
      trial: '🎁 Período de Teste Ativado!'
    };

    // IMPORTANTE: Resend em modo de teste só permite enviar para suporte@myvigil.co
    // Para produção, verifique um domínio em resend.com/domains
    const testEmail = 'suporte@myvigil.co';
    const finalEmail = email.includes('@') ? email : testEmail;
    
    console.log(`[send-subscription-email] Original email: ${email}, Final email: ${finalEmail}`);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-subscription-email/index.ts:380',message:'BEFORE Resend API call',data:{originalEmail:email,finalEmail,type,hasResendKey:!!RESEND_API_KEY,resendKeyLength:RESEND_API_KEY?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Vigil <suporte@myvigil.co>',
        to: [testEmail], // Usando email de teste até verificar domínio
        subject: `[TESTE - ${finalEmail}] ${subjectMap[type] || '✨ Atualização de Assinatura - Vigil'}`,
        html: htmlContent,
      }),
    });

    // #region agent log
    const resendStatus = resendResponse.status;
    const resendOk = resendResponse.ok;
    fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-subscription-email/index.ts:398',message:'AFTER Resend API call',data:{status:resendStatus,ok:resendOk},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error('[send-subscription-email] Resend API error:', {
        status: resendResponse.status,
        statusText: resendResponse.statusText,
        error: errorText,
        email: email,
        type: type,
        hasHtml: !!htmlContent,
        htmlLength: htmlContent?.length || 0
      });
      throw new Error(`Failed to send email via Resend: ${resendResponse.status} - ${errorText}`);
    }

    const resendData = await resendResponse.json();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-subscription-email/index.ts:409',message:'Resend API SUCCESS',data:{resendId:resendData.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    console.log(`[send-subscription-email] Email sent successfully via Resend. ID: ${resendData.id}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('[send-subscription-email] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});


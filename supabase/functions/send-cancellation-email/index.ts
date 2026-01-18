// @ts-nocheck
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

// Função para gerar HTML do email
function generateCancellationEmail(
  userName: string,
  plan: string,
  activeUntil: string,
  reason?: string
): string {
  const formattedDate = new Date(activeUntil).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const planNames: Record<string, string> = {
    basic: 'Basic',
    pro: 'Pro',
    premium: 'Premium'
  };

  const planName = planNames[plan] || plan.toUpperCase();

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assinatura Cancelada - Vigil</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #f0f0f0;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #6366f1;
      margin-bottom: 10px;
    }
    .title {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 10px;
    }
    .subtitle {
      font-size: 16px;
      color: #6b7280;
    }
    .content {
      margin: 30px 0;
    }
    .info-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-box-title {
      font-weight: bold;
      color: #92400e;
      margin-bottom: 10px;
      font-size: 16px;
    }
    .info-box-text {
      color: #78350f;
      font-size: 14px;
      line-height: 1.6;
    }
    .details {
      background-color: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 600;
      color: #4b5563;
    }
    .detail-value {
      color: #1f2937;
      font-weight: 500;
    }
    .plan-badge {
      display: inline-block;
      padding: 4px 12px;
      background-color: #6366f1;
      color: white;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
    }
    .section {
      margin: 30px 0;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 15px;
    }
    .list {
      list-style: none;
      padding: 0;
    }
    .list li {
      padding: 8px 0;
      padding-left: 25px;
      position: relative;
    }
    .list li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #10b981;
      font-weight: bold;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #6366f1;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #4f46e5;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #f0f0f0;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    .highlight {
      background-color: #fef3c7;
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🛡️ Vigil</div>
      <div class="title">Assinatura Cancelada</div>
      <div class="subtitle">Confirmação de Cancelamento</div>
    </div>

    <div class="content">
      <p>Olá, <strong>${userName}</strong>!</p>
      
      <p>Confirmamos o cancelamento da sua assinatura <span class="plan-badge">${planName}</span> na plataforma Vigil.</p>

      <div class="info-box">
        <div class="info-box-title">⏰ Importante: Sua assinatura ainda está ativa!</div>
        <div class="info-box-text">
          Você continuará tendo acesso a todos os recursos do plano <strong>${planName}</strong> até <strong>${formattedDate}</strong>. 
          Após essa data, seu plano será automaticamente alterado para <strong>FREE</strong>.
        </div>
      </div>

      <div class="details">
        <div class="detail-row">
          <span class="detail-label">Plano Cancelado:</span>
          <span class="detail-value">${planName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ativo até:</span>
          <span class="detail-value">${formattedDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="detail-value">Cancelamento Agendado</span>
        </div>
        ${reason ? `
        <div class="detail-row">
          <span class="detail-label">Motivo:</span>
          <span class="detail-value">${reason}</span>
        </div>
        ` : ''}
      </div>

      <div class="section">
        <div class="section-title">📋 O que acontece agora?</div>
        <ul class="list">
          <li>Você continua usando todos os recursos do plano ${planName} até ${formattedDate}</li>
          <li>Não haverá nenhuma cobrança futura</li>
          <li>Seus dados e conteúdo serão preservados</li>
          <li>Você pode reativar sua assinatura a qualquer momento antes de ${formattedDate}</li>
          <li>Após ${formattedDate}, seu plano será alterado para FREE automaticamente</li>
        </ul>
      </div>

      <div class="section">
        <div class="section-title">🔄 Mudou de ideia?</div>
        <p>Você pode reativar sua assinatura a qualquer momento antes de <span class="highlight">${formattedDate}</span>. Basta acessar a página Premium e clicar em "Reativar Assinatura".</p>
        <center>
          <a href="${supabaseUrl.replace('.supabase.co', '')}/premium" class="button">
            Reativar Assinatura
          </a>
        </center>
      </div>

      <div class="section">
        <div class="section-title">💬 Feedback</div>
        <p>Lamentamos ver você partir! Seu feedback é muito importante para nós. Se você tiver alguns minutos, adoraríamos saber o que podemos melhorar.</p>
      </div>

      <p style="margin-top: 30px;">Se você tiver alguma dúvida ou precisar de ajuda, nossa equipe de suporte está sempre disponível.</p>
      
      <p>Obrigado por ter feito parte do Vigil! 💙</p>
    </div>

    <div class="footer">
      <p><strong>Vigil</strong> - Plataforma de Comunidade e Engajamento</p>
      <p>Este é um email automático. Por favor, não responda.</p>
      <p style="margin-top: 10px; font-size: 12px;">
        © ${new Date().getFullYear()} Vigil. Todos os direitos reservados.
      </p>
    </div>
  </div>
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
    fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-cancellation-email/index.ts:277',message:'FUNCTION ENTRY',data:{hasBody:!!req.body},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    const { userId, userName, userEmail, plan, activeUntil, reason } = await req.json();

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-cancellation-email/index.ts:284',message:'AFTER parsing request body',data:{userId,userEmail:userEmail||null,plan,userEmailType:typeof userEmail,userEmailLength:userEmail?.length||0,hasRequiredParams:!!userId&&!!userEmail},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    if (!userId) {
      throw new Error('Missing userId parameter');
    }

    // Garantir que temos o email do usuário
    let email = userEmail && typeof userEmail === 'string' && userEmail.trim() ? userEmail.trim() : null;
    
    if (!email) {
      // Tentar buscar email do auth.users
      console.log(`[send-cancellation-email] Email not provided, fetching from auth.users for userId: ${userId}`);
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-cancellation-email/index.ts:303',message:'AFTER getUserById fallback',data:{authError:authError?JSON.stringify(authError):null,authUserExists:!!authUser,userExists:!!authUser?.user,foundEmail:authUser?.user?.email||null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      if (authError) {
        console.error('[send-cancellation-email] Error fetching user from auth:', authError);
        throw new Error(`Failed to fetch user email: ${authError.message}`);
      }
      
      email = authUser?.user?.email;
      
      if (!email || typeof email !== 'string' || !email.trim()) {
        console.error(`[send-cancellation-email] User email not found for userId: ${userId}`);
        throw new Error(`User email not found for userId: ${userId}`);
      }
      
      email = email.trim();
    }

    console.log(`[send-cancellation-email] Sending email to ${email}`);

    // Gerar HTML do email
    const htmlContent = generateCancellationEmail(userName, plan, activeUntil, reason);

    console.log(`[send-cancellation-email] Sending email to ${email}`);

    // Enviar email via Resend
    if (!RESEND_API_KEY) {
      console.error('[send-cancellation-email] RESEND_API_KEY not configured');
      throw new Error('Email service not configured');
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-cancellation-email/index.ts:314',message:'BEFORE Resend API call',data:{email,hasResendKey:!!RESEND_API_KEY,resendKeyLength:RESEND_API_KEY?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Vigil <suporte@myvigil.co>',
        to: [email],
        subject: '🔔 Assinatura Cancelada - Vigil',
        html: htmlContent,
      }),
    });

    // #region agent log
    const resendStatus = resendResponse.status;
    const resendOk = resendResponse.ok;
    fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-cancellation-email/index.ts:332',message:'AFTER Resend API call',data:{status:resendStatus,ok:resendOk},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-cancellation-email/index.ts:336',message:'Resend API ERROR',data:{error,status:resendStatus},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      console.error('[send-cancellation-email] Resend API error:', error);
      throw new Error('Failed to send email via Resend');
    }

    const resendData = await resendResponse.json();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3b6491f1-b93e-48e8-9da7-4667e4860f71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'send-cancellation-email/index.ts:344',message:'Resend API SUCCESS',data:{resendId:resendData.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    console.log(`[send-cancellation-email] Email sent successfully via Resend. ID: ${resendData.id}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('[send-cancellation-email] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});


# Guia: Personalizar Template de Email de Recuperação de Senha

Este guia explica como personalizar o template de email de recuperação de senha do Supabase para usar o design do Vigil.

## Opção 1: Configurar no Dashboard do Supabase (Recomendado)

### Passo 1: Acessar Configurações de Email

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto Vigil
3. Vá em: **Authentication** > **Email Templates**
4. Clique em **Password Reset** (Recuperação de Senha)

### Passo 2: Personalizar o Template

O Supabase usa variáveis Go templates. Use o seguinte template HTML:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 32px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 16px;">🔐</div>
              <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 32px; font-weight: 700;">Recuperação de Senha</h1>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Vigil</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 48px 40px;">
              <p style="margin: 0 0 24px 0; font-size: 18px; line-height: 1.6; color: #1f2937;">
                Olá,
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
                          <a href="{{ .ConfirmationURL }}" style="display: inline-block; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
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
                {{ .ConfirmationURL }}
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
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### Passo 3: Variáveis Disponíveis

O Supabase fornece estas variáveis no template:

- `{{ .ConfirmationURL }}` - URL completa para redefinir a senha
- `{{ .Token }}` - Token de confirmação (se necessário)
- `{{ .TokenHash }}` - Hash do token
- `{{ .SiteURL }}` - URL do site configurada
- `{{ .Email }}` - Email do usuário
- `{{ .RedirectTo }}` - URL de redirecionamento após confirmação

### Passo 4: Salvar e Testar

1. Cole o template HTML acima no campo **HTML**
2. Opcionalmente, configure também o template de texto simples
3. Clique em **Save** (Salvar)
4. Teste enviando um email de recuperação de senha

## Opção 2: Usar Edge Function (Alternativa)

Se preferir usar uma Edge Function para mais controle:

1. Faça deploy da função `send-password-reset-email`:
   ```bash
   supabase functions deploy send-password-reset-email
   ```

2. Configure a variável de ambiente `RESEND_API_KEY` no Supabase (se usar Resend)

3. Modifique o código de recuperação de senha para chamar a função após `resetPasswordForEmail`

## Variáveis de Ambiente Necessárias

- `RESEND_API_KEY` (opcional) - Chave da API Resend para envio de emails
- `APP_URL` (opcional) - URL base do aplicativo para links no footer

## Notas Importantes

- O template usa variáveis Go (`{{ .ConfirmationURL }}`)
- Mantenha o estilo inline para compatibilidade com clientes de email
- Teste em diferentes clientes de email (Gmail, Outlook, etc.)
- O link expira em 1 hora por padrão no Supabase

## Troubleshooting

- **Template não aparece**: Verifique se salvou corretamente no dashboard
- **Link não funciona**: Certifique-se de que `{{ .ConfirmationURL }}` está correto
- **Estilos não aparecem**: Use apenas CSS inline (não CSS externo)


# Edge Function: Send Password Reset Email

Esta Edge Function permite enviar emails personalizados de recuperação de senha usando o design do Vigil.

## ⚠️ IMPORTANTE: Método Recomendado

**A forma mais simples é configurar o template diretamente no Dashboard do Supabase:**

1. Acesse: https://supabase.com/dashboard
2. Vá em: **Authentication** > **Email Templates** > **Password Reset**
3. Cole o conteúdo do arquivo `password-reset-template.html` (substituindo as variáveis Go)
4. Salve

Isso substituirá automaticamente o template padrão do Supabase.

## Uso da Edge Function (Alternativa)

Se preferir usar esta Edge Function:

### Deploy

```bash
supabase functions deploy send-password-reset-email
```

### Variáveis de Ambiente

Configure no Supabase Dashboard > Edge Functions > Secrets:

- `RESEND_API_KEY` (opcional) - Se usar Resend para envio
- `APP_URL` (opcional) - URL base do app

### Chamada

```typescript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/send-password-reset-email`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      email: 'usuario@exemplo.com',
      resetLink: 'https://seuapp.com/update-password?token=...',
      userName: 'Nome do Usuário' // opcional
    }),
  }
);
```

## Template HTML

O template está em `password-reset-template.html` e usa variáveis Go do Supabase:
- `{{ .ConfirmationURL }}` - Link de confirmação
- `{{ .Email }}` - Email do usuário


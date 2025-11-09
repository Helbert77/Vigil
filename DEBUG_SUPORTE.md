# 🔍 Debug do Sistema de Suporte - Erro 500

## Checklist de Verificação

### ✅ 1. Tabela `support_tickets` existe?

Execute no SQL Editor do Supabase:
```sql
SELECT * FROM public.support_tickets LIMIT 1;
```

**Se der erro "relation does not exist":**
- ❌ Tabela não foi criada
- ✅ Execute o arquivo `CRIAR_TABELA_SUPPORT.sql`

---

### ✅ 2. Secret `RESEND_API_KEY` está configurada?

**Via Dashboard:**
1. Vá para: https://supabase.com/dashboard/project/oprqgllsqtfdyjgvgovo/settings/functions
2. Procure por "Secrets" ou "Environment Variables"
3. Verifique se existe: `RESEND_API_KEY`

**Se não existir:**
```
Name:  RESEND_API_KEY
Value: re_sua_key_do_resend
```

---

### ✅ 3. Edge Function está deployada?

**Via Dashboard:**
1. Vá para: https://supabase.com/dashboard/project/oprqgllsqtfdyjgvgovo/functions
2. Verifique se `send-support-email` aparece
3. Status deve ser: ✅ Deployed

---

### ✅ 4. Domínio verificado no Resend?

**Via Resend Dashboard:**
1. Vá para: https://resend.com/domains
2. Verifique se tem algum domínio verificado
3. **OU** use o domínio de teste: `onboarding@resend.dev`

---

## 🐛 Erros Comuns e Soluções

### Erro: "relation support_tickets does not exist"
**Causa:** Tabela não foi criada
**Solução:** Execute `CRIAR_TABELA_SUPPORT.sql` no SQL Editor

### Erro: "RESEND_API_KEY is undefined"
**Causa:** Secret não configurada
**Solução:** Adicione a secret no dashboard

### Erro: "Domain not verified"
**Causa:** Domínio não verificado no Resend
**Solução:** Use domínio de teste ou verifique seu domínio

### Erro: "Invalid API key"
**Causa:** API Key incorreta ou expirada
**Solução:** Gere nova API Key no Resend

---

## 🧪 Teste Simplificado

Vamos testar a Edge Function diretamente via curl:

```bash
curl -X POST \
  https://oprqgllsqtfdyjgvgovo.supabase.co/functions/v1/send-support-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SUA_ANON_KEY" \
  -d '{
    "userId": "test-user-id",
    "userEmail": "teste@example.com",
    "userName": "Teste",
    "userPlan": "pro",
    "category": "technical",
    "subject": "Teste",
    "description": "Teste de funcionamento",
    "priority": "high",
    "userAgent": "Test",
    "timestamp": "2025-01-01T00:00:00Z"
  }'
```

**Substitua `SUA_ANON_KEY` pela sua chave:**
- Encontre em: https://supabase.com/dashboard/project/oprqgllsqtfdyjgvgovo/settings/api

---

## 📋 Informações Necessárias

Para eu te ajudar melhor, me envie:

1. **Log da Edge Function** (copie o erro completo dos logs)
2. **Resultado do teste SQL** (a tabela existe?)
3. **Screenshot das Secrets** (RESEND_API_KEY está lá?)
4. **Status do domínio no Resend** (verificado ou usando teste?)


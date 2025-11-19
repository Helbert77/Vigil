# ✅ Correções Implementadas - Sistema de Anúncios

## 📋 Resumo das Correções

### 1. ✅ Rota AdApprovalQueue Adicionada
- **Arquivo**: `App.tsx`
- **Mudanças**:
  - Importado `AdApprovalQueue` component
  - Adicionado case `'AdApprovalQueue'` no switch
  - Renderiza página para moderadores/admins

- **Arquivo**: `src/utils/history.ts`
- **Mudanças**:
  - Adicionado tipo `'AdApprovalQueue'` ao tipo `Page`
  - Adicionada rota `/ad-approval-queue` no `buildPathFromSnapshot`
  - Adicionado mapeamento estático `/ad-approval-queue` → `'AdApprovalQueue'`

**Resultado**: Moderadores/admins agora podem acessar `/ad-approval-queue` ou navegar via `handleNavigation('AdApprovalQueue')`

---

### 2. ✅ Bugs Corrigidos no AdApprovalQueue.tsx
- **Arquivo**: `pages/admin/AdApprovalQueue.tsx`
- **Problema**: Buscava `approval_status: 'pending'` e `payment_status: 'completed'` (valores incorretos)
- **Correção**: 
  - Alterado para `approval_status: 'pending_approval'` ✅
  - Alterado para `payment_status: 'paid'` ✅

**Resultado**: A fila de aprovação agora busca corretamente os anúncios que precisam de aprovação

---

### 3. ✅ Notificações Implementadas no Webhook do Stripe
- **Arquivo**: `supabase/functions/stripe-webhook/index.ts`
- **Mudanças**:
  - Após pagamento de pacote (`package`): Envia notificações para todos os moderadores/admins
  - Após pagamento CPM: Envia notificações para todos os moderadores/admins
  - Tipo de notificação: `'ad_approval_pending'`
  - Metadata inclui `ad_id` para referência

**Código adicionado**:
```typescript
// Enviar notificações para moderadores/admins sobre novo anúncio pendente
const { data: moderators } = await supabase
  .from('profiles')
  .select('id')
  .in('role', ['admin', 'moderator']);

if (moderators && moderators.length > 0) {
  const notifications = moderators.map(mod => ({
    recipient_id: mod.id,
    actor_id: userIdFromMeta,
    type: 'ad_approval_pending',
    metadata: { ad_id: adId }
  }));
  
  await supabase.from('notifications').insert(notifications);
}
```

**Resultado**: Quando um anúncio é pago, todos os moderadores/admins recebem notificação

---

### 4. ✅ Notificações para Anunciante Implementadas
- **Arquivo**: `src/services/adApprovalService.ts`
- **Mudanças**:
  - `approveAd()`: Envia notificação tipo `'ad_approved'` para o anunciante
  - `rejectAd()`: Envia notificação tipo `'ad_rejected'` para o anunciante
  - Metadata inclui `ad_id`, `ad_title` e `rejection_reason` (quando rejeitado)

**Código adicionado**:
```typescript
// Em approveAd():
await supabase.from('notifications').insert({
  recipient_id: data.advertiser_id,
  actor_id: adminId,
  type: 'ad_approved',
  metadata: { ad_id: adId, ad_title: data.title }
});

// Em rejectAd():
await supabase.from('notifications').insert({
  recipient_id: ad.advertiser_id,
  actor_id: adminId,
  type: 'ad_rejected',
  metadata: { ad_id: adId, ad_title: ad.title, rejection_reason: reason }
});
```

**Resultado**: Anunciantes são notificados quando seus anúncios são aprovados ou rejeitados

---

### 5. ✅ Campo URL Link Tornado Opcional
- **Arquivo**: `components/advertising/CreateAdModal.tsx`
- **Mudanças**:
  - Removido fallback `'https://vigil.app'`
  - Campo agora pode ser `null` se vazio
  - Label já indicava como opcional, agora código reflete isso

**Antes**:
```typescript
const linkUrl = formData.link_url.trim() || 'https://vigil.app';
```

**Depois**:
```typescript
const linkUrl = formData.link_url.trim() || null;
```

**Resultado**: Anúncios podem ser criados sem link URL (útil para testes)

**⚠️ IMPORTANTE**: Verifique se a coluna `link_url` na tabela `anuncios` permite `NULL`. Se não permitir, execute:
```sql
ALTER TABLE anuncios ALTER COLUMN link_url DROP NOT NULL;
```

---

## 📊 Fluxo Completo Atualizado

```
1. USUÁRIO CRIA ANÚNCIO ✅
   ├─ Preenche formulário (link URL opcional)
   ├─ Anúncio criado com approval_status: 'pending_approval'
   └─ Redireciona para SelectAdPlan

2. USUÁRIO SELECIONA PLANO ✅
   └─ Redireciona para Stripe Checkout

3. PAGAMENTO NO STRIPE ✅
   └─ Stripe envia webhook

4. WEBHOOK PROCESSA PAGAMENTO ✅
   ├─ Atualiza payment_status: 'paid'
   ├─ Mantém approval_status: 'pending_approval'
   └─ ✅ ENVIA NOTIFICAÇÕES PARA MODERADORES/ADMINS

5. MODERADOR/ADMIN RECEBE NOTIFICAÇÃO ✅
   ├─ ✅ Notificação tipo 'ad_approval_pending'
   └─ ✅ Pode acessar /ad-approval-queue

6. MODERADOR/ADMIN APROVA/REJEITA ✅
   ├─ ✅ Busca correta (pending_approval + paid)
   ├─ Aprova ou rejeita
   └─ ✅ ENVIA NOTIFICAÇÃO PARA ANUNCIANTE

7. ANUNCIANTE RECEBE NOTIFICAÇÃO ✅
   ├─ ✅ 'ad_approved' se aprovado
   └─ ✅ 'ad_rejected' se rejeitado (com motivo)
```

---

## 🎯 Tipos de Notificações Criadas

1. **`ad_approval_pending`**
   - Enviada para: Moderadores/Admins
   - Quando: Anúncio pago precisa de aprovação
   - Metadata: `{ ad_id: string }`

2. **`ad_approved`**
   - Enviada para: Anunciante
   - Quando: Anúncio é aprovado
   - Metadata: `{ ad_id: string, ad_title: string }`

3. **`ad_rejected`**
   - Enviada para: Anunciante
   - Quando: Anúncio é rejeitado
   - Metadata: `{ ad_id: string, ad_title: string, rejection_reason: string }`

---

## ⚠️ Ações Necessárias

### 1. Verificar Permissão NULL no Banco de Dados
Execute no SQL Editor do Supabase:
```sql
-- Verificar se link_url permite NULL
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'anuncios' AND column_name = 'link_url';

-- Se is_nullable = 'NO', executar:
ALTER TABLE anuncios ALTER COLUMN link_url DROP NOT NULL;
```

### 2. Adicionar Link no Menu de Admin/Moderador
Adicione um link para `AdApprovalQueue` no menu lateral ou header para facilitar acesso:
```typescript
// Exemplo no Sidebar ou Header
{user.role === 'admin' || user.role === 'moderator' ? (
  <button onClick={() => handleNavigation('AdApprovalQueue')}>
    Aprovar Anúncios
  </button>
) : null}
```

### 3. Testar Notificações
- Criar anúncio e fazer pagamento
- Verificar se moderadores/admins recebem notificação
- Aprovar/rejeitar anúncio
- Verificar se anunciante recebe notificação

---

## ✅ Checklist de Implementação

- [x] Rota AdApprovalQueue adicionada no App.tsx
- [x] Rota adicionada no history.ts
- [x] Bugs corrigidos no AdApprovalQueue.tsx (pending_approval + paid)
- [x] Notificações implementadas no webhook do Stripe
- [x] Notificações para anunciante implementadas (aprovação/rejeição)
- [x] Campo URL link tornado opcional no código
- [ ] Verificar se coluna link_url permite NULL no banco
- [ ] Adicionar link no menu de admin/moderador
- [ ] Testar fluxo completo

---

## 📝 Arquivos Modificados

1. `App.tsx` - Adicionada rota AdApprovalQueue
2. `src/utils/history.ts` - Adicionado tipo e rota AdApprovalQueue
3. `pages/admin/AdApprovalQueue.tsx` - Corrigidos valores de busca
4. `supabase/functions/stripe-webhook/index.ts` - Notificações para moderadores
5. `src/services/adApprovalService.ts` - Notificações para anunciante
6. `components/advertising/CreateAdModal.tsx` - Campo URL opcional

---

## 🎉 Resultado Final

O sistema de criação de anúncios agora está completo com:
- ✅ Aprovação obrigatória antes de publicação
- ✅ Notificações para moderadores/admins quando há anúncios pendentes
- ✅ Notificações para anunciantes quando anúncios são aprovados/rejeitados
- ✅ Campo URL opcional para facilitar testes
- ✅ Rota acessível para moderadores/admins aprovarem anúncios


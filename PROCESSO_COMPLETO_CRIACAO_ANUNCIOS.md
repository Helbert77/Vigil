# 📋 Processo Completo de Criação de Anúncios - Análise Detalhada

## ✅ O QUE JÁ ESTÁ FUNCIONANDO

### 1. **Criação do Anúncio** (`CreateAdModal.tsx`)
- ✅ Usuário preenche formulário (título, descrição, mídia, link URL)
- ✅ Anúncio é criado com `approval_status: 'pending_approval'`
- ✅ `payment_status: 'pending'` inicialmente
- ✅ `payment_type: 'free'` inicialmente
- ✅ Redirecionamento para `SelectAdPlan` funciona (SPA sem reload)

### 2. **Seleção de Plano** (`SelectAdPlan.tsx`)
- ✅ Usuário escolhe entre pacotes ou CPM
- ✅ Redirecionamento para Stripe Checkout funciona
- ✅ `ad_id` é passado corretamente via metadata

### 3. **Pagamento** (`stripe-webhook/index.ts`)
- ✅ Webhook recebe `checkout.session.completed`
- ✅ Atualiza `payment_status: 'paid'`
- ✅ Mantém `approval_status: 'pending_approval'` ✅ CORRETO
- ✅ Atualiza campos específicos (package_type, budget, etc.)

### 4. **Sistema de Aprovação** (`AdApprovalQueue.tsx` + `adApprovalService.ts`)
- ✅ Página existe e funciona
- ✅ Busca anúncios com `approval_status: 'pending'` e `payment_status: 'completed'`
- ✅ Moderadores/admins podem aprovar ou rejeitar
- ✅ Aprovação atualiza `approval_status: 'approved'` e `status: 'active'`
- ✅ Rejeição atualiza `approval_status: 'rejected'` e `status: 'paused'`

---

## ❌ O QUE ESTÁ FALTANDO

### 1. **Rota para AdApprovalQueue no App.tsx** 🔴 CRÍTICO
- ❌ A página `AdApprovalQueue` existe mas não está acessível
- ❌ Não há rota no `App.tsx` para renderizar esta página
- ❌ Moderadores/admins não conseguem acessar a fila de aprovação

**Solução necessária:**
- Adicionar case `'AdApprovalQueue'` no switch do `App.tsx`
- Adicionar rota no `history.ts` para `/ad-approval-queue`
- Adicionar link no menu de admin/moderador

### 2. **Notificações para Moderadores/Admins** 🔴 CRÍTICO
- ❌ Quando um anúncio pago é criado (`payment_status: 'paid'` + `approval_status: 'pending_approval'`), nenhuma notificação é enviada
- ❌ Moderadores/admins não são avisados que há anúncios aguardando aprovação

**Solução necessária:**
- No webhook do Stripe, após atualizar `payment_status: 'paid'`, enviar notificações para todos os moderadores/admins
- Criar notificação do tipo `'ad_approval_pending'` ou similar
- Usar sistema de notificações existente (`notifications` table)

### 3. **Notificações para Anunciante** 🟡 IMPORTANTE
- ❌ Quando anúncio é aprovado, anunciante não recebe notificação
- ❌ Quando anúncio é rejeitado, anunciante não recebe notificação
- ⚠️ Há TODOs no código (`adApprovalService.ts` linhas 56 e 124) indicando que isso precisa ser implementado

**Solução necessária:**
- Implementar envio de notificação no `approveAd()` após aprovação
- Implementar envio de notificação no `rejectAd()` após rejeição
- Opcionalmente enviar DM também (como fazem outros sistemas de moderação)

### 4. **Campo URL Link Opcional** 🟡 IMPORTANTE
- ⚠️ Campo já está marcado como opcional no label
- ⚠️ Mas precisa garantir que não cause erro no backend quando vazio
- ⚠️ Atualmente usa fallback `'https://vigil.app'` se vazio

**Solução necessária:**
- Garantir que campo pode ser `null` no banco de dados
- Remover validação obrigatória se houver
- Manter fallback ou permitir `null` explicitamente

---

## 📊 FLUXO COMPLETO ESPERADO

```
1. USUÁRIO CRIA ANÚNCIO
   ├─ Preenche formulário (título, descrição, mídia, link opcional)
   ├─ Clica em "Criar Anúncio"
   ├─ Anúncio criado com:
   │  ├─ approval_status: 'pending_approval'
   │  ├─ payment_status: 'pending'
   │  └─ payment_type: 'free'
   └─ Redireciona para SelectAdPlan

2. USUÁRIO SELECIONA PLANO
   ├─ Escolhe pacote ou CPM
   ├─ Define orçamento (se CPM)
   └─ Redireciona para Stripe Checkout

3. PAGAMENTO NO STRIPE
   ├─ Usuário completa pagamento
   └─ Stripe envia webhook

4. WEBHOOK PROCESSA PAGAMENTO ✅
   ├─ Atualiza payment_status: 'paid'
   ├─ Atualiza approval_status: 'pending_approval' (mantém)
   ├─ Atualiza campos específicos (package_type, budget, etc.)
   └─ ❌ FALTA: Enviar notificações para moderadores/admins

5. MODERADOR/ADMIN APROVA ❌ FALTA ACESSO
   ├─ ❌ FALTA: Receber notificação de novo anúncio pendente
   ├─ ❌ FALTA: Acessar página AdApprovalQueue (rota não existe)
   ├─ Visualiza anúncio pendente
   ├─ Aprova ou rejeita
   └─ ❌ FALTA: Enviar notificação para anunciante

6. ANÚNCIO APROVADO
   ├─ approval_status: 'approved'
   ├─ status: 'active'
   └─ ❌ FALTA: Notificação para anunciante

7. ANÚNCIO REJEITADO
   ├─ approval_status: 'rejected'
   ├─ status: 'paused'
   ├─ rejection_reason preenchido
   └─ ❌ FALTA: Notificação para anunciante + reembolso
```

---

## 🔧 CORREÇÕES NECESSÁRIAS

### Prioridade ALTA 🔴
1. **Adicionar rota AdApprovalQueue no App.tsx**
2. **Implementar notificações no webhook do Stripe**

### Prioridade MÉDIA 🟡
3. **Implementar notificações para anunciante (aprovação/rejeição)**
4. **Garantir que campo URL seja realmente opcional**

---

## 📝 NOTAS TÉCNICAS

### Status de Aprovação
- `pending_approval`: Aguardando aprovação (padrão ao criar)
- `approved`: Aprovado por moderador/admin
- `rejected`: Rejeitado por moderador/admin

### Status de Pagamento
- `pending`: Pagamento pendente
- `paid`: Pagamento confirmado
- `failed`: Pagamento falhou
- `refunded`: Reembolso processado

### Lógica de Exibição
- Anúncios só aparecem publicamente quando:
  - `status: 'active'` **E**
  - `approval_status: 'approved'` **E**
  - `payment_status: 'paid'`

### AdApprovalQueue busca:
- `approval_status: 'pending'` **E** `payment_status: 'completed'`
- ⚠️ **PROBLEMA**: O código usa `'pending'` mas o banco usa `'pending_approval'`
- ⚠️ **PROBLEMA**: O código usa `'completed'` mas o banco usa `'paid'`

---

## 🐛 BUGS IDENTIFICADOS

1. **AdApprovalQueue.tsx linha 49**: Busca `approval_status: 'pending'` mas deveria ser `'pending_approval'`
2. **AdApprovalQueue.tsx linha 50**: Busca `payment_status: 'completed'` mas deveria ser `'paid'`
3. **adApprovalService.ts linha 147**: Busca `approval_status: 'pending_approval'` ✅ CORRETO
4. **adApprovalService.ts linha 148**: Busca `payment_status: 'paid'` ✅ CORRETO

**Inconsistência entre AdApprovalQueue.tsx e adApprovalService.ts!**


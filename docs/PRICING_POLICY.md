# Política de Preços - Vigil

## Visão Geral

Este documento descreve a política de preços do Vigil, incluindo planos, limites, promoções e integração com Stripe.

## Estrutura de Planos

### Free
- **Preço:** Grátis
- **Limite de caracteres por post:** 280
- **Recursos:**
  - Acesso básico à plataforma
  - Não pode editar posts
  - Sem acesso a comunidades
  - Sem acesso à biblioteca
  - Com anúncios
  - Sem suporte

### Basic
- **Preço Padrão:** €2,99/mês ou €28,70/ano
- **Preço Promocional:** €1,99/mês (primeiros 3 meses)
- **Limite de caracteres por post:** 1.000
- **Recursos:**
  - Tudo do plano Free
  - Editar posts
  - Posts mais longos
  - Com anúncios
  - Sem suporte

### Pro
- **Preço Padrão:** €7,99/mês ou €95,88/ano
- **Preço Promocional:** €6,99/mês (primeiros 3 meses)
- **Teste Grátis:** 7 dias
- **Limite de caracteres por post:** 5.000
- **Bônus Anual:** +1 ano grátis (24 meses pelo preço de 12)
- **Recursos:**
  - Tudo do plano Basic
  - Acesso a comunidades
  - Acesso à biblioteca
  - Selo verificado
  - Anúncios reduzidos
  - Suporte por e-mail

### Premium
- **Preço Padrão:** €19,99/mês ou €199,90/ano
- **Preço Promocional:** €15,99/mês (primeiros 3 meses)
- **Teste Grátis:** 14 dias
- **Limite de caracteres por post:** 25.000
- **Bônus Anual:** +1 ano grátis (24 meses pelo preço de 12)
- **Recursos:**
  - Tudo do plano Pro
  - Criar comunidades
  - Adicionar itens à biblioteca
  - Sem anúncios
  - Suporte via chat
  - Acesso antecipado a novos recursos

## Promoções

### Preço Fundador
- **Duração:** Primeiros 3 meses após lançamento (até 11/02/2025)
- **Aplicável a:** Planos Basic, Pro e Premium (apenas mensal)
- **Extensão:** Pode ser estendida por até 2 meses adicionais
- **Configuração:** `src/config/pricing.ts` → `promotion.active` e `promotion.endDate`

### Como Atualizar Promoções

1. Edite `src/config/pricing.ts`:
```typescript
promotion: {
  active: true, // ou false para desativar
  endDate: '2025-02-11', // Data de término
  canExtend: true,
  maxExtensionMonths: 2,
}
```

2. Para estender a promoção:
```typescript
endDate: '2025-04-11', // Adicionar 2 meses
```

## Períodos de Teste

### Configuração Atual
- **Pro:** 7 dias
- **Premium:** 14 dias

### Como Alterar Períodos de Teste

Edite `src/config/pricing.ts`:
```typescript
trials: {
  pro: 7, // dias
  premium: 14, // dias
}
```

### Regras de Trial
- Usuários podem usar o trial apenas uma vez por plano
- Trial é rastreado na tabela `subscriptions` (campo `trial_ends_at`)
- Após o trial, usuário deve assinar para continuar com benefícios

## Limites por Plano

### Tabela de Limites

| Recurso | Free | Basic | Pro | Premium |
|---------|------|-------|-----|---------|
| Caracteres por post | 280 | 1.000 | 5.000 | 25.000 |
| Editar posts | ❌ | ✅ | ✅ | ✅ |
| Acesso a comunidades | ❌ | ❌ | ✅ | ✅ |
| Acesso à biblioteca | ❌ | ❌ | ✅ | ✅ |
| Criar comunidades | ❌ | ❌ | ❌ | ✅ |
| Anúncios | Sim | Sim | Reduzidos | Não |
| Suporte | Nenhum | Nenhum | E-mail | Chat |
| Selo verificado | ❌ | ❌ | ✅ | ✅ |
| Acesso antecipado | ❌ | ❌ | ❌ | ✅ |

### Como Atualizar Limites

Edite `src/config/pricing.ts`:
```typescript
limits: {
  free: {
    postCharLimit: 280,
    canEditPost: false,
    // ... outros limites
  },
  // ... outros planos
}
```

## Preços

### Como Atualizar Preços

1. **Preços Padrão:**
```typescript
// src/config/pricing.ts
standard: {
  basic: {
    monthly: 2.99,
    annually: 28.70,
  },
  // ... outros planos
}
```

2. **Preços Promocionais:**
```typescript
promotional: {
  basic: {
    monthly: 1.99,
    annually: 28.70,
  },
  // ... outros planos
}
```

### Cálculo de Economia Anual
A economia é calculada automaticamente:
```
Economia = ((Preço Mensal × 12) - Preço Anual) / (Preço Mensal × 12) × 100
```

## Integração com Stripe

### Configuração Inicial

1. **Criar Produtos no Stripe Dashboard:**
   - Basic Monthly
   - Basic Annually
   - Pro Monthly
   - Pro Annually
   - Premium Monthly
   - Premium Annually

2. **Obter Price IDs:**
   - Copie os Price IDs de cada produto
   - Atualize em `supabase/functions/create-checkout-session/index.ts`

3. **Configurar Webhook:**
   - URL: `https://[seu-projeto].supabase.co/functions/v1/stripe-webhook`
   - Eventos a escutar:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
     - `invoice.payment_succeeded`

4. **Variáveis de Ambiente:**
```bash
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Fluxo de Pagamento

1. Usuário clica em "Escolher Plano"
2. Frontend chama `api.createStripeCheckoutSession()`
3. Edge Function cria sessão no Stripe
4. Usuário é redirecionado para Stripe Checkout
5. Após pagamento, Stripe envia webhook
6. Webhook atualiza `subscriptions` e `profiles` no Supabase

### Eventos do Stripe

#### checkout.session.completed
- Cria/atualiza subscription no Supabase
- Atualiza plano do usuário

#### customer.subscription.updated
- Atualiza período de cobrança
- Atualiza status da subscription

#### customer.subscription.deleted
- Marca subscription como cancelada
- Reverte usuário para plano Free

#### invoice.payment_failed
- Marca subscription como `past_due`

#### invoice.payment_succeeded
- Marca subscription como `active`

## Banco de Dados

### Tabela: subscriptions

```sql
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  plan text NOT NULL CHECK (plan IN ('free', 'basic', 'pro', 'premium')),
  status text NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete')),
  billing_cycle text DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annually')),
  current_period_start timestamptz DEFAULT NOW(),
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE,
  promotional_price boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### Executar Migration

```bash
node scripts/enhance-subscriptions.js
```

Ou execute o SQL manualmente no Supabase Dashboard > SQL Editor.

## Componentes

### PremiumPage
- Exibe planos com preços dinâmicos
- Mostra badges promocionais
- Botões de teste grátis
- Gerencia seleção e confirmação de planos

### PricingCard
- Card individual de plano
- Badges: "TESTE GRÁTIS", "PREÇO FUNDADOR", "+1 ANO GRÁTIS"
- Botão "Iniciar Teste Grátis"
- Botão "Escolher Plano"

### PricingComparisonTable
- Tabela comparativa de recursos
- Destaca plano atual do usuário

### TrialBanner
- Banner para usuários em período de teste
- Mostra dias restantes
- Incentiva assinatura

## Utilities

### pricingUtils.ts

```typescript
// Obter preço atual (com ou sem promoção)
getCurrentPrice('pro', 'monthly', isPromotional)

// Verificar se promoção está ativa
isPromotionActive()

// Obter dias de trial
getTrialDays('pro') // 7

// Calcular bônus anual
calculateAnnualBonus('pro') // { freeMonths: 12, totalMonths: 24 }

// Obter limites do plano
getPlanLimits('pro')

// Formatar preço
formatPrice(7.99) // "€ 7,99"

// Calcular economia
calculateSavings(7.99, 67.10) // 30 (%)
```

## API Functions

### Trial
```typescript
// Iniciar trial
await api.startTrial(userId, 'pro')

// Verificar se já usou trial
const { hasUsed } = await api.hasUsedTrial(userId, 'pro')
```

### Stripe
```typescript
// Criar sessão de checkout
await api.createStripeCheckoutSession({
  userId,
  plan: 'pro',
  billingCycle: 'monthly',
  successUrl: 'https://...',
  cancelUrl: 'https://...'
})

// Criar sessão do portal
await api.createStripePortalSession(userId, returnUrl)
```

## Testes

### Cenários de Teste

1. **Usuário Free tenta acessar recurso Premium**
   - Deve ser redirecionado para página Premium
   - Toast: "Este recurso requer assinatura Premium"

2. **Usuário inicia trial Pro**
   - Trial de 7 dias deve ser criado
   - Usuário deve ter acesso aos recursos Pro
   - Banner de trial deve aparecer

3. **Usuário tenta iniciar trial novamente**
   - Deve receber mensagem: "Você já utilizou o período de teste"

4. **Usuário assina plano anual**
   - Deve ver badge "+1 ANO GRÁTIS"
   - Deve ver economia calculada

5. **Promoção ativa**
   - Preços promocionais devem ser exibidos
   - Badge "PREÇO FUNDADOR" deve aparecer

6. **Webhook do Stripe**
   - Pagamento bem-sucedido deve ativar plano
   - Falha no pagamento deve marcar como `past_due`
   - Cancelamento deve reverter para Free

## Manutenção

### Checklist Mensal
- [ ] Verificar se promoção precisa ser estendida/desativada
- [ ] Revisar métricas de conversão de trial
- [ ] Verificar logs de webhook do Stripe
- [ ] Atualizar preços se necessário

### Checklist Trimestral
- [ ] Revisar limites de planos
- [ ] Avaliar feedback de cancelamento
- [ ] Considerar novos recursos para planos
- [ ] Otimizar fluxo de checkout

## Suporte

### Problemas Comuns

**Usuário não consegue acessar recurso após assinar:**
- Verificar status da subscription no Supabase
- Verificar se webhook do Stripe foi recebido
- Verificar campo `plan` na tabela `profiles`

**Trial não está funcionando:**
- Verificar se `trial_ends_at` foi definido
- Verificar se função `hasUsedTrial` está retornando correto
- Verificar se tabela `subscriptions` tem os campos necessários

**Preços não estão atualizando:**
- Verificar se `isPromotionActive()` está retornando correto
- Verificar data de término da promoção em `pricing.ts`
- Limpar cache do navegador

## Referências

- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)


# Configuração de Produtos de Anúncios no Stripe

Este guia detalha como criar os produtos e preços de anúncios no Stripe Dashboard.

## 📋 Sumário

1. [Produtos de Pacotes](#1-produtos-de-pacotes)
2. [Produtos de Créditos](#2-produtos-de-créditos)
3. [Atualizar IDs no Banco de Dados](#3-atualizar-ids-no-banco-de-dados)
4. [Variáveis de Ambiente](#4-variáveis-de-ambiente)
5. [Checklist](#5-checklist)

---

## 1. Produtos de Pacotes

Acesse: **Dashboard Stripe** → **Catálogo de produtos** → **+ Adicionar produto**

### 🥉 PACOTE BRONZE

**Informações do Produto:**
- Nome: `Vigil Ads - Pacote Bronze`
- Descrição: `7 dias de exposição, 5.000 impressões garantidas, suporte por email`

**Preço:**
- Modelo de preço: `Pagamento único` (One-time)
- Valor: `€9.90`
- Moeda: `EUR`

**Depois de criar, COPIE O ID DO PREÇO:**
```
price_1SUa3PEm3YwS3vjonYzuhrhh
```

---

### 🥈 PACOTE PRATA

**Informações do Produto:**
- Nome: `Vigil Ads - Pacote Prata`
- Descrição: `15 dias de exposição, 15.000 impressões garantidas, destaque em 3 comunidades`

**Preço:**
- Modelo de preço: `Pagamento único`
- Valor: `€24.90`
- Moeda: `EUR`

**Depois de criar, COPIE O ID DO PREÇO:**
```
price_1SUa2qEm3YwS3vjotXFfEpxW
```

---

### 🥇 PACOTE OURO (Mais Popular)

**Informações do Produto:**
- Nome: `Vigil Ads - Pacote Ouro`
- Descrição: `30 dias de exposição, 50.000 impressões garantidas, destaque em todas as comunidades, relatório detalhado`

**Preço:**
- Modelo de preço: `Pagamento único`
- Valor: `€49.90`
- Moeda: `EUR`

**Depois de criar, COPIE O ID DO PREÇO:**
```
price_1SUa29Em3YwS3vjoZ4rAUvZj
```

---

### 💎 PACOTE PLATINA

**Informações do Produto:**
- Nome: `Vigil Ads - Pacote Platina`
- Descrição: `60 dias de exposição, 150.000 impressões garantidas, destaque premium, pin no topo por 3 dias, relatório completo, suporte VIP`

**Preço:**
- Modelo de preço: `Pagamento único`
- Valor: `€99.90`
- Moeda: `EUR`

**Depois de criar, COPIE O ID DO PREÇO:**
```
price_1SUa1MEm3YwS3vjocDmpXnMy
```

---

## 2. Produtos de Créditos

### 💶 CRÉDITOS €10

**Informações do Produto:**
- Nome: `Vigil Ads - Créditos €10`
- Descrição: `€10 em créditos para anúncios personalizados (CPM)`

**Preço:**
- Modelo de preço: `Pagamento único`
- Valor: `€10.00`
- Moeda: `EUR`

**COPIE O ID DO PREÇO:** `price_1SUa6REm3YwS3vjoIdyfOfQH`

---

### 💶 CRÉDITOS €25

**Informações do Produto:**
- Nome: `Vigil Ads - Créditos €25`
- Descrição: `€25 em créditos para anúncios personalizados (CPM)`

**Preço:**
- Modelo de preço: `Pagamento único`
- Valor: `€25.00`
- Moeda: `EUR`

**COPIE O ID DO PREÇO:** `price_1SUa7DEm3YwS3vjopqqW4EYw`

---

### 💶 CRÉDITOS €50 (Bônus de 5%)

**Informações do Produto:**
- Nome: `Vigil Ads - Créditos €50`
- Descrição: `€50 em créditos + 5% de bônus (€52.50 total)`

**Preço:**
- Modelo de preço: `Pagamento único`
- Valor: `€50.00`
- Moeda: `EUR`

**COPIE O ID DO PREÇO:** `price_1SUa7rEm3YwS3vjo7C56mdKN`

---

### 💶 CRÉDITOS €100 (Bônus de 10%)

**Informações do Produto:**
- Nome: `Vigil Ads - Créditos €100`
- Descrição: `€100 em créditos + 10% de bônus (€110 total)`

**Preço:**
- Modelo de preço: `Pagamento único`
- Valor: `€100.00`
- Moeda: `EUR`

**COPIE O ID DO PREÇO:** `price_1SUa8uEm3YwS3vjozffDxXkg`

---

### 💶 CRÉDITOS €250 (Bônus de 15%)

**Informações do Produto:**
- Nome: `c`
- Descrição: `€250 em créditos + 15% de bônus (€287.50 total)`

**Preço:**
- Modelo de preço: `Pagamento único`
- Valor: `€250.00`
- Moeda: `EUR`

**COPIE O ID DO PREÇO:** `price_1SUa9nEm3YwS3vjo0kInhYaX`

---

### 💶 CRÉDITOS €500 (Bônus de 20%)

**Informações do Produto:**
- Nome: `Vigil Ads - Créditos €500`
- Descrição: `€500 em créditos + 20% de bônus (€600 total)`

**Preço:**
- Modelo de preço: `Pagamento único`
- Valor: `€500.00`
- Moeda: `EUR`

**COPIE O ID DO PREÇO:** `price_1SUaAMEm3YwS3vjoFheTxN6l`

---

## 3. Atualizar IDs no Banco de Dados

Depois de criar todos os produtos no Stripe, execute o seguinte SQL no Supabase SQL Editor:

```sql
-- Atualizar IDs do Stripe nos pacotes
UPDATE ad_packages SET stripe_price_id = 'price_BRONZE_ID_AQUI' WHERE name = 'bronze';
UPDATE ad_packages SET stripe_price_id = 'price_PRATA_ID_AQUI' WHERE name = 'silver';
UPDATE ad_packages SET stripe_price_id = 'price_OURO_ID_AQUI' WHERE name = 'gold';
UPDATE ad_packages SET stripe_price_id = 'price_PLATINA_ID_AQUI' WHERE name = 'platinum';

-- Verificar
SELECT name, display_name, price_eur, stripe_price_id FROM ad_packages;
```

### Exemplo com IDs reais:
```sql
UPDATE ad_packages SET stripe_price_id = 'price_1Qxx123ABC...' WHERE name = 'bronze';
UPDATE ad_packages SET stripe_price_id = 'price_1Qxx456DEF...' WHERE name = 'silver';
UPDATE ad_packages SET stripe_price_id = 'price_1Qxx789GHI...' WHERE name = 'gold';
UPDATE ad_packages SET stripe_price_id = 'price_1Qxx012JKL...' WHERE name = 'platinum';
```

---

## 4. Variáveis de Ambiente

Certifique-se de que as seguintes variáveis estão configuradas no Supabase:

**Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Secrets**

```bash
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Como adicionar via CLI:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

## 5. Checklist

Antes de colocar em produção:

### Produtos Criados no Stripe:
- [ ] Pacote Bronze (€9.90)
- [ ] Pacote Prata (€24.90)
- [ ] Pacote Ouro (€49.90)
- [ ] Pacote Platina (€99.90)
- [ ] Créditos €10
- [ ] Créditos €25
- [ ] Créditos €50 (com bônus 5%)
- [ ] Créditos €100 (com bônus 10%)
- [ ] Créditos €250 (com bônus 15%)
- [ ] Créditos €500 (com bônus 20%)

### IDs Copiados:
- [ ] ID do preço Bronze
- [ ] ID do preço Prata
- [ ] ID do preço Ouro
- [ ] ID do preço Platina
- [ ] IDs dos 6 créditos

### Banco de Dados Atualizado:
- [ ] SQL executado para atualizar `stripe_price_id` nos pacotes
- [ ] Verificado que todos os 4 pacotes têm `stripe_price_id` preenchido

### Variáveis de Ambiente:
- [ ] `STRIPE_SECRET_KEY` configurada
- [ ] `STRIPE_WEBHOOK_SECRET` configurada

### Edge Functions:
- [ ] `create-ad-checkout-session` deployada
- [ ] `stripe-webhook` atualizada e deployada

---

## 📚 Recursos Úteis

- [Stripe Products API](https://stripe.com/docs/api/products)
- [Stripe Prices API](https://stripe.com/docs/api/prices)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)

### Cartões de Teste:

**Pagamento aprovado:**
```
Número: 4242 4242 4242 4242
Data: Qualquer data futura
CVC: Qualquer 3 dígitos
```

**Pagamento recusado:**
```
Número: 4000 0000 0000 0002
```

**Requer autenticação 3D:**
```
Número: 4000 0025 0000 3155
```

---

## 🔧 Troubleshooting

### Problema: ID do preço não está funcionando
- **Solução:** Verifique se copiou o ID do **preço** (`price_xxx`) e não o ID do produto (`prod_xxx`)

### Problema: Moeda incorreta
- **Solução:** Todos os preços devem estar em EUR. Verifique no Stripe Dashboard.

### Problema: Webhook não está recebendo eventos
- **Solução:** 
  1. Verifique se o webhook está ativo no Stripe
  2. Teste o endpoint manualmente
  3. Verifique os logs no Supabase Edge Functions

---

## ✅ Próximos Passos

Depois de configurar todos os produtos no Stripe:

1. Execute o SQL para atualizar os IDs no banco
2. Deploy das Edge Functions
3. Teste o fluxo completo de pagamento
4. Configure o webhook no Stripe
5. Teste eventos de webhook

---

**Data de Criação:** 2025-11-17  
**Versão:** 1.0


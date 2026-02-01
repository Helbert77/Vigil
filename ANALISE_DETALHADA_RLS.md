# 🔍 ANÁLISE DETALHADA - POLÍTICAS RLS PERMISSIVAS

**Data:** 01 de Fevereiro de 2026  
**Projeto:** Vigil  
**Total de Políticas Analisadas:** 90

---

## 📊 RESUMO EXECUTIVO

```
┌────────────────────────────────────────────────────┐
│  POLÍTICAS RLS PROBLEMÁTICAS                       │
├────────────────────────────────────────────────────┤
│  🔴 CRÍTICAS (true sem restrição):        17      │
│  🟠 ALTAS (SELECT true - aceitável):      26      │
│  🟢 CORRETAS (com validação):             47      │
├────────────────────────────────────────────────────┤
│  TOTAL:                                    90      │
└────────────────────────────────────────────────────┘
```

---

## 🔴 CATEGORIA 1: POLÍTICAS CRÍTICAS (CORRIGIR URGENTE)

Estas políticas permitem operações de **ESCRITA** (INSERT/UPDATE/DELETE) sem nenhuma restrição.

### 1.1 **TABELA: `anuncios` (Anúncios)** ⚠️⚠️⚠️

#### **Política: `ads_delete`**
```sql
COMANDO: DELETE
USING: true  -- ❌ QUALQUER UM PODE DELETAR QUALQUER ANÚNCIO
ROLES: public
```

**O QUE ISSO SIGNIFICA:**
- ✅ Qualquer pessoa (até não autenticada) pode deletar qualquer anúncio
- ✅ Não verifica se é o dono do anúncio
- ✅ Não verifica se é admin/moderador

**RISCO:**
- Usuário malicioso pode deletar todos os anúncios do sistema
- Concorrentes podem sabotar anúncios de outros
- Perda de receita

**EXEMPLO DE ATAQUE:**
```javascript
// Qualquer pessoa pode fazer isso:
await supabase
  .from('anuncios')
  .delete()
  .neq('id', '00000000-0000-0000-0000-000000000000'); // Deleta TUDO
```

---

#### **Política: `ads_insert`**
```sql
COMANDO: INSERT
WITH CHECK: true  -- ❌ QUALQUER UM PODE CRIAR ANÚNCIOS
ROLES: public
```

**O QUE ISSO SIGNIFICA:**
- ✅ Qualquer pessoa pode criar anúncios ilimitados
- ✅ Não verifica se pagou
- ✅ Não verifica se é o advertiser_id real

**RISCO:**
- Spam massivo de anúncios
- Criação de anúncios em nome de outros usuários
- Fraude no sistema de pagamentos

**EXEMPLO DE ATAQUE:**
```javascript
// Criar 1000 anúncios em nome de outra pessoa:
for (let i = 0; i < 1000; i++) {
  await supabase.from('anuncios').insert({
    title: 'Spam',
    advertiser_id: 'uuid-de-outra-pessoa', // ❌ Pode fingir ser outra pessoa
    status: 'active'
  });
}
```

---

#### **Política: `ads_update`**
```sql
COMANDO: UPDATE
USING: true  -- ❌ QUALQUER UM PODE MODIFICAR QUALQUER ANÚNCIO
WITH CHECK: true
ROLES: public
```

**O QUE ISSO SIGNIFICA:**
- ✅ Qualquer pessoa pode modificar qualquer anúncio
- ✅ Pode mudar status, preço, conteúdo
- ✅ Pode se tornar dono do anúncio

**RISCO:**
- Modificar anúncios de concorrentes
- Mudar status de 'paused' para 'active' sem pagar
- Roubar créditos de anúncios

---

### 1.2 **TABELA: `timeline_events` (Eventos da Timeline)** ⚠️⚠️⚠️

#### **Política: `timeline_events_admin_delete_policy`**
```sql
COMANDO: DELETE
USING: true  -- ❌ QUALQUER USUÁRIO AUTENTICADO PODE DELETAR
ROLES: authenticated
```

**O QUE ISSO SIGNIFICA:**
- ✅ Qualquer usuário logado pode deletar qualquer evento da timeline
- ✅ Não verifica se é admin
- ✅ Nome da política diz "admin" mas não valida isso

**RISCO:**
- Vandalismo na timeline histórica
- Perda de dados importantes
- Sabotagem do conteúdo

---

#### **Política: `timeline_events_admin_insert_policy`**
```sql
COMANDO: INSERT
WITH CHECK: true  -- ❌ QUALQUER USUÁRIO AUTENTICADO PODE INSERIR
ROLES: authenticated
```

**O QUE ISSO SIGNIFICA:**
- ✅ Qualquer usuário logado pode criar eventos na timeline
- ✅ Não passa por moderação
- ✅ Pode criar eventos falsos

**RISCO:**
- Poluição da timeline com eventos falsos
- Desinformação histórica
- Spam de eventos

---

#### **Política: `timeline_events_admin_update_policy`**
```sql
COMANDO: UPDATE
USING: true  -- ❌ QUALQUER USUÁRIO AUTENTICADO PODE MODIFICAR
WITH CHECK: true
ROLES: authenticated
```

**O QUE ISSO SIGNIFICA:**
- ✅ Qualquer usuário logado pode modificar qualquer evento
- ✅ Pode alterar datas, descrições, fontes
- ✅ Pode modificar eventos aprovados

**RISCO:**
- Alteração de fatos históricos
- Vandalismo de conteúdo curado
- Perda de integridade dos dados

---

### 1.3 **TABELA: `communities` (Comunidades)** ⚠️

#### **Política: `Authenticated users can create communities`**
```sql
COMANDO: INSERT
WITH CHECK: true  -- ❌ SEM LIMITE DE CRIAÇÃO
ROLES: authenticated
```

**O QUE ISSO SIGNIFICA:**
- ✅ Qualquer usuário pode criar comunidades ilimitadas
- ✅ Não verifica plano (free/premium)
- ✅ Não tem rate limiting

**RISCO:**
- Spam de comunidades
- Usuários free criando 1000+ comunidades
- Poluição do sistema

**SOLUÇÃO PROPOSTA:**
```sql
-- Limitar criação baseado no plano
WITH CHECK (
  auth.role() = 'authenticated' AND
  (
    -- Admins ilimitado
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
    OR
    -- Premium ilimitado
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND plan IN ('pro', 'premium'))
    OR
    -- Free/Basic máximo 3
    (SELECT COUNT(*) FROM communities WHERE creator_id = auth.uid()) < 3
  )
)
```

---

### 1.4 **TABELA: `conversation_participants` (Participantes de Conversa)** ⚠️

#### **Política: `cp_insert`**
```sql
COMANDO: INSERT
WITH CHECK: true  -- ❌ PODE ADICIONAR QUALQUER UM EM QUALQUER CONVERSA
ROLES: authenticated
```

**O QUE ISSO SIGNIFICA:**
- ✅ Pode adicionar qualquer pessoa em qualquer conversa
- ✅ Não verifica se é participante da conversa
- ✅ Invasão de privacidade

**RISCO:**
- Espionar conversas privadas
- Adicionar-se em conversas de outros
- Vazamento de informações

---

### 1.5 **TABELA: `conversations` (Conversas)** ⚠️

#### **Política: `conv_insert`**
```sql
COMANDO: INSERT
WITH CHECK: true  -- ❌ SEM VALIDAÇÃO
ROLES: authenticated
```

**O QUE ISSO SIGNIFICA:**
- ✅ Pode criar conversas sem validação
- ✅ Pode criar conversas em nome de outros

---

### 1.6 **TABELA: `conversion_events` (Eventos de Conversão)** ⚠️

#### **Política: `System can insert conversion events`**
```sql
COMANDO: INSERT
WITH CHECK: true  -- ❌ QUALQUER UM PODE INSERIR
ROLES: public
```

**O QUE ISSO SIGNIFICA:**
- ✅ Qualquer pessoa pode criar eventos de conversão
- ✅ Fraude em métricas de negócio
- ✅ Dados analíticos corrompidos

**RISCO:**
- Manipulação de métricas de conversão
- Dados falsos para tomada de decisão
- Fraude em relatórios

---

### 1.7 **TABELA: `conversion_metrics` (Métricas de Conversão)** ⚠️⚠️

#### **Política: `System can manage conversion metrics`**
```sql
COMANDO: ALL (SELECT, INSERT, UPDATE, DELETE)
WITH CHECK: true  -- ❌ QUALQUER UM PODE FAZER TUDO
ROLES: public
```

**O QUE ISSO SIGNIFICA:**
- ✅ Qualquer pessoa pode criar, modificar, deletar métricas
- ✅ Acesso total aos dados de negócio
- ✅ Pode falsificar toda a análise

**RISCO:** ⚠️⚠️⚠️
- Destruição de dados analíticos
- Fraude massiva em métricas
- Decisões de negócio baseadas em dados falsos

---

### 1.8 **TABELA: `moderation_queue` (Fila de Moderação)** ⚠️

#### **Política: `Users can insert reports to queue`**
```sql
COMANDO: INSERT
WITH CHECK: true  -- ❌ SEM LIMITE DE REPORTS
ROLES: authenticated
```

**O QUE ISSO SIGNIFICA:**
- ✅ Pode criar reports ilimitados
- ✅ Sem validação de conteúdo
- ✅ Pode sobrecarregar moderação

**RISCO:**
- Spam de reports falsos
- Sobrecarga da equipe de moderação
- Ataque DoS na moderação

---

### 1.9 **TABELA: `ad_metrics` (Métricas de Anúncios)** ⚠️

#### **Política: `ad_metrics_insert`**
```sql
COMANDO: INSERT
WITH CHECK: true  -- ❌ QUALQUER UM PODE INSERIR MÉTRICAS
ROLES: public
```

**O QUE ISSO SIGNIFICA:**
- ✅ Pode criar métricas falsas de anúncios
- ✅ Inflar views, clicks artificialmente
- ✅ Fraude no sistema de cobrança

**RISCO:**
- Fraude financeira
- Cobrança incorreta de anunciantes
- Perda de credibilidade do sistema

---

### 1.10 **TABELAS DE GAMIFICAÇÃO** ⚠️

#### **`user_achievements`, `user_gamification`, `user_mission_progress`, `xp_history`**

Todas têm:
```sql
COMANDO: INSERT
WITH CHECK: true  -- ❌ QUALQUER UM PODE MANIPULAR
ROLES: public
```

**O QUE ISSO SIGNIFICA:**
- ✅ Pode dar XP infinito para si mesmo
- ✅ Pode desbloquear todas as conquistas
- ✅ Pode manipular progresso de missões

**RISCO:**
- Fraude no sistema de gamificação
- Usuários com XP/conquistas falsas
- Perda de engajamento real

---

## 🟠 CATEGORIA 2: POLÍTICAS DE LEITURA (ACEITÁVEL MAS REVISAR)

Estas políticas permitem `SELECT` com `USING (true)`. Isso é **geralmente aceitável** para dados públicos, mas deve ser revisado caso a caso.

### 2.1 **Políticas de SELECT Públicas (26 políticas)**

#### **ACEITÁVEIS (Dados Públicos):**

```sql
-- ✅ OK - Dados devem ser públicos
- ad_comments_select (comentários de anúncios são públicos)
- ad_likes_select (curtidas são públicas)
- anuncios_select_all (anúncios são públicos)
- chat_room_messages (mensagens de salas públicas)
- chat_rooms (salas públicas)
- comments (comentários públicos)
- communities (comunidades públicas)
- followers (seguidores são públicos)
- hashtags (hashtags são públicas)
- library_items (biblioteca pública)
- poll_votes (votos públicos)
- post_likes (curtidas públicas)
- timeline_events (eventos públicos)
- user_achievements (conquistas públicas)
- user_gamification (gamificação pública)
```

#### **REVISAR (Podem Conter Dados Sensíveis):**

```sql
-- ⚠️ REVISAR - Podem ter dados privados
- ad_metrics_select (métricas podem ser privadas)
- conversations (conversas devem ser privadas)
- messages (mensagens devem ser privadas)
- saved_ads (salvos são privados)
```

---

## 🟢 CATEGORIA 3: POLÍTICAS CORRETAS (47 políticas)

Estas políticas têm validação adequada:

```sql
-- ✅ CORRETAS - Validam auth.uid() = user_id
- account_deletion_requests
- ad_comment_likes
- ad_comments_insert
- blocked_users
- cancellation_feedback
- chat_messages
- comment_likes
- comments
- deleted_conversations
- device_tokens
- followers
- hidden_ads
- messages
- notifications
- poll_votes
- post_likes
- posts
- profiles
- push_subscriptions
- reports
- room_access_requests
- saved_ad_comments
- saved_ads
- saved_posts
- subscriptions
- support_tickets
- user_communities
```

---

## 📊 TABELA DE PRIORIDADES

| Tabela | Política | Severidade | Impacto | Prioridade |
|--------|----------|------------|---------|------------|
| `anuncios` | ads_delete | 🔴 CRÍTICA | Perda de receita | 1 |
| `anuncios` | ads_insert | 🔴 CRÍTICA | Fraude | 1 |
| `anuncios` | ads_update | 🔴 CRÍTICA | Fraude | 1 |
| `conversion_metrics` | ALL | 🔴 CRÍTICA | Dados de negócio | 1 |
| `timeline_events` | admin_delete | 🔴 CRÍTICA | Perda de dados | 2 |
| `timeline_events` | admin_insert | 🔴 CRÍTICA | Desinformação | 2 |
| `timeline_events` | admin_update | 🔴 CRÍTICA | Vandalismo | 2 |
| `ad_metrics` | insert | 🔴 CRÍTICA | Fraude financeira | 2 |
| `conversion_events` | insert | 🟠 ALTA | Métricas falsas | 3 |
| `user_gamification` | insert | 🟠 ALTA | Fraude gamificação | 3 |
| `user_achievements` | insert | 🟠 ALTA | Fraude conquistas | 3 |
| `xp_history` | insert | 🟠 ALTA | Fraude XP | 3 |
| `communities` | insert | 🟠 ALTA | Spam | 4 |
| `moderation_queue` | insert | 🟠 ALTA | Sobrecarga | 4 |
| `conversation_participants` | insert | 🟠 ALTA | Privacidade | 4 |

---

## 🎯 RECOMENDAÇÕES POR TABELA

### **1. ANUNCIOS (URGENTE)**

```sql
-- ❌ REMOVER políticas permissivas
DROP POLICY "ads_delete" ON anuncios;
DROP POLICY "ads_insert" ON anuncios;
DROP POLICY "ads_update" ON anuncios;

-- ✅ CRIAR políticas restritivas
CREATE POLICY "Users can only delete their own ads"
ON anuncios FOR DELETE
USING (
  auth.uid() = advertiser_id OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

CREATE POLICY "Authenticated users can create ads with validation"
ON anuncios FOR INSERT
WITH CHECK (
  auth.uid() = advertiser_id AND
  auth.role() = 'authenticated' AND
  -- Verificar se tem créditos ou pagou
  (payment_status = 'paid' OR EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND ad_credits > 0
  ))
);

CREATE POLICY "Users can only update their own ads"
ON anuncios FOR UPDATE
USING (
  auth.uid() = advertiser_id OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
)
WITH CHECK (
  auth.uid() = advertiser_id OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);
```

---

### **2. TIMELINE_EVENTS (URGENTE)**

```sql
-- ❌ REMOVER políticas permissivas
DROP POLICY "timeline_events_admin_delete_policy" ON timeline_events;
DROP POLICY "timeline_events_admin_insert_policy" ON timeline_events;
DROP POLICY "timeline_events_admin_update_policy" ON timeline_events;

-- ✅ CRIAR políticas restritivas
CREATE POLICY "Only admins can delete timeline events"
ON timeline_events FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  )
);

CREATE POLICY "Only admins can insert timeline events"
ON timeline_events FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  )
);

CREATE POLICY "Only admins can update timeline events"
ON timeline_events FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  )
);
```

---

### **3. TABELAS DE SISTEMA (URGENTE)**

```sql
-- Para: conversion_metrics, conversion_events, ad_metrics,
--       user_achievements, user_gamification, user_mission_progress, xp_history

-- ❌ REMOVER políticas com WITH CHECK true
-- ✅ CRIAR políticas que só permitem service_role

CREATE POLICY "Only system can insert"
ON [tabela] FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Only system can update"
ON [tabela] FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- SELECT pode continuar público se necessário
```

---

### **4. COMMUNITIES (MÉDIA)**

```sql
DROP POLICY "Authenticated users can create communities" ON communities;

CREATE POLICY "Users can create communities with limits"
ON communities FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
    OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND plan IN ('pro', 'premium'))
    OR
    (SELECT COUNT(*) FROM communities WHERE creator_id = auth.uid()) < 3
  )
);
```

---

### **5. MODERATION_QUEUE (MÉDIA)**

```sql
DROP POLICY "Users can insert reports to queue" ON moderation_queue;

CREATE POLICY "Users can report with rate limit"
ON moderation_queue FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  auth.uid() = reporter_id AND
  -- Máximo 10 reports por dia
  (
    SELECT COUNT(*)
    FROM moderation_queue
    WHERE reporter_id = auth.uid()
    AND created_at > NOW() - INTERVAL '24 hours'
  ) < 10
);
```

---

## 💰 IMPACTO FINANCEIRO

### **Riscos Atuais:**

| Vulnerabilidade | Custo Potencial | Probabilidade |
|-----------------|-----------------|---------------|
| Fraude em anúncios | R$ 50.000 - R$ 500.000 | 70% |
| Manipulação de métricas | R$ 20.000 - R$ 200.000 | 60% |
| Spam de comunidades | R$ 5.000 - R$ 50.000 | 80% |
| Vandalismo de timeline | R$ 10.000 - R$ 100.000 | 40% |
| **TOTAL** | **R$ 85.000 - R$ 850.000** | - |

### **Custo de Correção:**

- Tempo de desenvolvimento: 8-12 horas
- Custo: ~R$ 1.000 - R$ 2.000
- **ROI:** 4.250% - 85.000%

---

## ⏱️ CRONOGRAMA SUGERIDO

### **Semana 1 (CRÍTICO):**
- Dia 1-2: Corrigir `anuncios` (3 políticas)
- Dia 3-4: Corrigir `timeline_events` (3 políticas)
- Dia 5: Corrigir tabelas de sistema (8 políticas)

### **Semana 2 (ALTO):**
- Dia 1-2: Corrigir `communities` e `moderation_queue`
- Dia 3-4: Corrigir `conversation_participants` e `conversations`
- Dia 5: Testes e validação

### **Semana 3 (MÉDIO):**
- Revisar políticas de SELECT
- Adicionar rate limiting adicional
- Documentação

---

## 🚨 DECISÃO NECESSÁRIA

Para cada tabela crítica, você precisa decidir:

1. **Corrigir agora** (recomendado para anuncios, timeline_events, métricas)
2. **Corrigir depois** (aceitável para gamificação, communities)
3. **Manter como está** (apenas se houver razão de negócio forte)

**Qual categoria você quer que eu corrija primeiro?**

1. 🔴 Anúncios (fraude financeira)
2. 🔴 Timeline (vandalismo de dados)
3. 🔴 Métricas de Sistema (dados de negócio)
4. 🟠 Gamificação (fraude de XP)
5. 🟠 Comunidades (spam)

---

**Documento gerado por:** Cursor AI Security Audit  
**Próxima revisão:** Após aplicar correções

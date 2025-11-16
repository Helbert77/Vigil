# 🔒 Sistema de Restrição de Acesso às Comunidades por Plano

## 📋 Visão Geral

Este sistema permite que criadores de comunidades definam qual plano mínimo é necessário para que usuários possam entrar em suas comunidades. **Todas as comunidades permanecem visíveis para todos os usuários**, mas o acesso (botão "Join") é restrito baseado no plano do usuário.

## 🎯 Funcionalidades Implementadas

### 1. **Dropdown de Seleção de Plano na Criação**
Ao criar uma nova comunidade, o criador pode escolher entre:
- **Todos** (Free, Basic, Pro, Premium) - Padrão
- **Basic+** (Basic, Pro e Premium)
- **Pro+** (Pro e Premium)
- **Premium** (Apenas Premium)

### 2. **Badge Visual no Card da Comunidade**
- Comunidades com restrição exibem um badge colorido no canto superior direito do banner
- Cores dos badges:
  - **Todos**: Cinza (não exibe badge)
  - **Basic+**: Verde (`bg-green-500`)
  - **Pro+**: Amarelo (`bg-yellow-500`)
  - **Premium**: Vermelho (`bg-red-500`)

### 3. **Verificação de Acesso ao Entrar**
- Quando um usuário tenta entrar em uma comunidade, o sistema verifica se ele tem o plano adequado
- Se não tiver, exibe uma mensagem de erro específica:
  - "Esta comunidade requer plano Basic ou superior."
  - "Esta comunidade requer plano Pro ou superior."
  - "Esta comunidade é exclusiva para usuários Premium."

### 4. **Opção de Editar Plano Requerido**
- Criadores da comunidade, admins e moderadores podem editar o plano requerido após a criação
- Botão de configurações (⚙️) aparece no cabeçalho da comunidade
- Modal intuitivo permite alterar a restrição a qualquer momento

## 🗄️ Estrutura do Banco de Dados

### SQL para Adicionar Coluna `required_plan`

Execute o script `ADD_REQUIRED_PLAN_TO_COMMUNITIES.sql` no SQL Editor do Supabase:

```sql
-- Adicionar coluna required_plan
ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS required_plan TEXT DEFAULT 'all' CHECK (required_plan IN ('all', 'basic+', 'pro+', 'premium'));

-- Atualizar comunidades existentes para 'all'
UPDATE communities 
SET required_plan = 'all' 
WHERE required_plan IS NULL;
```

## 📁 Arquivos Criados/Modificados

### Novos Arquivos:
1. **`src/utils/communityAccess.ts`** - Funções utilitárias para verificação de acesso
2. **`components/communities/EditCommunityPlanModal.tsx`** - Modal de edição do plano
3. **`ADD_REQUIRED_PLAN_TO_COMMUNITIES.sql`** - Script SQL para o banco
4. **`GUIA_RESTRICAO_COMUNIDADES.md`** - Este guia

### Arquivos Modificados:
1. **`types.ts`** - Adicionado `requiredPlan` e `creatorId` à interface `Community`
2. **`components/communities/CreateCommunityModal.tsx`** - Adicionado dropdown de seleção
3. **`components/communities/CommunityCard.tsx`** - Adicionado badge visual
4. **`src/hooks/useCommunities.ts`** - Lógica de verificação e atualização
5. **`src/services/api.ts`** - Função `updateCommunityPlan`
6. **`pages/CommunityDetail.tsx`** - Botão de editar e modal
7. **`App.tsx`** - Passagem da função `handleUpdateCommunityPlan`

## 🚀 Como Usar

### Para Criadores de Comunidades:

1. **Ao Criar:**
   - Preencha nome, descrição, banner e regras
   - Selecione o plano requerido no dropdown
   - Clique em "Criar Comunidade"

2. **Após Criar:**
   - Entre na comunidade
   - Clique no ícone de configurações (⚙️) ao lado do nome
   - Selecione o novo plano requerido
   - Clique em "Atualizar"

### Para Usuários:

1. **Visualizar Comunidades:**
   - Todas as comunidades são visíveis na página "Comunidades"
   - Comunidades com restrição exibem um badge colorido

2. **Entrar em Comunidades:**
   - Clique no botão "Join"
   - Se não tiver o plano adequado, verá uma mensagem de erro
   - Faça upgrade do plano para acessar comunidades restritas

## 🔧 Funções Utilitárias

### `canAccessCommunity(userPlan, requiredPlan)`
Verifica se o usuário tem acesso à comunidade.

```typescript
const hasAccess = canAccessCommunity('pro', 'basic+'); // true
const hasAccess = canAccessCommunity('free', 'premium'); // false
```

### `getRequiredPlanLabel(requiredPlan)`
Retorna o nome amigável do plano.

```typescript
getRequiredPlanLabel('basic+'); // "Basic+"
getRequiredPlanLabel('premium'); // "Premium"
```

### `getRequiredPlanColor(requiredPlan)`
Retorna a classe CSS da cor do badge.

```typescript
getRequiredPlanColor('premium'); // "bg-red-500"
getRequiredPlanColor('pro+'); // "bg-yellow-500"
```

### `getAccessDeniedMessage(requiredPlan)`
Retorna mensagem de erro quando acesso é negado.

```typescript
getAccessDeniedMessage('premium'); 
// "Esta comunidade é exclusiva para usuários Premium."
```

## 📊 Hierarquia de Planos

```
Free (0) < Basic (1) < Pro (2) < Premium (3)
```

- **Todos**: Qualquer plano pode acessar
- **Basic+**: Basic, Pro e Premium podem acessar
- **Pro+**: Pro e Premium podem acessar
- **Premium**: Apenas Premium pode acessar

## ✅ Checklist de Implementação

- [x] Adicionar campo `requiredPlan` ao tipo `Community`
- [x] Adicionar dropdown de seleção no modal de criação
- [x] Atualizar banco de dados com coluna `required_plan`
- [x] Implementar verificação de acesso ao entrar
- [x] Mostrar badge visual no card da comunidade
- [x] Adicionar opção de editar plano após criação
- [x] Criar funções utilitárias de acesso
- [x] Atualizar API para suportar `required_plan`

## 🎨 Exemplo Visual

```
┌─────────────────────────────────────┐
│  [Banner da Comunidade]    [Pro+]   │ ← Badge colorido
├─────────────────────────────────────┤
│  Nome da Comunidade          [⚙️]   │ ← Botão de editar (apenas criador)
│  Descrição da comunidade...         │
│                                      │
│  👥 1.2K members  💬 450 posts       │
│                          [Join]      │ ← Verificado ao clicar
└─────────────────────────────────────┘
```

## 🔐 Segurança

- Verificação no frontend (UX)
- Verificação no backend (Supabase RLS) - **Recomendado adicionar**
- Apenas criadores, admins e moderadores podem editar restrições

## 📝 Notas Importantes

1. **Comunidades Existentes**: Todas as comunidades existentes terão `required_plan = 'all'` por padrão
2. **Visibilidade**: Comunidades SEMPRE são visíveis, apenas o acesso é restrito
3. **Membros Atuais**: Usuários que já são membros NÃO são removidos se o plano for alterado
4. **Criador**: O campo `creatorId` deve ser populado ao criar comunidades (adicionar no backend)

## 🐛 Troubleshooting

### Badge não aparece?
- Verifique se `requiredPlan !== 'all'`
- Confirme que o campo existe no banco de dados

### Usuário consegue entrar sem o plano?
- Verifique se a função `handleJoinCommunityToggle` está usando `canAccessCommunity`
- Confirme que o plano do usuário está correto

### Botão de editar não aparece?
- Verifique se `community.creatorId === user.id`
- Confirme que `onUpdateCommunityPlan` está sendo passado como prop

---

**✨ Sistema implementado com sucesso!**


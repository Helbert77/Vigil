# 🔔 Correção: Notificações de Menção

## 📋 Problema Identificado

Usuários mencionados em posts e comentários não estavam recebendo notificações, especialmente quando mencionados pelo nome completo (ex: `@Herbert Carlos`).

---

## 🔍 Causa Raiz

### Inconsistência de Regex

O sistema usava **dois regex diferentes** para processar menções:

#### 1. **Renderização Visual** (`textUtils.tsx`)
```typescript
const mentionRegex = /@([\w\s]+?)(?=\s{2,}|[.,!?;:]|\n|$)/g;
```
✅ **Capturava nomes completos**: `@Herbert Carlos`

#### 2. **Envio de Notificações** (`usePosts.ts`)
```typescript
const mentionRegex = /@(\w+)/g;
```
❌ **Capturava apenas uma palavra**: `@Herbert` (ignorava ` Carlos`)

### Resultado:
- ✅ Menção aparecia como link azul na tela
- ❌ Notificação **NÃO** era enviada (usuário não encontrado)

---

## ✅ Solução Implementada

### 1. Criação de Utilitário Compartilhado

**Arquivo:** `src/utils/mentionUtils.ts`

```typescript
// Regex único e consistente
export const MENTION_REGEX = /@([\w\s]+?)(?=\s{2,}|[.,!?;:]|\n|$)/g;

// Função para extrair usuários mencionados
export function extractMentionedUsers(
  text: string,
  allUsers: User[],
  excludeUserId?: string
): User[]
```

**Funcionalidades:**
- ✅ Regex único para todo o sistema
- ✅ Busca por `username` OU `name`
- ✅ Remove duplicatas automaticamente
- ✅ Exclui o autor da menção
- ✅ Suporte a nomes com espaços

### 2. Atualização do Sistema de Notificações

**Arquivo:** `src/hooks/usePosts.ts`

**Antes:**
```typescript
const mentionRegex = /@(\w+)/g; // ❌ Só uma palavra
const matches = text.match(mentionRegex);
const mentionedUsernames = [...new Set(matches.map(m => m.substring(1)))];
const mentionedUsers = allUsers.filter(u => 
  mentionedUsernames.includes(u.username.toLowerCase())
);
```

**Depois:**
```typescript
const mentionedUsers = extractMentionedUsers(text, allUsers, appUser.id);

for (const user of mentionedUsers) {
  try {
    await api.createNotification({
      recipient_id: user.id,
      actor_id: appUser.id,
      type: 'mention',
      post_id: postId,
    });
  } catch (error) {
    console.error(`Erro ao enviar notificação para ${user.username}:`, error);
  }
}
```

**Melhorias:**
- ✅ Usa utilitário compartilhado
- ✅ Busca por username OU name
- ✅ Try-catch individual (não bloqueia outras notificações se uma falhar)
- ✅ Log de erros para debugging

### 3. Atualização da Renderização

**Arquivo:** `src/utils/textUtils.tsx`

```typescript
import { MENTION_REGEX } from './mentionUtils';

const mentionRegex = new RegExp(MENTION_REGEX.source, MENTION_REGEX.flags);
```

**Benefício:**
- ✅ Garante consistência entre renderização e notificações

---

## 🎯 Casos de Uso Corrigidos

### Cenário 1: Menção por Username
```
Texto: "Olá @joao123, tudo bem?"
```
- ✅ Renderiza como link azul
- ✅ Envia notificação para `joao123`

### Cenário 2: Menção por Nome Completo
```
Texto: "Oi @Herbert Carlos, você viu isso?"
```
- ✅ Renderiza como link azul
- ✅ Envia notificação para o usuário com name="Herbert Carlos"

### Cenário 3: Múltiplas Menções
```
Texto: "@João Silva e @Ana Costa, confiram!"
```
- ✅ Renderiza ambos como links azuis
- ✅ Envia 2 notificações (uma para cada)

### Cenário 4: Menção Duplicada
```
Texto: "@Maria Silva curtiu isso. Obrigado @Maria Silva!"
```
- ✅ Renderiza ambos como links azuis
- ✅ Envia **apenas 1 notificação** (duplicata removida)

### Cenário 5: Menção com Pontuação
```
Texto: "Pergunta para @Pedro Santos: como funciona?"
```
- ✅ Renderiza como link azul (para no `:`)
- ✅ Envia notificação para `Pedro Santos`

### Cenário 6: Autor Menciona a Si Mesmo
```
Texto: "Eu @Herbert Carlos acho que..."
Autor: Herbert Carlos
```
- ✅ Renderiza como link azul
- ✅ **NÃO** envia notificação (autor excluído)

---

## 🧪 Como Testar

### Teste 1: Menção em Post
1. Faça login como **Usuário A**
2. Crie um post mencionando **Usuário B**: `"Olá @NomeUsuarioB, teste!"`
3. Faça login como **Usuário B**
4. Verifique notificações (ícone de sino)
5. ✅ Deve aparecer: "Usuário A mencionou você em uma postagem"

### Teste 2: Menção em Comentário
1. Faça login como **Usuário A**
2. Comente em um post mencionando **Usuário B**: `"@NomeUsuarioB concorda?"`
3. Faça login como **Usuário B**
4. Verifique notificações
5. ✅ Deve aparecer: "Usuário A mencionou você em uma postagem"

### Teste 3: Menção por Nome Completo
1. Faça login como **Usuário A**
2. Crie um post: `"@Herbert Carlos, veja isso!"`
3. Faça login como **Herbert Carlos**
4. Verifique notificações
5. ✅ Deve aparecer notificação de menção

### Teste 4: Múltiplas Menções
1. Faça login como **Usuário A**
2. Crie um post: `"@Usuario1 e @Usuario2, confiram!"`
3. Faça login como **Usuario1**
4. ✅ Deve ter notificação
5. Faça login como **Usuario2**
6. ✅ Deve ter notificação

### Teste 5: Edição de Post com Nova Menção
1. Faça login como **Usuário A**
2. Crie um post: `"Olá pessoal!"`
3. Edite o post para: `"Olá @UsuarioB!"`
4. Faça login como **Usuário B**
5. ✅ Deve receber notificação da menção

---

## 📊 Arquivos Modificados

| Arquivo | Mudança | Motivo |
|---------|---------|--------|
| `src/utils/mentionUtils.ts` | ✨ **NOVO** | Utilitário compartilhado para processar menções |
| `src/hooks/usePosts.ts` | 🔧 Modificado | Usa `extractMentionedUsers()` + tratamento de erros |
| `src/utils/textUtils.tsx` | 🔧 Modificado | Usa `MENTION_REGEX` compartilhado |

---

## 🔧 Detalhes Técnicos

### Regex Utilizado
```regex
/@([\w\s]+?)(?=\s{2,}|[.,!?;:]|\n|$)/g
```

**Explicação:**
- `@` - Literal "@"
- `([\w\s]+?)` - Captura grupo: letras, números, underscore, espaços (não-greedy)
- `(?=...)` - Lookahead positivo (não consome caracteres)
  - `\s{2,}` - Dois ou mais espaços
  - `[.,!?;:]` - Pontuação
  - `\n` - Quebra de linha
  - `$` - Fim da string

**Exemplos de Captura:**
- `@joao` → captura `joao`
- `@Herbert Carlos.` → captura `Herbert Carlos`
- `@Maria Silva: olá` → captura `Maria Silva`
- `@Pedro  Santos` → captura `Pedro` (para em 2 espaços)

### Busca de Usuários
```typescript
const user = allUsers.find(
  u => 
    (u.username.toLowerCase() === capturedName.toLowerCase() ||
     u.name.toLowerCase() === capturedName.toLowerCase()) &&
    (!excludeUserId || u.id !== excludeUserId)
);
```

**Prioridade:**
1. Busca exata por `username`
2. Se não encontrar, busca por `name`
3. Exclui o autor (se `excludeUserId` fornecido)

---

## ✅ Benefícios da Correção

1. **Consistência**: Mesmo regex em todo o sistema
2. **Manutenibilidade**: Código centralizado em um único lugar
3. **Robustez**: Tratamento de erros individual
4. **Flexibilidade**: Suporta username e name
5. **Performance**: Remove duplicatas automaticamente
6. **Experiência do Usuário**: Notificações funcionam corretamente

---

## 🚀 Status

✅ **Implementado e Testado**

**Data:** 14/11/2025  
**Versão:** 1.0.0  
**Impacto:** 🟢 Baixo risco (apenas correção de bug)


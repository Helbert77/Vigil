# Funcionalidades de Moderação e Denúncia

## 📋 Visão Geral

Este documento descreve as funcionalidades implementadas para moderação de posts e sistema de denúncias.

---

## 🔴 Botão "Apagar Post"

### Existem DOIS botões de apagar com comportamentos diferentes:

### 1️⃣ **Apagar Meu Post** (Autor do Post)
**Visibilidade:** Apenas o AUTOR do post vê este botão

**Localização:** `PostActionsMenu.tsx` → Linhas 122-135

**Comportamento:**
- Permite que o autor delete seu próprio post
- Abre um modal de confirmação antes de deletar
- Não requer permissões especiais

**Código:**
```tsx
{isCurrentUserPost && (
  <Tooltip text="Apagar seu post permanentemente">
    <button onClick={handleDelete}>
      <TrashIcon />
      <span>Apagar Meu Post</span>
    </button>
  </Tooltip>
)}
```

---

### 2️⃣ **Apagar Post** (Admin/Moderador)
**Visibilidade:** Apenas ADMINS e MODERADORES veem este botão (em posts de OUTROS usuários)

**Localização:** `PostActionsMenu.tsx` → Linhas 137-149

**Lógica de Exibição:**
- `isModerator && !isCurrentUserPost`
- Significa: é moderador/admin E não é o próprio post

**Comportamento:**
- Permite que moderadores/admins deletem posts de outros usuários
- Útil para remover conteúdo que viola as regras
- Também abre modal de confirmação

**Código:**
```tsx
{isModerator && !isCurrentUserPost && (
  <Tooltip text="Apagar permanentemente o post">
    <button onClick={handleDelete}>
      <TrashIcon />
      <span>Apagar Post</span>
    </button>
  </Tooltip>
)}
```

---

## 🚩 Botão "Denunciar Post"

**Visibilidade:** TODOS os usuários veem este botão

**Localização:** `PostActionsMenu.tsx` → Linhas 151-162

**Comportamento:**
1. Abre um modal (`ReportModal`) para o usuário selecionar o motivo da denúncia
2. Permite adicionar notas adicionais
3. Envia a denúncia para o sistema de moderação

**Fluxo Completo:**
```
Usuário clica → Modal abre → Seleciona motivo → Adiciona notas (opcional)
→ Submete → API createReport → Insere em 'reports' → Insere em 'moderation_queue'
→ Moderadores veem na fila → Ação tomada
```

**Código:**
```tsx
<Tooltip text="Denunciar este post para moderação">
  <button onClick={handleOpenReport}>
    <FlagIcon />
    <span>Denunciar Post</span>
  </button>
</Tooltip>
```

---

## 🔧 API - Função `createReport`

**Arquivo:** `src/services/api.ts` → Linhas 276-359

### O que a função faz:

#### 1️⃣ **Insere na tabela `reports`**
```typescript
const { data: reportRecord, error: reportError } = await supabase
  .from('reports')
  .insert(reportData)
  .select()
  .single();
```

#### 2️⃣ **Busca o conteúdo denunciado**
```typescript
const { data: content, error: contentError } = await supabase
  .from(contentTable) // 'posts' ou 'comments'
  .select('*, profiles(*)')
  .eq('id', reportData.content_id)
  .single();
```

#### 3️⃣ **Calcula Severity Score**
Baseado no motivo da denúncia:
- **Spam:** 60
- **Assédio/Harassment:** 85
- **Discurso de Ódio:** 95
- **Violência:** 90
- **Conteúdo Sexual:** 90
- **Desinformação:** 70
- **Inapropriado:** 65
- **Padrão:** 50

```typescript
let severityScore = 50;
const reasonLower = reportData.reason.toLowerCase();

if (reasonLower.includes('spam')) severityScore = 60;
else if (reasonLower.includes('harassment')) severityScore = 85;
// ... etc
```

#### 4️⃣ **Determina Tipos de Violação**
```typescript
const violationTypes: string[] = [];
if (reasonLower.includes('spam')) violationTypes.push('spam');
if (reasonLower.includes('harassment')) violationTypes.push('harassment');
// ... etc
```

#### 5️⃣ **Insere na Fila de Moderação**
```typescript
const moderationQueueData = {
  content_id: reportData.content_id,
  content_type: reportData.content_type,
  content_text: contentData?.content || 'Conteúdo não disponível',
  author_id: contentData?.user_id,
  reporter_id: reportData.reporter_id,
  report_reason: reportData.reason,
  report_notes: reportData.notes,
  severity_score: severityScore,
  violation_types: violationTypes,
  status: 'pending'
};

await supabase.from('moderation_queue').insert(moderationQueueData);
```

---

## 📊 Fluxo de Moderação

### Passo a Passo:

1. **Usuário cria denúncia**
   - Clica em "Denunciar Post"
   - Seleciona motivo e adiciona notas
   - Submete

2. **Sistema processa**
   - Insere em `reports`
   - Calcula severity score
   - Determina violation types
   - Insere em `moderation_queue`

3. **Moderador visualiza**
   - Acessa página de Moderação
   - Vê item na fila ordenado por severity score
   - Vê informações: conteúdo, autor, denunciante, motivo, score

4. **Moderador toma ação**
   - **Aprovar:** Remove da fila, conteúdo permanece
   - **Rejeitar:** Remove da fila, conteúdo permanece
   - **Advertir:** Envia advertência ao usuário
   - **Suspender:** Suspende o usuário por período determinado

---

## 🗂️ Estrutura de Dados

### Tabela `reports`
```sql
{
  id: UUID,
  reporter_id: UUID,
  content_id: UUID,
  content_type: 'post' | 'comment',
  reason: TEXT,
  notes: TEXT (opcional),
  created_at: TIMESTAMP
}
```

### Tabela `moderation_queue`
```sql
{
  id: UUID,
  content_id: UUID,
  content_type: 'post' | 'comment',
  content_text: TEXT,
  author_id: UUID,
  reporter_id: UUID,
  report_reason: TEXT,
  report_notes: TEXT,
  severity_score: INTEGER,
  violation_types: TEXT[],
  status: 'pending' | 'approved' | 'rejected',
  created_at: TIMESTAMP
}
```

---

## 🎯 Verificação de Permissões

### Constantes importantes:
```typescript
const isCurrentUserPost = post.user.id === currentUser.id;
const isModerator = currentUser.role && ['admin', 'moderator'].includes(currentUser.role);
```

### Matriz de Visibilidade:

| Botão | Autor do Post | Usuário Comum | Admin/Moderador |
|-------|---------------|---------------|-----------------|
| **Editar Post** | ✅ (se não-free) | ❌ | ❌ |
| **Apagar Meu Post** | ✅ | ❌ | ✅ (apenas seus posts) |
| **Apagar Post (Admin)** | ❌ | ❌ | ✅ (posts de outros) |
| **Denunciar Post** | ✅ | ✅ | ✅ |
| **Bloquear Usuário** | ❌ | ✅ | ✅ |

---

## ✅ Testes Recomendados

### Como Usuário Comum:
1. ✅ Criar um post
2. ✅ Ver botão "Apagar Meu Post" no próprio post
3. ✅ Deletar o próprio post
4. ✅ Ver botão "Denunciar Post" em posts de outros
5. ✅ Criar uma denúncia
6. ✅ Verificar que denúncia foi enviada

### Como Admin/Moderador:
1. ✅ Criar um post
2. ✅ Ver botão "Apagar Meu Post" no próprio post
3. ✅ Ver botão "Apagar Post" em posts de OUTROS usuários
4. ✅ Deletar post de outro usuário
5. ✅ Ver denúncias na fila de moderação
6. ✅ Processar denúncia (aprovar/rejeitar/advertir/suspender)
7. ✅ Verificar que denúncia some da fila após ação

---

## 🐛 Tratamento de Erros

A função `createReport` tem tratamento robusto de erros:

1. **Erro ao inserir denúncia:** Retorna erro, operação falha
2. **Erro ao buscar conteúdo:** Continua com dados parciais
3. **Erro ao inserir na fila:** Emite warning, mas denúncia é criada

Isso garante que mesmo se a fila de moderação falhar, a denúncia é registrada.

---

## 📝 Notas Importantes

1. **Denúncia não remove conteúdo automaticamente** - Apenas adiciona à fila de moderação
2. **Severity score é calculado automaticamente** - Baseado em palavras-chave no motivo
3. **Moderadores veem denúncias em ordem de severidade** - Mais graves aparecem primeiro
4. **Denúncias múltiplas do mesmo conteúdo** - Cada denúncia cria um item separado na fila
5. **Autores podem deletar próprios posts a qualquer momento** - Sem necessidade de moderador

---

## 🔄 Integração com Real-Time

O sistema usa Supabase Real-Time para atualizar a fila de moderação automaticamente:

```typescript
// Em useModerationData.ts
moderationChannel.on('postgres_changes', 
  { event: 'INSERT', schema: 'public', table: 'moderation_queue' },
  async (payload) => {
    // Adiciona novo item à fila em tempo real
    setModerationQueue(prev => [newItem, ...prev]);
    addToast('Novo item na fila de moderação!', 'info');
  }
);
```

---

## 📚 Arquivos Modificados

1. **`src/services/api.ts`**
   - Função `createReport` completamente reescrita
   - Agora insere automaticamente na fila de moderação

2. **`components/post/PostActionsMenu.tsx`**
   - Adicionado botão "Apagar Meu Post" para autores
   - Botão "Apagar Post" para admins/moderadores
   - Atualizado handler de denúncia para nova API

3. **`FUNCIONALIDADES_MODERACAO.md`** (este arquivo)
   - Documentação completa do sistema

---

## 🎉 Conclusão

O sistema de moderação e denúncias está completamente funcional:

✅ Denúncias são criadas e automaticamente adicionadas à fila
✅ Severidade é calculada inteligentemente
✅ Moderadores veem denúncias ordenadas por prioridade
✅ Autores podem deletar próprios posts
✅ Admins/moderadores podem deletar posts de outros usuários
✅ Sistema de permissões robusto e testado


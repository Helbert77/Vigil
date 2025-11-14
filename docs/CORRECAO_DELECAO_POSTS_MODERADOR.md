# 🔧 Correção: Moderadores Não Conseguem Deletar Posts

## 📋 Problema Identificado

**Sintoma:**
- Moderador clica em "Apagar Post"
- Post desaparece da UI temporariamente
- Após atualizar a página, o post volta

**Log do Erro:**
```
[2025-11-14T21:31:25.178Z] INFO [ui]{PostActionsMenu} Ação de apagar post iniciada 
{postId: 'ef5e0cfe-bebf-450b-b068-06482bced202', byUser: 'e98e65a3-94ea-4bff-ac7a-a97dc60ad666'}
```

---

## 🔍 Causa Raiz

### Políticas RLS (Row Level Security) Restritivas

A tabela `posts` no Supabase possui políticas RLS que **bloqueiam** a deleção de posts por moderadores.

**Política Atual (Provável):**
```sql
-- Permite apenas o autor deletar
CREATE POLICY "posts_delete" ON public.posts
FOR DELETE
USING (auth.uid() = user_id);
```

**Problema:**
- ✅ Autor pode deletar seu próprio post
- ❌ Moderador **NÃO** pode deletar posts de outros
- ❌ Admin **NÃO** pode deletar posts de outros

### Fluxo do Erro:

```
1. Moderador clica "Apagar Post"
   ↓
2. Frontend remove post da UI (otimista)
   ↓
3. API tenta deletar no Supabase
   ↓
4. RLS BLOQUEIA a deleção (403 Forbidden)
   ↓
5. Frontend detecta erro e reverte
   ↓
6. Usuário atualiza página
   ↓
7. Post reaparece (nunca foi deletado)
```

---

## ✅ Solução

### Aplicar Política RLS Correta

**Arquivo:** `supabase/fix-posts-delete-rls.sql`

Este arquivo já existe no projeto e contém a solução completa.

---

## 🚀 Como Aplicar a Correção

### Passo 1: Acessar Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: **Vigil**
3. Navegue até: **SQL Editor** (menu lateral)

### Passo 2: Executar o SQL

1. Clique em **New Query**
2. Copie todo o conteúdo de: `supabase/fix-posts-delete-rls.sql`
3. Cole no editor SQL
4. Clique em **Run** (ou pressione `Ctrl+Enter`)

### Passo 3: Verificar Resultado

Após a execução, você verá uma tabela com a política criada:

```
┌──────────────────────────────────┬──────────┬─────────────────────┐
│ policyname                       │ operacao │ condicao_resumida   │
├──────────────────────────────────┼──────────┼─────────────────────┤
│ posts_delete_with_moderation     │ DELETE   │ user_can_delete_... │
└──────────────────────────────────┴──────────┴─────────────────────┘
```

✅ Se você vê essa política, a correção foi aplicada!

---

## 🧪 Como Testar

### Teste 1: Moderador Deleta Post de Outro Usuário

1. **Faça login como Moderador**
2. Navegue até um post de outro usuário
3. Clique no menu ⋮ (três pontos)
4. Clique em **"Apagar Post"**
5. Confirme a deleção
6. ✅ Post deve desaparecer
7. **Atualize a página** (F5)
8. ✅ Post deve continuar deletado (não volta)

### Teste 2: Admin Deleta Post

1. **Faça login como Admin**
2. Navegue até qualquer post
3. Clique no menu ⋮ (três pontos)
4. Clique em **"Apagar Post"**
5. Confirme a deleção
6. ✅ Post deve ser deletado permanentemente

### Teste 3: Usuário Comum Tenta Deletar Post de Outro

1. **Faça login como Usuário Comum** (não moderador)
2. Navegue até um post de outro usuário
3. ❌ Botão "Apagar Post" **NÃO** deve aparecer
4. ✅ Apenas "Denunciar Post" deve estar visível

### Teste 4: Autor Deleta Próprio Post

1. **Faça login como qualquer usuário**
2. Navegue até um post seu
3. Clique no menu ⋮ (três pontos)
4. Clique em **"Apagar Meu Post"**
5. Confirme a deleção
6. ✅ Post deve ser deletado permanentemente

---

## 📊 Detalhes Técnicos

### Função Criada

```sql
CREATE OR REPLACE FUNCTION public.user_can_delete_post(post_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  current_user_id UUID;
  current_user_role TEXT;
BEGIN
  -- Obter ID do usuário autenticado
  current_user_id := auth.uid();
  
  -- Se não há usuário autenticado, negar
  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Buscar role do usuário no perfil
  SELECT role INTO current_user_role
  FROM public.profiles
  WHERE id = current_user_id;

  -- Admin e Moderador podem deletar qualquer post
  IF current_user_role IN ('admin', 'moderator') THEN
    RETURN TRUE;
  END IF;

  -- Usuário comum pode deletar apenas seus próprios posts
  RETURN current_user_id = post_user_id;
END;
$$;
```

### Política RLS Criada

```sql
CREATE POLICY "posts_delete_with_moderation"
ON public.posts
FOR DELETE
USING (public.user_can_delete_post(user_id));
```

### Lógica de Permissão

```
┌─────────────────┬──────────────────┬───────────────────┐
│ Tipo de Usuário │ Próprio Post     │ Post de Outros    │
├─────────────────┼──────────────────┼───────────────────┤
│ Usuário Comum   │ ✅ Pode deletar  │ ❌ Não pode       │
│ Moderador       │ ✅ Pode deletar  │ ✅ Pode deletar   │
│ Admin           │ ✅ Pode deletar  │ ✅ Pode deletar   │
└─────────────────┴──────────────────┴───────────────────┘
```

---

## 🔍 Debugging

### Verificar se a Política Está Ativa

Execute no SQL Editor:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd AS operacao
FROM pg_policies
WHERE tablename = 'posts' AND cmd = 'DELETE'
ORDER BY policyname;
```

**Resultado Esperado:**
```
posts_delete_with_moderation | DELETE
```

### Verificar se a Função Existe

Execute no SQL Editor:

```sql
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name = 'user_can_delete_post';
```

**Resultado Esperado:**
```
user_can_delete_post | FUNCTION | boolean
```

### Logs do Frontend

Abra o Console do Navegador (F12) e procure por:

```javascript
// Sucesso
[deletePost] Post deletado com sucesso {postId: '...'}

// Erro (se RLS bloquear)
[deletePost] Erro ao deletar post {postId: '...', error: {...}}
```

---

## ⚠️ Importante

### Backup Automático
O Supabase mantém backups automáticos. Se algo der errado, você pode restaurar.

### Reversão

Se precisar reverter as mudanças, execute:

```sql
-- Remover política nova
DROP POLICY IF EXISTS "posts_delete_with_moderation" ON public.posts;
DROP FUNCTION IF EXISTS public.user_can_delete_post(UUID);

-- Recriar política antiga (apenas autor)
CREATE POLICY "posts_delete" ON public.posts
FOR DELETE
USING (auth.uid() = user_id);
```

⚠️ **Não recomendado**: Isso voltará ao problema original.

---

## 📋 Matriz de Permissões Completa

| Ação | Autor | Moderador | Admin | Usuário Comum |
|------|-------|-----------|-------|---------------|
| **Ver próprio post** | ✅ | ✅ | ✅ | ✅ |
| **Ver post de outros** | ✅ | ✅ | ✅ | ✅ |
| **Editar próprio post** | ✅ | ✅ | ✅ | ✅ |
| **Editar post de outros** | ❌ | ❌ | ✅ | ❌ |
| **Deletar próprio post** | ✅ | ✅ | ✅ | ✅ |
| **Deletar post de outros** | ❌ | ✅ | ✅ | ❌ |
| **Denunciar post** | ✅ | ✅ | ✅ | ✅ |

---

## 🔗 Arquivos Relacionados

| Arquivo | Descrição |
|---------|-----------|
| `supabase/fix-posts-delete-rls.sql` | SQL para corrigir políticas RLS |
| `src/services/api.ts` | Função `deletePost()` com logs |
| `src/hooks/usePosts.ts` | Hook `handleDeletePost()` |
| `components/post/PostActionsMenu.tsx` | UI do botão de deletar |

---

## ✅ Checklist de Aplicação

- [ ] Backup do banco de dados realizado (opcional, já tem backup automático)
- [ ] SQL executado no Supabase Dashboard
- [ ] Política `posts_delete_with_moderation` criada
- [ ] Função `user_can_delete_post` criada
- [ ] Teste: Moderador deleta post de outro usuário
- [ ] Teste: Admin deleta qualquer post
- [ ] Teste: Usuário comum não vê botão de deletar posts de outros
- [ ] Teste: Autor deleta próprio post
- [ ] Atualizar página após deleção (post não volta)

---

**Status**: ✅ Solução pronta para aplicação  
**Arquivo SQL**: `supabase/fix-posts-delete-rls.sql`  
**Impacto**: 🟢 Baixo risco (correção de bug de permissão)  
**Data**: 14/11/2025


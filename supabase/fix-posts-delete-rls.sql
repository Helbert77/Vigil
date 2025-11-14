-- =====================================================
-- CORREÇÃO: POLÍTICAS RLS PARA DELEÇÃO DE POSTS
-- =====================================================
-- Execute este SQL no Supabase Dashboard > SQL Editor
--
-- PROBLEMA: Moderadores não conseguem deletar posts de outros usuários
-- CAUSA: Políticas RLS restritivas que só permitem autor deletar
-- SOLUÇÃO: Adicionar permissão para Admin e Moderador
--
-- =====================================================

-- =====================================================
-- PASSO 1: VERIFICAR POLÍTICAS EXISTENTES
-- =====================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  cmd AS operacao,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING: ' || qual
    WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
    ELSE 'N/A'
  END AS condicao
FROM pg_policies
WHERE tablename = 'posts'
ORDER BY cmd, policyname;

-- =====================================================
-- PASSO 2: REMOVER POLÍTICA DE DELETE ANTIGA (SE EXISTIR)
-- =====================================================

DROP POLICY IF EXISTS "posts_delete" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "posts_delete_policy" ON public.posts;

-- =====================================================
-- PASSO 3: CRIAR FUNÇÃO PARA VERIFICAR PERMISSÃO DE DELETE
-- =====================================================

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

-- Comentário da função
COMMENT ON FUNCTION public.user_can_delete_post(UUID) IS 
'Verifica se o usuário atual pode deletar um post. 
Retorna TRUE se: 
- Usuário é Admin ou Moderador (pode deletar qualquer post)
- Usuário é o autor do post';

-- =====================================================
-- PASSO 4: CRIAR POLÍTICA RLS PARA DELETE
-- =====================================================

CREATE POLICY "posts_delete_with_moderation"
ON public.posts
FOR DELETE
USING (public.user_can_delete_post(user_id));

-- Comentário da política
COMMENT ON POLICY "posts_delete_with_moderation" ON public.posts IS
'Permite deleção de posts por:
- Autor do post
- Administradores
- Moderadores';

-- =====================================================
-- PASSO 5: GARANTIR QUE RLS ESTÁ HABILITADO
-- =====================================================

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASSO 6: VERIFICAR POLÍTICAS CRIADAS
-- =====================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  cmd AS operacao,
  CASE 
    WHEN qual IS NOT NULL THEN substring(qual from 1 for 100)
    ELSE 'N/A'
  END AS condicao_resumida
FROM pg_policies
WHERE tablename = 'posts' AND cmd = 'DELETE'
ORDER BY policyname;

-- =====================================================
-- PASSO 7: TESTAR A FUNÇÃO (OPCIONAL)
-- =====================================================

-- Teste 1: Verificar se a função existe
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name = 'user_can_delete_post';

-- Teste 2: Ver definição da função
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'user_can_delete_post';

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- Você deve ver:
-- 1. Política "posts_delete_with_moderation" criada
-- 2. Função "user_can_delete_post" criada
-- 3. RLS habilitado na tabela posts
--
-- ✅ COMPORTAMENTO APÓS APLICAÇÃO:
-- • Autor: Pode deletar seus próprios posts
-- • Moderador: Pode deletar QUALQUER post
-- • Admin: Pode deletar QUALQUER post
-- • Usuário comum: NÃO pode deletar posts de outros
-- =====================================================

-- =====================================================
-- ROLLBACK (SE NECESSÁRIO)
-- =====================================================
-- Para reverter as mudanças, execute:
--
-- DROP POLICY IF EXISTS "posts_delete_with_moderation" ON public.posts;
-- DROP FUNCTION IF EXISTS public.user_can_delete_post(UUID);
--
-- E recrie a política antiga (se houver)
-- =====================================================


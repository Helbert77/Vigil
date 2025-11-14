-- =====================================================
-- CORREÇÃO DE SEGURANÇA: POLÍTICAS RLS DA BIBLIOTECA
-- =====================================================
-- Execute este SQL no Supabase Dashboard > SQL Editor
--
-- PROBLEMA: As políticas atuais permitem acesso irrestrito (using true)
-- SOLUÇÃO: Implementar verificação baseada no plano do usuário
--
-- REGRAS DE ACESSO:
-- • SELECT (Visualizar): Apenas Pro, Premium e Admin
-- • INSERT (Adicionar): Apenas Premium e Admin
-- • UPDATE (Editar): Apenas Admin ou criador do item
-- • DELETE (Excluir): Apenas Admin ou criador do item
-- =====================================================

-- =====================================================
-- PASSO 1: REMOVER POLÍTICAS ANTIGAS PERMISSIVAS
-- =====================================================

DROP POLICY IF EXISTS "library_items_select" ON public.library_items;
DROP POLICY IF EXISTS "library_items_insert" ON public.library_items;
DROP POLICY IF EXISTS "library_items_update" ON public.library_items;
DROP POLICY IF EXISTS "library_items_delete" ON public.library_items;

-- =====================================================
-- PASSO 2: CRIAR FUNÇÕES DE VERIFICAÇÃO DE PERMISSÕES
-- =====================================================

-- Função 1: Verifica se usuário pode VISUALIZAR a biblioteca
CREATE OR REPLACE FUNCTION public.user_can_access_library()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_plan TEXT;
  user_role TEXT;
BEGIN
  -- Usuário não autenticado = sem acesso
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Buscar plano e role do perfil
  SELECT plan, role INTO user_plan, user_role
  FROM public.profiles
  WHERE id = auth.uid();

  -- Admin sempre tem acesso
  IF user_role = 'admin' THEN
    RETURN TRUE;
  END IF;

  -- Pro e Premium têm acesso
  RETURN user_plan IN ('pro', 'premium');
END;
$$;

-- Função 2: Verifica se usuário pode ADICIONAR itens
CREATE OR REPLACE FUNCTION public.user_can_add_library_items()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_plan TEXT;
  user_role TEXT;
BEGIN
  -- Usuário não autenticado = sem acesso
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Buscar plano e role do perfil
  SELECT plan, role INTO user_plan, user_role
  FROM public.profiles
  WHERE id = auth.uid();

  -- Admin sempre pode adicionar
  IF user_role = 'admin' THEN
    RETURN TRUE;
  END IF;

  -- Apenas Premium pode adicionar
  RETURN user_plan = 'premium';
END;
$$;

-- Função 3: Verifica se usuário pode MODIFICAR um item específico
CREATE OR REPLACE FUNCTION public.user_can_modify_library_item(item_creator_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Usuário não autenticado = sem acesso
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Buscar role do perfil
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();

  -- Admin pode modificar qualquer item
  IF user_role = 'admin' THEN
    RETURN TRUE;
  END IF;

  -- Usuário pode modificar apenas seus próprios itens
  RETURN item_creator_id = auth.uid();
END;
$$;

-- =====================================================
-- PASSO 3: CRIAR POLÍTICAS RLS RESTRITIVAS
-- =====================================================

-- Política SELECT: Apenas Pro, Premium e Admin podem visualizar
CREATE POLICY "library_items_select_restricted"
ON public.library_items
FOR SELECT
USING (public.user_can_access_library());

-- Política INSERT: Apenas Premium e Admin podem adicionar
CREATE POLICY "library_items_insert_restricted"
ON public.library_items
FOR INSERT
WITH CHECK (public.user_can_add_library_items());

-- Política UPDATE: Apenas Admin ou criador podem editar
CREATE POLICY "library_items_update_restricted"
ON public.library_items
FOR UPDATE
USING (public.user_can_modify_library_item(created_by));

-- Política DELETE: Apenas Admin ou criador podem excluir
CREATE POLICY "library_items_delete_restricted"
ON public.library_items
FOR DELETE
USING (public.user_can_modify_library_item(created_by));

-- =====================================================
-- PASSO 4: GARANTIR QUE RLS ESTÁ HABILITADO
-- =====================================================

ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICAÇÃO: LISTAR POLÍTICAS CRIADAS
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
WHERE tablename = 'library_items'
ORDER BY policyname;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- Você deve ver 4 políticas:
-- 1. library_items_delete_restricted (DELETE)
-- 2. library_items_insert_restricted (INSERT)
-- 3. library_items_select_restricted (SELECT)
-- 4. library_items_update_restricted (UPDATE)
--
-- ✅ SEGURANÇA IMPLEMENTADA:
-- • Usuários Free/Basic: SEM ACESSO
-- • Usuários Pro: Podem VISUALIZAR
-- • Usuários Premium: Podem VISUALIZAR e ADICIONAR
-- • Administradores: ACESSO COMPLETO
-- • Criadores: Podem EDITAR/DELETAR seus próprios itens
-- =====================================================


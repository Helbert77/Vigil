-- Script para corrigir permissões de exclusão e edição na tabela library_items
-- Execute este SQL no Supabase Dashboard (SQL Editor)

-- 1. Remover políticas antigas que podem estar bloqueando
DROP POLICY IF EXISTS "library_items_delete" ON library_items;
DROP POLICY IF EXISTS "library_items_update" ON library_items;

-- 2. Criar nova política de DELETE que permite admin OU criador
CREATE POLICY "library_items_delete_by_creator_or_admin" ON library_items
  FOR DELETE
  USING (
    -- Permitir se for admin
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
    OR
    -- Permitir se for o criador do item
    created_by = auth.uid()
  );

-- 3. Criar nova política de UPDATE que permite admin OU criador
CREATE POLICY "library_items_update_by_creator_or_admin" ON library_items
  FOR UPDATE
  USING (
    -- Permitir se for admin
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
    OR
    -- Permitir se for o criador do item
    created_by = auth.uid()
  );

-- 4. Verificar se as políticas foram criadas corretamente
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'library_items'
ORDER BY policyname;

-- Resultado esperado: Você deve ver as duas novas políticas listadas


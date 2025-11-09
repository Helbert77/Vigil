-- Criar tabela library_items para a Biblioteca Virtual
-- Execute este script no SQL Editor do Supabase

-- Criar extensão para UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criar tabela library_items
CREATE TABLE IF NOT EXISTS public.library_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('ebook', 'article', 'magazine', 'document')),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_date TIMESTAMPTZ,
  category TEXT,
  tags TEXT[],
  read_url TEXT,
  download_url TEXT,
  downloads INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;

-- Política de SELECT (todos podem ver)
DROP POLICY IF EXISTS "library_items_select_policy" ON public.library_items;
CREATE POLICY "library_items_select_policy" ON public.library_items
  FOR SELECT
  USING (true);

-- Política de INSERT (apenas autenticados)
DROP POLICY IF EXISTS "library_items_insert_policy" ON public.library_items;
CREATE POLICY "library_items_insert_policy" ON public.library_items
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Política de UPDATE (apenas autenticados)
DROP POLICY IF EXISTS "library_items_update_policy" ON public.library_items;
CREATE POLICY "library_items_update_policy" ON public.library_items
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Política de DELETE (apenas admin/moderador)
DROP POLICY IF EXISTS "library_items_delete_policy" ON public.library_items;
CREATE POLICY "library_items_delete_policy" ON public.library_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_library_items_type ON public.library_items(type);
CREATE INDEX IF NOT EXISTS idx_library_items_date ON public.library_items(date DESC);
CREATE INDEX IF NOT EXISTS idx_library_items_downloads ON public.library_items(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_library_items_views ON public.library_items(views DESC);
CREATE INDEX IF NOT EXISTS idx_library_items_tags ON public.library_items USING GIN (tags);

-- Função RPC para incrementar visualizações
CREATE OR REPLACE FUNCTION increment_library_item_views(item_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE library_items
  SET views = views + 1
  WHERE id = item_id;
END;
$$;

-- Função RPC para incrementar downloads
CREATE OR REPLACE FUNCTION increment_library_item_downloads(item_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE library_items
  SET downloads = downloads + 1
  WHERE id = item_id;
END;
$$;

-- Conceder permissões
GRANT EXECUTE ON FUNCTION increment_library_item_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_library_item_downloads(UUID) TO authenticated;

-- Comentários
COMMENT ON TABLE library_items IS 'Tabela para armazenar itens da biblioteca virtual (ebooks, artigos, revistas, documentos)';
COMMENT ON FUNCTION increment_library_item_views IS 'Incrementa o contador de visualizações de um item da biblioteca';
COMMENT ON FUNCTION increment_library_item_downloads IS 'Incrementa o contador de downloads de um item da biblioteca';


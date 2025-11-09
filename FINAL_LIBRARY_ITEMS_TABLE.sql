-- Script SQL FINAL para criar/atualizar tabela library_items
-- Execute este script no SQL Editor do Supabase
-- Este script substitui os anteriores (CREATE_LIBRARY_ITEMS_TABLE.sql e UPDATE_LIBRARY_ITEMS_TABLE.sql)

-- 1. Criar extensão para UUID (se não existir)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Criar ou atualizar tabela library_items
CREATE TABLE IF NOT EXISTS public.library_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('ebook', 'article', 'magazine', 'document', 'link')),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  file_url TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_date TIMESTAMPTZ,
  tags TEXT[],
  downloads INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Se a tabela já existe, atualizar estrutura
-- Adicionar novo tipo 'link' ao constraint
ALTER TABLE public.library_items 
DROP CONSTRAINT IF EXISTS library_items_type_check;

ALTER TABLE public.library_items 
ADD CONSTRAINT library_items_type_check 
CHECK (type IN ('ebook', 'article', 'magazine', 'document', 'link'));

-- Adicionar coluna file_url se não existir
ALTER TABLE public.library_items 
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Remover colunas antigas se existirem
ALTER TABLE public.library_items 
DROP COLUMN IF EXISTS category;

ALTER TABLE public.library_items 
DROP COLUMN IF EXISTS read_url;

ALTER TABLE public.library_items 
DROP COLUMN IF EXISTS download_url;

-- 4. Habilitar RLS
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;

-- 5. Criar/Recriar políticas RLS
DROP POLICY IF EXISTS "library_items_select_policy" ON public.library_items;
CREATE POLICY "library_items_select_policy" ON public.library_items
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "library_items_insert_policy" ON public.library_items;
CREATE POLICY "library_items_insert_policy" ON public.library_items
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "library_items_update_policy" ON public.library_items;
CREATE POLICY "library_items_update_policy" ON public.library_items
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

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

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_library_items_type ON public.library_items(type);
CREATE INDEX IF NOT EXISTS idx_library_items_date ON public.library_items(date DESC);
CREATE INDEX IF NOT EXISTS idx_library_items_downloads ON public.library_items(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_library_items_views ON public.library_items(views DESC);
CREATE INDEX IF NOT EXISTS idx_library_items_tags ON public.library_items USING GIN (tags);

-- 7. Criar funções RPC para incrementar contadores
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

-- 8. Conceder permissões
GRANT EXECUTE ON FUNCTION increment_library_item_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_library_item_downloads(UUID) TO authenticated;

-- 9. Comentários
COMMENT ON TABLE library_items IS 'Tabela para armazenar itens da biblioteca virtual (ebooks, artigos, revistas, documentos e links)';
COMMENT ON COLUMN library_items.type IS 'Tipo do item: ebook, article, magazine, document ou link';
COMMENT ON COLUMN library_items.cover_url IS 'URL da capa/thumbnail do item (extraída do arquivo enviado)';
COMMENT ON COLUMN library_items.file_url IS 'URL do arquivo ou link externo';
COMMENT ON FUNCTION increment_library_item_views IS 'Incrementa o contador de visualizações de um item da biblioteca';
COMMENT ON FUNCTION increment_library_item_downloads IS 'Incrementa o contador de downloads de um item da biblioteca';


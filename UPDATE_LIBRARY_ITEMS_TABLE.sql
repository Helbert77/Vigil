-- Atualizar tabela library_items para as novas alterações
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar novo tipo 'link'
ALTER TABLE library_items 
DROP CONSTRAINT IF EXISTS library_items_type_check;

ALTER TABLE library_items 
ADD CONSTRAINT library_items_type_check 
CHECK (type IN ('ebook', 'article', 'magazine', 'document', 'link'));

-- 2. Remover colunas desnecessárias
ALTER TABLE library_items 
DROP COLUMN IF EXISTS category;

ALTER TABLE library_items 
DROP COLUMN IF EXISTS read_url;

ALTER TABLE library_items 
DROP COLUMN IF EXISTS download_url;

-- 3. Adicionar nova coluna file_url
ALTER TABLE library_items 
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- 4. Migrar dados existentes (se houver)
-- Se você tinha read_url ou download_url, migrar para file_url
-- UPDATE library_items 
-- SET file_url = COALESCE(read_url, download_url)
-- WHERE file_url IS NULL AND (read_url IS NOT NULL OR download_url IS NOT NULL);

-- 5. Comentários atualizados
COMMENT ON COLUMN library_items.type IS 'Tipo do item: ebook, article, magazine, document ou link';
COMMENT ON COLUMN library_items.file_url IS 'URL do arquivo ou link externo';


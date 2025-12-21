-- ============================================
-- ADICIONAR COLUNA image_url À TABELA timeline_moderation_queue
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- Adicionar coluna image_url se não existir
ALTER TABLE public.timeline_moderation_queue 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Comentário para documentação
COMMENT ON COLUMN public.timeline_moderation_queue.image_url IS 'URL da imagem/mídia do evento submetido para moderação';

-- Verificar se a coluna foi adicionada
SELECT 'image_url column added successfully to timeline_moderation_queue!' AS status;


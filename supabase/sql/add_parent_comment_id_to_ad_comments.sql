-- ========================================
-- ADICIONAR SUPORTE A THREADS DE COMENTÁRIOS
-- Execute este script no SQL Editor do Supabase
-- ========================================

-- Adicionar coluna parent_comment_id se não existir
ALTER TABLE public.ad_comments 
ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES public.ad_comments(id) ON DELETE CASCADE;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_ad_comments_parent_id ON public.ad_comments(parent_comment_id);

-- Adicionar coluna views_count se não existir (já deveria estar, mas garantindo)
ALTER TABLE public.ad_comments 
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- ========================================
-- FIM DO SCRIPT
-- ========================================


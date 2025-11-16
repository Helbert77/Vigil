-- =====================================================
-- ADICIONAR CAMPO show_support_button NA TABELA PROFILES
-- =====================================================
-- Este script adiciona a coluna para controlar a exibição
-- do botão de suporte flutuante
-- =====================================================

-- Adicionar coluna show_support_button
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS show_support_button BOOLEAN DEFAULT true;

-- Comentário na coluna
COMMENT ON COLUMN public.profiles.show_support_button IS 
'Controla se o botão de suporte flutuante é exibido para o usuário. Default: true (mostrar)';

-- Criar índice para melhor performance em queries
CREATE INDEX IF NOT EXISTS idx_profiles_show_support_button 
ON public.profiles(show_support_button);

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================


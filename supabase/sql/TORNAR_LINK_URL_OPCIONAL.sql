-- =====================================================
-- TORNAR LINK_URL OPCIONAL NA TABELA ADS
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Remover constraint NOT NULL da coluna link_url
ALTER TABLE public.ads ALTER COLUMN link_url DROP NOT NULL;

-- Verificação
DO $$
BEGIN
    RAISE NOTICE '✅ Coluna link_url agora é opcional';
    RAISE NOTICE '✅ Você pode criar anúncios sem link para testes';
END $$;


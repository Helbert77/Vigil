-- =====================================================
-- ADICIONAR COLUNA CATEGORY À TABELA chat_rooms
-- =====================================================
-- 
-- Este script garante que a coluna 'category' existe na tabela chat_rooms
-- e define valores padrão para salas existentes.
--
-- INSTRUÇÕES:
-- 1. Abra o Supabase Dashboard
-- 2. Vá em "SQL Editor"
-- 3. Cole este script completo
-- 4. Execute (clique em "Run")
-- =====================================================

-- Adicionar coluna category se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'chat_rooms' 
      AND column_name = 'category'
  ) THEN
    ALTER TABLE public.chat_rooms 
    ADD COLUMN category TEXT DEFAULT 'normal';
    
    -- Atualizar salas existentes baseado em is_hot e is_new
    UPDATE public.chat_rooms 
    SET category = CASE 
      WHEN is_hot = true THEN 'hot'
      WHEN is_new = true THEN 'new'
      ELSE 'normal'
    END;
    
    RAISE NOTICE '✅ Coluna category adicionada com sucesso!';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna category já existe na tabela chat_rooms.';
  END IF;
END $$;

-- Verificar se a coluna foi criada
DO $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'chat_rooms' 
      AND column_name = 'category'
  ) INTO column_exists;
  
  IF column_exists THEN
    RAISE NOTICE '✅ Verificação: Coluna category existe na tabela chat_rooms';
  ELSE
    RAISE WARNING '❌ ERRO: Coluna category NÃO foi criada!';
  END IF;
END $$;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================


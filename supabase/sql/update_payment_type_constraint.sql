-- ============================================
-- ATUALIZAR CONSTRAINT payment_type PARA INCLUIR 'credits'
-- ============================================
-- Este script atualiza a constraint CHECK da coluna payment_type
-- para permitir o valor 'credits' além de 'free', 'package' e 'cpm'

-- 1. Remover a constraint antiga
ALTER TABLE anuncios DROP CONSTRAINT IF EXISTS anuncios_payment_type_check;

-- 2. Adicionar a nova constraint com 'credits' incluído
ALTER TABLE anuncios ADD CONSTRAINT anuncios_payment_type_check 
  CHECK (payment_type IN ('free', 'package', 'cpm', 'credits'));

-- Verificar se a constraint foi aplicada corretamente
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'anuncios_payment_type_check' 
    AND contype = 'c'
  ) THEN
    RAISE NOTICE '✅ Constraint atualizada com sucesso!';
  ELSE
    RAISE EXCEPTION '❌ Erro ao atualizar constraint';
  END IF;
END $$;


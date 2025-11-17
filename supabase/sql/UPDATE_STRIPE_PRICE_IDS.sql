-- ============================================
-- ATUALIZAR IDs DOS PREÇOS DO STRIPE
-- ============================================

-- IMPORTANTE: Substitua os valores 'COLE_O_ID_AQUI' pelos IDs reais
-- copiados do Stripe Dashboard após criar os produtos

-- ============================================
-- 1. VER PACOTES ATUAIS (ANTES DA ATUALIZAÇÃO)
-- ============================================

SELECT 
  name, 
  display_name, 
  price_eur, 
  stripe_price_id,
  CASE 
    WHEN stripe_price_id IS NULL THEN '❌ Precisa ser configurado'
    ELSE '✅ Configurado'
  END as status
FROM ad_packages 
ORDER BY price_eur ASC;

-- ============================================
-- 2. ATUALIZAR IDs DOS PACOTES
-- ============================================

-- BRONZE (€9.90)
UPDATE ad_packages 
SET stripe_price_id = 'price_1SUa3PEm3YwS3vjonYzuhrhh'
WHERE name = 'bronze';

-- PRATA (€24.90)
UPDATE ad_packages 
SET stripe_price_id = 'price_1SUa2qEm3YwS3vjotXFfEpxW'
WHERE name = 'silver';

-- OURO (€49.90)
UPDATE ad_packages 
SET stripe_price_id = 'price_1SUa29Em3YwS3vjoZ4rAUvZj'
WHERE name = 'gold';

-- PLATINA (€99.90)
UPDATE ad_packages 
SET stripe_price_id = 'price_1SUa1MEm3YwS3vjocDmpXnMy'
WHERE name = 'platinum';

-- ============================================
-- 3. VERIFICAR RESULTADO
-- ============================================

SELECT 
  name, 
  display_name, 
  price_eur, 
  stripe_price_id,
  CASE 
    WHEN stripe_price_id IS NULL THEN '❌ Não configurado'
    WHEN stripe_price_id LIKE 'COLE_O_%' THEN '⚠️ Placeholder ainda presente'
    ELSE '✅ Configurado corretamente'
  END as status
FROM ad_packages 
ORDER BY price_eur ASC;

-- ============================================
-- 4. EXEMPLO DE ATUALIZAÇÃO COMPLETA
-- ============================================

/*
  Exemplo com IDs reais do Stripe (substitua pelos seus):

  UPDATE ad_packages SET stripe_price_id = 'price_1Qxx123ABC456def' WHERE name = 'bronze';
  UPDATE ad_packages SET stripe_price_id = 'price_1Qxx456DEF789ghi' WHERE name = 'silver';
  UPDATE ad_packages SET stripe_price_id = 'price_1Qxx789GHI012jkl' WHERE name = 'gold';
  UPDATE ad_packages SET stripe_price_id = 'price_1Qxx012JKL345mno' WHERE name = 'platinum';

  Depois de executar, verifique:
  SELECT * FROM ad_packages;
*/

-- ============================================
-- 5. TESTAR FLUXO DE PAGAMENTO
-- ============================================

/*
  Após atualizar os IDs, teste:
  
  1. Criar um anúncio no app
  2. Selecionar um pacote (ex: Bronze)
  3. Verificar se o Stripe Checkout abre corretamente
  4. Usar cartão de teste: 4242 4242 4242 4242
  5. Completar o pagamento
  6. Verificar se o webhook atualizou o anúncio corretamente
  7. Verificar se o anúncio aparece como "Aguardando Aprovação"
*/

-- ============================================
-- FIM DO SCRIPT
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'INSTRUÇÕES PARA ATUALIZAR STRIPE PRICE IDs';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE '1. Vá para Stripe Dashboard > Catálogo de produtos';
  RAISE NOTICE '2. Para cada produto de anúncio, copie o Price ID';
  RAISE NOTICE '3. Substitua "COLE_O_PRICE_ID_XXX_AQUI" pelos IDs reais';
  RAISE NOTICE '4. Execute este SQL novamente';
  RAISE NOTICE '5. Verifique com: SELECT * FROM ad_packages;';
  RAISE NOTICE '';
  RAISE NOTICE 'EXEMPLO de Price ID: price_1Qxx123ABC456def';
  RAISE NOTICE '';
END $$;


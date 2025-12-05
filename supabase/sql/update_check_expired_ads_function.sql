-- ============================================
-- ATUALIZAR FUNÇÃO check_and_pause_expired_ads
-- ============================================
-- Este script atualiza a função para usar 'ended' em vez de 'completed'
-- Execute este SQL no Supabase SQL Editor

CREATE OR REPLACE FUNCTION check_and_pause_expired_ads()
RETURNS void AS $$
BEGIN
  -- Encerrar anúncios que atingiram a data de término
  UPDATE anuncios
  SET 
    status = 'ended',
    completion_reason = 'duration_ended'
  WHERE 
    status IN ('active', 'paused')
    AND approval_status = 'approved'
    AND end_date IS NOT NULL
    AND end_date < NOW()
    AND status != 'ended';

  -- Encerrar anúncios de pacote que atingiram impressões máximas
  UPDATE anuncios
  SET 
    status = 'ended',
    completion_reason = 'impressions_reached'
  WHERE 
    status IN ('active', 'paused')
    AND approval_status = 'approved'
    AND payment_type = 'package'
    AND max_impressions IS NOT NULL
    AND views_count >= max_impressions
    AND status != 'ended';

  -- Encerrar anúncios CPM que esgotaram o orçamento
  UPDATE anuncios
  SET 
    status = 'ended',
    completion_reason = 'budget_exhausted'
  WHERE 
    status IN ('active', 'paused')
    AND approval_status = 'approved'
    AND payment_type = 'cpm'
    AND budget IS NOT NULL
    AND spent >= budget
    AND status != 'ended';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ATUALIZAR ANÚNCIOS QUE JÁ ESTÃO COMO 'completed'
-- ============================================
-- Se houver anúncios com status 'completed', atualizar para 'ended'
UPDATE anuncios
SET status = 'ended'
WHERE status = 'completed';


-- ============================================
-- CONFIGURAR CRON JOB PARA MONITORAMENTO DE ANÚNCIOS
-- ============================================

-- Habilitar extensão pg_cron se ainda não estiver habilitada
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remover job antigo se existir
SELECT cron.unschedule('check-expired-ads');

-- Criar job para verificar anúncios expirados a cada hora
SELECT cron.schedule(
  'check-expired-ads',          -- Nome do job
  '0 * * * *',                  -- Executa a cada hora (minuto 0)
  $$
  -- Pausar anúncios que atingiram a data de término
  UPDATE anuncios
  SET 
    status = 'completed',
    completion_reason = 'duration_ended'
  WHERE 
    status = 'active'
    AND approval_status = 'approved'
    AND end_date IS NOT NULL
    AND end_date < NOW()
    AND completion_reason IS NULL;

  -- Pausar anúncios de pacote que atingiram impressões máximas
  UPDATE anuncios
  SET 
    status = 'completed',
    completion_reason = 'impressions_reached'
  WHERE 
    status = 'active'
    AND approval_status = 'approved'
    AND payment_type = 'package'
    AND max_impressions IS NOT NULL
    AND views_count >= max_impressions
    AND completion_reason IS NULL;

  -- Pausar anúncios CPM que esgotaram o orçamento
  UPDATE anuncios
  SET 
    status = 'completed',
    completion_reason = 'budget_exhausted'
  WHERE 
    status = 'active'
    AND approval_status = 'approved'
    AND payment_type = 'cpm'
    AND budget IS NOT NULL
    AND spent >= budget
    AND completion_reason IS NULL;
  $$
);

-- Verificar se o job foi criado
SELECT * FROM cron.job WHERE jobname = 'check-expired-ads';

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

-- O cron job será executado automaticamente a cada hora.
-- Para desabilitar temporariamente:
-- SELECT cron.unschedule('check-expired-ads');

-- Para executar manualmente (testar):
-- SELECT cron.run_job('check-expired-ads');

-- Para ver logs de execução:
-- SELECT * FROM cron.job_run_details 
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-expired-ads')
-- ORDER BY start_time DESC LIMIT 10;

-- ============================================
-- FIM DO SCRIPT
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Cron job configurado com sucesso!';
  RAISE NOTICE 'Nome do job: check-expired-ads';
  RAISE NOTICE 'Frequência: A cada hora (0 * * * *)';
  RAISE NOTICE '';
  RAISE NOTICE 'Para verificar o status:';
  RAISE NOTICE '  SELECT * FROM cron.job WHERE jobname = ''check-expired-ads'';';
  RAISE NOTICE '';
  RAISE NOTICE 'Para executar manualmente:';
  RAISE NOTICE '  SELECT cron.run_job(''check-expired-ads'');';
END $$;


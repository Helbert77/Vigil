-- Sistema de limpeza automática de notificações com mais de 90 dias
-- Esta migração cria uma função e um job agendado usando pg_cron
-- 
-- O sistema executa automaticamente todos os dias às 3h da manhã UTC
-- e remove todas as notificações criadas há mais de 90 dias

-- Função para limpar notificações antigas (mais de 90 dias)
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS TABLE(deleted_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  deleted_rows bigint;
BEGIN
  -- Deletar notificações com mais de 90 dias
  DELETE FROM public.notifications
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_rows = ROW_COUNT;
  
  -- Retornar o número de registros deletados
  RETURN QUERY SELECT deleted_rows;
  
  -- Log opcional (pode ser removido em produção se não houver tabela de logs)
  RAISE NOTICE 'Limpeza de notificações concluída: % registros deletados', deleted_rows;
END;
$$;

-- Garantir permissões para a função
GRANT EXECUTE ON FUNCTION public.cleanup_old_notifications() TO service_role;

-- Criar job agendado para executar a limpeza diariamente às 3h da manhã (horário de menor tráfego)
-- O job será executado todos os dias às 03:00 UTC
-- Para alterar o horário, use: SELECT cron.alter_job(jobid, schedule='0 HORA * * *');
SELECT cron.schedule(
  'cleanup-old-notifications-daily',
  '0 3 * * *', -- Cron expression: todos os dias às 3h da manhã UTC
  $$SELECT public.cleanup_old_notifications()$$
);

-- Comentário explicativo
COMMENT ON FUNCTION public.cleanup_old_notifications() IS 
'Função que remove automaticamente notificações com mais de 90 dias. Executada diariamente via pg_cron.';

-- ============================================================================
-- COMANDOS ÚTEIS PARA GERENCIAR O JOB:
-- ============================================================================

-- Verificar se o job está ativo:
-- SELECT jobid, schedule, command, active FROM cron.job WHERE jobname = 'cleanup-old-notifications-daily';

-- Executar manualmente a limpeza:
-- SELECT * FROM public.cleanup_old_notifications();

-- Desativar o job (se necessário):
-- SELECT cron.unschedule('cleanup-old-notifications-daily');

-- Reativar o job:
-- SELECT cron.schedule('cleanup-old-notifications-daily', '0 3 * * *', $$SELECT public.cleanup_old_notifications()$$);

-- Alterar o horário do job (exemplo: mudar para 2h da manhã):
-- SELECT cron.alter_job((SELECT jobid FROM cron.job WHERE jobname = 'cleanup-old-notifications-daily'), schedule='0 2 * * *');

-- Ver histórico de execuções:
-- SELECT * FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'cleanup-old-notifications-daily') ORDER BY start_time DESC LIMIT 10;

-- =====================================================
-- SISTEMA DE LIMPEZA AUTOMÁTICA DE PARTICIPANTES INATIVOS
-- =====================================================
-- Este script cria uma função e um job agendado para remover
-- automaticamente usuários inativos das salas de chat
-- 
-- Critério: Usuários sem atividade há mais de 5 minutos
-- Frequência: Executa a cada 1 minuto
-- =====================================================

-- 1. Função para limpar participantes inativos
CREATE OR REPLACE FUNCTION public.cleanup_inactive_chat_participants()
RETURNS TABLE(
  deleted_count bigint,
  affected_rooms uuid[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_rows bigint;
  room_ids uuid[];
BEGIN
  -- Coletar IDs das salas afetadas antes de deletar
  SELECT ARRAY_AGG(DISTINCT room_id)
  INTO room_ids
  FROM public.chat_room_participants
  WHERE last_activity < NOW() - INTERVAL '5 minutes';
  
  -- Deletar participantes inativos (sem atividade há mais de 5 minutos)
  DELETE FROM public.chat_room_participants
  WHERE last_activity < NOW() - INTERVAL '5 minutes';
  
  GET DIAGNOSTICS deleted_rows = ROW_COUNT;
  
  -- Atualizar contador de usuários online nas salas afetadas
  IF room_ids IS NOT NULL AND array_length(room_ids, 1) > 0 THEN
    UPDATE public.chat_rooms
    SET users_online = (
      SELECT COUNT(*)
      FROM public.chat_room_participants
      WHERE chat_room_participants.room_id = chat_rooms.id
    ),
    updated_at = NOW()
    WHERE id = ANY(room_ids);
  END IF;
  
  -- Retornar resultados
  RETURN QUERY SELECT deleted_rows, room_ids;
  
  -- Log opcional
  IF deleted_rows > 0 THEN
    RAISE NOTICE 'Limpeza de participantes inativos: % usuários removidos de % salas', 
      deleted_rows, 
      COALESCE(array_length(room_ids, 1), 0);
  END IF;
END;
$$;

-- 2. Garantir permissões para a função
GRANT EXECUTE ON FUNCTION public.cleanup_inactive_chat_participants() TO service_role;

-- 3. Comentário explicativo
COMMENT ON FUNCTION public.cleanup_inactive_chat_participants() IS 
'Remove automaticamente participantes de salas de chat sem atividade há mais de 5 minutos. Atualiza contadores de users_online.';

-- =====================================================
-- JOB AGENDADO (PG_CRON)
-- =====================================================

-- 4. Criar job agendado para executar a limpeza a cada 1 minuto
-- IMPORTANTE: Descomente a linha abaixo APENAS se pg_cron estiver habilitado
-- SELECT cron.schedule(
--   'cleanup-inactive-chat-participants',
--   '* * * * *', -- Cron expression: a cada 1 minuto
--   $$SELECT public.cleanup_inactive_chat_participants()$$
-- );

-- =====================================================
-- TRIGGER ALTERNATIVO (SE PG_CRON NÃO ESTIVER DISPONÍVEL)
-- =====================================================

-- 5. Criar função trigger para limpeza sob demanda
CREATE OR REPLACE FUNCTION public.trigger_cleanup_inactive_participants()
RETURNS TRIGGER AS $$
BEGIN
  -- Executar limpeza quando houver nova atividade
  PERFORM public.cleanup_inactive_chat_participants();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger que executa a limpeza periodicamente
-- (Dispara quando há UPDATE em last_activity)
DROP TRIGGER IF EXISTS auto_cleanup_inactive_participants ON chat_room_participants;
CREATE TRIGGER auto_cleanup_inactive_participants
  AFTER UPDATE OF last_activity ON chat_room_participants
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_cleanup_inactive_participants();

-- =====================================================
-- COMANDOS ÚTEIS PARA TESTE E GERENCIAMENTO
-- =====================================================

-- Executar limpeza manualmente:
-- SELECT * FROM public.cleanup_inactive_chat_participants();

-- Ver participantes inativos (sem remover):
-- SELECT 
--   crp.id,
--   crp.room_id,
--   crp.user_id,
--   crp.last_activity,
--   NOW() - crp.last_activity AS inactive_duration,
--   cr.name AS room_name
-- FROM chat_room_participants crp
-- JOIN chat_rooms cr ON cr.id = crp.room_id
-- WHERE crp.last_activity < NOW() - INTERVAL '5 minutes'
-- ORDER BY crp.last_activity ASC;

-- Verificar se o job está ativo (se pg_cron estiver habilitado):
-- SELECT jobid, schedule, command, active 
-- FROM cron.job 
-- WHERE jobname = 'cleanup-inactive-chat-participants';

-- Desabilitar o job (se necessário):
-- SELECT cron.unschedule('cleanup-inactive-chat-participants');

-- Alterar frequência do job (exemplo: a cada 30 segundos):
-- SELECT cron.alter_job(
--   (SELECT jobid FROM cron.job WHERE jobname = 'cleanup-inactive-chat-participants'),
--   schedule := '*/30 * * * * *'
-- );

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

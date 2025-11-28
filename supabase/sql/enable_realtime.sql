-- =====================================================
-- HABILITAR REALTIME PARA chat_room_participants
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- 1. Verificar status atual do Realtime
SELECT 
  schemaname, 
  tablename,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'chat_room_participants'
    ) THEN '✅ HABILITADO' 
    ELSE '❌ DESABILITADO' 
  END as realtime_status
FROM pg_tables 
WHERE tablename = 'chat_room_participants';

-- 2. Habilitar Realtime para a tabela
ALTER PUBLICATION supabase_realtime ADD TABLE chat_room_participants;

-- 3. Verificar se foi habilitado
SELECT 
  schemaname, 
  tablename,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'chat_room_participants'
    ) THEN '✅ HABILITADO' 
    ELSE '❌ DESABILITADO' 
  END as realtime_status
FROM pg_tables 
WHERE tablename = 'chat_room_participants';

-- Deve mostrar: ✅ HABILITADO

-- 4. Listar todas as tabelas com Realtime habilitado
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- =====================================================
-- AGORA TESTE NO FRONTEND
-- =====================================================
-- 1. Recarregue a página
-- 2. Usuário 1 entra em uma sala
-- 3. Usuário 2 entra na mesma sala
-- 4. Deve aparecer no console do Usuário 1:
--    [subscribeToRoomParticipants] 🔥 EVENTO RECEBIDO


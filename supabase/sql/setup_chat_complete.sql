-- =====================================================
-- CONFIGURAÇÃO COMPLETA DO SISTEMA DE CHAT
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PARTE 1: VERIFICAR ESTRUTURA DAS TABELAS
-- =====================================================

-- As políticas RLS atuais estão corretas, vamos mantê-las
-- Apenas vamos adicionar índices para performance

-- =====================================================
-- PARTE 2: ADICIONAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para chat_room_participants
CREATE INDEX IF NOT EXISTS idx_participants_room_id ON chat_room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON chat_room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_room_user ON chat_room_participants(room_id, user_id);

-- Índices para chat_room_messages
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON chat_room_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON chat_room_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON chat_room_messages(created_at);

-- Índices para chat_rooms
CREATE INDEX IF NOT EXISTS idx_rooms_created_by ON chat_rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON chat_rooms(created_at);

-- =====================================================
-- PARTE 3: VERIFICAR POLÍTICAS RLS
-- =====================================================

SELECT 
  tablename,
  policyname,
  cmd as operation
FROM pg_policies 
WHERE tablename IN ('chat_rooms', 'chat_room_participants', 'chat_room_messages')
ORDER BY tablename, cmd;

-- Resultado esperado:
-- chat_rooms: 4 políticas (SELECT, INSERT, UPDATE, DELETE)
-- chat_room_participants: 4 políticas (SELECT, INSERT, UPDATE, DELETE)
-- chat_room_messages: 4 políticas (SELECT, INSERT, UPDATE, DELETE)

-- =====================================================
-- PARTE 4: LIMPAR DADOS ANTIGOS (OPCIONAL)
-- =====================================================

-- Descomente se quiser começar do zero
-- TRUNCATE TABLE chat_room_participants CASCADE;
-- TRUNCATE TABLE chat_room_messages CASCADE;

-- =====================================================
-- PARTE 5: TESTE
-- =====================================================

-- Verificar participantes por sala
SELECT 
  cr.name as room_name,
  COUNT(crp.user_id) as participants,
  array_agg(p.username) as usernames
FROM chat_rooms cr
LEFT JOIN chat_room_participants crp ON crp.room_id = cr.id
LEFT JOIN profiles p ON p.id = crp.user_id
GROUP BY cr.id, cr.name
ORDER BY participants DESC;

-- =====================================================
-- CONFIGURAÇÃO COMPLETA! ✅
-- =====================================================


-- =====================================================
-- TRIGGERS PARA CONTAGEM AUTOMÁTICA DE PARTICIPANTES
-- =====================================================
-- 
-- INSTRUÇÕES DE USO:
-- 1. Abra o Supabase Dashboard
-- 2. Vá em "SQL Editor"
-- 3. Cole este script completo
-- 4. Execute (clique em "Run")
--
-- Este script cria triggers automáticos que incrementam/decrementam
-- o contador users_online na tabela chat_rooms quando usuários
-- entram ou saem das salas.
--
-- Baseado no schema original do Odigo Unified Messenger
-- =====================================================

-- Primeiro, vamos recriar as funções para usar NEW e OLD internamente
CREATE OR REPLACE FUNCTION increment_room_users_trigger()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_rooms 
  SET users_online = users_online + 1, updated_at = NOW()
  WHERE id = NEW.room_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_room_users_trigger()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_rooms 
  SET users_online = GREATEST(users_online - 1, 0), updated_at = NOW()
  WHERE id = OLD.room_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger para incrementar contador quando usuário entra na sala
DROP TRIGGER IF EXISTS increment_room_count_on_join ON chat_room_participants;
CREATE TRIGGER increment_room_count_on_join
  AFTER INSERT ON chat_room_participants
  FOR EACH ROW
  EXECUTE FUNCTION increment_room_users_trigger();

-- Trigger para decrementar contador quando usuário sai da sala
DROP TRIGGER IF EXISTS decrement_room_count_on_leave ON chat_room_participants;
CREATE TRIGGER decrement_room_count_on_leave
  AFTER DELETE ON chat_room_participants
  FOR EACH ROW
  EXECUTE FUNCTION decrement_room_users_trigger();

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
--
-- VERIFICAÇÃO:
-- Para verificar se os triggers foram criados corretamente, execute:
--
-- SELECT trigger_name, event_manipulation, event_object_table 
-- FROM information_schema.triggers 
-- WHERE trigger_name IN ('increment_room_count_on_join', 'decrement_room_count_on_leave');
--
-- Você deve ver 2 linhas retornadas.
-- =====================================================


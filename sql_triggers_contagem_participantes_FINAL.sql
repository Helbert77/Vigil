-- =====================================================
-- TRIGGERS PARA CONTAGEM AUTOMÁTICA DE PARTICIPANTES
-- VERSÃO FINAL - CORRIGIDA
-- =====================================================
-- 
-- INSTRUÇÕES DE USO:
-- 1. Abra o Supabase Dashboard
-- 2. Vá em "SQL Editor"
-- 3. Cole este script completo
-- 4. Execute (clique em "Run")
--
-- =====================================================

-- PASSO 1: Remover triggers antigos (se existirem)
DROP TRIGGER IF EXISTS increment_room_count_on_join ON chat_room_participants;
DROP TRIGGER IF EXISTS decrement_room_count_on_leave ON chat_room_participants;

-- PASSO 2: Remover funções antigas (se existirem)
DROP FUNCTION IF EXISTS increment_room_users_trigger();
DROP FUNCTION IF EXISTS decrement_room_users_trigger();
DROP FUNCTION IF EXISTS increment_room_users(UUID);
DROP FUNCTION IF EXISTS decrement_room_users(UUID);

-- PASSO 3: Criar novas funções
CREATE OR REPLACE FUNCTION increment_room_users_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Log para debug (opcional, pode remover depois)
  RAISE NOTICE 'Incrementing users_online for room %', NEW.room_id;
  
  UPDATE chat_rooms 
  SET users_online = COALESCE(users_online, 0) + 1, 
      updated_at = NOW()
  WHERE id = NEW.room_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_room_users_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Log para debug (opcional, pode remover depois)
  RAISE NOTICE 'Decrementing users_online for room %', OLD.room_id;
  
  UPDATE chat_rooms 
  SET users_online = GREATEST(COALESCE(users_online, 0) - 1, 0), 
      updated_at = NOW()
  WHERE id = OLD.room_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- PASSO 4: Criar triggers
CREATE TRIGGER increment_room_count_on_join
  AFTER INSERT ON chat_room_participants
  FOR EACH ROW
  EXECUTE FUNCTION increment_room_users_trigger();

CREATE TRIGGER decrement_room_count_on_leave
  AFTER DELETE ON chat_room_participants
  FOR EACH ROW
  EXECUTE FUNCTION decrement_room_users_trigger();

-- =====================================================
-- VERIFICAÇÃO AUTOMÁTICA
-- =====================================================

-- Verificar se triggers foram criados
DO $$
DECLARE
  trigger_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers 
  WHERE trigger_name IN ('increment_room_count_on_join', 'decrement_room_count_on_leave');
  
  IF trigger_count = 2 THEN
    RAISE NOTICE '✅ SUCCESS: Ambos os triggers foram criados corretamente!';
  ELSE
    RAISE WARNING '⚠️ ATENÇÃO: Apenas % trigger(s) foram criados. Esperado: 2', trigger_count;
  END IF;
END $$;

-- Verificar se funções foram criadas
DO $$
DECLARE
  function_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO function_count
  FROM pg_proc 
  WHERE proname IN ('increment_room_users_trigger', 'decrement_room_users_trigger');
  
  IF function_count = 2 THEN
    RAISE NOTICE '✅ SUCCESS: Ambas as funções foram criadas corretamente!';
  ELSE
    RAISE WARNING '⚠️ ATENÇÃO: Apenas % função(ões) foram criadas. Esperado: 2', function_count;
  END IF;
END $$;

-- Verificar estrutura da tabela chat_rooms
DO $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'chat_rooms' 
    AND column_name = 'users_online'
  ) INTO column_exists;
  
  IF column_exists THEN
    RAISE NOTICE '✅ SUCCESS: Coluna users_online existe na tabela chat_rooms';
  ELSE
    RAISE WARNING '❌ ERRO: Coluna users_online NÃO existe na tabela chat_rooms!';
  END IF;
END $$;

-- =====================================================
-- TESTE MANUAL (OPCIONAL)
-- =====================================================
-- 
-- Para testar manualmente, descomente e execute:
-- 
-- -- 1. Ver estado atual de uma sala
-- SELECT id, name, users_online FROM chat_rooms LIMIT 1;
-- 
-- -- 2. Inserir um participante (SUBSTITUA os UUIDs)
-- INSERT INTO chat_room_participants (room_id, user_id, joined_at, last_activity)
-- VALUES ('UUID-DA-SALA', 'UUID-DO-USUARIO', NOW(), NOW());
-- 
-- -- 3. Verificar se incrementou
-- SELECT id, name, users_online FROM chat_rooms WHERE id = 'UUID-DA-SALA';
-- 
-- -- 4. Remover o participante
-- DELETE FROM chat_room_participants 
-- WHERE room_id = 'UUID-DA-SALA' AND user_id = 'UUID-DO-USUARIO';
-- 
-- -- 5. Verificar se decrementou
-- SELECT id, name, users_online FROM chat_rooms WHERE id = 'UUID-DA-SALA';
-- 
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '🎉 Script executado com sucesso! Verifique as mensagens acima.';
END $$;


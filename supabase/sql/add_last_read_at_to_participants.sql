-- Adicionar coluna para rastrear última leitura
ALTER TABLE chat_room_participants
ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_participants_last_read
ON chat_room_participants(room_id, user_id, last_read_at);

-- Atualizar registros existentes com timestamp atual
UPDATE chat_room_participants
SET last_read_at = NOW()
WHERE last_read_at IS NULL;

-- Função para contar mensagens não lidas de uma sala para um usuário
CREATE OR REPLACE FUNCTION get_room_unread_count(p_room_id UUID, p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_last_read TIMESTAMP WITH TIME ZONE;
  v_unread_count INTEGER;
BEGIN
  -- Buscar último timestamp de leitura
  SELECT last_read_at INTO v_last_read
  FROM chat_room_participants
  WHERE room_id = p_room_id AND user_id = p_user_id;

  -- Se não encontrou, retornar 0
  IF v_last_read IS NULL THEN
    RETURN 0;
  END IF;

  -- Contar mensagens após última leitura
  SELECT COUNT(*) INTO v_unread_count
  FROM chat_room_messages
  WHERE room_id = p_room_id
    AND created_at > v_last_read
    AND user_id != p_user_id; -- Não contar mensagens do próprio usuário

  RETURN v_unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

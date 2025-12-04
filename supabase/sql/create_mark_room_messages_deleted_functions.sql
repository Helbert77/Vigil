-- Função RPC para adicionar um usuário ao array deleted_by_users de uma mensagem específica
CREATE OR REPLACE FUNCTION add_user_to_deleted_by(
  p_message_id UUID,
  p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE chat_room_messages
  SET deleted_by_users = CASE
    WHEN deleted_by_users IS NULL THEN ARRAY[p_user_id]
    WHEN NOT (p_user_id = ANY(deleted_by_users)) THEN array_append(deleted_by_users, p_user_id)
    ELSE deleted_by_users
  END,
  updated_at = NOW()
  WHERE id = p_message_id;
END;
$$ LANGUAGE plpgsql;

-- Função RPC para marcar todas as mensagens de uma sala como deletadas por um usuário
-- Esta função é mais eficiente do que atualizar mensagem por mensagem
CREATE OR REPLACE FUNCTION mark_all_room_messages_deleted(
  p_room_id UUID,
  p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE chat_room_messages
  SET deleted_by_users = CASE
    WHEN deleted_by_users IS NULL THEN ARRAY[p_user_id]
    WHEN NOT (p_user_id = ANY(deleted_by_users)) THEN array_append(deleted_by_users, p_user_id)
    ELSE deleted_by_users
  END,
  updated_at = NOW()
  WHERE room_id = p_room_id
    AND (deleted_by_users IS NULL OR NOT (p_user_id = ANY(deleted_by_users)));
END;
$$ LANGUAGE plpgsql;

-- Comentários explicativos
COMMENT ON FUNCTION add_user_to_deleted_by IS 'Adiciona um usuário ao array deleted_by_users de uma mensagem específica';
COMMENT ON FUNCTION mark_all_room_messages_deleted IS 'Marca todas as mensagens de uma sala como deletadas por um usuário (ocultação local)';


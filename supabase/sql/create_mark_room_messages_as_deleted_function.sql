-- Função RPC para marcar todas as mensagens de uma sala como deletadas por um usuário
-- Isso é mais eficiente do que atualizar mensagem por mensagem
CREATE OR REPLACE FUNCTION mark_room_messages_as_deleted(
  p_room_id UUID,
  p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Atualizar todas as mensagens da sala adicionando o user_id ao array deleted_by_users
  -- Usando array_append apenas se o user_id ainda não estiver no array
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


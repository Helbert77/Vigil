-- Adicionar coluna para armazenar IDs dos usuários que deletaram a mensagem (ocultação local)
-- Esta coluna permite sincronização entre dispositivos
ALTER TABLE chat_room_messages 
ADD COLUMN IF NOT EXISTS deleted_by_users UUID[] DEFAULT '{}';

-- Criar índice GIN para melhorar performance nas consultas com arrays
CREATE INDEX IF NOT EXISTS idx_chat_room_messages_deleted_by_users 
ON chat_room_messages USING GIN (deleted_by_users);

-- Comentário explicativo
COMMENT ON COLUMN chat_room_messages.deleted_by_users IS 'Array de IDs de usuários que deletaram/ocultaram esta mensagem localmente. Permite sincronização entre dispositivos.';

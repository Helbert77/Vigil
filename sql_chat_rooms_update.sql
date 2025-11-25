-- =====================================================
-- SQL COMPLETO PARA CRIAR/ATUALIZAR TABELAS DE CHAT
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- 1. Criar tabela chat_rooms se não existir
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  users_online INTEGER DEFAULT 0,
  is_hot BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  category VARCHAR(50) DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Colunas novas que serão adicionadas abaixo
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  max_participants INTEGER DEFAULT 100,
  is_public BOOLEAN DEFAULT TRUE,
  participant_count INTEGER DEFAULT 0
);

-- 2. Criar tabela chat_room_participants se não existir
CREATE TABLE IF NOT EXISTS chat_room_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- 3. Criar tabela chat_room_messages se não existir
CREATE TABLE IF NOT EXISTS chat_room_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Adicionar colunas faltantes na tabela chat_rooms (caso a tabela já exista sem essas colunas)
DO $$
BEGIN
  -- Add created_by column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'chat_rooms' 
      AND column_name = 'created_by'
  ) THEN
    ALTER TABLE chat_rooms ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  -- Add max_participants column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'chat_rooms' 
      AND column_name = 'max_participants'
  ) THEN
    ALTER TABLE chat_rooms ADD COLUMN max_participants INTEGER DEFAULT 100;
  END IF;

  -- Add is_public column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'chat_rooms' 
      AND column_name = 'is_public'
  ) THEN
    ALTER TABLE chat_rooms ADD COLUMN is_public BOOLEAN DEFAULT TRUE;
  END IF;

  -- Add participant_count column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'chat_rooms' 
      AND column_name = 'participant_count'
  ) THEN
    ALTER TABLE chat_rooms ADD COLUMN participant_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- 3. Atualizar salas existentes com valores padrão
-- Para salas antigas sem created_by, vamos considerar como públicas
UPDATE chat_rooms 
SET 
  max_participants = COALESCE(max_participants, 100),
  is_public = COALESCE(is_public, TRUE),
  participant_count = COALESCE(participant_count, COALESCE(users_online, 0))
WHERE max_participants IS NULL OR is_public IS NULL OR participant_count IS NULL;

-- 4. Habilitar RLS na tabela (se ainda não estiver habilitado)
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

-- 5. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Authenticated users can view chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can create chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can update own chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can delete own chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Admins can manage all chat rooms" ON chat_rooms;

-- 6. Criar novas políticas RLS para chat_rooms

-- Política para visualizar salas (públicas ou criadas pelo usuário)
-- Salas sem created_by (antigas) são consideradas públicas
CREATE POLICY "Authenticated users can view chat rooms" ON chat_rooms
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      is_public = TRUE OR 
      created_by = auth.uid() OR
      created_by IS NULL  -- Salas antigas sem criador são públicas
    )
  );

-- Política para criar salas
CREATE POLICY "Users can create chat rooms" ON chat_rooms
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND created_by = auth.uid()
  );

-- Política para atualizar salas (criador ou admin/moderador)
-- Admins/moderadores podem atualizar qualquer sala, incluindo as antigas sem criador
CREATE POLICY "Users can update own chat rooms" ON chat_rooms
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (
      created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'moderator')
      )
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND (
      created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'moderator')
      )
    )
  );

-- Política para excluir salas (criador ou admin/moderador)
-- Apenas admins/moderadores podem excluir salas antigas sem criador
CREATE POLICY "Users can delete own chat rooms" ON chat_rooms
  FOR DELETE USING (
    auth.role() = 'authenticated' AND (
      created_by = auth.uid() OR
      (created_by IS NULL AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'moderator')
      )) OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'moderator')
      )
    )
  );

-- 7. Conceder permissões necessárias
GRANT INSERT ON chat_rooms TO authenticated;
GRANT UPDATE ON chat_rooms TO authenticated;
GRANT DELETE ON chat_rooms TO authenticated;

-- 8. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_by ON chat_rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_is_public ON chat_rooms(is_public);

-- Índices para chat_room_participants
CREATE INDEX IF NOT EXISTS idx_chat_room_participants_room_id ON chat_room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_participants_user_id ON chat_room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_participants_room_user ON chat_room_participants(room_id, user_id);

-- Índices para chat_room_messages
CREATE INDEX IF NOT EXISTS idx_chat_room_messages_room_id ON chat_room_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_messages_user_id ON chat_room_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_messages_created_at ON chat_room_messages(created_at DESC);

-- 9. Habilitar RLS nas tabelas de participantes e mensagens
ALTER TABLE chat_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_messages ENABLE ROW LEVEL SECURITY;

-- 10. Políticas RLS para chat_room_participants
DROP POLICY IF EXISTS "Users can view room participants" ON chat_room_participants;
DROP POLICY IF EXISTS "Users can join chat rooms" ON chat_room_participants;
DROP POLICY IF EXISTS "Users can leave chat rooms" ON chat_room_participants;

CREATE POLICY "Users can view room participants" ON chat_room_participants
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      -- Users can see participants if the room is public
      EXISTS (
        SELECT 1 FROM chat_rooms
        WHERE id = chat_room_participants.room_id 
        AND (is_public = TRUE OR created_by IS NULL)
      )
    )
  );

CREATE POLICY "Users can join chat rooms" ON chat_room_participants
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Users can leave chat rooms" ON chat_room_participants
  FOR DELETE USING (
    auth.uid() = user_id
  );

-- 11. Políticas RLS para chat_room_messages
DROP POLICY IF EXISTS "Users can view room messages" ON chat_room_messages;
DROP POLICY IF EXISTS "Users can send messages to rooms" ON chat_room_messages;

CREATE POLICY "Users can view room messages" ON chat_room_messages
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      -- Users can see messages if the room is public
      EXISTS (
        SELECT 1 FROM chat_rooms
        WHERE id = chat_room_messages.room_id 
        AND (is_public = TRUE OR created_by IS NULL)
      )
    )
  );

CREATE POLICY "Users can send messages to rooms" ON chat_room_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM chat_room_participants
      WHERE user_id = auth.uid() AND room_id = chat_room_messages.room_id
    )
  );

-- 12. Conceder permissões
GRANT SELECT ON chat_room_participants TO authenticated;
GRANT INSERT ON chat_room_participants TO authenticated;
GRANT DELETE ON chat_room_participants TO authenticated;

GRANT SELECT ON chat_room_messages TO authenticated;
GRANT INSERT ON chat_room_messages TO authenticated;

-- 13. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 14. Triggers para updated_at
DROP TRIGGER IF EXISTS update_chat_rooms_updated_at ON chat_rooms;
CREATE TRIGGER update_chat_rooms_updated_at
  BEFORE UPDATE ON chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_room_messages_updated_at ON chat_room_messages;
CREATE TRIGGER update_chat_room_messages_updated_at
  BEFORE UPDATE ON chat_room_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FIM DO SQL
-- =====================================================


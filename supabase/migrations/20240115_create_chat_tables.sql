-- Chat system tables for Vigil application

-- Table for private messages between users
CREATE TABLE IF NOT EXISTS private_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for private messages
CREATE INDEX IF NOT EXISTS idx_private_messages_sender_id ON private_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_receiver_id ON private_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_created_at ON private_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_private_messages_conversation ON private_messages(
  LEAST(sender_id, receiver_id), 
  GREATEST(sender_id, receiver_id), 
  created_at DESC
);

-- Table for chat rooms
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  users_online INTEGER DEFAULT 0,
  is_hot BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  category VARCHAR(50) DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for chat room participants
CREATE TABLE IF NOT EXISTS chat_room_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Table for chat room messages
CREATE TABLE IF NOT EXISTS chat_room_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for chat room messages
CREATE INDEX IF NOT EXISTS idx_chat_room_messages_room_id ON chat_room_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_messages_user_id ON chat_room_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_messages_created_at ON chat_room_messages(created_at DESC);

-- Function to increment room users count
CREATE OR REPLACE FUNCTION increment_room_users(room_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE chat_rooms 
  SET users_online = users_online + 1, updated_at = NOW()
  WHERE id = room_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement room users count
CREATE OR REPLACE FUNCTION decrement_room_users(room_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE chat_rooms 
  SET users_online = GREATEST(users_online - 1, 0), updated_at = NOW()
  WHERE id = room_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update last activity
CREATE OR REPLACE FUNCTION update_participant_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_private_messages_updated_at
  BEFORE UPDATE ON private_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_participant_activity();

CREATE TRIGGER IF NOT EXISTS update_chat_rooms_updated_at
  BEFORE UPDATE ON chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_participant_activity();

CREATE TRIGGER IF NOT EXISTS update_chat_room_messages_updated_at
  BEFORE UPDATE ON chat_room_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_participant_activity();

-- RLS Policies for private messages
ALTER TABLE private_messages ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own messages
CREATE POLICY "Users can view their own messages" ON private_messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Allow users to send messages
CREATE POLICY "Users can send messages" ON private_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
  );

-- Allow users to update read status of messages they received
CREATE POLICY "Users can mark their messages as read" ON private_messages
  FOR UPDATE USING (
    auth.uid() = receiver_id
  );

-- RLS Policies for chat rooms
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view chat rooms
CREATE POLICY "Authenticated users can view chat rooms" ON chat_rooms
  FOR SELECT USING (
    auth.role() = 'authenticated'
  );

-- RLS Policies for chat room participants
ALTER TABLE chat_room_participants ENABLE ROW LEVEL SECURITY;

-- Allow users to view participants of rooms they are in
CREATE POLICY "Users can view room participants" ON chat_room_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_room_participants
      WHERE user_id = auth.uid() AND room_id = chat_room_participants.room_id
    )
  );

-- Allow users to join rooms
CREATE POLICY "Users can join chat rooms" ON chat_room_participants
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

-- Allow users to leave rooms
CREATE POLICY "Users can leave chat rooms" ON chat_room_participants
  FOR DELETE USING (
    auth.uid() = user_id
  );

-- RLS Policies for chat room messages
ALTER TABLE chat_room_messages ENABLE ROW LEVEL SECURITY;

-- Allow users to view messages from rooms they are in
CREATE POLICY "Users can view room messages" ON chat_room_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_room_participants
      WHERE user_id = auth.uid() AND room_id = chat_room_messages.room_id
    )
  );

-- Allow users to send messages to rooms they are in
CREATE POLICY "Users can send messages to rooms" ON chat_room_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM chat_room_participants
      WHERE user_id = auth.uid() AND room_id = chat_room_messages.room_id
    )
  );

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON private_messages TO anon, authenticated;
GRANT INSERT ON private_messages TO authenticated;
GRANT UPDATE ON private_messages TO authenticated;

GRANT SELECT ON chat_rooms TO anon, authenticated;

GRANT SELECT ON chat_room_participants TO authenticated;
GRANT INSERT ON chat_room_participants TO authenticated;
GRANT DELETE ON chat_room_participants TO authenticated;

GRANT SELECT ON chat_room_messages TO authenticated;
GRANT INSERT ON chat_room_messages TO authenticated;

-- Insert default chat rooms
INSERT INTO chat_rooms (name, description, users_online, is_hot, is_new, category) VALUES
  ('Conspirações', 'Teorias e discussões sobre conspirações', 156, true, false, 'hot'),
  ('Despertar', 'Espiritualidade e consciência', 89, false, true, 'new'),
  ('Matrix', 'Sistema e controle', 234, true, false, 'hot'),
  ('Red Pill', 'Verdades ocultas', 67, false, true, 'new'),
  ('QG Vigil', 'Comando central da comunidade', 45, false, false, 'normal'),
  ('Desmistificando', 'Fatos vs Ficção', 123, true, false, 'hot'),
  ('Consciência', 'Expandindo mentes e consciência', 78, false, true, 'new'),
  ('Revolution', 'Mudanças necessárias', 91, false, false, 'normal')
ON CONFLICT DO NOTHING;
-- =====================================================
-- Odigo Unified Messenger - Database Schema
-- Version: 1.0
-- Database: PostgreSQL (Supabase)
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE online_status AS ENUM ('online', 'away', 'busy', 'offline');
CREATE TYPE buddy_status AS ENUM ('pending', 'accepted', 'blocked');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

-- =====================================================
-- TABLES
-- =====================================================

-- ----------------
-- USERS TABLE
-- ----------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 13 AND age <= 120),
    gender gender_type NOT NULL,
    location TEXT NOT NULL,
    bio TEXT,
    interests TEXT[] DEFAULT '{}',
    avatar_url TEXT,
    mood TEXT DEFAULT '😊 Happy',
    status_message TEXT,
    online_status online_status DEFAULT 'offline',
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    public_key TEXT, -- For E2E encryption
    show_location BOOLEAN DEFAULT true,
    show_age BOOLEAN DEFAULT true,
    who_can_message TEXT DEFAULT 'everyone', -- 'everyone' or 'buddies'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------
-- BUDDIES TABLE
-- ----------------
CREATE TABLE buddies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    buddy_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status buddy_status DEFAULT 'accepted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, buddy_id),
    CHECK (user_id != buddy_id)
);

-- ----------------
-- CHAT ROOMS TABLE
-- ----------------
CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    emoji TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    user_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------
-- ROOM MESSAGES TABLE
-- ----------------
CREATE TABLE room_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL CHECK (length(content) <= 2000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------
-- PRIVATE MESSAGES TABLE
-- ----------------
CREATE TABLE private_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    encrypted_content TEXT NOT NULL, -- Base64 encrypted message
    iv TEXT NOT NULL, -- Initialization vector
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    CHECK (sender_id != recipient_id)
);

-- ----------------
-- USER PRESENCE TABLE
-- ----------------
CREATE TABLE user_presence (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    online_status online_status DEFAULT 'offline',
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_room_id UUID REFERENCES chat_rooms(id) ON DELETE SET NULL
);

-- ----------------
-- ROOM PARTICIPANTS TABLE
-- ----------------
CREATE TABLE room_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_location ON users USING GIN(to_tsvector('english', location));
CREATE INDEX idx_users_interests ON users USING GIN(interests);
CREATE INDEX idx_users_online_status ON users(online_status);

-- Buddies indexes
CREATE INDEX idx_buddies_user_id ON buddies(user_id);
CREATE INDEX idx_buddies_buddy_id ON buddies(buddy_id);
CREATE INDEX idx_buddies_status ON buddies(status);
CREATE INDEX idx_buddies_last_message ON buddies(last_message_at DESC NULLS LAST);

-- Room messages indexes
CREATE INDEX idx_room_messages_room_id ON room_messages(room_id);
CREATE INDEX idx_room_messages_user_id ON room_messages(user_id);
CREATE INDEX idx_room_messages_created_at ON room_messages(created_at DESC);

-- Private messages indexes
CREATE INDEX idx_private_messages_sender ON private_messages(sender_id);
CREATE INDEX idx_private_messages_recipient ON private_messages(recipient_id);
CREATE INDEX idx_private_messages_created_at ON private_messages(created_at DESC);
CREATE INDEX idx_private_messages_conversation ON private_messages(sender_id, recipient_id, created_at DESC);

-- Room participants indexes
CREATE INDEX idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX idx_room_participants_user_id ON room_participants(user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update room user count
CREATE OR REPLACE FUNCTION update_room_user_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE chat_rooms 
        SET user_count = user_count + 1 
        WHERE id = NEW.room_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE chat_rooms 
        SET user_count = GREATEST(user_count - 1, 0)
        WHERE id = OLD.room_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Update last_message_at in buddies
CREATE OR REPLACE FUNCTION update_buddy_last_message()
RETURNS TRIGGER AS $$
BEGIN
    -- Update for sender
    UPDATE buddies 
    SET last_message_at = NEW.created_at
    WHERE (user_id = NEW.sender_id AND buddy_id = NEW.recipient_id)
       OR (user_id = NEW.recipient_id AND buddy_id = NEW.sender_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Search users function
CREATE OR REPLACE FUNCTION search_users(
    search_query TEXT DEFAULT NULL,
    age_min INTEGER DEFAULT NULL,
    age_max INTEGER DEFAULT NULL,
    gender_filter gender_type DEFAULT NULL,
    location_filter TEXT DEFAULT NULL,
    interests_filter TEXT[] DEFAULT NULL,
    exclude_user_id UUID DEFAULT NULL,
    result_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    username TEXT,
    display_name TEXT,
    age INTEGER,
    gender gender_type,
    location TEXT,
    interests TEXT[],
    avatar_url TEXT,
    mood TEXT,
    online_status online_status
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.username,
        u.display_name,
        u.age,
        u.gender,
        u.location,
        u.interests,
        u.avatar_url,
        u.mood,
        u.online_status
    FROM users u
    WHERE 
        (exclude_user_id IS NULL OR u.id != exclude_user_id)
        AND (search_query IS NULL OR 
             u.display_name ILIKE '%' || search_query || '%' OR
             u.username ILIKE '%' || search_query || '%')
        AND (age_min IS NULL OR u.age >= age_min)
        AND (age_max IS NULL OR u.age <= age_max)
        AND (gender_filter IS NULL OR u.gender = gender_filter)
        AND (location_filter IS NULL OR u.location ILIKE '%' || location_filter || '%')
        AND (interests_filter IS NULL OR u.interests && interests_filter)
    ORDER BY 
        CASE WHEN u.online_status = 'online' THEN 0 ELSE 1 END,
        u.last_seen DESC
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Get radar users (nearby/similar)
CREATE OR REPLACE FUNCTION get_radar_users(
    for_user_id UUID,
    result_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    username TEXT,
    display_name TEXT,
    age INTEGER,
    location TEXT,
    interests TEXT[],
    avatar_url TEXT,
    mood TEXT,
    similarity_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    WITH user_info AS (
        SELECT interests, location, age
        FROM users
        WHERE id = for_user_id
    ),
    excluded_users AS (
        SELECT buddy_id AS id FROM buddies WHERE user_id = for_user_id
        UNION
        SELECT user_id AS id FROM buddies WHERE buddy_id = for_user_id
        UNION
        SELECT for_user_id AS id
    )
    SELECT 
        u.id,
        u.username,
        u.display_name,
        u.age,
        u.location,
        u.interests,
        u.avatar_url,
        u.mood,
        (
            -- Interest similarity (40%)
            (CASE WHEN cardinality(u.interests & ui.interests) > 0 
                  THEN cardinality(u.interests & ui.interests)::FLOAT / GREATEST(cardinality(u.interests), 1) * 0.4
                  ELSE 0 END)
            +
            -- Age similarity (20%)
            (CASE WHEN ABS(u.age - ui.age) <= 5 THEN 0.2
                  WHEN ABS(u.age - ui.age) <= 10 THEN 0.1
                  ELSE 0 END)
            +
            -- Location similarity (20%)
            (CASE WHEN u.location ILIKE '%' || ui.location || '%' THEN 0.2 ELSE 0 END)
            +
            -- Online status bonus (20%)
            (CASE WHEN u.online_status = 'online' THEN 0.2 ELSE 0 END)
        ) AS similarity_score
    FROM users u
    CROSS JOIN user_info ui
    WHERE 
        u.id NOT IN (SELECT id FROM excluded_users)
        AND u.online_status IN ('online', 'away')
    ORDER BY similarity_score DESC, u.last_seen DESC
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at on users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update room user count
CREATE TRIGGER update_room_count_on_join
    AFTER INSERT ON room_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_room_user_count();

CREATE TRIGGER update_room_count_on_leave
    AFTER DELETE ON room_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_room_user_count();

-- Update buddy last_message_at
CREATE TRIGGER update_buddy_message_time
    AFTER INSERT ON private_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_buddy_last_message();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE buddies ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;

-- ----------------
-- USERS POLICIES
-- ----------------

-- Anyone can view public user profiles
CREATE POLICY "Users are viewable by everyone"
    ON users FOR SELECT
    USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = auth_id)
    WITH CHECK (auth.uid() = auth_id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = auth_id);

-- ----------------
-- BUDDIES POLICIES
-- ----------------

-- Users can view their own buddy relationships
CREATE POLICY "Users can view own buddies"
    ON buddies FOR SELECT
    USING (auth.uid() IN (
        SELECT auth_id FROM users WHERE id = user_id OR id = buddy_id
    ));

-- Users can create buddy relationships
CREATE POLICY "Users can add buddies"
    ON buddies FOR INSERT
    WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

-- Users can update their own buddy relationships
CREATE POLICY "Users can update own buddy status"
    ON buddies FOR UPDATE
    USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

-- Users can delete their own buddy relationships
CREATE POLICY "Users can remove buddies"
    ON buddies FOR DELETE
    USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

-- ----------------
-- CHAT ROOMS POLICIES
-- ----------------

-- Everyone can view chat rooms
CREATE POLICY "Chat rooms are viewable by everyone"
    ON chat_rooms FOR SELECT
    USING (is_active = true);

-- ----------------
-- ROOM MESSAGES POLICIES
-- ----------------

-- Users can view messages in rooms
CREATE POLICY "Room messages are viewable by everyone"
    ON room_messages FOR SELECT
    USING (true);

-- Authenticated users can send room messages
CREATE POLICY "Authenticated users can send room messages"
    ON room_messages FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND auth.uid() = (SELECT auth_id FROM users WHERE id = user_id)
    );

-- ----------------
-- PRIVATE MESSAGES POLICIES
-- ----------------

-- Users can view their own private messages
CREATE POLICY "Users can view own private messages"
    ON private_messages FOR SELECT
    USING (
        auth.uid() IN (
            SELECT auth_id FROM users WHERE id = sender_id OR id = recipient_id
        )
    );

-- Users can send private messages
CREATE POLICY "Users can send private messages"
    ON private_messages FOR INSERT
    WITH CHECK (
        auth.uid() = (SELECT auth_id FROM users WHERE id = sender_id)
        AND (
            -- Check if they're buddies
            EXISTS (
                SELECT 1 FROM buddies 
                WHERE ((user_id = sender_id AND buddy_id = recipient_id)
                    OR (user_id = recipient_id AND buddy_id = sender_id))
                AND status = 'accepted'
            )
            OR
            -- Or recipient allows messages from everyone
            (SELECT who_can_message FROM users WHERE id = recipient_id) = 'everyone'
        )
    );

-- Users can update their own messages (mark as read)
CREATE POLICY "Recipients can mark messages as read"
    ON private_messages FOR UPDATE
    USING (auth.uid() = (SELECT auth_id FROM users WHERE id = recipient_id));

-- ----------------
-- USER PRESENCE POLICIES
-- ----------------

-- Everyone can view user presence
CREATE POLICY "User presence is viewable by everyone"
    ON user_presence FOR SELECT
    USING (true);

-- Users can update their own presence
CREATE POLICY "Users can update own presence"
    ON user_presence FOR INSERT
    WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can modify own presence"
    ON user_presence FOR UPDATE
    USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

-- ----------------
-- ROOM PARTICIPANTS POLICIES
-- ----------------

-- Users can view room participants
CREATE POLICY "Room participants are viewable"
    ON room_participants FOR SELECT
    USING (true);

-- Users can join rooms
CREATE POLICY "Users can join rooms"
    ON room_participants FOR INSERT
    WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

-- Users can leave rooms
CREATE POLICY "Users can leave rooms"
    ON room_participants FOR DELETE
    USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

-- =====================================================
-- SEED DATA - Default Chat Rooms
-- =====================================================

INSERT INTO chat_rooms (name, display_name, description, emoji, is_active, user_count) VALUES
('general', '🌍 General', 'General discussion about anything', '🌍', true, 0),
('technology', '💻 Technology', 'Tech news, gadgets, and discussions', '💻', true, 0),
('gaming', '🎮 Gaming', 'Video games, esports, and gaming culture', '🎮', true, 0),
('music', '🎵 Music', 'Share and discover music', '🎵', true, 0),
('sports', '⚽ Sports', 'Sports news and discussions', '⚽', true, 0),
('movies', '🎬 Cinema', 'Movies, TV shows, and entertainment', '🎬', true, 0),
('programming', '👨‍💻 Programming', 'Coding, development, and tech careers', '👨‍💻', true, 0),
('travel', '✈️ Travel', 'Travel tips, destinations, and stories', '✈️', true, 0)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant usage on all sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Grant execute on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database schema created successfully!';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Enable Realtime on: room_messages, private_messages, user_presence';
    RAISE NOTICE '2. Create Storage bucket: avatars (public)';
    RAISE NOTICE '3. Configure CORS settings in Supabase dashboard';
END $$;

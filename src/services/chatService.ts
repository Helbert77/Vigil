import { supabase } from '../../integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Utility function for standardized error handling (following existing pattern)
const handleApiError = (error: any, operation: string, context?: any) => {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    operation,
    error: {
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint
    },
    context
  };

  // Log different error types appropriately (following existing pattern)
  if (error?.code === 'PGRST205') {
    console.warn(`[${timestamp}] Table not found in ${operation}:`, errorInfo);
  } else if (error?.code === 'PGRST116') {
    console.warn(`[${timestamp}] Column not found in ${operation}:`, errorInfo);
  } else if (error?.code === '42703') {
    console.warn(`[${timestamp}] PostgreSQL column error in ${operation}:`, errorInfo);
  } else if (error?.message?.includes('JWT')) {
    console.error(`[${timestamp}] Authentication error in ${operation}:`, errorInfo);
  } else {
    console.error(`[${timestamp}] API error in ${operation}:`, errorInfo);
  }

  return errorInfo;
};

// Utility function to check if error is related to missing table/column
const isMissingResourceError = (error: any) => {
  return error?.code === 'PGRST205' || // Table not found
    error?.code === 'PGRST116' || // Column not found
    error?.code === '42703' ||    // PostgreSQL: column does not exist
    error?.message?.includes('column') ||
    error?.message?.includes('table') ||
    error?.message?.includes('relation');
};

// Cache for table existence checks to avoid repeated API calls
const tableExistenceCache = new Map<string, boolean>();

// Function to check if a table exists (following existing pattern)
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  // Check cache first
  if (tableExistenceCache.has(tableName)) {
    return tableExistenceCache.get(tableName)!;
  }

  try {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    const exists = !error || !isMissingResourceError(error);

    // Cache the result for 5 minutes
    tableExistenceCache.set(tableName, exists);
    setTimeout(() => tableExistenceCache.delete(tableName), 5 * 60 * 1000);

    return exists;
  } catch (error) {
    console.debug(`Table existence check failed for ${tableName}:`, error);
    return false;
  }
};

// Chat message types
export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  is_deleted: boolean;
  reply_to_id?: string;
  edited_at?: string;
  sender?: {
    id: string;
    username: string;
    avatar_url?: string;
    full_name?: string;
  };
}

export interface ChatConversation {
  id: string;
  title?: string;
  is_group: boolean;
  created_at: string;
  updated_at: string;
  last_message?: string;
  last_message_at?: string;
  participants: Array<{
    user_id: string;
    role: 'admin' | 'member';
    joined_at: string;
    profiles: {
      id: string;
      username: string;
      avatar_url?: string;
      full_name?: string;
    };
  }>;
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  category: string;
  is_public: boolean;
  max_participants: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  participant_count: number;
  is_hot: boolean;
  is_new: boolean;
  creator?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

// --- Chat Messages API ---

// Fetch messages for a conversation
export const fetchMessages = async (conversationId: string, limit: number = 50) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender:sender_id(id, username, avatar_url, full_name)
      `)
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      handleApiError(error, 'fetchMessages', { conversationId, limit });
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    handleApiError(error, 'fetchMessages', { conversationId, limit });
    return { data: null, error };
  }
};

// Send a message
export const sendMessage = async (messageData: {
  conversationId: string;
  content: string;
  replyToId?: string;
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: messageData.conversationId,
        sender_id: user.id,
        content: messageData.content,
        reply_to_id: messageData.replyToId,
        is_read: false,
        is_deleted: false
      })
      .select(`
        *,
        sender:sender_id(id, username, avatar_url, full_name)
      `)
      .single();

    if (error) {
      handleApiError(error, 'sendMessage', messageData);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    handleApiError(error, 'sendMessage', messageData);
    return { data: null, error };
  }
};

// Mark message as read
export const markMessageAsRead = async (messageId: string) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('id', messageId)
      .select()
      .single();

    if (error) {
      handleApiError(error, 'markMessageAsRead', { messageId });
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    handleApiError(error, 'markMessageAsRead', { messageId });
    return { data: null, error };
  }
};

// Edit a message
export const editMessage = async (messageId: string, newContent: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .update({
        content: newContent,
        edited_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .eq('sender_id', user.id) // Only allow editing own messages
      .select()
      .single();

    if (error) {
      handleApiError(error, 'editMessage', { messageId, newContent });
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    handleApiError(error, 'editMessage', { messageId, newContent });
    return { data: null, error };
  }
};

// Delete a message (soft delete)
export const deleteMessage = async (messageId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .update({ is_deleted: true })
      .eq('id', messageId)
      .eq('sender_id', user.id) // Only allow deleting own messages
      .select()
      .single();

    if (error) {
      handleApiError(error, 'deleteMessage', { messageId });
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    handleApiError(error, 'deleteMessage', { messageId });
    return { data: null, error };
  }
};

// --- Chat Conversations API ---

// Fetch user's conversations
export const fetchConversations = async (userId: string) => {
  try {
    // First get conversation IDs where user is participant
    const { data: participantData, error: participantError } = await supabase
      .from('chat_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (participantError) {
      handleApiError(participantError, 'fetchConversations - get participant IDs', { userId });
      return { data: null, error: participantError };
    }

    if (!participantData || participantData.length === 0) {
      return { data: [], error: null };
    }

    const conversationIds = participantData.map(p => p.conversation_id);

    // Then fetch full conversation data
    const { data, error } = await supabase
      .from('chat_conversations')
      .select(`
        *,
        participants:chat_participants(
          user_id,
          role,
          joined_at,
          profiles(id, username, avatar_url, full_name)
        )
      `)
      .in('id', conversationIds)
      .order('updated_at', { ascending: false });

    if (error) {
      handleApiError(error, 'fetchConversations - get conversations', { userId, conversationIds });
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    handleApiError(error, 'fetchConversations', { userId });
    return { data: null, error };
  }
};

// Create a new conversation
export const createConversation = async (participantIds: string[], isGroup: boolean = false, title?: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Create conversation
    const { data: conversation, error: conversationError } = await supabase
      .from('chat_conversations')
      .insert({
        title,
        is_group: isGroup,
        created_by: user.id
      })
      .select()
      .single();

    if (conversationError) {
      handleApiError(conversationError, 'createConversation - create conversation', { participantIds, isGroup, title });
      return { data: null, error: conversationError };
    }

    // Add participants (including current user)
    const allParticipantIds = [...new Set([user.id, ...participantIds])];
    const participantData = allParticipantIds.map(userId => ({
      conversation_id: conversation.id,
      user_id: userId,
      role: userId === user.id ? 'admin' : 'member' as 'admin' | 'member',
      joined_at: new Date().toISOString()
    }));

    const { error: participantsError } = await supabase
      .from('chat_participants')
      .insert(participantData);

    if (participantsError) {
      handleApiError(participantsError, 'createConversation - add participants', { conversationId: conversation.id, participantData });
      return { data: null, error: participantsError };
    }

    // Fetch the complete conversation data
    const { data: fullConversation, error: fetchError } = await supabase
      .from('chat_conversations')
      .select(`
        *,
        participants:chat_participants(
          user_id,
          role,
          joined_at,
          profiles(id, username, avatar_url, full_name)
        )
      `)
      .eq('id', conversation.id)
      .single();

    if (fetchError) {
      handleApiError(fetchError, 'createConversation - fetch full conversation', { conversationId: conversation.id });
      return { data: null, error: fetchError };
    }

    return { data: fullConversation, error: null };
  } catch (error) {
    handleApiError(error, 'createConversation', { participantIds, isGroup, title });
    return { data: null, error };
  }
};

// --- Chat Rooms API ---

// Fetch available chat rooms
export const fetchChatRooms = async (category?: string) => {
  try {
    let query = supabase
      .from('chat_rooms')
      .select(`
        *,
        creator:created_by(id, username, avatar_url)
      `)
      .eq('is_public', true)
      .order('participant_count', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      handleApiError(error, 'fetchChatRooms', { category });
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    handleApiError(error, 'fetchChatRooms', { category });
    return { data: null, error };
  }
};

// Join a chat room
export const joinChatRoom = async (roomId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Check if room exists and has space
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .select('participant_count, max_participants')
      .eq('id', roomId)
      .single();

    if (roomError) {
      handleApiError(roomError, 'joinChatRoom - check room', { roomId });
      return { data: null, error: roomError };
    }

    if (room.participant_count >= room.max_participants) {
      return { data: null, error: { message: 'Sala cheia' } };
    }

    // Create conversation for the room if it doesn't exist
    let conversationId: string;

    const { data: existingConversation, error: conversationError } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('room_id', roomId)
      .single();

    if (conversationError && !isMissingResourceError(conversationError)) {
      handleApiError(conversationError, 'joinChatRoom - check existing conversation', { roomId });
      return { data: null, error: conversationError };
    }

    if (existingConversation) {
      conversationId = existingConversation.id;
    } else {
      // Create new conversation for the room
      const { data: newConversation, error: createError } = await supabase
        .from('chat_conversations')
        .insert({
          title: `Sala: ${roomId}`,
          is_group: true,
          room_id: roomId
        })
        .select()
        .single();

      if (createError) {
        handleApiError(createError, 'joinChatRoom - create conversation', { roomId });
        return { data: null, error: createError };
      }

      conversationId = newConversation.id;
    }

    // Add user as participant
    const { error: participantError } = await supabase
      .from('chat_participants')
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: 'member',
        joined_at: new Date().toISOString()
      });

    if (participantError) {
      handleApiError(participantError, 'joinChatRoom - add participant', { conversationId, userId: user.id });
      return { data: null, error: participantError };
    }

    // Increment participant count
    const { error: incrementError } = await supabase
      .from('chat_rooms')
      .update({ participant_count: room.participant_count + 1 })
      .eq('id', roomId);

    if (incrementError) {
      handleApiError(incrementError, 'joinChatRoom - increment count', { roomId });
    }

    return { data: { conversationId, roomId }, error: null };
  } catch (error) {
    handleApiError(error, 'joinChatRoom', { roomId });
    return { data: null, error };
  }
};

// Leave a chat room
export const leaveChatRoom = async (roomId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Find conversation for the room
    const { data: conversation, error: conversationError } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('room_id', roomId)
      .single();

    if (conversationError) {
      handleApiError(conversationError, 'leaveChatRoom - find conversation', { roomId });
      return { data: null, error: conversationError };
    }

    // Remove user as participant
    const { error: participantError } = await supabase
      .from('chat_participants')
      .delete()
      .eq('conversation_id', conversation.id)
      .eq('user_id', user.id);

    if (participantError) {
      handleApiError(participantError, 'leaveChatRoom - remove participant', { conversationId: conversation.id, userId: user.id });
      return { data: null, error: participantError };
    }

    // Decrement participant count
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .select('participant_count')
      .eq('id', roomId)
      .single();

    if (roomError) {
      handleApiError(roomError, 'leaveChatRoom - get room data', { roomId });
    } else {
      const { error: decrementError } = await supabase
        .from('chat_rooms')
        .update({ participant_count: Math.max(0, room.participant_count - 1) })
        .eq('id', roomId);

      if (decrementError) {
        handleApiError(decrementError, 'leaveChatRoom - decrement count', { roomId });
      }
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    handleApiError(error, 'leaveChatRoom', { roomId });
    return { data: null, error };
  }
};

// --- Real-time Subscriptions ---

// Subscribe to new messages in a conversation
export const subscribeToMessages = (conversationId: string, callback: (message: ChatMessage) => void) => {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      async (payload) => {
        // Fetch complete message with sender data
        const { data, error } = await supabase
          .from('chat_messages')
          .select(`
            *,
            sender:sender_id(id, username, avatar_url, full_name)
          `)
          .eq('id', payload.new.id)
          .single();

        if (!error && data) {
          callback(data);
        }
      }
    )
    .subscribe();

  return channel;
};

// Subscribe to conversation updates for a user
export const subscribeToConversations = (userId: string, callback: (conversation: ChatConversation) => void) => {
  const channel = supabase
    .channel(`conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_participants',
        filter: `user_id=eq.${userId}`
      },
      async (payload) => {
        // Fetch complete conversation data
        const { data, error } = await supabase
          .from('chat_conversations')
          .select(`
            *,
            participants:chat_participants(
              user_id,
              role,
              joined_at,
              profiles(id, username, avatar_url, full_name)
            )
          `)
          .eq('id', payload.new.conversation_id)
          .single();

        if (!error && data) {
          callback(data);
        }
      }
    )
    .subscribe();

  return channel;
};

// --- Search and Filter Functions ---

// Search users for chat
export const searchUsers = async (query: string, filters?: {
  age?: { min: number; max: number };
  gender?: string;
  location?: string;
  interests?: string[];
}) => {
  try {
    let supabaseQuery = supabase
      .from('profiles')
      .select('id, username, avatar_url, full_name, age, gender, location, interests')
      .ilike('username', `%${query}%`)
      .limit(20);

    // Apply filters if provided
    if (filters?.age) {
      supabaseQuery = supabaseQuery
        .gte('age', filters.age.min)
        .lte('age', filters.age.max);
    }

    if (filters?.gender) {
      supabaseQuery = supabaseQuery.eq('gender', filters.gender);
    }

    if (filters?.location) {
      supabaseQuery = supabaseQuery.ilike('location', `%${filters.location}%`);
    }

    if (filters?.interests && filters.interests.length > 0) {
      // This is a simplified implementation - in a real app you'd want more sophisticated filtering
      supabaseQuery = supabaseQuery.contains('interests', filters.interests);
    }

    const { data, error } = await supabaseQuery;

    if (error) {
      handleApiError(error, 'searchUsers', { query, filters });
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    handleApiError(error, 'searchUsers', { query, filters });
    return { data: null, error };
  }
};

// Get new users for chat suggestions
export const fetchNewUsers = async (days: number = 7, limit: number = 10) => {
  try {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, full_name, created_at, plan, role, interests, age, location')
      .gte('created_at', dateThreshold.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      handleApiError(error, 'fetchNewUsers', { days, limit });
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    handleApiError(error, 'fetchNewUsers', { days, limit });
    return { data: null, error };
  }
};

// Get user's chat buddies (people they've chatted with)
export const fetchChatBuddies = async (userId: string) => {
  try {
    // Get conversations where user is participant
    const { data: conversations, error: conversationsError } = await fetchConversations(userId);

    if (conversationsError) {
      return { data: null, error: conversationsError };
    }

    if (!conversations || conversations.length === 0) {
      return { data: [], error: null };
    }

    // Extract buddy IDs (other participants in conversations)
    const buddyIds = new Set<string>();
    conversations.forEach((conversation: any) => {
      conversation.participants?.forEach((participant: any) => {
        if (participant.user_id !== userId) {
          buddyIds.add(participant.user_id);
        }
      });
    });

    if (buddyIds.size === 0) {
      return { data: [], error: null };
    }

    // Fetch buddy profiles
    const { data: buddies, error: buddiesError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, full_name, last_active_at, plan, role, interests, age, location')
      .in('id', Array.from(buddyIds));

    if (buddiesError) {
      handleApiError(buddiesError, 'fetchChatBuddies - get profiles', { userId, buddyIds: Array.from(buddyIds) });
      return { data: null, error: buddiesError };
    }

    // Sort by last active time (most recent first)
    const sortedBuddies = (buddies || []).sort((a, b) => {
      const dateA = new Date(a.last_active_at || 0).getTime();
      const dateB = new Date(b.last_active_at || 0).getTime();
      return dateB - dateA;
    });

    return { data: sortedBuddies, error: null };
  } catch (error) {
    handleApiError(error, 'fetchChatBuddies', { userId });
    return { data: null, error };
  }
};


// Export types
export type { RealtimeChannel };
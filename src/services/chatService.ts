import { supabase } from '../../integrations/supabase/client';
import type { User } from '@/types';
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
  // Logs removidos conforme solicitado

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
  is_public?: boolean;
  created_by?: string;
  max_participants?: number;
  created_at: string;
  updated_at: string;
  is_hot: boolean;
  is_new: boolean;
  unread_count?: number;
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
      // Se o erro for 400 e a conversa não existir ainda, retornar array vazio
      // Isso é esperado quando criamos um novo buddy pelo radar
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return { data: [], error: null };
      }
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
    // Check if table exists first
    const tableExists = await checkTableExists('chat_participants');
    if (!tableExists) {
      return { data: [], error: null };
    }

    // First get conversation IDs where user is participant
    const { data: participantData, error: participantError } = await supabase
      .from('chat_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (participantError) {
      // If table doesn't exist, return empty array (this is for private conversations, not rooms)
      if (isMissingResourceError(participantError)) {
        return { data: [], error: null };
      }
      handleApiError(participantError, 'fetchConversations - get participant IDs', { userId });
      return { data: [], error: null }; // Return empty array instead of error
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
      if (isMissingResourceError(error)) {
        return { data: [], error: null };
      }
      handleApiError(error, 'fetchConversations - get conversations', { userId, conversationIds });
      return { data: [], error: null }; // Return empty array instead of error
    }

    return { data, error: null };
  } catch (error) {
    handleApiError(error, 'fetchConversations', { userId });
    return { data: [], error: null }; // Return empty array instead of error for missing tables
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
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      handleApiError(error, 'fetchChatRooms', { category });
      return { data: null, error };
    }

    // OTIMIZADO: Buscar informações do criador em paralelo (uma única query para todos)
    if (data && data.length > 0) {
      const creatorIds = [...new Set(data.filter(r => r.created_by).map(r => r.created_by))];
      if (creatorIds.length > 0) {
        // Buscar todos os criadores de uma vez
        const { data: creators } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', creatorIds);

        if (creators) {
          const creatorMap = new Map(creators.map(c => [c.id, c]));
          data.forEach(room => {
            if (room.created_by && creatorMap.has(room.created_by)) {
              room.creator = creatorMap.get(room.created_by);
            }
          });
        }
      }
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

    // Check if room exists
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('id', roomId)
      .single();

    if (roomError) {
      handleApiError(roomError, 'joinChatRoom - check room', { roomId });
      return { data: null, error: roomError };
    }

    // Note: Removed max_participants check as it's not in the schema

    // Check if user is already a participant
    const { data: existingParticipant, error: checkError } = await supabase
      .from('chat_room_participants')
      .select('id')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .maybeSingle(); // Use maybeSingle() instead of single() to avoid 406 error

    // If user is already a participant, return success immediately
    if (existingParticipant) {
      return { data: { roomId }, error: null };
    }

    const { error: participantError } = await supabase
      .from('chat_room_participants')
      .insert({
        room_id: roomId,
        user_id: user.id,
        joined_at: new Date().toISOString()
      });

    if (participantError) {
      if (participantError.code === '23505') {
        return { data: { roomId }, error: null };
      }
      handleApiError(participantError, 'joinChatRoom', { roomId });
      return { data: null, error: participantError };
    }

    return { data: { roomId }, error: null };
  } catch (error) {
    handleApiError(error, 'joinChatRoom', { roomId });
    return { data: null, error };
  }
};

// Fetch messages from a chat room
export const fetchRoomMessages = async (roomId: string, limit: number = 50) => {
  try {
    // Buscar ID do usuário atual
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;

    // 1. Buscar mensagens do Supabase
    const { data, error } = await supabase
      .from('chat_room_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      handleApiError(error, 'fetchRoomMessages', { roomId, limit });
      return { data: null, error };
    }

    // 2. Verificar cache local PRIMEIRO (sempre funciona, mesmo sem coluna no banco)
    const cacheKey = `deleted_messages_cache_${roomId}`;
    let cachedDeletedIds: string[] = [];
    
    if (currentUserId) {
      try {
        const cacheData = localStorage.getItem(cacheKey);
        cachedDeletedIds = cacheData ? JSON.parse(cacheData) : [];
        console.log(`[fetchRoomMessages] Cache carregado para sala ${roomId}:`, cachedDeletedIds.length, 'IDs deletados');
      } catch (e) {
        console.error('[fetchRoomMessages] Erro ao ler cache:', e);
        cachedDeletedIds = [];
      }
    }

    // 3. Filtrar mensagens deletadas - SEMPRE usar cache primeiro
    const totalMessages = (data || []).length;
    let visibleMessages = (data || []).filter((msg: any) => {
      if (!currentUserId) return true;
      
      // PRIMEIRO: Verificar cache local (sempre funciona)
      if (cachedDeletedIds.includes(msg.id)) {
        return false; // Mensagem deletada no cache
      }
      
      // SEGUNDO: Verificar servidor (se coluna existir)
      const deletedByUsers = msg.deleted_by_users;
      if (deletedByUsers && Array.isArray(deletedByUsers) && deletedByUsers.includes(currentUserId)) {
        // Atualizar cache se necessário
        if (!cachedDeletedIds.includes(msg.id)) {
          cachedDeletedIds.push(msg.id);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(cachedDeletedIds));
          } catch (e) {
            // Ignorar erro de localStorage
          }
        }
        return false; // Mensagem deletada no servidor
      }
      
      return true; // Mensagem não deletada
    });
    
    // Debug: verificar filtro
    if (currentUserId && totalMessages > 0) {
      const filteredCount = totalMessages - visibleMessages.length;
      console.log(`[fetchRoomMessages] Sala ${roomId}: ${totalMessages} mensagens totais, ${filteredCount} filtradas, ${visibleMessages.length} visíveis`);
      console.log(`[fetchRoomMessages] Cache tem ${cachedDeletedIds.length} IDs:`, cachedDeletedIds.slice(0, 5), cachedDeletedIds.length > 5 ? '...' : '');
    }

    // 4. Sincronizar cache com servidor (atualizar se houver diferenças)
    // IMPORTANTE: NÃO remover cache se servidor não tiver dados - cache é a fonte da verdade quando coluna não existe
    if (currentUserId) {
      const serverDeletedIds = (data || [])
        .filter((msg: any) => {
          const deletedBy = msg.deleted_by_users;
          return deletedBy && Array.isArray(deletedBy) && deletedBy.includes(currentUserId);
        })
        .map((msg: any) => msg.id);

      // Combinar cache local com servidor (manter ambos)
      const combinedDeletedIds = [...new Set([...cachedDeletedIds, ...serverDeletedIds])];
      
      // Atualizar cache apenas se houver novos IDs do servidor
      if (combinedDeletedIds.length !== cachedDeletedIds.length) {
        localStorage.setItem(cacheKey, JSON.stringify(combinedDeletedIds));
        console.log(`[fetchRoomMessages] Cache atualizado: ${cachedDeletedIds.length} -> ${combinedDeletedIds.length} IDs`);
      }
    }

    // Fetch sender info for all messages
    const userIds = [...new Set(visibleMessages.map((msg: any) => msg.user_id).filter((id: string) => id))];
    let senderMap = new Map();

    if (userIds.length > 0) {
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, first_name, last_name')
          .in('id', userIds);

        if (profilesError) {
          // Erro ao buscar perfis, continuar sem eles
        }

        if (profiles && profiles.length > 0) {
          profiles.forEach(profile => {
            senderMap.set(profile.id, profile);
          });
        }
      } catch (err) {
        // Erro ao buscar perfis, continuar sem eles
      }
    }

    // Format messages to match ChatMessage interface
    const formattedMessages = visibleMessages.map((msg: any) => {
      const sender = senderMap.get(msg.user_id);
      
      // Build full_name from first_name and last_name (matching the profiles table structure)
      let fullName = 'Usuário';
      if (sender) {
        const firstName = sender.first_name || '';
        const lastName = sender.last_name || '';
        fullName = `${firstName} ${lastName}`.trim() || sender.username || 'Usuário';
      }
      
      return {
        id: msg.id,
        conversation_id: roomId,
        sender_id: msg.user_id,
        content: msg.content,
        created_at: msg.created_at,
        is_read: false,
        is_deleted: false,
        sender: sender ? {
          id: sender.id,
          username: sender.username || 'Usuário',
          avatar_url: sender.avatar_url,
          full_name: fullName
        } : undefined
      };
    });

    return { data: formattedMessages, error: null };
  } catch (error) {
    handleApiError(error, 'fetchRoomMessages', { roomId, limit });
    return { data: null, error };
  }
};

// Send a message to a chat room
export const sendRoomMessage = async (roomId: string, content: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Verify user is a participant
    const { data: participant } = await supabase
      .from('chat_room_participants')
      .select('id')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .single();

    if (!participant) {
      return { data: null, error: { message: 'Você precisa entrar na sala primeiro' } };
    }

    const { data, error } = await supabase
      .from('chat_room_messages')
      .insert({
        room_id: roomId,
        user_id: user.id,
        content: content.trim()
      })
      .select('*')
      .single();

    if (error) {
      handleApiError(error, 'sendRoomMessage', { roomId, content });
      return { data: null, error };
    }

    // Update last activity
    await supabase
      .from('chat_room_participants')
      .update({ last_activity: new Date().toISOString() })
      .eq('room_id', roomId)
      .eq('user_id', user.id);

    // Fetch sender info with fallback to user metadata
    let sender = null;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, first_name, last_name')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        // Build full_name from first_name and last_name
        const firstName = profile.first_name || '';
        const lastName = profile.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim() || profile.username || 'Usuário';
        
        sender = {
          id: profile.id,
          username: profile.username || 'Usuário',
          avatar_url: profile.avatar_url,
          full_name: fullName
        };
      }
    } catch (e) {
      // Erro ao buscar perfil, usar metadata do usuário
    }

    // If profile fetch fails, use user metadata
    if (!sender) {
      sender = {
        id: user.id,
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'Usuário',
        full_name: user.user_metadata?.full_name || user.user_metadata?.username || user.email?.split('@')[0] || 'Usuário',
        avatar_url: user.user_metadata?.avatar_url
      };
    }

    // Format message
    const formattedMessage = {
      id: data.id,
      conversation_id: roomId,
      sender_id: data.user_id,
      content: data.content,
      created_at: data.created_at,
      is_read: false,
      is_deleted: false,
      sender: sender
    };

    return { data: formattedMessage, error: null };
  } catch (error) {
    handleApiError(error, 'sendRoomMessage', { roomId, content });
    return { data: null, error };
  }
};

// Subscribe to room messages
export const subscribeToRoomMessages = (roomId: string, callback: (message: ChatMessage) => void) => {
  const channel = supabase
    .channel(`room_messages:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_room_messages',
        filter: `room_id=eq.${roomId}`
      },
      async (payload) => {
        // Buscar ID do usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        const currentUserId = user?.id;

        // Fetch complete message (incluindo deleted_by_users)
        const { data: messageData, error: msgError } = await supabase
          .from('chat_room_messages')
          .select('*')
          .eq('id', payload.new.id)
          .single();

        if (msgError || !messageData) return;

        // Verificar cache local primeiro (performance)
        if (currentUserId) {
          const cacheKey = `deleted_messages_cache_${roomId}`;
          try {
            const cachedDeletedIds = JSON.parse(
              localStorage.getItem(cacheKey) || '[]'
            );
            if (cachedDeletedIds.includes(messageData.id)) {
              // Mensagem deletada no cache, não mostrar
              return;
            }
          } catch (e) {
            // Cache inválido, continuar verificando servidor
          }
        }

        // Verificar servidor (fonte da verdade)
        if (currentUserId && messageData.deleted_by_users) {
          const deletedByUsers = messageData.deleted_by_users as string[];
          if (deletedByUsers.includes(currentUserId)) {
            // Atualizar cache se necessário
            const cacheKey = `deleted_messages_cache_${roomId}`;
            try {
              const cachedDeletedIds = JSON.parse(
                localStorage.getItem(cacheKey) || '[]'
              );
              if (!cachedDeletedIds.includes(messageData.id)) {
                cachedDeletedIds.push(messageData.id);
                localStorage.setItem(cacheKey, JSON.stringify(cachedDeletedIds));
              }
            } catch (e) {
              // Erro ao atualizar cache, ignorar
            }
            // Mensagem deletada, não mostrar
            return;
          }
        }

        // Fetch sender info
        const { data: sender, error: senderError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, first_name, last_name')
          .eq('id', messageData.user_id)
          .single();

        if (senderError) {
          // Erro ao buscar perfil do remetente
        }

        // Build full_name from first_name and last_name (matching the profiles table structure)
        let fullName = 'Usuário';
        if (sender) {
          const firstName = sender.first_name || '';
          const lastName = sender.last_name || '';
          fullName = `${firstName} ${lastName}`.trim() || sender.username || 'Usuário';
        }

        const formattedMessage = {
          id: messageData.id,
          conversation_id: roomId,
          sender_id: messageData.user_id,
          content: messageData.content,
          created_at: messageData.created_at,
          is_read: false,
          is_deleted: false,
          sender: sender ? {
            id: sender.id,
            username: sender.username || 'Usuário',
            avatar_url: sender.avatar_url,
            full_name: fullName
          } : undefined
        };
        callback(formattedMessage);
      }
    )
    .subscribe();

  return channel;
};

// Leave a chat room
export const leaveChatRoom = async (roomId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Remove user from chat_room_participants
    const { error: participantError } = await supabase
      .from('chat_room_participants')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', user.id);

    if (participantError) {
      handleApiError(participantError, 'leaveChatRoom - remove participant', { roomId, userId: user.id });
      return { data: null, error: participantError };
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    handleApiError(error, 'leaveChatRoom', { roomId });
    return { data: null, error };
  }
};

// Check if user is in a room
export const isUserInRoom = async (roomId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('chat_room_participants')
      .select('id')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .single();

    return !error && !!data;
  } catch (error) {
    return false;
  }
};

// Update room activity timestamp
export const updateRoomActivity = async (roomId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('Usuário não autenticado') };

    const { error } = await supabase
      .from('chat_room_participants')
      .update({ last_activity: new Date().toISOString() })
      .eq('room_id', roomId)
      .eq('user_id', user.id);

    if (error) {
      handleApiError(error, 'updateRoomActivity', { roomId });
      return { data: null, error };
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    handleApiError(error, 'updateRoomActivity', { roomId });
    return { data: null, error };
  }
};

// Get user's joined rooms
export const getUserJoinedRooms = async (): Promise<string[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('chat_room_participants')
      .select('room_id')
      .eq('user_id', user.id);

    if (error) {
      handleApiError(error, 'getUserJoinedRooms');
      return [];
    }

    return (data || []).map(p => p.room_id);
  } catch (error) {
    handleApiError(error, 'getUserJoinedRooms');
    return [];
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

// Fetch room participants with profiles
export const fetchRoomParticipants = async (roomId: string) => {
  try {
    const { data: participantsData, error: participantsError } = await supabase
      .from('chat_room_participants')
      .select('user_id')
      .eq('room_id', roomId);

    if (participantsError) {
      handleApiError(participantsError, 'fetchRoomParticipants', { roomId });
      return { data: [], error: participantsError };
    }

    if (!participantsData || participantsData.length === 0) {
      return { data: [], error: null };
    }

    const userIds = participantsData.map(p => p.user_id);
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, first_name, last_name, bio, followers_count, following_count, plan, role')
      .in('id', userIds);

    if (profilesError) {
      handleApiError(profilesError, 'fetchRoomParticipants', { roomId });
      return { data: [], error: profilesError };
    }

    const participants: User[] = (profilesData || []).map(profile => {
      const firstName = profile.first_name || '';
      const lastName = profile.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim() || profile.username;
      
      return {
        id: profile.id,
        name: fullName,
        username: profile.username,
        avatarUrl: profile.avatar_url || `https://picsum.photos/seed/${profile.id}/100/100`,
        bio: profile.bio,
        followersCount: profile.followers_count || 0,
        followingCount: profile.following_count || 0,
        plan: profile.plan || 'free',
        role: profile.role || 'user',
        joinDate: '',
        createdAt: '',
      };
    });

    return { data: participants, error: null };
  } catch (error) {
    handleApiError(error, 'fetchRoomParticipants', { roomId });
    return { data: [], error };
  }
};

// Subscribe to room participants changes for real-time updates
export const subscribeToRoomParticipants = (
  roomId: string,
  callback: (participants: User[], count: number) => void
) => {
  const channel = supabase
    .channel(`room_participants:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chat_room_participants',
        filter: `room_id=eq.${roomId}`
      },
      async (payload) => {
        // Refetch participants when changes occur
        const { data } = await fetchRoomParticipants(roomId);
        callback(data || [], data?.length || 0);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    }
  };
};

// Subscribe to chat rooms table changes for real-time user count updates
export const subscribeToChatRooms = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('chat_rooms_updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_rooms'
      },
      (payload) => {
        callback(payload);
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
    // Tentar primeiro com filtro de data usando created_at
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, first_name, last_name, created_at, plan, role, bio, followers_count, following_count')
      .gte('created_at', dateThreshold.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      // Se o erro for 400 (Bad Request), pode ser que created_at não exista ou formato incorreto
      // Tentar sem filtro de data como fallback
      if (error.code === 'PGRST116' || error.code === 'PGRST205' || error.message?.includes('column') || error.message?.includes('does not exist') || error.message?.includes('400')) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, first_name, last_name, plan, role, bio, followers_count, following_count')
          .order('id', { ascending: false })
          .limit(limit);
        
        if (fallbackError) {
          handleApiError(fallbackError, 'fetchNewUsers - fallback', { days, limit });
          return { data: null, error: fallbackError };
        }
        
        const mappedFallback = (fallbackData || []).map((profile: any) => ({
          ...profile,
          full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username || 'Usuário',
          created_at: new Date().toISOString() // Valor padrão se não existir
        }));
        
        return { data: mappedFallback, error: null };
      }
      
      handleApiError(error, 'fetchNewUsers', { days, limit });
      return { data: null, error };
    }

    // Mapear os dados para incluir full_name calculado
    const mappedData = (data || []).map((profile: any) => ({
      ...profile,
      full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username || 'Usuário'
    }));

    return { data: mappedData, error: null };
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
      .select('id, username, avatar_url, first_name, last_name, last_active_at, plan, role, bio')
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

// Create a new chat room
export const createChatRoom = async (roomData: {
  name: string;
  description?: string;
  category?: string;
  is_public?: boolean;
  max_participants?: number;
  invited_user_ids?: string[];
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const response = await supabase.functions.invoke('create-chat-room', {
      body: roomData,
    });

    const { data, error } = response;

    // Verificar se há erro na resposta ou se data contém erro
    if (error) {
      // Tentar extrair mensagem de erro
      let errorMessage = 'Erro ao criar sala';
      if (error && typeof error === 'object') {
        const errObj = error as any;
        if (errObj.context?.error?.message) {
          errorMessage = errObj.context.error.message;
        } else if (errObj.message) {
          errorMessage = errObj.message;
        } else if (errObj.error?.message) {
          errorMessage = errObj.error.message;
        } else if (errObj.error) {
          errorMessage = typeof errObj.error === 'string' ? errObj.error : errObj.error.message || errorMessage;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      handleApiError(error, 'createChatRoom', roomData);
      return { data: null, error: new Error(errorMessage) };
    }

    // Verificar se data contém erro (caso de 403 ou outros erros HTTP)
    // Quando há erro HTTP, o Supabase pode retornar o erro no campo data
    if (!data) {
      handleApiError('Resposta vazia da função', 'createChatRoom', roomData);
      return { data: null, error: new Error('Erro ao criar sala: resposta vazia') };
    }

    if (!data.success) {
      const errorMsg = data?.error || 'Erro ao criar sala';
      const errorDetails = data?.details || data?.hint || null;
      handleApiError(errorMsg, 'createChatRoom', roomData);
      const errorObj = new Error(errorMsg);
      if (errorDetails) {
        (errorObj as any).details = errorDetails;
      }
      return { data: null, error: errorObj };
    }

    return { data: data.room, error: null };
  } catch (error) {
    handleApiError(error, 'createChatRoom', roomData);
    return { data: null, error };
  }
};

export const fetchUserInvitations = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('chat_room_invitations')
      .select('*')
      .or(`invitee_id.eq.${user.id},inviter_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      handleApiError(error, 'fetchUserInvitations');
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    handleApiError(error, 'fetchUserInvitations');
    return { data: [], error };
  }
};

// Request room access
export const requestRoomAccess = async (roomId: string): Promise<{ data: any | null; error: any | null }> => {
  try {
    const response = await supabase.functions.invoke('request-room-access', {
      body: { room_id: roomId }
    });
    
    const { data, error } = response;
    
    // When Supabase returns HTTP error (400, 500, etc), the error object is set
    // The error body might be in data or in error.context
    if (error) {
      handleApiError(error, 'requestRoomAccess');
      
      // Try multiple ways to get the error message
      let errorMessage = 'Erro ao solicitar acesso';
      
      // First try: error body might be in data (Supabase sometimes puts response body here)
      if (data?.error) {
        errorMessage = data.error;
      } else if (data?.message) {
        errorMessage = data.message;
      }
      // Second try: check error context (Supabase sometimes puts response here)
      else if ((error as any)?.context) {
        const context = (error as any).context;
        if (context.body) {
          try {
            const errorBody = typeof context.body === 'string' 
              ? JSON.parse(context.body)
              : context.body;
            errorMessage = errorBody?.error || errorBody?.message || errorMessage;
          } catch (e) {
            // Ignore parse errors
          }
        }
        if (context.message && errorMessage === 'Erro ao solicitar acesso') {
          errorMessage = context.message;
        }
      }
      // Third try: error message
      else if (error?.message && error.message !== 'Edge Function returned a non-2xx status code') {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      return { data: null, error: new Error(errorMessage) };
    }
    
    // Check if the response contains an error (even with status 200)
    if (data?.error) {
      return { data: null, error: new Error(data.error) };
    }
    
    // Check if success is false
    if (data?.success === false && data?.error) {
      return { data: null, error: new Error(data.error) };
    }
    
    return { data: data?.request || null, error: null };
  } catch (error) {
    handleApiError(error, 'requestRoomAccess');
    const errorMessage = error instanceof Error ? error.message : 'Erro ao solicitar acesso';
    return { data: null, error: new Error(errorMessage) };
  }
};

export const acceptInvitation = async (invitationId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data: invitation, error: fetchError } = await supabase
      .from('chat_room_invitations')
      .select('*')
      .eq('id', invitationId)
      .single();

    if (fetchError || !invitation) {
      return { data: null, error: fetchError || new Error('Convite não encontrado') };
    }

    const { error: updateError } = await supabase
      .from('chat_room_invitations')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', invitationId);

    if (updateError) {
      handleApiError(updateError, 'acceptInvitation', { invitationId });
      return { data: null, error: updateError };
    }

    const { error: joinError } = await supabase
      .from('chat_room_participants')
      .insert({ room_id: invitation.room_id, user_id: user.id, joined_at: new Date().toISOString() });

    if (joinError) {
      handleApiError(joinError, 'acceptInvitation - join room', { invitationId, roomId: invitation.room_id });
      return { data: null, error: joinError };
    }

    return { data: { room_id: invitation.room_id }, error: null };
  } catch (error) {
    handleApiError(error, 'acceptInvitation', { invitationId });
    return { data: null, error };
  }
};

export const declineInvitation = async (invitationId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { error } = await supabase
      .from('chat_room_invitations')
      .update({ status: 'declined', updated_at: new Date().toISOString() })
      .eq('id', invitationId)
      .eq('invitee_id', user.id);

    if (error) {
      handleApiError(error, 'declineInvitation', { invitationId });
      return { data: null, error };
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    handleApiError(error, 'declineInvitation', { invitationId });
    return { data: null, error };
  }
};

// Update a chat room
export const updateChatRoom = async (roomId: string, updates: {
  name?: string;
  description?: string;
  category?: string;
  is_public?: boolean;
  max_participants?: number;
  is_hot?: boolean;
  is_new?: boolean;
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase.functions.invoke('update-chat-room', {
      body: { room_id: roomId, ...updates },
    });

    if (error) {
      handleApiError(error, 'updateChatRoom', { roomId, updates });
      return { data: null, error };
    }

    if (!data || !data.success) {
      const errorMsg = data?.error || 'Erro ao atualizar sala';
      handleApiError(errorMsg, 'updateChatRoom', { roomId, updates });
      return { data: null, error: errorMsg };
    }

    return { data: data.room, error: null };
  } catch (error) {
    handleApiError(error, 'updateChatRoom', { roomId, updates });
    return { data: null, error };
  }
};

// Delete a chat room
export const deleteChatRoom = async (roomId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase.functions.invoke('delete-chat-room', {
      body: { room_id: roomId },
    });

    if (error) {
      handleApiError(error, 'deleteChatRoom', { roomId });
      return { data: null, error };
    }

    if (!data || !data.success) {
      const errorMsg = data?.error || 'Erro ao excluir sala';
      handleApiError(errorMsg, 'deleteChatRoom', { roomId });
      return { data: null, error: errorMsg };
    }

    return { data, error: null };
  } catch (error) {
    handleApiError(error, 'deleteChatRoom', { roomId });
    return { data: null, error };
  }
};


// Update last read timestamp for a room
export const updateRoomLastRead = async (roomId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { error } = await supabase
      .from('chat_room_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('room_id', roomId)
      .eq('user_id', user.id);

    if (error) {
      handleApiError(error, 'updateRoomLastRead', { roomId, userId: user.id });
      return { data: null, error };
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    handleApiError(error, 'updateRoomLastRead', { roomId });
    return { data: null, error };
  }
};

// Fetch unread counts for all joined rooms (OTIMIZADO - uma única chamada RPC)
export const fetchRoomUnreadCounts = async (roomIds: string[]) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || roomIds.length === 0) {
      return { data: {}, error: null };
    }

    // Usar função RPC otimizada que processa todas as salas de uma vez
    const { data, error } = await supabase
      .rpc('get_multiple_rooms_unread_counts', {
        p_room_ids: roomIds,
        p_user_id: user.id
      });

    if (error) {
      // Fallback para método antigo se a nova função não existir
      const counts: Record<string, number> = {};
      for (const roomId of roomIds) {
        const { data: singleData, error: singleError } = await supabase
          .rpc('get_room_unread_count', {
            p_room_id: roomId,
            p_user_id: user.id
          });
        if (!singleError && singleData !== null) {
          counts[roomId] = singleData;
        }
      }
      return { data: counts, error: null };
    }

    // Converter array de resultados para objeto
    const counts: Record<string, number> = {};
    if (data && Array.isArray(data)) {
      data.forEach((item: { room_id: string; unread_count: number }) => {
        counts[item.room_id] = item.unread_count || 0;
      });
    }

    return { data: counts, error: null };
  } catch (error) {
    handleApiError(error, 'fetchRoomUnreadCounts', { roomIds });
    return { data: {}, error };
  }
};

// Fetch participant counts for multiple rooms at once (OTIMIZADO)
export const fetchRoomsParticipantCounts = async (roomIds: string[]) => {
  try {
    if (roomIds.length === 0) {
      return { data: new Map<string, number>(), error: null };
    }

    const { data, error } = await supabase
      .rpc('get_rooms_participant_counts', {
        p_room_ids: roomIds
      });

    if (error) {
      // Fallback: buscar contadores individualmente
      const countMap = new Map<string, number>();
      for (const roomId of roomIds) {
        const { data: participants } = await fetchRoomParticipants(roomId);
        countMap.set(roomId, participants?.length || 0);
      }
      return { data: countMap, error: null };
    }

    // Converter array de resultados para Map
    const countMap = new Map<string, number>();
    if (data && Array.isArray(data)) {
      data.forEach((item: { room_id: string; participant_count: number }) => {
        countMap.set(item.room_id, Number(item.participant_count) || 0);
      });
    }

    return { data: countMap, error: null };
  } catch (error) {
    handleApiError(error, 'fetchRoomsParticipantCounts', { roomIds });
    return { data: new Map<string, number>(), error };
  }
};

// Fetch message counts from last hour for multiple rooms (OTIMIZADO)
export const fetchRoomsMessageCountsLastHour = async (roomIds: string[], userId?: string) => {
  try {
    if (roomIds.length === 0) {
      return { data: new Map<string, number>(), error: null };
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    // Buscar mensagens da última hora com informações de deleted_by_users
    const { data, error } = await supabase
      .from('chat_room_messages')
      .select('room_id, id, deleted_by_users')
      .in('room_id', roomIds)
      .gte('created_at', oneHourAgo);

    if (error) {
      handleApiError(error, 'fetchRoomsMessageCountsLastHour', { roomIds });
      return { data: new Map<string, number>(), error };
    }

    // Buscar cache de mensagens deletadas para cada sala
    const deletedMessagesCache = new Map<string, Set<string>>();
    if (userId) {
      roomIds.forEach(roomId => {
        const cacheKey = `deleted_messages_cache_${roomId}`;
        try {
          const cachedDeletedIds = JSON.parse(
            localStorage.getItem(cacheKey) || '[]'
          ) as string[];
          deletedMessagesCache.set(roomId, new Set(cachedDeletedIds));
        } catch (e) {
          deletedMessagesCache.set(roomId, new Set());
        }
      });
    }

    // Contar mensagens por sala, excluindo as deletadas pelo usuário
    const countMap = new Map<string, number>();
    if (data && Array.isArray(data)) {
      data.forEach((msg: { room_id: string; id: string; deleted_by_users?: string[] | null }) => {
        // Verificar se mensagem foi deletada pelo usuário atual
        let isDeleted = false;
        
        if (userId) {
          // Verificar cache primeiro
          const roomDeletedCache = deletedMessagesCache.get(msg.room_id);
          if (roomDeletedCache && roomDeletedCache.has(msg.id)) {
            isDeleted = true;
          }
          
          // Verificar servidor
          if (!isDeleted && msg.deleted_by_users) {
            const deletedByUsers = Array.isArray(msg.deleted_by_users) ? msg.deleted_by_users : [];
            if (deletedByUsers.includes(userId)) {
              isDeleted = true;
            }
          }
        }
        
        // Contar apenas se não foi deletada
        if (!isDeleted) {
          const currentCount = countMap.get(msg.room_id) || 0;
          countMap.set(msg.room_id, currentCount + 1);
        }
      });
    }

    // Garantir que todas as salas tenham entrada (mesmo que seja 0)
    roomIds.forEach(roomId => {
      if (!countMap.has(roomId)) {
        countMap.set(roomId, 0);
      }
    });

    return { data: countMap, error: null };
  } catch (error) {
    handleApiError(error, 'fetchRoomsMessageCountsLastHour', { roomIds });
    return { data: new Map<string, number>(), error };
  }
};

// Export types
export type { RealtimeChannel };

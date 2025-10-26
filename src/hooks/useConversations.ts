import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Conversation, User, ChatMessage } from '@/types';
import { useToast } from '@/hooks/useToast';
import * as api from '@/src/services/api';
import { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from '@supabase/supabase-js';

const VIEWED_MESSAGES_KEY = 'vigil_viewed_messages';

const getViewedMessages = (userId: string): Set<string> => {
  try {
    const stored = localStorage.getItem(`${VIEWED_MESSAGES_KEY}_${userId}`);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

const saveViewedMessages = (userId: string, messageIds: Set<string>) => {
  try {
    localStorage.setItem(`${VIEWED_MESSAGES_KEY}_${userId}`, JSON.stringify([...messageIds]));
  } catch (error) {
    console.error('Failed to save viewed messages:', error);
  }
};

const markMessagesAsViewed = (userId: string, messageIds: string[]) => {
  const viewedMessages = getViewedMessages(userId);
  messageIds.forEach(id => viewedMessages.add(id));
  saveViewedMessages(userId, viewedMessages);
};

export const useConversations = (appUser: User | null) => {
  const { addToast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const initialLoadComplete = useRef(false);

  const calculateUnreadCount = useCallback((convos: Conversation[], userId: string): number => {
    const viewedMessages = getViewedMessages(userId);
    
    let unreadCount = 0;
    convos.forEach(conv => {
      conv.messages.forEach(msg => {
        if (msg.senderId !== userId && !viewedMessages.has(msg.id)) {
          unreadCount++;
        }
      });
    });
    
    return unreadCount;
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!appUser) {
      setConversations([]);
      setIsLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase.rpc('get_user_conversations');

      if (error) {
        console.error('[fetchConversations] RPC error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        setConversations([]);
        setIsLoading(false);
        initialLoadComplete.current = true;
        return;
      }

      const formattedConversations: Conversation[] = data.map((convo: any) => {
        const formattedParticipants: User[] = (convo.participants || []).map((p: any) => ({
          id: p.id,
          name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.username,
          username: p.username,
          avatarUrl: p.avatar_url || `https://picsum.photos/seed/${p.id}/100/100`,
          joinDate: '', 
          followingCount: 0, 
          followersCount: 0,
          plan: p.plan || 'free',
          role: p.role || 'user',
        }));

        const formattedMessages: ChatMessage[] = (convo.messages || []).map((msg: any) => ({
          id: msg.id,
          senderId: msg.sender_id,
          text: msg.content,
          timestamp: msg.created_at,
        }));

        return {
          id: convo.conversation_id,
          participants: formattedParticipants,
          messages: formattedMessages,
        };
      });
      
      setConversations(formattedConversations);
      
      const unreadCount = calculateUnreadCount(formattedConversations, appUser.id);
      setUnreadMessagesCount(unreadCount);
      
    } catch (error) {
      console.error('[fetchConversations] Error:', error);
      addToast('Erro ao carregar conversas', 'error');
    } finally {
      setIsLoading(false);
      initialLoadComplete.current = true;
    }
  }, [appUser, addToast, calculateUnreadCount]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!appUser) return;

    const channel = supabase.channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          if (!initialLoadComplete.current) {
            return;
          }

          const newMessage = payload.new;
          
          let conversationExists = false;
          setConversations(prevConvos => {
            const targetConvoIndex = prevConvos.findIndex(c => c.id === newMessage.conversation_id);

            if (targetConvoIndex === -1) {
              return prevConvos;
            }
            
            conversationExists = true;
            const targetConvo = prevConvos[targetConvoIndex];

            if (targetConvo.messages.some(m => m.id === newMessage.id)) {
              return prevConvos;
            }
            
            if (newMessage.sender_id !== appUser.id) {
              const viewedMessages = getViewedMessages(appUser.id);
              if (!viewedMessages.has(newMessage.id)) {
                setUnreadMessagesCount(prev => prev + 1);
              }
            }

            const formattedMessage: ChatMessage = {
              id: newMessage.id,
              senderId: newMessage.sender_id,
              text: newMessage.content,
              timestamp: newMessage.created_at,
            };
            
            const updatedConvo = { ...targetConvo, messages: [...targetConvo.messages, formattedMessage] };
            const newConvos = [...prevConvos];
            newConvos[targetConvoIndex] = updatedConvo;
            return newConvos;
          });

          if (!conversationExists) {
            fetchConversations();
          }
        })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [appUser, fetchConversations]);

  const handleSendMessage = useCallback(async ({ conversationId, targetUserId, text }: { conversationId?: string, targetUserId?: string, text: string }): Promise<string | undefined> => {
    if (!appUser) {
      addToast('Você precisa estar logado para enviar mensagens', 'error');
      return undefined;
    }

    const tempMessageId = `temp_${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempMessageId,
      senderId: appUser.id,
      text: text,
      timestamp: new Date().toISOString(),
    };

    if (conversationId && !conversationId.startsWith('new_')) {
      setConversations(prev => prev.map(c => 
        c.id === conversationId 
          ? { ...c, messages: [...c.messages, optimisticMessage] } 
          : c
      ));
    } else if (targetUserId) {
      const targetUser = conversations.flatMap(c => c.participants).find(p => p.id === targetUserId);
      
      if (targetUser) {
        const tempConversation: Conversation = {
          id: `temp_conv_${Date.now()}`,
          participants: [
            {
              id: appUser.id,
              name: appUser.name,
              username: appUser.username,
              avatarUrl: appUser.avatarUrl,
              joinDate: '',
              followingCount: 0,
              followersCount: 0,
              plan: appUser.plan,
              role: appUser.role,
            },
            targetUser
          ],
          messages: [optimisticMessage]
        };
        
        setConversations(prev => [tempConversation, ...prev]);
      } else {
        console.error('[handleSendMessage] Target user not found in participants!');
      }
    }

    try {
      const response = await api.sendMessage({ conversationId, targetUserId, text });
      
      if (response.error) {
        console.error('[handleSendMessage] API returned error:', response.error);
        throw response.error;
      }
      
      const { data } = response;
      
      if (!data || !data.success) {
        console.error('[handleSendMessage] API returned unsuccessful response:', data);
        throw new Error('Falha ao enviar mensagem');
      }
      
      const realMessage = data.message;
      const returnedConversationId = data.conversation_id;
      
      markMessagesAsViewed(appUser.id, [realMessage.id]);

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await fetchConversations();
      
      return returnedConversationId;
      
    } catch (error) {
      console.error('[handleSendMessage] Error occurred:', error);
      
      let errorMessage = 'Falha ao enviar mensagem. Tente novamente.';
      if (error instanceof FunctionsHttpError) {
        try {
          const errorData = await error.context.json();
          console.error('[handleSendMessage] HTTP error details:', errorData);
          errorMessage = `Erro do servidor: ${errorData.error || error.message}`;
        } catch {
          errorMessage = `Erro do servidor: ${error.message}`;
        }
      } else if (error instanceof FunctionsRelayError) {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      } else if (error instanceof FunctionsFetchError) {
        errorMessage = 'Não foi possível conectar ao servidor de mensagens.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      addToast(errorMessage, 'error');
      
      setConversations(prev => prev.filter(c => !c.id.startsWith('temp_conv_')).map(c => 
        c.id === conversationId 
          ? { ...c, messages: c.messages.filter(m => m.id !== tempMessageId) } 
          : c
      ));
      
      return undefined;
    }
  }, [appUser, addToast, fetchConversations, conversations]);

  const markMessagesAsRead = useCallback(() => {
    if (!appUser) return;
    
    const allMessageIds = conversations.flatMap(conv => 
      conv.messages.map(msg => msg.id)
    );
    
    markMessagesAsViewed(appUser.id, allMessageIds);
    setUnreadMessagesCount(0);
  }, [appUser, conversations]);

  const handleDeleteConversation = useCallback(async (conversationId: string) => {
    if (!appUser) return;

    const originalConversations = conversations;
    setConversations(prev => prev.filter(c => c.id !== conversationId));

    try {
      const { error } = await api.hardDeleteConversation(conversationId);

      if (error) {
        throw error;
      }
      
      const newUnreadCount = calculateUnreadCount(
        conversations.filter(c => c.id !== conversationId), 
        appUser.id
      );
      setUnreadMessagesCount(newUnreadCount);

    } catch (error) {
      console.error('[handleDeleteConversation] Error:', error);
      addToast('Erro ao apagar conversa', 'error');
      setConversations(originalConversations);
    }
  }, [appUser, addToast, conversations, calculateUnreadCount]);

  return { conversations, unreadMessagesCount, handleSendMessage, isLoading, markMessagesAsRead, handleDeleteConversation };
};
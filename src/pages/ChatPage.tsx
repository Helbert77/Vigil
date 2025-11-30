import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { User } from '@/types';
import { Icon } from '@/components/icons/Icon';
import Avatar from '@/components/common/Avatar';
import { VerifiedBadgeIcon } from '@/src/components/icons/VerifiedBadgeIcon';
import { ModeratorBadgeIcon } from '@/src/components/icons/ModeratorBadgeIcon';
import { useToast } from '@/hooks/useToast';
import RadarView from '@/src/components/chat/RadarView';
import { ChevronLeftIcon } from '@/components/icons/ChevronLeftIcon';
import { supabase } from '@/integrations/supabase/client';
import {
  fetchChatRooms,
  fetchChatBuddies,
  fetchMessages,
  sendMessage,
  joinChatRoom,
  leaveChatRoom,
  isUserInRoom,
  updateRoomActivity,
  getUserJoinedRooms,
  createChatRoom,
  updateChatRoom,
  deleteChatRoom,
  fetchRoomMessages,
  sendRoomMessage,
  subscribeToRoomMessages,
  subscribeToChatRooms,
  fetchRoomParticipants,
  subscribeToRoomParticipants,
  ChatRoom as ChatRoomType,
  ChatMessage as ChatMessageType,
  subscribeToMessages,
  updateRoomLastRead,
  fetchRoomUnreadCounts,
  fetchRoomsParticipantCounts,
  fetchRoomsMessageCountsLastHour,
  RealtimeChannel
} from '@/src/services/chatService';
// Icons
const ChevronDownIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon className={className}><path d="m6 9 6 6 6-6"></path></Icon>;
const ChevronRightIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon className={className}><path d="m9 18 6-6-6-6"></path></Icon>;
const FireIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <span className={className} role="img" aria-label="Hot">🔥</span>
);
const NewIcon = ({ className = "h-4 w-4" }: { className?: string }) => {
  // Cores verde: green-500 = #10b981, green-600 = #059669
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
        fill="#10b981"
        className="dark:fill-[#059669]"
      />
    </svg>
  );
};

// Função para verificar se uma sala ainda é considerada "nova"
// Uma sala é nova se foi criada há menos de 24 horas
const isRoomNew = (createdAt: string): boolean => {
  if (!createdAt) return false;
  
  const createdDate = new Date(createdAt);
  const now = new Date();
  const hoursSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
  
  // Considera nova se foi criada há menos de 24 horas
  return hoursSinceCreation < 24;
};

// Função para verificar se uma sala ainda é considerada "hot" (quente)
// Uma sala é hot se tem mais de 50 mensagens na última hora
// Esta função recebe o roomId e usa o estado roomsMessageCountsLastHour
const isRoomHot = (roomId: string, messageCountsMap: Map<string, number>): boolean => {
  if (!roomId || !messageCountsMap) return false;
  
  const messageCount = messageCountsMap.get(roomId) || 0;
  
  // Sala é hot se tem mais de 50 mensagens na última hora
  return messageCount > 50;
};
const SendIcon = () => <Icon className="h-6 w-6"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></Icon>;
const EditIcon = ({ className = "h-4 w-4" }: { className?: string }) => <Icon className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></Icon>;
const TrashIcon = ({ className = "h-4 w-4" }: { className?: string }) => <Icon className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></Icon>;
const XIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></Icon>;
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
  </div>
);

interface ChatPageProps {
  user: User;
  onUpdateUser: (updates: Partial<User>) => Promise<void>;
}

interface Buddy {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastActivity: string;
  isOnline: boolean;
  unreadCount: number;
  plan?: string;
  role?: string;
  interests?: string[];
  age?: number;
  location?: string;
}

export default function ChatPage({ user, onUpdateUser }: ChatPageProps) {
  const { session } = useSession();
  const { addToast } = useToast();

  // Estilos para barras de rolagem finas e discretas
  const scrollbarStyles = `
    .thin-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .thin-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .thin-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(156, 163, 175, 0.3);
      border-radius: 3px;
    }
    .thin-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(156, 163, 175, 0.5);
    }
    .dark .thin-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(75, 85, 99, 0.4);
    }
    .dark .thin-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(75, 85, 99, 0.6);
    }

    /* Mobile scroll improvements */
    .mobile-scroll {
      -webkit-overflow-scrolling: touch;
      touch-action: pan-y;
      overscroll-behavior: contain;
      /* Ensure the element can scroll */
      overflow-y: auto;
      overflow-x: hidden;
      /* Prevent rubber band effect on iOS */
      overscroll-behavior-y: contain;
    }

    /* Ensure proper height calculation on mobile */
    @supports (-webkit-touch-callout: none) {
      .mobile-scroll {
        /* iOS specific optimizations */
        -webkit-overflow-scrolling: touch;
        transform: translateZ(0);
        /* Additional iOS scroll fixes */
        -webkit-transform: translateZ(0);
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
      }
    }

    /* Android specific fixes */
    @supports not (-webkit-touch-callout: none) {
      .mobile-scroll {
        /* Prevent overscroll on Android */
        overscroll-behavior: none;
      }
    }

    /* Additional mobile scroll fixes for chat containers */
    .chat-messages-scroll {
      /* Force hardware acceleration for better scroll performance */
      transform: translateZ(0);
      -webkit-transform: translateZ(0);
      /* Ensure touch events are handled properly */
      touch-action: pan-y pinch-zoom;
      /* Prevent text selection during scroll */
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    /* Re-enable text selection for message content */
    .chat-messages-scroll * {
      -webkit-user-select: text;
      -moz-user-select: text;
      -ms-user-select: text;
      user-select: text;
    }
  `;

  // State
  const [selectedBuddy, setSelectedBuddy] = useState<Buddy | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomType | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // State for mobile scroll fixes
  const [containerHeight, setContainerHeight] = useState('calc(100vh - 200px)');

  // Calculate dynamic height for mobile scroll container
  useEffect(() => {
    const calculateHeight = () => {
      if (typeof window !== 'undefined') {
        const viewportHeight = window.innerHeight;
        const headerHeight = 80; // Approximate header height
        const inputHeight = 80; // Approximate input area height
        const totalFixed = headerHeight + inputHeight;
        const availableHeight = viewportHeight - totalFixed;

        // Ensure minimum height for usability
        const finalHeight = Math.max(availableHeight, 300);
        setContainerHeight(`${finalHeight}px`);
      }
    };

    calculateHeight();

    // Recalculate on resize and orientation change
    const handleResize = () => {
      setTimeout(calculateHeight, 100); // Small delay for mobile browsers
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);
  const [activeAccordion, setActiveAccordion] = useState<string>('');
  const [currentView, setCurrentView] = useState<'radar' | 'room'>('radar');

  const [roomCategoryFilter, setRoomCategoryFilter] = useState<string>('');

  // Data states
  const [chatRooms, setChatRooms] = useState<ChatRoomType[]>([]);
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [joinedRoomIds, setJoinedRoomIds] = useState<Set<string>>(new Set());
  const [userActivityStatus, setUserActivityStatus] = useState<'online' | 'away' | 'offline'>('online');
  const [showChatOptionsMenu, setShowChatOptionsMenu] = useState(false);
  
  // Room participants state
  const [roomParticipants, setRoomParticipants] = useState<User[]>([]);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [roomsOnlineCount, setRoomsOnlineCount] = useState<Map<string, number>>(new Map());
  const [roomUnreadCounts, setRoomUnreadCounts] = useState<Map<string, number>>(new Map());
  const [roomsMessageCountsLastHour, setRoomsMessageCountsLastHour] = useState<Map<string, number>>(new Map());

  // Loading states
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingBuddies, setLoadingBuddies] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Error states
  const [roomsError, setRoomsError] = useState<string | null>(null);
  const [buddiesError, setBuddiesError] = useState<string | null>(null);

  // Real-time subscription
  const [messageSubscription, setMessageSubscription] = useState<RealtimeChannel | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sidebar collapse states
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  
  // Mobile view state
  const [mobileView, setMobileView] = useState<'left' | 'center' | 'right'>('center');

  // Activity tracking refs
  const lastActivityTimeRef = useRef<number>(Date.now());
  const activityIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPageUnloadingRef = useRef<boolean>(false);

  // Room management states
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showEditRoomModal, setShowEditRoomModal] = useState(false);
  const [showDeleteRoomModal, setShowDeleteRoomModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showConversationsDropdown, setShowConversationsDropdown] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<ChatRoomType | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<ChatRoomType | null>(null);
  const [roomFormData, setRoomFormData] = useState({
    name: '',
    description: '',
    category: 'normal',
    is_public: true,
    max_participants: 100
  });
  const [isSubmittingRoom, setIsSubmittingRoom] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(false); // Flag para controlar quando fazer scroll
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const chatOptionsMenuRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ONLY when user sends a message, never when entering room or loading messages
  useEffect(() => {
    if (shouldScrollRef.current && messagesEndRef.current) {
      // Small delay to ensure message is rendered
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        shouldScrollRef.current = false; // Reset flag after scrolling
      }, 100);
    }
  }, [messages]);

  // Scroll instantâneo ao carregar mensagens - SEM animação, igual à página Messages
  useEffect(() => {
    if (currentView === 'room' && selectedRoom && messages.length > 0 && !loadingMessages && messagesContainerRef.current) {
      // Scroll direto sem delays ou animações - igual à página Messages
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages.length, loadingMessages, currentView, selectedRoom]);


  // Fechar menu de opções ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatOptionsMenuRef.current && !chatOptionsMenuRef.current.contains(event.target as Node)) {
        setShowChatOptionsMenu(false);
      }
    };

    if (showChatOptionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showChatOptionsMenu]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addToast('Conexão restaurada', 'success');
    };

    const handleOffline = () => {
      setIsOnline(false);
      addToast('Conexão perdida', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Dark mode detection
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    // Create observer for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Load unread counts for joined rooms
  useEffect(() => {
    const loadUnreadCounts = async () => {
      if (joinedRoomIds.size === 0) {
        setRoomUnreadCounts(new Map());
        return;
      }

      const roomIdsArray = Array.from(joinedRoomIds);
      const { data, error } = await fetchRoomUnreadCounts(roomIdsArray);

      if (!error && data) {
        setRoomUnreadCounts(new Map(Object.entries(data)));
      }
    };

    loadUnreadCounts();
  }, [joinedRoomIds]);

  // Atualizar contagens de mensagens da última hora periodicamente (a cada 5 minutos)
  useEffect(() => {
    const updateMessageCounts = async () => {
      if (chatRooms.length === 0) return;
      
      const roomIds = chatRooms.map(room => room.id);
      const { data: countMap } = await fetchRoomsMessageCountsLastHour(roomIds);
      
      if (countMap) {
        setRoomsMessageCountsLastHour(countMap);
      }
    };

    // Atualizar imediatamente
    updateMessageCounts();

    // Atualizar a cada 5 minutos
    const interval = setInterval(updateMessageCounts, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [chatRooms]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsInitializing(true);
        // Load user's joined rooms
        const joinedRooms = await getUserJoinedRooms();
        setJoinedRoomIds(new Set(joinedRooms));
        
        await Promise.all([
          loadChatRooms(),
          loadBuddies()
        ]);
      } catch (error: any) {
        addToast('Erro ao carregar dados iniciais', 'error');
      } finally {
        setIsInitializing(false);
      }
    };

    loadInitialData();

    // Subscribe to chat_rooms table updates
    const roomsSubscription = subscribeToChatRooms((payload: any) => {
      if (payload.new && payload.new.id) {
        setChatRooms(prev => prev.map(room => 
          room.id === payload.new.id 
            ? { ...room, ...payload.new }
            : room
        ));

        // Also update selectedRoom if it's the one that changed
        if (selectedRoom && selectedRoom.id === payload.new.id) {
          setSelectedRoom(prev => prev ? { ...prev, ...payload.new } : null);
        }
      }
    });

    // Subscribe to all rooms participants changes to update online counts (OTIMIZADO)
    // Usa debounce para evitar múltiplas queries quando vários eventos acontecem rapidamente
    let participantUpdateTimeout: NodeJS.Timeout | null = null;
    const pendingRoomUpdates = new Set<string>();

    const allRoomsParticipantsSubscription = supabase
      .channel('all_room_participants')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_room_participants'
        },
        (payload) => {
          const roomId = payload.new?.room_id || payload.old?.room_id;
          const userId = payload.new?.user_id || payload.old?.user_id;
          
          if (roomId) {
            // Adicionar sala à lista de atualizações pendentes
            pendingRoomUpdates.add(roomId);

            // Debounce: atualizar contadores após 500ms de inatividade
            if (participantUpdateTimeout) {
              clearTimeout(participantUpdateTimeout);
            }

            participantUpdateTimeout = setTimeout(async () => {
              // Buscar contadores de todas as salas pendentes de uma vez
              const roomIdsArray = Array.from(pendingRoomUpdates);
              if (roomIdsArray.length > 0) {
                const { data: countMap } = await fetchRoomsParticipantCounts(roomIdsArray);
                if (countMap) {
                  setRoomsOnlineCount(prev => {
                    const newMap = new Map(prev);
                    countMap.forEach((count, id) => newMap.set(id, count));
                    return newMap;
                  });
                }
                pendingRoomUpdates.clear();
              }
            }, 500);

            // Check if the current user was removed from a room
            if (payload.eventType === 'DELETE' && userId === session?.user?.id) {
              // Remove room from joinedRoomIds
              setJoinedRoomIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(roomId);
                return newSet;
              });

              // If it's the currently selected room, go back to radar
              if (selectedRoom?.id === roomId) {
                setSelectedRoom(null);
                setCurrentView('radar');
                setMessages([]);
                addToast('Você foi removido da sala por inatividade', 'warning');
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      if (participantUpdateTimeout) {
        clearTimeout(participantUpdateTimeout);
      }
      if (roomsSubscription) {
        roomsSubscription.unsubscribe();
      }
      if (allRoomsParticipantsSubscription) {
        supabase.removeChannel(allRoomsParticipantsSubscription);
      }
    };
  }, []);

  // Reload rooms when category filter changes
  useEffect(() => {
    if (!isInitializing) {
      loadChatRooms();
    }
  }, [roomCategoryFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Periodic sync to ensure joinedRoomIds is accurate (OTIMIZADO - menos frequente)
  useEffect(() => {
    const syncJoinedRooms = async () => {
      if (!session?.user?.id) return;
      
      const joinedRooms = await getUserJoinedRooms();
      const joinedSet = new Set(joinedRooms);
      
      // Check if there are differences
      const currentIds = Array.from(joinedRoomIds);
      const hasChanges = currentIds.some(id => !joinedSet.has(id)) || 
                         joinedRooms.some(id => !joinedRoomIds.has(id));
      
      if (hasChanges) {
        setJoinedRoomIds(joinedSet);
        
        // If currently in a room that user is no longer part of, exit
        if (selectedRoom && !joinedSet.has(selectedRoom.id)) {
          setSelectedRoom(null);
          setCurrentView('radar');
          setMessages([]);
          addToast('Você foi removido da sala por inatividade', 'warning');
        }
      }
    };

    // Sync every 60 seconds (reduzido de 30 para melhorar performance)
    const syncInterval = setInterval(syncJoinedRooms, 60000);
    
    // Initial sync
    syncJoinedRooms();

    return () => clearInterval(syncInterval);
  }, [session?.user?.id, joinedRoomIds, selectedRoom]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load and subscribe to room participants
  useEffect(() => {
    if (!selectedRoom?.id || !session?.user?.id) {
      setRoomParticipants([]);
      setParticipantsCount(0);
      return;
    }

    const loadParticipants = async () => {
      const { data } = await fetchRoomParticipants(selectedRoom.id);
      if (data) {
        setRoomParticipants(data);
        setParticipantsCount(data.length);
      }
    };

    loadParticipants();

    const subscription = subscribeToRoomParticipants(selectedRoom.id, (participants, count) => {
      setRoomParticipants(participants);
      setParticipantsCount(count);
      
      // Update the online count for this room in the rooms list
      setRoomsOnlineCount(prev => {
        const newMap = new Map(prev);
        newMap.set(selectedRoom.id, count);
        return newMap;
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedRoom?.id, session?.user?.id]);

  // Subscribe to messages when conversation is selected
  useEffect(() => {
    if (selectedBuddy && session?.user?.id) {
      // Reset scroll flag when entering a new conversation - don't auto-scroll
      shouldScrollRef.current = false;
      // Scroll to top when entering conversation
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = 0;
      }
      subscribeToConversationMessages(selectedBuddy.id);

      // Focar no input quando entrar na conversa
      setTimeout(() => {
        if (messageInputRef.current && isOnline) {
          messageInputRef.current.focus();
        }
      }, 300);
    }

    return () => {
      if (messageSubscription) {
        messageSubscription.unsubscribe();
        setMessageSubscription(null);
      }
    };
  }, [selectedBuddy, session?.user?.id, isOnline]);

  // Subscribe to room messages when room is selected
  useEffect(() => {
    let currentSubscription: RealtimeChannel | null = null;

    if (selectedRoom && session?.user?.id) {
      // Reset scroll flag when entering a new room - don't auto-scroll
      shouldScrollRef.current = false;
      // NÃO fazer scroll para topo aqui - deixar o scroll automático gerenciar
      subscribeToRoomMessagesHandler(selectedRoom.id).then(subscription => {
        if (subscription) {
          currentSubscription = subscription;
          setMessageSubscription(subscription);
        }
      });

      // Focar no input quando entrar na sala
      setTimeout(() => {
        if (messageInputRef.current && isOnline) {
          messageInputRef.current.focus();
        }
      }, 300);
    }

    return () => {
      if (currentSubscription) {
        currentSubscription.unsubscribe();
        setMessageSubscription(null);
      }
    };
  }, [selectedRoom?.id, session?.user?.id, isOnline]);

  // Track user activity and update status
  useEffect(() => {
    // Clear any existing intervals and timeouts first
    if (activityIntervalRef.current) {
      clearInterval(activityIntervalRef.current);
      activityIntervalRef.current = null;
    }
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
      activityTimeoutRef.current = null;
    }

    if (!selectedRoom) {
      // Reset activity tracking when no room is selected
      setUserActivityStatus('online');
      return;
    }

    // Reset activity time when entering a room
    lastActivityTimeRef.current = Date.now();
    setUserActivityStatus('online');

    // Check activity status every 30 seconds
    activityIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityTimeRef.current;
      
      // 3 minutes = 180000ms - set to "away"
      if (timeSinceLastActivity >= 180000 && timeSinceLastActivity < 300000) {
        setUserActivityStatus('away');
      }
      // 5 minutes = 300000ms - leave room automatically
      else if (timeSinceLastActivity >= 300000) {
        setUserActivityStatus('offline');
        // Leave the room automatically
        handleLeaveRoom(selectedRoom);
        addToast('Você foi removido da sala por inatividade', 'info');
      }
    }, 30000); // Check every 30 seconds

    return () => {
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current);
        activityIntervalRef.current = null;
      }
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
        activityTimeoutRef.current = null;
      }
    };
  }, [selectedRoom?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track user activity on page interactions
  useEffect(() => {
    if (!selectedRoom) {
      // Clear debounce timeout when no room is selected
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      return;
    }

    const currentRoomId = selectedRoom.id;

    const updateActivity = () => {
      // Debounce activity updates to avoid too many calls
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        const now = Date.now();
        lastActivityTimeRef.current = now;
        setUserActivityStatus('online');
        updateRoomActivity(currentRoomId).catch(() => {});
      }, 2000); // Update at most once per 2 seconds
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, [selectedRoom?.id]);

  // Cleanup on page unload - DISABLED to keep users in rooms
  // Users will only leave when they explicitly click "Sair"
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      isPageUnloadingRef.current = true;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Load chat rooms
  const loadChatRooms = async () => {
    try {
      setLoadingRooms(true);
      setRoomsError(null);

      const { data, error } = await fetchChatRooms(roomCategoryFilter || undefined);

      if (error) {
        const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao carregar salas de chat';
        setRoomsError(errorMessage);
        addToast('Erro ao carregar salas de chat', 'error');
      } else {
        setChatRooms(data || []);
        // Load online count for each room
        await loadRoomsOnlineCount(data || []);
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao carregar salas de chat';
      setRoomsError(errorMessage);
      addToast('Erro ao carregar salas de chat', 'error');
    } finally {
      setLoadingRooms(false);
    }
  };

  // Load online count for all rooms (OTIMIZADO - uma única query)
  const loadRoomsOnlineCount = async (rooms: ChatRoomType[]) => {
    if (rooms.length === 0) {
      setRoomsOnlineCount(new Map());
      return;
    }

    const roomIds = rooms.map(room => room.id);
    const { data: countMap, error } = await fetchRoomsParticipantCounts(roomIds);
    
    if (!error && countMap) {
      setRoomsOnlineCount(countMap);
    } else {
      // Fallback: usar método antigo se a nova função não estiver disponível
      const fallbackMap = new Map<string, number>();
      for (const room of rooms) {
        const { data } = await fetchRoomParticipants(room.id);
        fallbackMap.set(room.id, data?.length || 0);
      }
      setRoomsOnlineCount(fallbackMap);
    }
  };

  // Load new users (suggestions from main app)

  // Load buddies (chat buddies - conceito Odigo)
  const loadBuddies = async () => {
    try {
      setLoadingBuddies(true);
      setBuddiesError(null);
      const { data, error } = await fetchChatBuddies(user.id);

      if (error) {
        setBuddiesError('Erro ao carregar buddies');
        return;
      }

      if (data && data.length > 0) {
        const transformedBuddies: Buddy[] = data.map((profile: any) => ({
          id: profile.id,
          name: profile.full_name || profile.username,
          username: profile.username,
          avatarUrl: profile.avatar_url,
          lastMessage: 'Última mensagem...',
          lastActivity: profile.last_active_at || new Date().toISOString(),
          isOnline: profile.last_active_at ?
            new Date(profile.last_active_at).getTime() > Date.now() - 5 * 60 * 1000 :
            false,
          unreadCount: 0, // TODO: Implement unread count
          plan: profile.plan,
          role: profile.role,
          interests: profile.interests,
          age: profile.age,
          location: profile.location
        }));
        setBuddies(transformedBuddies);
      } else {
        setBuddies([]);
      }
    } catch (error) {
      setBuddiesError('Erro ao carregar buddies');
    } finally {
      setLoadingBuddies(false);
    }
  };

  // Subscribe to conversation messages
  const subscribeToConversationMessages = async (conversationId: string) => {
    if (!conversationId) return;

    try {
      // Load existing messages first
      setLoadingMessages(true);
      const { data, error } = await fetchMessages(conversationId);

      if (error) {
        addToast('Erro ao carregar mensagens', 'error');
      } else {
        setMessages(data || []);
      }

      // Subscribe to new messages
      const subscription = subscribeToMessages(conversationId, (newMessage) => {
        // Only scroll if user sent this message (flag is set)
        // Don't scroll for messages from other users
        const isFromCurrentUser = newMessage.sender_id === session?.user?.id;
        if (!isFromCurrentUser) {
          shouldScrollRef.current = false; // Ensure we don't scroll for other users' messages
        }
        
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          const messageExists = prev.some(msg => msg.id === newMessage.id);
          if (messageExists) {
            return prev;
          }
          return [...prev, newMessage];
        });
      });

      setMessageSubscription(subscription);
    } catch (error: any) {
      addToast('Erro ao carregar mensagens', 'error');
    } finally {
      setLoadingMessages(false);
    }
  };

  // Handlers
  const handleAccordionToggle = (accordion: string) => {
    if (accordion === 'rooms') {
      // Quando abrir 'rooms', fecha os outros e abre 'rooms'
      setActiveAccordion(activeAccordion === 'rooms' ? '' : 'rooms');
    } else {
      // Para outras abas, sempre fecha 'rooms' se estiver aberto e abre a aba clicada
      setActiveAccordion(activeAccordion === accordion ? '' : accordion);
    }
  };

  // Limpar conversas localmente (apenas no navegador)
  const handleClearConversations = () => {
    if (selectedRoom) {
      // Limpar mensagens da sala atual
      setMessages([]);
      addToast('Conversas limpas localmente', 'success');
      setShowChatOptionsMenu(false);
    } else if (selectedBuddy) {
      // Limpar mensagens do buddy atual
      setMessages([]);
      addToast('Conversas limpas localmente', 'success');
      setShowChatOptionsMenu(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || isSending) return;

    // Check if online before sending
    if (!isOnline) {
      addToast('Você está offline. Mensagem será enviada quando a conexão for restaurada.', 'info');
      return;
    }

    // Handle room message
    if (selectedRoom) {
      setIsSending(true);
      try {
        const { data: messageData, error } = await sendRoomMessage(selectedRoom.id, messageText);

        if (error) {
          const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao enviar mensagem';
          addToast(errorMessage, 'error');
          return;
        }

        // Update activity when sending message
        const now = Date.now();
        lastActivityTimeRef.current = now;
        setUserActivityStatus('online');
        await updateRoomActivity(selectedRoom.id);

        // Set flag to scroll to bottom when message is received via subscription
        shouldScrollRef.current = true;

        // Fallback: Se não houver subscription ativa ou se a mensagem não aparecer em 1.5s, adicionar manualmente
        if (messageData) {
          const messageId = messageData.id;
          let messageAdded = false;

          // Verificar se mensagem já existe (caso a subscription seja muito rápida)
          setMessages(prev => {
            if (prev.some(msg => msg.id === messageId)) {
              messageAdded = true;
              return prev;
            }
            return prev;
          });

          // Se não foi adicionada e não há subscription, adicionar imediatamente
          if (!messageAdded && !messageSubscription) {
            setMessages(prev => [...prev, messageData]);
            messageAdded = true;
          }

          // Fallback com timeout se subscription não funcionar
          if (!messageAdded) {
            const fallbackTimeout = setTimeout(() => {
              setMessages(prev => {
                const exists = prev.some(msg => msg.id === messageId);
                if (!exists) {
                  return [...prev, messageData];
                }
                return prev;
              });
            }, 1500);

            // Limpar timeout se mensagem aparecer
            const checkInterval = setInterval(() => {
              setMessages(prev => {
                const exists = prev.some(msg => msg.id === messageId);
                if (exists) {
                  clearTimeout(fallbackTimeout);
                  clearInterval(checkInterval);
                }
                return prev;
              });
            }, 100);

            setTimeout(() => clearInterval(checkInterval), 3000);
          }
        }

        setMessageText('');
        
        // Focar no input após enviar mensagem
        setTimeout(() => {
          if (messageInputRef.current && isOnline) {
            messageInputRef.current.focus();
          }
        }, 100);
      } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao enviar mensagem';
        addToast(errorMessage, 'error');
      } finally {
        setIsSending(false);
      }
      return;
    }

    // Handle buddy message (existing logic)
    if (!selectedBuddy) return;

    setIsSending(true);

    try {
      // Create conversation if it doesn't exist
      let conversationId = `buddy_${selectedBuddy.id}`;

      const { data: messageData, error } = await sendMessage({
        conversationId,
        content: messageText
      });

      if (error) {
        const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao enviar mensagem';
        addToast(errorMessage, 'error');
        return;
      }

      if (messageData) {
        setMessages(prev => [...prev, messageData]);
        // Set flag to scroll to bottom when user sends message
        shouldScrollRef.current = true;
      }

      // Update buddy's last activity
      setBuddies(prev => prev.map(buddy =>
        buddy.id === selectedBuddy.id
          ? { ...buddy, lastMessage: messageText, lastActivity: new Date().toISOString() }
          : buddy
      ));

      setMessageText('');
      
      // Focar no input após enviar mensagem
      setTimeout(() => {
        if (messageInputRef.current && isOnline) {
          messageInputRef.current.focus();
        }
      }, 100);

    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao enviar mensagem';
      addToast(errorMessage, 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Radar functions
  const handleRadarUserClick = (radarUser: any) => {
    const buddy = buddies.find(b => b.id === radarUser.id);
    if (buddy) {
      setSelectedBuddy(buddy);
      // Chat view removida - manter no radar
    }
  };

  const handleViewToggle = (view: 'radar') => {
    setCurrentView(view);
  };


  const handleSelectBuddy = (buddy: Buddy) => {
    setSelectedBuddy(buddy);
    setSelectedRoom(null);
    // Chat view removida - manter no radar
    // Clear unread count
    setBuddies(prev => prev.map(b =>
      b.id === buddy.id ? { ...b, unreadCount: 0 } : b
    ));
  };


  const handleJoinRoom = async (room: ChatRoomType) => {
    try {
      // Check if user is already in the room
      const isInRoom = joinedRoomIds.has(room.id);
      
      if (isInRoom) {
        // User is already in room, DON'T leave - this was the bug!
        // Just show a message
        addToast(`Você já está na sala ${room.name}`, 'info');
        return;
      }

      // Join the room (user can be in multiple rooms)
      const { data, error } = await joinChatRoom(room.id);

      if (error) {
        // Check if error is duplicate key (user already in room)
        const isDuplicateError = 
          (typeof error === 'object' && error.code === '23505') ||
          (typeof error === 'object' && error.message && (
            error.message.includes('duplicate key') ||
            error.message.includes('unique constraint') ||
            error.message.includes('chat_room_participants_room_id_user_id_key')
          ));

        if (isDuplicateError) {
          // User is already in room, treat as success
          addToast(`Você já está na sala ${room.name}`, 'info');
          setJoinedRoomIds(prev => new Set([...prev, room.id]));
          return;
        }

        const errorMessage = error instanceof Error ? error.message : (typeof error === 'object' && error.message) ? error.message : typeof error === 'string' ? error : 'Erro ao entrar na sala';
        addToast(errorMessage, 'error');
      } else {
        addToast(`Entrou na sala ${room.name}`, 'success');
        setJoinedRoomIds(prev => new Set([...prev, room.id]));
        
        const updatedRoom = {
          ...room
        };
        setSelectedRoom(updatedRoom);

        setSelectedBuddy(null);
        setCurrentView('room');

        // Switch to center view on mobile when entering a room
        setMobileView('center');
        const now = Date.now();
        lastActivityTimeRef.current = now;
        setUserActivityStatus('online');
        
        // Update online count for this room
        const { data: participants } = await fetchRoomParticipants(room.id);
        setRoomsOnlineCount(prev => {
          const newMap = new Map(prev);
          newMap.set(room.id, participants?.length || 0);
          return newMap;
        });
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao entrar na sala';
      addToast(errorMessage, 'error');
    }
  };

  // Nova função apenas para trocar de visualização entre salas (sem entrar/sair)
  const handleSwitchToRoom = async (room: ChatRoomType) => {
    if (!joinedRoomIds.has(room.id)) {
      // Se não está na sala, não pode visualizar
      addToast('Entre na sala primeiro', 'warning');
      return;
    }

    const hasUnreadMessages = roomUnreadCounts.get(room.id) > 0;
    
    setSelectedRoom(room);
    setSelectedBuddy(null);
    setCurrentView('room');
    const now = Date.now();
    lastActivityTimeRef.current = now;
    setUserActivityStatus('online');

    // Reset unread count imediatamente ao entrar na sala
    await updateRoomLastRead(room.id);
    setRoomUnreadCounts(prev => {
      const newMap = new Map(prev);
      newMap.set(room.id, 0);
      return newMap;
    });

    // Scroll automático é feito diretamente no useEffect de messages
  };

  const handleLeaveRoom = async (room: ChatRoomType) => {
    try {
      const { data, error } = await leaveChatRoom(room.id);

      if (error) {
        const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao sair da sala';
        addToast(errorMessage, 'error');
      } else {
        addToast(`Saiu da sala ${room.name}`, 'success');
        setJoinedRoomIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(room.id);
          return newSet;
        });
        
        // Update online count for this room
        const { data: participants } = await fetchRoomParticipants(room.id);
        setRoomsOnlineCount(prev => {
          const newMap = new Map(prev);
          newMap.set(room.id, participants?.length || 0);
          return newMap;
        });
        
        // If leaving the currently selected room, go back to radar view
        if (selectedRoom?.id === room.id) {
          setSelectedRoom(null);
          setCurrentView('radar');
          setMessages([]);
          // Unsubscribe from messages
          if (messageSubscription) {
            messageSubscription.unsubscribe();
            setMessageSubscription(null);
          }
        }
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao sair da sala';
      addToast(errorMessage, 'error');
    }
  };

  // Subscribe to room messages
  const subscribeToRoomMessagesHandler = async (roomId: string): Promise<RealtimeChannel | null> => {
    if (!roomId) return null;

    try {
      // Load existing messages first
      setLoadingMessages(true);
      const { data, error } = await fetchRoomMessages(roomId);

      if (error) {
        addToast('Erro ao carregar mensagens da sala', 'error');
        setLoadingMessages(false);
        return null;
      } else {
        // Definir mensagens - o useEffect vai cuidar do scroll automático
        setMessages(data || []);
      }

      // Unsubscribe from previous subscription if exists
      if (messageSubscription) {
        messageSubscription.unsubscribe();
        setMessageSubscription(null);
      }

      // Subscribe to new messages
      const subscription = subscribeToRoomMessages(roomId, (newMessage) => {
        const isFromCurrentUser = newMessage.sender_id === session?.user?.id;

        // Se não é da sala ativa e não é do usuário atual, incrementar contador
        if (selectedRoom?.id !== roomId && !isFromCurrentUser) {
          setRoomUnreadCounts(prev => {
            const newMap = new Map(prev);
            const currentCount = newMap.get(roomId) || 0;
            newMap.set(roomId, currentCount + 1);
            return newMap;
          });
        }

        // Atualizar contagem de mensagens da última hora para esta sala
        // Verificar se a mensagem foi criada na última hora
        const messageDate = new Date(newMessage.created_at);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (messageDate >= oneHourAgo) {
          setRoomsMessageCountsLastHour(prev => {
            const newMap = new Map(prev);
            const currentCount = newMap.get(roomId) || 0;
            newMap.set(roomId, currentCount + 1);
            return newMap;
          });
        }

        // Para mensagens do próprio usuário, sempre fazer scroll
        if (isFromCurrentUser) {
          shouldScrollRef.current = true;
        } else {
          shouldScrollRef.current = false; // Ensure we don't scroll for other users' messages
        }
        
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          const messageExists = prev.some(msg => msg.id === newMessage.id);
          if (messageExists) {
            return prev;
          }
          return [...prev, newMessage];
        });
      });

      setMessageSubscription(subscription);
      setLoadingMessages(false);
      return subscription;
    } catch (error: any) {
      addToast('Erro ao carregar mensagens da sala', 'error');
      setLoadingMessages(false);
      return null;
    }
  };

  const handleCreateRoom = async () => {
    if (!roomFormData.name.trim()) {
      addToast('Nome da sala é obrigatório', 'error');
      return;
    }

    setIsSubmittingRoom(true);
    try {
      const { data, error } = await createChatRoom(roomFormData);

      if (error) {
        let errorMessage = 'Erro ao criar sala';
        
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error && typeof error === 'object') {
          // Tentar extrair mensagem de erro do objeto
          errorMessage = (error as any).error || (error as any).message || errorMessage;
        }
        
        addToast(errorMessage, 'error');
      } else {
        addToast('Sala criada com sucesso!', 'success');
        setShowCreateRoomModal(false);
        setRoomFormData({ name: '', description: '', category: 'normal', is_public: true, max_participants: 100 });
        loadChatRooms();
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao criar sala';
      addToast(errorMessage, 'error');
    } finally {
      setIsSubmittingRoom(false);
    }
  };

  const handleEditRoom = async () => {
    if (!roomToEdit || !roomFormData.name.trim()) {
      addToast('Nome da sala é obrigatório', 'error');
      return;
    }

    setIsSubmittingRoom(true);
    try {
      const { data, error } = await updateChatRoom(roomToEdit.id, roomFormData);

      if (error) {
        const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao atualizar sala';
        addToast(errorMessage, 'error');
      } else {
        addToast('Sala atualizada com sucesso!', 'success');
        setShowEditRoomModal(false);
        setRoomToEdit(null);
        setRoomFormData({ name: '', description: '', category: 'normal', is_public: true, max_participants: 100 });
        loadChatRooms();
        // Update selected room if it's the one being edited
        if (selectedRoom?.id === roomToEdit.id) {
          setSelectedRoom(data);
        }
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao atualizar sala';
      addToast(errorMessage, 'error');
    } finally {
      setIsSubmittingRoom(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;

    setIsSubmittingRoom(true);
    try {
      const { data, error } = await deleteChatRoom(roomToDelete.id);

      if (error) {
        const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao excluir sala';
        addToast(errorMessage, 'error');
      } else {
        addToast('Sala excluída com sucesso!', 'success');
        setShowDeleteRoomModal(false);
        setRoomToDelete(null);
        
        // Clear selected room if it was deleted
        if (selectedRoom?.id === roomToDelete.id) {
          setSelectedRoom(null);
          setCurrentView('radar');
        }
        
        // Otimização: remover sala da lista local em vez de recarregar tudo
        setChatRooms(prev => prev.filter(room => room.id !== roomToDelete.id));
        setRoomsOnlineCount(prev => {
          const newMap = new Map(prev);
          newMap.delete(roomToDelete.id);
          return newMap;
        });
        setJoinedRoomIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(roomToDelete.id);
          return newSet;
        });
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao excluir sala';
      addToast(errorMessage, 'error');
    } finally {
      setIsSubmittingRoom(false);
    }
  };

  const openEditRoomModal = (room: ChatRoomType, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setRoomToEdit(room);
    setRoomFormData({
      name: room.name,
      description: room.description || '',
      category: room.category || 'normal',
      is_public: room.is_public !== undefined ? room.is_public : true,
      max_participants: room.max_participants || 100
    });
    setShowEditRoomModal(true);
  };

  const openDeleteRoomModal = (room: ChatRoomType, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setRoomToDelete(room);
    setShowDeleteRoomModal(true);
  };

  const canManageRoom = (room: ChatRoomType) => {
    if (!session?.user?.id) return false;
    const isCreator = room.created_by === session.user.id;
    const isAdminOrModerator = user.role === 'admin' || user.role === 'moderator';
    return isCreator || isAdminOrModerator;
  };

  // Open location settings based on device/browser
  const openLocationSettings = () => {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isAndroid = /Android/.test(userAgent);
    const isMobile = isIOS || isAndroid;
    const isMac = /Mac/.test(userAgent);
    const isWindows = /Win/.test(userAgent);

    if (isMobile) {
      try {
        if (isIOS) {
          // iOS - try multiple approaches
          if (navigator.userAgent.includes('Safari')) {
            // iOS Safari - redirect to settings
            window.location.href = 'app-settings:';
          } else {
            // Other iOS browsers - show instructions
            alert('IMPORTANTE: Primeiro ative a localização no iOS!\n\n1. Abra o app "Ajustes"\n2. Toque em "Privacidade e Segurança"\n3. Toque em "Serviços de Localização"\n4. Ative os Serviços de Localização\n\nDepois configure o navegador:\n5. Volte ao navegador e encontre este site na lista\n6. Permita o acesso à localização\n7. Recarregue esta página');
          }
        } else if (isAndroid) {
          // Android - try to open settings
          try {
            window.location.href = 'android.settings.LOCATION_SOURCE_SETTINGS';
          } catch (e) {
            // Fallback for Android
            alert('IMPORTANTE: Primeiro ative a localização no Android!\n\n1. Abra "Configurações"\n2. Procure por "Localização" ou "GPS"\n3. Ative a localização\n\nDepois configure o navegador:\n4. Permita acesso à localização para este navegador\n5. Recarregue esta página');
          }
        }
      } catch (error) {
        alert('Não foi possível abrir as configurações automaticamente. Procure por "Localização" ou "Privacidade" nas configurações do seu dispositivo.');
      }
    } else {
      // Desktop browsers
      const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent);
      const isEdge = /Edg/.test(userAgent);
      const isFirefox = /Firefox/.test(userAgent);
      const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);

      try {
        if (isChrome) {
          // Chrome desktop - show instructions since chrome:// URLs can't be opened programmatically
          alert(`IMPORTANTE: Primeiro ative a localização no seu dispositivo!

📱 No celular/tablet:
1. Abra "Configurações" do dispositivo
2. Procure por "Localização" ou "GPS"
3. Ative a localização

💻 No computador:
1. Clique no ícone de localização na barra de tarefas (canto inferior direito)
2. Ative a localização

Depois, configure no Chrome:
1. Clique nos 3 pontos (⋮) no canto superior direito
2. Clique em "Configurações"
3. Procure por "Privacidade e segurança" no menu esquerdo
4. Clique em "Configurações do site"
5. Role para baixo e clique em "Localização"
6. Certifique-se de que está ativado
7. Recarregue esta página e tente novamente`);
        } else if (isEdge) {
          // Edge desktop - show instructions since edge:// URLs can't be opened programmatically
          alert(`IMPORTANTE: Primeiro ative a localização no seu dispositivo!

📱 No celular/tablet:
1. Abra "Configurações" do dispositivo
2. Procure por "Localização" ou "GPS"
3. Ative a localização

💻 No computador:
1. Clique no ícone de localização na barra de tarefas (canto inferior direito)
2. Ative a localização

Depois, configure no Edge:
1. Clique nos 3 pontos (⋯) no canto superior direito
2. Clique em "Configurações"
3. Procure por "Cookies e permissões do site" no menu esquerdo
4. Clique em "Localização"
5. Certifique-se de que está ativado
6. Recarregue esta página e tente novamente`);
        } else if (isFirefox) {
          // Firefox desktop - show instructions
          alert(`IMPORTANTE: Primeiro ative a localização no seu dispositivo!

📱 No celular/tablet:
1. Abra "Configurações" do dispositivo
2. Procure por "Localização" ou "GPS"
3. Ative a localização

💻 No computador:
1. Clique no ícone de localização na barra de tarefas (canto inferior direito)
2. Ative a localização

Depois, configure no Firefox:
1. Clique no menu (☰) no canto superior direito
2. Clique em "Configurações"
3. Procure por "Privacidade e Segurança" no menu esquerdo
4. Role para baixo até "Permissões"
5. Clique em "Configurações" ao lado de "Acesso à localização"
6. Certifique-se de que está ativado para este site
7. Recarregue esta página e tente novamente`);
        } else if (isSafari && isMac) {
          // Safari on macOS - show instructions
          alert('Para ativar localização no Safari:\n\n1. Clique em Safari > Preferências\n2. Clique na aba "Privacidade"\n3. Marque "Solicitar permissão para usar a localização"');
        } else {
        // Fallback for other browsers
        window.open('about:blank', '_blank');
        alert(`IMPORTANTE: Primeiro ative a localização no seu dispositivo!

📱 No celular/tablet:
• Abra "Configurações" do dispositivo
• Procure por "Localização" ou "GPS"
• Ative a localização

💻 No computador:
• Clique no ícone de localização na barra de tarefas
• Ative a localização

Depois configure no navegador:
• Chrome/Edge: "Configurações > Privacidade > Localização"
• Firefox: "Configurações > Privacidade > Acesso à localização"
• Safari: "Preferências > Privacidade > Localização"

Recarregue esta página após ativar.`);
        }
      } catch (error) {
        alert('Não foi possível abrir as configurações automaticamente. Procure por "Localização" ou "Privacidade" nas configurações do seu navegador.');
      }
    }
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return ''; // Return empty string for invalid dates
      }
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      // Less than 1 hour: show time only
      if (diffInHours < 1) {
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      }
      // Less than 24 hours: show time only
      if (diffInHours < 24) {
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      }
      // Less than 48 hours: show "Ontem" + time
      if (diffInHours < 48) {
        return `Ontem ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      }
      // More than 48 hours: show date + time
      return `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } catch (e) {
      return ''; // Return empty string on error
    }
  };

  // Filtered data
  const filteredBuddies = buddies.filter(buddy =>
    buddy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    buddy.username.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <>
      <style>{scrollbarStyles}</style>
      <div
        className="h-screen max-h-screen flex flex-col md:flex-row bg-light-bg dark:bg-dark-bg overflow-hidden"
        style={{
          height: 'calc(100dvh - 80px)', // Use dynamic viewport height for better mobile support
          minHeight: 'calc(100vh - 80px)' // Fallback for browsers that don't support dvh
        }}
      >
        {/* Initial Loading Overlay */}
      {isInitializing && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 text-center mx-4">
            <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-primary mx-auto mb-3 md:mb-4"></div>
            <p className="text-sm md:text-base text-gray-900 dark:text-white">Carregando chat...</p>
          </div>
        </div>
      )}

      {/* Mobile Navigation Bar - Only visible on mobile */}
      <div className="md:hidden bg-light-card dark:bg-dark-card border-b border-light-border dark:border-dark-border p-2 flex justify-around items-center">
        <button
          onClick={() => setMobileView('left')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
            mobileView === 'left'
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
          }`}
        >
          👥 Buddies
        </button>
        <button
          onClick={() => setMobileView('center')}
          className={`flex-1 py-2 px-3 mx-1 rounded-lg text-xs font-semibold transition-colors ${
            mobileView === 'center'
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
          }`}
        >
          🎯 Radar
        </button>
        <button
          onClick={() => setMobileView('right')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
            mobileView === 'right'
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
          }`}
        >
          🚀 Salas
        </button>
      </div>

      {/* Left Panel - Buddies */}
      <div className={`
        ${mobileView === 'left' ? 'flex' : 'hidden'} md:flex
        relative transition-all duration-300 
        ${isLeftSidebarCollapsed ? 'md:w-16' : 'md:w-64 lg:w-80'} 
        w-full md:max-w-sm
        bg-light-card dark:bg-dark-card 
        md:border-r border-light-border dark:border-dark-border 
        flex-col
      `}>
        {/* Collapse Button - Hidden on mobile */}
        <button
          onClick={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
          className="hidden md:block absolute top-5 -right-4 z-10 bg-light-card dark:bg-dark-card p-1.5 rounded-full shadow-lg border border-light-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={isLeftSidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          <ChevronLeftIcon className={`h-5 w-5 transition-transform duration-300 ${isLeftSidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>

        {/* Collapsed View - Ícone de participantes no topo e avatares abaixo */}
        {isLeftSidebarCollapsed && (
          <div className="flex flex-col h-full">
            {/* Ícone de participantes online no topo (quando em sala) */}
            {selectedRoom && (
              <div className="flex flex-col items-center p-3 border-b border-light-border dark:border-dark-border">
                <button
                  onClick={() => setIsLeftSidebarCollapsed(false)}
                  className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title={`${participantsCount} Participantes Online`}
                >
                  <span className="text-lg md:text-xl">👥</span>
                  {participantsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {participantsCount > 9 ? '9+' : participantsCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Lista de avatares dos participantes (quando em sala) */}
            {selectedRoom && (
              <div className="flex-1 overflow-y-auto p-2 space-y-3">
                {roomParticipants.map((participant) => (
                  <div 
                    key={participant.id}
                    className="flex flex-col items-center"
                    title={participant.name}
                  >
                    <Avatar
                      src={participant.avatarUrl || ''}
                      alt={participant.name}
                      size="sm"
                      userId={participant.id}
                      showStatus={true}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Participants List (when in room) or Buddies List */}
        {!isLeftSidebarCollapsed && (
          <div className="flex-1 overflow-y-auto">
          {selectedRoom ? (
            // Show room participants
            <>
              <div className="p-3 md:p-4 border-b border-light-border dark:border-dark-border bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 border-r border-light-border dark:border-dark-border pr-3 md:pr-4">
                    <h3 className="font-semibold text-xs md:text-sm text-gray-900 dark:text-white">
                      👥 Participantes Online ({participantsCount})
                    </h3>
                  </div>
                  {/* Botão Radar removido no mobile */}
                  <div className="hidden md:flex flex-shrink-0">
                    <button
                      onClick={() => handleViewToggle('radar')}
                      className={`px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors ${currentView === 'radar'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                      🎯 <span className="hidden sm:inline">Radar</span>
                    </button>
                  </div>
                </div>
              </div>
              {roomParticipants.length === 0 ? (
                <div className="p-4 md:p-6 text-center text-gray-500 dark:text-gray-400">
                  <p className="text-xs md:text-sm">Nenhum participante na sala</p>
                </div>
              ) : (
                <div className="divide-y divide-light-border dark:divide-dark-border">
                  {roomParticipants.map((participant) => (
                    <div key={participant.id} className="p-3 md:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center gap-2 md:gap-3">
                        <Avatar
                          src={participant.avatarUrl || ''}
                          alt={participant.name}
                          size="sm"
                          userId={participant.id}
                          showStatus={true}
                          className="md:w-10 md:h-10"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <h3 className="font-semibold text-xs md:text-sm text-gray-900 dark:text-white truncate">
                              {participant.name}
                            </h3>
                            {(participant.plan === 'pro' || participant.plan === 'premium') &&
                              <VerifiedBadgeIcon plan={participant.plan} className="h-2.5 w-2.5 md:h-3 md:w-3 flex-shrink-0" />
                            }
                            {participant.role && ['admin', 'moderator'].includes(participant.role) &&
                              <ModeratorBadgeIcon className="h-2.5 w-2.5 md:h-3 md:w-3 flex-shrink-0" />
                            }
                          </div>
                          <p className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400 truncate">
                            @{participant.username}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Show buddies list
            <>
              {loadingBuddies ? (
                <LoadingSpinner />
              ) : buddiesError ? (
                <div className="p-6 text-center text-red-500 dark:text-red-400">
                  <p className="text-sm">{buddiesError}</p>
                  <button
                    onClick={loadBuddies}
                    className="mt-2 text-primary hover:text-primary/80 text-sm underline"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : filteredBuddies.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  <p>Nenhum buddy encontrado</p>
                </div>
              ) : (
                filteredBuddies.map((buddy) => (
              <div
                key={buddy.id}
                onClick={() => handleSelectBuddy(buddy)}
                className={`flex items-center gap-2 md:gap-3 p-3 md:p-4 cursor-pointer border-b border-light-border dark:border-dark-border transition-colors ${selectedBuddy?.id === buddy.id
                  ? 'bg-primary/10 border-l-4 border-l-primary'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
              >
                <Avatar
                  src={buddy.avatarUrl || ''}
                  alt={buddy.name}
                  size="sm"
                  userId={buddy.id}
                  showStatus={true}
                  className="md:w-10 md:h-10"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5 md:mb-1">
                    <div className="flex items-center gap-1">
                      <h3 className="font-semibold text-xs md:text-sm text-gray-900 dark:text-white truncate">
                        {buddy.name}
                      </h3>
                      {(buddy.plan === 'pro' || buddy.plan === 'premium') &&
                        <VerifiedBadgeIcon plan={buddy.plan} className="h-2.5 w-2.5 md:h-3 md:w-3 flex-shrink-0" />
                      }
                      {buddy.role && ['admin', 'moderator'].includes(buddy.role) &&
                        <ModeratorBadgeIcon className="h-2.5 w-2.5 md:h-3 md:w-3 flex-shrink-0" />
                      }
                    </div>
                    {buddy.unreadCount > 0 && (
                      <span className="bg-primary text-white text-[10px] md:text-xs rounded-full px-1.5 md:px-2 py-0.5 md:py-1 min-w-[18px] md:min-w-[20px] text-center">
                        {buddy.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400 truncate">
                    {buddy.lastMessage || 'Sem mensagens'}
                  </p>
                  <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-500">
                    {formatTimestamp(buddy.lastActivity)}
                  </p>
                </div>
              </div>
            ))
              )}
            </>
          )}
          </div>
        )}
      </div>

      {/* Middle Panel - Chat/Radar */}
      <div className={`
        ${mobileView === 'center' ? 'flex' : 'hidden'} md:flex
        flex-1 flex-col min-w-0
      `}>

        {/* Radar Header - Exibido apenas quando radar está ativo */}
        {currentView === 'radar' && (
          <div className="p-3 md:p-4 border-b border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
            <div className="text-center">
              <h3 className="font-orbitron text-base md:text-xl font-bold text-blue-500 mb-2">
                🎯 Radar Discovery
              </h3>
              <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600'}`}>
                Scanning for people nearby with similar interests...
                <br />
                <span className="text-[10px] md:text-xs opacity-75 mt-1 block">
                  {buddies.length} users found in your area{' '}
                  <button
                    onClick={() => setShowLocationModal(true)}
                    className="text-blue-500 hover:text-blue-600 underline text-[10px] md:text-xs"
                  >
                    Saiba mais
                  </button>
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Radar View */}
        {currentView === 'radar' && (
          <RadarView
            users={buddies}
            onUserClick={handleRadarUserClick}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Room View */}
        {currentView === 'room' && selectedRoom && (
          <div className="flex flex-col h-full min-h-0" style={{ height: '100%' }}>
            {/* Room Header */}
            <div className="p-3 md:p-4 border-b border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card flex items-center justify-between gap-2 flex-shrink-0">
              <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm md:text-base flex-shrink-0">
                  {selectedRoom.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <h3 className="font-bold text-xs md:text-sm text-gray-900 dark:text-white truncate">
                      {selectedRoom.name}
                    </h3>
                    {isRoomHot(selectedRoom.id, roomsMessageCountsLastHour) && <FireIcon className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />}
                    {isRoomNew(selectedRoom.created_at) && <NewIcon className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />}
                  </div>
                  <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 truncate">
                    {selectedRoom.description || 'Sala de bate-papo'}
                  </p>
                </div>
              </div>

              {/* User Activity Status and Options Menu */}
              <div className="flex items-center gap-3 md:gap-4">
                {/* Status Badge */}
                <div className={`flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs font-medium flex-shrink-0 ${
                  userActivityStatus === 'online' 
                    ? 'text-green-600 dark:text-green-400'
                    : userActivityStatus === 'away'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
                    userActivityStatus === 'online' 
                      ? 'bg-green-500'
                      : userActivityStatus === 'away'
                      ? 'bg-yellow-500'
                      : 'bg-gray-500'
                  }`} />
                  <span className="inline">
                    {userActivityStatus === 'online' ? 'Conectado' : userActivityStatus === 'away' ? 'Ausente' : 'Offline'}
                  </span>
                </div>

                {/* Options Menu */}
                <div className="relative" ref={chatOptionsMenuRef}>
                  <button
                    onClick={() => setShowChatOptionsMenu(!showChatOptionsMenu)}
                    className="flex flex-col items-center justify-center gap-0.5 w-5 h-5 md:w-6 md:h-6 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Opções"
                  >
                    <div className="w-1 h-1 rounded-full bg-gray-600 dark:bg-gray-400"></div>
                    <div className="w-1 h-1 rounded-full bg-gray-600 dark:bg-gray-400"></div>
                    <div className="w-1 h-1 rounded-full bg-gray-600 dark:bg-gray-400"></div>
                  </button>

                  {/* Dropdown Menu */}
                  {showChatOptionsMenu && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-light-border dark:border-dark-border rounded-lg shadow-lg z-50">
                      <button
                        onClick={handleClearConversations}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <span>🗑️</span>
                        <span>Limpar conversas</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto mobile-scroll chat-messages-scroll p-3 md:p-4 space-y-3 md:space-y-4 bg-gray-50 dark:bg-gray-900/30 min-h-0"
              style={{
                touchAction: 'pan-y',
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                // Altura dinâmica calculada para mobile
                height: containerHeight,
                minHeight: '200px',
                maxHeight: containerHeight,
                // Melhorar performance do scroll
                willChange: 'scroll-position',
                // Garantir que o elemento possa receber eventos de toque
                position: 'relative',
                // FORÇAR scroll instantâneo sem animação
                scrollBehavior: 'auto'
              }}
            >
              {loadingMessages ? (
                <LoadingSpinner />
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-6 md:py-8">
                  <p className="text-xs md:text-sm">Nenhuma mensagem ainda</p>
                  <p className="text-[10px] md:text-xs mt-1">Seja o primeiro a escrever!</p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isSentByMe = message.sender_id === session?.user?.id;
                  const isTemp = message.id.startsWith('temp_');
                  
                  // Check if we should show date separator
                  const prevMessage = index > 0 ? messages[index - 1] : null;
                  const showDateSeparator = !prevMessage || 
                    new Date(message.created_at).toDateString() !== new Date(prevMessage.created_at).toDateString();

                  // Improved sender name logic with fallbacks
                  let senderName = 'Usuário';
                  if (isSentByMe) {
                    senderName = user.full_name || user.username || 'Eu';
                  } else if (message.sender) {
                    // Prioritize full_name, then username, then fallback
                    senderName = message.sender.full_name || message.sender.username || 'Usuário';
                  } else if (message.sender_id) {
                    // If sender object is missing but we have sender_id, show a placeholder
                    // In a real scenario, we could fetch the profile here, but for now use a generic name
                    senderName = 'Usuário';
                  }

                  return (
                    <div key={message.id}>
                      {/* Date separator */}
                      {showDateSeparator && (
                        <div className="flex items-center justify-center my-3 md:my-4">
                          <div className="bg-gray-200 dark:bg-gray-700 px-2 md:px-3 py-0.5 md:py-1 rounded-full">
                            <span className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400">
                              {new Date(message.created_at).toLocaleDateString('pt-BR', { 
                                weekday: 'long', 
                                day: 'numeric', 
                                month: 'long',
                                year: new Date(message.created_at).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                              })}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'} mb-1`}>
                        <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-3 md:px-4 py-2 ${isSentByMe
                          ? 'bg-primary text-white rounded-br-none'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none border border-light-border dark:border-dark-border'
                          } ${isTemp ? 'opacity-60' : ''}`}>
                          {/* Show sender name above message for messages from others */}
                          {!isSentByMe && (
                            <p className="text-[10px] md:text-xs font-semibold mb-0.5 md:mb-1 text-gray-600 dark:text-gray-300">
                              {senderName}
                            </p>
                          )}
                          <p className="break-words text-xs md:text-sm">{message.content}</p>
                          <p
                            className={`text-[10px] md:text-xs mt-0.5 md:mt-1 ${isSentByMe ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                              }`}
                          >
                            {isTemp ? 'Enviando...' : formatTimestamp(message.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-3 md:p-4 border-t border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card flex-shrink-0">
              {!isOnline && (
                <div className="mb-2 md:mb-3 p-1.5 md:p-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg text-[10px] md:text-xs text-center">
                  ⚠️ Você está offline. As mensagens serão enviadas quando a conexão for restaurada.
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 md:gap-3">
                <input
                  ref={messageInputRef}
                  type="text"
                  placeholder={isOnline ? "Digite uma mensagem..." : "Offline - conexão necessária"}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={isSending || !isOnline}
                  className="flex-1 bg-white dark:bg-gray-700 border border-light-border dark:border-dark-border rounded-full py-2 md:py-3 px-3 md:px-5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || isSending || !isOnline}
                  className="bg-primary hover:bg-primary/90 p-2 md:p-3 rounded-full text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {isSending ? (
                    <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-white"></div>
                  ) : (
                    <SendIcon />
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* Right Panel - Accordion */}
      <div className={`
        ${mobileView === 'right' ? 'flex' : 'hidden'} md:flex
        relative transition-all duration-300 
        ${isRightSidebarCollapsed ? 'md:w-16' : 'md:w-64 lg:w-80'} 
        w-full md:max-w-sm
        bg-light-card dark:bg-dark-card 
        md:border-l border-light-border dark:border-dark-border 
        flex-col h-full max-h-full overflow-hidden
      `}>
        {/* Collapse Button - Hidden on mobile */}
        <button
          onClick={() => setIsRightSidebarCollapsed(!isRightSidebarCollapsed)}
          className="hidden md:block absolute top-5 -left-4 z-10 bg-light-card dark:bg-dark-card p-1.5 rounded-full shadow-lg border border-light-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={isRightSidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          <ChevronRightIcon className={`h-5 w-5 transition-transform duration-300 ${isRightSidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>

        {/* Floating Icons - Only visible when rightbar is collapsed */}
        {isRightSidebarCollapsed && (
          <div className="hidden md:flex flex-col items-center gap-3 p-3 pt-20">
            {/* Rooms Icon */}
            <button
              onClick={() => {
                setIsRightSidebarCollapsed(false);
                setTimeout(() => handleAccordionToggle('rooms'), 300);
              }}
              className="relative w-12 h-12 bg-light-card dark:bg-dark-card rounded-lg shadow-lg border border-light-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center group"
              title="Abrir salas de chat"
            >
              <span className="text-xl">🚀</span>
              {joinedRoomIds.size > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                  {joinedRoomIds.size > 9 ? '9+' : joinedRoomIds.size}
                </span>
              )}
              {/* Tooltip */}
              <div className="absolute right-full mr-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                Salas de Chat
                <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900 dark:border-l-gray-700"></div>
              </div>
            </button>
          </div>
        )}


        {/* Accordion: Chat Rooms */}
        {!isRightSidebarCollapsed && (
        <div className={`border-b border-light-border dark:border-dark-border ${activeAccordion === 'rooms' ? 'order-1 flex-1 flex flex-col min-h-0 overflow-hidden' : 'order-2 flex-shrink-0'}`}>
          <button
            onClick={() => handleAccordionToggle('rooms')}
            className={`w-full p-4 flex items-center justify-between text-left transition-colors flex-shrink-0 ${activeAccordion === 'rooms'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold">🚀 SALAS DE CHAT</span>
              {joinedRoomIds.size > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-green-500 text-white text-xs font-bold">
                  {joinedRoomIds.size}
                </span>
              )}
            </div>
            <ChevronDownIcon className={`transition-transform ${activeAccordion === 'rooms' ? 'rotate-180' : ''}`} />
          </button>

          {activeAccordion === 'rooms' && (
            <div className="p-4 space-y-3 flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setRoomFormData({ name: '', description: '', category: 'normal', is_public: true, max_participants: 100 });
                    setShowCreateRoomModal(true);
                  }}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                >
                  Criar Nova Sala
                </button>
                <select
                  value={roomCategoryFilter}
                  onChange={(e) => {
                    setRoomCategoryFilter(e.target.value);
                  }}
                  className="bg-white dark:bg-gray-700 border border-light-border dark:border-dark-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary flex-shrink-0"
                  title="Filtrar por categoria"
                >
                  <option value="">Todas</option>
                  <option value="normal">Normal</option>
                  <option value="hot">Hot</option>
                  <option value="new">Nova</option>
                </select>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 thin-scrollbar min-h-0 max-h-full">
                {loadingRooms ? (
                  <LoadingSpinner />
                ) : roomsError ? (
                  <div className="text-center text-red-500 dark:text-red-400 py-4">
                    <p className="text-sm">{roomsError}</p>
                    <button
                      onClick={loadChatRooms}
                      className="mt-2 text-primary hover:text-primary/80 text-sm underline"
                    >
                      Tentar novamente
                    </button>
                  </div>
                ) : chatRooms.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                    <p className="text-sm">Nenhuma sala disponível</p>
                  </div>
                ) : (
                  chatRooms.map((room) => (
                    <div
                      key={room.id}
                      className={`p-2 md:p-3 rounded-lg border-2 transition-all ${
                        selectedRoom?.id === room.id
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600 shadow-lg'
                          : joinedRoomIds.has(room.id)
                          ? 'bg-white dark:bg-gray-800 border-blue-500 dark:border-blue-600 hover:shadow-md'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                        <h4 
                          onClick={() => {
                            if (joinedRoomIds.has(room.id)) {
                              handleSwitchToRoom(room);
                              setMobileView('center'); // Switch to center view on mobile
                            }
                          }}
                            className={`font-semibold text-xs md:text-sm truncate ${
                            joinedRoomIds.has(room.id)
                              ? 'text-primary dark:text-blue-400 cursor-pointer hover:underline'
                              : 'text-gray-900 dark:text-white'
                          }`}
                          title={joinedRoomIds.has(room.id) ? 'Clique para visualizar' : room.name}
                        >
                          {room.name}
                        </h4>

                          {/* Badge de mensagens não lidas - só aparece se contador > 0 */}
                          {joinedRoomIds.has(room.id) && roomUnreadCounts.get(room.id) > 0 && (
                            <span className="bg-red-500 text-white text-[10px] md:text-xs rounded-full px-1.5 md:px-2 py-0.5 min-w-[18px] md:min-w-[20px] text-center font-bold flex-shrink-0">
                              {roomUnreadCounts.get(room.id) > 99 ? '99+' : roomUnreadCounts.get(room.id)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
                          {isRoomHot(room.id, roomsMessageCountsLastHour) && <span title="HOT"><FireIcon className="h-3 w-3 md:h-4 md:w-4" /></span>}
                          {isRoomNew(room.created_at) && <span title="NEW"><NewIcon className="h-3 w-3 md:h-4 md:w-4" /></span>}
                          {canManageRoom(room) && (
                            <div className="flex items-center gap-0.5 md:gap-1 ml-1 md:ml-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditRoomModal(room);
                                }}
                                className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                                title="Editar sala"
                              >
                                <EditIcon className="h-3 w-3 md:h-4 md:w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDeleteRoomModal(room);
                                }}
                                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                title="Excluir sala"
                              >
                                <TrashIcon className="h-3 w-3 md:h-4 md:w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2 truncate">
                        {room.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                          <span className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400 font-medium">
                            {roomsOnlineCount.get(room.id) || 0} online
                          </span>
                          {joinedRoomIds.has(room.id) && (
                            <span className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium">
                              ✓ Participando
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {joinedRoomIds.has(room.id) ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLeaveRoom(room);
                              }}
                              className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded transition-colors bg-red-500 hover:bg-red-600 text-white font-medium"
                            >
                              Sair
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoinRoom(room);
                              }}
                              className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded transition-colors bg-primary hover:bg-primary/90 text-white font-medium"
                            >
                              Entrar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Criar Nova Sala</h3>
              <button
                onClick={() => {
                  setShowCreateRoomModal(false);
                  setRoomFormData({ name: '', description: '', category: 'normal', is_public: true, max_participants: 100 });
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XIcon />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome da Sala *
                </label>
                <input
                  type="text"
                  value={roomFormData.name}
                  onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
                  className="w-full bg-white dark:bg-gray-700 border border-light-border dark:border-dark-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Digite o nome da sala"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <textarea
                  value={roomFormData.description}
                  onChange={(e) => setRoomFormData({ ...roomFormData, description: e.target.value })}
                  className="w-full bg-white dark:bg-gray-700 border border-light-border dark:border-dark-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Digite a descrição da sala"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoria
                </label>
                <select
                  value={roomFormData.category}
                  onChange={(e) => setRoomFormData({ ...roomFormData, category: e.target.value })}
                  className="w-full bg-white dark:bg-gray-700 border border-light-border dark:border-dark-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="normal">Normal</option>
                  <option value="hot">Hot</option>
                  <option value="new">Nova</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Máximo de Participantes
                </label>
                <input
                  type="number"
                  value={roomFormData.max_participants}
                  onChange={(e) => setRoomFormData({ ...roomFormData, max_participants: parseInt(e.target.value) || 100 })}
                  className="w-full bg-white dark:bg-gray-700 border border-light-border dark:border-dark-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  min={1}
                  max={1000}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={roomFormData.is_public}
                  onChange={(e) => setRoomFormData({ ...roomFormData, is_public: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="is_public" className="text-sm text-gray-700 dark:text-gray-300">
                  Sala pública
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateRoom}
                  disabled={isSubmittingRoom || !roomFormData.name.trim()}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingRoom ? 'Criando...' : 'Criar Sala'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateRoomModal(false);
                    setRoomFormData({ name: '', description: '', category: 'normal', is_public: true, max_participants: 100 });
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {showEditRoomModal && roomToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Editar Sala</h3>
              <button
                onClick={() => {
                  setShowEditRoomModal(false);
                  setRoomToEdit(null);
                  setRoomFormData({ name: '', description: '', category: 'normal', is_public: true, max_participants: 100 });
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XIcon />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome da Sala *
                </label>
                <input
                  type="text"
                  value={roomFormData.name}
                  onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
                  className="w-full bg-white dark:bg-gray-700 border border-light-border dark:border-dark-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Digite o nome da sala"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <textarea
                  value={roomFormData.description}
                  onChange={(e) => setRoomFormData({ ...roomFormData, description: e.target.value })}
                  className="w-full bg-white dark:bg-gray-700 border border-light-border dark:border-dark-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Digite a descrição da sala"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoria
                </label>
                <select
                  value={roomFormData.category}
                  onChange={(e) => setRoomFormData({ ...roomFormData, category: e.target.value })}
                  className="w-full bg-white dark:bg-gray-700 border border-light-border dark:border-dark-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="normal">Normal</option>
                  <option value="hot">Hot</option>
                  <option value="new">Nova</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Máximo de Participantes
                </label>
                <input
                  type="number"
                  value={roomFormData.max_participants}
                  onChange={(e) => setRoomFormData({ ...roomFormData, max_participants: parseInt(e.target.value) || 100 })}
                  className="w-full bg-white dark:bg-gray-700 border border-light-border dark:border-dark-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  min={1}
                  max={1000}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit_is_public"
                  checked={roomFormData.is_public}
                  onChange={(e) => setRoomFormData({ ...roomFormData, is_public: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="edit_is_public" className="text-sm text-gray-700 dark:text-gray-300">
                  Sala pública
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleEditRoom}
                  disabled={isSubmittingRoom || !roomFormData.name.trim()}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingRoom ? 'Salvando...' : 'Salvar Alterações'}
                </button>
                <button
                  onClick={() => {
                    setShowEditRoomModal(false);
                    setRoomToEdit(null);
                    setRoomFormData({ name: '', description: '', category: 'normal', is_public: true, max_participants: 100 });
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Room Modal */}
      {showDeleteRoomModal && roomToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Excluir Sala</h3>
              <button
                onClick={() => {
                  setShowDeleteRoomModal(false);
                  setRoomToDelete(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XIcon />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Tem certeza que deseja excluir a sala <strong>{roomToDelete.name}</strong>?
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                Esta ação não pode ser desfeita. Todas as mensagens e participantes serão removidos.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteRoom}
                disabled={isSubmittingRoom}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingRoom ? 'Excluindo...' : 'Excluir Sala'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteRoomModal(false);
                  setRoomToDelete(null);
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Settings Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">🎯 Radar Discovery</h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XIcon />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                O <strong>Radar Discovery</strong> encontra pessoas próximas com interesses similares para você conversar.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Para usar este recurso, precisamos acessar sua localização aproximada para mostrar apenas usuários da sua região.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Privacidade:</strong> Sua localização é usada apenas para melhorar suas conexões no app e nunca é armazenada ou compartilhada.
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Clique no botão abaixo para ativar a localização nas configurações do seu dispositivo.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  openLocationSettings();
                  setShowLocationModal(false);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Ativar Localização
              </button>
              <button
                onClick={() => setShowLocationModal(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Agora Não
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    </>
  );
}
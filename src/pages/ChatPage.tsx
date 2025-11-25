import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { User } from '@/types';
import { Icon } from '@/components/icons/Icon';
import Avatar from '@/components/common/Avatar';
import { VerifiedBadgeIcon } from '@/src/components/icons/VerifiedBadgeIcon';
import { ModeratorBadgeIcon } from '@/src/components/icons/ModeratorBadgeIcon';
import { useToast } from '@/hooks/useToast';
import RadarView from '@/src/components/chat/RadarView';
import {
  fetchChatRooms,
  fetchNewUsers,
  fetchChatBuddies,
  fetchMessages,
  sendMessage,
  joinChatRoom,
  leaveChatRoom,
  isUserInRoom,
  updateRoomActivity,
  getUserJoinedRooms,
  searchUsers,
  createChatRoom,
  updateChatRoom,
  deleteChatRoom,
  fetchRoomMessages,
  sendRoomMessage,
  subscribeToRoomMessages,
  subscribeToRoomParticipants,
  ChatRoom as ChatRoomType,
  ChatMessage as ChatMessageType,
  subscribeToMessages,
  RealtimeChannel
} from '@/src/services/chatService';
import * as api from '@/src/services/api';

// Icons
const SearchIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon className={className}><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></Icon>;
const PlusIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon className={className}><path d="M5 12h14"></path><path d="M12 5v14"></path></Icon>;
const ChevronDownIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon className={className}><path d="m6 9 6 6 6-6"></path></Icon>;
const FireIcon = ({ className = "h-4 w-4 text-orange-500" }: { className?: string }) => <Icon className={className}><path d="M12 2c2.4 2.4 3.6 5.6 3.6 8.4 0 3.6-2.4 6-6 6s-6-2.4-6-6c0-2.8 1.2-6 3.6-8.4z"></path><path d="M12 12c2.4 2.4 3.6 5.6 3.6 8.4 0 3.6-2.4 6-6 6s-6-2.4-6-6c0-2.8 1.2-6 3.6-8.4z"></path></Icon>;
const NewIcon = ({ className = "h-4 w-4 text-green-500" }: { className?: string }) => <Icon className={className}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></Icon>;
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

  // State
  const [selectedBuddy, setSelectedBuddy] = useState<Buddy | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomType | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAccordion, setActiveAccordion] = useState<string>('search');
  const [currentView, setCurrentView] = useState<'radar' | 'chat' | 'room'>('radar');

  // Filters
  const [ageFilter, setAgeFilter] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [interestsFilter, setInterestsFilter] = useState<string>('');

  // Data states
  const [chatRooms, setChatRooms] = useState<ChatRoomType[]>([]);
  const [newUsers, setNewUsers] = useState<any[]>([]);
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [joinedRoomIds, setJoinedRoomIds] = useState<Set<string>>(new Set());
  const [userActivityStatus, setUserActivityStatus] = useState<'online' | 'away' | 'offline'>('online');

  // Loading states
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingNewUsers, setLoadingNewUsers] = useState(true);
  const [loadingBuddies, setLoadingBuddies] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Error states
  const [roomsError, setRoomsError] = useState<string | null>(null);
  const [newUsersError, setNewUsersError] = useState<string | null>(null);
  const [buddiesError, setBuddiesError] = useState<string | null>(null);

  // Real-time subscription
  const [messageSubscription, setMessageSubscription] = useState<RealtimeChannel | null>(null);
  const [participantSubscription, setParticipantSubscription] = useState<RealtimeChannel | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  // Effects
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
          loadNewUsers(),
          loadBuddies()
        ]);
      } catch (error: any) {
        console.error('Error loading initial data:', error);
        addToast('Erro ao carregar dados iniciais', 'error');
      } finally {
        setIsInitializing(false);
      }
    };

    loadInitialData();
  }, []);

  // Subscribe to messages when conversation is selected
  useEffect(() => {
    if (selectedBuddy && session?.user?.id) {
      subscribeToConversationMessages(selectedBuddy.id);
    }

    return () => {
      if (messageSubscription) {
        messageSubscription.unsubscribe();
        setMessageSubscription(null);
      }
    };
  }, [selectedBuddy, session?.user?.id]);

  // Subscribe to room messages when room is selected
  useEffect(() => {
    if (selectedRoom && session?.user?.id) {
      subscribeToRoomMessagesHandler(selectedRoom.id);
      
      // Subscribe to participant changes for real-time count updates
      const participantSub = subscribeToRoomParticipants(selectedRoom.id, () => {
        // Reload chat rooms to get updated counts
        loadChatRooms();
        
        // Update the selected room data
        fetchChatRooms().then(({ data }) => {
          if (data) {
            const updatedRoom = data.find(r => r.id === selectedRoom.id);
            if (updatedRoom) {
              setSelectedRoom(updatedRoom);
            }
          }
        });
      });
      setParticipantSubscription(participantSub);
    }

    return () => {
      if (messageSubscription) {
        messageSubscription.unsubscribe();
        setMessageSubscription(null);
      }
      if (participantSubscription) {
        participantSubscription.unsubscribe();
        setParticipantSubscription(null);
      }
    };
  }, [selectedRoom?.id, session?.user?.id]);

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
    const now = Date.now();
    lastActivityTimeRef.current = now;
    setUserActivityStatus('online');

    const currentRoomId = selectedRoom.id;

    // Start checking activity immediately
    activityIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivityTimeRef.current;
      
      // Update activity in database every 30 seconds if user is active
      if (timeSinceActivity < 30000) {
        updateRoomActivity(currentRoomId).catch(console.error);
      }

      // Update status based on inactivity
      if (timeSinceActivity < 180000) { // Less than 3 minutes
        setUserActivityStatus('online');
      } else if (timeSinceActivity < 300000) { // Between 3 and 5 minutes
        setUserActivityStatus('away');
      } else {
        // More than 5 minutes - remove from room
        setUserActivityStatus('offline');
        if (activityIntervalRef.current) {
          clearInterval(activityIntervalRef.current);
          activityIntervalRef.current = null;
        }
        // Leave room by calling leaveChatRoom directly
        leaveChatRoom(currentRoomId).then(() => {
          setJoinedRoomIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(currentRoomId);
            return newSet;
          });
          setSelectedRoom(null);
          setCurrentView('radar');
          setMessages([]);
          if (messageSubscription) {
            messageSubscription.unsubscribe();
            setMessageSubscription(null);
          }
          addToast('Você foi desconectado por inatividade', 'info');
          loadChatRooms();
        }).catch(console.error);
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
        updateRoomActivity(currentRoomId).catch(console.error);
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

  // Cleanup on page unload (but not on refresh)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Mark that page is unloading (not just refreshing)
      // Browser will handle this - we just set a flag
      isPageUnloadingRef.current = true;
    };

    const handleVisibilityChange = () => {
      // When page becomes hidden (user navigates away), leave all rooms
      if (document.hidden && !isPageUnloadingRef.current) {
        // Get current joined rooms from the ref to avoid dependency
        const currentJoinedRooms = Array.from(joinedRoomIds);
        currentJoinedRooms.forEach(roomId => {
          leaveChatRoom(roomId).catch(console.error);
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Cleanup on component unmount - leave all joined rooms only if not refreshing
      if (!isPageUnloadingRef.current && joinedRoomIds.size > 0) {
        const currentJoinedRooms = Array.from(joinedRoomIds);
        currentJoinedRooms.forEach(roomId => {
          leaveChatRoom(roomId).catch(console.error);
        });
      }
    };
  }, [joinedRoomIds]); // Only depend on joinedRoomIds

  // Load chat rooms
  const loadChatRooms = async () => {
    try {
      setLoadingRooms(true);
      setRoomsError(null);

      const { data, error } = await fetchChatRooms();

      if (error) {
        const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao carregar salas de chat';
        setRoomsError(errorMessage);
        addToast('Erro ao carregar salas de chat', 'error');
      } else {
        setChatRooms(data || []);
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao carregar salas de chat';
      setRoomsError(errorMessage);
      addToast('Erro ao carregar salas de chat', 'error');
    } finally {
      setLoadingRooms(false);
    }
  };

  // Load new users (suggestions from main app)
  const loadNewUsers = async () => {
    try {
      setLoadingNewUsers(true);
      setNewUsersError(null);
      const { data, error } = await api.fetchUsersToFollow(user.id);

      if (error) {
        setNewUsersError('Erro ao carregar sugestões de usuários');
        return;
      }

      // Transform profiles to User format (same as useUserData.ts)
      if (data && data.length > 0) {
        const suggestedUsers: User[] = data.map((profile: any) => {
          const dateSource = profile.created_at || profile.updated_at;
          const createdAtDate = dateSource ? new Date(dateSource) : new Date();
          
          return {
            id: profile.id,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username,
            username: profile.username,
            avatarUrl: profile.avatar_url || `https://picsum.photos/seed/${profile.id}/100/100`,
            bannerUrl: profile.banner_url || `https://picsum.photos/seed/banner-${profile.id}/1500/500`,
            bio: profile.bio || '',
            joinDate: `Joined ${createdAtDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
            createdAt: dateSource,
            followingCount: profile.following_count || 0,
            followersCount: profile.followers_count || 0,
            plan: profile.plan || 'free',
            role: profile.role || 'user',
          };
        });
        setNewUsers(suggestedUsers);
      } else {
        setNewUsers([]);
      }
    } catch (error) {
      console.error('Error loading user suggestions:', error);
      setNewUsersError('Erro ao carregar sugestões de usuários');
    } finally {
      setLoadingNewUsers(false);
    }
  };

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
      console.error('Error loading buddies:', error);
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
        console.error('Error loading messages:', error);
        addToast('Erro ao carregar mensagens', 'error');
      } else {
        setMessages(data || []);
      }

      // Subscribe to new messages
      const subscription = subscribeToMessages(conversationId, (newMessage) => {
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
      console.error('Error in subscribeToConversationMessages:', error);
      addToast('Erro ao carregar mensagens', 'error');
    } finally {
      setLoadingMessages(false);
    }
  };

  // Handlers
  const handleAccordionToggle = (accordion: string) => {
    setActiveAccordion(activeAccordion === accordion ? '' : accordion);
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
          console.error('Error sending room message:', error);
          const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao enviar mensagem';
          addToast(errorMessage, 'error');
          return;
        }

        // Update activity when sending message
        const now = Date.now();
        lastActivityTimeRef.current = now;
        setUserActivityStatus('online');
        await updateRoomActivity(selectedRoom.id);

        // Don't add message manually here - let the realtime subscription handle it
        // This prevents duplicate messages
        setMessageText('');
      } catch (error: any) {
        console.error('Error in handleSendMessage (room):', error);
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
        console.error('Error sending message:', error);
        const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao enviar mensagem';
        addToast(errorMessage, 'error');
        return;
      }

      if (messageData) {
        setMessages(prev => [...prev, messageData]);
      }

      // Update buddy's last activity
      setBuddies(prev => prev.map(buddy =>
        buddy.id === selectedBuddy.id
          ? { ...buddy, lastMessage: messageText, lastActivity: new Date().toISOString() }
          : buddy
      ));

      setMessageText('');

    } catch (error: any) {
      console.error('Error in handleSendMessage:', error);
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
      setCurrentView('chat');
    }
  };

  const handleViewToggle = (view: 'radar' | 'chat') => {
    setCurrentView(view);
  };

  const handleAddBuddy = (newUser: User) => {
    const newBuddy: Buddy = {
      id: newUser.id,
      name: newUser.name || newUser.username,
      username: newUser.username,
      avatarUrl: newUser.avatarUrl,
      lastActivity: new Date().toISOString(),
      isOnline: true,
      unreadCount: 0,
      plan: newUser.plan,
      role: newUser.role,
    };

    setBuddies(prev => [newBuddy, ...prev]);
    setNewUsers(prev => prev.filter(user => user.id !== newUser.id));
    addToast(`${newUser.name || newUser.username} adicionado aos buddies!`, 'success');
  };

  const handleSelectBuddy = (buddy: Buddy) => {
    setSelectedBuddy(buddy);
    setSelectedRoom(null);
    setCurrentView('chat');
    // Clear unread count
    setBuddies(prev => prev.map(b =>
      b.id === buddy.id ? { ...b, unreadCount: 0 } : b
    ));
  };

  const handleSearch = async () => {
    try {
      const filters = {
        age: ageFilter ? { min: 18, max: 99 } : undefined,
        gender: genderFilter || undefined,
        location: locationFilter || undefined,
        interests: interestsFilter ? [interestsFilter] : undefined
      };

      const { data, error } = await searchUsers(searchQuery, filters);

      if (error) {
        console.error('Error in search:', error);
        const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro na pesquisa';
        addToast(errorMessage, 'error');
      } else {
        setNewUsers(data || []);
        addToast(`Encontrados ${(data || []).length} resultados`, 'success');
      }
    } catch (error: any) {
      console.error('Error in handleSearch:', error);
      const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro na pesquisa';
      addToast(errorMessage, 'error');
    }
  };

  const handleJoinRoom = async (room: ChatRoomType) => {
    try {
      // Check if user is already in the room
      const isInRoom = joinedRoomIds.has(room.id);
      
      if (isInRoom) {
        // User is already in room, so leave it
        await handleLeaveRoom(room);
        return;
      }

      const { data, error } = await joinChatRoom(room.id);

      if (error) {
        console.error('Error joining room:', error);
        const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao entrar na sala';
        addToast(errorMessage, 'error');
      } else {
        addToast(`Entrou na sala ${room.name}`, 'success');
        setJoinedRoomIds(prev => new Set([...prev, room.id]));
        setSelectedRoom(room);
        setSelectedBuddy(null);
        setCurrentView('room');
        const now = Date.now();
        lastActivityTimeRef.current = now;
        setUserActivityStatus('online');
        loadChatRooms(); // Reload rooms to update participant count
      }
    } catch (error: any) {
      console.error('Error in handleJoinRoom:', error);
      const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao entrar na sala';
      addToast(errorMessage, 'error');
    }
  };

  const handleLeaveRoom = async (room: ChatRoomType) => {
    try {
      const { data, error } = await leaveChatRoom(room.id);

      if (error) {
        console.error('Error leaving room:', error);
        const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao sair da sala';
        addToast(errorMessage, 'error');
      } else {
        addToast(`Saiu da sala ${room.name}`, 'success');
        setJoinedRoomIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(room.id);
          return newSet;
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
        
        loadChatRooms(); // Reload rooms to update participant count
      }
    } catch (error: any) {
      console.error('Error in handleLeaveRoom:', error);
      const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao sair da sala';
      addToast(errorMessage, 'error');
    }
  };

  // Subscribe to room messages
  const subscribeToRoomMessagesHandler = async (roomId: string) => {
    if (!roomId) return;

    try {
      // Load existing messages first
      setLoadingMessages(true);
      const { data, error } = await fetchRoomMessages(roomId);

      if (error) {
        console.error('Error loading room messages:', error);
        addToast('Erro ao carregar mensagens da sala', 'error');
      } else {
        setMessages(data || []);
      }

      // Subscribe to new messages
      const subscription = subscribeToRoomMessages(roomId, (newMessage) => {
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
      console.error('Error in subscribeToRoomMessagesHandler:', error);
      addToast('Erro ao carregar mensagens da sala', 'error');
    } finally {
      setLoadingMessages(false);
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
        const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao criar sala';
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
        loadChatRooms();
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

  const filteredNewUsers = newUsers.filter(user => {
    if (ageFilter && user.age !== parseInt(ageFilter)) return false;
    if (locationFilter && !user.location?.toLowerCase().includes(locationFilter.toLowerCase())) return false;
    if (interestsFilter && !user.interests?.some((interest: string) =>
      interest.toLowerCase().includes(interestsFilter.toLowerCase())
    )) return false;
    return true;
  });

  return (
    <div className="h-screen flex bg-light-bg dark:bg-dark-bg">
      {/* Initial Loading Overlay */}
      {isInitializing && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-900 dark:text-white">Carregando chat...</p>
          </div>
        </div>
      )}

      {/* Left Panel - Buddies */}
      <div className="w-80 bg-light-card dark:bg-dark-card border-r border-light-border dark:border-dark-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-light-border dark:border-dark-border">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Buddies</h2>
          <div className="relative mt-3">
            <input
              type="text"
              placeholder="Buscar buddies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-gray-700 border border-light-border dark:border-dark-border rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <SearchIcon />
            </div>
          </div>
        </div>

        {/* Buddies List */}
        <div className="flex-1 overflow-y-auto">
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
                className={`flex items-center gap-3 p-4 cursor-pointer border-b border-light-border dark:border-dark-border transition-colors ${selectedBuddy?.id === buddy.id
                  ? 'bg-primary/10 border-l-4 border-l-primary'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
              >
                <Avatar
                  src={buddy.avatarUrl || ''}
                  alt={buddy.name}
                  size="md"
                  userId={buddy.id}
                  showStatus={true}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {buddy.name}
                      </h3>
                      {(buddy.plan === 'pro' || buddy.plan === 'premium') &&
                        <VerifiedBadgeIcon plan={buddy.plan} className="h-3 w-3 flex-shrink-0" />
                      }
                      {buddy.role && ['admin', 'moderator'].includes(buddy.role) &&
                        <ModeratorBadgeIcon className="h-3 w-3 flex-shrink-0" />
                      }
                    </div>
                    {buddy.unreadCount > 0 && (
                      <span className="bg-primary text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {buddy.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {buddy.lastMessage || 'Sem mensagens'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {formatTimestamp(buddy.lastActivity)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Middle Panel - Chat/Radar */}
      <div className="flex-1 flex flex-col">
        {/* View Toggle Header */}
        <div className="p-4 border-b border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">
              {currentView === 'radar' ? 'RADAR VIEW' : 
               currentView === 'room' && selectedRoom ? `Sala: ${selectedRoom.name}` :
               selectedBuddy ? `Chat with ${selectedBuddy.name}` : 'CHAT'}
            </h2>
            <div className="flex gap-2">
              {currentView === 'room' && selectedRoom && (
                <button
                  onClick={() => {
                    setSelectedRoom(null);
                    setCurrentView('radar');
                    setMessages([]);
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  ← Voltar
                </button>
              )}
              <button
                onClick={() => handleViewToggle('radar')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${currentView === 'radar'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                🎯 Radar
              </button>
              <button
                onClick={() => handleViewToggle('chat')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${currentView === 'chat'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                💬 Chat
              </button>
            </div>
          </div>
        </div>

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
          <>
            {/* Room Header */}
            <div className="p-4 border-b border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  {selectedRoom.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                      {selectedRoom.name}
                    </h3>
                    {selectedRoom.is_hot && <FireIcon className="h-4 w-4" />}
                    {selectedRoom.is_new && <NewIcon className="h-4 w-4" />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {selectedRoom.description || 'Sala de bate-papo'}
                  </p>
                </div>
              </div>

              {/* User Activity Status */}
              <div className={`flex items-center gap-1 text-xs font-medium ${
                userActivityStatus === 'online' 
                  ? 'text-green-600 dark:text-green-400'
                  : userActivityStatus === 'away'
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  userActivityStatus === 'online' 
                    ? 'bg-green-500'
                    : userActivityStatus === 'away'
                    ? 'bg-yellow-500'
                    : 'bg-gray-500'
                }`} />
                {userActivityStatus === 'online' ? 'Conectado' : userActivityStatus === 'away' ? 'Ausente' : 'Offline'}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/30">
              {loadingMessages ? (
                <LoadingSpinner />
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <p className="text-sm">Nenhuma mensagem ainda</p>
                  <p className="text-xs mt-1">Seja o primeiro a escrever!</p>
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
                    senderName = message.sender.full_name || message.sender.username || 'Usuário';
                  }

                  return (
                    <div key={message.id}>
                      {/* Date separator */}
                      {showDateSeparator && (
                        <div className="flex items-center justify-center my-4">
                          <div className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                            <span className="text-xs text-gray-600 dark:text-gray-400">
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
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isSentByMe
                          ? 'bg-primary text-white rounded-br-none'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none border border-light-border dark:border-dark-border'
                          } ${isTemp ? 'opacity-60' : ''}`}>
                          {/* Show sender name above message for messages from others */}
                          {!isSentByMe && (
                            <p className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-300">
                              {senderName}
                            </p>
                          )}
                          <p className="break-words text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${isSentByMe ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
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
            <div className="p-4 border-t border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
              {!isOnline && (
                <div className="mb-3 p-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg text-xs text-center">
                  ⚠️ Você está offline. As mensagens serão enviadas quando a conexão for restaurada.
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder={isOnline ? "Digite uma mensagem..." : "Offline - conexão necessária"}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={isSending || !isOnline}
                  className="flex-1 bg-white dark:bg-gray-700 border border-light-border dark:border-dark-border rounded-full py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || isSending || !isOnline}
                  className="bg-primary hover:bg-primary/90 p-3 rounded-full text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {isSending ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <SendIcon />
                  )}
                </button>
              </form>
            </div>
          </>
        )}

        {/* Chat View */}
        {currentView === 'chat' && (
          <>
            {selectedBuddy ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={selectedBuddy.avatarUrl || ''}
                      alt={selectedBuddy.name}
                      size="md"
                      userId={selectedBuddy.id}
                      showStatus={true}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                          {selectedBuddy.name}
                        </h3>
                        {(selectedBuddy.plan === 'pro' || selectedBuddy.plan === 'premium') &&
                          <VerifiedBadgeIcon plan={selectedBuddy.plan} className="h-3 w-3 flex-shrink-0" />
                        }
                        {selectedBuddy.role && ['admin', 'moderator'].includes(selectedBuddy.role) &&
                          <ModeratorBadgeIcon className="h-3 w-3 flex-shrink-0" />
                        }
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        @{selectedBuddy.username}
                      </p>
                      <p className="text-xs text-green-500">
                        {selectedBuddy.isOnline ? 'Online' : `Últ. vez ${formatTimestamp(selectedBuddy.lastActivity)}`}
                      </p>
                    </div>
                  </div>

                  {/* Network Status Indicator */}
                  <div className={`flex items-center gap-1 text-xs ${isOnline ? 'text-green-500' : 'text-red-500'
                    }`}>
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    {isOnline ? 'Conectado' : 'Offline'}
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/30">
                  {loadingMessages ? (
                    <LoadingSpinner />
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      <p className="text-sm">Nenhuma mensagem ainda</p>
                      <p className="text-xs mt-1">Comece a conversa!</p>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const isSentByMe = message.sender_id === session?.user?.id;
                      const isTemp = message.id.startsWith('temp_');
                      
                      // Check if we should show date separator
                      const prevMessage = index > 0 ? messages[index - 1] : null;
                      const showDateSeparator = !prevMessage || 
                        new Date(message.created_at).toDateString() !== new Date(prevMessage.created_at).toDateString();

                      return (
                        <div key={message.id}>
                          {/* Date separator */}
                          {showDateSeparator && (
                            <div className="flex items-center justify-center my-4">
                              <div className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                                <span className="text-xs text-gray-600 dark:text-gray-400">
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
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-2 ${isSentByMe
                                ? 'bg-primary text-white rounded-br-none'
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none border border-light-border dark:border-dark-border'
                                } ${isTemp ? 'opacity-60' : ''}`}
                            >
                              <p className="break-words text-sm">{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${isSentByMe ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
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
                <div className="p-4 border-t border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
                  {!isOnline && (
                    <div className="mb-3 p-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg text-xs text-center">
                      ⚠️ Você está offline. As mensagens serão enviadas quando a conexão for restaurada.
                    </div>
                  )}
                  <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder={isOnline ? "Digite uma mensagem..." : "Offline - conexão necessária"}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      disabled={isSending || !isOnline}
                      className="flex-1 bg-white dark:bg-gray-700 border border-light-border dark:border-dark-border rounded-full py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim() || isSending || !isOnline}
                      className="bg-primary hover:bg-primary/90 p-3 rounded-full text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      {isSending ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      ) : (
                        <SendIcon />
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-center p-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Chat Vigil
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Selecione um buddy para começar a conversar ou explore as salas de chat
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Right Panel - Accordion */}
      <div className="w-80 bg-light-card dark:bg-dark-card border-l border-light-border dark:border-dark-border flex flex-col">
        {/* Accordion: Search */}
        <div className="border-b border-light-border dark:border-dark-border">
          <button
            onClick={() => handleAccordionToggle('search')}
            className={`w-full p-4 flex items-center justify-between text-left transition-colors ${activeAccordion === 'search'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
          >
            <span className="font-semibold">🔍 PESQUISAR</span>
            <ChevronDownIcon className={`transition-transform ${activeAccordion === 'search' ? 'rotate-180' : ''}`} />
          </button>

          {activeAccordion === 'search' && (
            <div className="p-4 space-y-3 bg-white dark:bg-gray-800">
              <select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-light-border dark:border-dark-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Idade</option>
                <option value="18-25">18-25</option>
                <option value="26-35">26-35</option>
                <option value="36-45">36-45</option>
                <option value="46+">46+</option>
              </select>

              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-light-border dark:border-dark-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Gênero</option>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
                <option value="other">Outro</option>
              </select>

              <input
                type="text"
                placeholder="Localização"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-light-border dark:border-dark-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <input
                type="text"
                placeholder="Interesses"
                value={interestsFilter}
                onChange={(e) => setInterestsFilter(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-light-border dark:border-dark-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <button
                onClick={handleSearch}
                className="w-full bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                BUSCAR
              </button>
            </div>
          )}
        </div>

        {/* Accordion: Chat Rooms */}
        <div className="border-b border-light-border dark:border-dark-border">
          <button
            onClick={() => handleAccordionToggle('rooms')}
            className={`w-full p-4 flex items-center justify-between text-left transition-colors ${activeAccordion === 'rooms'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
          >
            <span className="font-semibold">🚀 SALAS DE CHAT</span>
            <ChevronDownIcon className={`transition-transform ${activeAccordion === 'rooms' ? 'rotate-180' : ''}`} />
          </button>

          {activeAccordion === 'rooms' && (
            <div className="p-4 space-y-3">
              <button
                onClick={() => {
                  setRoomFormData({ name: '', description: '', category: 'normal', is_public: true, max_participants: 100 });
                  setShowCreateRoomModal(true);
                }}
                className="w-full bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Criar Nova Sala
              </button>
              <div className="max-h-64 overflow-y-auto space-y-3">
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
                      className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-light-border dark:border-dark-border hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate flex-1">
                          {room.name}
                        </h4>
                        <div className="flex items-center gap-1">
                          {room.is_hot && <span title="HOT"><FireIcon /></span>}
                          {room.is_new && <span title="NEW"><NewIcon /></span>}
                          {canManageRoom(room) && (
                            <div className="flex items-center gap-1 ml-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditRoomModal(room);
                                }}
                                className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                                title="Editar sala"
                              >
                                <EditIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDeleteRoomModal(room);
                                }}
                                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                title="Excluir sala"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 truncate">
                        {room.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-500">
                          {room.users_online || 0} online
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinRoom(room);
                          }}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            joinedRoomIds.has(room.id)
                              ? 'bg-red-500 hover:bg-red-600 text-white'
                              : 'bg-primary hover:bg-primary/90 text-white'
                          }`}
                        >
                          {joinedRoomIds.has(room.id) ? 'Sair' : 'Entrar'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Accordion: New Users */}
        <div className="border-b border-light-border dark:border-dark-border">
          <button
            onClick={() => handleAccordionToggle('newusers')}
            className={`w-full p-4 flex items-center justify-between text-left transition-colors ${activeAccordion === 'newusers'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
          >
            <span className="font-semibold">👥 NOVOS USUÁRIOS</span>
            <ChevronDownIcon className={`transition-transform ${activeAccordion === 'newusers' ? 'rotate-180' : ''}`} />
          </button>

          {activeAccordion === 'newusers' && (
            <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
              {loadingNewUsers ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                  <LoadingSpinner />
                </div>
              ) : filteredNewUsers.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                  <p className="text-sm">Nenhum usuário encontrado</p>
                </div>
              ) : (
                filteredNewUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Avatar
                        src={user.avatarUrl || ''}
                        alt={user.name}
                        size="md"
                        userId={user.id}
                        showStatus={true}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                            {user.name}
                          </h4>
                          {(user.plan === 'pro' || user.plan === 'premium') && (
                            <VerifiedBadgeIcon plan={user.plan} className="h-3 w-3 flex-shrink-0" />
                          )}
                          {user.role && ['admin', 'moderator'].includes(user.role) && (
                            <ModeratorBadgeIcon className="h-3 w-3 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          @{user.username}
                        </p>
                        {user.bio && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddBuddy(user)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex-shrink-0"
                      title="Adicionar buddy"
                    >
                      <PlusIcon className="h-4 w-4 inline mr-1" />
                      Adicionar
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
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
    </div>
  );
}
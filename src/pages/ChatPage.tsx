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
  searchUsers,
  ChatRoom as ChatRoomType,
  ChatMessage as ChatMessageType,
  subscribeToMessages,
  RealtimeChannel
} from '@/src/services/chatService';

// Icons
const SearchIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon className={className}><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></Icon>;
const PlusIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon className={className}><path d="M5 12h14"></path><path d="M12 5v14"></path></Icon>;
const ChevronDownIcon = ({ className = "h-5 w-5" }: { className?: string }) => <Icon className={className}><path d="m6 9 6 6 6-6"></path></Icon>;
const FireIcon = ({ className = "h-4 w-4 text-orange-500" }: { className?: string }) => <Icon className={className}><path d="M12 2c2.4 2.4 3.6 5.6 3.6 8.4 0 3.6-2.4 6-6 6s-6-2.4-6-6c0-2.8 1.2-6 3.6-8.4z"></path><path d="M12 12c2.4 2.4 3.6 5.6 3.6 8.4 0 3.6-2.4 6-6 6s-6-2.4-6-6c0-2.8 1.2-6 3.6-8.4z"></path></Icon>;
const NewIcon = ({ className = "h-4 w-4 text-green-500" }: { className?: string }) => <Icon className={className}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></Icon>;
const SendIcon = () => <Icon className="h-6 w-6"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></Icon>;
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
}

export default function ChatPage({ user, onUpdateUser }: ChatPageProps) {
  const { session } = useSession();
  const { addToast } = useToast();
  
  // State
  const [selectedBuddy, setSelectedBuddy] = useState<Buddy | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAccordion, setActiveAccordion] = useState<string>('search');
  const [currentView, setCurrentView] = useState<'radar' | 'chat'>('radar');
  
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
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
  
  // Load new users
  const loadNewUsers = async () => {
    try {
      setLoadingNewUsers(true);
      setNewUsersError(null);
      
      const { data, error } = await fetchNewUsers(7, 10);
      
      if (error) {
        const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao carregar novos usuários';
        setNewUsersError(errorMessage);
        addToast('Erro ao carregar novos usuários', 'error');
      } else {
        setNewUsers(data || []);
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao carregar novos usuários';
      setNewUsersError(errorMessage);
      addToast('Erro ao carregar novos usuários', 'error');
    } finally {
      setLoadingNewUsers(false);
    }
  };
  
  // Load buddies
  const loadBuddies = async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoadingBuddies(true);
      setBuddiesError(null);
      
      const { data, error } = await fetchChatBuddies(session.user.id);
      
      if (error) {
        const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao carregar buddies';
        setBuddiesError(errorMessage);
        addToast('Erro ao carregar buddies', 'error');
      } else {
        // Transform data to Buddy interface
        const transformedBuddies = (data || []).map(profile => ({
          id: profile.id,
          name: profile.full_name || profile.username,
          username: profile.username,
          avatarUrl: profile.avatar_url,
          lastActivity: profile.last_active_at || new Date().toISOString(),
          isOnline: !!profile.last_active_at && 
            new Date(profile.last_active_at).getTime() > Date.now() - 5 * 60 * 1000, // Online if active in last 5 minutes
          unreadCount: 0, // TODO: Implement unread count
          plan: profile.plan,
          role: profile.role
        }));
        setBuddies(transformedBuddies);
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao carregar buddies';
      setBuddiesError(errorMessage);
      addToast('Erro ao carregar buddies', 'error');
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
        setMessages(prev => [...prev, newMessage]);
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
    if (!messageText.trim() || isSending || !selectedBuddy) return;
    
    // Check if online before sending
    if (!isOnline) {
      addToast('Você está offline. Mensagem será enviada quando a conexão for restaurada.', 'info');
      return;
    }
    
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
  
  const handleAddBuddy = (newUser: any) => {
    const newBuddy: Buddy = {
      id: newUser.id,
      name: newUser.full_name || newUser.username,
      username: newUser.username,
      avatarUrl: newUser.avatar_url,
      lastActivity: new Date().toISOString(),
      isOnline: true,
      unreadCount: 0,
      plan: newUser.plan,
      role: newUser.role
    };
    
    setBuddies(prev => [newBuddy, ...prev]);
    setNewUsers(prev => prev.filter(user => user.id !== newUser.id));
    addToast(`${newUser.full_name || newUser.username} adicionado aos buddies!`, 'success');
  };
  
  const handleSelectBuddy = (buddy: Buddy) => {
    setSelectedBuddy(buddy);
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
      const { data, error } = await joinChatRoom(room.id);
      
      if (error) {
        console.error('Error joining room:', error);
        const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao entrar na sala';
        addToast(errorMessage, 'error');
      } else {
        addToast(`Entrou na sala ${room.name}`, 'success');
      }
    } catch (error: any) {
      console.error('Error in handleJoinRoom:', error);
      const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Erro ao entrar na sala';
      addToast(errorMessage, 'error');
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Agora';
    if (diffInHours < 24) return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (diffInHours < 48) return 'Ontem';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };
  
  // Filtered data
  const filteredBuddies = buddies.filter(buddy => 
    buddy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    buddy.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredNewUsers = newUsers.filter(user => {
    if (ageFilter && user.age !== parseInt(ageFilter)) return false;
    if (locationFilter && !user.location?.toLowerCase().includes(locationFilter.toLowerCase())) return false;
    if (interestsFilter && !user.interests?.some(interest => 
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
                className={`flex items-center gap-3 p-4 cursor-pointer border-b border-light-border dark:border-dark-border transition-colors ${
                  selectedBuddy?.id === buddy.id
                    ? 'bg-primary/10 border-l-4 border-l-primary'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <Avatar 
                  src={buddy.avatarUrl} 
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
              {currentView === 'radar' ? 'RADAR VIEW' : selectedBuddy ? `Chat with ${selectedBuddy.name}` : 'CHAT'}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleViewToggle('radar')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  currentView === 'radar'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                🎯 Radar
              </button>
              <button
                onClick={() => handleViewToggle('chat')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  currentView === 'chat'
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

        {/* Chat View */}
        {currentView === 'chat' && (
          <>
            {selectedBuddy ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      src={selectedBuddy.avatarUrl} 
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
                  <div className={`flex items-center gap-1 text-xs ${
                    isOnline ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      isOnline ? 'bg-green-500' : 'bg-red-500'
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
                    messages.map((message) => {
                      const isSentByMe = message.sender_id === session?.user?.id;
                      const isTemp = message.id.startsWith('temp_');
                      
                      return (
                        <div key={message.id} className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                              isSentByMe
                                ? 'bg-primary text-white rounded-br-none'
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none border border-light-border dark:border-dark-border'
                            } ${isTemp ? 'opacity-60' : ''}`}
                          >
                            <p className="break-words text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isSentByMe ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              {isTemp ? 'Enviando...' : formatTimestamp(message.created_at)}
                            </p>
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
            className={`w-full p-4 flex items-center justify-between text-left transition-colors ${
              activeAccordion === 'search' 
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
            className={`w-full p-4 flex items-center justify-between text-left transition-colors ${
              activeAccordion === 'rooms' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            <span className="font-semibold">🚀 SALAS DE CHAT</span>
            <ChevronDownIcon className={`transition-transform ${activeAccordion === 'rooms' ? 'rotate-180' : ''}`} />
          </button>
          
          {activeAccordion === 'rooms' && (
            <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
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
                    className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-light-border dark:border-dark-border hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {room.name}
                      </h4>
                      <div className="flex items-center gap-1">
                        {room.is_hot && <span title="HOT"><FireIcon /></span>}
                        {room.is_new && <span title="NEW"><NewIcon /></span>}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 truncate">
                      {room.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-500">
                        {room.participant_count} online
                      </span>
                      <button 
                        onClick={() => handleJoinRoom(room)}
                        className="text-xs bg-primary hover:bg-primary/90 text-white px-2 py-1 rounded transition-colors"
                      >
                        Entrar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
        {/* Accordion: New Users */}
        <div className="border-b border-light-border dark:border-dark-border">
          <button
            onClick={() => handleAccordionToggle('newusers')}
            className={`w-full p-4 flex items-center justify-between text-left transition-colors ${
              activeAccordion === 'newusers' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            <span className="font-semibold">👥 NOVOS USUÁRIOS</span>
            <ChevronDownIcon className={`transition-transform ${activeAccordion === 'newusers' ? 'rotate-180' : ''}`} />
          </button>
          
          {activeAccordion === 'newusers' && (
            <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
              {filteredNewUsers.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                  <p className="text-sm">Nenhum resultado</p>
                </div>
              ) : (
                filteredNewUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-light-border dark:border-dark-border hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar 
                          src={user.avatarUrl} 
                          alt={user.name} 
                          size="sm" 
                          userId={user.id}
                          showStatus={true}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                              {user.name}
                            </h4>
                            {(user.plan === 'pro' || user.plan === 'premium') && 
                              <VerifiedBadgeIcon plan={user.plan} className="h-3 w-3 flex-shrink-0" />
                            }
                            {user.role && ['admin', 'moderator'].includes(user.role) && 
                              <ModeratorBadgeIcon className="h-3 w-3 flex-shrink-0" />
                            }
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddBuddy(user)}
                        className="bg-green-500 hover:bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                        title="Adicionar buddy"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <p>🏙️ {user.location}</p>
                      <p>🎂 {user.age} anos</p>
                      <p>💫 {user.interests.join(', ')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { Conversation, User, ChatMessage } from '../types';
import Avatar from '../components/common/Avatar';
import { Icon } from '../components/icons/Icon';
import { useSession } from '@/contexts/SessionContext';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { VerifiedBadgeIcon } from '@/src/components/icons/VerifiedBadgeIcon';
import { ModeratorBadgeIcon } from '@/src/components/icons/ModeratorBadgeIcon';
import { useTranslation } from 'react-i18next';
import i18n from '@/src/i18n/config';

const SendIcon = () => <Icon className="h-6 w-6"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></Icon>;
const SearchIcon = () => <Icon className="h-5 w-5"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></Icon>;
const PlusIcon = () => <Icon className="h-5 w-5"><path d="M5 12h14"></path><path d="M12 5v14"></path></Icon>;
const MoreVerticalIcon = () => <Icon className="h-5 w-5"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></Icon>;
const TrashIcon = () => <Icon className="h-5 w-5 text-red-500"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></Icon>;

interface MessagesProps {
  conversations: Conversation[];
  handleSendMessage: (params: { conversationId?: string, targetUserId?: string, text: string }) => Promise<string | undefined>;
  isLoading: boolean;
  followedUsers: User[];
  onDeleteConversation: (conversationId: string) => Promise<void>;
}

const Messages: React.FC<MessagesProps> = ({ conversations, handleSendMessage, isLoading, followedUsers, onDeleteConversation }) => {
  const { user: currentUser, loading: sessionLoading } = useSession();
  const { t } = useTranslation(['messages', 'common']);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatTargetUser, setNewChatTargetUser] = useState<User | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  // Check for radar target user from localStorage
  useEffect(() => {
    const radarTargetUserId = localStorage.getItem('radarTargetUserId');
    const radarTargetUserStr = localStorage.getItem('radarTargetUser');
    
    if (radarTargetUserId && radarTargetUserStr) {
      try {
        const radarTargetUser = JSON.parse(radarTargetUserStr);
        
        // Clear localStorage
        localStorage.removeItem('radarTargetUserId');
        localStorage.removeItem('radarTargetUser');
        
        // Start new chat with radar user
        handleStartNewChat(radarTargetUser);
      } catch (error) {
        console.error('Error parsing radar target user:', error);
      }
    }
  }, []); // Run once on mount

  // Auto-select first conversation only if no new chat is being created
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0 && !newChatTargetUser) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId, newChatTargetUser]);

  // CORREÇÃO: Atualiza selectedConversationId quando uma nova conversa real é criada
  useEffect(() => {
    if (newChatTargetUser && conversations.length > 0) {
      const newConvo = conversations.find(c => 
        c.participants.some(p => p.id === newChatTargetUser.id) &&
        c.messages.length > 0
      );
      if (newConvo) {
        setSelectedConversationId(newConvo.id);
        setNewChatTargetUser(null);
        setShowNewChatModal(false);
      }
    }
  }, [conversations, newChatTargetUser]);

  const selectedConversation = selectedConversationId 
    ? conversations.find(c => c.id === selectedConversationId)
    : undefined;

  // Auto-scroll to bottom when messages change - only for the messages container, not the entire page
  useEffect(() => {
    // Only scroll within the messages container, not the entire window
    if (selectedConversation?.messages && messagesEndRef.current) {
      const messagesContainer = messagesEndRef.current.closest('.overflow-y-auto');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  }, [selectedConversation?.messages]);

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // REMOVIDO: Scroll automático para o topo da página - mantém posição natural do viewport

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || isSending) {
      // Logs removidos para produção
      return;
    }

    // Logs removidos para produção

    setIsSending(true);
    const textToSend = messageText;
    setMessageText(''); // Limpa o input imediatamente para melhor UX
    
    try {
      if (newChatTargetUser) {
        // Logs removidos para produção
        const newConversationId = await handleSendMessage({ 
          targetUserId: newChatTargetUser.id, 
          text: textToSend 
        });
        
        // Logs removidos para produção
        
        // O useEffect acima vai detectar a nova conversa e atualizar o estado
        
      } else if (selectedConversationId) {
        // Logs removidos para produção
        await handleSendMessage({ 
          conversationId: selectedConversationId, 
          text: textToSend 
        });
      }
    } catch (error) {
      // Logs removidos para produção
      setMessageText(textToSend); // Restaura o texto em caso de erro
    } finally {
      setIsSending(false);
    }
  };

  const handleStartNewChat = async (targetUser: User) => {
    // Logs removidos para produção
    
    const existingConvo = conversations.find(c => 
      c.participants.length === 2 && 
      c.participants.some(p => p.id === targetUser.id)
    );

    setShowNewChatModal(false);
    setShowChatOnMobile(true);

    if (existingConvo) {
      // Logs removidos para produção
      setSelectedConversationId(existingConvo.id);
      setNewChatTargetUser(null);
    } else {
      // Logs removidos para produção
      setSelectedConversationId(null);
      setNewChatTargetUser(targetUser);
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedConversationId) return;
    
    // Fechar o modal imediatamente para melhor UX
    setIsDeleteModalOpen(false);
    setShowOptionsMenu(false);
    
    // Executar a exclusão em background
    await onDeleteConversation(selectedConversationId);
    setSelectedConversationId(null);
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
      const locale = i18n.language === 'pt' ? 'pt-BR' : 'en-US';

      if (diffInHours < 24) {
        return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
      } else if (diffInHours < 48) {
        return t('messages:yesterday');
      } else {
        return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' });
      }
    } catch (e) {
      return ''; // Return empty string on error
    }
  };

  const getOtherUser = (conversation: Conversation): User | undefined => {
    if (!currentUser) {
      return undefined;
    }
    return conversation.participants.find(p => p.id !== currentUser.id);
  };

  const filteredConversations = searchQuery.trim() 
    ? conversations.filter(conv => {
        const otherUser = getOtherUser(conv);
        if (!otherUser) return false;
        return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               otherUser.username.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : conversations;

  if (sessionLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">
            {sessionLoading ? t('messages:loadingSession') : t('messages:loadingConversations')}
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{t('common:error')}: {t('common:userNotIdentified')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('common:pleaseLoginAgain')}
          </p>
        </div>
      </div>
    );
  }

  // Logs removidos para produção

  // Determina qual conversa ou usuário mostrar
  const displayConversation = selectedConversation;
  const displayUser = newChatTargetUser || (displayConversation ? getOtherUser(displayConversation) : null);

  return (
    <>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-900 dark:text-white">{t('messages:title')}</h1>
        
        <div className="bg-light-card dark:bg-dark-card rounded-xl overflow-hidden border border-light-border dark:border-dark-border shadow-lg">
          {/* 
            Cálculo da altura otimizado para manter o título sempre visível:
            100vh (altura total da viewport)
            - 4rem (altura do cabeçalho fixo - 64px)
            - 5rem (padding-top do container principal - 80px)
            - 4rem (altura do título h1 + margin-bottom - ~64px)
            - 2rem (margem de segurança adicional - 32px)
            = 100vh - 15rem (240px)
            Altura mínima ajustada para telas menores.
          */}
          <div className="flex h-[calc(100vh-12rem)] md:h-[calc(100vh-15rem)] min-h-[400px]">
            {/* Conversations List Sidebar */}
            <div className={`w-full md:w-1/3 border-r border-light-border dark:border-dark-border flex flex-col ${showChatOnMobile ? 'hidden md:flex' : 'flex'}`}>
              {/* Search Header */}
              <div className="p-3 md:p-4 border-b border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg">
                <div className="relative mb-3">
                  <input
                    type="text"
                    placeholder={t('messages:searchConversations')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-gray-700 border border-light-border dark:border-dark-border rounded-full py-2 md:py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 flex-shrink-0">
                    <SearchIcon />
                  </div>
                </div>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-2 md:py-2 px-3 md:px-4 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <PlusIcon />
                  <span className="truncate">{t('messages:newConversation')}</span>
                </button>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {/* New Chat Preview */}
                {newChatTargetUser && (
                  <div
                    className="flex items-center gap-3 p-3 md:p-4 cursor-pointer border-b border-light-border dark:border-dark-border bg-primary/10 border-l-4 border-l-primary"
                  >
                    <Avatar 
                      src={newChatTargetUser.avatarUrl} 
                      alt={newChatTargetUser.name} 
                      size="md" 
                      userId={newChatTargetUser.id}
                      showStatus={true}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white truncate">
                        {newChatTargetUser.name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">
                        {t('messages:newConversationPreview')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Lista de Conversas */}
                {filteredConversations.length === 0 && !newChatTargetUser ? (
                  <div className="p-6 md:p-8 text-center text-gray-500 dark:text-gray-400">
                    {searchQuery.trim() ? (
                      <>
                        <p className="mb-2 text-sm md:text-base">{t('messages:noConversationsFound')}</p>
                        <p className="text-xs md:text-sm">{t('messages:tryAnotherSearch')}</p>
                      </>
                    ) : (
                      <>
                        <p className="mb-2 text-sm md:text-base">{t('messages:noConversations')}</p>
                        <p className="text-xs md:text-sm">{t('messages:noConversationsDesc')}</p>
                      </>
                    )}
                  </div>
                ) : (
                  filteredConversations.map((conversation) => {
                    const otherUser = getOtherUser(conversation);
                    
                    if (!otherUser) {
                      // Logs removidos para produção
                      return null;
                    }
                    
                    const lastMessage = conversation.messages[conversation.messages.length - 1];
                    const isSelected = conversation.id === selectedConversationId;

                    return (
                      <div
                        key={conversation.id}
                        onClick={() => {
                          // Logs removidos para produção
                          setSelectedConversationId(conversation.id);
                          setNewChatTargetUser(null);
                          setShowChatOnMobile(true);
                        }}
                        className={`flex items-center gap-3 p-3 md:p-4 cursor-pointer border-b border-light-border dark:border-dark-border transition-colors ${
                          isSelected 
                            ? 'bg-primary/10 border-l-4 border-l-primary' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <Avatar 
                          src={otherUser.avatarUrl} 
                          alt={otherUser.name} 
                          size="md" 
                          userId={otherUser.id}
                          showStatus={true}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between mb-1">
                            <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white truncate">
                              {otherUser.name}
                            </h3>
                            {lastMessage && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                                {formatTimestamp(lastMessage.timestamp)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">
                            {lastMessage ? lastMessage.text : t('messages:noMessagesYet')}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Window */}
            <div className={`flex-1 flex-col ${showChatOnMobile ? 'flex' : 'hidden md:flex'}`}>
              {displayUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-3 md:p-4 border-b border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Back button for mobile */}
                      <button
                        onClick={() => setShowChatOnMobile(false)}
                        className="md:hidden p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex-shrink-0"
                      >
                        <Icon className="h-5 w-5">
                          <path d="M15 18l-6-6 6-6"></path>
                        </Icon>
                      </button>
                      <Avatar 
                        src={displayUser.avatarUrl} 
                        alt={displayUser.name} 
                        size="md"
                        userId={displayUser.id}
                        showStatus={true}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <h3 className="font-bold text-sm md:text-base text-gray-900 dark:text-white truncate">
                            {displayUser.name}
                          </h3>
                          {(displayUser.plan === 'pro' || displayUser.plan === 'premium') && <VerifiedBadgeIcon plan={displayUser.plan} className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />}
                          {displayUser.role && ['admin', 'moderator'].includes(displayUser.role) && <ModeratorBadgeIcon className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />}
                        </div>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                          @{displayUser.username}
                        </p>
                      </div>
                    </div>
                    
                    {/* Options Menu - only for existing conversations */}
                    {selectedConversation && !newChatTargetUser && (
                      <div className="relative" ref={optionsMenuRef}>
                        <button
                          onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                        >
                          <MoreVerticalIcon />
                        </button>
                        {showOptionsMenu && (
                          <div className="absolute right-0 mt-2 w-48 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-lg z-20">
                            <button
                              onClick={() => {
                                setIsDeleteModalOpen(true);
                                setShowOptionsMenu(false);
                              }}
                              className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                            >
                              <TrashIcon />
                              <span>{t('messages:deleteConversation')}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-gray-50 dark:bg-gray-900/30">
                    {newChatTargetUser ? (
                      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <p>{t('messages:sendFirstMessage', { name: newChatTargetUser.name })}</p>
                      </div>
                    ) : selectedConversation && selectedConversation.messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <p>{t('messages:noMessagesYet')}</p>
                      </div>
                    ) : (
                      selectedConversation?.messages.map((message) => {
                        const isSentByMe = message.senderId === currentUser?.id;
                        const isTemp = message.id.startsWith('temp_');

                        return (
                          <div
                            key={message.id}
                            className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'} w-full`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                isSentByMe
                                  ? 'bg-primary text-white rounded-br-none'
                                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none border border-light-border dark:border-dark-border'
                              } ${isTemp ? 'opacity-60' : ''}`}
                              style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                            >
                              <p className="break-words whitespace-pre-wrap" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{message.text}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isSentByMe ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                                }`}
                              >
                                {isTemp ? t('messages:sending') : formatTimestamp(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-3 md:p-4 border-t border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg">
                    <form onSubmit={handleSubmit} className="flex items-center gap-2 md:gap-3">
                      <input
                        type="text"
                        placeholder={t('messages:typeMessage')}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        disabled={isSending}
                        className="flex-1 bg-white dark:bg-gray-700 border border-light-border dark:border-dark-border rounded-full py-2 md:py-3 px-4 md:px-5 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={!messageText.trim() || isSending}
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
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-center p-6 md:p-8">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {t('messages:selectConversation')}
                    </h2>
                    <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                      {t('messages:selectConversationDesc')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* New Chat Modal */}
        {showNewChatModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4">
            <div className="bg-light-card dark:bg-dark-card rounded-xl max-w-md w-full max-h-[85vh] md:max-h-[80vh] flex flex-col border border-light-border dark:border-dark-border">
              <div className="p-3 md:p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Nova Conversa</h3>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl md:text-2xl flex-shrink-0"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 md:p-4">
                {followedUsers.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-6 md:py-8 text-sm md:text-base">
                    {t('messages:notFollowingAnyone')}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {followedUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleStartNewChat(user)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      >
                        <Avatar src={user.avatarUrl} alt={user.name} size="md" userId={user.id} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <p className="font-semibold text-sm md:text-base text-gray-900 dark:text-white truncate">{user.name}</p>
                            {(user.plan === 'pro' || user.plan === 'premium') && <VerifiedBadgeIcon plan={user.plan} className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />}
                            {user.role && ['admin', 'moderator'].includes(user.role) && <ModeratorBadgeIcon className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />}
                          </div>
                          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConversation}
          title="Apagar Conversa?"
          message="Esta ação é irreversível. Todas as mensagens desta conversa serão permanentemente excluídas. Tem certeza?"
          confirmText="Sim, apagar"
          isDestructive={true}
        />
      </div>
    </>
  );
};

export default Messages;
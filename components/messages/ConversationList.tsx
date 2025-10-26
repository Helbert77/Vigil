import React from 'react';
import { Conversation, User } from '../../types';
import Avatar from '../common/Avatar';
import { VerifiedBadgeIcon } from '@/src/components/icons/VerifiedBadgeIcon';
import { ModeratorBadgeIcon } from '@/src/components/icons/ModeratorBadgeIcon';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  currentUser: User;
  followedUsers: User[];
  onStartConversation: (user: User) => void;
  isLoading: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, selectedConversationId, onSelectConversation, currentUser, followedUsers, onStartConversation, isLoading }) => {
  const existingParticipantIds = conversations.flatMap(c => c.participants.map(p => p.id));
  const usersToStartChatWith = followedUsers.filter(u => !existingParticipantIds.includes(u.id) && u.id !== currentUser.id);

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col border-r border-light-border dark:border-dark-border">
      <div className="p-4 border-b border-light-border dark:border-dark-border">
        <h2 className="text-xl font-bold">Mensagens</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {conversations.map((convo: Conversation) => {
              const otherUser = convo.participants.find((p: User) => p.id !== currentUser.id);
              if (!otherUser) return null;
              const lastMessage = convo.messages[convo.messages.length - 1];
              const isSelected = convo.id === selectedConversationId;

              return (
                <div
                  key={convo.id}
                  onClick={() => onSelectConversation(convo.id)}
                  className={`flex items-center space-x-3 p-3 cursor-pointer border-b border-light-border dark:border-dark-border ${isSelected ? 'bg-primary/10' : 'hover:bg-gray-100 dark:hover:bg-dark-card/50'}`}
                >
                  <Avatar src={otherUser.avatarUrl} alt={otherUser.name} size="md" userId={otherUser.id} showStatus={true} />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-baseline">
                      <div className="flex items-center gap-1 truncate">
                        <p className="font-bold truncate">{otherUser.name}</p>
                        {(otherUser.plan === 'pro' || otherUser.plan === 'premium') && <VerifiedBadgeIcon plan={otherUser.plan} className="h-4 w-4 flex-shrink-0" />}
                        {otherUser.role && ['admin', 'moderator'].includes(otherUser.role) && <ModeratorBadgeIcon className="h-4 w-4 flex-shrink-0" />}
                      </div>
                      {lastMessage && <p className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{lastMessage.timestamp}</p>}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{lastMessage?.text || 'Nenhuma mensagem ainda.'}</p>
                  </div>
                </div>
              );
            })}
            
            {usersToStartChatWith.length > 0 && (
              <div className="pt-4">
                <h3 className="px-3 pb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">Iniciar uma nova conversa</h3>
                {usersToStartChatWith.map((user: User) => (
                  <div
                    key={user.id}
                    onClick={() => onStartConversation(user)}
                    className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-card/50"
                  >
                    <Avatar src={user.avatarUrl} alt={user.name} size="md" userId={user.id} showStatus={true} />
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-1">
                        <p className="font-bold truncate">{user.name}</p>
                        {(user.plan === 'pro' || user.plan === 'premium') && <VerifiedBadgeIcon plan={user.plan} className="h-4 w-4 flex-shrink-0" />}
                        {user.role && ['admin', 'moderator'].includes(user.role) && <ModeratorBadgeIcon className="h-4 w-4 flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {conversations.length === 0 && usersToStartChatWith.length === 0 && (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    Nenhuma conversa ainda. Siga alguns usuários para começar a conversar!
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
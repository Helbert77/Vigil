import React from 'react';
import { Conversation, User } from '../../types';
import Avatar from '../common/Avatar';
import { Icon } from '../icons/Icon';

const EditIcon = () => <Icon className="h-6 w-6"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></Icon>;

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewMessage: () => void;
  currentUser: User;
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, selectedConversationId, onSelectConversation, onNewMessage, currentUser }) => {
  return (
    <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col border-r border-light-border dark:border-dark-border">
      {/* Header */}
      <div className="p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center">
        <h2 className="text-xl font-bold">Messages</h2>
        <button onClick={onNewMessage} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full" aria-label="New message">
          <EditIcon />
        </button>
      </div>
      
      {/* Conversation Items */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map(convo => {
          const otherUser = convo.participants.find(p => p.id !== currentUser.id) as User;
          const lastMessage = convo.messages[convo.messages.length - 1];
          const isSelected = convo.id === selectedConversationId;

          return (
            <div
              key={convo.id}
              onClick={() => onSelectConversation(convo.id)}
              className={`flex items-center space-x-3 p-3 cursor-pointer border-b border-light-border dark:border-dark-border ${isSelected ? 'bg-primary/10' : 'hover:bg-gray-100 dark:hover:bg-dark-card/50'}`}
            >
              <Avatar src={otherUser.avatarUrl} alt={otherUser.name} size="md" />
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline">
                  <p className="font-bold truncate">{otherUser.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{lastMessage?.timestamp}</p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{lastMessage?.text}</p>
              </div>
            </div>
          );
        })}
         {conversations.length === 0 && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No conversations yet. Start a new one!
            </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
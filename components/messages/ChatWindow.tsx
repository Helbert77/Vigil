import React, { useState, useEffect, useRef } from 'react';
import { Conversation, User } from '../../types';
import Avatar from '../common/Avatar';
import { Icon } from '../icons/Icon';
import { VerifiedBadgeIcon } from '@/src/components/icons/VerifiedBadgeIcon';
import { ModeratorBadgeIcon } from '@/src/components/icons/ModeratorBadgeIcon';

const SendIcon = () => <Icon className="h-6 w-6"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></Icon>;
const LoaderIcon = () => <Icon className="h-6 w-6 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></Icon>;

interface ChatWindowProps {
  conversation: Conversation | null;
  isSending?: boolean;
  onSendMessage: (text: string) => void;
  currentUser: User;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, isSending, onSendMessage, currentUser }) => {
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  if (!conversation) {
    return (
      <div className="flex-1 hidden md:flex items-center justify-center text-center text-gray-500 dark:text-gray-400 p-4">
        <div>
          <h2 className="text-2xl font-bold">Selecione uma conversa</h2>
          <p>Escolha uma conversa existente ou inicie uma nova.</p>
        </div>
      </div>
    );
  }

  const otherUser = conversation.participants.find((p: User) => p.id !== currentUser.id);
  if (!otherUser) return null; // Should not happen in a valid conversation

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isSending) {
      onSendMessage(text);
      setText('');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-light-border dark:border-dark-border flex items-center space-x-3">
        <Avatar src={otherUser.avatarUrl} alt={otherUser.name} size="md" userId={otherUser.id} showStatus={true} />
        <div>
          <div className="flex items-center gap-1">
            <h3 className="font-bold text-lg">{otherUser.name}</h3>
            {(otherUser.plan === 'pro' || otherUser.plan === 'premium') && <VerifiedBadgeIcon plan={otherUser.plan} className="h-4 w-4" />}
            {otherUser.role && ['admin', 'moderator'].includes(otherUser.role) && <ModeratorBadgeIcon className="h-4 w-4" />}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">@{otherUser.username}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {conversation.messages.map((message) => {
          const isSentByMe = message.senderId === currentUser.id;
          const sender = isSentByMe ? currentUser : otherUser;
          const isTemp = message.id.startsWith('temp_');
          return (
            <div key={message.id} className={`flex items-end gap-3 ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
              {!isSentByMe && <Avatar src={sender.avatarUrl} alt={sender.name} size="sm" userId={sender.id} showStatus={true} />}
              <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${isSentByMe ? 'bg-secondary text-white rounded-br-none' : 'bg-light-bg dark:bg-dark-bg rounded-bl-none'} ${isTemp ? 'opacity-70' : ''}`}>
                <p>{message.text}</p>
                <p className={`text-xs mt-1 text-right ${isSentByMe ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>{isTemp ? 'Enviando...' : message.timestamp}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-light-border dark:border-dark-border">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Inicie uma nova mensagem"
            value={text}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
            className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button type="submit" className="bg-secondary p-2 rounded-full text-white hover:bg-blue-700 disabled:bg-gray-400" disabled={!text.trim() || isSending}>
            {isSending ? <LoaderIcon /> : <SendIcon />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
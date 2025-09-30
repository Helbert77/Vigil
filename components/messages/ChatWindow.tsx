import React, { useState, useEffect, useRef } from 'react';
import { Conversation, ChatMessage, User } from '../../types';
import Avatar from '../common/Avatar';
import { Icon } from '../icons/Icon';

const SendIcon = () => <Icon className="h-6 w-6"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></Icon>;

interface ChatWindowProps {
  conversation: Conversation | null;
  onSendMessage: (text: string) => void;
  currentUser: User;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onSendMessage, currentUser }) => {
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
      <div className="flex-1 flex-1 hidden md:flex items-center justify-center text-center text-gray-500 dark:text-gray-400 p-4">
        <div>
          <h2 className="text-2xl font-bold">Select a conversation</h2>
          <p>Choose from your existing conversations or start a new one.</p>
        </div>
      </div>
    );
  }

  const otherUser = conversation.participants.find(p => p.id !== currentUser.id) as User;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  };

  return (
    <div className="flex-1 flex flex-col border-l border-light-border dark:border-dark-border">
      {/* Header */}
      <div className="p-4 border-b border-light-border dark:border-dark-border flex items-center space-x-3">
        <Avatar src={otherUser.avatarUrl} alt={otherUser.name} size="md" />
        <div>
          <h3 className="font-bold text-lg">{otherUser.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">@{otherUser.username}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {conversation.messages.map(message => {
          const isSentByMe = message.senderId === currentUser.id;
          const sender = isSentByMe ? currentUser : otherUser;
          return (
            <div key={message.id} className={`flex items-end gap-3 ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
              {!isSentByMe && <Avatar src={sender.avatarUrl} alt={sender.name} size="sm" />}
              <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${isSentByMe ? 'bg-secondary text-white rounded-br-none' : 'bg-light-bg dark:bg-dark-bg rounded-bl-none'}`}>
                <p>{message.text}</p>
                <p className={`text-xs mt-1 ${isSentByMe ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>{message.timestamp}</p>
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
            placeholder="Start a new message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button type="submit" className="bg-secondary p-2 rounded-full text-white hover:bg-blue-700 disabled:bg-gray-400" disabled={!text.trim()}>
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
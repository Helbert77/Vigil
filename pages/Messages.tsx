import React, { useState, useMemo } from 'react';
import Card from '../components/common/Card';
import { Conversation, User, ChatMessage } from '../types';
import ConversationList from '../components/messages/ConversationList';
import ChatWindow from '../components/messages/ChatWindow';
import NewMessageModal from '../components/messages/NewMessageModal';

interface MessagesProps {
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  user: User;
}

const Messages: React.FC<MessagesProps> = ({ conversations, setConversations, user }) => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedConversation = useMemo(
    () => conversations.find(c => c.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );
  
  const handleSendMessage = (text: string) => {
    if (!selectedConversationId) return;

    const newMessage: ChatMessage = {
      id: `m${Date.now()}`,
      senderId: user.id,
      text,
      timestamp: 'Just now',
    };

    setConversations(prev =>
      prev.map(convo =>
        convo.id === selectedConversationId
          ? { ...convo, messages: [...convo.messages, newMessage] }
          : convo
      )
    );
  };

  const handleStartConversation = (targetUser: User) => {
    // Check if conversation already exists
    const existingConvo = conversations.find(c => c.participants.some(p => p.id === targetUser.id));
    if (existingConvo) {
      setSelectedConversationId(existingConvo.id);
    } else {
      // Create new conversation
      const newConvo: Conversation = {
        id: `c${Date.now()}`,
        participants: [user, targetUser],
        messages: [],
      };
      setConversations(prev => [newConvo, ...prev]);
      setSelectedConversationId(newConvo.id);
    }
    setIsModalOpen(false);
  };
  
  const existingParticipantIds = useMemo(() => 
    conversations.flatMap(c => c.participants)
                 .map(p => p.id)
                 .filter(id => id !== user.id), 
    [conversations, user.id]
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Messages</h1>
      <Card className="p-0 sm:p-0 overflow-hidden">
        <div className="flex h-[calc(100vh-12rem)] min-h-[500px]">
          <ConversationList 
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
            onNewMessage={() => setIsModalOpen(true)}
            currentUser={user}
          />
          <ChatWindow
            conversation={selectedConversation}
            onSendMessage={handleSendMessage}
            currentUser={user}
          />
        </div>
      </Card>
      {isModalOpen && 
        <NewMessageModal 
          onClose={() => setIsModalOpen(false)} 
          onStartConversation={handleStartConversation}
          existingParticipantIds={existingParticipantIds}
        />
      }
    </div>
  );
};

export default Messages;
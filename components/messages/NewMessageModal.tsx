import React from 'react';
import { User } from '../../types';
import { MOCK_FOLLOWERS } from '../../constants';
import Avatar from '../common/Avatar';
import { Icon } from '../icons/Icon';

const XIcon = () => <Icon className="h-6 w-6"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></Icon>;

interface NewMessageModalProps {
  onClose: () => void;
  onStartConversation: (user: User) => void;
  existingParticipantIds: string[];
}

const NewMessageModal: React.FC<NewMessageModalProps> = ({ onClose, onStartConversation, existingParticipantIds }) => {
  const availableFollowers = MOCK_FOLLOWERS.filter(follower => !existingParticipantIds.includes(follower.id));

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold">New Message</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
            <XIcon />
          </button>
        </div>
        
        {/* Follower list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {availableFollowers.length > 0 ? (
            availableFollowers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => onStartConversation(user)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar src={user.avatarUrl} alt={user.name} size="md" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">You have already started conversations with all your followers.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewMessageModal;

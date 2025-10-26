import React from 'react';
import { User } from '@/types';
import Avatar from './Avatar';

interface MentionSuggestionsProps {
  users: User[];
  onSelect: (user: User) => void;
}

const MentionSuggestions: React.FC<MentionSuggestionsProps> = ({ users, onSelect }) => {
  if (users.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full mt-2 w-full max-w-sm bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
      {users.map(user => (
        <button
          key={user.id}
          onClick={() => onSelect(user)}
          className="w-full text-left flex items-center space-x-3 p-3 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <Avatar src={user.avatarUrl} alt={user.name} size="sm" />
          <div>
            <p className="font-bold text-sm">{user.name}</p>
            <p className="text-xs text-gray-500">@{user.username}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default MentionSuggestions;
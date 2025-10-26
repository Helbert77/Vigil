import React from 'react';
import { User } from '@/types';
import Avatar from '../common/Avatar';

interface BlockedUsersListProps {
  blockedUsers: User[];
  onUnblock: (userId: string) => void;
}

const BlockedUsersList: React.FC<BlockedUsersListProps> = ({ blockedUsers, onUnblock }) => {
  if (blockedUsers.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Você não bloqueou ninguém.</p>;
  }

  return (
    <div className="space-y-4">
      {blockedUsers.map(user => (
        <div key={user.id} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar src={user.avatarUrl} alt={user.name} size="md" />
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
            </div>
          </div>
          <button
            onClick={() => onUnblock(user.id)}
            className="bg-primary hover:bg-gray-600 text-white font-bold py-1 px-4 rounded-full text-sm"
          >
            Unblock
          </button>
        </div>
      ))}
    </div>
  );
};

export default BlockedUsersList;
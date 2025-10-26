import React from 'react';
import { User } from '@/types';
import Avatar from '../common/Avatar';
import { VerifiedBadgeIcon } from '@/src/components/icons/VerifiedBadgeIcon';
import { ModeratorBadgeIcon } from '@/src/components/icons/ModeratorBadgeIcon';

interface UserListItemProps {
  user: User;
  currentUser: User;
  isFollowing: boolean;
  onFollowToggle: (userId: string) => void;
  onViewProfile: (userId: string) => void;
  onViewFollowers: (user: User) => void;
  onViewFollowing: (user: User) => void;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, currentUser, isFollowing, onFollowToggle, onViewProfile, onViewFollowers, onViewFollowing }) => {
  const isCurrentUser = user.id === currentUser.id;

  return (
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50">
      <div className="flex items-start space-x-3 flex-1 cursor-pointer" onClick={() => onViewProfile(user.id)}>
        <Avatar src={user.avatarUrl} alt={user.name} size="md" />
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <p className="font-bold text-gray-900 dark:text-white hover:underline">{user.name}</p>
            {(user.plan === 'pro' || user.plan === 'premium') && <VerifiedBadgeIcon plan={user.plan} className="h-4 w-4" />}
            {user.role && ['admin', 'moderator'].includes(user.role) && <ModeratorBadgeIcon className="h-4 w-4" />}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">{user.bio}</p>
          <div className="flex space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <button onClick={(e) => { e.stopPropagation(); onViewFollowing(user); }} className="hover:underline">
              <span className="font-bold text-gray-700 dark:text-gray-300">{user.followingCount}</span> Seguindo
            </button>
            <button onClick={(e) => { e.stopPropagation(); onViewFollowers(user); }} className="hover:underline">
              <span className="font-bold text-gray-700 dark:text-gray-300">{user.followersCount}</span> Seguidores
            </button>
          </div>
        </div>
      </div>
      {!isCurrentUser && (
        <button
          onClick={() => onFollowToggle(user.id)}
          className={`font-bold py-1 px-4 rounded-full text-sm transition-colors duration-200 ml-4 flex-shrink-0 ${
            isFollowing
              ? 'bg-transparent border border-primary text-primary hover:bg-primary/10'
              : 'bg-primary hover:bg-gray-600 text-white'
          }`}
        >
          {isFollowing ? 'Seguindo' : 'Seguir'}
        </button>
      )}
    </div>
  );
};

export default UserListItem;
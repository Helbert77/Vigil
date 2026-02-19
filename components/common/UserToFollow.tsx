import React from 'react';
import Avatar from './Avatar';
import UserLink from './UserLink';
import { User } from '@/types';
import { VerifiedBadgeIcon } from '@/src/components/icons/VerifiedBadgeIcon';
import { ModeratorBadgeIcon } from '@/src/components/icons/ModeratorBadgeIcon';
import { useTranslation } from 'react-i18next';

export interface UserToFollowProps {
  user: User;
  isFollowing: boolean;
  onFollowToggle: (userId: string) => void;
  onViewProfile: (userId: string) => void;
  isCurrentUser: boolean;
  onOpenFollowModal: (user: User, tab: 'followers' | 'following') => void;
}

const UserToFollow: React.FC<UserToFollowProps> = ({ user, isFollowing, onFollowToggle, onViewProfile, isCurrentUser, onOpenFollowModal }) => {
  const { t } = useTranslation(['common']);
  
  return (
    <div key={user.id} className="flex items-center justify-between gap-3">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <Avatar src={user.avatarUrl} alt={user.name} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <UserLink
              user={user}
              isFollowing={isFollowing}
              onFollowToggle={onFollowToggle}
              onViewProfile={onViewProfile}
              isCurrentUser={isCurrentUser}
              onOpenFollowModal={onOpenFollowModal}
            >
              <p className="font-bold text-gray-900 dark:text-white truncate text-sm md:text-base">
                {user.name}
              </p>
            </UserLink>
            {(user.plan === 'pro' || user.plan === 'premium') && (
              <VerifiedBadgeIcon plan={user.plan} className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
            )}
            {user.role && ['admin', 'moderator'].includes(user.role) && (
              <ModeratorBadgeIcon className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
            @{user.username}
          </p>
        </div>
      </div>
      <button 
        onClick={() => onFollowToggle(user.id)}
        className={`font-bold py-1.5 px-3 md:py-1 md:px-4 rounded-full text-xs md:text-sm transition-colors duration-200 transform active:scale-95 flex-shrink-0 min-w-[70px] md:min-w-[80px] ${
          isFollowing 
            ? 'bg-transparent border border-primary text-primary hover:bg-primary/10'
            : 'bg-primary hover:bg-gray-600 text-white'
        }`}
      >
        {isFollowing ? t('following') : t('follow')}
      </button>
    </div>
  );
};

export default UserToFollow;

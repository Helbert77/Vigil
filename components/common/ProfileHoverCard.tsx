import React from 'react';
import { User } from '@/types';
import Avatar from '@/components/common/Avatar';
import { Icon } from '@/components/icons/Icon';
import { VerifiedBadgeIcon } from '@/src/components/icons/VerifiedBadgeIcon';
import { ModeratorBadgeIcon } from '@/src/components/icons/ModeratorBadgeIcon';

const EyeIcon = () => <Icon className="h-4 w-4 md:h-5 md:w-5 mr-2 flex-shrink-0"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></Icon>;

interface ProfileHoverCardProps {
  user: User;
  isFollowing: boolean;
  onFollowToggle: (userId: string) => void;
  onViewProfile: (userId: string) => void;
  isCurrentUser: boolean;
  onOpenFollowModal: (user: User, tab: 'followers' | 'following') => void;
}

const ProfileHoverCard: React.FC<ProfileHoverCardProps> = ({ user, isFollowing, onFollowToggle, onViewProfile, isCurrentUser, onOpenFollowModal }) => {
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFollowToggle(user.id);
  };

  const handleViewProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewProfile(user.id);
  };

  return (
    <div className="w-72 md:w-80 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl shadow-2xl p-3 md:p-4 animate-fade-in-down" onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-start">
        <div onClick={handleViewProfileClick} className="cursor-pointer">
          <Avatar src={user.avatarUrl} alt={user.name} size="lg" />
        </div>
        {!isCurrentUser && (
          <button
            onClick={handleButtonClick}
            className={`font-bold py-1 px-3 md:px-4 rounded-full text-xs md:text-sm transition-colors duration-200 flex-shrink-0 ${
              isFollowing 
                ? 'bg-transparent border border-primary text-primary hover:bg-primary/10'
                : 'bg-primary hover:bg-gray-600 text-white'
            }`}
          >
            {isFollowing ? 'Seguindo' : 'Seguir'}
          </button>
        )}
      </div>
      <div className="mt-2" onClick={handleViewProfileClick}>
        <div className="flex items-center gap-1 min-w-0">
            <p className="font-bold text-gray-900 dark:text-white hover:underline cursor-pointer truncate">{user.name}</p>
            {(user.plan === 'pro' || user.plan === 'premium') && <VerifiedBadgeIcon plan={user.plan} className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />}
            {user.role && ['admin', 'moderator'].includes(user.role) && <ModeratorBadgeIcon className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />}
        </div>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
      </div>
      <p className="text-xs md:text-sm mt-3 text-gray-700 dark:text-gray-300 line-clamp-3">{user.bio || 'Nenhuma biografia disponível.'}</p>
      <div className="flex space-x-3 md:space-x-4 mt-3 text-xs md:text-sm text-gray-500 dark:text-gray-400">
        <button onClick={(e) => { e.stopPropagation(); onOpenFollowModal(user, 'following'); }} className="hover:underline min-w-0">
          <span className="font-bold text-gray-800 dark:text-gray-200">{user.followingCount.toLocaleString()}</span> Seguindo
        </button>
        <button onClick={(e) => { e.stopPropagation(); onOpenFollowModal(user, 'followers'); }} className="hover:underline min-w-0">
          <span className="font-bold text-gray-800 dark:text-gray-200">{user.followersCount.toLocaleString()}</span> Seguidores
        </button>
      </div>
      <button
        onClick={handleViewProfileClick}
        className="w-full mt-3 md:mt-4 flex items-center justify-center bg-transparent border border-light-border dark:border-dark-border text-gray-800 dark:text-gray-200 font-bold py-2 px-3 md:px-4 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs md:text-sm"
      >
        <EyeIcon />
        Resumo do perfil
      </button>
    </div>
  );
};

export default ProfileHoverCard;
import React from 'react';
import { Icon } from '@/components/icons/Icon';
import { usePresence } from '@/src/contexts/PresenceContext';

const UserIcon = () => <Icon className="h-full w-full text-gray-500 dark:text-gray-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></Icon>;

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  userId?: string;
  showStatus?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 'md', userId, showStatus = false }) => {
  const { onlineUserIds } = usePresence();
  const isOnline = userId ? onlineUserIds.includes(userId) : false;

  const sizeClasses: Record<typeof size, string> = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-24 w-24',
  };

  const statusSizeClasses: Record<typeof size, string> = {
    sm: 'w-2.5 h-2.5 bottom-0 right-0',
    md: 'w-3 h-3 bottom-0.5 right-0.5',
    lg: 'w-4 h-4 bottom-1 right-1',
  };

  const renderAvatar = () => {
    if (!src || src.trim() === '') {
      return (
        <div className="h-full w-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <UserIcon />
        </div>
      );
    }
    return (
      <img
        src={src}
        alt={alt}
        className="h-full w-full rounded-full object-cover"
      />
    );
  };

  return (
    <div className={`relative flex-shrink-0 ${sizeClasses[size]}`}>
      {renderAvatar()}
      {showStatus && isOnline && (
        <span className={`absolute rounded-full bg-green-500 border-2 border-light-card dark:border-dark-card ${statusSizeClasses[size]}`}></span>
      )}
    </div>
  );
};

export default Avatar;
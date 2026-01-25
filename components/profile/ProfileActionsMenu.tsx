import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../icons/Icon';
import { User } from '@/types';
import { useTranslation } from 'react-i18next';

const MoreHorizontalIcon = () => <Icon><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></Icon>;
const BlockIcon = () => <Icon className="h-5 w-5 text-red-500"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></Icon>;

interface ProfileActionsMenuProps {
  user: User;
  isBlocked: boolean;
  onBlockToggle: (userId: string) => void;
}

const ProfileActionsMenu: React.FC<ProfileActionsMenuProps> = ({ user, isBlocked, onBlockToggle }) => {
  const { t } = useTranslation(['profile']);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBlock = () => {
    onBlockToggle(user.id);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
        <MoreHorizontalIcon />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-lg z-20">
          <button
            onClick={handleBlock}
            className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <BlockIcon />
            <span>{isBlocked ? t('profile:unblock') : t('profile:block')} @{user.username}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileActionsMenu;
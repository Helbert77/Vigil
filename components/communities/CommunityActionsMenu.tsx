import React, { useState, useRef, useEffect } from 'react';
import { Community, User } from '../../types';
import { Icon } from '../icons/Icon';
import { useTranslation } from 'react-i18next';

const MoreHorizontalIcon = () => <Icon><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></Icon>;
const EditIcon = () => <Icon className="h-5 w-5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></Icon>;

interface CommunityActionsMenuProps {
  community: Community;
  currentUser: User;
  onEdit: () => void;
}

const CommunityActionsMenu: React.FC<CommunityActionsMenuProps> = ({ community, currentUser, onEdit }) => {
  const { t } = useTranslation(['communities', 'common']);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Verificar se o usuário pode editar (criador, admin ou moderador)
  const canEdit = currentUser.id === community.creatorId || 
                  currentUser.role === 'admin' || 
                  currentUser.role === 'moderator';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!canEdit) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label={t('communities:communityOptions')}
      >
        <MoreHorizontalIcon />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-lg z-50 overflow-hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
              setIsOpen(false);
            }}
            className="w-full text-left flex items-center space-x-3 px-4 py-3 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <EditIcon />
            <span>{t('common:edit')} {t('communities:title')}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CommunityActionsMenu;

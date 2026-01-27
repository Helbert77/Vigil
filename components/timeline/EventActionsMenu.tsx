import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../icons/Icon';
import { TimelineEvent, User } from '@/types';
import Tooltip from '@/components/common/Tooltip';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from 'react-i18next';

const MoreHorizontalIcon = () => <Icon><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></Icon>;
const TrashIcon = () => <Icon className="h-5 w-5 text-red-500"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></Icon>;
const EditIcon = () => <Icon className="h-5 w-5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></Icon>;

interface EventActionsMenuProps {
  event: TimelineEvent;
  currentUser: User;
  onDelete: (event: TimelineEvent) => void;
  onEdit: (event: TimelineEvent) => void;
}

const EventActionsMenu: React.FC<EventActionsMenuProps> = ({ event, currentUser, onDelete, onEdit }) => {
  const { t } = useTranslation(['timeline', 'common']);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isModerator = currentUser.role && ['admin', 'moderator'].includes(currentUser.role);
  const { addToast } = useToast();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
    setIsOpen(false);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(event);
      setIsDeleteModalOpen(false);
    } catch (error) {
      // Error is handled by the parent component
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = () => {
    onEdit(event);
    setIsOpen(false);
  };

  if (!isModerator) {
    return null;
  }

  return (
    <>
      <div className="relative" ref={menuRef}>
        <Tooltip text={t('timeline:eventActions')} position="bottom">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-haspopup="menu"
            aria-expanded={isOpen}
            aria-label={t('timeline:eventActions')}
          >
            <MoreHorizontalIcon />
          </button>
        </Tooltip>
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-lg z-30">
            {/* Editar Evento */}
            <button
              onClick={handleEditClick}
              className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label={t('timeline:editEvent')}
              role="menuitem"
            >
              <EditIcon />
              <span>{t('timeline:editEvent')}</span>
            </button>

            {/* Excluir Evento */}
            <Tooltip text={t('timeline:deleteEvent')}>
              <button
                onClick={handleDeleteClick}
                className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label={t('timeline:deleteEvent')}
                role="menuitem"
              >
                <TrashIcon />
                <span>{t('timeline:deleteEvent')}</span>
              </button>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('timeline:deleteEventTitle')}
        message={t('timeline:deleteEventMessage', { title: event.title })}
        confirmText={isDeleting ? t('timeline:deleting') : t('timeline:deleteConfirm')}
        cancelText={t('common:cancel')}
        isDestructive={true}
      />
    </>
  );
};

export default EventActionsMenu;
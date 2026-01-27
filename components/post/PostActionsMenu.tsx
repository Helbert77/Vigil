import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../icons/Icon';
import { Post, User } from '@/types';
import Tooltip from '@/components/common/Tooltip';
import ReportModal from '@/src/components/post/ReportModal';
import * as api from '@/src/services/api';
import { useToast } from '@/hooks/useToast';
import { pushHistoryState } from '@/src/utils/history';
import { logger } from '@/src/utils/Logger';
import { useTranslation } from 'react-i18next';

const MoreHorizontalIcon = () => <Icon><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></Icon>;
const TrashIcon = () => <Icon className="h-5 w-5 text-red-500"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></Icon>;
const BlockIcon = () => <Icon className="h-5 w-5 text-red-500"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></Icon>;
const EditIcon = () => <Icon className="h-5 w-5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></Icon>;
const FlagIcon = () => <Icon className="h-5 w-5 text-primary"><path d="M4 4v16"></path><path d="M6 4h10l-2 5 2 5H6z"></path></Icon>;

interface PostActionsMenuProps {
  post: Post;
  currentUser: User;
  onDelete: (postId: string) => void;
  onBlockToggle: (userId: string) => void;
  isBlocked: boolean;
  onEdit: () => void;
  // Opcional: caso queira navegar via callback; se não, usa history push
  onNavigateToModeration?: () => void;
}

const PostActionsMenu: React.FC<PostActionsMenuProps> = ({ post, currentUser, onDelete, onBlockToggle, isBlocked, onEdit, onNavigateToModeration }) => {
  const { t } = useTranslation(['posts', 'common']);
  const [isOpen, setIsOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isCurrentUserPost = post.user.id === currentUser.id;
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

  const handleDelete = () => {
    onDelete(post.id);
    setIsOpen(false);
  };

  const handleBlock = () => {
    onBlockToggle(post.user.id);
    setIsOpen(false);
  };

  const handleEdit = () => {
    onEdit();
    setIsOpen(false);
  };

  const handleOpenReport = () => {
    setIsReportModalOpen(true);
    setIsOpen(false);
  };

  const handleSubmitReport = async (reason: string, notes: string) => {
    try {
      setIsSubmittingReport(true);
      
      const result = await api.createReport({
        reporter_id: currentUser.id,
        content_id: post.id,
        content_type: 'post',
        reason,
        notes: notes || undefined,
      });
      
      if (result.error) {
        // Se for denúncia duplicada, mostrar mensagem específica
        if (result.error.code === 'DUPLICATE_REPORT') {
          addToast(result.error.message || t('posts:alreadyReported'), 'info');
          setIsReportModalOpen(false);
          return;
        }
        throw result.error;
      }
      
      // Feedback de sucesso ao usuário
      addToast(t('posts:reportSubmitted'), 'success');
      setIsReportModalOpen(false);
      logger.info('Denúncia registrada na fila de moderação', { postId: post.id, reportId: result.data?.id }, 'ui', 'PostActionsMenu');
    } catch (err: any) {
      logger.error('Falha ao enviar denúncia', { postId: post.id, error: err }, 'api', 'PostActionsMenu');
      const errorMessage = err?.message || t('posts:reportError');
      addToast(errorMessage, 'error');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <Tooltip text={t('common:moreActions')} position="bottom">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label={t('common:openPostActions')}
        >
          <MoreHorizontalIcon />
        </button>
      </Tooltip>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-lg z-20">
          {/* Editar: apenas autor e plano não-free */}
          {isCurrentUserPost && currentUser.plan !== 'free' && (
            <button
              onClick={handleEdit}
              className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label={t('posts:editPost')}
              role="menuitem"
            >
              <EditIcon />
              <span>{t('posts:editPost')}</span>
            </button>
          )}

          {/* Apagar: visível para o autor do post */}
          {isCurrentUserPost && (
            <Tooltip text={t('posts:deletePost')}>
              <button
                onClick={handleDelete}
                className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label={t('common:deleteMyPost')}
                role="menuitem"
              >
                <TrashIcon />
                <span>{t('common:deleteMyPost')}</span>
              </button>
            </Tooltip>
          )}

          {/* Apagar: exclusivo para admin/moderador (em posts de outros usuários) */}
          {isModerator && !isCurrentUserPost && (
            <Tooltip text={t('posts:deletePost')}>
              <button
                onClick={handleDelete}
                className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label={t('common:deletePost')}
                role="menuitem"
              >
                <TrashIcon />
                <span>{t('common:deletePost')}</span>
              </button>
            </Tooltip>
          )}

          {/* Denunciar: visível para todos */}
          <Tooltip text={t('posts:reportPost')}>
            <button
              onClick={handleOpenReport}
              className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label={t('common:reportPost')}
              role="menuitem"
            >
              <FlagIcon />
              <span>{t('common:reportPost')}</span>
            </button>
          </Tooltip>

          {/* Bloquear autor: somente quando não é o próprio autor */}
          {!isCurrentUserPost && (
            <button
              onClick={handleBlock}
              className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label={isBlocked ? `${t('common:unblock')} @${post.user.username}` : `${t('common:block')} @${post.user.username}`}
              role="menuitem"
            >
              <BlockIcon />
              <span>{isBlocked ? t('common:unblock') : t('common:block')} @{post.user.username}</span>
            </button>
          )}
        </div>
      )}

      {/* Modal de denúncia */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleSubmitReport}
        isSubmitting={isSubmittingReport}
      />
    </div>
  );
};

export default PostActionsMenu;
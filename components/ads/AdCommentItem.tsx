import React, { useState, useEffect, useRef } from 'react';
import { AdComment, User } from '../../types';
import Avatar from '../common/Avatar';
import { Icon } from '../icons/Icon';
import { useToast } from '@/hooks/useToast';
import { EyeIcon } from '../icons/EyeIcon';
import UserLink from '@/components/common/UserLink';
import { renderTextWithMentions } from '@/src/utils/textUtils';
import { VerifiedBadgeIcon } from '@/src/components/icons/VerifiedBadgeIcon';
import { ModeratorBadgeIcon } from '@/src/components/icons/ModeratorBadgeIcon';
import * as api from '@/src/services/api';

const HeartIcon = ({ filled }: { filled: boolean }) => <Icon className={`h-4 w-4 ${filled ? 'text-red-500' : ''}`} fill={filled ? 'currentColor' : 'none'}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></Icon>;
const BookmarkIcon = ({ filled }: { filled: boolean }) => <Icon className={`h-4 w-4 ${filled ? 'text-yellow-500' : ''}`} fill={filled ? 'currentColor' : 'none'}><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></Icon>;
const ShareIcon = () => <Icon className="h-4 w-4"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" x2="12" y1="2" y2="15"></line></Icon>;
const MessageCircleIcon = () => <Icon className="h-4 w-4"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></Icon>;
const MoreHorizontalIcon = () => <Icon className="h-4 w-4"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></Icon>;

interface AdCommentItemProps {
  comment: AdComment;
  currentUser: User;
  onToggleLike?: (commentId: string, isCurrentlyLiked: boolean) => void;
  onToggleSave?: (commentId: string) => void;
  isSaved?: boolean;
  isLiked?: boolean;
  onUpdateComment?: (commentId: string, newText: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onIncrementView?: (commentId: string) => void;
  onViewCommentThread?: (commentId: string) => void;
  repliesCount?: number;
}

const AdCommentItem: React.FC<AdCommentItemProps> = ({ 
  comment, 
  currentUser, 
  onToggleLike,
  onToggleSave,
  isSaved = false,
  isLiked = false,
  onUpdateComment,
  onDeleteComment,
  onIncrementView,
  onViewCommentThread,
  repliesCount = 0
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.content);
  const [showActions, setShowActions] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(comment.likes_count || 0);
  const [localViewsCount, setLocalViewsCount] = useState(comment.views_count || 0);
  const { addToast } = useToast();
  const hasBeenViewed = useRef(false);

  useEffect(() => {
    if (!hasBeenViewed.current && onIncrementView) {
      onIncrementView(comment.id);
      setLocalViewsCount(prev => prev + 1);
      hasBeenViewed.current = true;
    }
  }, [comment.id, onIncrementView]);

  const handleCardClick = () => {
    if (!isEditing && onViewCommentThread) {
      onViewCommentThread(comment.id);
    }
  };

  const handleShare = () => {
    const adUrl = `${window.location.origin}/#ad/${comment.ad_id}`;
    navigator.clipboard.writeText(adUrl).then(() => {
      // Toast removido - ação de copiar é instantânea
    }).catch(() => {
      addToast('Falha ao copiar o link.', 'error');
    });
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleEdit = () => {
    setEditedText(comment.content);
    setIsEditing(true);
    setShowActions(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (editedText.trim() === comment.content) {
      setIsEditing(false);
      return;
    }
    
    const success = await api.updateAdComment(comment.id, editedText);
    if (success) {
      if (onUpdateComment) {
        onUpdateComment(comment.id, editedText);
      }
      // Toast removido - mudança visual já indica sucesso
      setIsEditing(false);
    } else {
      addToast('Erro ao atualizar comentário.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este comentário?')) {
      return;
    }
    
    const success = await api.deleteAdComment(comment.id);
    if (success) {
      if (onDeleteComment) {
        onDeleteComment(comment.id);
      }
      // Toast removido - comentário desaparece visualmente
    } else {
      addToast('Erro ao excluir comentário.', 'error');
    }
    setShowActions(false);
  };

  const handleLikeClick = () => {
    if (onToggleLike) {
      onToggleLike(comment.id, isLiked);
      setLocalLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    }
  };

  const isCurrentUser = comment.user?.id === currentUser.id;
  const commentUser = comment.user || {
    id: '',
    username: 'user',
    name: 'Usuário',
    avatar_url: undefined
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div 
      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-card/50 rounded-lg p-2 -m-2"
      onClick={handleCardClick}
      role="button"
      tabIndex={isEditing ? -1 : 0}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (!isEditing && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          if (onViewCommentThread) {
            onViewCommentThread(comment.id);
          }
        }
      }}
    >
      <div className="flex items-start space-x-3">
        <Avatar 
          src={commentUser.avatar_url} 
          alt={commentUser.name} 
          size="sm" 
          userId={commentUser.id}
          showStatus={true}
        />
        
        <div className="flex-1">
          {/* Fundo escuro para o conteúdo do comentário */}
          <div className="bg-light-bg dark:bg-dark-bg p-3 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <div className="flex items-center gap-1">
                  <UserLink userId={commentUser.id}>
                    <p className="font-bold text-sm">{commentUser.name}</p>
                  </UserLink>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">@{commentUser.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">· {formatDate(comment.created_at)}</p>
              </div>
              
              {isCurrentUser && !isEditing && (
                <div onClick={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowActions(!showActions);
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <MoreHorizontalIcon />
                    </button>
                    
                    {showActions && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-light-border dark:border-dark-border z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit();
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete();
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-red-600 dark:text-red-400"
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="mt-2">
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                  rows={3}
                  autoFocus
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button onClick={(e) => handleActionClick(e, handleCancelEdit)} className="text-sm font-bold py-1 px-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-300">Cancelar</button>
                  <button onClick={(e) => handleActionClick(e, handleSaveEdit)} className="bg-primary text-white text-sm font-bold py-1 px-3 rounded-full hover:bg-gray-600">Salvar</button>
                </div>
              </div>
            ) : (
              <>
                {comment.content && <p className="text-sm mt-1 whitespace-pre-wrap text-gray-900 dark:text-gray-200">{renderTextWithMentions(comment.content)}</p>}
                {comment.image_url && (
                  <img src={comment.image_url} alt="Comment media" className="mt-2 rounded-lg max-h-64 w-full object-cover" />
                )}
              </>
            )}
          </div>
          
          {/* Botões FORA do fundo escuro */}
          {!isEditing && (
            <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              {onViewCommentThread && (
                <button
                  onClick={(e) => handleActionClick(e, () => onViewCommentThread(comment.id))}
                  className="flex items-center space-x-1 hover:text-blue-500"
                  aria-label="Responder"
                >
                  <MessageCircleIcon />
                  <span>{repliesCount}</span>
                </button>
              )}

              {onToggleLike && (
                <button
                  onClick={(e) => handleActionClick(e, handleLikeClick)}
                  className="flex items-center space-x-1 hover:text-red-500"
                >
                  <HeartIcon filled={isLiked} />
                  <span>{localLikesCount}</span>
                </button>
              )}

              <button
                onClick={(e) => handleActionClick(e, handleShare)}
                className="flex items-center space-x-1 hover:text-green-500"
              >
                <ShareIcon />
              </button>

              {onToggleSave && (
                <button
                  onClick={(e) => handleActionClick(e, () => onToggleSave(comment.id))}
                  className="flex items-center space-x-1 hover:text-yellow-500"
                >
                  <BookmarkIcon filled={isSaved} />
                </button>
              )}

              <div className="flex items-center space-x-1">
                <EyeIcon className="h-4 w-4" />
                <span>{localViewsCount}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(AdCommentItem);


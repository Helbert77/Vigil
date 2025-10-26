import React, { useState, useEffect, useRef } from 'react';
import { Comment, User } from '../../types';
import Avatar from '../common/Avatar';
import { Icon } from '../icons/Icon';
import { useToast } from '@/hooks/useToast';
import { EyeIcon } from '../icons/EyeIcon';
import CreateComment from './CreateComment';
import UserLink from '@/components/common/UserLink';
import CommentActionsMenu from './CommentActionsMenu';
import ConfirmationModal from '../common/ConfirmationModal';
import { renderTextWithMentions } from '@/src/utils/textUtils';
import { VerifiedBadgeIcon } from '@/src/components/icons/VerifiedBadgeIcon';
import { ModeratorBadgeIcon } from '@/src/components/icons/ModeratorBadgeIcon';

const HeartIcon = ({ filled }: { filled: boolean }) => <Icon className={`h-4 w-4 ${filled ? 'text-red-500' : ''}`} fill={filled ? 'currentColor' : 'none'}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></Icon>;
const BookmarkIcon = ({ filled }: { filled: boolean }) => <Icon className={`h-4 w-4 ${filled ? 'text-yellow-500' : ''}`} fill={filled ? 'currentColor' : 'none'}><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></Icon>;
const ShareIcon = () => <Icon className="h-4 w-4"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" x2="12" y1="2" y2="15"></line></Icon>;
const MessageCircleIcon = () => <Icon className="h-4 w-4"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></Icon>;

interface CommentItemProps {
  comment: Comment;
  postId: string;
  currentUser: User;
  onAddComment: (postId: string, commentText: string, imageUrl?: string, parentCommentId?: string) => void;
  onToggleLike: (commentId: string, postId: string, isCurrentlyLiked: boolean) => void;
  onToggleSave: (commentId: string) => void;
  isSaved: boolean;
  onIncrementView: (id: string) => void;
  onViewCommentThread: (commentId: string) => void;
  shareableUsers: User[];
  followedUserIds: string[];
  onViewProfile: (userId: string) => void;
  onFollowToggle: (userId: string) => void;
  onOpenFollowModal: (user: User, tab: 'followers' | 'following') => void;
  onUpdateComment: (commentId: string, newText: string) => void;
  onDeleteComment: (commentId: string) => void;
  allUsers: User[];
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, postId, currentUser, onAddComment, onToggleLike, onToggleSave, isSaved, onIncrementView, onViewCommentThread, followedUserIds, onViewProfile, onFollowToggle, onOpenFollowModal, onUpdateComment, onDeleteComment, allUsers }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.text);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { addToast } = useToast();
  const hasBeenViewed = useRef(false);

  useEffect(() => {
    if (!hasBeenViewed.current) {
      onIncrementView(comment.id);
      hasBeenViewed.current = true;
    }
  }, [comment.id, onIncrementView]);

  const handleShare = () => {
    const postUrl = `${window.location.origin}/#post/${postId}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      addToast('Link para o post copiado!', 'success');
    }).catch(() => {
      addToast('Falha ao copiar o link.', 'error');
    });
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleEdit = () => {
    setEditedText(comment.text);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (editedText.trim() === comment.text) {
      setIsEditing(false);
      return;
    }
    onUpdateComment(comment.id, editedText);
    setIsEditing(false);
  };

  const confirmDelete = () => {
    onDeleteComment(comment.id);
    setIsDeleteModalOpen(false);
  };

  const isFollowing = followedUserIds.includes(comment.user.id);
  const isCurrentUser = comment.user.id === currentUser.id;

  return (
    <>
      <div 
        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-card/50 rounded-lg p-2 -m-2"
        onClick={() => !isEditing && onViewCommentThread(comment.id)}
        role="button"
        tabIndex={isEditing ? -1 : 0}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (!isEditing && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onViewCommentThread(comment.id);
          }
        }}
      >
        <div className="flex items-start space-x-3">
          <Avatar src={comment.user.avatarUrl} alt={comment.user.name} size="sm" userId={comment.user.id} showStatus={true} />
          <div className="flex-1">
            <div className="bg-light-bg dark:bg-dark-bg p-3 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center gap-1">
                    <UserLink
                      user={comment.user}
                      isFollowing={isFollowing}
                      onFollowToggle={onFollowToggle}
                      onViewProfile={onViewProfile}
                      isCurrentUser={isCurrentUser}
                      onOpenFollowModal={onOpenFollowModal}
                    >
                      <p className="font-bold text-sm">{comment.user.name}</p>
                    </UserLink>
                    {(comment.user.plan === 'pro' || comment.user.plan === 'premium') && <VerifiedBadgeIcon plan={comment.user.plan} className="h-4 w-4" />}
                    {comment.user.role && ['admin', 'moderator'].includes(comment.user.role) && <ModeratorBadgeIcon className="h-4 w-4" />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">@{comment.user.username}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">· {new Date(comment.timestamp).toLocaleString()}</p>
                </div>
                {isCurrentUser && !isEditing && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <CommentActionsMenu 
                      comment={comment}
                      currentUser={currentUser}
                      onEdit={handleEdit}
                      onDelete={() => setIsDeleteModalOpen(true)}
                    />
                  </div>
                )}
              </div>
              {isEditing ? (
                <div className="mt-2">
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="w-full bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button onClick={(e) => handleActionClick(e, handleCancelEdit)} className="text-sm font-bold py-1 px-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">Cancelar</button>
                    <button onClick={(e) => handleActionClick(e, handleSaveEdit)} className="bg-primary text-white text-sm font-bold py-1 px-3 rounded-full hover:bg-gray-600">Salvar</button>
                  </div>
                </div>
              ) : (
                <>
                  {comment.text && <p className="text-sm mt-1 whitespace-pre-wrap">{renderTextWithMentions(comment.text, allUsers, currentUser, followedUserIds, onFollowToggle, onViewProfile, onOpenFollowModal)}</p>}
                  {comment.imageUrl && (
                    <img src={comment.imageUrl} alt="Comment media" className="mt-2 rounded-lg max-h-64 w-full object-cover" />
                  )}
                </>
              )}
            </div>
            {!isEditing && (
              <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <button
                  onClick={(e) => handleActionClick(e, () => setIsReplying(!isReplying))}
                  className="flex items-center space-x-1 hover:text-blue-500"
                  aria-label="Responder"
                >
                  <MessageCircleIcon />
                  <span>{comment.replies?.length || 0}</span>
                </button>
                <button onClick={(e) => handleActionClick(e, () => onToggleLike(comment.id, postId, !!comment.liked_by_user))} className="flex items-center space-x-1 hover:text-red-500">
                  <HeartIcon filled={!!comment.liked_by_user} />
                  <span>{comment.likes}</span>
                </button>
                <button onClick={(e) => handleActionClick(e, handleShare)} className="flex items-center space-x-1 hover:text-green-500">
                  <ShareIcon />
                </button>
                <button onClick={(e) => handleActionClick(e, () => onToggleSave(comment.id))} className="flex items-center space-x-1 hover:text-yellow-500">
                  <BookmarkIcon filled={isSaved} />
                </button>
                <div className="flex items-center space-x-1">
                  <EyeIcon className="h-4 w-4" />
                  <span>{comment.views}</span>
                </div>
              </div>
            )}

            {isReplying && (
              <div className="mt-2" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                <CreateComment
                  user={currentUser}
                  postId={postId}
                  onAddComment={onAddComment}
                  parentCommentId={comment.id}
                  onCancelReply={() => setIsReplying(false)}
                  replyingToUsername={comment.user.username}
                  allUsers={allUsers}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Apagar Comentário?"
        message="Esta ação é irreversível. Você tem certeza de que deseja apagar este comentário permanentemente?"
        confirmText="Sim, apagar"
        isDestructive={true}
      />
    </>
  );
};

export default CommentItem;
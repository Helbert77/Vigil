import React, { useState, useEffect } from 'react';
import { Post, User, Comment } from '../types';
import PostCard from '../components/post/PostCard';
import { Icon } from '../components/icons/Icon';
import Card from '../components/common/Card';
import CreateComment from '../components/post/CreateComment';
import CommentItem from '../components/post/CommentItem';
import { useTranslation } from 'react-i18next';

const ArrowLeftIcon = () => <Icon><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></Icon>;

interface PostDetailProps {
  post: Post;
  activeCommentId?: string | null;
  onUpdatePost: (postId: string, updates: Partial<Post>) => void;
  savedPostIds: string[];
  onToggleSave: (postId: string) => void;
  onNavigateBack: () => void; // Este é o 'voltar para a página anterior' do App.tsx
  user: User;
  onAddComment: (postId: string, commentText: string, imageUrl?: string, parentCommentId?: string) => void;
  onToggleLike: (postId: string, isCurrentlyLiked: boolean) => void;
  onToggleCommentLike: (commentId: string, postId: string, isCurrentlyLiked: boolean) => void;
  onToggleSaveComment: (commentId: string) => void;
  savedCommentIds: string[];
  pageTitle?: string;
  onIncrementView: (type: 'post' | 'comment', id: string) => void;
  onViewPost: (postId: string) => void;
  onViewCommentThread: (commentId: string) => void; // Este prop ainda é usado para atualizar o estado global em App.tsx
  onDeletePost: (postId: string) => void;
  onBlockToggle: (userId: string) => void;
  blockedUserIds: string[];
  shareableUsers: User[];
  onSendMessage: (params: { targetUserId: string, text: string }) => void;
  followedUserIds: string[];
  onViewProfile: (userId: string) => void;
  onFollowToggle: (userId: string) => void;
  onOpenFollowModal: (user: User, tab: 'followers' | 'following') => void;
  onVoteOnPoll: (postId: string, optionIndex: number) => void;
  onUpdateComment: (commentId: string, newText: string) => void;
  onDeleteComment: (commentId: string) => void;
  allUsers: User[];
  onDeleteCommentReply?: (commentId: string, replyId: string) => void;
  onReportContent?: (contentId: string, contentType: 'post' | 'comment', reason: string) => void;
}

const findCommentAndParents = (comments: Comment[], targetId: string): { target: Comment | null, parents: Comment[] } => {
  let target: Comment | null = null;
  const parents: Comment[] = [];

  const search = (commentsToSearch: Comment[], currentPath: Comment[]): boolean => {
    for (const comment of commentsToSearch) {
      if (comment.id === targetId) {
        target = comment;
        parents.push(...currentPath);
        return true;
      }
      if (comment.replies && comment.replies.length > 0) {
        if (search(comment.replies, [...currentPath, comment])) {
          return true;
        }
      }
    }
    return false;
  };

  search(comments, []);
  return { target, parents };
};

const PostDetail: React.FC<PostDetailProps> = ({ 
  post, 
  activeCommentId, // Este é o ID do comentário que App.tsx quer focar
  onUpdatePost, savedPostIds, onToggleSave, 
  onNavigateBack, // Esta é a função "voltar para a página anterior" do App.tsx
  user, onAddComment, onToggleLike, onToggleCommentLike, onToggleSaveComment, savedCommentIds, pageTitle = 'Post', onIncrementView, onViewPost, 
  onDeletePost, onBlockToggle, blockedUserIds, shareableUsers, onSendMessage,
  followedUserIds, onViewProfile, onFollowToggle, onOpenFollowModal, onVoteOnPoll,
  onUpdateComment, onDeleteComment, allUsers
}) => {
  const { t } = useTranslation(['posts', 'common']);
  // Estado interno para gerenciar o comentário atualmente focado dentro desta instância de PostDetail
  const [currentInternalFocusCommentId, setCurrentInternalFocusCommentId] = useState<string | null>(activeCommentId || null);

  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  // Rola para o topo sempre que o post principal mudar
  useEffect(() => {
    scrollToTop();
  }, [post.id]);

  // Atualiza o foco interno quando o prop de App.tsx muda
  useEffect(() => {
    setCurrentInternalFocusCommentId(activeCommentId || null);
  }, [activeCommentId]);

  const { target: focusComment, parents: contextComments } = currentInternalFocusCommentId ? findCommentAndParents(post.comments, currentInternalFocusCommentId) : { target: null, parents: [] };

  const handleBackButtonClick = () => {
    if (currentInternalFocusCommentId) {
      // Se houver comentários pai na thread atual, volte para o pai imediato
      if (contextComments.length > 0) {
        setCurrentInternalFocusCommentId(contextComments[contextComments.length - 1].id);
      } else {
        // Se o comentário em foco atual for um comentário raiz, volte para a visualização do post principal
        setCurrentInternalFocusCommentId(null);
      }
    } else {
      // Se nenhum comentário estiver em foco, chame o onNavigateBack externo para voltar à página anterior
      onNavigateBack();
    }
  };

  // Esta função será passada para os componentes CommentItem
  const handleViewCommentThreadInternal = (commentId: string) => {
    setCurrentInternalFocusCommentId(commentId);
  };

  const mainContent = focusComment ? (
    <CommentItem
      comment={focusComment}
      postId={post.id}
      currentUser={user}
      onAddComment={onAddComment}
      onToggleLike={onToggleCommentLike}
      onToggleSave={onToggleSaveComment}
      isSaved={savedCommentIds.includes(focusComment.id)}
      onIncrementView={(id) => onIncrementView('comment', id)}
      onViewCommentThread={handleViewCommentThreadInternal} // Passa o manipulador interno
      shareableUsers={shareableUsers}
      followedUserIds={followedUserIds}
      onViewProfile={onViewProfile}
      onFollowToggle={onFollowToggle}
      onOpenFollowModal={onOpenFollowModal}
      onUpdateComment={onUpdateComment}
      onDeleteComment={onDeleteComment}
      allUsers={allUsers}
    />
  ) : (
    <PostCard
      post={post}
      onUpdatePost={onUpdatePost}
      isSaved={savedPostIds.includes(post.id)}
      onToggleSave={onToggleSave}
      user={user}
      onToggleLike={onToggleLike}
      onIncrementView={onIncrementView}
      onViewPost={onViewPost} // Isso é para clicar no cartão do post principal para ir para seu próprio detalhe
      onDeletePost={onDeletePost}
      onBlockToggle={onBlockToggle}
      blockedUserIds={blockedUserIds}
      isClickable={false}
      shareableUsers={shareableUsers}
      onSendMessage={onSendMessage}
      followedUserIds={followedUserIds}
      onViewProfile={onViewProfile}
      onFollowToggle={onFollowToggle}
      onOpenFollowModal={onOpenFollowModal}
      onMediaLoad={scrollToTop} // Adiciona o callback para rolar após o carregamento da mídia
      onVoteOnPoll={onVoteOnPoll}
      allUsers={allUsers}
    />
  );

  const commentsToShow = focusComment ? (focusComment.replies || []) : post.comments;
  const parentIdForNewComments = focusComment ? focusComment.id : undefined;
  const replyingToUsername = focusComment ? focusComment.user.username : post.user.username;

  return (
    <div>
      <div className="flex items-center mb-4">
        <button onClick={handleBackButtonClick} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Go back">
          <ArrowLeftIcon />
        </button>
        <h1 className="text-xl font-bold ml-4">{pageTitle}</h1>
      </div>

      {contextComments.map((comment, index) => (
        <div key={comment.id} className="pl-4 border-l-2 border-light-border dark:border-dark-border ml-5 mb-2">
          <CommentItem
            comment={comment}
            postId={post.id}
            currentUser={user}
            onAddComment={onAddComment}
            onToggleLike={onToggleCommentLike}
            onToggleSave={onToggleSaveComment}
            isSaved={savedCommentIds.includes(comment.id)}
            onIncrementView={(id) => onIncrementView('comment', id)}
            onViewCommentThread={handleViewCommentThreadInternal} // Passa o manipulador interno
            shareableUsers={shareableUsers}
            followedUserIds={followedUserIds}
            onViewProfile={onViewProfile}
            onFollowToggle={onFollowToggle}
            onOpenFollowModal={onOpenFollowModal}
            onUpdateComment={onUpdateComment}
            onDeleteComment={onDeleteComment}
            allUsers={allUsers}
          />
        </div>
      ))}
      
      <div className={contextComments.length > 0 ? "pl-4 border-l-2 border-light-border dark:border-dark-border ml-5" : ""}>
        {mainContent}
      </div>

      <Card className="mt-6">
        <div className="p-4">
          <CreateComment 
            user={user}
            postId={post.id}
            onAddComment={onAddComment}
            parentCommentId={parentIdForNewComments}
            replyingToUsername={replyingToUsername}
            allUsers={allUsers}
          />
        </div>
        <div className="space-y-4 p-4 border-t border-light-border dark:border-dark-border">
            {commentsToShow.length > 0 ? (
              commentsToShow.map((comment: Comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  postId={post.id}
                  currentUser={user}
                  onAddComment={onAddComment}
                  onToggleLike={onToggleCommentLike}
                  onToggleSave={onToggleSaveComment}
                  isSaved={savedCommentIds.includes(comment.id)}
                  onIncrementView={(id) => onIncrementView('comment', id)}
                  onViewCommentThread={handleViewCommentThreadInternal} // Passa o manipulador interno
                  shareableUsers={shareableUsers}
                  followedUserIds={followedUserIds}
                  onViewProfile={onViewProfile}
                  onFollowToggle={onFollowToggle}
                  onOpenFollowModal={onOpenFollowModal}
                  onUpdateComment={onUpdateComment}
                  onDeleteComment={onDeleteComment}
                  allUsers={allUsers}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{t('posts:noCommentsYet')}</p>
            )}
        </div>
      </Card>
    </div>
  );
};

export default PostDetail;
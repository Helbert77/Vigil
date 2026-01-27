import React, { useState, useEffect } from 'react';
import { Ad, User, AdComment } from '../types';
import AdCard from '../components/ads/AdCard';
import { Icon } from '../components/icons/Icon';
import Card from '../components/common/Card';
import CreateAdComment from '../components/ads/CreateAdComment';
import AdCommentItem from '../components/ads/AdCommentItem';
import { useToast } from '../hooks/useToast';
import * as api from '../src/services/api';
import { useTranslation } from 'react-i18next';

const ArrowLeftIcon = () => <Icon><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></Icon>;

interface AdDetailProps {
  ad: Ad;
  activeCommentId?: string | null;
  onNavigateBack: () => void;
  user: User;
  isLiked: boolean;
  isSaved: boolean;
  onToggleLike: (adId: string, isCurrentlyLiked: boolean) => void;
  onToggleSave: (adId: string, isCurrentlySaved: boolean) => void;
  onHideAd: (adId: string) => void;
  onIncrementShares: (adId: string) => void;
  onIncrementViews: (adId: string) => void;
  onTrackMetric: (adId: string, eventType: 'impression' | 'click' | 'like' | 'share' | 'save') => void;
  shareableUsers: User[];
  onSendMessage?: (params: { targetUserId: string, text: string }) => void;
  allUsers: User[];
}

// Função para encontrar um comentário e seus pais na árvore
const findCommentAndParents = (comments: AdComment[], targetId: string): { target: AdComment | null, parents: AdComment[] } => {
  let target: AdComment | null = null;
  const parents: AdComment[] = [];

  const search = (commentsToSearch: AdComment[], currentPath: AdComment[]): boolean => {
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

const AdDetail: React.FC<AdDetailProps> = ({
  ad,
  activeCommentId,
  onNavigateBack,
  user,
  isLiked,
  isSaved,
  onToggleLike,
  onToggleSave,
  onHideAd,
  onIncrementShares,
  onIncrementViews,
  onTrackMetric,
  shareableUsers,
  onSendMessage,
  allUsers,
}) => {
  const { t } = useTranslation(['ads', 'common']);
  const [comments, setComments] = useState<AdComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([]);
  const [savedCommentIds, setSavedCommentIds] = useState<string[]>([]);
  const [currentInternalFocusCommentId, setCurrentInternalFocusCommentId] = useState<string | null>(activeCommentId || null);
  const { addToast } = useToast();

  // Buscar IDs de comentários curtidos e salvos
  useEffect(() => {
    const fetchInteractions = async () => {
      const [liked, saved] = await Promise.all([
        api.fetchLikedAdCommentIds(user.id),
        api.fetchSavedAdCommentIds(user.id)
      ]);
      setLikedCommentIds(liked);
      setSavedCommentIds(saved);
    };

    fetchInteractions();
  }, [user.id]);

  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    scrollToTop();
  }, [ad.id]);

  // Atualiza o foco interno quando o prop de App.tsx muda
  useEffect(() => {
    setCurrentInternalFocusCommentId(activeCommentId || null);
  }, [activeCommentId]);

  const { target: focusComment, parents: contextComments } = currentInternalFocusCommentId 
    ? findCommentAndParents(comments, currentInternalFocusCommentId) 
    : { target: null, parents: [] };

  const handleBackButtonClick = () => {
    if (currentInternalFocusCommentId) {
      // Se houver comentários pai na thread atual, volte para o pai imediato
      if (contextComments.length > 0) {
        setCurrentInternalFocusCommentId(contextComments[contextComments.length - 1].id);
      } else {
        // Se o comentário em foco atual for um comentário raiz, volte para a visualização do anúncio principal
        setCurrentInternalFocusCommentId(null);
      }
    } else {
      // Se nenhum comentário estiver em foco, chame o onNavigateBack externo para voltar à página anterior
      onNavigateBack();
    }
  };

  // Esta função será passada para os componentes AdCommentItem
  const handleViewCommentThreadInternal = (commentId: string) => {
    setCurrentInternalFocusCommentId(commentId);
    scrollToTop();
  };

  // Buscar comentários do anúncio
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoadingComments(true);
      
      const result = await api.fetchAdComments(ad.id);
      
      if (result.error) {
        addToast(t('common:error'), 'error');
      } else {
        setComments(result.data || []);
      }
      
      setIsLoadingComments(false);
    };

    fetchComments();
  }, [ad.id, addToast, t]);

  const handleAddComment = async (commentText: string, imageUrl?: string, parentCommentId?: string) => {
    const result = await api.createAdComment({
      ad_id: ad.id,
      user_id: user.id,
      content: commentText,
      image_url: imageUrl,
      parent_comment_id: parentCommentId,
    });

    if (result.error) {
      addToast(t('common:error'), 'error');
    } else {
      const newComment: AdComment = {
        ...result.data,
        user: {
          id: user.id,
          username: user.username,
          name: user.name || user.username,
          avatar_url: user.avatarUrl,
        },
        replies: [],
      };
      
      if (parentCommentId) {
        // Se for uma resposta, adicionar à lista de replies do comentário pai
        const updateReplies = (comments: AdComment[]): AdComment[] => {
          return comments.map(comment => {
            if (comment.id === parentCommentId) {
              return {
                ...comment,
                replies: [newComment, ...(comment.replies || [])]
              };
            }
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateReplies(comment.replies)
              };
            }
            return comment;
          });
        };
        setComments(updateReplies(comments));
      } else {
        // Se for um comentário raiz, adicionar ao início da lista
        setComments([newComment, ...comments]);
      }
      
      // Toast removido - comentário aparece na lista
      
      // Atualizar contador de comentários
      if (ad.comments !== undefined) {
        ad.comments = ad.comments + 1;
      }
    }
  };

  const handleToggleCommentLike = async (commentId: string, isCurrentlyLiked: boolean) => {
    const result = await api.toggleAdCommentLike(commentId, user.id);
    
    if (result.success) {
      if (result.isLiked) {
        setLikedCommentIds([...likedCommentIds, commentId]);
      } else {
        setLikedCommentIds(likedCommentIds.filter(id => id !== commentId));
      }
    } else {
      addToast(t('common:error'), 'error');
    }
  };

  const handleToggleCommentSave = async (commentId: string) => {
    const isCurrentlySaved = savedCommentIds.includes(commentId);
    const result = await api.toggleSaveAdComment(commentId, user.id);
    
    if (result.success) {
      if (result.isSaved) {
        setSavedCommentIds([...savedCommentIds, commentId]);
        // Toast removido - ícone muda visualmente
      } else {
        setSavedCommentIds(savedCommentIds.filter(id => id !== commentId));
        // Toast removido - ícone muda visualmente
      }
    } else {
      addToast(t('common:error'), 'error');
    }
  };

  const handleIncrementCommentView = async (commentId: string) => {
    await api.incrementAdCommentViews(commentId);
  };

  const handleUpdateComment = (commentId: string, newText: string) => {
    setComments(comments.map(c => 
      c.id === commentId ? { ...c, content: newText, updated_at: new Date().toISOString() } : c
    ));
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter(c => c.id !== commentId));
    
    // Atualizar contador de comentários
    if (ad.comments !== undefined && ad.comments > 0) {
      ad.comments = ad.comments - 1;
    }
  };

  // Função auxiliar para contar replies recursivamente
  const countReplies = (comment: AdComment): number => {
    if (!comment.replies || comment.replies.length === 0) return 0;
    return comment.replies.length + comment.replies.reduce((sum, reply) => sum + countReplies(reply), 0);
  };

  // Função auxiliar para renderizar comentários recursivamente
  const renderComment = (comment: AdComment, depth: number = 0) => {
    return (
      <div key={comment.id}>
        <AdCommentItem
          comment={comment}
          currentUser={user}
          onToggleLike={handleToggleCommentLike}
          onToggleSave={handleToggleCommentSave}
          isLiked={likedCommentIds.includes(comment.id)}
          isSaved={savedCommentIds.includes(comment.id)}
          onUpdateComment={handleUpdateComment}
          onDeleteComment={handleDeleteComment}
          onIncrementView={handleIncrementCommentView}
          onViewCommentThread={handleViewCommentThreadInternal}
          repliesCount={countReplies(comment)}
        />
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-6 mt-2 space-y-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center mb-4">
        <button 
          onClick={handleBackButtonClick} 
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" 
          aria-label={t('common:goBack')}
        >
          <ArrowLeftIcon />
        </button>
        <h1 className="text-xl font-bold ml-4 text-gray-900 dark:text-white">
          {focusComment ? t('ads:commentThread') : t('ads:adDetail')}
        </h1>
      </div>

      {/* Mostrar o anúncio apenas se não estivermos focados em um comentário */}
      {!focusComment && (
        <AdCard
          ad={ad}
          user={user}
          onTrackMetric={onTrackMetric}
          shareableUsers={shareableUsers}
          onSendMessage={onSendMessage}
          isLiked={isLiked}
          isSaved={isSaved}
          onToggleLike={onToggleLike}
          onToggleSave={onToggleSave}
          onHideAd={onHideAd}
          onIncrementShares={onIncrementShares}
          onIncrementViews={onIncrementViews}
        />
      )}

      {/* Se houver um comentário focado, mostrar contexto */}
      {focusComment && contextComments.length > 0 && (
        <Card className="mb-4">
          <div className="p-4 space-y-4">
            {contextComments.map((contextComment) => (
              <AdCommentItem
                key={contextComment.id}
                comment={contextComment}
                currentUser={user}
                onToggleLike={handleToggleCommentLike}
                onToggleSave={handleToggleCommentSave}
                isLiked={likedCommentIds.includes(contextComment.id)}
                isSaved={savedCommentIds.includes(contextComment.id)}
                onUpdateComment={handleUpdateComment}
                onDeleteComment={handleDeleteComment}
                onIncrementView={handleIncrementCommentView}
                onViewCommentThread={handleViewCommentThreadInternal}
                repliesCount={countReplies(contextComment)}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Comentário focado ou lista de comentários */}
      <Card className="mt-6">
        <div className="p-4">
          <CreateAdComment 
            user={user}
            adId={ad.id}
            onAddComment={(text, imageUrl) => handleAddComment(text, imageUrl, focusComment?.id)}
            allUsers={allUsers}
            placeholder={focusComment ? t('ads:addReply') : t('ads:addComment')}
          />
        </div>
        <div className="space-y-4 p-4 border-t border-light-border dark:border-dark-border">
          {isLoadingComments ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{t('ads:loadingComments')}</p>
          ) : focusComment ? (
            // Modo thread: mostrar o comentário focado e suas respostas
            <div>
              {renderComment(focusComment)}
            </div>
          ) : comments.length > 0 ? (
            // Modo normal: mostrar todos os comentários raiz
            comments.map((comment: AdComment) => renderComment(comment))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{t('ads:noCommentsStart')}</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdDetail;
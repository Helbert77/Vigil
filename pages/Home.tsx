import React, { useMemo } from 'react';
import CreatePost from '@/src/components/post/CreatePost';
import PostCard from '../components/post/PostCard';
import AdCard from '../components/ads/AdCard';
import Card from '../components/common/Card';
import { Post, Poll, User, Community, EvidenceItem, TrendingTopic } from '../types';
import { useAdsWithState, useAdTracking } from '../src/hooks/useAdsWithState';
import { useAdInteractions } from '../src/hooks/useAdInteractions';
import { injectAdsIntoPosts } from '../src/utils/adFrequency';
import { isAd } from '../src/utils/typeGuards';

interface HomeProps {
  posts: Post[];
  onFollowToggle: (userId: string) => void;
  onToggleLike: (postId: string, isCurrentlyLiked: boolean) => void;
  onToggleSave: (postId: string) => void;
  onAddComment: (postId: string, content: string, parentId?: string) => void;
  onUpdateComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onToggleCommentLike: (commentId: string, postId: string, isCurrentlyLiked: boolean) => void;
  onVoteOnPoll: (postId: string, optionIndex: number) => void;
  onViewPost: (postId: string) => void;
  onViewProfile: (userId: string) => void;
  onOpenFollowModal: (user: User, tab: 'followers' | 'following') => void;
  onIncrementView: (type: 'post' | 'comment', id: string) => void;
  onAddPost: (text: string, imageUrl?: string, videoUrl?: string, audioUrl?: string, poll?: Poll, communityId?: string, evidenceBoard?: EvidenceItem[], media_is_sensitive?: boolean) => void;
  onUpdatePost: (postId: string, updates: Partial<Post>) => void;
  onDeletePost: (postId: string) => void;
  usersToFollow: User[];
  trendingTopics: TrendingTopic[];
  onJoinCommunity: (communityId: string) => void;
  onViewCommunity: (communityId: string) => void;
  onViewTag: (tag: string) => void;
  onNavigateToAdvancedSearch: (query: string) => void;
  onBlockToggle: (userId: string) => void;
  savedPostIds: string[];
  user: User;
  communities: Community[];
  joinedCommunityIds: string[];
  blockedUserIds: string[];
  shareableUsers: User[];
  onSendMessage: (params: { targetUserId: string, text: string }) => void;
  followedUserIds: string[];
  allUsers: User[];
  setCurrentPage: (page: any) => void;
}

const Home: React.FC<HomeProps> = ({ posts, onAddPost, onUpdatePost, savedPostIds, onToggleSave, user, communities, joinedCommunityIds, onToggleLike, onIncrementView, onViewPost, onDeletePost, onBlockToggle, blockedUserIds, shareableUsers, onSendMessage, followedUserIds, onViewProfile, onFollowToggle, onOpenFollowModal, onVoteOnPoll, allUsers, setCurrentPage, onAddComment, onUpdateComment, onDeleteComment, onToggleCommentLike, onViewAd }) => {
  // Buscar anúncios ativos com estado local
  const { 
    ads, 
    isLoading: isLoadingAds, 
    updateAdLikes, 
    updateAdShares, 
    updateAdViews 
  } = useAdsWithState('main', undefined, user.id);
  
  // Hook para rastrear métricas de anúncios
  const trackAdMetric = useAdTracking(user.id, user.plan, 'main');

  // Hook para gerenciar interações com anúncios (com callbacks de atualização otimista)
  const {
    likedAdIds,
    savedAdIds,
    hiddenAdIds,
    toggleAdLike,
    toggleAdSave,
    hideAd,
    incrementAdShares,
    incrementAdViews,
  } = useAdInteractions(user.id, updateAdLikes, updateAdShares);

  // Mesclar posts com anúncios baseado no plano do usuário
  // IMPORTANTE: Passa user.id para incluir anúncios próprios
  const feedItems = useMemo(() => {
    const allAds = ads.filter(ad => !hiddenAdIds.includes(ad.id));
    return injectAdsIntoPosts(posts, allAds, user.plan, user.role, user.id);
  }, [posts, ads, user.plan, user.role, user.id, hiddenAdIds]);

  return (
    <div>
      <CreatePost onAddPost={onAddPost} user={user} communities={communities} joinedCommunityIds={joinedCommunityIds} allUsers={allUsers} setCurrentPage={setCurrentPage} />
      
      <div>
        {feedItems.length > 0 ? feedItems.map((item, index) => {
          // Verificar se é um anúncio ou post
          if (isAd(item)) {
            return (
              <AdCard
                key={`ad-${item.id}-${index}`}
                ad={item}
                user={user}
                onTrackMetric={trackAdMetric}
                shareableUsers={shareableUsers}
                onSendMessage={onSendMessage}
                isLiked={likedAdIds.includes(item.id)}
                isSaved={savedAdIds.includes(item.id)}
                onToggleLike={toggleAdLike}
                onToggleSave={toggleAdSave}
                onHideAd={hideAd}
                onIncrementShares={incrementAdShares}
                onIncrementViews={incrementAdViews}
                onViewAd={onViewAd}
              />
            );
          } else {
            return (
              <PostCard 
                key={`post-${item.id}-${index}`} 
                post={item} 
                onUpdatePost={onUpdatePost} 
                isSaved={savedPostIds.includes(item.id)}
                onToggleSave={onToggleSave}
                user={user}
                onToggleLike={onToggleLike}
                onIncrementView={onIncrementView}
                onViewPost={onViewPost}
                onDeletePost={onDeletePost}
                onBlockToggle={onBlockToggle}
                blockedUserIds={blockedUserIds}
                shareableUsers={shareableUsers}
                onSendMessage={onSendMessage}
                followedUserIds={followedUserIds}
                onViewProfile={onViewProfile}
                onFollowToggle={onFollowToggle}
                onOpenFollowModal={onOpenFollowModal}
                onVoteOnPoll={onVoteOnPoll}
                allUsers={allUsers}
              />
            );
          }
        }) : (
          <Card>
            <p className="text-center text-gray-500 dark:text-gray-400 p-4">
              No posts yet. Be the first to uncover the truth!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Home;
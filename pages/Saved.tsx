import React, { useMemo } from 'react';
import { Post, User, Ad } from '../types';
import PostCard from '../components/post/PostCard';
import AdCard from '../components/ads/AdCard';
import Card from '../components/common/Card';
import { Icon } from '../components/icons/Icon';
import { useAds, useAdTracking } from '../src/hooks/useAds';
import { useAdInteractions } from '../src/hooks/useAdInteractions';
import { isAd } from '../src/utils/typeGuards';
import { useTranslation } from 'react-i18next';

const BookmarkIcon = () => <Icon className="h-16 w-16 text-gray-400 dark:text-gray-500"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></Icon>;

interface SavedProps {
  posts: Post[];
  savedPostIds: string[];
  onUpdatePost: (postId: string, updates: Partial<Post>) => void;
  onToggleSave: (postId: string) => void;
  user: User;
  onToggleLike: (postId: string, isCurrentlyLiked: boolean) => void;
  onIncrementView: (type: 'post' | 'comment', id: string) => void;
  onViewPost: (postId: string) => void;
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
  allUsers: User[];
}

const Saved: React.FC<SavedProps> = ({ posts, savedPostIds, onUpdatePost, onToggleSave, user, onToggleLike, onIncrementView, onViewPost, onDeletePost, onBlockToggle, blockedUserIds, shareableUsers, onSendMessage, followedUserIds, onViewProfile, onFollowToggle, onOpenFollowModal, onVoteOnPoll, allUsers }) => {
  const { t } = useTranslation(['common']);
  const { ads } = useAds('main');
  const trackAdMetric = useAdTracking(user.id, user.plan, 'main');
  
  const {
    likedAdIds,
    savedAdIds,
    hiddenAdIds,
    toggleAdLike,
    toggleAdSave,
    hideAd,
    incrementAdShares,
    incrementAdViews,
  } = useAdInteractions(user.id);

  const savedPosts = posts.filter((post: Post) => savedPostIds.includes(post.id));
  
  const savedAds = useMemo(() => {
    return ads.filter(ad => savedAdIds.includes(ad.id));
  }, [ads, savedAdIds]);

  const allSavedItems = useMemo(() => {
    return [...savedPosts, ...savedAds];
  }, [savedPosts, savedAds]);

  return (
    <div>
      <h1 className="text-xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">{t('common:savedItems')}</h1>
      {allSavedItems.length > 0 ? (
        <div className="space-y-4">
          {allSavedItems.map((item, index) => {
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
                  isSaved={true}
                  onToggleLike={toggleAdLike}
                  onToggleSave={toggleAdSave}
                  onHideAd={hideAd}
                  onIncrementShares={incrementAdShares}
                  onIncrementViews={(adId) => {}}
                />
              );
            } else {
              return (
                <PostCard
                  key={`post-${item.id}-${index}`}
                  post={item}
                  onUpdatePost={onUpdatePost}
                  isSaved={true}
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
          })}
        </div>
      ) : (
        <Card>
          <div className="text-center p-8 flex flex-col items-center">
            <BookmarkIcon />
            <h2 className="text-xl font-semibold mt-4 text-gray-900 dark:text-white">{t('common:noSavedItems')}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {t('common:savedItemsHint')}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Saved;
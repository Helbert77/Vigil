import React from 'react';
import { Post, User } from '../types';
import Card from '../components/common/Card';
import PostCard from '../components/post/PostCard';
import { Icon } from '../components/icons/Icon';
import Avatar from '../components/common/Avatar';
import { useTranslation } from 'react-i18next';

const ArrowLeftIcon = () => <Icon><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></Icon>;
const HashIcon = () => <Icon className="h-4 w-4 mr-1"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></Icon>;

interface TopicDetailProps {
  tag: string;
  posts: Post[];
  onUpdatePost: (postId: string, updates: Partial<Post>) => void;
  savedPostIds: string[];
  onToggleSave: (postId: string) => void;
  onNavigateBack: () => void;
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

const TopicDetail: React.FC<TopicDetailProps> = ({ tag, posts, onUpdatePost, savedPostIds, onToggleSave, onNavigateBack, user, onToggleLike, onIncrementView, onViewPost, onDeletePost, onBlockToggle, blockedUserIds, shareableUsers, onSendMessage, followedUserIds, onViewProfile, onFollowToggle, onOpenFollowModal, onVoteOnPoll, allUsers }) => {
  const { t } = useTranslation('timeline');
  // Use os posts já filtrados corretamente no App.tsx
  const topicPosts = posts;

  // Calculate stats and influential users
  const influentialUsersMap = new Map<string, { user: User, count: number }>();
  const mediaGallery: string[] = [];

  topicPosts.forEach((post: Post) => {
    const existing = influentialUsersMap.get(post.user.id);
    influentialUsersMap.set(post.user.id, {
      user: post.user,
      count: (existing?.count || 0) + 1,
    });
    if (post.imageUrl) {
      mediaGallery.push(post.imageUrl);
    }
  });

  const influentialUsers = Array.from(influentialUsersMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <div>
      <div className="flex items-center mb-4">
        <button onClick={onNavigateBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label={t('topicDetail.goBack')}>
          <ArrowLeftIcon />
        </button>
        <h1 className="text-xl font-bold ml-4">{t('topicDetail.title')}</h1>
      </div>

      <Card className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">#{tag}</h2>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
          <HashIcon />
          <span>{t('topicDetail.postsCount', { count: topicPosts.length.toLocaleString() })}</span>
        </div>
        
        {influentialUsers.length > 0 && (
            <div className="mt-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">{t('topicDetail.mostInfluential')}</h3>
                <div className="flex space-x-4 mt-2">
                    {influentialUsers.map(({ user: influentialUser }) => (
                        <div key={influentialUser.id} className="flex flex-col items-center text-center">
                            <Avatar src={influentialUser.avatarUrl} alt={influentialUser.name} size="md" />
                            <p className="text-xs font-medium mt-1 truncate w-16">@{influentialUser.username}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {mediaGallery.length > 0 && (
            <div className="mt-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('topicDetail.mediaGallery')}</h3>
                <div className="grid grid-cols-3 gap-2">
                    {mediaGallery.slice(0, 6).map((url: string, index: number) => (
                        <img key={index} src={url} alt={t('topicDetail.mediaAlt', { tag })} className="rounded-lg h-24 w-full object-cover" />
                    ))}
                </div>
            </div>
        )}
      </Card>

      <h3 className="text-xl font-bold mb-4">{t('topicDetail.postsSection')}</h3>
      <div>
        {topicPosts.length > 0 ? (
          topicPosts.map((post: Post) => (
            <PostCard
              key={post.id}
              post={post}
              onUpdatePost={onUpdatePost}
              isSaved={savedPostIds.includes(post.id)}
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
          ))
        ) : (
          <Card>
            <p className="text-center text-gray-500 dark:text-gray-400 p-4">
              {t('topicDetail.noPosts')}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TopicDetail;
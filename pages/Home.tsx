import React from 'react';
import CreatePost from '@/src/components/post/CreatePost';
import PostCard from '../components/post/PostCard';
import Card from '../components/common/Card';
import { Post, Poll, User, Community, EvidenceItem, TrendingTopic } from '../types';

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

const Home: React.FC<HomeProps> = ({ posts, onAddPost, onUpdatePost, savedPostIds, onToggleSave, user, communities, joinedCommunityIds, onToggleLike, onIncrementView, onViewPost, onDeletePost, onBlockToggle, blockedUserIds, shareableUsers, onSendMessage, followedUserIds, onViewProfile, onFollowToggle, onOpenFollowModal, onVoteOnPoll, allUsers, setCurrentPage, onAddComment, onUpdateComment, onDeleteComment, onToggleCommentLike }) => {
  return (
    <div>
      <CreatePost onAddPost={onAddPost} user={user} communities={communities} joinedCommunityIds={joinedCommunityIds} allUsers={allUsers} setCurrentPage={setCurrentPage} />
      
      <div>
        {posts.length > 0 ? posts.map((post: Post) => (
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
        )) : (
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
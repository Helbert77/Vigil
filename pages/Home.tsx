import React from 'react';
import CreatePost from '@/src/components/post/CreatePost';
import PostCard from '../components/post/PostCard';
import Card from '../components/common/Card';
import { Post, Poll, User, Community, EvidenceItem } from '../types';

interface HomeProps {
  posts: Post[];
  onAddPost: (text: string, imageUrl?: string, videoUrl?: string, audioUrl?: string, poll?: Poll, communityId?: string, evidenceBoard?: EvidenceItem[]) => void;
  onUpdatePost: (postId: string, updates: Partial<Post>) => void;
  savedPostIds: string[];
  onToggleSave: (postId: string) => void;
  user: User;
  communities: Community[];
  joinedCommunityIds: string[];
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
  setCurrentPage: (page: any) => void;
}

const Home: React.FC<HomeProps> = ({ posts, onAddPost, onUpdatePost, savedPostIds, onToggleSave, user, communities, joinedCommunityIds, onToggleLike, onIncrementView, onViewPost, onDeletePost, onBlockToggle, blockedUserIds, shareableUsers, onSendMessage, followedUserIds, onViewProfile, onFollowToggle, onOpenFollowModal, onVoteOnPoll, allUsers, setCurrentPage }) => {
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
import React from 'react';
import { Community, Post, User } from '../types';
import Card from '../components/common/Card';
import PostCard from '../components/post/PostCard';
import { Icon } from '../components/icons/Icon';

const ArrowLeftIcon = () => <Icon><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></Icon>;
const UsersIcon = () => <Icon className="h-4 w-4 mr-1"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></Icon>;

interface CommunityDetailProps {
  community: Community;
  posts: Post[];
  onUpdatePost: (postId: string, updates: Partial<Post>) => void;
  savedPostIds: string[];
  onToggleSave: (postId: string) => void;
  onNavigateBack: () => void;
  user: User;
}

const CommunityDetail: React.FC<CommunityDetailProps> = ({ community, posts, onUpdatePost, savedPostIds, onToggleSave, onNavigateBack, user }) => {
  const communityPosts = posts.filter(post => 
    post.text.toLowerCase().includes(`#${community.tag.toLowerCase()}`)
  );

  return (
    <div>
      <div className="flex items-center mb-4">
        <button onClick={onNavigateBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Go back">
          <ArrowLeftIcon />
        </button>
        <h1 className="text-xl font-bold ml-4">Community</h1>
      </div>

      <Card className="mb-6 overflow-hidden p-0 sm:p-0">
        <img src={community.bannerUrl} alt={`${community.name} banner`} className="h-32 sm:h-48 w-full object-cover" />
        <div className="p-4 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{community.name}</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{community.description}</p>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            <UsersIcon />
            <span>{community.memberCount.toLocaleString()} members</span>
          </div>
        </div>
      </Card>

      <h3 className="text-xl font-bold mb-4">Posts</h3>
      <div>
        {communityPosts.length > 0 ? (
          communityPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onUpdatePost={onUpdatePost}
              isSaved={savedPostIds.includes(post.id)}
              onToggleSave={onToggleSave}
              user={user}
            />
          ))
        ) : (
          <Card>
            <p className="text-center text-gray-500 dark:text-gray-400 p-4">
              No posts found for this community yet. Be the first to share a discovery!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CommunityDetail;
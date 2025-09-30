import React from 'react';
import { Post, User } from '../types';
import PostCard from '../components/post/PostCard';
import { Icon } from '../components/icons/Icon';

const ArrowLeftIcon = () => <Icon><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></Icon>;

interface PostDetailProps {
  post: Post;
  onUpdatePost: (postId: string, updates: Partial<Post>) => void;
  savedPostIds: string[];
  onToggleSave: (postId: string) => void;
  onNavigateBack: () => void;
  user: User;
}

const PostDetail: React.FC<PostDetailProps> = ({ post, onUpdatePost, savedPostIds, onToggleSave, onNavigateBack, user }) => {
  return (
    <div>
      <div className="flex items-center mb-4">
        <button onClick={onNavigateBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Go back">
          <ArrowLeftIcon />
        </button>
        <h1 className="text-xl font-bold ml-4">Post</h1>
      </div>
      <PostCard
        post={post}
        onUpdatePost={onUpdatePost}
        isSaved={savedPostIds.includes(post.id)}
        onToggleSave={onToggleSave}
        defaultCommentsOpen={true}
        user={user}
      />
    </div>
  );
};

export default PostDetail;
import React from 'react';
import { Post, User } from '../types';
import PostCard from '../components/post/PostCard';
import Card from '../components/common/Card';
import { Icon } from '../components/icons/Icon';

const BookmarkIcon = () => <Icon className="h-16 w-16 text-gray-400 dark:text-gray-500"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></Icon>;

interface SavedProps {
  posts: Post[];
  savedPostIds: string[];
  onUpdatePost: (postId: string, updates: Partial<Post>) => void;
  onToggleSave: (postId: string) => void;
  user: User;
}

const Saved: React.FC<SavedProps> = ({ posts, savedPostIds, onUpdatePost, onToggleSave, user }) => {
  const savedPosts = posts.filter(post => savedPostIds.includes(post.id));

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Saved Items</h1>
      {savedPosts.length > 0 ? (
        <div className="space-y-4">
          {savedPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onUpdatePost={onUpdatePost}
              isSaved={true}
              onToggleSave={onToggleSave}
              user={user}
            />
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center p-8 flex flex-col items-center">
            <BookmarkIcon />
            <h2 className="text-xl font-semibold mt-4">No Saved Items</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Use the bookmark icon on a post to save it for later.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Saved;
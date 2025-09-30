import React from 'react';
import CreatePost from '../components/post/CreatePost';
import PostCard from '../components/post/PostCard';
import Card from '../components/common/Card';
import { Post, Poll, User } from '../types';

interface HomeProps {
  posts: Post[];
  onAddPost: (text: string, imageUrl?: string, videoUrl?: string, poll?: Poll) => void;
  onUpdatePost: (postId: string, updates: Partial<Post>) => void;
  savedPostIds: string[];
  onToggleSave: (postId: string) => void;
  user: User;
}

const Home: React.FC<HomeProps> = ({ posts, onAddPost, onUpdatePost, savedPostIds, onToggleSave, user }) => {
  return (
    <div>
      <CreatePost onAddPost={onAddPost} user={user} />
      
      <div>
        {posts.length > 0 ? posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            onUpdatePost={onUpdatePost} 
            isSaved={savedPostIds.includes(post.id)}
            onToggleSave={onToggleSave}
            user={user}
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
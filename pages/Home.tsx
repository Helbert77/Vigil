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
  activeTag: string | null;
  setActiveTag: (tag: string | null) => void;
}

const Home: React.FC<HomeProps> = ({ posts, onAddPost, onUpdatePost, savedPostIds, onToggleSave, user, activeTag, setActiveTag }) => {
  const displayedPosts = activeTag 
    ? posts.filter(post => post.text.toLowerCase().includes(`#${activeTag.toLowerCase()}`))
    : posts;

  return (
    <div>
      {activeTag ? (
        <Card className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Trending: #{activeTag}</h2>
            <button onClick={() => setActiveTag(null)} className="text-sm font-semibold text-primary hover:underline">Clear filter</button>
          </div>
        </Card>
      ) : (
        <CreatePost onAddPost={onAddPost} user={user} />
      )}
      
      <div>
        {displayedPosts.length > 0 ? displayedPosts.map((post) => (
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
              No posts found for #{activeTag}. Be the first to uncover the truth!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Home;

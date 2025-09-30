import React, { useState, useEffect } from 'react';
import { Post, User } from '../types';
import Card from '../components/common/Card';
import PostCard from '../components/post/PostCard';
import Avatar from '../components/common/Avatar';
import { MOCK_ALL_USERS } from '../constants';
import { Icon } from '../components/icons/Icon';

const SearchIcon = () => <Icon><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></Icon>;

interface SearchProps {
  query: string;
  posts: Post[];
  onUpdatePost: (postId: string, updates: Partial<Post>) => void;
  savedPostIds: string[];
  onToggleSave: (postId:string) => void;
  onViewProfile: (userId: string) => void;
  currentUser: User;
  onSearch: (query: string) => void;
}

const Search: React.FC<SearchProps> = ({ query, posts, onUpdatePost, savedPostIds, onToggleSave, onViewProfile, currentUser, onSearch }) => {
  const [activeTab, setActiveTab] = useState<'Posts' | 'Users'>('Posts');
  const [currentQuery, setCurrentQuery] = useState(query);

  useEffect(() => {
    setCurrentQuery(query);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentQuery.trim()) {
      onSearch(currentQuery.trim());
    }
  };

  const lowercasedQuery = query.toLowerCase();

  const filteredPosts = posts.filter(post =>
    post.text.toLowerCase().includes(lowercasedQuery) ||
    post.user.name.toLowerCase().includes(lowercasedQuery) ||
    post.user.username.toLowerCase().includes(lowercasedQuery)
  );

  const filteredUsers = MOCK_ALL_USERS.filter(user =>
    user.name.toLowerCase().includes(lowercasedQuery) ||
    user.username.toLowerCase().includes(lowercasedQuery)
  );

  const TabButton: React.FC<{ label: string, count: number, isActive: boolean, onClick: () => void }> = ({ label, count, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-center font-bold transition-colors duration-200 ${
        isActive
          ? 'text-primary border-b-2 border-primary'
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
      }`}
    >
      {label} <span className="font-normal text-gray-500">{count}</span>
    </button>
  );

  const UserResultCard: React.FC<{ user: User }> = ({ user }) => (
      <div className="flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-dark-card/50 cursor-pointer" onClick={() => onViewProfile(user.id)}>
        <div className="flex items-center space-x-4">
          <Avatar src={user.avatarUrl} alt={user.name} size="md" />
          <div>
            <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
          </div>
        </div>
      </div>
  );

  return (
    <div>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Search
        </h1>
        <form onSubmit={handleSearchSubmit} className="relative max-w-lg mx-auto">
          <input
            type="text"
            placeholder="Search Vigil..."
            value={currentQuery}
            onChange={(e) => setCurrentQuery(e.target.value)}
            className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary text-lg"
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
        </form>
      </div>

      {query && (
         <div className="text-center text-gray-500 dark:text-gray-400 mb-6">
            Showing results for: <span className="font-bold text-gray-700 dark:text-gray-300">"{query}"</span>
        </div>
      )}

      <div className="sticky top-16 z-10">
          <div className="flex border-b border-light-border dark:border-dark-border bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-sm rounded-t-lg">
            <TabButton label="Posts" count={filteredPosts.length} isActive={activeTab === 'Posts'} onClick={() => setActiveTab('Posts')} />
            <TabButton label="Users" count={filteredUsers.length} isActive={activeTab === 'Users'} onClick={() => setActiveTab('Users')} />
          </div>
      </div>
      
      <div className="mt-4">
          {activeTab === 'Posts' && (
            <>
              {filteredPosts.length > 0 ? (
                filteredPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onUpdatePost={onUpdatePost}
                    isSaved={savedPostIds.includes(post.id)}
                    onToggleSave={onToggleSave}
                    user={currentUser}
                  />
                ))
              ) : (
                <Card>
                    <p className="text-center p-8 text-gray-500 dark:text-gray-400">No posts found matching your search.</p>
                </Card>
              )}
            </>
          )}

          {activeTab === 'Users' && (
            <Card>
              {filteredUsers.length > 0 ? (
                <div className="divide-y divide-light-border dark:divide-dark-border">
                    {filteredUsers.map(user => (
                    <UserResultCard key={user.id} user={user} />
                    ))}
                </div>
              ) : (
                <p className="text-center p-8 text-gray-500 dark:text-gray-400">No users found matching your search.</p>
              )}
            </Card>
          )}
      </div>
    </div>
  );
};

export default Search;
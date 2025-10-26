import React, { useState, useMemo } from 'react';
import { Post, User, Community } from '../types';
import Card from '../components/common/Card';
import PostCard from '../components/post/PostCard';
import Avatar from '../components/common/Avatar';
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
  allUsers: User[];
  onToggleLike: (postId: string, isCurrentlyLiked: boolean) => void;
  onIncrementView: (type: 'post' | 'comment', id: string) => void;
  onViewPost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onBlockToggle: (userId: string) => void;
  blockedUserIds: string[];
  shareableUsers: User[];
  onSendMessage: (params: { targetUserId: string, text: string }) => void;
  followedUserIds: string[];
  onFollowToggle: (userId: string) => void;
  onOpenFollowModal: (user: User, tab: 'followers' | 'following') => void;
  onVoteOnPoll: (postId: string, optionIndex: number) => void;
  communities: Community[];
  joinedCommunityIds: string[];
}

const Search: React.FC<SearchProps> = ({ 
    query, posts, onUpdatePost, savedPostIds, onToggleSave, onViewProfile, currentUser, onSearch, allUsers, 
    onToggleLike, onIncrementView, onViewPost, onDeletePost, onBlockToggle, blockedUserIds, shareableUsers, 
    onSendMessage, followedUserIds, onFollowToggle, onOpenFollowModal, onVoteOnPoll, communities, joinedCommunityIds 
}) => {
  const [activeTab, setActiveTab] = useState<'Posts' | 'Users'>('Posts');
  const [dateFilter, setDateFilter] = useState<'all' | '24h' | '7d' | '30d'>('all');
  const [communityFilter, setCommunityFilter] = useState<string>('all');
  const [followingOnlyFilter, setFollowingOnlyFilter] = useState<boolean>(false);

  const lowercasedQuery = query.toLowerCase();

  const filteredPosts = useMemo(() => {
    let result = posts.filter((post: Post) =>
      post.text.toLowerCase().includes(lowercasedQuery) ||
      post.user.name.toLowerCase().includes(lowercasedQuery) ||
      post.user.username.toLowerCase().includes(lowercasedQuery)
    );

    if (dateFilter !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      if (dateFilter === '24h') cutoffDate.setDate(now.getDate() - 1);
      else if (dateFilter === '7d') cutoffDate.setDate(now.getDate() - 7);
      else if (dateFilter === '30d') cutoffDate.setMonth(now.getMonth() - 1);
      
      result = result.filter(post => new Date(post.timestamp) >= cutoffDate);
    }

    if (communityFilter !== 'all') {
      result = result.filter(post => post.communityId === communityFilter);
    }

    if (followingOnlyFilter) {
      result = result.filter(post => followedUserIds.includes(post.user.id) || post.user.id === currentUser.id);
    }

    return result;
  }, [posts, lowercasedQuery, dateFilter, communityFilter, followingOnlyFilter, followedUserIds, currentUser.id]);

  const filteredUsers = useMemo(() => {
    let result = allUsers.filter((user: User) =>
      user.name.toLowerCase().includes(lowercasedQuery) ||
      user.username.toLowerCase().includes(lowercasedQuery)
    );

    if (followingOnlyFilter) {
      result = result.filter(user => followedUserIds.includes(user.id));
    }

    return result;
  }, [allUsers, lowercasedQuery, followingOnlyFilter, followedUserIds]);

  const userJoinedCommunities = communities.filter(c => joinedCommunityIds.includes(c.id));

  interface TabButtonProps {
    label: string;
    count: number;
    isActive: boolean;
    onClick: () => void;
  }

  const TabButton: React.FC<TabButtonProps> = ({ label, count, isActive, onClick }) => (
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

  interface UserResultCardProps {
    user: User;
  }

  const UserResultCard: React.FC<UserResultCardProps> = ({ user }) => (
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
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Busca Avançada</h1>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data</label>
            <select
              id="date-filter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-light-border dark:border-dark-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-light-bg dark:bg-dark-bg"
            >
              <option value="all">Qualquer data</option>
              <option value="24h">Últimas 24 horas</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
            </select>
          </div>

          <div>
            <label htmlFor="community-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Comunidade</label>
            <select
              id="community-filter"
              value={communityFilter}
              onChange={(e) => setCommunityFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-light-border dark:border-dark-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-light-bg dark:bg-dark-bg"
            >
              <option value="all">Todas as Comunidades</option>
              {userJoinedCommunities.map(community => (
                <option key={community.id} value={community.id}>{community.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center pb-2">
            <div className="flex items-center h-5">
              <input
                id="following-only"
                type="checkbox"
                checked={followingOnlyFilter}
                onChange={(e) => setFollowingOnlyFilter(e.target.checked)}
                className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="following-only" className="font-medium text-gray-700 dark:text-gray-300">Apenas de quem você segue</label>
            </div>
          </div>
        </div>
      </Card>

      {query && (
         <div className="text-center text-gray-500 dark:text-gray-400 mb-6">
            Mostrando resultados para: <span className="font-bold text-gray-700 dark:text-gray-300">"{query}"</span>
        </div>
      )}

      <div>
          <div className="flex border-b border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card rounded-t-lg">
            <TabButton label="Posts" count={filteredPosts.length} isActive={activeTab === 'Posts'} onClick={() => setActiveTab('Posts')} />
            <TabButton label="Users" count={filteredUsers.length} isActive={activeTab === 'Users'} onClick={() => setActiveTab('Users')} />
          </div>
      </div>
      
      <div className="mt-4">
          {activeTab === 'Posts' && (
            <>
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post: Post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onUpdatePost={onUpdatePost}
                    isSaved={savedPostIds.includes(post.id)}
                    onToggleSave={onToggleSave}
                    user={currentUser}
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
                    <p className="text-center p-8 text-gray-500 dark:text-gray-400">No posts found matching your search.</p>
                </Card>
              )}
            </>
          )}

          {activeTab === 'Users' && (
            <Card>
              {filteredUsers.length > 0 ? (
                <div className="divide-y divide-light-border dark:divide-dark-border">
                    {filteredUsers.map((user: User) => (
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
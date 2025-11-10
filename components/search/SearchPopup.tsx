import React from 'react';
import { User, Community, TrendingTopic } from '@/types';
import Avatar from '../common/Avatar';
import { Icon } from '../icons/Icon';

const SearchIcon = () => <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></Icon>;
const UsersIcon = () => <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></Icon>;
const HashIcon = () => <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></Icon>;

interface SearchPopupProps {
  query: string;
  users: User[];
  communities: Community[];
  topics: TrendingTopic[];
  onNavigateToUser: (userId: string) => void;
  onNavigateToCommunity: (communityId: string) => void;
  onNavigateToTopic: (tag: string) => void;
  onGoToAdvancedSearch: () => void;
}

const SearchPopup: React.FC<SearchPopupProps> = ({
  query, users, communities, topics,
  onNavigateToUser, onNavigateToCommunity, onNavigateToTopic, onGoToAdvancedSearch
}) => {
  const lowercasedQuery = query.toLowerCase();

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(lowercasedQuery) ||
    u.username.toLowerCase().includes(lowercasedQuery)
  ).slice(0, 3);

  const filteredCommunities = communities.filter(c =>
    c.name.toLowerCase().includes(lowercasedQuery)
  ).slice(0, 2);

  const filteredTopics = topics.filter(t =>
    t.tag.toLowerCase().includes(lowercasedQuery)
  ).slice(0, 2);

  return (
    <div className="absolute top-full mt-2 w-full bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-lg z-20 max-h-[80vh] md:max-h-96 overflow-y-auto">
      <div
        onClick={onGoToAdvancedSearch}
        className="p-3 md:p-3 flex items-center space-x-3 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
      >
        <SearchIcon />
        <p className="text-sm md:text-base text-gray-900 dark:text-white">Ir para a busca de <span className="font-bold">"{query}"</span></p>
      </div>

      {filteredUsers.length > 0 && (
        <>
          <div className="border-t border-light-border dark:border-dark-border my-1"></div>
          <h3 className="px-3 pt-2 pb-1 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Usuários</h3>
          {filteredUsers.map(user => (
            <div
              key={user.id}
              onClick={() => onNavigateToUser(user.id)}
              className="flex items-center space-x-3 p-3 md:p-3 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
            >
              <Avatar src={user.avatarUrl} alt={user.name} size="sm" />
              <div>
                <p className="font-bold text-sm md:text-sm text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
              </div>
            </div>
          ))}
        </>
      )}

      {filteredCommunities.length > 0 && (
        <>
          <div className="border-t border-light-border dark:border-dark-border my-1"></div>
          <h3 className="px-3 pt-2 pb-1 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Comunidades</h3>
          {filteredCommunities.map(community => (
            <div
              key={community.id}
              onClick={() => onNavigateToCommunity(community.id)}
              className="flex items-center space-x-3 p-3 md:p-3 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
                <img src={community.bannerUrl} alt={community.name} className="w-full h-full object-cover" />
              </div>
              <p className="font-bold text-sm md:text-sm text-gray-900 dark:text-white">{community.name}</p>
            </div>
          ))}
        </>
      )}

      {filteredTopics.length > 0 && (
        <>
          <div className="border-t border-light-border dark:border-dark-border my-1"></div>
          <h3 className="px-3 pt-2 pb-1 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Tópicos</h3>
          {filteredTopics.map(topic => (
            <div
              key={topic.tag}
              onClick={() => onNavigateToTopic(topic.tag)}
              className="flex items-center space-x-3 p-3 md:p-3 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
            >
              <HashIcon />
              <div>
                <p className="font-bold text-sm md:text-sm text-gray-900 dark:text-white">#{topic.tag}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{topic.post_count.toLocaleString()} posts</p>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default SearchPopup;
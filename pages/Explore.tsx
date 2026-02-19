import React, { useState, useRef, useEffect } from 'react';
import { User, TrendingTopic, Community } from '@/types';
import UserToFollow from '@/components/common/UserToFollow';
import Avatar from '@/components/common/Avatar';
import { Icon } from '@/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import { getCommunityTranslation } from '@/src/utils/communityUtils';

const SearchIcon = () => <Icon className="h-5 w-5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></Icon>;
const HashIcon = () => <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400"><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></Icon>;
const ArrowLeftIcon = () => <Icon className="h-5 w-5"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></Icon>;
const XIcon = () => <Icon className="h-5 w-5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>;

interface ExplorePageProps {
  trendingTopics: TrendingTopic[];
  usersToFollow: User[];
  followedUserIds: string[];
  currentUser: User;
  allUsers: User[];
  communities: Community[];
  onFollowToggle: (userId: string) => void;
  onViewProfile: (userId: string) => void;
  onViewTag: (tag: string) => void;
  onOpenFollowModal: (user: User, tab: 'followers' | 'following') => void;
  onNavigateTrendingTopics: () => void;
  onNavigateExploreUsers: () => void;
  onNavigateToAdvancedSearch: (query: string) => void;
  onNavigateToUser: (userId: string) => void;
  onNavigateToCommunity: (communityId: string) => void;
  onGoBack: () => void;
}

const ExplorePage: React.FC<ExplorePageProps> = ({
  trendingTopics,
  usersToFollow,
  followedUserIds,
  currentUser,
  allUsers,
  communities,
  onFollowToggle,
  onViewProfile,
  onViewTag,
  onOpenFollowModal,
  onNavigateTrendingTopics,
  onNavigateExploreUsers,
  onNavigateToAdvancedSearch,
  onNavigateToUser,
  onNavigateToCommunity,
  onGoBack,
}) => {
  const { t } = useTranslation(['common', 'navigation', 'posts', 'communities']);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const lowercasedQuery = query.toLowerCase().trim();

  const filteredUsers = lowercasedQuery
    ? allUsers.filter(u =>
        u.name.toLowerCase().includes(lowercasedQuery) ||
        u.username.toLowerCase().includes(lowercasedQuery)
      ).slice(0, 5)
    : [];

  const filteredCommunities = lowercasedQuery
    ? communities.filter(c => {
        const { name } = getCommunityTranslation(c, t);
        return name.toLowerCase().includes(lowercasedQuery);
      }).slice(0, 3)
    : [];

  const filteredTopics = lowercasedQuery
    ? trendingTopics.filter(topic =>
        topic.tag.toLowerCase().includes(lowercasedQuery)
      ).slice(0, 3)
    : [];

  const hasResults = filteredUsers.length > 0 || filteredCommunities.length > 0 || filteredTopics.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      e.preventDefault();
      onNavigateToAdvancedSearch(query);
    }
  };

  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen pb-28">
      <div className="bg-light-bg dark:bg-dark-bg border-b border-light-border dark:border-dark-border">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <button
            onClick={onGoBack}
            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
            aria-label={t('common:back')}
          >
            <ArrowLeftIcon />
          </button>
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              placeholder={t('common:search')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              onKeyDown={handleKeyDown}
              className="w-full bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-full py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <SearchIcon />
            </div>
            {query && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XIcon />
              </button>
            )}
          </div>
        </div>
      </div>

      {lowercasedQuery ? (
        <div className="px-3 py-2">
          <div
            onClick={() => onNavigateToAdvancedSearch(query)}
            className="p-3 flex items-center space-x-3 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer rounded-lg transition-colors"
          >
            <SearchIcon />
            <p className="text-sm text-gray-900 dark:text-white">
              {t('common:search')} <span className="font-bold">"{query}"</span>
            </p>
          </div>

          {filteredUsers.length > 0 && (
            <div className="mt-2">
              <h3 className="px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                {t('common:users')}
              </h3>
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => onNavigateToUser(user.id)}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer rounded-lg transition-colors"
                >
                  <Avatar src={user.avatarUrl} alt={user.name} size="sm" />
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredCommunities.length > 0 && (
            <div className="mt-2">
              <h3 className="px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                {t('common:communities')}
              </h3>
              {filteredCommunities.map(community => {
                const { name } = getCommunityTranslation(community, t);
                return (
                  <div
                    key={community.id}
                    onClick={() => onNavigateToCommunity(community.id)}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
                      <img src={community.bannerUrl} alt={name} className="w-full h-full object-cover" />
                    </div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{name}</p>
                  </div>
                );
              })}
            </div>
          )}

          {filteredTopics.length > 0 && (
            <div className="mt-2">
              <h3 className="px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                {t('common:topics')}
              </h3>
              {filteredTopics.map(topic => (
                <div
                  key={topic.tag}
                  onClick={() => onViewTag(topic.tag)}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer rounded-lg transition-colors"
                >
                  <HashIcon />
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">#{topic.tag}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{topic.post_count.toLocaleString()} {t('posts:posts')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!hasResults && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('common:noResultsFound')}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="px-3 py-4 space-y-6">
          {/* Trending Topics */}
          <section className="bg-light-card dark:bg-dark-card rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
              {t('common:trendingTopics')}
            </h2>
            <div className="space-y-1">
              {trendingTopics && trendingTopics.length > 0 ? (
                <>
                  {trendingTopics.slice(0, 5).map((topic, index) => (
                    <div
                      key={topic.tag}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700/50 p-2.5 rounded-lg cursor-pointer transition-colors"
                      onClick={() => onViewTag(topic.tag)}
                    >
                      <p className="text-xs text-gray-500 dark:text-gray-400">{index + 1} · {t('common:trending')}</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm leading-tight mt-0.5">
                        #{topic.tag}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {topic.post_count.toLocaleString()} {t('posts:posts')}
                      </p>
                    </div>
                  ))}
                  {trendingTopics.length > 3 && (
                    <button
                      onClick={onNavigateTrendingTopics}
                      className="text-sm font-medium text-[#007BFF] hover:text-[#0056b3] transition-colors mt-2 px-2.5 py-1.5"
                    >
                      {t('common:showMore')}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('common:noTrending')}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {t('common:beFirstHashtag')}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Who to Follow */}
          <section className="bg-light-card dark:bg-dark-card rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
              {t('common:whoToFollow')}
            </h2>
            <div className="space-y-4">
              {usersToFollow && usersToFollow.length > 0 ? (
                <>
                  {usersToFollow.slice(0, 5).map((user) => (
                    <UserToFollow
                      key={user.id}
                      user={user}
                      isFollowing={followedUserIds.includes(user.id)}
                      onFollowToggle={onFollowToggle}
                      onViewProfile={onViewProfile}
                      isCurrentUser={user.id === currentUser.id}
                      onOpenFollowModal={onOpenFollowModal}
                    />
                  ))}
                  {usersToFollow.length > 3 && (
                    <button
                      onClick={onNavigateExploreUsers}
                      className="text-sm font-medium text-[#007BFF] hover:text-[#0056b3] transition-colors mt-1 px-1"
                    >
                      {t('common:showMore')}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('common:noSuggestions')}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;

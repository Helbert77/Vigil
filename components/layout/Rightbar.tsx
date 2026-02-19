import React, { useEffect } from 'react';
import Card from '../common/Card';
import { User, TrendingTopic } from '@/types';
import UserToFollow from '@/components/common/UserToFollow';
import CrossBrowserButton from '@/src/components/common/CrossBrowserButton';
import { detectBrowser, initializeBrowserCompatibility } from '@/src/utils/browserCompatibility';
import { useTranslation } from 'react-i18next';

interface RightbarProps {
  onViewTag: (tag: string) => void;
  onViewProfile: (userId: string) => void;
  followedUserIds: string[];
  onFollowToggle: (userId: string) => void;
  onNavigateAbout: () => void;
  onNavigateTerms: () => void;
  onNavigatePrivacy: () => void;
  onNavigateCookies: () => void;
  onNavigateHelp: () => void;
  onNavigateDisclaimer: () => void;
  onNavigateAccessibility: () => void;
  trendingTopics: TrendingTopic[];
  usersToFollow: User[];
  currentUser: User;
  onOpenFollowModal: (user: User, tab: 'followers' | 'following') => void;
  onNavigatePremium: () => void;
  onNavigateTrendingTopics?: () => void;
  onNavigateExploreUsers?: () => void;
}

const Rightbar: React.FC<RightbarProps> = ({ 
  trendingTopics = [], 
  usersToFollow = [], 
  onViewTag, 
  onViewProfile, 
  followedUserIds, 
  onFollowToggle, 
  onNavigateAbout, 
  onNavigateTerms, 
  onNavigatePrivacy, 
  onNavigateCookies,
  onNavigateHelp,
  onNavigateDisclaimer, 
  onNavigateAccessibility, 
  currentUser, 
  onOpenFollowModal,
  onNavigatePremium,
  onNavigateTrendingTopics,
  onNavigateExploreUsers
}) => {
  const browser = detectBrowser();
  const { t } = useTranslation(['common', 'navigation', 'posts']);

  useEffect(() => {
    // Inicializa compatibilidade cross-browser apenas uma vez
    initializeBrowserCompatibility();
  }, []); // Remove dependências desnecessárias

  return (
    <div className="sticky top-20 space-y-4 md:space-y-6 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto overflow-x-hidden 
      scrollbar-hide
    " style={{
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
      {/* Premium Card */}
      <Card>
        <h2 className="text-base md:text-lg font-bold mb-3 md:mb-4 text-gray-900 dark:text-white">
          {t('becomePremium')}
        </h2>
        <div className="text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {t('subscribePremiumText')}
        </div>
        <div className="mt-3 md:mt-4">
          <button 
            onClick={onNavigatePremium}
            className="w-full md:w-auto bg-primary hover:bg-gray-600 text-white font-bold py-2 px-4 md:px-6 rounded-full transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm md:text-base"
          >
            {t('subscribe')}
          </button>
        </div>
      </Card>

      {/* Trending Topics Card */}
      <Card>
        <h2 className="text-base md:text-lg font-bold mb-1.5 md:mb-2 text-gray-900 dark:text-white">
          {t('trendingTopics')}
        </h2>
        <div className="space-y-0.5 md:space-y-1">
          {trendingTopics && trendingTopics.length > 0 ? (
            <>
              {trendingTopics.slice(0, 3).map((topic) => (
                <div 
                  key={topic.tag} 
                  className="hover:bg-gray-200 dark:hover:bg-gray-700 p-1 md:p-1.5 rounded-md cursor-pointer transition-colors duration-200"
                  onClick={() => onViewTag(topic.tag)}
                >
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm md:text-base truncate leading-tight">
                    #{topic.tag}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-tight">
                    {topic.post_count.toLocaleString()} {t('posts:posts')}
                  </p>
                </div>
              ))}
              {trendingTopics.length > 3 && onNavigateTrendingTopics && (
                <div className="pt-2 pb-0.5">
                  <CrossBrowserButton
                    onClick={(e) => {
                      onNavigateTrendingTopics?.();
                    }}
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm transition-colors duration-200 w-full text-left focus:outline-none rounded px-1 focus-subtle"
                    style={{ color: '#007BFF' }}
                    aria-label={t('showMore')}
                    title={t('showMore')}
                    disableFocusRing={true}
                  >
                    {t('showMore')}
                  </CrossBrowserButton>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-1.5 md:py-2">
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                {t('noTrending')}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {t('beFirstHashtag')}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Users to Follow Card */}
      <Card>
        <h2 className="text-base md:text-lg font-bold mb-3 md:mb-4 text-gray-900 dark:text-white">
          {t('whoToFollow')}
        </h2>
        <div className="space-y-3 md:space-y-4">
          {usersToFollow && usersToFollow.slice(0, 3).map((user) => (
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
          {usersToFollow && usersToFollow.length > 3 && onNavigateExploreUsers && (
            <div className="pt-2">
              <CrossBrowserButton
                onClick={(e) => {
                  onNavigateExploreUsers?.();
                }}
                className="text-sm font-medium text-[#007BFF] hover:text-[#0056b3] transition-colors duration-200 hover:underline focus:outline-none rounded px-1 focus-subtle"
                aria-label={t('showMore')}
                title={t('showMore')}
                disableFocusRing={true}
              >
                {t('showMore')}
              </CrossBrowserButton>
            </div>
          )}
          {usersToFollow && usersToFollow.length === 0 && (
            <div className="text-center py-3 md:py-4">
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                {t('noSuggestions')}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Footer */}
      <footer className="px-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 leading-relaxed">
          <a onClick={onNavigateTerms} className="hover:underline cursor-pointer transition-colors">
            {t('navigation:terms')}
          </a>
          <span className="hidden md:inline">|</span>
          <a onClick={onNavigatePrivacy} className="hover:underline cursor-pointer transition-colors">
            {t('navigation:privacy')}
          </a>
          <span className="hidden md:inline">|</span>
          <a onClick={onNavigateCookies} className="hover:underline cursor-pointer transition-colors">
            {t('navigation:cookies')}
          </a>
          <span className="hidden md:inline">|</span>
          <a onClick={onNavigateHelp} className="hover:underline cursor-pointer transition-colors">
            {t('navigation:help')}
          </a>
          <span className="hidden md:inline">|</span>
          <a onClick={onNavigateAccessibility} className="hover:underline cursor-pointer transition-colors">
            {t('navigation:accessibility')}
          </a>
          <span className="hidden md:inline">|</span>
          <a onClick={onNavigateDisclaimer} className="hover:underline cursor-pointer transition-colors">
            {t('navigation:disclaimer')}
          </a>
          <span className="hidden md:inline">|</span>
          <a onClick={onNavigateAbout} className="hover:underline cursor-pointer transition-colors">
            {t('navigation:about')}
          </a>
        </div>
        <p className="mt-2 text-center md:text-left">{t('rightsReserved', { year: new Date().getFullYear() })}</p>
      </footer>
    </div>
  );
};

export default Rightbar;
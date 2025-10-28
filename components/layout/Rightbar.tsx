import React, { useEffect } from 'react';
import Card from '../common/Card';
import Avatar from '../common/Avatar';
import { User, TrendingTopic } from '@/types';
import UserLink from '@/components/common/UserLink';
import { VerifiedBadgeIcon } from '@/src/components/icons/VerifiedBadgeIcon';
import { ModeratorBadgeIcon } from '@/src/components/icons/ModeratorBadgeIcon';
import CrossBrowserButton from '@/src/components/common/CrossBrowserButton';
import { detectBrowser, initializeBrowserCompatibility } from '@/src/utils/browserCompatibility';

interface RightbarProps {
  onViewTag: (tag: string) => void;
  onViewProfile: (userId: string) => void;
  followedUserIds: string[];
  onFollowToggle: (userId: string) => void;
  onNavigateAbout: () => void;
  onNavigateTerms: () => void;
  onNavigatePrivacy: () => void;
  onNavigateCookies: () => void;
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

interface UserToFollowProps {
  user: User;
  isFollowing: boolean;
  onFollowToggle: (userId: string) => void;
  onViewProfile: (userId: string) => void;
  isCurrentUser: boolean;
  onOpenFollowModal: (user: User, tab: 'followers' | 'following') => void;
}

const UserToFollow: React.FC<UserToFollowProps> = ({ user, isFollowing, onFollowToggle, onViewProfile, isCurrentUser, onOpenFollowModal }) => (
  <div key={user.id} className="flex items-center justify-between gap-3">
    <div className="flex items-center space-x-3 flex-1 min-w-0">
      <Avatar src={user.avatarUrl} alt={user.name} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <UserLink
            user={user}
            isFollowing={isFollowing}
            onFollowToggle={onFollowToggle}
            onViewProfile={onViewProfile}
            isCurrentUser={isCurrentUser}
            onOpenFollowModal={onOpenFollowModal}
          >
            <p className="font-bold text-gray-900 dark:text-white truncate text-sm md:text-base">
              {user.name}
            </p>
          </UserLink>
          {(user.plan === 'pro' || user.plan === 'premium') && (
            <VerifiedBadgeIcon plan={user.plan} className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
          )}
          {user.role && ['admin', 'moderator'].includes(user.role) && (
            <ModeratorBadgeIcon className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
          )}
        </div>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
          @{user.username}
        </p>
      </div>
    </div>
    <button 
      onClick={() => onFollowToggle(user.id)}
      className={`font-bold py-1.5 px-3 md:py-1 md:px-4 rounded-full text-xs md:text-sm transition-colors duration-200 transform active:scale-95 flex-shrink-0 min-w-[70px] md:min-w-[80px] ${
        isFollowing 
          ? 'bg-transparent border border-primary text-primary hover:bg-primary/10'
          : 'bg-primary hover:bg-gray-600 text-white'
      }`}
    >
      {isFollowing ? 'Seguindo' : 'Seguir'}
    </button>
  </div>
);

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
  onNavigateDisclaimer, 
  onNavigateAccessibility, 
  currentUser, 
  onOpenFollowModal,
  onNavigatePremium,
  onNavigateTrendingTopics,
  onNavigateExploreUsers
}) => {
  const browser = detectBrowser();

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
          Torne-se Premium
        </h2>
        <div className="text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          Assine o plano Premium para desbloquear novos recursos e funcionalidades.
        </div>
        <div className="mt-3 md:mt-4">
          <button 
            onClick={onNavigatePremium}
            className="w-full md:w-auto bg-primary hover:bg-gray-600 text-white font-bold py-2 px-4 md:px-6 rounded-full transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm md:text-base"
          >
            Assinar
          </button>
        </div>
      </Card>

      {/* Trending Topics Card */}
      <Card>
        <h2 className="text-base md:text-lg font-bold mb-1.5 md:mb-2 text-gray-900 dark:text-white">
          Acontecendo Agora
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
                    {topic.post_count.toLocaleString()} posts
                  </p>
                </div>
              ))}
              {trendingTopics.length > 3 && onNavigateTrendingTopics && (
                <div className="pt-2 pb-0.5">
                  <CrossBrowserButton
                    onClick={(e) => {
                      onNavigateTrendingTopics?.();
                    }}
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm transition-colors duration-200 w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-1"
                    style={{ color: '#007BFF' }}
                    aria-label="Mostrar mais tópicos em alta"
                    title="Ver todos os tópicos em alta"
                  >
                    Mostrar mais
                  </CrossBrowserButton>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-1.5 md:py-2">
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                Nenhum tópico em alta no momento
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Seja o primeiro a usar hashtags!
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Users to Follow Card */}
      <Card>
        <h2 className="text-base md:text-lg font-bold mb-3 md:mb-4 text-gray-900 dark:text-white">
          Quem Seguir
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
                className="text-sm font-medium text-[#007BFF] hover:text-[#0056b3] transition-colors duration-200 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-1"
                aria-label="Mostrar mais usuários para seguir"
                title="Ver mais usuários para seguir"
              >
                Mostrar mais
              </CrossBrowserButton>
            </div>
          )}
          {usersToFollow && usersToFollow.length === 0 && (
            <div className="text-center py-3 md:py-4">
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                Nenhuma sugestão no momento
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Footer */}
      <footer className="px-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 leading-relaxed">
          <a onClick={onNavigateTerms} className="hover:underline cursor-pointer transition-colors">
            Termos
          </a>
          <span className="hidden md:inline">|</span>
          <a onClick={onNavigatePrivacy} className="hover:underline cursor-pointer transition-colors">
            Privacidade
          </a>
          <span className="hidden md:inline">|</span>
          <a onClick={onNavigateCookies} className="hover:underline cursor-pointer transition-colors">
            Cookies
          </a>
          <span className="hidden md:inline">|</span>
          <a onClick={onNavigateAccessibility} className="hover:underline cursor-pointer transition-colors">
            Acessibilidade
          </a>
          <span className="hidden md:inline">|</span>
          <a onClick={onNavigateDisclaimer} className="hover:underline cursor-pointer transition-colors">
            Responsabilidade
          </a>
          <span className="hidden md:inline">|</span>
          <a onClick={onNavigateAbout} className="hover:underline cursor-pointer transition-colors">
            Sobre
          </a>
        </div>
        <p className="mt-2 text-center md:text-left">© 2025 Vigil Corp.</p>
      </footer>
    </div>
  );
};

export default Rightbar;
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '../types';
import Card from './common/Card';
import Avatar from './common/Avatar';
import UserLink from './common/UserLink';
import { VerifiedBadgeIcon } from '@/src/components/icons/VerifiedBadgeIcon';
import { ModeratorBadgeIcon } from '@/src/components/icons/ModeratorBadgeIcon';
import { useTranslation } from 'react-i18next';

interface ExploreUsersProps {
  currentUser: User;
  followedUserIds: string[];
  usersToFollow: User[];
  onFollowToggle: (userId: string) => void;
  onViewProfile: (userId: string) => void;
  onOpenFollowModal: (user: User, tab: 'followers' | 'following') => void;
  onGoBack: () => void;
}

interface UserWithRelation extends User {
  relationshipType: 'new' | 'follower_of_followed' | 'followed_by_followed';
  relationshipDetail?: string; // Nome do usuário relacionado
}

interface UserItemProps {
  user: UserWithRelation;
  isFollowing: boolean;
  onFollowToggle: (userId: string) => void;
  onViewProfile: (userId: string) => void;
  isCurrentUser: boolean;
  onOpenFollowModal: (user: User, tab: 'followers' | 'following') => void;
  isRemoving?: boolean;
}

const UserItem: React.FC<UserItemProps> = React.memo(({
  user,
  isFollowing,
  isCurrentUser,
  onFollowToggle,
  onViewProfile,
  onOpenFollowModal,
  isRemoving = false
}) => {
  const { t } = useTranslation(['common']);
  
  // Calcular se o usuário é novo (menos de 30 dias)
  const isNewUser = useMemo(() => {
    if (!user.createdAt) return false;
    
    // Usar a data raw do banco (ISO string)
    const createdDate = new Date(user.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Verificar se foi criado há menos de 30 dias
    return createdDate >= thirtyDaysAgo;
  }, [user.createdAt]);

  const getBadgeText = () => {
    if (isNewUser) {
      return t('common:newOnPlatform');
    }
    switch (user.relationshipType) {
      case 'follower_of_followed':
        return t('common:followerOf', { name: user.relationshipDetail });
      case 'followed_by_followed':
        return t('common:followedBy', { name: user.relationshipDetail });
      default:
        return '';
    }
  };

  const getBadgeColor = () => {
    if (isNewUser) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
    switch (user.relationshipType) {
      case 'follower_of_followed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'followed_by_followed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return '';
    }
  };

  const badgeText = getBadgeText();
  const badgeColor = getBadgeColor();

  return (
    <div className={`flex items-start justify-between gap-3 md:gap-4 p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 ease-out ${isRemoving ? 'opacity-0 -translate-x-4 scale-95 pointer-events-none' : 'opacity-100 translate-x-0 scale-100'}`} style={isRemoving ? { marginTop: '-100px', paddingTop: 0, paddingBottom: 0, height: 0 } : {}}>
      <div className="flex items-start space-x-2 md:space-x-3 flex-1 min-w-0">
        <div className="flex-shrink-0">
          <Avatar src={user.avatarUrl} alt={user.name} size="md" />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5 md:space-y-2">
          {/* Nome + @username + badges na mesma linha */}
          <div className="flex items-center gap-1 flex-wrap">
            <UserLink
              user={user}
              isFollowing={isFollowing}
              onFollowToggle={onFollowToggle}
              onViewProfile={onViewProfile}
              isCurrentUser={isCurrentUser}
              onOpenFollowModal={onOpenFollowModal}
            >
              <span className="font-bold text-gray-900 dark:text-white text-sm md:text-base hover:underline">
                {user.name}
              </span>
            </UserLink>
            
            {/* Badges de verificação */}
            {(user.plan === 'pro' || user.plan === 'premium') && (
              <VerifiedBadgeIcon plan={user.plan} className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
            )}
            {user.role && ['admin', 'moderator'].includes(user.role) && (
              <ModeratorBadgeIcon className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
            )}
            
            {/* Username */}
            <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
              @{user.username}
            </span>
          </div>

          {/* Bio do usuário */}
          {user.bio && (
            <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {user.bio}
            </p>
          )}

          {/* Contadores de seguindo/seguidores */}
          <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-600 dark:text-gray-400">
            <span>
              <span className="font-semibold text-gray-900 dark:text-white">{user.followingCount || 0}</span> {t('common:followingCount')}
            </span>
            <span>
              <span className="font-semibold text-gray-900 dark:text-white">{user.followersCount || 0}</span> {t('common:followersCount')}
            </span>
          </div>

          {/* Badge de relacionamento ou novo usuário */}
          {badgeText && (
            <div className="inline-block">
              <span className={`inline-flex items-center px-2 md:px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
                {badgeText}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <button 
        onClick={() => onFollowToggle(user.id)}
        className={`font-bold py-1.5 px-3 md:py-2 md:px-4 rounded-full text-xs md:text-sm transition-all duration-200 transform active:scale-95 flex-shrink-0 min-w-[80px] md:min-w-[90px] ${
          isFollowing 
            ? 'bg-transparent border border-primary text-primary hover:bg-primary/10'
            : 'bg-primary hover:bg-gray-600 text-white'
        }`}
      >
        {isFollowing ? t('common:following') : t('common:follow')}
      </button>
    </div>
  );
});

const ExploreUsers: React.FC<ExploreUsersProps> = React.memo(({
  currentUser,
  followedUserIds,
  usersToFollow,
  onFollowToggle,
  onViewProfile,
  onOpenFollowModal,
  onGoBack
}) => {
  const { t } = useTranslation(['common']);
  const [users, setUsers] = useState<UserWithRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [removingUserIds, setRemovingUserIds] = useState<Set<string>>(new Set());

  // Converter usuários reais para o formato com relacionamento usando useMemo para otimização
  const convertedUsers = useMemo(() => {
    if (!usersToFollow) return [];
    return usersToFollow.map(user => ({
      ...user,
      relationshipType: 'new' as const, // Tipo padrão (verificação real é feita no componente)
      relationshipDetail: undefined
    }));
  }, [usersToFollow]);

  const loadUsers = useCallback(async (pageNum: number) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    // Verificar se convertedUsers existe
    if (!convertedUsers || convertedUsers.length === 0) {
      setLoading(false);
      setLoadingMore(false);
      setUsers([]);
      setHasMore(false);
      return;
    }

    const usersPerPage = 10;
    const startIndex = (pageNum - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const pageUsers = convertedUsers.slice(startIndex, endIndex);

    if (pageNum === 1) {
      setUsers(pageUsers);
      setLoading(false);
    } else {
      setUsers(prevUsers => [...prevUsers, ...pageUsers]);
      setLoadingMore(false);
    }

    if (endIndex >= convertedUsers.length) {
      setHasMore(false);
    }
  }, [convertedUsers]);

  useEffect(() => {
    if (convertedUsers && convertedUsers.length > 0) {
      setPage(1);
      loadUsers(1);
    } else {
      setLoading(false);
      setUsers([]);
      setHasMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convertedUsers]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadUsers(nextPage);
    }
  };

  // Wrapper para adicionar animação de fade-out
  const handleFollowToggleWithAnimation = useCallback((userId: string) => {
    // Se já está seguindo, apenas chama a função original
    if (followedUserIds.includes(userId)) {
      onFollowToggle(userId);
      return;
    }

    // Adiciona à lista de remoção (inicia animação de fade-out)
    setRemovingUserIds(prev => new Set(prev).add(userId));
    
    // Chama a função original
    onFollowToggle(userId);
    
    // Remove visualmente após a animação
    setTimeout(() => {
      setRemovingUserIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }, 200); // Duração da animação
  }, [followedUserIds, onFollowToggle]);

  // Scroll infinito
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
        && !loadingMore && hasMore
      ) {
        const nextPage = page + 1;
        setPage(nextPage);
        loadUsers(nextPage);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, loadingMore, hasMore]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={onGoBack}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                aria-label={t('common:goBack')}
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {t('common:exploreUsers')}
              </h1>
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
                <div className="rounded-full bg-gray-300 dark:bg-gray-600 h-12 w-12"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/6"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                </div>
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onGoBack}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label={t('common:goBack')}
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              {t('common:exploreUsers')}
            </h1>
          </div>
        </div>

        <div className="space-y-0">
          {users.map((user) => (
            <UserItem
              key={user.id}
              user={user}
              isFollowing={followedUserIds.includes(user.id)}
              onFollowToggle={handleFollowToggleWithAnimation}
              onViewProfile={onViewProfile}
              isCurrentUser={user.id === currentUser.id}
              onOpenFollowModal={onOpenFollowModal}
              isRemoving={removingUserIds.has(user.id)}
            />
          ))}
        </div>

        {loadingMore && (
          <div className="py-8">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
                  <div className="rounded-full bg-gray-300 dark:bg-gray-600 h-12 w-12"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/6"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                  </div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasMore && users.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              {t('common:endOfList')}
            </p>
          </div>
        )}

        {users.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              {t('common:noUsersFound')}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {t('common:tryAgainLater')}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
});

export default ExploreUsers;
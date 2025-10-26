import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '../types';
import Card from './common/Card';
import Avatar from './common/Avatar';
import UserLink from './common/UserLink';

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
}

const UserItem: React.FC<UserItemProps> = React.memo(({
  user,
  isFollowing,
  isCurrentUser,
  onFollowToggle,
  onViewProfile,
  onOpenFollowModal
}) => {
  const getBadgeText = () => {
    switch (user.relationshipType) {
      case 'new':
        return 'Novo na plataforma';
      case 'follower_of_followed':
        return `Seguidor de ${user.relationshipDetail}`;
      case 'followed_by_followed':
        return `Seguido por ${user.relationshipDetail}`;
      default:
        return '';
    }
  };

  const getBadgeColor = () => {
    switch (user.relationshipType) {
      case 'new':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'follower_of_followed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'followed_by_followed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="flex items-start justify-between gap-4 p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
      <div className="flex items-start space-x-3 flex-1 min-w-0">
        <Avatar src={user.avatarUrl} alt={user.name} size="lg" />
        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <UserLink
                user={user}
                isFollowing={isFollowing}
                onFollowToggle={onFollowToggle}
                onViewProfile={onViewProfile}
                isCurrentUser={isCurrentUser}
                onOpenFollowModal={onOpenFollowModal}
              >
                <p className="font-bold text-gray-900 dark:text-white truncate text-base">
                  {user.name}
                </p>
              </UserLink>
              {(user.plan === 'pro' || user.plan === 'premium') && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {user.plan === 'premium' ? '★' : '✓'}
                </span>
              )}
              {user.role && ['admin', 'moderator'].includes(user.role) && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  {user.role === 'admin' ? 'Admin' : 'Mod'}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-2">
              @{user.username}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>
                <span className="font-semibold text-gray-900 dark:text-white">{user.followingCount || 0}</span> seguindo
              </span>
              <span>
                <span className="font-semibold text-gray-900 dark:text-white">{user.followersCount || 0}</span> seguidores
              </span>
            </div>
          </div>
          <div className="inline-block">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor()}`}>
              {getBadgeText()}
            </span>
          </div>
        </div>
      </div>
      <button 
        onClick={() => onFollowToggle(user.id)}
        className={`font-bold py-2 px-4 rounded-full text-sm transition-all duration-200 transform active:scale-95 flex-shrink-0 min-w-[90px] ${
          isFollowing 
            ? 'bg-transparent border border-primary text-primary hover:bg-primary/10'
            : 'bg-primary hover:bg-gray-600 text-white'
        }`}
      >
        {isFollowing ? 'Seguindo' : 'Seguir'}
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
  const [users, setUsers] = useState<UserWithRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Converter usuários reais para o formato com relacionamento usando useMemo para otimização
  const convertedUsers = useMemo(() => {
    if (!usersToFollow) return [];
    return usersToFollow.map(user => ({
      ...user,
      relationshipType: 'new' as const, // Por enquanto, todos são marcados como "novos"
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

    // Simular um pequeno delay para melhor UX
    await new Promise(resolve => setTimeout(resolve, 300));

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
  }, [convertedUsers, loadUsers]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadUsers(nextPage);
    }
  };

  // Scroll infinito
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
                aria-label="Voltar"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Explorar Usuários
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
              aria-label="Voltar"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Explorar Usuários
            </h1>
          </div>
        </div>

        <div className="space-y-0">
          {users.map((user) => (
            <UserItem
              key={user.id}
              user={user}
              isFollowing={followedUserIds.includes(user.id)}
              onFollowToggle={onFollowToggle}
              onViewProfile={onViewProfile}
              isCurrentUser={user.id === currentUser.id}
              onOpenFollowModal={onOpenFollowModal}
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
              Você chegou ao fim da lista!
            </p>
          </div>
        )}

        {users.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              Nenhum usuário encontrado
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Tente novamente mais tarde
            </p>
          </div>
        )}
      </Card>
    </div>
  );
});

export default ExploreUsers;
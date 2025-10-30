import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { useToast } from '@/hooks/useToast';
import * as api from '@/src/services/api';

export const useUserData = (appUser: User | null, refreshUser: () => Promise<void>) => {
  const { addToast } = useToast();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [followedUserIds, setFollowedUserIds] = useState<string[]>([]);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [blockedUsersList, setBlockedUsersList] = useState<User[]>([]);
  const [usersToFollow, setUsersToFollow] = useState<User[]>([]);

  const fetchAllUsers = useCallback(async () => {
    try {
      const { data, error } = await api.fetchAllUsers();
      if (error) throw error;
      const fetchedUsers: User[] = data.map((profile: any) => ({
        id: profile.id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username,
        username: profile.username,
        avatarUrl: profile.avatar_url || `https://picsum.photos/seed/${profile.id}/100/100`,
        bannerUrl: profile.banner_url || `https://picsum.photos/seed/banner-${profile.id}/1500/500`,
        bio: profile.bio,
        joinDate: `Joined ${new Date(profile.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        followingCount: profile.following_count || 0,
        followersCount: profile.followers_count || 0,
        plan: profile.plan || 'free',
        role: profile.role || 'user',
      }));
      setAllUsers(fetchedUsers);
    } catch (error) {
      // Error log removed for production
      addToast('Erro ao carregar usuários.', 'error');
    }
  }, [addToast]);

  const fetchUserLists = useCallback(async () => {
    if (!appUser) {
      setFollowedUserIds([]);
      setBlockedUserIds([]);
      setBlockedUsersList([]);
      return;
    }
    try {
      const { data: followed, error: followedError } = await api.fetchFollowedIds(appUser.id);
      if (followedError) throw followedError;
      setFollowedUserIds(followed.map((item: { following_id: string }) => item.following_id));

      const { data: blockedIdsData, error: blockedIdsError } = await api.fetchBlockedIds(appUser.id);
      if (blockedIdsError) throw blockedIdsError;
      
      const blockedIds = blockedIdsData.map((item: { blocked_id: string }) => item.blocked_id);
      setBlockedUserIds(blockedIds);

      if (blockedIds.length > 0) {
        const { data: blockedProfiles, error: profilesError } = await api.fetchBlockedProfiles(blockedIds);
        if (profilesError) throw profilesError;
        const formattedBlockedUsers: User[] = blockedProfiles.map((profile: any) => ({
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username,
          username: profile.username,
          avatarUrl: profile.avatar_url || `https://picsum.photos/seed/${profile.id}/100/100`,
          joinDate: '', followingCount: 0, followersCount: 0,
          plan: profile.plan || 'free',
          role: profile.role || 'user',
        }));
        setBlockedUsersList(formattedBlockedUsers);
      } else {
        setBlockedUsersList([]);
      }
    } catch (error) {
      // Error log removed for production
    }
  }, [appUser]);

  const fetchUsersToFollow = useCallback(async () => {
    if (!appUser) return;
    try {
      const { data, error } = await api.fetchUsersToFollow(appUser.id);
      if (error) throw error;
      
      if (data && data.length > 0) {
        const suggestedUsers: User[] = data.map((profile: any) => ({
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username,
          username: profile.username,
          avatarUrl: profile.avatar_url || `https://picsum.photos/seed/${profile.id}/100/100`,
          joinDate: '',
          followingCount: profile.following_count || 0,
          followersCount: profile.followers_count || 0,
          plan: profile.plan || 'free',
          role: profile.role || 'user',
        }));
        setUsersToFollow(suggestedUsers);
      } else {
        setUsersToFollow([]);
      }
    } catch (error) {
      // Error log removed for production
      setUsersToFollow([]);
    }
  }, [appUser]);

  useEffect(() => {
    if (appUser) {
      fetchAllUsers();
      fetchUserLists();
      fetchUsersToFollow();
    } else {
      setAllUsers([]);
      setUsersToFollow([]);
    }
  }, [appUser, fetchAllUsers, fetchUserLists, fetchUsersToFollow]);

  const handleFollowToggle = useCallback(async (userId: string) => {
    if (!appUser) { addToast('Você precisa estar logado para seguir usuários.', 'error'); return; }
    const isCurrentlyFollowing = followedUserIds.includes(userId);
    
    // Atualização otimista do estado
    setFollowedUserIds(prev => isCurrentlyFollowing ? prev.filter(id => id !== userId) : [...prev, userId]);
    setAllUsers(prevUsers => prevUsers.map(u => {
        if (u.id === appUser.id) return { ...u, followingCount: isCurrentlyFollowing ? u.followingCount - 1 : u.followingCount + 1 };
        if (u.id === userId) return { ...u, followersCount: isCurrentlyFollowing ? u.followersCount - 1 : u.followersCount + 1 };
        return u;
    }));

    // Atualizar também a lista usersToFollow localmente para evitar re-fetch
    setUsersToFollow(prevUsers => {
      if (!prevUsers) return prevUsers;
      return prevUsers.filter(u => u.id !== userId);
    });

    try {
      if (isCurrentlyFollowing) {
        const { error } = await api.unfollowUser(appUser.id, userId);
        if (error) throw error;
        addToast(`Você deixou de seguir @${allUsers.find(u=>u.id === userId)?.username}.`, 'info');
      } else {
        const { error } = await api.followUser(appUser.id, userId);
        if (error) throw error;
        addToast(`Você está seguindo @${allUsers.find(u=>u.id === userId)?.username}!`, 'success');
        await api.createNotification({ recipient_id: userId, actor_id: appUser.id, type: 'follow' });
      }
      // Removido fetchUsersToFollow() para evitar re-renderização desnecessária
    } catch (error) {
      // Error log removed for production
      addToast('Falha ao atualizar status de seguir. Revertendo.', 'error');
      
      // Reverter todas as mudanças em caso de erro
      setFollowedUserIds(prev => isCurrentlyFollowing ? [...prev, userId] : prev.filter(id => id !== userId));
      setAllUsers(prevUsers => prevUsers.map(u => {
        if (u.id === appUser.id) return { ...u, followingCount: isCurrentlyFollowing ? u.followingCount + 1 : u.followingCount - 1 };
        if (u.id === userId) return { ...u, followersCount: isCurrentlyFollowing ? u.followersCount + 1 : u.followersCount - 1 };
        return u;
      }));
      
      // Reverter também a remoção da lista usersToFollow
      if (!isCurrentlyFollowing) {
        const userToRestore = allUsers.find(u => u.id === userId);
        if (userToRestore) {
          setUsersToFollow(prevUsers => prevUsers ? [...prevUsers, userToRestore] : [userToRestore]);
        }
      }
    }
  }, [appUser, addToast, followedUserIds, allUsers]);

  const handleBlockToggle = useCallback(async (userId: string) => {
    if (!appUser) return;
    const isCurrentlyBlocked = blockedUserIds.includes(userId);
    
    try {
        if (isCurrentlyBlocked) {
            const { error } = await api.unblockUser(appUser.id, userId);
            if (error) throw error;
            addToast(`Você desbloqueou um usuário.`, 'success');
        } else {
            const { error } = await api.blockUser(appUser.id, userId);
            if (error) throw error;
            addToast(`Você bloqueou um usuário.`, 'info');
        }
        fetchUserLists();
    } catch (error) {
      // Error log removed for production
      addToast('Falha ao atualizar status de bloqueio.', 'error');
    }
  }, [appUser, addToast, blockedUserIds, fetchUserLists]);

  const handleUpdateUser = useCallback(async (updates: Partial<User>) => {
    if (!appUser) return;

    const [firstName, ...lastNameParts] = (updates.name || '').split(' ');
    const lastName = lastNameParts.join(' ');

    const dbUpdates = {
      first_name: firstName,
      last_name: lastName,
      username: updates.username,
      bio: updates.bio,
      avatar_url: updates.avatarUrl,
      banner_url: updates.bannerUrl,
    };

    try {
      const { error } = await api.updateUser(appUser.id, dbUpdates);
      if (error) throw error;
      await refreshUser();
      addToast('Perfil atualizado com sucesso!', 'success');
    } catch (error) {
      // Error log removed for production
      addToast('Erro ao atualizar perfil.', 'error');
    }
  }, [appUser, addToast, refreshUser]);

  return { allUsers, followedUserIds, blockedUserIds, blockedUsersList, usersToFollow, handleFollowToggle, handleBlockToggle, fetchAllUsers, fetchUserLists, handleUpdateUser };
};
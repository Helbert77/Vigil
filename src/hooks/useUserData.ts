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
      
      console.log(`🔍 [useUserData] fetchAllUsers - Total de usuários: ${data.length}`);
      if (data.length > 0) {
        console.log('📊 [useUserData] Amostra do primeiro usuário:', {
          created_at: data[0].created_at,
          updated_at: data[0].updated_at,
          username: data[0].username,
          id: data[0].id
        });
      }
      
      const fetchedUsers: User[] = data.map((profile: any, index: number) => {
        // CORRIGIDO: Usar múltiplas fontes em ordem de prioridade
        // 1. profile.created_at (se existir)
        // 2. profile.updated_at (mesma data segundo usuário)
        // 3. Date.now() (último recurso)
        const dateSource = profile.created_at || profile.updated_at;
        const createdAtDate = dateSource ? new Date(dateSource) : new Date();
        
        if (index === 0) {
          console.log('📅 [useUserData] Processamento data do primeiro usuário:', {
            profile_created_at_raw: profile.created_at,
            profile_updated_at_raw: profile.updated_at,
            dateSource_used: dateSource,
            createdAtDate_parsed: createdAtDate.toISOString(),
            joinDate_formatted: `Joined ${createdAtDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
            is_using_fallback: !dateSource
          });
        }
        
        return {
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username,
          username: profile.username,
          avatarUrl: profile.avatar_url || `https://picsum.photos/seed/${profile.id}/100/100`,
          bannerUrl: profile.banner_url || `https://picsum.photos/seed/banner-${profile.id}/1500/500`,
          bio: profile.bio || '', // Garantir que não seja null
          joinDate: `Joined ${createdAtDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
          createdAt: dateSource, // Usar a fonte que tiver dados
          followingCount: profile.following_count || 0,
          followersCount: profile.followers_count || 0,
          plan: profile.plan || 'free',
          role: profile.role || 'user',
        };
      });
      setAllUsers(fetchedUsers);
      console.log('✅ [useUserData] allUsers atualizado com sucesso');
    } catch (error) {
      console.error('❌ [useUserData] Erro ao carregar usuários:', error);
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
        const suggestedUsers: User[] = data.map((profile: any) => {
          // CORRIGIDO: Usar múltiplas fontes
          const dateSource = profile.created_at || profile.updated_at;
          const createdAtDate = dateSource ? new Date(dateSource) : new Date();
          
          return {
            id: profile.id,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username,
            username: profile.username,
            avatarUrl: profile.avatar_url || `https://picsum.photos/seed/${profile.id}/100/100`,
            bannerUrl: profile.banner_url || `https://picsum.photos/seed/banner-${profile.id}/1500/500`,
            bio: profile.bio || '', // IMPORTANTE: Incluir bio
            joinDate: `Joined ${createdAtDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
            createdAt: dateSource, // IMPORTANTE: Usar a fonte que tiver dados
            followingCount: profile.following_count || 0,
            followersCount: profile.followers_count || 0,
            plan: profile.plan || 'free',
            role: profile.role || 'user',
          };
        });
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

    // Atualizar também a lista usersToFollow localmente (contador + remoção/adição)
    setUsersToFollow(prevUsers => {
      if (!prevUsers) return prevUsers;
      
      // Se está deixando de seguir, adicionar o usuário de volta à lista
      if (isCurrentlyFollowing) {
        const userToAdd = allUsers.find(u => u.id === userId);
        if (userToAdd) {
          // Atualizar contadores e adicionar usuário de volta
          return [
            ...prevUsers.map(u => {
              if (u.id === appUser.id) {
                return { ...u, followingCount: u.followingCount - 1 };
              }
              return u;
            }),
            { ...userToAdd, followersCount: userToAdd.followersCount - 1 }
          ];
        }
      }
      
      // Se está seguindo, remover da lista e atualizar contadores
      return prevUsers.map(u => {
        if (u.id === userId) {
          return { 
            ...u, 
            followersCount: u.followersCount + 1 
          };
        }
        if (u.id === appUser.id) {
          return {
            ...u,
            followingCount: u.followingCount + 1
          };
        }
        return u;
      }).filter(u => u.id !== userId); // Remove o usuário que acabou de seguir
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
      
      // Reverter também as mudanças em usersToFollow
      setUsersToFollow(prevUsers => {
        if (!prevUsers) return prevUsers;
        
        if (!isCurrentlyFollowing) {
          // Se estava tentando seguir (e falhou), restaura o usuário na lista
          const userToRestore = allUsers.find(u => u.id === userId);
          if (userToRestore) {
            return [...prevUsers.map(u => {
              if (u.id === appUser.id) {
                return { ...u, followingCount: u.followingCount - 1 };
              }
              return u;
            }), userToRestore];
          }
        } else {
          // Se estava tentando deixar de seguir (e falhou), remove o usuário da lista novamente
          return prevUsers.filter(u => u.id !== userId).map(u => {
            if (u.id === appUser.id) {
              return { ...u, followingCount: u.followingCount + 1 };
            }
            return u;
          });
        }
        return prevUsers;
      });
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
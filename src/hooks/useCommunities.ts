import { useState, useEffect, useCallback } from 'react';
import { Community, TrendingTopic, User } from '@/types';
import { useToast } from '@/hooks/useToast';
import { NewCommunityData } from '@/components/communities/CreateCommunityModal';
import * as api from '@/src/services/api';
import { supabase } from '@/integrations/supabase/client';

export const useCommunities = (appUser: User | null) => {
  const { addToast } = useToast();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [joinedCommunityIds, setJoinedCommunityIds] = useState<string[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);

  const fetchInitialData = useCallback(async () => {
    try {
      const { data, error } = await api.fetchCommunities();
      if (error) {
        console.error('[useCommunities] Error fetching communities:', error);
        throw error;
      }
      const safeCommunities = data.map((c: any) => ({ 
        ...c, 
        memberCount: c.member_count ?? 0, 
        postsCount: c.posts_count ?? 0, 
        bannerUrl: c.banner_url || `https://picsum.photos/seed/community-banner-${c.id}/600/200` 
      })) as Community[];
      setCommunities(safeCommunities);
    } catch (error) {
      console.error('[useCommunities] Failed to load communities:', error);
      addToast('Erro ao carregar comunidades.', 'error');
    }
  }, [addToast]);

  const fetchTrendingTopics = useCallback(async () => {
    try {
      const response = await api.fetchTrendingTopics();
      
      if (response.error) {
        console.error('[useCommunities] Error fetching trending topics:', response.error);
        throw response.error;
      }
      
      const topicsData = response.data || [];
      
      if (topicsData.length === 0) {
        console.warn('[useCommunities] No trending topics found - this might be normal if there are no recent posts with hashtags');
      }
      
      setTrendingTopics(topicsData as TrendingTopic[]);
    } catch (error) {
      console.error('[useCommunities] Failed to fetch trending topics:', error);
      setTrendingTopics([]);
    }
  }, []);

  const fetchJoinedCommunities = useCallback(async () => {
    if (!appUser) {
      setJoinedCommunityIds([]);
      return;
    }
    try {
      const { data, error } = await api.fetchJoinedCommunityIds(appUser.id);
      if (error) {
        console.error('[useCommunities] Error fetching joined communities:', error);
        throw error;
      }
      const joinedIds = data.map((item: { community_id: string }) => item.community_id);
      setJoinedCommunityIds(joinedIds);
    } catch (error) {
      console.error('[useCommunities] Failed to fetch joined communities:', error);
      addToast('Erro ao carregar comunidades que você participa.', 'error');
    }
  }, [appUser, addToast]);

  useEffect(() => {
    if (!appUser) return;

    fetchInitialData();
    fetchTrendingTopics();
    fetchJoinedCommunities();

    const channel = supabase.channel('communities-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_communities' }, () => {
        setTimeout(() => {
          fetchInitialData();
          fetchJoinedCommunities();
        }, 1000);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'communities' }, () => {
        setTimeout(() => {
          fetchInitialData();
        }, 1000);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        setTimeout(() => {
          fetchTrendingTopics();
        }, 1000);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hashtags' }, () => {
        setTimeout(() => {
          fetchTrendingTopics();
        }, 1000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [appUser, fetchInitialData, fetchTrendingTopics, fetchJoinedCommunities]);

  const handleJoinCommunityToggle = useCallback(async (communityId: string) => {
    if (!appUser) { addToast('Você precisa estar logado.', 'error'); return; }
    const isCurrentlyJoined = joinedCommunityIds.includes(communityId);

    setJoinedCommunityIds(prev => isCurrentlyJoined ? prev.filter(id => id !== communityId) : [...prev, communityId]);
    setCommunities(prevCommunities => prevCommunities.map(c => {
      if (c.id === communityId) {
        return { ...c, memberCount: isCurrentlyJoined ? c.memberCount - 1 : c.memberCount + 1 };
      }
      return c;
    }));

    try {
      const { error } = isCurrentlyJoined
        ? await api.leaveCommunity(appUser.id, communityId)
        : await api.joinCommunity(appUser.id, communityId);
      if (error) throw error;
    } catch (error) {
      addToast('Falha ao atualizar status da comunidade.', 'error');
      setJoinedCommunityIds(prev => isCurrentlyJoined ? [...prev, communityId] : prev.filter(id => id !== communityId));
      setCommunities(prevCommunities => prevCommunities.map(c => {
        if (c.id === communityId) {
          return { ...c, memberCount: isCurrentlyJoined ? c.memberCount + 1 : c.memberCount - 1 };
        }
        return c;
      }));
    }
  }, [appUser, addToast, joinedCommunityIds]);

  const handleCreateCommunity = useCallback(async (communityData: NewCommunityData) => {
    if (!appUser) return null;
    const { name, description, rules, bannerUrl } = communityData;
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const tag = name.replace(/\s+/g, '');
    try {
      const { data, error } = await api.createCommunity({ 
        id, 
        name, 
        description, 
        rules, 
        tag, 
        banner_url: bannerUrl || `https://picsum.photos/seed/community-banner-${id}/600/200` 
      });
      if (error) throw error;
      
      const { error: joinError } = await api.joinCommunity(appUser.id, id);
      if (joinError) { 
        console.error('[useCommunities] Failed to join created community:', joinError);
        addToast(`Comunidade criada, mas falha ao entrar.`, 'error'); 
      } else { 
        addToast(`Comunidade "${name}" criada!`, 'success'); 
      }
      
      fetchInitialData();
      fetchJoinedCommunities();
      return data.id;
    } catch (error: any) {
      console.error('[useCommunities] Error creating community:', error);
      addToast(`Erro ao criar comunidade: ${error.message}`, 'error');
      return null;
    }
  }, [appUser, addToast, fetchInitialData, fetchJoinedCommunities]);

  return { communities, setCommunities, joinedCommunityIds, trendingTopics, setTrendingTopics, handleJoinCommunityToggle, handleCreateCommunity, fetchTrendingTopics };
};
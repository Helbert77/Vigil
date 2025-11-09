import { useState, useEffect, useCallback } from 'react';
import { Community, TrendingTopic, User } from '@/types';
import { useToast } from '@/hooks/useToast';
import { NewCommunityData } from '@/components/communities/CreateCommunityModal';
import * as api from '@/src/services/api';
import { canAccessCommunity, getAccessDeniedMessage } from '@/src/utils/communityAccess';
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
        // Error log removed for production
        throw error;
      }
      const safeCommunities = data.map((c: any) => ({ 
        ...c, 
        memberCount: c.member_count ?? 0, 
        postsCount: c.posts_count ?? 0, 
        bannerUrl: c.banner_url || `https://picsum.photos/seed/community-banner-${c.id}/600/200`,
        requiredPlan: c.required_plan || 'all',
        creatorId: c.creator_id
      })) as Community[];
      setCommunities(safeCommunities);
    } catch (error) {
      // Error log removed for production
      addToast('Erro ao carregar comunidades.', 'error');
    }
  }, [addToast]);

  const fetchTrendingTopics = useCallback(async () => {
    try {
      const response = await api.fetchTrendingTopics();
      
      if (response.error) {
        // Error log removed for production
        throw response.error;
      }
      
      const topicsData = response.data || [];
      
      if (topicsData.length === 0) {
        // Warning log removed for production
      }
      
      setTrendingTopics(topicsData as TrendingTopic[]);
    } catch (error) {
      // Error log removed for production
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
        // Error log removed for production
        throw error;
      }
      const joinedIds = data.map((item: { community_id: string }) => item.community_id);
      setJoinedCommunityIds(joinedIds);
    } catch (error) {
      // Error log removed for production
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
    
    const community = communities.find(c => c.id === communityId);
    const isCurrentlyJoined = joinedCommunityIds.includes(communityId);

    // Se está tentando ENTRAR (não sair), verificar acesso
    if (!isCurrentlyJoined && community) {
      const hasAccess = canAccessCommunity(appUser.plan, community.requiredPlan);
      if (!hasAccess) {
        addToast(getAccessDeniedMessage(community.requiredPlan || 'all'), 'error');
        return;
      }
    }

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
  }, [appUser, addToast, joinedCommunityIds, communities]);

  const handleCreateCommunity = useCallback(async (communityData: NewCommunityData) => {
    if (!appUser) return null;
    const { name, description, rules, bannerUrl, requiredPlan } = communityData;
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const tag = name.replace(/\s+/g, '');
    try {
      const { data, error } = await api.createCommunity({ 
        id, 
        name, 
        description, 
        rules, 
        tag, 
        banner_url: bannerUrl || `https://picsum.photos/seed/community-banner-${id}/600/200`,
        required_plan: requiredPlan || 'all',
        creator_id: appUser.id
      });
      if (error) throw error;
      
      const { error: joinError } = await api.joinCommunity(appUser.id, id);
      if (joinError) { 
        // Error log removed for production
        addToast(`Comunidade criada, mas falha ao entrar.`, 'error'); 
      } else { 
        addToast(`Comunidade "${name}" criada!`, 'success'); 
      }
      
      fetchInitialData();
      fetchJoinedCommunities();
      return data.id;
    } catch (error) {
      // Error log removed for production
      addToast('Erro ao criar comunidade.', 'error');
      return null;
    }
  }, [appUser, addToast, fetchInitialData, fetchJoinedCommunities]);

  const handleUpdateCommunityPlan = useCallback(async (communityId: string, requiredPlan: 'all' | 'basic+' | 'pro+' | 'premium') => {
    if (!appUser) return;
    
    try {
      const { data, error } = await api.updateCommunityPlan(communityId, requiredPlan);
      if (error) throw error;
      
      // Atualizar localmente
      setCommunities(prev => prev.map(c => 
        c.id === communityId ? { ...c, requiredPlan } : c
      ));
      
      addToast('Plano requerido atualizado com sucesso!', 'success');
    } catch (error) {
      addToast('Erro ao atualizar plano requerido.', 'error');
      throw error;
    }
  }, [appUser, addToast]);

  return { communities, setCommunities, joinedCommunityIds, trendingTopics, setTrendingTopics, handleJoinCommunityToggle, handleCreateCommunity, handleUpdateCommunityPlan, fetchTrendingTopics };
};
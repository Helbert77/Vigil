import { useState, useEffect, useCallback, useMemo } from 'react';
import { Ad } from '../../types';
import * as api from '../services/api';

/**
 * Hook melhorado para buscar e gerenciar anúncios ativos com estado local
 * Inclui atualizações otimistas para likes e shares
 */
export const useAdsWithState = (feedType: 'main' | 'community', communityId?: string, userId?: string) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAds = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await api.fetchActiveAds();

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        const formattedAds: Ad[] = data.map((ad: any) => ({
          id: ad.id,
          title: ad.title,
          description: ad.description,
          image_url: ad.image_url,
          video_url: ad.video_url,
          link_url: ad.link_url,
          advertiser_id: ad.advertiser_id,
          advertiser_name: ad.advertiser_name,
          advertiser_avatar: ad.advertiser_avatar,
          type: ad.type,
          status: ad.status,
          start_date: ad.start_date,
          end_date: ad.end_date,
          likes_count: ad.likes_count || 0,
          shares_count: ad.shares_count || 0,
          likes: ad.likes_count || 0,
          shares: ad.shares_count || 0,
          comments: ad.comments_count || 0,
          views: ad.views_count || 0,
          timestamp: ad.created_at,
        }));
        
        setAds(formattedAds);
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar anúncios');
      setAds([]);
    } finally {
      setIsLoading(false);
    }
  }, [feedType, communityId]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  // Atualização otimista de likes
  const updateAdLikes = useCallback((adId: string, increment: boolean) => {
    setAds(prevAds => 
      prevAds.map(ad => 
        ad.id === adId 
          ? { 
              ...ad, 
              likes: increment ? (ad.likes || 0) + 1 : Math.max((ad.likes || 0) - 1, 0),
              likes_count: increment ? (ad.likes_count || 0) + 1 : Math.max((ad.likes_count || 0) - 1, 0),
            }
          : ad
      )
    );
  }, []);

  // Atualização otimista de shares
  const updateAdShares = useCallback((adId: string) => {
    setAds(prevAds => 
      prevAds.map(ad => 
        ad.id === adId 
          ? { 
              ...ad, 
              shares: (ad.shares || 0) + 1,
              shares_count: (ad.shares_count || 0) + 1,
            }
          : ad
      )
    );
  }, []);

  // Atualização otimista de views
  const updateAdViews = useCallback((adId: string) => {
    setAds(prevAds => 
      prevAds.map(ad => 
        ad.id === adId 
          ? { 
              ...ad, 
              views: (ad.views || 0) + 1,
            }
          : ad
      )
    );
  }, []);

  return {
    ads,
    isLoading,
    error,
    refetch: fetchAds,
    updateAdLikes,
    updateAdShares,
    updateAdViews,
  };
};

/**
 * Hook para rastrear métricas de anúncios
 */
export const useAdTracking = (
  userId: string,
  userPlan: string,
  feedType: 'main' | 'community',
  communityId?: string
) => {
  const trackMetric = useCallback(
    async (adId: string, eventType: 'impression' | 'click' | 'like' | 'share' | 'save') => {
      await api.trackAdMetric({
        adId,
        userId,
        eventType,
        userPlan,
        feedType,
        communityId,
      });
    },
    [userId, userPlan, feedType, communityId]
  );

  return trackMetric;
};


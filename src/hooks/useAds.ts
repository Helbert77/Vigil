import { useState, useEffect, useCallback } from 'react';
import { Ad } from '../../types';
import * as api from '../services/api';

/**
 * Hook para buscar e gerenciar anúncios ativos
 * @param feedType - Tipo do feed ('main' ou 'community')
 * @param communityId - ID da comunidade (opcional, usado quando feedType é 'community')
 * @returns Objeto contendo ads, isLoading, error e função refetch
 */
export const useAds = (feedType: 'main' | 'community', communityId?: string) => {
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
      console.error('Erro ao buscar anúncios:', err);
      setError(err?.message || 'Erro ao carregar anúncios');
      setAds([]);
    } finally {
      setIsLoading(false);
    }
  }, [feedType, communityId]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  return {
    ads,
    isLoading,
    error,
    refetch: fetchAds,
  };
};

/**
 * Hook para rastrear métricas de anúncios
 * @param userId - ID do usuário
 * @param userPlan - Plano do usuário
 * @param feedType - Tipo do feed
 * @param communityId - ID da comunidade (opcional)
 * @returns Função para rastrear métricas
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


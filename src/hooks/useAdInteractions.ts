import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

/**
 * Hook para gerenciar interações do usuário com anúncios
 * (likes, saves, hidden ads)
 */
export const useAdInteractions = (userId: string) => {
  const [likedAdIds, setLikedAdIds] = useState<string[]>([]);
  const [savedAdIds, setSavedAdIds] = useState<string[]>([]);
  const [hiddenAdIds, setHiddenAdIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar estados iniciais
  useEffect(() => {
    const fetchStates = async () => {
      if (!userId) return;
      
      setIsLoading(true);

      const [likedResult, savedResult, hiddenResult] = await Promise.all([
        api.fetchLikedAdIds(userId),
        api.fetchSavedAdIds(userId),
        api.fetchHiddenAdIds(userId),
      ]);

      if (likedResult.data) {
        setLikedAdIds(likedResult.data.map((item: any) => item.ad_id));
      }

      if (savedResult.data) {
        setSavedAdIds(savedResult.data.map((item: any) => item.ad_id));
      }

      if (hiddenResult.data) {
        setHiddenAdIds(hiddenResult.data.map((item: any) => item.ad_id));
      }

      setIsLoading(false);
    };

    fetchStates();
  }, [userId]);

  // Toggle like
  const toggleAdLike = useCallback(async (adId: string, isCurrentlyLiked: boolean) => {
    const { error } = await api.toggleAdLike(adId, userId, isCurrentlyLiked);
    if (!error) {
      setLikedAdIds(prev =>
        isCurrentlyLiked ? prev.filter(id => id !== adId) : [...prev, adId]
      );
    }
  }, [userId]);

  // Toggle save
  const toggleAdSave = useCallback(async (adId: string, isCurrentlySaved: boolean) => {
    const { error } = await api.toggleSaveAd(adId, userId, isCurrentlySaved);
    if (!error) {
      setSavedAdIds(prev =>
        isCurrentlySaved ? prev.filter(id => id !== adId) : [...prev, adId]
      );
    }
  }, [userId]);

  // Hide ad
  const hideAd = useCallback(async (adId: string) => {
    const { error } = await api.hideAd(adId, userId);
    if (!error) {
      setHiddenAdIds(prev => [...prev, adId]);
    }
  }, [userId]);

  // Increment shares
  const incrementAdShares = useCallback(async (adId: string) => {
    await api.incrementAdShares(adId);
  }, []);

  // Increment views
  const incrementAdViews = useCallback(async (adId: string) => {
    await api.incrementAdViews(adId);
  }, []);

  return {
    likedAdIds,
    savedAdIds,
    hiddenAdIds,
    isLoading,
    toggleAdLike,
    toggleAdSave,
    hideAd,
    incrementAdShares,
    incrementAdViews,
  };
};

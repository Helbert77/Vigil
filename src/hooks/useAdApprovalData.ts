import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

export const useAdApprovalData = (appUser: User | null) => {
  const [pendingAdsCount, setPendingAdsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const isModerator = appUser?.role === 'admin' || appUser?.role === 'moderator';

  const fetchPendingAdsCount = useCallback(async () => {
    if (!isModerator) {
      setIsLoading(false);
      setPendingAdsCount(0);
      return;
    }

    try {
      const { count, error } = await supabase
        .from('anuncios')
        .select('id', { count: 'exact', head: true })
        .eq('approval_status', 'pending_approval')
        .eq('payment_status', 'paid');

      if (error) throw error;

      setPendingAdsCount(count || 0);
    } catch (error) {
      console.error('Error fetching pending ads count:', error);
      setPendingAdsCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [isModerator]);

  useEffect(() => {
    if (!isModerator || !appUser) {
      setIsLoading(false);
      setPendingAdsCount(0);
      return;
    }

    fetchPendingAdsCount();

    // Configurar real-time subscription para atualizar contagem quando novos anúncios são criados
    const channel = supabase.channel('ad-approval-realtime-channel');
    
    channel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'anuncios',
        filter: 'approval_status=eq.pending_approval'
      }, () => {
        fetchPendingAdsCount();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'anuncios',
        filter: 'approval_status=eq.pending_approval'
      }, () => {
        fetchPendingAdsCount();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'anuncios',
        filter: 'approval_status=neq.pending_approval'
      }, () => {
        fetchPendingAdsCount();
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          // Silenciar erros de rede
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isModerator, appUser, fetchPendingAdsCount]);

  return {
    pendingAdsCount,
    isLoading,
    refetchPendingAdsCount: fetchPendingAdsCount,
  };
};


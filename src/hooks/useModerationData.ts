import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';
import { User } from '@/types';
import * as api from '@/src/services/api';

export const useModerationData = (appUser: User | null) => {
  const { addToast } = useToast();
  const [moderationQueue, setModerationQueue] = useState<any[]>([]);
  const [appealsQueue, setAppealsQueue] = useState<any[]>([]);
  const [pendingModerationCount, setPendingModerationCount] = useState(0);
  const [pendingAppealsCount, setPendingAppealsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const isModerator = appUser?.role === 'admin' || appUser?.role === 'moderator';

  const fetchModerationQueue = useCallback(async () => {
    if (!isModerator) return;
    try {
      // Buscar posts/comentários
      const { data, error } = await api.fetchModerationQueue();
      if (error) throw error;
      const queueData = data || [];
      setModerationQueue(queueData);
      
      // Buscar eventos da timeline
      const { data: timelineData, error: timelineError } = await api.fetchTimelineModerationQueue();
      if (timelineError) throw timelineError;
      const timelineQueueData = timelineData || [];
      
      // Somar ambos
      setPendingModerationCount(queueData.length + timelineQueueData.length);
    } catch (error) {
      // Error log removed for production
      setIsLoading(false);
      addToast('Erro ao buscar dados de moderação.', 'error');
    }
  }, [isModerator, addToast]);

  const fetchAppealsQueue = useCallback(async () => {
    if (!isModerator) return;
    try {
      const { data, error } = await api.fetchAppealsQueue();
      if (error) throw error;
      const appealsData = data || [];
      setAppealsQueue(appealsData);
      setPendingAppealsCount(appealsData.length);
    } catch (error) {
      // Error log removed for production
      setIsLoading(false);
      addToast('Erro ao buscar dados de moderação.', 'error');
    }
  }, [isModerator, addToast]);

  const refetchModerationData = useCallback(() => {
    fetchModerationQueue();
    fetchAppealsQueue();
  }, [fetchModerationQueue, fetchAppealsQueue]);

  useEffect(() => {
    if (!isModerator || !appUser) {
      setIsLoading(false);
      setModerationQueue([]);
      setAppealsQueue([]);
      setPendingModerationCount(0);
      setPendingAppealsCount(0);
      return;
    }

    setIsLoading(true);
    Promise.all([fetchModerationQueue(), fetchAppealsQueue()]).finally(() => setIsLoading(false));

    // Only set up real-time channels if user is authenticated and is a moderator
    const moderationChannel = supabase.channel('moderation-realtime-channel');
    moderationChannel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'moderation_queue' },
        async (payload) => {
          const { data: author, error } = await supabase.from('profiles').select('*').eq('id', payload.new.author_id).single();
          if (error) { /* Error log removed for production */ return; }
          
          const newItem = { ...payload.new, author };
          setModerationQueue(prev => [newItem, ...prev]);
          // Incrementar apenas posts/comentários (timeline já é contado separadamente)
          setPendingModerationCount(prev => prev + 1);
          addToast('Novo item na fila de moderação!', 'info');
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'moderation_queue' },
        (payload) => {
          if (payload.old.status === 'pending' && payload.new.status !== 'pending') {
            setModerationQueue(prev => prev.filter(item => item.id !== payload.new.id));
            // Decrementar apenas posts/comentários (timeline já é contado separadamente)
            setPendingModerationCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          // Warning log removed for production
        }
      });

    const appealsChannel = supabase.channel('appeals-realtime-channel');
    appealsChannel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'moderation_appeals' },
        async (payload) => {
          const { data: fullAppeal, error } = await supabase.from('moderation_appeals').select('*, violation:violation_id(*), user:user_id(*)').eq('id', payload.new.id).single();
          if (error) { /* Error log removed for production */ return; }

          setAppealsQueue(prev => [fullAppeal, ...prev]);
          setPendingAppealsCount(prev => prev + 1);
          addToast('Nova apelação recebida!', 'info');
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'moderation_appeals' },
        (payload) => {
          if (payload.old.status === 'pending' && payload.new.status !== 'pending') {
            setAppealsQueue(prev => prev.filter(item => item.id !== payload.new.id));
            setPendingAppealsCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          // Warning log removed for production
        }
      });

    // TIMELINE EVENTS - Exatamente igual aos posts/comentários
    const timelineChannel = supabase.channel('timeline-moderation-realtime-channel');
    timelineChannel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'timeline_moderation_queue' },
        async (payload) => {
          // Apenas incrementar se for pending
          if (payload.new.status === 'pending') {
            setPendingModerationCount(prev => prev + 1);
            addToast('Novo evento da timeline aguardando moderação!', 'info');
          }
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'timeline_moderation_queue' },
        (payload) => {
          // Decrementar quando evento for aprovado ou rejeitado
          if (payload.new.status === 'approved' || payload.new.status === 'rejected') {
            setPendingModerationCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          // Warning log removed for production
        }
      });

    return () => {
      moderationChannel.unsubscribe();
      appealsChannel.unsubscribe();
      timelineChannel.unsubscribe();
    };
  }, [isModerator, appUser, addToast, fetchModerationQueue, fetchAppealsQueue]);

  return {
    moderationQueue,
    appealsQueue,
    pendingModerationCount,
    pendingAppealsCount,
    isLoadingModeration: isLoading,
    refetchModerationData,
  };
};
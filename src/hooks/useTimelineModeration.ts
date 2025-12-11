import { useState, useEffect, useCallback } from 'react';
import { TimelineModerationQueueItem } from '@/types';
import { fetchTimelineModerationQueue } from '../services/api';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';

export const useTimelineModeration = (userId: string | null, userRole: string | null) => {
  const { addToast } = useToast();
  const [queue, setQueue] = useState<TimelineModerationQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  const isModerator = userRole === 'admin' || userRole === 'moderator';

  const loadQueue = useCallback(async () => {
    if (!isModerator) {
      setQueue([]);
      setCount(0);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await fetchTimelineModerationQueue();
      if (error) throw error;
      setQueue(data || []);
      setCount(data?.length || 0);
    } catch (err) {
      console.error('Erro ao carregar fila de moderação de timeline:', err);
    } finally {
      setLoading(false);
    }
  }, [isModerator]);

  useEffect(() => {
    if (!isModerator || !userId) {
      setLoading(false);
      return;
    }

    loadQueue();

    // Realtime subscription para novos eventos na fila
    const channel = supabase
      .channel(`timeline-moderation-${userId}`) // Canal único por usuário
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'timeline_moderation_queue'
        },
        async (payload) => {
          // Verificar se é pending antes de adicionar
          if (payload.new.status !== 'pending') {
            return;
          }
          
          // Buscar dados do autor
          const { data: author } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.new.author_id)
            .single();

          const newItem = { ...payload.new, author } as TimelineModerationQueueItem;
          setQueue((prev) => [newItem, ...prev]);
          setCount((prev) => prev + 1);
          addToast('Novo evento da timeline aguardando moderação!', 'info');
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'timeline_moderation_queue' },
        (payload) => {
          const isNowPending = payload.new.status === 'pending';
          
          // Se não é mais pending, remover da fila e decrementar
          if (!isNowPending) {
            setQueue((prevQueue) => {
              const wasInQueue = prevQueue.some(item => item.id === payload.new.id);
              
              if (wasInQueue) {
                setCount((prevCount) => Math.max(0, prevCount - 1));
                return prevQueue.filter((item) => item.id !== payload.new.id);
              }
              
              return prevQueue;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isModerator, userId, loadQueue, addToast]);

  return {
    queue,
    loading,
    count,
    refetch: loadQueue
  };
};

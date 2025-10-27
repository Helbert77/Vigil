import { useState, useEffect, useCallback, useRef } from 'react';
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
      const { data, error } = await api.fetchModerationQueue();
      if (error) throw error;
      const queueData = data || [];
      setModerationQueue(queueData);
      setPendingModerationCount(queueData.length);
    } catch (error) {
      console.error("[useModerationData] Erro ao buscar fila de moderação:", error);
      addToast('Erro ao carregar a fila de moderação.', 'error');
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
      console.error("[useModerationData] Erro ao buscar fila de apelações:", error);
      addToast('Erro ao carregar a fila de apelações.', 'error');
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
          if (error) { console.error("[Real-time MODERAÇÃO] Erro ao buscar autor do novo item", error); return; }
          
          const newItem = { ...payload.new, author };
          setModerationQueue(prev => [newItem, ...prev]);
          setPendingModerationCount(prev => prev + 1);
          addToast('Novo item na fila de moderação!', 'info');
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'moderation_queue' },
        (payload) => {
          if (payload.old.status === 'pending' && payload.new.status !== 'pending') {
            setModerationQueue(prev => prev.filter(item => item.id !== payload.new.id));
            setPendingModerationCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Real-time MODERAÇÃO] ✅ Canal conectado com sucesso');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`[Real-time MODERAÇÃO] ⚠️ Erro de conexão com o canal: ${status}. Funcionalidade em tempo real desabilitada.`);
        }
      });

    const appealsChannel = supabase.channel('appeals-realtime-channel');
    appealsChannel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'moderation_appeals' },
        async (payload) => {
          const { data: fullAppeal, error } = await supabase.from('moderation_appeals').select('*, violation:violation_id(*), user:user_id(*)').eq('id', payload.new.id).single();
          if (error) { console.error("[Real-time APELAÇÕES] Erro ao buscar detalhes da nova apelação", error); return; }

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
        if (status === 'SUBSCRIBED') {
          console.log('[Real-time APELAÇÕES] ✅ Canal conectado com sucesso');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`[Real-time APELAÇÕES] ⚠️ Erro de conexão com o canal: ${status}. Funcionalidade em tempo real desabilitada.`);
        }
      });

    return () => {
      moderationChannel.unsubscribe();
      appealsChannel.unsubscribe();
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
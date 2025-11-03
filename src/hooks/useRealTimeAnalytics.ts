import { useState, useEffect, useCallback, useRef } from 'react';
import { realTimeAnalytics, RealTimeStats, AnalyticsSubscription } from '../services/RealTimeAnalytics';
import { logger } from '../utils/Logger';

export interface UseRealTimeAnalyticsOptions {
  itemId: string;
  autoStart?: boolean;
  onError?: (error: Error) => void;
  onUpdate?: (stats: RealTimeStats) => void;
}

export interface UseRealTimeAnalyticsReturn {
  stats: RealTimeStats | null;
  isLoading: boolean;
  isUpdating: boolean;
  isActive: boolean;
  error: Error | null;
  lastUpdate: Date | null;
  activityLevel: 'normal' | 'peak';
  updateInterval: number;
  retry: () => void;
  start: () => void;
  stop: () => void;
  incrementView: () => Promise<void>;
  incrementDownload: () => Promise<void>;
}

/**
 * Hook para gerenciar analytics em tempo real
 * Fornece atualizações automáticas, tratamento de erros e controle de estado
 */
export function useRealTimeAnalytics(
  options: UseRealTimeAnalyticsOptions
): UseRealTimeAnalyticsReturn {
  const {
    itemId,
    autoStart = true,
    onError,
    onUpdate
  } = options;

  // Estados
  const [stats, setStats] = useState<RealTimeStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isActive, setIsActive] = useState(false);

  // Refs para evitar stale closures
  const subscriptionRef = useRef<AnalyticsSubscription | null>(null);
  const onErrorRef = useRef(onError);
  const onUpdateRef = useRef(onUpdate);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Atualiza refs quando props mudam
  useEffect(() => {
    onErrorRef.current = onError;
    onUpdateRef.current = onUpdate;
  }, [onError, onUpdate]);

  // Callback para lidar com atualizações de stats
  const handleStatsUpdate = useCallback((newStats: RealTimeStats) => {
    try {
      setStats(newStats);
      setLastUpdate(new Date());
      setError(null);
      
      // Atualiza estado de loading baseado no isUpdating
      setIsLoading(newStats.isUpdating);

      // Chama callback personalizado se fornecido
      if (onUpdateRef.current) {
        onUpdateRef.current(newStats);
      }

      logger.debug('Stats atualizados via hook', {
        itemId,
        views: newStats.views,
        downloads: newStats.downloads,
        isUpdating: newStats.isUpdating
      }, 'library', 'useRealTimeAnalytics');

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao processar atualização de stats');
      handleError(error);
    }
  }, [itemId]);

  // Função para lidar com erros
  const handleError = useCallback((err: Error) => {
    setError(err);
    setIsLoading(false);
    
    logger.error('Erro no hook de analytics', err, 'library', 'useRealTimeAnalytics');

    // Chama callback de erro se fornecido
    if (onErrorRef.current) {
      onErrorRef.current(err);
    }
  }, []);

  // Função para iniciar o monitoramento
  const start = useCallback(async () => {
    if (isActive || !itemId) return;

    try {
      setIsLoading(true);
      setError(null);
      setIsActive(true);

      // Limpa subscription anterior se existir
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }

      // Cria nova subscription
      const subscription = await realTimeAnalytics.subscribe(itemId, handleStatsUpdate);
      subscriptionRef.current = subscription;

      logger.info('Analytics em tempo real iniciado', { itemId }, 'library', 'useRealTimeAnalytics');

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao iniciar analytics');
      handleError(error);
      setIsActive(false);
    }
  }, [itemId, isActive, handleStatsUpdate, handleError]);

  // Função para parar o monitoramento
  const stop = useCallback(() => {
    if (!isActive) return;

    try {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      setIsActive(false);
      setIsLoading(false);

      logger.info('Analytics em tempo real parado', { itemId }, 'library', 'useRealTimeAnalytics');

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao parar analytics');
      handleError(error);
    }
  }, [isActive, itemId, handleError]);

  // Função para retry em caso de erro
  const retry = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    // Retry com backoff exponencial
    retryTimeoutRef.current = setTimeout(() => {
      if (isActive) {
        stop();
      }
      start();
    }, 2000);

    logger.info('Retry de analytics agendado', { itemId }, 'library', 'useRealTimeAnalytics');
  }, [itemId, isActive, start, stop]);

  // Função para incrementar visualizações
  const incrementView = useCallback(async () => {
    try {
      await realTimeAnalytics.incrementView(itemId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao incrementar visualização');
      handleError(error);
      throw error;
    }
  }, [itemId, handleError]);

  // Função para incrementar downloads
  const incrementDownload = useCallback(async () => {
    try {
      await realTimeAnalytics.incrementDownload(itemId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao incrementar download');
      handleError(error);
      throw error;
    }
  }, [itemId, handleError]);

  // Obtém informações sobre o nível de atividade
  const activityInfo = realTimeAnalytics.getActivityLevel();

  // Auto-start se habilitado
  useEffect(() => {
    if (autoStart && itemId && !isActive) {
      start();
    }

    return () => {
      if (isActive) {
        stop();
      }
    };
  }, [itemId, autoStart]); // Removido start, stop, isActive para evitar loops

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    stats,
    isLoading,
    isUpdating: stats?.isUpdating || false,
    isActive,
    error,
    lastUpdate,
    activityLevel: activityInfo.level,
    updateInterval: activityInfo.updateInterval,
    retry,
    start,
    stop,
    incrementView,
    incrementDownload
  };
}
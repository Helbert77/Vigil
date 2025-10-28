import { useState, useEffect, useCallback, useMemo } from 'react';
import { formatTimeAgo } from '@/src/utils/timeUtils';

/**
 * Hook otimizado para formatação de tempo com atualizações dinâmicas inteligentes
 * - Atualiza a cada minuto apenas para posts com menos de 1 hora
 * - Atualiza a cada hora para posts entre 1-24 horas
 * - Atualiza a cada dia para posts mais antigos
 * - Usa memoização para otimizar performance
 */
export const useTimeAgoOptimized = (timestamp: string) => {
  const [timeAgo, setTimeAgo] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // Calcula o intervalo de atualização baseado na idade do post
  const getUpdateInterval = useCallback((postDate: Date): number => {
    const now = new Date();
    const diffInMs = now.getTime() - postDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // Posts com menos de 1 hora: atualiza a cada minuto
    if (diffInMinutes < 60) {
      return 60000; // 1 minuto
    }
    
    // Posts entre 1-24 horas: atualiza a cada hora
    if (diffInHours < 24) {
      return 3600000; // 1 hora
    }
    
    // Posts entre 1-7 dias: atualiza a cada 6 horas
    if (diffInDays < 7) {
      return 21600000; // 6 horas
    }
    
    // Posts mais antigos: atualiza a cada 24 horas
    return 86400000; // 24 horas
  }, []);

  // Função memoizada para calcular o tempo
  const calculateTimeAgo = useCallback(() => {
    const formattedTime = formatTimeAgo(timestamp);
    if (formattedTime && formattedTime !== timeAgo) {
      setTimeAgo(formattedTime);
      setLastUpdate(Date.now());
    }
    return formattedTime;
  }, [timestamp, timeAgo]);

  // Memoiza a data do post para evitar recálculos desnecessários
  const postDate = useMemo(() => {
    try {
      return new Date(timestamp);
    } catch {
      return new Date();
    }
  }, [timestamp]);

  useEffect(() => {
    // Calcula imediatamente
    calculateTimeAgo();
    
    // Define o intervalo baseado na idade do post
    const interval = getUpdateInterval(postDate);
    
    // Configura o timer para atualizações
    const timer = setInterval(() => {
      calculateTimeAgo();
    }, interval);

    return () => clearInterval(timer);
  }, [timestamp, calculateTimeAgo, getUpdateInterval, postDate]);

  // Força uma atualização se o timestamp mudou
  useEffect(() => {
    calculateTimeAgo();
  }, [timestamp, calculateTimeAgo]);

  return {
    timeAgo,
    lastUpdate,
    refresh: calculateTimeAgo
  };
};

/**
 * Hook simplificado que retorna apenas o tempo formatado
 * Para casos onde não é necessário controle adicional
 */
export const useSimpleTimeAgo = (timestamp: string): string => {
  const { timeAgo } = useTimeAgoOptimized(timestamp);
  return timeAgo;
};
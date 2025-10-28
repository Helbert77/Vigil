import { useState, useEffect } from 'react';

export const useTimeAgo = (timestamp: string) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const calculateTimeAgo = () => {
      const now = new Date();
      const postTime = new Date(timestamp);
      const diffInMs = now.getTime() - postTime.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

      if (diffInHours < 1) {
        setTimeAgo('0h');
      } else {
        setTimeAgo(`${diffInHours}h`);
      }
    };

    calculateTimeAgo();
    
    // Atualiza a cada minuto para manter o tempo dinâmico
    const interval = setInterval(calculateTimeAgo, 60000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return timeAgo;
};
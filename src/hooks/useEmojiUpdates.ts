import { useState, useEffect, useCallback } from 'react';
import EmojiUpdateService, { UpdateResponse } from '../services/EmojiUpdateService';
import { EmojiData } from '../data/emojis';
import { StickerData } from '../data/stickers';

interface UseEmojiUpdatesReturn {
  isChecking: boolean;
  hasUpdates: boolean;
  updateData: UpdateResponse | null;
  lastCheck: Date | null;
  checkForUpdates: () => Promise<void>;
  applyUpdates: () => Promise<boolean>;
  notification: string | null;
  dismissNotification: () => void;
  serviceStatus: {
    isRunning: boolean;
    lastCheck: Date | null;
    currentVersion: string;
  };
}

interface UseEmojiUpdatesOptions {
  enableAutoUpdate?: boolean;
  enableNotifications?: boolean;
  checkInterval?: number;
  onNewEmojis?: (emojis: EmojiData[]) => void;
  onNewStickers?: (stickers: StickerData[]) => void;
  onUpdateComplete?: () => void;
}

export const useEmojiUpdates = (options: UseEmojiUpdatesOptions = {}): UseEmojiUpdatesReturn => {
  const [isChecking, setIsChecking] = useState(false);
  const [hasUpdates, setHasUpdates] = useState(false);
  const [updateData, setUpdateData] = useState<UpdateResponse | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [serviceStatus, setServiceStatus] = useState({
    isRunning: false,
    lastCheck: null as Date | null,
    currentVersion: '1.0.0'
  });

  const updateService = EmojiUpdateService.getInstance();

  // Configurar o serviço com as opções fornecidas
  useEffect(() => {
    if (options.enableAutoUpdate !== undefined || 
        options.enableNotifications !== undefined || 
        options.checkInterval !== undefined) {
      
      updateService.configure({
        enableAutoUpdate: options.enableAutoUpdate,
        enableNotifications: options.enableNotifications,
        checkInterval: options.checkInterval
      });
    }
  }, [options.enableAutoUpdate, options.enableNotifications, options.checkInterval]);

  // Inicializar o serviço
  useEffect(() => {
    updateService.startAutoUpdate();
    
    // Atualizar status inicial
    const status = updateService.getStatus();
    setServiceStatus(status);

    return () => {
      updateService.stopAutoUpdate();
    };
  }, []);

  // Listener para notificações de atualização
  useEffect(() => {
    const handleNotification = (event: CustomEvent) => {
      setNotification(event.detail.message);
    };

    const handleEmojisUpdated = (event: CustomEvent) => {
      if (options.onNewEmojis) {
        options.onNewEmojis(event.detail.newEmojis);
      }
    };

    const handleStickersUpdated = (event: CustomEvent) => {
      if (options.onNewStickers) {
        options.onNewStickers(event.detail.newStickers);
      }
    };

    window.addEventListener('emoji-update-notification', handleNotification as EventListener);
    window.addEventListener('emojis-updated', handleEmojisUpdated as EventListener);
    window.addEventListener('stickers-updated', handleStickersUpdated as EventListener);

    return () => {
      window.removeEventListener('emoji-update-notification', handleNotification as EventListener);
      window.removeEventListener('emojis-updated', handleEmojisUpdated as EventListener);
      window.removeEventListener('stickers-updated', handleStickersUpdated as EventListener);
    };
  }, [options.onNewEmojis, options.onNewStickers]);

  // Função para verificar atualizações manualmente
  const checkForUpdates = useCallback(async () => {
    setIsChecking(true);
    try {
      const response = await updateService.checkForUpdates();
      setUpdateData(response);
      setHasUpdates(response.success && !!(response.newEmojis?.length || response.newStickers?.length));
      setLastCheck(new Date());
      
      // Atualizar status do serviço
      const status = updateService.getStatus();
      setServiceStatus(status);
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Função para aplicar atualizações
  const applyUpdates = useCallback(async (): Promise<boolean> => {
    if (!updateData) return false;

    try {
      const success = await updateService.applyUpdates(updateData);
      if (success) {
        setHasUpdates(false);
        setUpdateData(null);
        if (options.onUpdateComplete) {
          options.onUpdateComplete();
        }
      }
      return success;
    } catch (error) {
      console.error('Erro ao aplicar atualizações:', error);
      return false;
    }
  }, [updateData, options.onUpdateComplete]);

  // Função para dispensar notificação
  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Atualizar status periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      const status = updateService.getStatus();
      setServiceStatus(status);
    }, 5000); // Atualizar a cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  return {
    isChecking,
    hasUpdates,
    updateData,
    lastCheck,
    checkForUpdates,
    applyUpdates,
    notification,
    dismissNotification,
    serviceStatus
  };
};

export default useEmojiUpdates;
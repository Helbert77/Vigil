import { useState, useEffect, useCallback, useMemo } from 'react';
import { EmojiData, EmojiCategory } from '../data/emojis';
import { StickerData, StickerCategory } from '../data/stickers';
import { Logger } from '../utils/Logger';

interface EmojiStickerState {
  recentEmojis: EmojiData[];
  favoriteEmojis: EmojiData[];
  recentStickers: StickerData[];
  favoriteStickers: StickerData[];
  preferences: {
    defaultSkinTone: string;
    showAnimatedStickers: boolean;
    autoSaveRecents: boolean;
    maxRecents: number;
    defaultEmojiCategory: EmojiCategory;
    defaultStickerCategory: StickerCategory;
  };
}

interface UseEmojiStickerReturn {
  // Estado
  state: EmojiStickerState;
  
  // Acesso direto aos dados (para compatibilidade com componentes)
  recentEmojis: EmojiData[];
  favoriteEmojis: EmojiData[];
  recentStickers: StickerData[];
  favoriteStickers: StickerData[];
  preferences: EmojiStickerState['preferences'];
  
  // Ações para emojis
  addToRecentEmojis: (emoji: EmojiData) => void;
  addToFavoriteEmojis: (emoji: EmojiData) => void;
  removeFromFavoriteEmojis: (emoji: EmojiData) => void;
  isEmojiInFavorites: (emoji: EmojiData) => boolean;
  clearRecentEmojis: () => void;
  
  // Ações para stickers
  addToRecentStickers: (sticker: StickerData) => void;
  addToFavoriteStickers: (sticker: StickerData) => void;
  removeFromFavoriteStickers: (sticker: StickerData) => void;
  isStickerInFavorites: (sticker: StickerData) => boolean;
  clearRecentStickers: () => void;
  
  // Preferências
  updatePreferences: (preferences: Partial<EmojiStickerState['preferences']>) => void;
  resetPreferences: () => void;
  
  // Estatísticas
  getUsageStats: () => {
    totalEmojisUsed: number;
    totalStickersUsed: number;
    favoriteEmojisCount: number;
    favoriteStickersCount: number;
    mostUsedEmoji?: EmojiData;
    mostUsedSticker?: StickerData;
  };
  
  // Utilitários
  exportData: () => string;
  importData: (data: string) => boolean;
  clearAllData: () => void;
}

const STORAGE_KEY = 'vigil-emoji-sticker-data';
const logger = Logger.getInstance();

const defaultPreferences: EmojiStickerState['preferences'] = {
  defaultSkinTone: '🏻',
  showAnimatedStickers: true,
  autoSaveRecents: true,
  maxRecents: 50,
  defaultEmojiCategory: 'smileys-emotion',
  defaultStickerCategory: 'emotions'
};

const defaultState: EmojiStickerState = {
  recentEmojis: [],
  favoriteEmojis: [],
  recentStickers: [],
  favoriteStickers: [],
  preferences: defaultPreferences
};

export const useEmojiSticker = (): UseEmojiStickerReturn => {
  const [state, setState] = useState<EmojiStickerState>(defaultState);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setState(prevState => ({
          ...prevState,
          ...parsedData,
          preferences: {
            ...defaultPreferences,
            ...parsedData.preferences
          }
        }));
        logger.info('Dados de emoji/sticker carregados do localStorage');
      }
    } catch (error) {
      logger.error('Erro ao carregar dados do localStorage:', error);
    }
  }, []);

  // Salvar dados no localStorage quando o estado mudar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      logger.error('Erro ao salvar dados no localStorage:', error);
    }
  }, [state]);

  // Função para adicionar emoji aos recentes
  const addToRecentEmojis = useCallback((emoji: EmojiData) => {
    setState(prevState => {
      if (!prevState.preferences.autoSaveRecents) return prevState;

      const filtered = prevState.recentEmojis.filter(e => e.emoji !== emoji.emoji);
      const newRecents = [emoji, ...filtered].slice(0, prevState.preferences.maxRecents);
      
      logger.debug('Emoji adicionado aos recentes:', { emoji: emoji.emoji, name: emoji.name });
      
      return {
        ...prevState,
        recentEmojis: newRecents
      };
    });
  }, []);

  // Função para adicionar emoji aos favoritos
  const addToFavoriteEmojis = useCallback((emoji: EmojiData) => {
    setState(prevState => {
      if (prevState.favoriteEmojis.some(e => e.emoji === emoji.emoji)) {
        return prevState;
      }
      
      logger.info('Emoji adicionado aos favoritos:', { emoji: emoji.emoji, name: emoji.name });
      
      return {
        ...prevState,
        favoriteEmojis: [...prevState.favoriteEmojis, emoji]
      };
    });
  }, []);

  // Função para remover emoji dos favoritos
  const removeFromFavoriteEmojis = useCallback((emoji: EmojiData) => {
    setState(prevState => {
      const filtered = prevState.favoriteEmojis.filter(e => e.emoji !== emoji.emoji);
      
      logger.info('Emoji removido dos favoritos:', { emoji: emoji.emoji, name: emoji.name });
      
      return {
        ...prevState,
        favoriteEmojis: filtered
      };
    });
  }, []);

  // Verificar se emoji está nos favoritos
  const isEmojiInFavorites = useCallback((emoji: EmojiData): boolean => {
    return state.favoriteEmojis.some(e => e.emoji === emoji.emoji);
  }, [state.favoriteEmojis]);

  // Limpar emojis recentes
  const clearRecentEmojis = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      recentEmojis: []
    }));
    logger.info('Emojis recentes limpos');
  }, []);

  // Função para adicionar sticker aos recentes
  const addToRecentStickers = useCallback((sticker: StickerData) => {
    setState(prevState => {
      if (!prevState.preferences.autoSaveRecents) return prevState;

      const filtered = prevState.recentStickers.filter(s => s.id !== sticker.id);
      const newRecents = [sticker, ...filtered].slice(0, prevState.preferences.maxRecents);
      
      logger.debug('Sticker adicionado aos recentes:', { id: sticker.id, name: sticker.name });
      
      return {
        ...prevState,
        recentStickers: newRecents
      };
    });
  }, []);

  // Função para adicionar sticker aos favoritos
  const addToFavoriteStickers = useCallback((sticker: StickerData) => {
    setState(prevState => {
      if (prevState.favoriteStickers.some(s => s.id === sticker.id)) {
        return prevState;
      }
      
      logger.info('Sticker adicionado aos favoritos:', { id: sticker.id, name: sticker.name });
      
      return {
        ...prevState,
        favoriteStickers: [...prevState.favoriteStickers, sticker]
      };
    });
  }, []);

  // Função para remover sticker dos favoritos
  const removeFromFavoriteStickers = useCallback((sticker: StickerData) => {
    setState(prevState => {
      const filtered = prevState.favoriteStickers.filter(s => s.id !== sticker.id);
      
      logger.info('Sticker removido dos favoritos:', { id: sticker.id, name: sticker.name });
      
      return {
        ...prevState,
        favoriteStickers: filtered
      };
    });
  }, []);

  // Verificar se sticker está nos favoritos
  const isStickerInFavorites = useCallback((sticker: StickerData): boolean => {
    return state.favoriteStickers.some(s => s.id === sticker.id);
  }, [state.favoriteStickers]);

  // Limpar stickers recentes
  const clearRecentStickers = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      recentStickers: []
    }));
    logger.info('Stickers recentes limpos');
  }, []);

  // Atualizar preferências
  const updatePreferences = useCallback((newPreferences: Partial<EmojiStickerState['preferences']>) => {
    setState(prevState => ({
      ...prevState,
      preferences: {
        ...prevState.preferences,
        ...newPreferences
      }
    }));
    logger.info('Preferências atualizadas:', newPreferences);
  }, []);

  // Resetar preferências
  const resetPreferences = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      preferences: defaultPreferences
    }));
    logger.info('Preferências resetadas para padrão');
  }, []);

  // Obter estatísticas de uso
  const getUsageStats = useCallback(() => {
    const emojiUsageCount: Record<string, number> = {};
    const stickerUsageCount: Record<string, number> = {};

    // Contar uso de emojis (baseado na posição nos recentes - mais recente = mais usado)
    state.recentEmojis.forEach((emoji, index) => {
      const weight = state.recentEmojis.length - index;
      emojiUsageCount[emoji.emoji] = (emojiUsageCount[emoji.emoji] || 0) + weight;
    });

    // Contar uso de stickers
    state.recentStickers.forEach((sticker, index) => {
      const weight = state.recentStickers.length - index;
      stickerUsageCount[sticker.id] = (stickerUsageCount[sticker.id] || 0) + weight;
    });

    // Encontrar mais usados
    const mostUsedEmojiKey = Object.keys(emojiUsageCount).reduce((a, b) => 
      emojiUsageCount[a] > emojiUsageCount[b] ? a : b, ''
    );
    const mostUsedStickerKey = Object.keys(stickerUsageCount).reduce((a, b) => 
      stickerUsageCount[a] > stickerUsageCount[b] ? a : b, ''
    );

    const mostUsedEmoji = state.recentEmojis.find(e => e.emoji === mostUsedEmojiKey);
    const mostUsedSticker = state.recentStickers.find(s => s.id === mostUsedStickerKey);

    return {
      totalEmojisUsed: state.recentEmojis.length,
      totalStickersUsed: state.recentStickers.length,
      favoriteEmojisCount: state.favoriteEmojis.length,
      favoriteStickersCount: state.favoriteStickers.length,
      mostUsedEmoji,
      mostUsedSticker
    };
  }, [state]);

  // Exportar dados
  const exportData = useCallback((): string => {
    try {
      const exportData = {
        ...state,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      const jsonString = JSON.stringify(exportData, null, 2);
      logger.info('Dados exportados com sucesso');
      return jsonString;
    } catch (error) {
      logger.error('Erro ao exportar dados:', error);
      return '';
    }
  }, [state]);

  // Importar dados
  const importData = useCallback((data: string): boolean => {
    try {
      const parsedData = JSON.parse(data);
      
      // Validar estrutura básica
      if (!parsedData.recentEmojis || !parsedData.favoriteEmojis || 
          !parsedData.recentStickers || !parsedData.favoriteStickers) {
        throw new Error('Estrutura de dados inválida');
      }

      setState({
        recentEmojis: parsedData.recentEmojis || [],
        favoriteEmojis: parsedData.favoriteEmojis || [],
        recentStickers: parsedData.recentStickers || [],
        favoriteStickers: parsedData.favoriteStickers || [],
        preferences: {
          ...defaultPreferences,
          ...parsedData.preferences
        }
      });

      logger.info('Dados importados com sucesso');
      return true;
    } catch (error) {
      logger.error('Erro ao importar dados:', error);
      return false;
    }
  }, []);

  // Limpar todos os dados
  const clearAllData = useCallback(() => {
    setState(defaultState);
    localStorage.removeItem(STORAGE_KEY);
    logger.info('Todos os dados foram limpos');
  }, []);

  // Memoizar o retorno para evitar re-renders desnecessários
  const returnValue = useMemo(() => ({
    // Estado expandido para acesso direto
    state,
    recentEmojis: state.recentEmojis,
    favoriteEmojis: state.favoriteEmojis,
    recentStickers: state.recentStickers,
    favoriteStickers: state.favoriteStickers,
    preferences: state.preferences,
    
    // Ações para emojis
    addToRecentEmojis,
    addToFavoriteEmojis,
    removeFromFavoriteEmojis,
    isEmojiInFavorites,
    clearRecentEmojis,
    
    // Ações para stickers
    addToRecentStickers,
    addToFavoriteStickers,
    removeFromFavoriteStickers,
    isStickerInFavorites,
    clearRecentStickers,
    
    // Preferências
    updatePreferences,
    resetPreferences,
    
    // Estatísticas e utilitários
    getUsageStats,
    exportData,
    importData,
    clearAllData
  }), [
    state,
    addToRecentEmojis,
    addToFavoriteEmojis,
    removeFromFavoriteEmojis,
    isEmojiInFavorites,
    clearRecentEmojis,
    addToRecentStickers,
    addToFavoriteStickers,
    removeFromFavoriteStickers,
    isStickerInFavorites,
    clearRecentStickers,
    updatePreferences,
    resetPreferences,
    getUsageStats,
    exportData,
    importData,
    clearAllData
  ]);

  return returnValue;
};

export default useEmojiSticker;
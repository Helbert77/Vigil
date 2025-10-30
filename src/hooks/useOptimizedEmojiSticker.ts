import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { EmojiData } from '@/src/data/emojis';
import { StickerData } from '@/src/data/stickers';
import { 
  emojiStickerCache, 
  intelligentPreloader, 
  performanceMonitor,
  debounce,
  throttle,
  calculateVirtualizedItems,
  VirtualizedListProps
} from '@/src/utils/emojiOptimization';
import { useEmojiSticker } from './useEmojiSticker';

interface UseOptimizedEmojiStickerProps {
  containerHeight?: number;
  itemHeight?: number;
  preloadOnMount?: boolean;
  enableVirtualization?: boolean;
}

export function useOptimizedEmojiSticker({
  containerHeight = 300,
  itemHeight = 40,
  preloadOnMount = true,
  enableVirtualization = true
}: UseOptimizedEmojiStickerProps = {}) {
  
  // Hook base para funcionalidades básicas
  const baseHook = useEmojiSticker();
  
  // Estados para otimização
  const [isPreloading, setIsPreloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [virtualizedData, setVirtualizedData] = useState<any>(null);
  const [scrollTop, setScrollTop] = useState(0);
  
  // Refs para performance
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchRef = useRef<string>('');
  const renderCountRef = useRef(0);

  // Debounced search
  const debouncedSearch = useCallback(
    (query: string) => {
      const debouncedFn = debounce(() => {
        setDebouncedSearchQuery(query);
        const endTiming = performanceMonitor.startTiming('search-execution');
        endTiming();
      }, 300);
      debouncedFn();
    },
    []
  );

  // Throttled scroll handler
  const throttledScrollHandler = useCallback(
    (scrollTop: number) => {
      const throttledFn = throttle(() => {
        setScrollTop(scrollTop);
      }, 16); // ~60fps
      throttledFn();
    },
    []
  );

  // Preload inteligente
  const performIntelligentPreload = useCallback(async () => {
    if (isPreloading) return;
    
    setIsPreloading(true);
    const endTiming = performanceMonitor.startTiming('intelligent-preload');
    
    try {
      const recommendations = intelligentPreloader.getPreloadRecommendations();
      await intelligentPreloader.preloadStickers(recommendations);
    } catch (error) {
      console.warn('Erro no preload inteligente:', error);
    } finally {
      endTiming();
      setIsPreloading(false);
    }
  }, [isPreloading]);

  // Virtualização de listas
  const virtualizedEmojis = useMemo(() => {
    if (!enableVirtualization) return null;
    
    const endTiming = performanceMonitor.startTiming('emoji-virtualization');
    
    try {
      return calculateVirtualizedItems({
        items: baseHook.recentEmojis,
        itemHeight,
        containerHeight
      });
    } finally {
      endTiming();
    }
  }, [baseHook.recentEmojis, itemHeight, containerHeight, enableVirtualization]);

  const virtualizedStickers = useMemo(() => {
    if (!enableVirtualization) return null;
    
    const endTiming = performanceMonitor.startTiming('sticker-virtualization');
    
    try {
      return calculateVirtualizedItems({
        items: baseHook.recentStickers,
        itemHeight,
        containerHeight
      });
    } finally {
      endTiming();
    }
  }, [baseHook.recentStickers, itemHeight, containerHeight, enableVirtualization]);

  // Busca otimizada
  const searchResults = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return { emojis: [], stickers: [] };
    
    const endTiming = performanceMonitor.startTiming('search-processing');
    
    try {
      // Buscar emojis (implementação simplificada)
      const emojis = baseHook.recentEmojis.filter(emoji => 
        emoji.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        emoji.keywords.some(keyword => 
          keyword.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        )
      );

      // Buscar stickers (implementação simplificada)
      const stickers = baseHook.recentStickers.filter(sticker =>
        sticker.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        sticker.keywords.some((keyword: string) => 
          keyword.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        )
      );

      return { emojis, stickers };
    } finally {
      endTiming();
    }
  }, [debouncedSearchQuery, baseHook.recentEmojis, baseHook.recentStickers]);

  // Handlers otimizados
  const optimizedEmojiSelect = useCallback((emoji: EmojiData) => {
    const endTiming = performanceMonitor.startTiming('emoji-selection');
    
    try {
      // Registrar uso para preload inteligente
      intelligentPreloader.recordUsage(emoji.unicode);
      
      // Cache do emoji
      emojiStickerCache.cacheEmoji(emoji);
      
      // Chamar handler original
      baseHook.addToRecentEmojis(emoji);
      
      return emoji;
    } finally {
      endTiming();
    }
  }, [baseHook]);

  const optimizedStickerSelect = useCallback((sticker: StickerData) => {
    const endTiming = performanceMonitor.startTiming('sticker-selection');
    
    try {
      // Registrar uso para preload inteligente
      intelligentPreloader.recordUsage(sticker.id);
      
      // Cache do sticker
      emojiStickerCache.cacheSticker(sticker);
      
      // Chamar handler original
      baseHook.addToRecentStickers(sticker);
      
      return sticker;
    } finally {
      endTiming();
    }
  }, [baseHook]);

  // Função para obter itens visíveis na virtualização
  const getVisibleEmojis = useCallback(() => {
    if (!virtualizedEmojis || !enableVirtualization) {
      return baseHook.recentEmojis;
    }
    
    const { visibleItems } = virtualizedEmojis.getVisibleRange(scrollTop);
    return visibleItems;
  }, [virtualizedEmojis, scrollTop, baseHook.recentEmojis, enableVirtualization]);

  const getVisibleStickers = useCallback(() => {
    if (!virtualizedStickers || !enableVirtualization) {
      return baseHook.recentStickers;
    }
    
    const { visibleItems } = virtualizedStickers.getVisibleRange(scrollTop);
    return visibleItems;
  }, [virtualizedStickers, scrollTop, baseHook.recentStickers, enableVirtualization]);

  // Função para atualizar busca
  const updateSearch = useCallback((query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  }, [debouncedSearch]);

  // Função para atualizar scroll
  const updateScroll = useCallback((newScrollTop: number) => {
    throttledScrollHandler(newScrollTop);
  }, [throttledScrollHandler]);

  // Estatísticas de performance
  const getPerformanceStats = useCallback(() => {
    return {
      cache: emojiStickerCache.getCacheStats(),
      performance: performanceMonitor.getMetrics(),
      renderCount: renderCountRef.current,
      isPreloading,
      searchQuery: debouncedSearchQuery
    };
  }, [isPreloading, debouncedSearchQuery]);

  // Limpar cache
  const clearOptimizationCache = useCallback(() => {
    emojiStickerCache.clearCache();
    performanceMonitor.clearMetrics();
    renderCountRef.current = 0;
  }, []);

  // Effects
  useEffect(() => {
    renderCountRef.current += 1;
  });

  useEffect(() => {
    if (preloadOnMount) {
      performIntelligentPreload();
    }
  }, [preloadOnMount, performIntelligentPreload]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Funcionalidades básicas do hook original
    ...baseHook,
    
    // Funcionalidades otimizadas
    searchQuery,
    searchResults,
    isPreloading,
    
    // Virtualização
    virtualizedEmojis,
    virtualizedStickers,
    getVisibleEmojis,
    getVisibleStickers,
    
    // Handlers otimizados
    optimizedEmojiSelect,
    optimizedStickerSelect,
    updateSearch,
    updateScroll,
    
    // Preload
    performIntelligentPreload,
    
    // Estatísticas e debug
    getPerformanceStats,
    clearOptimizationCache,
    
    // Configurações
    containerHeight,
    itemHeight,
    enableVirtualization
  };
}

// Hook para componentes que precisam apenas de funcionalidades básicas otimizadas
export function useBasicOptimizedEmoji() {
  return useOptimizedEmojiSticker({
    enableVirtualization: false,
    preloadOnMount: false
  });
}

// Hook para listas grandes que precisam de virtualização
export function useVirtualizedEmojiSticker(containerHeight: number = 400) {
  return useOptimizedEmojiSticker({
    containerHeight,
    itemHeight: 48,
    enableVirtualization: true,
    preloadOnMount: true
  });
}
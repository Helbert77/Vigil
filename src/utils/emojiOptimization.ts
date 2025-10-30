import { EmojiData } from '../data/emojis';
import { StickerData, STICKER_PACKS } from '../data/stickers';

// Cache para emojis e figurinhas carregados
class EmojiStickerCache {
  private emojiCache = new Map<string, EmojiData>();
  private stickerCache = new Map<string, StickerData>();
  private preloadedCategories = new Set<string>();
  private maxCacheSize = 1000;

  // Cache de emojis
  cacheEmoji(emoji: EmojiData): void {
    if (this.emojiCache.size >= this.maxCacheSize) {
      // Remove o primeiro item (LRU básico)
      const firstKey = this.emojiCache.keys().next().value;
      if (firstKey) {
        this.emojiCache.delete(firstKey);
      }
    }
    this.emojiCache.set(emoji.unicode, emoji);
  }

  getCachedEmoji(id: string): EmojiData | undefined {
    return this.emojiCache.get(id);
  }

  // Cache de figurinhas
  cacheSticker(sticker: StickerData): void {
    if (this.stickerCache.size >= this.maxCacheSize) {
      const firstKey = this.stickerCache.keys().next().value;
      if (firstKey) {
        this.stickerCache.delete(firstKey);
      }
    }
    this.stickerCache.set(sticker.id, sticker);
  }

  getCachedSticker(id: string): StickerData | undefined {
    return this.stickerCache.get(id);
  }

  // Preload de categorias
  markCategoryAsPreloaded(category: string): void {
    this.preloadedCategories.add(category);
  }

  isCategoryPreloaded(category: string): boolean {
    return this.preloadedCategories.has(category);
  }

  // Limpar cache
  clearCache(): void {
    this.emojiCache.clear();
    this.stickerCache.clear();
    this.preloadedCategories.clear();
  }

  // Estatísticas do cache
  getCacheStats() {
    return {
      emojiCacheSize: this.emojiCache.size,
      stickerCacheSize: this.stickerCache.size,
      preloadedCategories: Array.from(this.preloadedCategories),
      maxCacheSize: this.maxCacheSize
    };
  }
}

// Instância global do cache
export const emojiStickerCache = new EmojiStickerCache();

// Virtualização para listas grandes
export interface VirtualizedListProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function calculateVirtualizedItems({
  items,
  itemHeight,
  containerHeight,
  overscan = 5
}: VirtualizedListProps) {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const totalCount = items.length;
  
  return {
    visibleCount,
    totalCount,
    overscan,
    getVisibleRange: (scrollTop: number) => {
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(startIndex + visibleCount + overscan, totalCount);
      const adjustedStartIndex = Math.max(0, startIndex - overscan);
      
      return {
        startIndex: adjustedStartIndex,
        endIndex,
        visibleItems: items.slice(adjustedStartIndex, endIndex)
      };
    }
  };
}

// Lazy loading para imagens de figurinhas
export class LazyImageLoader {
  private loadedImages = new Set<string>();
  private loadingImages = new Map<string, Promise<void>>();
  private observer: IntersectionObserver | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              const src = img.dataset.src;
              if (src && !this.loadedImages.has(src)) {
                this.loadImage(src, img);
              }
            }
          });
        },
        {
          rootMargin: '50px',
          threshold: 0.1
        }
      );
    }
  }

  observeImage(img: HTMLImageElement): void {
    if (this.observer) {
      this.observer.observe(img);
    }
  }

  unobserveImage(img: HTMLImageElement): void {
    if (this.observer) {
      this.observer.unobserve(img);
    }
  }

  private async loadImage(src: string, img: HTMLImageElement): Promise<void> {
    if (this.loadingImages.has(src)) {
      return this.loadingImages.get(src);
    }

    const loadPromise = new Promise<void>((resolve, reject) => {
      const tempImg = new Image();
      tempImg.onload = () => {
        img.src = src;
        img.classList.remove('loading');
        img.classList.add('loaded');
        this.loadedImages.add(src);
        resolve();
      };
      tempImg.onerror = () => {
        img.classList.add('error');
        reject(new Error(`Failed to load image: ${src}`));
      };
      tempImg.src = src;
    });

    this.loadingImages.set(src, loadPromise);
    
    try {
      await loadPromise;
    } finally {
      this.loadingImages.delete(src);
    }
  }

  preloadImages(urls: string[]): Promise<void[]> {
    return Promise.all(
      urls.map(url => {
        if (this.loadedImages.has(url)) {
          return Promise.resolve();
        }
        
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            this.loadedImages.add(url);
            resolve();
          };
          img.onerror = () => reject(new Error(`Failed to preload: ${url}`));
          img.src = url;
        });
      })
    );
  }

  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.loadedImages.clear();
    this.loadingImages.clear();
  }
}

// Instância global do lazy loader
export const lazyImageLoader = new LazyImageLoader();

// Debounce para busca
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle para scroll
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Preload inteligente baseado em uso
export class IntelligentPreloader {
  private usageStats = new Map<string, number>();
  private lastUsed = new Map<string, number>();
  private preloadQueue: string[] = [];
  private isPreloading = false;

  recordUsage(id: string): void {
    const currentCount = this.usageStats.get(id) || 0;
    this.usageStats.set(id, currentCount + 1);
    this.lastUsed.set(id, Date.now());
  }

  getPopularItems(limit: number = 20): string[] {
    return Array.from(this.usageStats.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id]) => id);
  }

  getRecentItems(limit: number = 10): string[] {
    return Array.from(this.lastUsed.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id]) => id);
  }

  async preloadStickers(stickerIds: string[]): Promise<void> {
    if (this.isPreloading) return;
    
    this.isPreloading = true;
    this.preloadQueue = [...stickerIds];

    try {
      const stickersToPreload = this.preloadQueue
        .map(id => STICKER_PACKS.flatMap(pack => pack.stickers).find(s => s.id === id))
        .filter(Boolean) as StickerData[];

      const imageUrls = stickersToPreload
        .filter(sticker => sticker.url && !sticker.url.startsWith('data:'))
        .map(sticker => sticker.url);

      if (imageUrls.length > 0) {
        await lazyImageLoader.preloadImages(imageUrls);
      }

      // Cache os stickers precarregados
      stickersToPreload.forEach(sticker => {
        emojiStickerCache.cacheSticker(sticker);
      });

    } catch (error) {
      console.warn('Erro no preload de stickers:', error);
    } finally {
      this.isPreloading = false;
      this.preloadQueue = [];
    }
  }

  getPreloadRecommendations(): string[] {
    const popular = this.getPopularItems(10);
    const recent = this.getRecentItems(5);
    
    // Combina itens populares e recentes, removendo duplicatas
    const combined = recent.concat(popular);
    return Array.from(new Set(combined));
  }
}

// Instância global do preloader
export const intelligentPreloader = new IntelligentPreloader();

// Otimização de renderização
export const RenderOptimizations = {
  // Memoização de componentes de emoji
  shouldEmojiUpdate: (prevProps: any, nextProps: any) => {
    return (
      prevProps.emoji.unicode !== nextProps.emoji.unicode ||
      prevProps.isSelected !== nextProps.isSelected ||
      prevProps.isFavorite !== nextProps.isFavorite
    );
  },

  // Memoização de componentes de sticker
  shouldStickerUpdate: (prevProps: any, nextProps: any) => {
    return (
      prevProps.sticker.id !== nextProps.sticker.id ||
      prevProps.isSelected !== nextProps.isSelected ||
      prevProps.isFavorite !== nextProps.isFavorite ||
      prevProps.isLoaded !== nextProps.isLoaded
    );
  },

  // Otimização de listas
  getItemKey: (item: EmojiData | StickerData, index: number) => {
    // StickerData tem 'id', EmojiData tem 'shortcode'
    const identifier = 'id' in item ? item.id : item.shortcode;
    return `${identifier}-${index}`;
  }
};

// Monitoramento de performance
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>();

  startTiming(label: string): () => void {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const duration = end - start;
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      
      const times = this.metrics.get(label)!;
      times.push(duration);
      
      // Manter apenas os últimos 100 registros
      if (times.length > 100) {
        times.shift();
      }
    };
  }

  getAverageTime(label: string): number {
    const times = this.metrics.get(label);
    if (!times || times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  getMetrics(): Record<string, { average: number; count: number; latest: number }> {
    const result: Record<string, { average: number; count: number; latest: number }> = {};
    
    this.metrics.forEach((times, label) => {
      result[label] = {
        average: this.getAverageTime(label),
        count: times.length,
        latest: times[times.length - 1] || 0
      };
    });
    
    return result;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

// Instância global do monitor
export const performanceMonitor = new PerformanceMonitor();
import React, { memo, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { EmojiData } from '@/src/data/emojis';
import { StickerData } from '@/src/data/stickers';
import { lazyImageLoader, RenderOptimizations } from '@/src/utils/emojiOptimization';

// Helper function to get unique ID for items
const getItemId = (item: EmojiData | StickerData): string => {
  if ('id' in item) {
    return item.id; // StickerData has id
  } else {
    return item.unicode; // EmojiData uses unicode as unique identifier
  }
};

interface VirtualizedEmojiGridProps {
  items: (EmojiData | StickerData)[];
  onItemSelect: (item: EmojiData | StickerData) => void;
  onItemFavorite?: (item: EmojiData | StickerData) => void;
  favoriteItems?: Set<string>;
  containerHeight: number;
  itemSize: number;
  itemsPerRow: number;
  gap?: number;
  className?: string;
  type: 'emoji' | 'sticker';
  enableLazyLoading?: boolean;
}

// Componente individual de emoji otimizado
const EmojiItem = memo<{
  emoji: EmojiData;
  onSelect: (emoji: EmojiData) => void;
  onFavorite?: (emoji: EmojiData) => void;
  isFavorite: boolean;
  size: number;
}>(({ emoji, onSelect, onFavorite, isFavorite, size }) => {
  const handleClick = useCallback(() => {
    onSelect(emoji);
  }, [emoji, onSelect]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(emoji);
  }, [emoji, onFavorite]);

  return (
    <div
      className="relative group cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-1 transition-colors duration-150"
      onClick={handleClick}
      style={{ width: size, height: size }}
      title={`${emoji.name} - ${emoji.shortcode}`}
    >
      <div className="flex items-center justify-center w-full h-full text-2xl">
        {emoji.emoji}
      </div>
      
      {onFavorite && (
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-0 right-0 w-4 h-4 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${
            isFavorite 
              ? 'bg-yellow-400 text-white' 
              : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
          }`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      )}
    </div>
  );
}, RenderOptimizations.shouldEmojiUpdate);

// Componente individual de sticker otimizado
const StickerItem = memo<{
  sticker: StickerData;
  onSelect: (sticker: StickerData) => void;
  onFavorite?: (sticker: StickerData) => void;
  isFavorite: boolean;
  size: number;
  enableLazyLoading: boolean;
}>(({ sticker, onSelect, onFavorite, isFavorite, size, enableLazyLoading }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleClick = useCallback(() => {
    onSelect(sticker);
  }, [sticker, onSelect]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(sticker);
  }, [sticker, onFavorite]);

  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
  }, []);

  useEffect(() => {
    if (enableLazyLoading && imgRef.current) {
      lazyImageLoader.observeImage(imgRef.current);
      
      return () => {
        if (imgRef.current) {
          lazyImageLoader.unobserveImage(imgRef.current);
        }
      };
    }
  }, [enableLazyLoading]);

  return (
    <div
      className="relative group cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-1 transition-colors duration-150"
      onClick={handleClick}
      style={{ width: size, height: size }}
      title={`${sticker.name} - ${sticker.packId}`}
    >
      <div className="flex items-center justify-center w-full h-full">
        {hasError ? (
          <div className="text-gray-400 text-xs text-center">
            Error
          </div>
        ) : (
          <img
            ref={imgRef}
            src={enableLazyLoading ? undefined : sticker.url}
            data-src={enableLazyLoading ? sticker.url : undefined}
            alt={sticker.name}
            className={`max-w-full max-h-full object-contain transition-opacity duration-200 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${enableLazyLoading ? 'loading' : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading={enableLazyLoading ? 'lazy' : 'eager'}
          />
        )}
        
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      {onFavorite && (
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-0 right-0 w-4 h-4 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${
            isFavorite 
              ? 'bg-yellow-400 text-white' 
              : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
          }`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      )}
    </div>
  );
}, RenderOptimizations.shouldStickerUpdate);

// Componente principal virtualizado
const VirtualizedEmojiGrid: React.FC<VirtualizedEmojiGridProps> = ({
  items,
  onItemSelect,
  onItemFavorite,
  favoriteItems = new Set(),
  containerHeight,
  itemSize,
  itemsPerRow,
  gap = 4,
  className = '',
  type,
  enableLazyLoading = true
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calcular dimensões
  const rowHeight = itemSize + gap;
  const totalRows = Math.ceil(items.length / itemsPerRow);
  const totalHeight = totalRows * rowHeight;

  // Calcular itens visíveis
  const startRow = Math.floor(scrollTop / rowHeight);
  const endRow = Math.min(
    startRow + Math.ceil(containerHeight / rowHeight) + 2, // +2 para overscan
    totalRows
  );

  const visibleItems = [];
  for (let row = startRow; row < endRow; row++) {
    const startIndex = row * itemsPerRow;
    const endIndex = Math.min(startIndex + itemsPerRow, items.length);
    
    for (let i = startIndex; i < endIndex; i++) {
      const item = items[i];
      const rowIndex = Math.floor(i / itemsPerRow);
      const colIndex = i % itemsPerRow;
      
      visibleItems.push({
        item,
        index: i,
        style: {
          position: 'absolute' as const,
          top: rowIndex * rowHeight,
          left: colIndex * (itemSize + gap),
          width: itemSize,
          height: itemSize
        }
      });
    }
  }

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const handleItemSelect = useCallback((item: EmojiData | StickerData) => {
    onItemSelect(item);
  }, [onItemSelect]);

  const handleItemFavorite = useCallback((item: EmojiData | StickerData) => {
    onItemFavorite?.(item);
  }, [onItemFavorite]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div
        className="relative"
        style={{ 
          height: totalHeight,
          width: itemsPerRow * (itemSize + gap) - gap
        }}
      >
        {visibleItems.map(({ item, index, style }) => (
          <div key={RenderOptimizations.getItemKey(item, index)} style={style}>
            {type === 'emoji' ? (
              <EmojiItem
                emoji={item as EmojiData}
                onSelect={handleItemSelect}
                onFavorite={onItemFavorite ? handleItemFavorite : undefined}
                isFavorite={favoriteItems.has(getItemId(item))}
                size={itemSize}
              />
            ) : (
              <StickerItem
                sticker={item as StickerData}
                onSelect={handleItemSelect}
                onFavorite={onItemFavorite ? handleItemFavorite : undefined}
                isFavorite={favoriteItems.has(getItemId(item))}
                size={itemSize}
                enableLazyLoading={enableLazyLoading}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Indicador de carregamento para o final da lista */}
      {items.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <div className="text-2xl mb-2">
              {type === 'emoji' ? '😊' : '🎭'}
            </div>
            <div className="text-sm">
              {type === 'emoji' ? 'No emojis found' : 'No stickers found'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(VirtualizedEmojiGrid);
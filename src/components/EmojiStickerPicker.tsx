import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  EMOJI_DATABASE, 
  EMOJI_CATEGORIES, 
  EmojiData, 
  EmojiCategory,
  searchEmojis,
  getEmojisByCategory,
  getFavoriteEmojis,
  getRecentEmojis
} from '../data/emojis';
import {
  STICKER_PACKS,
  STICKER_CATEGORIES,
  StickerData,
  StickerPack,
  StickerCategory,
  searchStickers,
  getStickerPacksByCategory,
  getFavoriteStickers
} from '../data/stickers';
import { LazyLoadingManager } from '../utils/LazyLoadingManager';
import { Logger } from '../utils/Logger';
import VirtualizedEmojiGrid from './common/VirtualizedEmojiGrid';
import { useOptimalGridDimensions } from '../hooks/useOptimalGridDimensions';
import { useOptimizedEmojiSticker } from '../hooks/useOptimizedEmojiSticker';
import { performanceMonitor } from '../utils/emojiOptimization';
import { useEmojiUpdates } from '../hooks/useEmojiUpdates';
import EmojiUpdateNotification from './EmojiUpdateNotification';

interface EmojiStickerPickerProps {
  onEmojiSelect: (emoji: EmojiData) => void;
  onStickerSelect: (sticker: StickerData) => void;
  onClose: () => void;
  defaultTab?: 'emojis' | 'stickers';
  theme?: 'light' | 'dark';
  maxHeight?: number;
  showSearch?: boolean;
  showFavorites?: boolean;
  showRecents?: boolean;
  recentEmojis?: EmojiData[];
  recentStickers?: StickerData[];
  favoriteEmojis?: EmojiData[];
  favoriteStickers?: StickerData[];
  preferences?: {
    skinTone: string;
    enableAnimations: boolean;
    autoSave: boolean;
  };
  enableVirtualization?: boolean;
  enableOptimizations?: boolean;
  enableAutoUpdate?: boolean;
  showUpdateNotifications?: boolean;
  onNewEmojis?: (emojis: EmojiData[]) => void;
  onNewStickers?: (stickers: StickerData[]) => void;
}

type TabType = 'emojis' | 'stickers';
type EmojiTabType = 'recent' | 'favorites' | EmojiCategory;
type StickerTabType = 'recent' | 'favorites' | 'packs' | StickerCategory;

const logger = Logger.getInstance();
const lazyLoader = LazyLoadingManager.getInstance();

export const EmojiStickerPicker: React.FC<EmojiStickerPickerProps> = ({
  onEmojiSelect,
  onStickerSelect,
  onClose,
  defaultTab = 'emojis',
  theme = 'dark',
  maxHeight = 400,
  showSearch = true,
  showFavorites = true,
  showRecents = true,
  recentEmojis = [],
  recentStickers = [],
  favoriteEmojis = [],
  favoriteStickers = [],
  preferences = {
    skinTone: 'default',
    enableAnimations: true,
    autoSave: true
  },
  enableVirtualization = true,
  enableOptimizations = true,
  enableAutoUpdate = true,
  showUpdateNotifications = true,
  onNewEmojis,
  onNewStickers
}) => {
  // Hook otimizado
  const {
    recentEmojis: hookRecentEmojis,
    recentStickers: hookRecentStickers,
    favoriteEmojis: hookFavoriteEmojis,
    favoriteStickers: hookFavoriteStickers,
    addToRecentEmojis,
    addToRecentStickers,
    addToFavoriteEmojis,
    addToFavoriteStickers,
    removeFromFavoriteEmojis,
    removeFromFavoriteStickers,
    searchQuery,
    searchResults,
    isPreloading,
    virtualizedEmojis,
    virtualizedStickers,
    updateSearch,
    optimizedEmojiSelect,
    optimizedStickerSelect
  } = useOptimizedEmojiSticker({
    containerHeight: maxHeight || 400,
    itemHeight: 48,
    enableVirtualization,
    preloadOnMount: enableOptimizations
  });

  // Hook de atualização de emojis
  const updateHook = useEmojiUpdates({
    enableAutoUpdate,
    enableNotifications: showUpdateNotifications,
    onNewEmojis,
    onNewStickers
  });

  // Dimensões da grade
  const { itemSize, itemsPerRow } = useOptimalGridDimensions(
    320, // containerWidth
    32,  // minItemSize
    48,  // maxItemSize
    8    // preferredItemsPerRow
  );

  // Estados principais
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [emojiActiveTab, setEmojiActiveTab] = useState<EmojiTabType>('recent');
  const [stickerActiveTab, setStickerActiveTab] = useState<StickerTabType>('recent');
  const [selectedStickerPack, setSelectedStickerPack] = useState<string | null>(null);
  
  // Estados para scroll infinito
  const [isLoading, setIsLoading] = useState(false);
  const [visibleEmojis, setVisibleEmojis] = useState<EmojiData[]>([]);
  const [visibleStickers, setVisibleStickers] = useState<StickerData[]>([]);
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const emojiGridRef = useRef<HTMLDivElement>(null);
  const stickerGridRef = useRef<HTMLDivElement>(null);

  // Memoized data
  const filteredEmojis = useMemo(() => {
    if (searchQuery) {
      return enableOptimizations ? searchResults.emojis : searchEmojis(searchQuery);
    }
    
    switch (emojiActiveTab) {
      case 'recent':
        return showRecents ? hookRecentEmojis : [];
      case 'favorites':
        return showFavorites ? hookFavoriteEmojis : [];
      default:
        return getEmojisByCategory(emojiActiveTab as EmojiCategory);
    }
  }, [searchQuery, emojiActiveTab, showRecents, showFavorites, hookRecentEmojis, hookFavoriteEmojis, searchResults, enableOptimizations]);

  const filteredStickers = useMemo(() => {
    if (searchQuery) {
      return enableOptimizations ? searchResults.stickers : searchStickers(searchQuery);
    }
    
    if (selectedStickerPack) {
      const pack = STICKER_PACKS.find(p => p.id === selectedStickerPack);
      return pack ? pack.stickers : [];
    }
    
    switch (stickerActiveTab) {
      case 'recent':
        return showRecents ? hookRecentStickers : [];
      case 'favorites':
        return showFavorites ? hookFavoriteStickers : [];
      case 'packs':
        return [];
      default:
        return searchStickers('', stickerActiveTab as StickerCategory);
    }
  }, [searchQuery, stickerActiveTab, selectedStickerPack, showRecents, showFavorites, hookRecentStickers, hookFavoriteStickers, searchResults, enableOptimizations]);

  // Handlers otimizados
  const handleEmojiClick = useCallback((emoji: EmojiData) => {
    const endTiming = performanceMonitor.startTiming('emoji-select');
    
    logger.info('Emoji selecionado:', { emoji: emoji.emoji, name: emoji.name });
    onEmojiSelect(emoji);
    
    // Adicionar aos recentes usando o hook otimizado
    addToRecentEmojis(emoji);
    
    endTiming();
  }, [onEmojiSelect, addToRecentEmojis]);

  const handleStickerClick = useCallback((sticker: StickerData) => {
    const endTiming = performanceMonitor.startTiming('sticker-select');
    
    logger.info('Sticker selecionado:', { id: sticker.id, name: sticker.name });
    onStickerSelect(sticker);
    
    // Adicionar aos recentes usando o hook otimizado
    addToRecentStickers(sticker);
    
    endTiming();
  }, [onStickerSelect, addToRecentStickers]);

  // Wrapper functions for VirtualizedEmojiGrid
  const handleEmojiItemSelect = useCallback((item: EmojiData | StickerData) => {
    if ('unicode' in item) {
      handleEmojiClick(item as EmojiData);
    }
  }, [handleEmojiClick]);

  const handleStickerItemSelect = useCallback((item: EmojiData | StickerData) => {
    if ('id' in item) {
      handleStickerClick(item as StickerData);
    }
  }, [handleStickerClick]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    updateSearch(query);
    
    if (query) {
      logger.debug('Busca realizada:', { query, tab: activeTab });
    }
  }, [activeTab, updateSearch]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    updateSearch('');
    setSelectedStickerPack(null);
    logger.debug('Tab alterada:', { tab });
  }, [updateSearch]);

  // Scroll infinito
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
    
    if (isNearBottom && !isLoading) {
      if (activeTab === 'emojis' && visibleEmojis.length < filteredEmojis.length) {
        const nextBatch = filteredEmojis.slice(visibleEmojis.length, visibleEmojis.length + 50);
        setVisibleEmojis(prev => [...prev, ...nextBatch]);
      } else if (activeTab === 'stickers' && visibleStickers.length < filteredStickers.length) {
        const nextBatch = filteredStickers.slice(visibleStickers.length, visibleStickers.length + 20);
        setVisibleStickers(prev => [...prev, ...nextBatch]);
      }
    }
  }, [activeTab, isLoading, visibleEmojis.length, filteredEmojis.length, visibleStickers.length, filteredStickers.length]);

  // Focus no input de busca quando abrir
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  return (
    <div className={`emoji-sticker-picker ${theme}`} style={{ maxHeight }}>
      {/* Header */}
      <div className="picker-header">
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'emojis' ? 'active' : ''}`}
            onClick={() => handleTabChange('emojis')}
          >
            😀 Emojis
          </button>
          <button
            className={`tab-button ${activeTab === 'stickers' ? 'active' : ''}`}
            onClick={() => handleTabChange('stickers')}
          >
            🎭 Figurinhas
          </button>
        </div>
        
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* Search */}
      {showSearch && (
        <div className="search-container">
          <input
            ref={searchInputRef}
            type="text"
            placeholder={`Buscar ${activeTab === 'emojis' ? 'emojis' : 'figurinhas'}...`}
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      )}

      {/* Content */}
      <div className="picker-content">
        {activeTab === 'emojis' ? (
          <div className="emoji-section">
            {/* Emoji Categories */}
            {!searchQuery && (
              <div className="category-tabs">
                {showRecents && (
                  <button
                    className={`category-tab ${emojiActiveTab === 'recent' ? 'active' : ''}`}
                    onClick={() => setEmojiActiveTab('recent')}
                    title="Recentes"
                  >
                    🕒
                  </button>
                )}
                {showFavorites && (
                  <button
                    className={`category-tab ${emojiActiveTab === 'favorites' ? 'active' : ''}`}
                    onClick={() => setEmojiActiveTab('favorites')}
                    title="Favoritos"
                  >
                    ⭐
                  </button>
                )}
                {EMOJI_CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    className={`category-tab ${emojiActiveTab === category.id ? 'active' : ''}`}
                    onClick={() => setEmojiActiveTab(category.id)}
                    title={category.name}
                  >
                    {category.icon}
                  </button>
                ))}
              </div>
            )}

            {/* Emoji Grid Virtualizado */}
            {enableVirtualization ? (
              <VirtualizedEmojiGrid
              items={visibleEmojis}
              onItemSelect={handleEmojiItemSelect}
              itemSize={itemSize}
              itemsPerRow={itemsPerRow}
              containerHeight={maxHeight - 120}
              type="emoji"
            />
            ) : (
              <div 
                ref={emojiGridRef}
                className="emoji-grid"
                onScroll={handleScroll}
              >
                {filteredEmojis.map((emoji, index) => (
                  <button
                    key={`${emoji.emoji}-${index}`}
                    className="emoji-button"
                    onClick={() => handleEmojiClick(emoji)}
                    title={`${emoji.name} - ${emoji.shortcode}`}
                  >
                    {emoji.emoji}
                  </button>
                ))}
                {isPreloading && (
                  <div className="loading-indicator">Carregando...</div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="sticker-section">
            {/* Sticker Navigation */}
            {!searchQuery && !selectedStickerPack && (
              <div className="category-tabs">
                {showRecents && (
                  <button
                    className={`category-tab ${stickerActiveTab === 'recent' ? 'active' : ''}`}
                    onClick={() => setStickerActiveTab('recent')}
                    title="Recentes"
                  >
                    🕒
                  </button>
                )}
                {showFavorites && (
                  <button
                    className={`category-tab ${stickerActiveTab === 'favorites' ? 'active' : ''}`}
                    onClick={() => setStickerActiveTab('favorites')}
                    title="Favoritos"
                  >
                    ⭐
                  </button>
                )}
                <button
                  className={`category-tab ${stickerActiveTab === 'packs' ? 'active' : ''}`}
                  onClick={() => setStickerActiveTab('packs')}
                  title="Pacotes"
                >
                  📦
                </button>
                {STICKER_CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    className={`category-tab ${stickerActiveTab === category.id ? 'active' : ''}`}
                    onClick={() => setStickerActiveTab(category.id)}
                    title={category.name}
                  >
                    {category.icon}
                  </button>
                ))}
              </div>
            )}

            {/* Sticker Packs View */}
            {stickerActiveTab === 'packs' && !selectedStickerPack && !searchQuery && (
              <div className="sticker-packs-grid">
                {STICKER_PACKS.map(pack => (
                  <div
                    key={pack.id}
                    className="sticker-pack-card"
                    onClick={() => setSelectedStickerPack(pack.id)}
                  >
                    <div className="pack-thumbnail">
                      <img src={pack.thumbnail} alt={pack.name} />
                      {pack.animated && <span className="animated-badge">GIF</span>}
                    </div>
                    <div className="pack-info">
                      <h4>{pack.name}</h4>
                      <p>{pack.stickers.length} figurinhas</p>
                      {pack.premium && <span className="premium-badge">Premium</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Back button for pack view */}
            {selectedStickerPack && (
              <div className="pack-header">
                <button 
                  className="back-button"
                  onClick={() => setSelectedStickerPack(null)}
                >
                  ← Voltar
                </button>
                <span className="pack-title">
                  {STICKER_PACKS.find(p => p.id === selectedStickerPack)?.name}
                </span>
              </div>
            )}

            {/* Sticker Grid Virtualizado */}
            {enableVirtualization ? (
              <VirtualizedEmojiGrid
                items={filteredStickers}
                onItemSelect={handleStickerItemSelect}
                itemSize={itemSize}
                itemsPerRow={itemsPerRow}
                containerHeight={maxHeight - 120}
                type="sticker"
              />
            ) : (
              <div 
                ref={stickerGridRef}
                className="sticker-grid"
                onScroll={handleScroll}
              >
                {filteredStickers.map((sticker, index) => (
                  <button
                    key={`${sticker.id}-${index}`}
                    className="sticker-button"
                    onClick={() => handleStickerClick(sticker)}
                    title={sticker.name}
                  >
                    <img 
                      src={sticker.url} 
                      alt={sticker.name}
                      loading="lazy"
                    />
                    {sticker.animated && <span className="animated-indicator">GIF</span>}
                  </button>
                ))}
                {isPreloading && (
                  <div className="loading-indicator">Carregando...</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .emoji-sticker-picker {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          width: 350px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .picker-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }

        .tab-buttons {
          display: flex;
          gap: 8px;
        }

        .tab-button {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .tab-button.active {
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
        }

        .close-button {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 16px;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .close-button:hover {
          background: var(--bg-hover);
        }

        .search-container {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .search-input {
          width: 100%;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--accent-color);
        }

        .picker-content {
          height: calc(100% - 120px);
          overflow: hidden;
        }

        .category-tabs {
          display: flex;
          gap: 4px;
          padding: 8px 12px;
          border-bottom: 1px solid var(--border-color);
          overflow-x: auto;
        }

        .category-tab {
          background: transparent;
          border: none;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 18px;
          transition: background 0.2s;
          min-width: 36px;
        }

        .category-tab:hover {
          background: var(--bg-hover);
        }

        .category-tab.active {
          background: var(--accent-color);
        }

        .emoji-grid, .sticker-grid {
          padding: 12px;
          height: 280px;
          overflow-y: auto;
          display: grid;
          gap: 4px;
        }

        .emoji-grid {
          grid-template-columns: repeat(8, 1fr);
        }

        .sticker-grid {
          grid-template-columns: repeat(4, 1fr);
        }

        .emoji-button {
          background: transparent;
          border: none;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 20px;
          transition: background 0.2s;
          aspect-ratio: 1;
        }

        .emoji-button:hover {
          background: var(--bg-hover);
        }

        .sticker-button {
          background: transparent;
          border: none;
          padding: 4px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
          aspect-ratio: 1;
          position: relative;
        }

        .sticker-button:hover {
          background: var(--bg-hover);
        }

        .sticker-button img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 4px;
        }

        .animated-indicator {
          position: absolute;
          top: 2px;
          right: 2px;
          background: var(--accent-color);
          color: white;
          font-size: 8px;
          padding: 1px 3px;
          border-radius: 2px;
        }

        .sticker-packs-grid {
          padding: 12px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          height: 280px;
          overflow-y: auto;
        }

        .sticker-pack-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .sticker-pack-card:hover {
          background: var(--bg-hover);
          transform: translateY(-2px);
        }

        .pack-thumbnail {
          position: relative;
          width: 100%;
          height: 60px;
          margin-bottom: 8px;
        }

        .pack-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 4px;
        }

        .animated-badge, .premium-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          background: var(--accent-color);
          color: white;
          font-size: 8px;
          padding: 2px 4px;
          border-radius: 2px;
        }

        .premium-badge {
          background: gold;
          color: black;
        }

        .pack-info h4 {
          margin: 0 0 4px 0;
          font-size: 12px;
          color: var(--text-primary);
        }

        .pack-info p {
          margin: 0;
          font-size: 10px;
          color: var(--text-secondary);
        }

        .pack-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .back-button {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .pack-title {
          font-weight: 500;
          color: var(--text-primary);
        }

        .loading-indicator {
          grid-column: 1 / -1;
          text-align: center;
          padding: 20px;
          color: var(--text-secondary);
          font-size: 14px;
        }

        /* Dark theme */
        .emoji-sticker-picker.dark {
          --bg-primary: #1a1a1a;
          --bg-secondary: #2d2d2d;
          --bg-hover: #3d3d3d;
          --text-primary: #ffffff;
          --text-secondary: #b3b3b3;
          --border-color: #404040;
          --accent-color: #007acc;
        }

        /* Light theme */
        .emoji-sticker-picker.light {
          --bg-primary: #ffffff;
          --bg-secondary: #f5f5f5;
          --bg-hover: #e5e5e5;
          --text-primary: #000000;
          --text-secondary: #666666;
          --border-color: #d0d0d0;
          --accent-color: #007acc;
        }

        /* Scrollbar styling */
        .emoji-grid::-webkit-scrollbar,
        .sticker-grid::-webkit-scrollbar,
        .sticker-packs-grid::-webkit-scrollbar,
        .category-tabs::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .emoji-grid::-webkit-scrollbar-track,
        .sticker-grid::-webkit-scrollbar-track,
        .sticker-packs-grid::-webkit-scrollbar-track,
        .category-tabs::-webkit-scrollbar-track {
          background: var(--bg-secondary);
        }

        .emoji-grid::-webkit-scrollbar-thumb,
        .sticker-grid::-webkit-scrollbar-thumb,
        .sticker-packs-grid::-webkit-scrollbar-thumb,
        .category-tabs::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 3px;
        }
      `}</style>
      
      {/* Notificação de atualizações */}
      {showUpdateNotifications && (
        <EmojiUpdateNotification 
          position="top-right"
          autoHide={true}
          autoHideDelay={5000}
          showUpdateButton={true}
          showCheckButton={true}
        />
      )}
    </div>
  );
};

export default EmojiStickerPicker;
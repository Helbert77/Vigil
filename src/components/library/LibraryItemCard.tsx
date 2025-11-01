import React, { useEffect, useState } from 'react';
import { LibraryItem } from '@/src/data/library';
import { libraryAnalytics } from '@/src/services/LibraryAnalytics';

type ViewMode = 'list' | 'small' | 'large';

interface LibraryItemCardProps {
  item: LibraryItem;
  viewMode: ViewMode;
  onClick: (item: LibraryItem) => void;
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'ebook': return 'Ebook';
    case 'article': return 'Artigo';
    case 'magazine': return 'Revista';
    case 'document': return 'Documento';
    default: return type;
  }
};

export const LibraryItemCard: React.FC<LibraryItemCardProps> = ({ item, viewMode, onClick }) => {
  const [localStats, setLocalStats] = useState(() => libraryAnalytics.getStats(item.id));

  useEffect(() => {
    setLocalStats(libraryAnalytics.getStats(item.id));
  }, [item.id]);

  const handleClick = () => {
    libraryAnalytics.incrementView(item.id);
    setLocalStats(libraryAnalytics.getStats(item.id));
    onClick(item);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const generateSrcSet = (baseUrl: string): string => {
    const sizes = [150, 300, 450, 600];
    return sizes.map(size => `${baseUrl}&w=${size} ${size}w`).join(', ');
  };

  const getImageSizes = (viewMode: ViewMode): string => {
    switch (viewMode) {
      case 'list':
        return '(max-width: 480px) 48px, (max-width: 768px) 64px, 80px';
      case 'small':
        return '(max-width: 480px) 120px, (max-width: 768px) 140px, 160px';
      case 'large':
        return '(max-width: 480px) 280px, (max-width: 768px) 300px, 320px';
      default:
        return '160px';
    }
  };
  const baseClasses = 'library-card transition transform hover:scale-[1.01] hover:shadow-lg cursor-pointer rounded-lg border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card';

  if (viewMode === 'list') {
    return (
      <div className={`${baseClasses} flex gap-4 min-h-[120px]`} onClick={handleClick}>
        <img 
          src={item.coverUrl} 
          srcSet={generateSrcSet(item.coverUrl)}
          sizes={getImageSizes('list')}
          alt={item.title}
          className="w-20 h-full object-cover rounded-l-lg flex-shrink-0"
          loading="lazy"
          decoding="async"
        />
        <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
          <div>
            <h3 className="library-card-title text-light-text dark:text-dark-text truncate font-semibold text-lg">{item.title}</h3>
            <p className="library-card-author text-light-text-secondary dark:text-dark-text-secondary mb-2">{item.author}</p>
            <p className="library-card-description text-light-text-secondary dark:text-dark-text-secondary line-clamp-2 text-sm">{item.description}</p>
          </div>
          <div className="mt-3">
            <div className="flex flex-wrap gap-1 mb-2">
              {item.tags?.slice(0, 3).map(tag => (
                <span key={tag} className="library-tag bg-primary/10 text-primary rounded-full text-xs px-2 py-1">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <div className="flex gap-4 library-card-meta text-light-text-secondary dark:text-dark-text-secondary text-xs">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                  {formatNumber((item.views || 0) + localStats.views)}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                  {formatNumber((item.downloads || 0) + localStats.downloads)}
                </span>
              </div>
              <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                {new Date(item.publishedDate || item.date).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'small') {
    return (
      <div 
        className={`${baseClasses} small-card p-3 text-center w-full max-w-full`} 
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Abrir detalhes de ${item.title} por ${item.author}`}
        aria-describedby={`stats-${item.id}`}
      >
        <div className="w-full flex flex-col items-center">
          <img 
            src={item.coverUrl} 
            srcSet={generateSrcSet(item.coverUrl)}
            sizes={getImageSizes('small')}
            alt={item.title}
            className="card-image w-16 h-20 sm:w-18 sm:h-22 md:w-20 md:h-24 object-cover rounded mx-auto mb-2 flex-shrink-0"
            loading="lazy"
            decoding="async"
          />
          <div className="w-full min-h-0 flex-1 flex flex-col">
            <h3 className="card-title text-light-text dark:text-dark-text line-clamp-2 mb-1 text-xs sm:text-sm font-medium leading-tight">{item.title}</h3>
            <p className="card-author text-light-text-secondary dark:text-dark-text-secondary line-clamp-1 text-xs mb-1">{item.author}</p>
            {item.tags && item.tags.length > 0 && (
              <div className="flex justify-center mt-1 mb-1">
                <span className="library-tag bg-primary/10 text-primary rounded-full text-xs px-1.5 py-0.5 truncate max-w-full">
                  {item.tags[0]}
                </span>
              </div>
            )}
            <div id={`stats-${item.id}`} className="flex justify-center gap-1 mt-auto library-card-meta text-light-text-secondary dark:text-dark-text-secondary text-xs">
              <span className="flex items-center gap-0.5 min-w-0">
                <svg className="w-2.5 h-2.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                </svg>
                <span className="truncate">{formatNumber((item.views || 0) + localStats.views)}</span>
              </span>
              <span className="flex items-center gap-0.5 min-w-0">
                <svg className="w-2.5 h-2.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
                <span className="truncate">{formatNumber((item.downloads || 0) + localStats.downloads)}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${baseClasses} large-card`} onClick={handleClick}>
      <img 
        src={item.coverUrl} 
        srcSet={generateSrcSet(item.coverUrl)}
        sizes={getImageSizes('large')}
        alt={item.title}
        className="card-image"
        loading="lazy"
        decoding="async"
      />
      <h3 className="card-title text-light-text dark:text-dark-text">{item.title}</h3>
      <p className="card-author text-light-text-secondary dark:text-dark-text-secondary">{item.author}</p>
      <p className="card-description text-light-text-secondary dark:text-dark-text-secondary">{item.description}</p>
      <div className="library-tags">
        {item.tags?.slice(0, 4).map(tag => (
          <span key={tag} className="library-tag">
            {tag}
          </span>
        ))}
      </div>
      <div className="library-stats">
        <span className="library-stat">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
          </svg>
          {formatNumber((item.views || 0) + localStats.views)}
        </span>
        <span className="library-stat">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
          {formatNumber((item.downloads || 0) + localStats.downloads)}
        </span>
      </div>
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { LibraryItem } from '@/src/data/library';
import { realTimeAnalytics, RealTimeStats } from '@/src/services/RealTimeAnalytics';
import FileThumbnail from '@/src/components/common/FileThumbnail';
import { formatDate, isValidDate } from '@/src/utils/formatters';
import { getFileTypeFromUrl } from '@/src/utils/fileUtils';
import { logger } from '@/src/utils/Logger';

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
  const [stats, setStats] = useState<RealTimeStats>(() => ({
    views: 0,
    downloads: 0,
    lastAccessed: new Date().toISOString(),
    publishedDate: item.publishedDate || item.date,
    isUpdating: false
  }));

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    
    const setupAnalytics = async () => {
      try {
        const initialStats = await realTimeAnalytics.getStats(item.id);
        setStats(initialStats);
        subscription = await realTimeAnalytics.subscribe(item.id, (newStats) => {
          setStats(newStats);
        });
        await realTimeAnalytics.incrementView(item.id);
      } catch (error) {
        realTimeAnalytics.subscribe(item.id, (newStats) => {
          setStats(newStats);
        }).then(sub => {
          subscription = sub;
          return realTimeAnalytics.incrementView(item.id);
        }).catch(() => {});
      }
    };

    setupAnalytics();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [item.id]);

  const handleClick = () => {
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

  const baseClasses = 'library-card transition transform hover:scale-[1.01] hover:shadow-lg cursor-pointer rounded-lg border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card';

  const isFutureDate = (iso?: string): boolean => {
    if (!iso) return false;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return false;
    return d.getTime() > Date.now() + 60_000;
  };

  const formatExactItemDate = (raw?: string): string => {
    if (!raw) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const [y, m, d] = raw.split('-');
      return `${d}/${m}/${y}`;
    }
    const isoMatch = raw.match(/^(\d{4}-\d{2}-\d{2})T/);
    if (isoMatch) {
      const [y, m, d] = isoMatch[1].split('-');
      return `${d}/${m}/${y}`;
    }
    return raw;
  };

  if (viewMode === 'list') {
    return (
      <div className={`${baseClasses} flex gap-4 min-h-[120px]`} onClick={handleClick}>
        <div className="w-32 h-full flex-shrink-0 self-stretch">
          <FileThumbnail
            fileUrl={item.coverUrl}
            fileType={getFileTypeFromUrl(item.coverUrl)}
            alt={item.title}
            className="w-full h-full object-cover rounded-l-lg"
          />
        </div>
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
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                  {formatNumber(stats.views)}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                  {formatNumber(stats.downloads)}
                </span>
              </div>
              {(() => {
                const raw = item.publishedDate || item.date;
                if (!isValidDate(raw)) {
                  logger.warn('Data de publicação inválida no card', { id: item.id, raw }, 'library', 'LibraryItemCard');
                  return <span className="text-xs text-red-600 dark:text-red-400">Data inválida</span>;
                }
                const future = isFutureDate(raw);
                return (
                  <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary inline-flex items-center gap-1">
                    {formatExactItemDate(raw)}
                    {future && <span className="px-1 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-[10px]">Agendada</span>}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'small') {
    return (
      <div 
        className={`${baseClasses} small-card p-2 sm:p-3 text-center w-full max-w-full flex flex-col`} 
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Abrir detalhes de ${item.title} por ${item.author}`}
        aria-describedby={`stats-${item.id}`}
      >
        <div className="flex-shrink-0 mb-2">
          <FileThumbnail
            fileUrl={item.coverUrl}
            fileType={getFileTypeFromUrl(item.coverUrl)}
            alt={item.title}
            className="card-image w-12 h-16 sm:w-14 sm:h-18 md:w-16 md:h-20 object-cover rounded mx-auto"
          />
        </div>
        <div className="flex-1 min-h-0 flex flex-col justify-between">
          <div className="min-h-0">
            <h3 className="card-title text-light-text dark:text-dark-text line-clamp-2 mb-1 text-xs sm:text-sm font-medium leading-tight">{item.title}</h3>
            <p className="card-author text-light-text-secondary dark:text-dark-text-secondary line-clamp-1 text-xs mb-1">{item.author}</p>
            {item.tags && item.tags.length > 0 && (
              <div className="flex justify-center mt-1 mb-1">
                <span className="library-tag bg-primary/10 text-primary rounded-full text-xs px-1.5 py-0.5 truncate max-w-full">
                  {item.tags[0]}
                </span>
              </div>
            )}
          </div>
          <div id={`stats-${item.id}`} className="flex justify-center gap-1 mt-2 library-card-meta text-light-text-secondary dark:text-dark-text-secondary text-xs">
            <span className="flex items-center gap-0.5 min-w-0">
              <svg className="w-2.5 h-2.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
              <span className="truncate">{formatNumber(stats.views)}</span>
            </span>
            <span className="flex items-center gap-0.5 min-w-0">
              <svg className="w-2.5 h-2.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
              <span className="truncate">{formatNumber(stats.downloads)}</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${baseClasses} large-card p-4 flex flex-col`} onClick={handleClick}>
      <div className="flex-shrink-0 mb-3">
        <FileThumbnail
          fileUrl={item.coverUrl}
          fileType={getFileTypeFromUrl(item.coverUrl)}
          alt={item.title}
          className="card-image w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg"
        />
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        <h3 className="card-title text-light-text dark:text-dark-text text-base sm:text-lg font-semibold line-clamp-2 mb-1">{item.title}</h3>
        <p className="card-author text-light-text-secondary dark:text-dark-text-secondary text-sm mb-2">{item.author}</p>
        <p className="card-description text-light-text-secondary dark:text-dark-text-secondary text-sm line-clamp-2 sm:line-clamp-3 mb-3">{item.description}</p>
        {item.tags && item.tags.length > 0 && (
          <div className="library-tags flex flex-wrap gap-1.5 mb-3">
            {item.tags.slice(0, 4).map(tag => (
              <span key={tag} className="library-tag bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="library-stats flex gap-4 mt-auto pt-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
          <span className="library-stat flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
            {formatNumber(stats.views)}
          </span>
          <span className="library-stat flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
            {formatNumber(stats.downloads)}
          </span>
        </div>
      </div>
    </div>
  );
};

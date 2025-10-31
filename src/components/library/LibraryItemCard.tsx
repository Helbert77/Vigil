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

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const generateSrcSet = (baseUrl: string): string => {
    const sizes = [150, 300, 450, 600];
    return sizes.map(size => `${baseUrl}&w=${size} ${size}w`).join(', ');
  };
  const baseClasses = 'transition transform hover:scale-[1.01] hover:shadow-lg cursor-pointer rounded-lg border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card';

  if (viewMode === 'list') {
    return (
      <div className={`${baseClasses} p-4 flex gap-4`} onClick={handleClick}>
        <img 
          src={item.coverUrl} 
          srcSet={generateSrcSet(item.coverUrl)}
          sizes="(max-width: 768px) 64px, 80px"
          alt={item.title}
          className="w-16 h-20 object-cover rounded flex-shrink-0"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-light-text dark:text-dark-text truncate">{item.title}</h3>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{item.author}</p>
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1 line-clamp-2">{item.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags?.map(tag => (
              <span key={tag} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex gap-4 mt-2 text-xs text-light-text-secondary dark:text-dark-text-secondary">
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
        </div>
        <div className="text-right flex-shrink-0">
          <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
            {new Date(item.publishedDate || item.date).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>
    );
  }

  if (viewMode === 'small') {
    return (
      <div className={`${baseClasses} p-3 text-center`} onClick={handleClick}>
        <img 
          src={item.coverUrl} 
          srcSet={generateSrcSet(item.coverUrl)}
          sizes="(max-width: 768px) 120px, 160px"
          alt={item.title}
          className="w-20 h-28 object-cover rounded mx-auto mb-2"
          loading="lazy"
        />
        <h3 className="text-sm font-semibold text-light-text dark:text-dark-text line-clamp-2 mb-1">{item.title}</h3>
        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary line-clamp-1">{item.author}</p>
        <div className="flex flex-wrap gap-1 mt-2 justify-center">
          {item.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex justify-center gap-3 mt-2 text-xs text-light-text-secondary dark:text-dark-text-secondary">
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
      </div>
    );
  }

  return (
    <div className={`${baseClasses} p-4`} onClick={handleClick}>
      <img 
        src={item.coverUrl} 
        srcSet={generateSrcSet(item.coverUrl)}
        sizes="(max-width: 768px) 280px, 320px"
        alt={item.title}
        className="w-full h-48 object-cover rounded mb-3"
        loading="lazy"
      />
      <h3 className="text-lg font-semibold text-light-text dark:text-dark-text line-clamp-2 mb-2">{item.title}</h3>
      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">{item.author}</p>
      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary line-clamp-3 mb-3">{item.description}</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {item.tags?.map(tag => (
          <span key={tag} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex justify-between items-center text-xs text-light-text-secondary dark:text-dark-text-secondary">
        <span>{new Date(item.publishedDate || item.date).toLocaleDateString('pt-BR')}</span>
        <div className="flex gap-3">
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
      </div>
    </div>
  );
};
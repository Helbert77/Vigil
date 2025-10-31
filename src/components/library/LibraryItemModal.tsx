import React, { useState, useEffect } from 'react';
import GenericModal from '@/src/components/common/GenericModal';
import { LibraryItem } from '@/src/data/library';
import { libraryAnalytics } from '@/src/services/LibraryAnalytics';
import '@/src/styles/library-modal.css';

interface LibraryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: LibraryItem | null;
}

const LibraryItemModal: React.FC<LibraryItemModalProps> = ({ isOpen, onClose, item }) => {
  const [localStats, setLocalStats] = useState(() => 
    item ? libraryAnalytics.getStats(item.id) : { downloads: 0, views: 0, lastAccessed: '' }
  );

  useEffect(() => {
    if (item) {
      setLocalStats(libraryAnalytics.getStats(item.id));
    }
  }, [item]);

  if (!item) return null;

  const handleDownload = () => {
    libraryAnalytics.incrementDownload(item.id);
    setLocalStats(libraryAnalytics.getStats(item.id));
    // Simular download
    if (item.downloadUrl) {
      const link = document.createElement('a');
      link.href = item.downloadUrl;
      link.download = `${item.title}.pdf`;
      link.click();
    }
  };

  const handleReadOnline = () => {
    libraryAnalytics.incrementView(item.id);
    setLocalStats(libraryAnalytics.getStats(item.id));
    // Simular leitura online
    if (item.readUrl) {
      window.open(item.readUrl, '_blank');
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <GenericModal isOpen={isOpen} onClose={onClose} title={item.title} size="xl">
        <div className="library-modal-content flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* Imagem da capa */}
          <div className="flex-shrink-0 mx-auto lg:mx-0">
            <img 
              src={item.coverUrl} 
              srcSet={`${item.coverUrl}&w=200 200w, ${item.coverUrl}&w=300 300w, ${item.coverUrl}&w=400 400w`}
              sizes="(max-width: 768px) 200px, (max-width: 1024px) 250px, 300px"
              alt={item.title}
              className="library-modal-image w-48 sm:w-56 md:w-64 lg:w-72 h-64 sm:h-72 md:h-80 lg:h-96 object-cover rounded-lg shadow-lg"
              loading="lazy"
            />
          </div>

          {/* Informações do item */}
          <div className="flex-1 min-w-0">
            <div className="mb-4 md:mb-6">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-light-text dark:text-dark-text mb-2 leading-tight">{item.title}</h2>
              <p className="text-base sm:text-lg text-light-text-secondary dark:text-dark-text-secondary mb-3">por {item.author}</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                <span className="inline-block px-3 py-1 text-sm bg-primary/10 text-primary rounded-full capitalize w-fit">
                  {item.category || item.type}
                </span>
                <div className="flex flex-wrap gap-3 sm:gap-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="whitespace-nowrap">{formatNumber((item.views || 0) + localStats.views)} visualizações</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                    <span className="whitespace-nowrap">{formatNumber((item.downloads || 0) + localStats.downloads)} downloads</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-light-text dark:text-dark-text mb-2 md:mb-3">Descrição</h3>
              <div className="library-description max-h-32 sm:max-h-40 md:max-h-48 overflow-y-auto">
                <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary leading-relaxed pr-2">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="mb-4 md:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-light-text dark:text-dark-text mb-2 md:mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map(tag => (
                    <span key={tag} className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-primary/10 text-primary rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Informações adicionais */}
            <div className="mb-4 md:mb-6">
              <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Publicado em: {new Date(item.date).toLocaleDateString('pt-BR')}
              </p>
            </div>

            {/* Botões de ação */}
            <div className="library-modal-buttons grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              <button 
                onClick={handleReadOnline}
                className="library-modal-button bg-primary hover:bg-primary/90 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium sm:font-semibold transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                </svg>
                <span className="whitespace-nowrap">Ler Online</span>
              </button>
              <button 
                onClick={handleDownload}
                className="library-modal-button bg-light-border dark:bg-dark-border hover:bg-light-border/80 dark:hover:bg-dark-border/80 text-light-text dark:text-dark-text px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium sm:font-semibold transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
                <span className="whitespace-nowrap">Baixar PDF</span>
              </button>
              <button className="library-modal-button sm:col-span-2 lg:col-span-1 bg-light-card dark:bg-dark-card hover:bg-light-card/80 dark:hover:bg-dark-card/80 text-light-text dark:text-dark-text px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium sm:font-semibold transition-colors border border-light-border dark:border-dark-border flex items-center justify-center gap-2 text-sm sm:text-base">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                <span className="whitespace-nowrap">Mais Detalhes</span>
              </button>
            </div>
          </div>
        </div>
    </GenericModal>
  );
};

export { LibraryItemModal };
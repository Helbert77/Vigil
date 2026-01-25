import React, { useMemo, useState, useEffect } from 'react';
import { LibraryItem } from '../../types';
import Card from '../common/Card';
import { Icon } from '../icons/Icon';
import { getDocumentCoverUrl, getFileTypeFromUrl } from '../../src/utils/documentThumbnail';
import { useTranslation } from 'react-i18next';

const EyeIcon = () => <Icon className="h-4 w-4"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></Icon>;
const DownloadIcon = () => <Icon className="h-4 w-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></Icon>;

const BookIcon = () => <Icon className="h-12 w-12"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></Icon>;
const FileTextIcon = () => <Icon className="h-12 w-12"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></Icon>;
const NewspaperIcon = () => <Icon className="h-12 w-12"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path><path d="M18 14h-8"></path><path d="M15 18h-5"></path><path d="M10 6h8v4h-8V6Z"></path></Icon>;
const FolderIcon = () => <Icon className="h-12 w-12"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"></path></Icon>;

interface LibraryItemCardProps {
  item: LibraryItem;
  viewMode: 'list' | 'grid-small' | 'grid-large';
  onClick: () => void;
}

const LibraryItemCard: React.FC<LibraryItemCardProps> = ({ item, viewMode, onClick }) => {
  const { t } = useTranslation(['library']);
  const [imageError, setImageError] = useState(false);
  
  // Gera thumbnail para documentos se necessário
  const coverImageUrl = useMemo(() => {
    const fileType = item.cover_url ? getFileTypeFromUrl(item.cover_url) : 'unknown';
    
    // Se é um documento e não tem imagem válida, gera thumbnail
    if (fileType === 'document' || item.type === 'document') {
      return getDocumentCoverUrl(item.cover_url, item.file_url, item.title);
    }
    
    // Para imagens e vídeos, usa a cover_url normalmente
    return item.cover_url;
  }, [item.cover_url, item.file_url, item.title, item.type]);

  // Reset error state when cover URL changes
  useEffect(() => {
    setImageError(false);
  }, [coverImageUrl]);

  const getTypeIcon = () => {
    switch (item.type) {
      case 'ebook':
        return <BookIcon />;
      case 'article':
        return <FileTextIcon />;
      case 'magazine':
        return <NewspaperIcon />;
      case 'document':
        return <FolderIcon />;
    }
  };

  const getTypeLabel = () => {
    switch (item.type) {
      case 'ebook':
        return t('library:ebook');
      case 'article':
        return t('library:article');
      case 'magazine':
        return t('library:magazine');
      case 'document':
        return t('library:document');
      case 'link':
        return t('library:link');
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
      case 'ebook':
        return 'bg-blue-500';
      case 'article':
        return 'bg-green-500';
      case 'magazine':
        return 'bg-purple-500';
      case 'document':
        return 'bg-orange-500';
      case 'link':
        return 'bg-cyan-500';
    }
  };

  const isNew = () => {
    const daysSinceCreation = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreation <= 7;
  };

  const isPopular = () => {
    return item.views >= 100 || item.downloads >= 50;
  };

  if (viewMode === 'list') {
    return (
      <Card
        className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group"
        onClick={onClick}
      >
        <div className="flex items-start gap-4">
          {/* Cover */}
          <div className="flex-shrink-0 w-20 h-28 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg overflow-hidden">
            {coverImageUrl && !imageError ? (
              <img
                src={coverImageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                {getTypeIcon()}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('library:by')} {item.author}
                </p>
              </div>
              <span className={`${getTypeColor()} text-white text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap`}>
                {getTypeLabel()}
              </span>
            </div>

            {item.description && (
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">
                {item.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <EyeIcon />
                <span>{item.views}</span>
              </div>
              <div className="flex items-center gap-1">
                <DownloadIcon />
                <span>{item.downloads}</span>
              </div>
              {isNew() && (
                <span className="bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">
                  {t('library:new')}
                </span>
              )}
              {isPopular() && (
                <span className="bg-yellow-500 text-white px-2 py-0.5 rounded-full font-semibold">
                  {t('library:popular')}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (viewMode === 'grid-small') {
    return (
      <Card
        className="p-3 hover:shadow-lg transition-all duration-300 cursor-pointer group relative"
        onClick={onClick}
      >
        {/* Cover */}
        <div className="w-full aspect-[2/3] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg overflow-hidden mb-2">
          {coverImageUrl && !imageError ? (
            <img
              src={coverImageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
              {getTypeIcon()}
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-5 right-5 flex flex-col gap-1">
          {isNew() && (
            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-lg">
              {t('library:new')}
            </span>
          )}
          {isPopular() && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-lg">
              {t('library:popular')}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 mb-1">
          {item.title}
        </h3>

        {/* Author */}
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
          {item.author}
        </p>
      </Card>
    );
  }

  // grid-large
  return (
    <Card
      className="p-4 hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
      onClick={onClick}
    >
      {/* Cover */}
      <div className="w-full aspect-[2/3] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg overflow-hidden mb-4">
        {coverImageUrl && !imageError ? (
          <img
            src={coverImageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            {getTypeIcon()}
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="absolute top-6 right-6 flex flex-col gap-1">
        {isNew() && (
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
            {t('library:new')}
          </span>
        )}
        {isPopular() && (
          <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
            {t('library:popular')}
          </span>
        )}
      </div>

      {/* Type Badge */}
      <span className={`${getTypeColor()} text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 inline-block`}>
        {getTypeLabel()}
      </span>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 mb-2">
        {item.title}
      </h3>

      {/* Author */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        {t('library:by')} {item.author}
      </p>

      {/* Description */}
      {item.description && (
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-4">
          {item.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1">
          <EyeIcon />
          <span>{item.views}</span>
        </div>
        <div className="flex items-center gap-1">
          <DownloadIcon />
          <span>{item.downloads}</span>
        </div>
      </div>
    </Card>
  );
};

export default LibraryItemCard;


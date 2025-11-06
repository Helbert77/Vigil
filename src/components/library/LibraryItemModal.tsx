import React, { useState, useEffect } from 'react';
import GenericModal from '@/src/components/common/GenericModal';
import FileThumbnail from '@/src/components/common/FileThumbnail';
import FileViewer from '@/src/components/common/FileViewer'; // Importar o FileViewer
import { LibraryItem } from '@/src/data/library';
import { useRealTimeAnalytics } from '@/src/hooks/useRealTimeAnalytics';
import { formatNumber, formatDate, isRecentlyUpdated, isValidDate } from '@/src/utils/formatters';
import { getFileTypeFromUrl } from '@/src/utils/fileUtils';
import { logger } from '@/src/utils/Logger';
import * as api from '@/src/services/api';
import { supabase } from '@/integrations/supabase/client';
import '@/src/styles/library-modal.css';

// Formata exatamente a data do item sem alterar o dia
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

// Extrai o nome do arquivo da URL (último segmento), ignorando query/hash
const extractFileNameFromUrl = (url: string): string | null => {
  try {
    const u = new URL(url, window.location.href);
    const pathname = u.pathname;
    if (!pathname) return null;
    const lastSegment = pathname.split('/').filter(Boolean).pop();
    return lastSegment ? decodeURIComponent(lastSegment) : null;
  } catch {
    const clean = url.split('?')[0].split('#')[0];
    const lastSegment = clean.split('/').filter(Boolean).pop();
    return lastSegment ? decodeURIComponent(lastSegment) : null;
  }
};

// Tenta obter filename do cabeçalho Content-Disposition
const parseContentDispositionFilename = (disposition: string | null): string | null => {
  if (!disposition) return null;
  const starMatch = disposition.match(/filename\*=\s*UTF-8''([^;\n]+)/i);
  if (starMatch && starMatch[1]) {
    try {
      return decodeURIComponent(starMatch[1]);
    } catch {
      return starMatch[1];
    }
  }
  const stdMatch = disposition.match(/filename\s*=\s*"?([^";\n]+)"?/i);
  if (stdMatch && stdMatch[1]) {
    return stdMatch[1];
  }
  return null;
};

interface LibraryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: LibraryItem | null;
}

const LibraryItemModal: React.FC<LibraryItemModalProps> = ({ isOpen, onClose, item }) => {
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [viewingFile, setViewingFile] = useState<string | null>(null); // Estado para o URL do arquivo
  
  // Estados para modo de edição
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [editedTitle, setEditedTitle] = useState<string>('');
  const [editedAuthor, setEditedAuthor] = useState<string>('');
  const [editedDescription, setEditedDescription] = useState<string>('');
  const [editedTags, setEditedTags] = useState<string>('');
  const [editedCategory, setEditedCategory] = useState<string>('');
  const [editedFile, setEditedFile] = useState<File | null>(null);
  const [editedCover, setEditedCover] = useState<File | null>(null);

  // Hook de analytics em tempo real
  const {
    stats,
    isLoading,
    isUpdating,
    error: analyticsError,
    lastUpdate,
    activityLevel,
    updateInterval,
    retry,
    incrementView,
    incrementDownload
  } = useRealTimeAnalytics({
    itemId: item?.id || '',
    autoStart: isOpen && !!item,
    publishedDate: item?.publishedDate || item?.date,
    onError: (err) => {
      console.error('Erro no analytics:', err);
      setError('Erro ao carregar estatísticas em tempo real');
    },
    onUpdate: (newStats) => {
      setError(null); // Limpa erro quando recebe dados
    }
  });

  // Limpa erro quando modal fecha e inicializa campos de edição
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setIsEditing(false);
      setEditedFile(null);
      setEditedCover(null);
    } else if (item) {
      // Inicializa os campos de edição com os valores do item
      setEditedTitle(item.title || '');
      setEditedAuthor(item.author || '');
      setEditedDescription(item.description || '');
      setEditedTags(item.tags?.join(', ') || '');
      setEditedCategory(item.category || item.type || '');
      setEditedFile(null);
      setEditedCover(null);
    }
  }, [isOpen, item]);

  // Preparação e validação de data ANTES de qualquer early return
  const publishedDateRaw = item?.publishedDate || item?.date || new Date().toISOString();
  const isPublishedValid = isValidDate(publishedDateRaw);
  const isPublishedFuture = (() => {
    const d = new Date(publishedDateRaw);
    if (isNaN(d.getTime())) return false;
    return d.getTime() > Date.now() + 60_000; // tolerância de 60s
  })();
  const isDateRecent = isRecentlyUpdated(publishedDateRaw);

  // Logs de validação de data (hook sempre chamado; lógica interna condicionada)
  useEffect(() => {
    if (!item) return;
    if (!isPublishedValid) {
      logger.warn('Data de publicação inválida', { id: item.id, publishedDate: publishedDateRaw }, 'library', 'LibraryItemModal');
    } else if (isPublishedFuture) {
      logger.warn('Data de publicação futura', { id: item.id, publishedDate: publishedDateRaw }, 'library', 'LibraryItemModal');
    }
  }, [item, isPublishedValid, isPublishedFuture, publishedDateRaw]);

  if (!item) return null;

  // Função para alternar entre editar e salvar
  const handleEditToggle = async () => {
    if (isEditing) {
      // Modo salvar
      await handleSaveChanges();
    } else {
      // Modo editar
      setIsEditing(true);
    }
  };

  // Função para salvar as alterações
  const handleSaveChanges = async () => {
    if (!item) return;

    try {
      setIsSaving(true);
      setError(null);

      const updates: Partial<Omit<LibraryItem, 'id'>> = {
        title: editedTitle.trim(),
        author: editedAuthor.trim(),
        description: editedDescription.trim(),
        tags: editedTags.split(',').map(tag => tag.trim()).filter(Boolean),
        category: editedCategory.trim() || undefined,
      };

      // Upload de arquivo principal, se fornecido
      if (editedFile) {
        const fileExt = editedFile.name.split('.').pop()?.toLowerCase();
        const timestamp = Date.now();
        const filePath = `${timestamp}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('library-media')
          .upload(filePath, editedFile);

        if (uploadError) {
          throw new Error(`Falha no upload do arquivo: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from('library-media')
          .getPublicUrl(filePath);

        if (urlData) {
          updates.media = urlData.publicUrl;
          updates.readUrl = urlData.publicUrl;
          updates.downloadUrl = urlData.publicUrl;
        }
      }

      // Upload de capa, se fornecida
      if (editedCover) {
        const coverExt = editedCover.name.split('.').pop()?.toLowerCase();
        const timestamp = Date.now();
        const coverPath = `covers/${timestamp}.${coverExt}`;

        const { error: coverUploadError } = await supabase.storage
          .from('library-media')
          .upload(coverPath, editedCover);

        if (coverUploadError) {
          console.warn('Erro ao fazer upload da capa:', coverUploadError);
        } else {
          const { data: coverUrlData } = supabase.storage
            .from('library-media')
            .getPublicUrl(coverPath);

          if (coverUrlData) {
            updates.coverUrl = coverUrlData.publicUrl;
          }
        }
      }

      const { data, error } = await api.updateLibraryItem(item.id, updates);

      if (error) {
        // Se o erro for "Item não encontrado", exibe mensagem específica
        if (error.code === 'NOT_FOUND' || error.message?.includes('não encontrado')) {
          throw new Error('Este item não pode ser editado pois não existe no banco de dados.');
        }
        throw new Error(error.message || 'Erro ao salvar alterações');
      }

      if (data) {
        // Atualiza o item local
        Object.assign(item, data);
        logger.info('Item atualizado com sucesso', { itemId: item.id }, 'library', 'LibraryItemModal');
      }

      setIsEditing(false);
      setEditedFile(null);
      setEditedCover(null);
    } catch (err: any) {
      console.error('Erro ao salvar alterações:', err);
      setError(err.message || 'Erro ao salvar alterações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async () => {
    // Mantém o botão habilitado; evita operações concorrentes
    if (isDownloading) return;
    try {
      if (!item) {
        setError('Arquivo para download indisponível.');
        return;
      }

      setIsDownloading(true);
      const url = item.downloadUrl || item.readUrl || item.media;
      if (!url) {
        setError('Arquivo para download indisponível.');
        return;
      }

      let fileName: string | undefined;

      // Tenta baixar via fetch (CORS) para preservar o nome do arquivo e mostrar feedback
      try {
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const disposition = response.headers.get('Content-Disposition');
        const nameFromHeader = parseContentDispositionFilename(disposition);
        const blob = await response.blob();
        fileName = nameFromHeader || extractFileNameFromUrl(url) || `${item.title}.pdf`;

        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(blobUrl);

        await incrementDownload();
        setError(null);
      } catch (downloadErr) {
        // Fallback: abrir o link diretamente. Para mesma origem, sugere filename; para cross-origin, deixa o servidor decidir.
        const link = document.createElement('a');
        link.href = url;
        let sameOrigin = false;
        try {
          const u = new URL(url, window.location.href);
          sameOrigin = u.origin === window.location.origin;
        } catch {}
        if (sameOrigin) {
          fileName = extractFileNameFromUrl(url) || `${item.title}.pdf`;
          link.download = fileName;
        }
        link.target = '_blank';
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        link.remove();

        await incrementDownload();
      }
    } catch (err) {
      console.error('Erro no download:', err);
      setError('Falha ao baixar o arquivo. Tente novamente mais tarde.');
    } finally {
      setIsDownloading(false);
    }
  };

  const getFileType = (url: string): 'pdf' | 'image' | 'video' | 'docx' | 'txt' | 'csv' | 'md' | 'unsupported' => {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return 'image';
    }
    if (['mp4', 'avi', 'mov'].includes(extension)) {
      return 'video';
    }
    if (extension === 'pdf') {
      return 'pdf';
    }
    if (extension === 'docx') {
      return 'docx';
    }
    if (['txt', 'csv'].includes(extension)) {
      return 'txt';
    }
    if (extension === 'md') {
      return 'md';
    }
    return 'unsupported';
  };

  const handleReadOnline = async () => {
    try {
      if (item?.readUrl) {
        setViewingFile(item.readUrl);
        await incrementView();
      }
    } catch (err) {
      console.error('Erro ao abrir visualização:', err);
      setError('Erro ao abrir visualização online');
    }
  };

  // Valores para exibição com fallback
  const displayViews = stats?.views ?? (item.views || 0);
  const displayDownloads = stats?.downloads ?? (item.downloads || 0);
  const publishedDate = stats?.publishedDate || publishedDateRaw;

  return (
    <GenericModal isOpen={isOpen} onClose={onClose} title="" size="xl">
        <div className="library-modal-content flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* Imagem da capa */}
          <div className="flex-shrink-0 mx-auto lg:mx-0">
            <FileThumbnail
              fileUrl={item.coverUrl}
              fileType={getFileTypeFromUrl(item.coverUrl)}
              alt={item.title}
              className="library-modal-image w-48 sm:w-56 md:w-64 lg:w-72 h-64 sm:h-72 md:h-80 lg:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Informações do item */}
          <div className="flex-1 min-w-0 relative">
            {/* Botão de fechar reposicionado */}
            <button 
              onClick={onClose} 
              className="absolute top-0 right-0 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="mb-6 md:mb-8 pr-8">
              {/* Título reposicionado */}
              {isEditing ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full text-lg md:text-xl lg:text-2xl font-bold text-white mb-2 px-3 py-2 border border-gray-600 rounded-lg bg-black focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400"
                  placeholder="Título"
                />
              ) : (
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-light-text dark:text-dark-text mb-2">{item.title}</h2>
              )}
              
              {isEditing ? (
                <input
                  type="text"
                  value={editedAuthor}
                  onChange={(e) => setEditedAuthor(e.target.value)}
                  className="w-full text-lg sm:text-xl text-gray-300 mb-4 font-medium px-3 py-2 border border-gray-600 rounded-lg bg-black focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400"
                  placeholder="Autor"
                />
              ) : (
                <p className="text-lg sm:text-xl text-light-text-secondary dark:text-dark-text-secondary mb-4 font-medium">por {item.author}</p>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedCategory}
                    onChange={(e) => setEditedCategory(e.target.value)}
                    className="inline-block px-3 py-1 text-sm bg-black text-white rounded-full capitalize w-fit border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400"
                    placeholder="Categoria"
                  />
                ) : (
                  <span className="inline-block px-3 py-1 text-sm bg-primary/10 text-primary rounded-full capitalize w-fit">
                    {item.category || item.type}
                  </span>
                )}
                <div className="flex flex-wrap gap-3 sm:gap-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 100 4z"/>
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="whitespace-nowrap flex items-center gap-1">
                      {formatNumber(displayViews)} visualizações
                      {isLoading && (
                        <svg className="w-3 h-3 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                    <span className="whitespace-nowrap flex items-center gap-1">
                      {formatNumber(displayDownloads)} downloads
                      {isLoading && (
                        <svg className="w-3 h-3 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                    </span>
                  </span>
                  {/* Indicador de nível de atividade baseado em thresholds */}
                  {((stats?.views ?? 0) >= 100 || (stats?.downloads ?? 0) >= 10) && (
                    <span className="flex items-center gap-1 text-orange-500">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-xs">Alta atividade</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-light-text dark:text-dark-text mb-2 md:mb-3">Descrição</h3>
              {isEditing ? (
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={4}
                  className="w-full text-sm sm:text-base text-gray-300 leading-relaxed px-3 py-2 border border-gray-600 rounded-lg bg-black focus:outline-none focus:ring-2 focus:ring-primary resize-none placeholder-gray-400"
                  placeholder="Descrição"
                />
              ) : (
                <div className="library-description max-h-32 sm:max-h-40 md:max-h-48 overflow-y-auto">
                  <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary leading-relaxed pr-2">
                    {item.description}
                  </p>
                </div>
              )}
            </div>

            {/* Tags */}
            {(item.tags && item.tags.length > 0) || isEditing ? (
              <div className="mb-4 md:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-light-text dark:text-dark-text mb-2 md:mb-3">Tags</h3>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedTags}
                    onChange={(e) => setEditedTags(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-gray-600 rounded-lg bg-black focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
                    placeholder="Tags separadas por vírgula (ex: tecnologia, ciência)"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {item.tags?.map(tag => (
                      <span key={tag} className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-primary/10 text-primary rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {/* Upload de arquivos (apenas em modo de edição) */}
            {isEditing && (
              <div className="mb-4 md:mb-6 space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-light-text dark:text-dark-text mb-2">Arquivo Principal</h3>
                  <input
                    type="file"
                    onChange={(e) => setEditedFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer"
                  />
                  {editedFile && (
                    <p className="text-xs text-green-400 mt-1">✓ {editedFile.name}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Selecione um novo arquivo para substituir o atual (PDF, DOC, imagem, vídeo, etc.)
                  </p>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-light-text dark:text-dark-text mb-2">Imagem de Capa</h3>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditedCover(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-secondary-dark cursor-pointer"
                  />
                  {editedCover && (
                    <p className="text-xs text-green-400 mt-1">✓ {editedCover.name}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Selecione uma nova imagem de capa (opcional)
                  </p>
                </div>
              </div>
            )}

            {/* Informações adicionais */}
            <div className="mb-4 md:mb-6">
              <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary flex items-center gap-2">
                {!isPublishedValid ? (
                  <span className="text-red-600 dark:text-red-400">Data inválida</span>
                ) : (
                  <span>Publicado em: {formatExactItemDate(publishedDateRaw)}</span>
                )}
                {isPublishedFuture && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                    </svg>
                    Agendada
                  </span>
                )}
                {isDateRecent && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    Atualizado
                  </span>
                )}
              </p>
              
              {/* Informações de atualização em tempo real */}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                  </svg>
                  Atualização: {activityLevel === 'peak' ? '10s' : '30s'}
                </span>
                
                {lastUpdate && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                    </svg>
                    Última: {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                
                {error && (
                  <span className="flex items-center gap-1 text-red-500">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    {error}
                    <button 
                      onClick={retry}
                      className="ml-1 text-xs underline hover:no-underline"
                    >
                      Tentar novamente
                    </button>
                  </span>
                )}
              </div>
            </div>

            {/* Botões de ação */}
            <div className="library-modal-buttons grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              <button 
                onClick={handleReadOnline}
                className="library-modal-button bg-primary hover:bg-primary/90 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium sm:font-semibold transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 100 4z"/>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                </svg>
                <span className="whitespace-nowrap">Ler Online</span>
              </button>
              <button 
                type="button"
                onClick={handleDownload}
                className="library-modal-button bg-light-border dark:bg-dark-border hover:bg-light-border/80 dark:hover:bg-dark-border/80 text-light-text dark:text-dark-text px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium sm:font-semibold transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                aria-label="Download"
                aria-busy={isDownloading}
              >
                {isDownloading ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                )}
                <span className="whitespace-nowrap">Download</span>
                <span className="sr-only" aria-live="polite" role="status">
                  {isDownloading ? 'Baixando arquivo...' : (error ? 'Falha no download' : 'Pronto para baixar')}
                </span>
              </button>
              <button 
                onClick={handleEditToggle}
                disabled={isSaving}
                className="library-modal-button sm:col-span-2 lg:col-span-1 bg-light-card dark:bg-dark-card hover:bg-light-card/80 dark:hover:bg-dark-card/80 text-light-text dark:text-dark-text px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium sm:font-semibold transition-colors border border-light-border dark:border-dark-border flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : isEditing ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                  </svg>
                )}
                <span className="whitespace-nowrap">
                  {isSaving ? 'Salvando...' : isEditing ? 'Salvar' : 'Editar'}
                </span>
              </button>
            </div>
          </div>
        </div>
        {viewingFile && (
          <FileViewer 
            fileUrl={viewingFile} 
            fileType={getFileType(viewingFile)}
            onClose={() => setViewingFile(null)} 
          />
        )}
    </GenericModal>
  );
};

export default LibraryItemModal;
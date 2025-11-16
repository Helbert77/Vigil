import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LibraryItem, User } from '../../types';
import { Icon } from '../icons/Icon';
import { useToast } from '../../hooks/useToast';
import FileViewer from './FileViewer';
import { supabase } from '../../integrations/supabase/client';
import ConfirmationModal from '../common/ConfirmationModal';
import { getDocumentCoverUrl, getFileTypeFromUrl } from '../../src/utils/documentThumbnail';

const XIcon = () => <Icon className="h-6 w-6"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></Icon>;
const EyeIcon = () => <Icon className="h-5 w-5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></Icon>;
const DownloadIcon = () => <Icon className="h-5 w-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></Icon>;
const BookOpenIcon = () => <Icon className="h-5 w-5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></Icon>;
const EditIcon = () => <Icon className="h-5 w-5"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></Icon>;
const TrashIcon = () => <Icon className="h-5 w-5"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></Icon>;
const UploadIcon = () => <Icon className="h-5 w-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></Icon>;

interface LibraryItemModalProps {
  item: LibraryItem;
  user: User;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<LibraryItem>) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
}

const LibraryItemModal: React.FC<LibraryItemModalProps> = ({
  item,
  user,
  onClose,
  onUpdate,
  onDelete,
  onDownload
}) => {
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editForm, setEditForm] = useState({
    title: item.title,
    author: item.author,
    description: item.description || '',
    cover_url: item.cover_url || '',
    tags: item.tags?.join(', ') || '',
    type: item.type
  });

  const isAdmin = user.role === 'admin' || user.role === 'moderator';
  const isCreator = item.created_by === user.id;
  const canEdit = isAdmin || isCreator;

  // Gera thumbnail para documentos se necessário
  const coverImageUrl = useMemo(() => {
    const currentCoverUrl = isEditing ? editForm.cover_url : item.cover_url;
    const fileType = currentCoverUrl ? getFileTypeFromUrl(currentCoverUrl) : 'unknown';
    
    // Se é um documento e não tem imagem válida, gera thumbnail
    if (fileType === 'document' || item.type === 'document') {
      return getDocumentCoverUrl(currentCoverUrl, item.file_url, item.title);
    }
    
    // Para imagens e vídeos, usa a cover_url normalmente
    return currentCoverUrl;
  }, [item.cover_url, item.file_url, item.title, item.type, isEditing, editForm.cover_url]);

  // Reset error state when cover URL changes
  useEffect(() => {
    setImageError(false);
  }, [coverImageUrl]);

  // Atualizar o formulário quando o item mudar (atualização em tempo real)
  useEffect(() => {
    setEditForm({
      title: item.title,
      author: item.author,
      description: item.description || '',
      cover_url: item.cover_url || '',
      tags: item.tags?.join(', ') || '',
      type: item.type
    });
  }, [item]);

  const handleRead = () => {
    if (!item.file_url) {
      addToast('Arquivo não disponível', 'error');
      return;
    }

    // Para links externos, abrir em nova aba
    if (item.type === 'link') {
      window.open(item.file_url, '_blank');
    } else {
      // Para arquivos, abrir no visualizador
      setShowViewer(true);
    }
  };

  const handleDownload = async () => {
    if (!item.file_url) {
      addToast('Arquivo não disponível', 'error');
      return;
    }

    try {
      // Incrementar contador de downloads
      onDownload(item.id);

      // Extrair nome do arquivo da URL
      const fileName = item.file_url.split('/').pop() || item.title;
      
      // Fazer fetch do arquivo
      const response = await fetch(item.file_url);
      const blob = await response.blob();
      
      // Criar URL temporária e forçar download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Limpar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      addToast('Erro ao baixar arquivo', 'error');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    const filePath = `${Date.now()}-${fileName}.${fileExt}`;

    const { error } = await supabase.storage.from('library-media').upload(filePath, file);

    if (error) {
      addToast('Falha ao enviar o arquivo.', 'error');
      console.error(error);
    } else {
      const { data } = supabase.storage.from('library-media').getPublicUrl(filePath);
      setEditForm({ ...editForm, cover_url: data.publicUrl });
    }
    setIsUploading(false);
  };

  const handleSaveEdit = () => {
    if (!editForm.title.trim() || !editForm.author.trim()) {
      addToast('Título e autor são obrigatórios', 'error');
      return;
    }

    const tagsArray = editForm.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag);

    onUpdate(item.id, {
      title: editForm.title.trim(),
      author: editForm.author.trim(),
      description: editForm.description.trim() || undefined,
      cover_url: editForm.cover_url || undefined,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      type: editForm.type
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    onDelete(item.id);
    setIsDeleteModalOpen(false);
    onClose();
  };

  const getTypeLabel = () => {
    switch (item.type) {
      case 'ebook': return 'Ebook';
      case 'article': return 'Artigo';
      case 'magazine': return 'Revista';
      case 'document': return 'Documento';
      case 'link': return 'Link';
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
      case 'ebook': return 'bg-blue-500';
      case 'article': return 'bg-green-500';
      case 'magazine': return 'bg-purple-500';
      case 'document': return 'bg-orange-500';
      case 'link': return 'bg-cyan-500';
    }
  };

  return (
    <>
      {/* Visualizador de arquivos */}
      {showViewer && item.file_url && (
        <FileViewer
          fileUrl={item.file_url}
          fileName={item.title}
          onClose={() => setShowViewer(false)}
        />
      )}

      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
        <div
          className="bg-light-card dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-4xl my-8"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header com botão fechar */}
        <div className="relative p-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors z-10"
          >
            <XIcon />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-6">
          {/* Cover and Info */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Cover */}
            <div className="flex-shrink-0 w-full md:w-48 flex flex-col">
              <div
                className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg overflow-hidden mb-3"
                style={{ minHeight: '400px' }}
              >
                {coverImageUrl && !imageError ? (
                  <img
                    src={coverImageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                    <BookOpenIcon />
                  </div>
                )}
              </div>
              
              {/* Botão de upload da capa (apenas em modo edição) */}
              {isEditing && canEdit && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*,application/pdf,.doc,.docx,.txt,.epub,.mobi"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
                  >
                    <UploadIcon />
                    <span>{isUploading ? 'Enviando...' : 'Alterar Capa'}</span>
                  </button>
                </>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Título, Autor e Badge (movidos do header) */}
              {!isEditing ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-snug">
                        {item.title}
                      </h2>
                      <span className={`${getTypeColor()} text-white text-xs font-semibold px-2 py-1 rounded-full inline-flex items-center`}>
                        {getTypeLabel()}
                      </span>
                    </div>
                    <p className="text-base text-gray-600 dark:text-gray-400">
                      por {item.author}
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipo
                    </label>
                    <select
                      value={editForm.type}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value as any })}
                      className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    >
                      <option value="ebook">Ebook</option>
                      <option value="article">Artigo</option>
                      <option value="magazine">Revista</option>
                      <option value="document">Documento</option>
                      <option value="link">Link</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Título
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Autor
                    </label>
                    <input
                      type="text"
                      value={editForm.author}
                      onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                      className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              {!isEditing ? (
                <>
                  {item.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Descrição</h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Type */}
                  {item.type && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Tipo</h3>
                      <p className="text-gray-700 dark:text-gray-300">{item.type}</p>
                    </div>
                  )}

                  {/* Published Date */}
                  {item.published_date && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Data de Publicação</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {new Date(item.published_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}

                  {/* Stats - acima da linha divisória */}
                  <div className="flex items-center gap-6 text-gray-600 dark:text-gray-400 mt-auto">
                    <div className="flex items-center gap-2">
                      <EyeIcon />
                      <span className="text-sm font-medium">{item.views} visualizações</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DownloadIcon />
                      <span className="text-sm font-medium">{item.downloads} downloads</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descrição
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Descrição do item"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tags (separadas por vírgula)
                    </label>
                    <input
                      type="text"
                      value={editForm.tags}
                      onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                      className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Ex: romance, aventura, suspense"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6">
          <div className="border-t border-light-border dark:border-dark-border pt-6 md:ml-[13.5rem]">
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
            {/* Botões de ação principais - sempre visíveis e habilitados */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {item.type === 'link' ? (
                <button
                  onClick={handleRead}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  <BookOpenIcon />
                  <span>Abrir Link</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleRead}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    <BookOpenIcon />
                    <span>Ler Online</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    <DownloadIcon />
                    <span>Download</span>
                  </button>
                </>
              )}
            </div>

            {/* Botões de administração - sempre na mesma posição */}
            {canEdit && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-200"
                    >
                      <EditIcon />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200"
                    >
                      <TrashIcon />
                      <span>Excluir</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        handleSaveEdit();
                        setIsEditing(false);
                      }}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-200"
                    >
                      <EditIcon />
                      <span>Salvar</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200"
                    >
                      <TrashIcon />
                      <span>Cancelar</span>
                    </button>
                  </>
                )}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Modal de confirmação de exclusão */}
    <ConfirmationModal
      isOpen={isDeleteModalOpen}
      onClose={() => setIsDeleteModalOpen(false)}
      onConfirm={confirmDelete}
      title="Excluir Item da Biblioteca?"
      message={`Tem certeza que deseja excluir permanentemente "${item.title}"? Esta ação não pode ser desfeita.`}
      confirmText="Sim, excluir"
      cancelText="Cancelar"
      isDestructive={true}
    />
    </>
  );
};

export default LibraryItemModal;


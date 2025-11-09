import React, { useState } from 'react';
import { LibraryItem, User } from '../../types';
import { Icon } from '../icons/Icon';
import { useToast } from '../../hooks/useToast';
import FileViewer from './FileViewer';

const XIcon = () => <Icon className="h-6 w-6"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></Icon>;
const EyeIcon = () => <Icon className="h-5 w-5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></Icon>;
const DownloadIcon = () => <Icon className="h-5 w-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></Icon>;
const BookOpenIcon = () => <Icon className="h-5 w-5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></Icon>;
const EditIcon = () => <Icon className="h-5 w-5"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></Icon>;
const TrashIcon = () => <Icon className="h-5 w-5"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></Icon>;

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
  const [editForm, setEditForm] = useState({
    title: item.title,
    author: item.author,
    description: item.description || '',
    file_url: item.file_url || ''
  });

  const isAdmin = user.role === 'admin' || user.role === 'moderator';

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

  const handleSaveEdit = () => {
    if (!editForm.title.trim() || !editForm.author.trim()) {
      addToast('Título e autor são obrigatórios', 'error');
      return;
    }

    onUpdate(item.id, editForm);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      onDelete(item.id);
      onClose();
    }
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
        {/* Header */}
        <div className="relative p-6 border-b border-light-border dark:border-dark-border">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <XIcon />
          </button>

          {!isEditing ? (
            <>
              <span className={`${getTypeColor()} text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-3`}>
                {getTypeLabel()}
              </span>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 pr-10">
                {item.title}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                por {item.author}
              </p>
            </>
          ) : (
            <div className="space-y-4 pr-10">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
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
                  className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Cover and Stats */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Cover */}
            <div className="flex-shrink-0 w-full md:w-64 aspect-[2/3] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg overflow-hidden">
              {item.cover_url ? (
                <img
                  src={item.cover_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <BookOpenIcon />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              {/* Stats */}
              <div className="flex items-center gap-6 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <EyeIcon />
                  <span className="text-sm font-medium">{item.views} visualizações</span>
                </div>
                <div className="flex items-center gap-2">
                  <DownloadIcon />
                  <span className="text-sm font-medium">{item.downloads} downloads</span>
                </div>
              </div>

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

                  {/* Category */}
                  {item.category && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Categoria</h3>
                      <p className="text-gray-700 dark:text-gray-300">{item.category}</p>
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
                      className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Link/URL do Arquivo
                    </label>
                    <input
                      type="url"
                      value={editForm.file_url}
                      onChange={(e) => setEditForm({ ...editForm, file_url: e.target.value })}
                      className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-light-border dark:border-dark-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Botões de ação principais - sempre visíveis */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {item.type === 'link' ? (
                <button
                  onClick={handleRead}
                  disabled={!item.file_url}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <BookOpenIcon />
                  <span>Abrir Link</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleRead}
                    disabled={!item.file_url}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <BookOpenIcon />
                    <span>Ler Online</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={!item.file_url}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <DownloadIcon />
                    <span>Download</span>
                  </button>
                </>
              )}
            </div>

            {/* Botões de administração - sempre na mesma posição */}
            {isAdmin && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200"
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
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200"
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
    </>
  );
};

export default LibraryItemModal;


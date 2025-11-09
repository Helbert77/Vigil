import React, { useState, useRef } from 'react';
import { LibraryItem } from '../../types';
import { Icon } from '../icons/Icon';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../integrations/supabase/client';

const XIcon = () => <Icon className="h-6 w-6"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></Icon>;
const UploadIcon = () => <Icon className="h-5 w-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></Icon>;

interface AddLibraryItemModalProps {
  onClose: () => void;
  onAdd: (item: Omit<LibraryItem, 'id' | 'downloads' | 'views' | 'created_at'>) => void;
}

const AddLibraryItemModal: React.FC<AddLibraryItemModalProps> = ({ onClose, onAdd }) => {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({
    type: 'ebook' as 'ebook' | 'article' | 'magazine' | 'document',
    title: '',
    author: '',
    description: '',
    cover_url: '',
    published_date: '',
    category: '',
    tags: '',
    read_url: '',
    download_url: ''
  });

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `library-covers/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage.from('posts-media').upload(filePath, file);

    if (error) {
      addToast('Falha ao enviar a capa.', 'error');
      console.error(error);
    } else {
      const { data } = supabase.storage.from('posts-media').getPublicUrl(filePath);
      setForm({ ...form, cover_url: data.publicUrl });
      addToast('Capa enviada com sucesso!', 'success');
    }
    setIsUploading(false);
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.author.trim()) {
      addToast('Título e autor são obrigatórios', 'error');
      return;
    }

    const tagsArray = form.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag);

    const item: Omit<LibraryItem, 'id' | 'downloads' | 'views' | 'created_at'> = {
      type: form.type,
      title: form.title.trim(),
      author: form.author.trim(),
      description: form.description.trim() || undefined,
      cover_url: form.cover_url || undefined,
      date: new Date().toISOString(),
      published_date: form.published_date || undefined,
      category: form.category.trim() || undefined,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      read_url: form.read_url.trim() || undefined,
      download_url: form.download_url.trim() || undefined
    };

    onAdd(item);
    onClose();
    addToast('Item adicionado com sucesso!', 'success');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-light-card dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-light-border dark:border-dark-border flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Adicionar Item à Biblioteca</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <XIcon />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo *
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as any })}
              className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
            >
              <option value="ebook">Ebook</option>
              <option value="article">Artigo</option>
              <option value="magazine">Revista</option>
              <option value="document">Documento</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
              placeholder="Digite o título"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Autor *
            </label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
              placeholder="Digite o nome do autor"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white resize-none"
              placeholder="Digite uma descrição"
            />
          </div>

          {/* Cover Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Capa
            </label>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                <UploadIcon />
                <span>{isUploading ? 'Enviando...' : 'Enviar Capa'}</span>
              </button>
              {form.cover_url && (
                <img
                  src={form.cover_url}
                  alt="Preview"
                  className="w-16 h-24 object-cover rounded-lg"
                />
              )}
            </div>
          </div>

          {/* Published Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data de Publicação
            </label>
            <input
              type="date"
              value={form.published_date}
              onChange={(e) => setForm({ ...form, published_date: e.target.value })}
              className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoria
            </label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
              placeholder="Ex: Ficção, Ciência, Tecnologia"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
              placeholder="Ex: romance, aventura, suspense"
            />
          </div>

          {/* Read URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Link de Leitura Online
            </label>
            <input
              type="url"
              value={form.read_url}
              onChange={(e) => setForm({ ...form, read_url: e.target.value })}
              className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
              placeholder="https://..."
            />
          </div>

          {/* Download URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Link de Download
            </label>
            <input
              type="url"
              value={form.download_url}
              onChange={(e) => setForm({ ...form, download_url: e.target.value })}
              className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-light-border dark:border-dark-border flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white font-semibold rounded-lg transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.title.trim() || !form.author.trim()}
            className="px-6 py-2 bg-primary hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddLibraryItemModal;


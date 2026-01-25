import React, { useState, useRef } from 'react';
import { LibraryItem } from '../../types';
import { Icon } from '../icons/Icon';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../integrations/supabase/client';
import { useTranslation } from 'react-i18next';

const XIcon = () => <Icon className="h-6 w-6"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></Icon>;
const UploadIcon = () => <Icon className="h-5 w-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></Icon>;

interface AddLibraryItemModalProps {
  onClose: () => void;
  onAdd: (item: Omit<LibraryItem, 'id' | 'downloads' | 'views' | 'created_at'>) => void;
}

const AddLibraryItemModal: React.FC<AddLibraryItemModalProps> = ({ onClose, onAdd }) => {
  const { t } = useTranslation(['library', 'common']);
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({
    type: 'ebook' as 'ebook' | 'article' | 'magazine' | 'document' | 'link',
    title: '',
    author: '',
    description: '',
    cover_url: '',
    file_url: '',
    tags: ''
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = file.name.replace(/\.[^/.]+$/, ''); // Nome sem extensão
    const filePath = `${Date.now()}-${fileName}.${fileExt}`;

    // Upload para o bucket específico da biblioteca
    const { error } = await supabase.storage.from('library-media').upload(filePath, file);

    if (error) {
      addToast(t('common:uploadFailed'), 'error');
      console.error(error);
    } else {
      // Obter URL pública do arquivo no novo bucket
      const { data } = supabase.storage.from('library-media').getPublicUrl(filePath);
      
      // A capa é sempre o arquivo enviado (imagem, vídeo, PDF, etc)
      setForm({ ...form, cover_url: data.publicUrl, file_url: data.publicUrl });
    }
    setIsUploading(false);
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.author.trim()) {
      addToast(t('library:titleAuthorRequired'), 'error');
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
      file_url: form.file_url.trim() || undefined,
      date: new Date().toISOString(),
      published_date: new Date().toISOString(),
      tags: tagsArray.length > 0 ? tagsArray : undefined
    };

    onAdd(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-light-card dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-light-border dark:border-dark-border flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('library:addItem')}</h2>
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
              {t('library:type')} *
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as any })}
              className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            >
              <option value="ebook">{t('library:ebook')}</option>
              <option value="article">{t('library:article')}</option>
              <option value="magazine">{t('library:magazine')}</option>
              <option value="document">{t('library:document')}</option>
              <option value="link">{t('library:link')}</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('library:fieldTitle')} *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder={t('library:enterTitle')}
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('library:author')} *
            </label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder={t('library:enterAuthor')}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('library:description')}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white resize-none placeholder-gray-500 dark:placeholder-gray-400"
              placeholder={t('library:enterDescription')}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('library:selectFile')}
            </label>
            <div className="flex items-center gap-4">
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
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                <UploadIcon />
                <span>{isUploading ? t('common:uploading') : t('common:upload')}</span>
              </button>
              {form.cover_url && (
                <img
                  src={form.cover_url}
                  alt={t('library:preview')}
                  className="w-16 h-24 object-cover rounded-lg"
                />
              )}
              {form.file_url && !form.cover_url && (
                <span className="text-sm text-green-600 dark:text-green-400">✓ {t('library:fileUploaded')}</span>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('library:tags')}
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder={t('library:tagsPlaceholder')}
            />
          </div>

          {/* Link URL - Only visible when type is 'link' */}
          {form.type === 'link' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('library:onlineReadingLink')} *
              </label>
              <input
                type="url"
                value={form.file_url}
                onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                className="w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder={t('library:urlPlaceholder')}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-light-border dark:border-dark-border flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white font-semibold rounded-lg transition-all duration-200"
          >
            {t('library:cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.title.trim() || !form.author.trim()}
            className="px-6 py-2 bg-primary hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common:add')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddLibraryItemModal;


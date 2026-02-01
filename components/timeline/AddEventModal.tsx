import React, { useState, useEffect } from 'react';
import { Icon } from '@/components/icons/Icon';
import { TimelineEvent } from '@/types';
import { createTimelineEvent, updateTimelineEvent } from '@/src/services/api';
import { useToast } from '@/hooks/useToast';
import { useSession } from '@/contexts/SessionContext';
import { supabase } from '@/integrations/supabase/client';
import * as api from '../../src/services/api';
import { useTranslation } from 'react-i18next';

const XIcon = () => <Icon><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></Icon>;

interface AddEventModalProps {
  onClose: () => void;
  onEventAdded: () => void;
  editingEvent?: TimelineEvent | null;
  isModerationEdit?: boolean;
  queueItemId?: string;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ onClose, onEventAdded, editingEvent, isModerationEdit, queueItemId }) => {
  const { t } = useTranslation(['timeline', 'common']);
  const { addToast } = useToast();
  const { user } = useSession();
  const [loading, setLoading] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const isEditing = !!editingEvent;
  const isAdminOrModerator = user?.role === 'admin' || user?.role === 'moderator';

  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear(),
    category: 'politics' as 'politics' | 'science' | 'health' | 'religion' | 'technology' | 'society',
    description: '',
    country: '',
    source_1: '',
    source_2: '',
    event_date: '',
    media: null as File | null,
    image_url: '' as string
  });

  // Initialize form data when editing
  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title,
        year: editingEvent.year,
        category: editingEvent.category,
        description: editingEvent.description || '',
        country: editingEvent.country || '',
        source_1: editingEvent.source_1 || '',
        source_2: editingEvent.source_2 || '',
        event_date: editingEvent.event_date || '',
        media: null as File | null,
        image_url: editingEvent.image_url || ''
      });
      if (editingEvent.image_url) {
        setMediaPreviewUrl(editingEvent.image_url);
      }
    }
  }, [editingEvent]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? (value === '' ? '' : parseInt(value) || '') : value
    }));
  };

  const handleMediaUpload = async (file: File) => {
    if (!user) {
      addToast(t('common:errorLogin'), 'error');
      return;
    }

    setIsUploadingMedia(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `timeline-media/${user.id}/${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('posts-media')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        addToast(t('common:errorUpload'), 'error');
        setIsUploadingMedia(false);
        return;
      }

      const { data } = supabase.storage.from('posts-media').getPublicUrl(filePath);

      if (data.publicUrl) {
        setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
        setMediaPreviewUrl(data.publicUrl);
        addToast(t('common:successUpload'), 'success');
      } else {
        addToast(t('common:errorMediaUrl'), 'error');
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      addToast(t('common:errorUpload'), 'error');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      addToast(t('timeline:errorTitle'), 'error');
      return;
    }

    if (isNaN(formData.year as any)) {
      addToast(t('timeline:errorYear'), 'error');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = formData.image_url;

      // Se há um arquivo de mídia selecionado mas ainda não foi feito upload, fazer upload primeiro
      if (formData.media && !imageUrl) {
        if (!user) {
          addToast(t('common:errorLogin'), 'error');
          setLoading(false);
          return;
        }

        setIsUploadingMedia(true);
        const fileExt = formData.media.name.split('.').pop();
        const filePath = `timeline-media/${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('posts-media')
          .upload(filePath, formData.media);

        if (uploadError) {
          console.error('Erro no upload:', uploadError);
          addToast(t('common:errorUpload'), 'error');
          setLoading(false);
          setIsUploadingMedia(false);
          return;
        }

        const { data } = supabase.storage.from('posts-media').getPublicUrl(filePath);
        if (data.publicUrl) {
          imageUrl = data.publicUrl;
        } else {
          addToast(t('common:errorMediaUrl'), 'error');
          setLoading(false);
          setIsUploadingMedia(false);
          return;
        }
        setIsUploadingMedia(false);
      }

      const { media, event_date, image_url: _, ...submitData } = formData;

      // Converter ano para formato DATE válido (YYYY-MM-DD)
      const eventDateValue = `${formData.year}-01-01`;

      // NOVO: Se está editando item da fila de moderação
      if (isModerationEdit && queueItemId) {
        const { error } = await api.updateTimelineQueueItem(queueItemId, {
          ...submitData,
          event_date: eventDateValue,
          ...(imageUrl && { image_url: imageUrl })
        });
        if (error) throw error;
        addToast(t('timeline:successEventUpdateQueue'), 'success');
        onEventAdded();
        onClose();
        return;
      }

      // Se está editando evento existente na timeline
      if (isEditing && editingEvent) {
        const { error } = await updateTimelineEvent(editingEvent.id, {
          ...submitData,
          event_date: eventDateValue,
          ...(imageUrl && { image_url: imageUrl })
        });
        if (error) throw error;
        addToast(t('timeline:successEventUpdate'), 'success');
      } 
      // NOVO: Se é admin/moderador, criar direto na timeline
      else if (isAdminOrModerator) {
        const { error } = await createTimelineEvent({
          ...submitData,
          event_date: eventDateValue,
          ...(imageUrl && { image_url: imageUrl }),
          x_position: 0,
          y_position: 0
        });
        if (error) throw error;
        addToast(t('timeline:successEventCreate'), 'success');
      } 
      // NOVO: Se é usuário comum, submeter para moderação
      else {
        const { error } = await api.submitTimelineEventForModeration({
          ...submitData,
          event_date: eventDateValue,
          ...(imageUrl && { image_url: imageUrl })
        });
        if (error) throw error;
        addToast(t('timeline:infoEventModeration'), 'info');
      }

      onEventAdded();
      onClose();
    } catch (err) {
      console.error('Erro ao processar evento:', err);
      addToast(t('timeline:errorProcess'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-6 animate-scale-in">
      <div className="bg-light-card dark:bg-dark-card rounded-lg md:rounded-2xl max-w-3xl w-full max-h-[95vh] md:max-h-[90vh] flex flex-col border border-light-border dark:border-dark-border shadow-2xl">
        <div className="sticky top-0 bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-enhanced border-b border-light-border dark:border-dark-border p-3 md:p-6 flex items-center justify-between z-10">
          <h2 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white truncate pr-2">
            {isEditing ? t('timeline:editEventTitle') : t('timeline:addEventTitle')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors flex-shrink-0 p-1"
          >
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 md:p-6 space-y-3 md:space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('timeline:titleLabel')}
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-3 md:py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200 text-base"
              placeholder="Ex: A Conspiração da Área 51"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('timeline:yearLabel')}
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-3 md:py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200 text-base"
                placeholder="Ex: 1947 ou -3300 para AC"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('timeline:categoryLabel')}
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-3 md:py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200 text-base"
              >
                <option value="politics">{t('timeline:categories.politics')}</option>
                <option value="science">{t('timeline:categories.science')}</option>
                <option value="health">{t('timeline:categories.health')}</option>
                <option value="religion">{t('timeline:categories.religion')}</option>
                <option value="technology">{t('timeline:categories.technology')}</option>
                <option value="society">{t('timeline:categories.society')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('timeline:descriptionLabel')}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-3 md:py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200 text-base"
              placeholder={t('timeline:descriptionPlaceholder')}
            />
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('timeline:countryLabel')}
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-3 md:py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200 text-base"
                placeholder={t('timeline:countryPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('timeline:addMediaLabel')}
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file) {
                      setFormData(prev => ({ ...prev, media: file }));
                      // Criar preview local
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setMediaPreviewUrl(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                      // Fazer upload automaticamente
                      handleMediaUpload(file);
                    }
                  }}
                  disabled={isUploadingMedia}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div
                  tabIndex={0}
                  className={`w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-3 md:py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200 text-base cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isUploadingMedia ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const fileInput = e.currentTarget.previousElementSibling as HTMLInputElement;
                      if (!isUploadingMedia) {
                        fileInput?.click();
                      }
                    }
                  }}
                >
                  {isUploadingMedia ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-500"></div>
                      <span>{t('timeline:sendingMedia')}</span>
                    </div>
                  ) : formData.media || mediaPreviewUrl ? (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="truncate">{formData.media?.name || t('timeline:mediaUploaded')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>{t('timeline:clickToAddMedia')}</span>
                    </div>
                  )}
                </div>
              </div>
              {mediaPreviewUrl && (
                <div className="mt-2 relative">
                  {formData.media?.type.startsWith('image/') || mediaPreviewUrl.startsWith('data:image') || mediaPreviewUrl.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
                    <>
                      <img 
                        src={mediaPreviewUrl} 
                        alt="Preview" 
                        className="w-full max-h-48 object-contain rounded-lg border border-light-border dark:border-dark-border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, media: null, image_url: '' }));
                          setMediaPreviewUrl(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors"
                        title={t('timeline:removeMedia')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <div className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-light-border dark:border-dark-border text-center text-sm text-gray-500 dark:text-gray-400 relative">
                      {t('timeline:videoPreviewNotAvailable')}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, media: null, image_url: '' }));
                          setMediaPreviewUrl(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors"
                        title={t('timeline:removeMedia')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('timeline:source1Label')}
              </label>
              <input
                type="url"
                name="source_1"
                value={formData.source_1}
                onChange={handleChange}
                className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-3 md:py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200 text-base"
                placeholder={t('timeline:source1Placeholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('timeline:source2Label')}
              </label>
              <input
                type="url"
                name="source_2"
                value={formData.source_2}
                onChange={handleChange}
                className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-3 md:py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200 text-base"
                placeholder={t('timeline:source2Placeholder')}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 md:py-2 rounded-lg border border-light-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-base font-medium"
            >
              {t('common:cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || isUploadingMedia}
              className="px-6 py-3 md:py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              {loading || isUploadingMedia ? (isEditing ? t('common:saving') : t('common:creating')) : (isEditing ? t('timeline:saveChangesBtn') : t('timeline:createEventBtn'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;
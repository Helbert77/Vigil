import React, { useState, useRef } from 'react';
import { Icon } from '@/components/icons/Icon';
import { TimelineEvent } from '@/types';
import { updateTimelineEvent } from '@/src/services/api';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { useTranslation } from 'react-i18next';

const XIcon = () => <Icon><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></Icon>;
const UploadIcon = () => <Icon className="h-6 w-6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></Icon>;

interface AddEventImageModalProps {
  event: TimelineEvent;
  onClose: () => void;
  onImageAdded: () => void;
}

const AddEventImageModal: React.FC<AddEventImageModalProps> = ({ event, onClose, onImageAdded }) => {
  const { t } = useTranslation(['timeline', 'common']);
  const { user } = useSession();
  const { addToast } = useToast();
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (file: File) => {
    if (!user) {
      addToast(t('common:errorLogin'), 'error');
      return;
    }
    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `timeline-media/${event.id}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('posts-media')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('posts-media').getPublicUrl(filePath);
      if (data.publicUrl) {
        setImageUrl(data.publicUrl);
        // Toast removido - imagem aparece no evento
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      addToast(t('common:errorUpload'), 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!imageUrl) {
      addToast(t('timeline:errorImageUrl'), 'error');
      return;
    }
    try {
      const { error } = await updateTimelineEvent(event.id, { image_url: imageUrl });
      if (error) throw error;
      // Toast removido - imagem atualiza visualmente
      onImageAdded();
    } catch (error) {
      console.error('Error updating event image:', error);
      addToast(t('timeline:errorImageUpload'), 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-6 animate-scale-in">
      <div className="bg-light-card dark:bg-dark-card rounded-lg md:rounded-2xl max-w-lg w-full max-h-[95vh] md:max-h-[80vh] flex flex-col border border-light-border dark:border-dark-border shadow-2xl overflow-hidden">
        <div className="p-3 md:p-6 flex items-center justify-between border-b border-light-border dark:border-dark-border">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white truncate pr-2">{t('timeline:addImageTitle')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors flex-shrink-0 p-1"><XIcon /></button>
        </div>
        <div className="p-3 md:p-6 space-y-3 md:space-y-4 overflow-y-auto">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('timeline:forEvent', { title: '' })} <span className="font-semibold">{event.title}</span></p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('timeline:imageUrlLabel')}</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
              className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-3 md:py-2 px-4 text-base focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="relative flex items-center justify-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm">{t('common:or')}</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])} className="hidden" accept="image/*" />
          <button
            onClick={handleFileSelect}
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg py-4 text-gray-500 dark:text-gray-400 hover:border-cyan-500 hover:text-cyan-500 transition-colors disabled:opacity-50 text-base"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-500"></div>
                <span>{t('common:sending')}</span>
              </>
            ) : (
              <>
                <UploadIcon />
                <span>{t('common:uploadFile')}</span>
              </>
            )}
          </button>
          {imageUrl && <img src={imageUrl} alt="Preview" className="mt-4 rounded-lg max-h-48 w-full object-contain" />}
        </div>
        <div className="p-3 md:p-6 flex justify-end gap-3 border-t border-light-border dark:border-dark-border">
          <button onClick={onClose} className="px-6 py-3 md:py-2 rounded-lg border border-light-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-base">{t('common:cancel')}</button>
          <button onClick={handleSubmit} className="px-6 py-3 md:py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-colors text-base">{t('timeline:saveImage')}</button>
        </div>
      </div>
    </div>
  );
};

export default AddEventImageModal;
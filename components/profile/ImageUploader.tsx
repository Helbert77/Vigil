import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';
import { Icon } from '../icons/Icon';

const UploadIcon = () => <Icon className="h-6 w-6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></Icon>;

interface ImageUploaderProps {
  userId: string;
  filePath: string; // e.g., 'avatar' or 'banner'
  onUpload: (url: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ userId, filePath, onUpload }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fullFilePath = `${userId}/${filePath}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('user-media')
      .upload(fullFilePath, file, {
        cacheControl: '3600',
        upsert: true, // Overwrite if file with same name exists
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      addToast('Falha ao enviar imagem. Tente novamente.', 'error');
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from('user-media')
      .getPublicUrl(fullFilePath);

    if (data.publicUrl) {
      onUpload(data.publicUrl);
      addToast('Imagem atualizada com sucesso!', 'success');
    } else {
      addToast('Não foi possível obter o URL da imagem.', 'error');
    }
    setIsUploading(false);
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        accept="image/png, image/jpeg, image/gif"
        disabled={isUploading}
      />
      <div
        onClick={handleIconClick}
        className="absolute inset-0 bg-black/50 flex items-center justify-center text-white cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
      >
        {isUploading ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        ) : (
          <UploadIcon />
        )}
      </div>
    </>
  );
};

export default ImageUploader;
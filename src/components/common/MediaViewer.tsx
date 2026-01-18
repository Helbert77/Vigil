import React, { useEffect } from 'react';
import { Icon } from '@/components/icons/Icon';
import ResilientVideo from './ResilientVideo';

const XIcon = () => <Icon className="h-6 w-6 md:h-8 md:w-8"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></Icon>;

interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  alt?: string;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ isOpen, onClose, mediaUrl, mediaType, alt = 'Mídia' }) => {
  // Prevenir scroll do body quando o modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fechar com tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Botão de fechar */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-[101] text-white hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white/10"
        aria-label="Fechar visualização"
      >
        <XIcon />
      </button>

      {/* Conteúdo da mídia */}
      <div 
        className="w-full h-full flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {mediaType === 'image' ? (
          <img 
            src={mediaUrl} 
            alt={alt}
            className="max-w-full max-h-full object-contain"
            onClick={onClose}
          />
        ) : (
          <ResilientVideo
            src={mediaUrl}
            controls
            autoPlay
            className="max-w-full max-h-full"
            style={{ maxHeight: '90vh', maxWidth: '90vw' }}
          />
        )}
      </div>
    </div>
  );
};

export default MediaViewer;

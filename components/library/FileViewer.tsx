import React, { useState } from 'react';
import { Icon } from '../icons/Icon';

const XIcon = () => <Icon className="h-6 w-6"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></Icon>;
const MaximizeIcon = () => <Icon className="h-5 w-5"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></Icon>;
const MinimizeIcon = () => <Icon className="h-5 w-5"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></Icon>;
const ZoomInIcon = () => <Icon className="h-5 w-5"><circle cx="11" cy="11" r="8"></circle><line x1="21" x2="16.65" y1="21" y2="16.65"></line><line x1="11" x2="11" y1="8" y2="14"></line><line x1="8" x2="14" y1="11" y2="11"></line></Icon>;
const ZoomOutIcon = () => <Icon className="h-5 w-5"><circle cx="11" cy="11" r="8"></circle><line x1="21" x2="16.65" y1="21" y2="16.65"></line><line x1="8" x2="14" y1="11" y2="11"></line></Icon>;

interface FileViewerProps {
  fileUrl: string;
  fileName: string;
  onClose: () => void;
}

const FileViewer: React.FC<FileViewerProps> = ({ fileUrl, fileName, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);

  // Detectar tipo de arquivo pela URL
  const getFileType = (url: string): 'image' | 'video' | 'pdf' | 'text' | 'document' | 'unknown' => {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension)) {
      return 'image';
    }
    if (['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(extension)) {
      return 'video';
    }
    if (extension === 'pdf') {
      return 'pdf';
    }
    if (['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'ts', 'tsx', 'jsx'].includes(extension)) {
      return 'text';
    }
    if (['doc', 'docx', 'epub', 'mobi', 'odt', 'rtf'].includes(extension)) {
      return 'document';
    }
    return 'unknown';
  };

  const fileType = getFileType(fileUrl);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const renderContent = () => {
    switch (fileType) {
      case 'image':
        return (
          <div className="flex items-center justify-center w-full h-full overflow-auto bg-gray-100 dark:bg-gray-900">
            <img
              src={fileUrl}
              alt={fileName}
              style={{ transform: `scale(${zoom / 100})`, transition: 'transform 0.2s' }}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        );

      case 'video':
        return (
          <div className="flex items-center justify-center w-full h-full bg-black">
            <video
              controls
              controlsList="nodownload"
              className="max-w-full max-h-full"
              style={{ width: '100%', height: '100%' }}
            >
              <source src={fileUrl} />
              Seu navegador não suporta a reprodução de vídeo.
            </video>
          </div>
        );

      case 'pdf':
        return (
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full border-0"
            title={fileName}
          />
        );

      case 'text':
        return (
          <iframe
            src={fileUrl}
            className="w-full h-full border-0 bg-white dark:bg-gray-900"
            title={fileName}
          />
        );

      case 'document':
        // Para documentos do Office, usar visualizador do Google Docs
        return (
          <iframe
            src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
            className="w-full h-full border-0"
            title={fileName}
          />
        );

      default:
        return (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center text-gray-600 dark:text-gray-400">
              <p className="text-lg mb-4">Não é possível visualizar este tipo de arquivo.</p>
              <a
                href={fileUrl}
                download
                className="px-6 py-3 bg-primary hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-200 inline-block"
              >
                Baixar Arquivo
              </a>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/95 z-[60] flex flex-col ${
        isFullscreen ? 'p-0' : 'p-4'
      }`}
      onClick={onClose}
    >
      {/* Header com controles */}
      <div
        className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4">
          <h3 className="text-white font-semibold text-lg truncate max-w-md">
            {fileName}
          </h3>
          <span className="text-gray-400 text-sm uppercase">
            {fileType === 'unknown' ? 'Arquivo' : fileType}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Controles de zoom (apenas para imagens) */}
          {fileType === 'image' && (
            <>
              <button
                onClick={handleZoomOut}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Diminuir zoom"
              >
                <ZoomOutIcon />
              </button>
              <span className="text-white text-sm font-medium min-w-[60px] text-center">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Aumentar zoom"
              >
                <ZoomInIcon />
              </button>
              <div className="w-px h-6 bg-gray-600 mx-2" />
            </>
          )}

          {/* Tela cheia */}
          <button
            onClick={toggleFullscreen}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          >
            {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
          </button>

          {/* Fechar */}
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Fechar"
          >
            <XIcon />
          </button>
        </div>
      </div>

      {/* Área de visualização */}
      <div
        className="flex-1 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default FileViewer;


import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { renderAsync } from 'docx-preview';
import ReactMarkdown from 'react-markdown';
import Spinner from './Spinner'; // Importando o Spinner

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface FileViewerProps {
  fileUrl: string;
  fileType: 'pdf' | 'image' | 'video' | 'docx' | 'txt' | 'csv' | 'md' | 'unsupported';
  onClose: () => void;
}

const FileViewer: React.FC<FileViewerProps> = ({ fileUrl, fileType, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [docxContent, setDocxContent] = useState<HTMLDivElement | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);

  useEffect(() => {
    if (fileType === 'docx') {
      const container = document.createElement('div');
      fetch(fileUrl)
        .then((response) => response.blob())
        .then((blob) => {
          renderAsync(blob, container).then(() => {
            setDocxContent(container);
          });
        });
    } else if (['txt', 'csv', 'md'].includes(fileType)) {
      fetch(fileUrl)
        .then((response) => response.text())
        .then((text) => {
          setTextContent(text);
        });
    }
  }, [fileUrl, fileType]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const handleZoomIn = () => setZoom((prev) => prev * 1.2);
  const handleZoomOut = () => setZoom((prev) => prev / 1.2);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages || 1));


  const renderFile = () => {
    switch (fileType) {
      case 'image':
        return (
          <img
            src={fileUrl}
            alt="Visualização de imagem"
            className="max-w-full max-h-full transition-transform duration-300"
            style={{ transform: `scale(${zoom})` }}
          />
        );
      case 'video':
        return (
          <video controls className="max-w-full max-h-full">
            <source src={fileUrl} />
            Seu navegador não suporta a tag de vídeo.
          </video>
        );
      case 'docx':
        return docxContent ? (
          <div ref={(el) => { if (el) { el.innerHTML = ''; el.appendChild(docxContent); } }} />
        ) : (
          <Spinner />
        );
      case 'txt':
      case 'csv':
        return textContent ? (
          <pre className="whitespace-pre-wrap">{textContent}</pre>
        ) : (
          <Spinner />
        );
      case 'md':
        return textContent ? (
          <div className="prose">
            <ReactMarkdown>{textContent}</ReactMarkdown>
          </div>
        ) : (
          <Spinner />
        );
      case 'pdf':
        return (
          <div className="w-full h-full flex flex-col items-center">
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<Spinner />}
              error={
                <div className="text-red-500 bg-red-100 p-4 rounded-md">
                  Falha ao carregar o PDF. Por favor, tente novamente.
                </div>
              }
            >
              <Page pageNumber={pageNumber} scale={zoom} />
            </Document>
            {numPages && (
              <div className="flex items-center justify-center space-x-4 mt-2">
                <button onClick={goToPrevPage} disabled={pageNumber <= 1} className="text-black disabled:opacity-50">
                  <ChevronLeft size={24} />
                </button>
                <span>
                  Página {pageNumber} de {numPages}
                </span>
                <button onClick={goToNextPage} disabled={pageNumber >= numPages} className="text-black disabled:opacity-50">
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </div>
        );
      default:
        return <p>Tipo de arquivo não suportado para visualização online.</p>;
    }
  };

  return (
    <div
      ref={viewerRef}
      className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 ${
        isFullScreen ? 'p-0' : ''
      }`}
    >
      <div
        className={`relative bg-white p-4 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto ${
          isFullScreen ? 'w-screen h-screen max-w-none max-h-none rounded-none' : ''
        }`}
      >
        <div className="absolute top-2 right-2 z-10 flex items-center space-x-2 bg-gray-800 bg-opacity-50 p-2 rounded-md">
          {(fileType === 'image' || fileType === 'pdf') && (
            <>
              <button onClick={handleZoomIn} className="text-white">
                <ZoomIn size={24} />
              </button>
              <button onClick={handleZoomOut} className="text-white">
                <ZoomOut size={24} />
              </button>
            </>
          )}
          <button onClick={toggleFullScreen} className="text-white">
            <Maximize size={24} />
          </button>
          <button onClick={onClose} className="text-white">
            <X size={24} />
          </button>
        </div>
        <div className="flex items-center justify-center w-full h-full">{renderFile()}</div>
      </div>
    </div>
  );
};

export default FileViewer;
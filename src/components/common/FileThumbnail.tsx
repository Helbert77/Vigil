import React from 'react';
import PdfIcon from '@/src/components/icons/filetypes/PdfIcon';
import DocxIcon from '@/src/components/icons/filetypes/DocxIcon';
import TxtIcon from '@/src/components/icons/filetypes/TxtIcon';
import CsvIcon from '@/src/components/icons/filetypes/CsvIcon';
import MdIcon from '@/src/components/icons/filetypes/MdIcon';
import FileIcon from '@/src/components/icons/filetypes/FileIcon';
import SafeImage from '@/src/components/common/SafeImage';

interface FileThumbnailProps {
  fileUrl: string;
  fileType: string;
  alt: string;
  className?: string;
}

const FileThumbnail: React.FC<FileThumbnailProps> = ({ fileUrl, fileType, alt, className }) => {
  // Extrai o rounded da className para aplicar ao wrapper também
  const roundedMatch = className?.match(/rounded-[^\s]*/);
  const roundedClass = roundedMatch ? roundedMatch[0] : 'rounded-lg';
  const classNameWithoutRounded = className?.replace(/rounded-[^\s]*/g, '').trim() || '';
  
  const renderThumbnail = () => {
    switch (fileType) {
      case 'image':
        // Para imagens, mantém todas as classes incluindo rounded para que a imagem tenha cantos arredondados
        return <SafeImage src={fileUrl} alt={alt} className={className} />;
      case 'video':
        // Para vídeos, mantém todas as classes incluindo rounded
        return (
          <video src={fileUrl} className={className} controls={false}>
            Seu navegador não suporta a tag de vídeo.
          </video>
        );
      case 'pdf':
        return <PdfIcon className={classNameWithoutRounded || 'w-full h-full max-w-16 max-h-16 mx-auto'} />;
      case 'docx':
        return <DocxIcon className={classNameWithoutRounded || 'w-full h-full max-w-16 max-h-16 mx-auto'} />;
      case 'txt':
        return <TxtIcon className={classNameWithoutRounded || 'w-full h-full max-w-16 max-h-16 mx-auto'} />;
      case 'csv':
        return <CsvIcon className={classNameWithoutRounded || 'w-full h-full max-w-16 max-h-16 mx-auto'} />;
      case 'md':
        return <MdIcon className={classNameWithoutRounded || 'w-full h-full max-w-16 max-h-16 mx-auto'} />;
      default:
        return <FileIcon className={classNameWithoutRounded || 'w-full h-full max-w-16 max-h-16 mx-auto'} />;
    }
  };
  
  const wrapperClassName = `w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 ${roundedClass}`;

  return <div className={wrapperClassName}>{renderThumbnail()}</div>;
};

export default FileThumbnail;
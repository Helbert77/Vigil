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
  const renderThumbnail = () => {
    switch (fileType) {
      case 'image':
        return <SafeImage src={fileUrl} alt={alt} className={className} />;
      case 'video':
        return (
          <video src={fileUrl} className={className} controls={false}>
            Seu navegador não suporta a tag de vídeo.
          </video>
        );
      case 'pdf':
        return <PdfIcon className={className} />;
      case 'docx':
        return <DocxIcon className={className} />;
      case 'txt':
        return <TxtIcon className={className} />;
      case 'csv':
        return <CsvIcon className={className} />;
      case 'md':
        return <MdIcon className={className} />;
      default:
        return <FileIcon className={className} />;
    }
  };

  return <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-lg">{renderThumbnail()}</div>;
};

export default FileThumbnail;
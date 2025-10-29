import React, { useState } from 'react';
import { Icon } from '../icons/Icon';

const ImageIcon = () => (
  <Icon className="h-8 w-8 text-gray-400 dark:text-gray-500">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="9" cy="9" r="2"/>
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
  </Icon>
);

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  showFallbackIcon?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  fallbackClassName = '',
  showFallbackIcon = true,
  onLoad,
  onError
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleImageLoad = () => {
    setImageError(false);
    setIsLoading(false);
    onLoad?.();
  };

  const renderFallback = () => (
    <div className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${fallbackClassName || className}`}>
      {showFallbackIcon && <ImageIcon />}
    </div>
  );

  if (!src || src.trim() === '' || imageError) {
    return renderFallback();
  }

  return (
    <>
      {isLoading && renderFallback()}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : ''}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </>
  );
};

export default SafeImage;
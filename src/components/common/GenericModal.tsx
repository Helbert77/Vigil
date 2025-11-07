import React from 'react';
import { Icon } from '@/components/icons/Icon';

const XIcon = () => <Icon className="h-6 w-6"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></Icon>;

interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const GenericModal: React.FC<GenericModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      case 'full':
        return 'max-w-[95vw]';
      default:
        return 'max-w-lg';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 md:p-4" onClick={onClose}>
      <div 
        className={`bg-light-card dark:bg-dark-card rounded-lg md:rounded-xl shadow-xl w-full ${getSizeClasses()} max-h-[95vh] md:max-h-[90vh] flex flex-col`} 
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="p-3 md:p-4 lg:p-6 flex justify-between items-center shrink-0">
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold truncate pr-2 text-light-text dark:text-dark-text">{title}</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <XIcon />
            </button>
          </div>
        )}
        <div className={`flex-1 overflow-y-auto ${title ? 'p-3 md:p-4 lg:p-6' : 'p-3 md:p-4 lg:p-6 pt-4 md:pt-6 lg:pt-8'} scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default GenericModal;

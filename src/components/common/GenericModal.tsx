import React from 'react';
import { Icon } from '@/components/icons/Icon';

const XIcon = () => <Icon className="h-6 w-6"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></Icon>;

interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const GenericModal: React.FC<GenericModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 md:p-4" onClick={onClose}>
      <div className="bg-light-card dark:bg-dark-card rounded-lg md:rounded-xl shadow-xl w-full max-w-lg max-h-[95vh] md:max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-3 md:p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center shrink-0">
          <h2 className="text-lg md:text-xl font-bold truncate pr-2">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 flex-shrink-0 p-1">
            <XIcon />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 md:p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default GenericModal;
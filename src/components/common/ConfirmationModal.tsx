import React from 'react';
import GenericModal from './GenericModal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  error?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children?: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar ação',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
  error,
  size = 'sm',
  children,
}) => {
  return (
    <GenericModal isOpen={isOpen} onClose={onClose} title={title} size={size}>
      <div className="space-y-4">
        {message && <p className="text-light-text dark:text-dark-text" role="alert" aria-live="polite">{message}</p>}

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        {children}

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded-md border border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-60"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-60"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </GenericModal>
  );
};

export default ConfirmationModal;
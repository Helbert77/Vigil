import React, { useState } from 'react';
import { Icon } from '@/components/icons/Icon';

const XIcon = () => <Icon className="h-6 w-6"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></Icon>;

const REPORT_REASONS = [
  { id: 'spam', label: 'É spam' },
  { id: 'hate_speech', label: 'Discurso de ódio ou violência' },
  { id: 'misinformation', label: 'Desinformação prejudicial' },
  { id: 'harassment', label: 'Assédio ou bullying' },
  { id: 'self_harm', label: 'Autopreservação ou suicídio' },
  { id: 'other', label: 'Outro motivo' },
];

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, notes: string) => void;
  isSubmitting: boolean;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (selectedReason) {
      onSubmit(selectedReason, notes);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 md:p-4" onClick={onClose}>
      <div className="bg-light-card dark:bg-dark-card rounded-lg md:rounded-xl shadow-xl w-full max-w-md max-h-[95vh] md:max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-3 md:p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center">
          <h2 className="text-lg md:text-xl font-bold truncate pr-2">Denunciar Conteúdo</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 flex-shrink-0 p-1">
            <XIcon />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Por que você está denunciando este conteúdo? Sua denúncia é anônima.</p>
          <div className="space-y-2">
            {REPORT_REASONS.map(reason => (
              <label key={reason.id} className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                <input
                  type="radio"
                  name="report-reason"
                  value={reason.id}
                  checked={selectedReason === reason.id}
                  onChange={() => setSelectedReason(reason.id)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 flex-shrink-0"
                />
                <span className="text-sm font-medium">{reason.label}</span>
              </label>
            ))}
          </div>
          {selectedReason === 'other' && (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Por favor, forneça mais detalhes."
              className="w-full h-24 p-3 md:p-2 border rounded-md bg-light-bg dark:bg-dark-bg border-light-border dark:border-dark-border text-base"
            />
          )}
        </div>
        <div className="p-3 md:p-4 border-t border-light-border dark:border-dark-border flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
            className="bg-primary hover:bg-gray-600 text-white font-bold py-3 md:py-2 px-6 rounded-full transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-base"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Denúncia'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
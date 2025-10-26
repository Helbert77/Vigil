import React, { useState } from 'react';
import Card from '@/components/common/Card';
import Button from '@/src/components/common/Button';
import { Icon } from '@/components/icons/Icon';

const XIcon = () => <Icon className="h-6 w-6"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></Icon>;

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, details: string) => void;
  isCancelling: boolean;
}

const cancellationReasons = [
  "É muito caro",
  "Não uso os recursos premium",
  "Encontrei uma alternativa melhor",
  "Estou dando um tempo da plataforma",
  "Problemas técnicos",
];

const CancellationModal: React.FC<CancellationModalProps> = ({ isOpen, onClose, onConfirm, isCancelling }) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [otherDetails, setOtherDetails] = useState<string>('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedReason) {
      onConfirm(selectedReason, otherDetails);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 md:p-4" onClick={onClose}>
      <Card className="w-full max-w-md max-h-[95vh] md:max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg md:text-xl font-bold truncate pr-2">Cancelar Assinatura</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 flex-shrink-0 p-1">
            <XIcon />
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm md:text-base">
          Lamentamos ver você partir. Por favor, nos diga por que você está cancelando para que possamos melhorar.
        </p>
        <div className="space-y-3">
          {cancellationReasons.map((reason) => (
            <label key={reason} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="cancellationReason"
                value={reason}
                checked={selectedReason === reason}
                onChange={() => setSelectedReason(reason)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
              />
              <span className="text-sm md:text-base">{reason}</span>
            </label>
          ))}
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="cancellationReason"
              value="Outro"
              checked={selectedReason === 'Outro'}
              onChange={() => setSelectedReason('Outro')}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
            />
            <span className="text-sm md:text-base">Outro</span>
          </label>
          {selectedReason === 'Outro' && (
            <textarea
              value={otherDetails}
              onChange={(e) => setOtherDetails(e.target.value)}
              placeholder="Por favor, especifique..."
              rows={3}
              className="w-full mt-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md shadow-sm py-3 md:py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary text-base"
            />
          )}
        </div>
        <div className="mt-8 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <Button onClick={onClose} variant="secondary" className="w-full sm:w-auto">
            Voltar
          </Button>
          <Button
            onClick={handleConfirm}
            variant="danger"
            disabled={!selectedReason || isCancelling}
            className="w-full sm:w-auto"
          >
            {isCancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CancellationModal;
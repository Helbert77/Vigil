import React, { useState } from 'react';
import Avatar from '@/components/common/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import GenericModal from '@/src/components/common/GenericModal';

interface ModerationCardProps {
  item: any;
  onAction: (params: { itemId: string; action: 'approved' | 'rejected' | 'warn' | 'suspend'; reason?: string; duration?: string }) => void;
}

const ModerationCard: React.FC<ModerationCardProps> = ({ item, onAction }) => {
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'warn' | 'suspend' | null>(null);
  const [reason, setReason] = useState('');

  const getSeverityClass = (score: number) => {
    if (score > 85) return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    if (score > 70) return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
    return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
  };

  const handleActionClick = (action: 'warn' | 'suspend') => {
    setSelectedAction(action);
    setIsReasonModalOpen(true);
  };

  const confirmActionWithReason = () => {
    if (!selectedAction) return;
    onAction({
      itemId: item.id,
      action: selectedAction,
      reason: reason,
      duration: selectedAction === 'suspend' ? '7 days' : undefined,
    });
    setIsReasonModalOpen(false);
    setReason('');
    setSelectedAction(null);
  };

  return (
    <>
      <div className={`border-l-4 p-4 rounded-lg shadow-md bg-light-card dark:bg-dark-card ${getSeverityClass(item.severity_score)}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <Avatar src={item.author?.avatar_url} alt={item.author?.username} size="sm" />
              <div>
                <p className="font-bold">{item.author?.username || 'Usuário Anônimo'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-2 py-1 text-xs font-semibold bg-gray-200 dark:bg-gray-700 rounded-full">
                Score: {item.severity_score}
              </span>
              {(item.violation_types || []).map((type: string) => (
                <span key={type} className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 rounded-full">
                  {type}
                </span>
              ))}
            </div>
            <p className="text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 p-3 rounded-md whitespace-pre-wrap">
              {item.content_text}
            </p>
          </div>
          <div className="flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 flex-shrink-0 sm:ml-4 mt-4 sm:mt-0">
            <button onClick={() => onAction({ itemId: item.id, action: 'approved' })} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">Aprovar</button>
            <button onClick={() => onAction({ itemId: item.id, action: 'rejected' })} className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">Rejeitar</button>
            <button onClick={() => handleActionClick('warn')} className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium">Advertir</button>
            <button onClick={() => handleActionClick('suspend')} className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium">Suspender</button>
          </div>
        </div>
      </div>

      <GenericModal
        isOpen={isReasonModalOpen}
        onClose={() => setIsReasonModalOpen(false)}
        title={`Justificar Ação: ${selectedAction === 'warn' ? 'Advertência' : 'Suspensão'}`}
      >
        <div className="space-y-4">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Descreva o motivo da ação (opcional)..."
            className="w-full h-24 p-2 border rounded-md bg-light-bg dark:bg-dark-bg border-light-border dark:border-dark-border"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsReasonModalOpen(false)} className="px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">Cancelar</button>
            <button onClick={confirmActionWithReason} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-gray-600">Confirmar</button>
          </div>
        </div>
      </GenericModal>
    </>
  );
};

export default ModerationCard;
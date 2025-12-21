import React, { useState } from 'react';
import Avatar from '@/components/common/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TimelineModerationQueueItem } from '@/types';

interface TimelineModerationCardProps {
  item: TimelineModerationQueueItem;
  onApprove: (itemId: string) => void;
  onReject: (itemId: string, reason?: string) => void;
  onEdit: (item: TimelineModerationQueueItem) => void;
}

const CATEGORY_LABELS = {
  politics: 'Política',
  science: 'Ciência',
  health: 'Saúde',
  religion: 'Religião',
  technology: 'Tecnologia',
  society: 'Sociedade'
};

const TimelineModerationCard: React.FC<TimelineModerationCardProps> = ({
  item,
  onApprove,
  onReject,
  onEdit
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleReject = () => {
    onReject(item.id, rejectReason);
    setShowRejectModal(false);
    setRejectReason('');
  };

  return (
    <>
      <div className="border-l-4 border-cyan-500 p-4 rounded-lg shadow-md bg-light-card dark:bg-dark-card">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            {/* Cabeçalho com autor */}
            <div className="flex items-center space-x-3 mb-3">
              <Avatar src={item.author?.avatar_url} alt={item.author?.username} size="sm" />
              <div>
                <p className="font-bold text-gray-900 dark:text-white">
                  {item.author?.username || 'Usuário Anônimo'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            </div>

            {/* Informações do evento */}
            <div className="space-y-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
                    {item.year < 0 ? `${Math.abs(item.year)} AC` : `${item.year} DC`}
                  </span>
                  <span className="px-2 py-1 text-xs font-semibold bg-gray-200 dark:bg-gray-700 rounded-full">
                    {CATEGORY_LABELS[item.category]}
                  </span>
                  {item.country && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      📍 {item.country}
                    </span>
                  )}
                </div>
              </div>

              {item.description && (
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                  <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {item.description}
                  </p>
                </div>
              )}

              {item.image_url && (
                <div className="mt-3">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full max-h-64 object-contain rounded-lg border border-light-border dark:border-dark-border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {(item.source_1 || item.source_2) && (
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Fontes:</p>
                  {item.source_1 && (
                    <a
                      href={item.source_1}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-cyan-600 dark:text-cyan-400 hover:underline truncate"
                    >
                      {item.source_1}
                    </a>
                  )}
                  {item.source_2 && (
                    <a
                      href={item.source_2}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-cyan-600 dark:text-cyan-400 hover:underline truncate"
                    >
                      {item.source_2}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col space-y-2 flex-shrink-0">
            <button
              onClick={() => onApprove(item.id)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium whitespace-nowrap"
            >
              ✓ Aprovar
            </button>
            <button
              onClick={() => onEdit(item)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
            >
              ✎ Editar
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium whitespace-nowrap"
            >
              ✕ Rejeitar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Rejeição */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-light-card dark:bg-dark-card rounded-2xl max-w-md w-full p-6 border border-light-border dark:border-dark-border">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Rejeitar Evento
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Deseja adicionar um motivo para a rejeição? (Opcional)
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Motivo da rejeição..."
              className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg p-3 text-gray-900 dark:text-white mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirmar Rejeição
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TimelineModerationCard;

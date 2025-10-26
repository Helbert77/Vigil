import React from 'react';
import Avatar from '@/components/common/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CancellationFeedbackCardProps {
  feedback: any;
}

const CancellationFeedbackCard: React.FC<CancellationFeedbackCardProps> = ({ feedback }) => {
  const userProfile = feedback.profile;

  return (
    <div className="bg-light-bg dark:bg-dark-bg p-4 rounded-lg border border-light-border dark:border-dark-border">
      <div className="flex items-start space-x-3">
        <Avatar src={userProfile?.avatar_url} alt={userProfile?.username} size="md" />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{userProfile?.username || 'Usuário Anônimo'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Cancelado {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true, locale: ptBR })}
              </p>
            </div>
            <span className="px-2 py-1 text-xs font-semibold bg-gray-200 dark:bg-gray-700 rounded-full">
              Plano Anterior: {feedback.previous_plan.toUpperCase()}
            </span>
          </div>
          <div className="mt-3 space-y-2">
            <div>
              <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400">Motivo</h4>
              <p className="text-sm p-2 bg-gray-200 dark:bg-gray-700/50 rounded-md mt-1">{feedback.reason}</p>
            </div>
            {feedback.details && (
              <div>
                <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400">Detalhes</h4>
                <p className="text-sm p-2 bg-gray-200 dark:bg-gray-700/50 rounded-md mt-1 whitespace-pre-wrap">{feedback.details}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancellationFeedbackCard;
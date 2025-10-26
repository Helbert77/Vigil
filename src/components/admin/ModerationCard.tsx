import React from 'react';
import Avatar from '@/components/common/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ModerationCardProps {
  item: any;
  onAction: (itemId: string, action: 'approved' | 'rejected') => void;
}

const ModerationCard: React.FC<ModerationCardProps> = ({ item, onAction }) => {
  const getSeverityClass = (score: number) => {
    if (score > 85) return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    if (score > 70) return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
    return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
  };

  return (
    <div className={`border-l-4 p-4 rounded-lg shadow-md bg-light-card dark:bg-dark-card ${getSeverityClass(item.severity_score)}`}>
      <div className="flex justify-between items-start">
        <div>
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
        <div className="flex flex-col space-y-2 flex-shrink-0 ml-4">
          <button
            onClick={() => onAction(item.id, 'approved')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Aprovar
          </button>
          <button
            onClick={() => onAction(item.id, 'rejected')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Rejeitar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModerationCard;
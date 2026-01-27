import React from 'react';
import Avatar from '@/components/common/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

interface CancellationFeedbackCardProps {
  feedback: any;
}

const CancellationFeedbackCard: React.FC<CancellationFeedbackCardProps> = ({ feedback }) => {
  const { t, i18n } = useTranslation(['moderation', 'common']);
  const userProfile = feedback.profile;
  
  const currentLocale = i18n.language === 'pt' || i18n.language === 'pt-BR' ? ptBR : enUS;

  // Mapear razões para ícones e cores
  const reasonConfig: Record<string, { icon: string; color: string; bgColor: string }> = {
    'É muito caro': { icon: '💰', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-900/20' },
    'Não uso os recursos premium': { icon: '📦', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
    'Encontrei uma alternativa melhor': { icon: '🔄', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
    'Estou dando um tempo da plataforma': { icon: '⏸️', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    'Problemas técnicos': { icon: '⚠️', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
  };

  const reasonKeyMap: Record<string, string> = {
    'É muito caro': 'tooExpensive',
    'Não uso os recursos premium': 'notUsingFeatures',
    'Encontrei uma alternativa melhor': 'foundBetterAlternative',
    'Estou dando um tempo da plataforma': 'takingBreak',
    'Problemas técnicos': 'techIssues',
  };

  const config = reasonConfig[feedback.reason] || { icon: '❓', color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-50 dark:bg-gray-900/20' };
  
  const translatedReason = reasonKeyMap[feedback.reason] 
    ? t(`dashboard.feedbackCard.reasons.${reasonKeyMap[feedback.reason]}`)
    : feedback.reason;

  return (
    <div className="bg-light-bg dark:bg-dark-bg p-4 rounded-lg border border-light-border dark:border-dark-border hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        <Avatar src={userProfile?.avatar_url} alt={userProfile?.username} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 dark:text-white truncate">
                {userProfile?.username || t('dashboard.feedbackCard.anonymousUser')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('dashboard.feedbackCard.canceled')} {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true, locale: currentLocale })}
              </p>
            </div>
            <span className="px-3 py-1 text-xs font-semibold bg-gray-200 dark:bg-gray-700 rounded-full whitespace-nowrap">
              {feedback.previous_plan.toUpperCase()}
            </span>
          </div>

          <div className="mt-3 space-y-3">
            {/* Motivo com ícone e cor */}
            <div className={`${config.bgColor} rounded-lg p-3 border-l-4 ${config.color.replace('text-', 'border-')}`}>
              <div className="flex items-start gap-2">
                <span className="text-xl flex-shrink-0">{config.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-1">
                    {t('dashboard.feedbackCard.cancellationReason')}
                  </h4>
                  <p className={`text-sm font-medium ${config.color}`}>
                    {translatedReason}
                  </p>
                </div>
              </div>
            </div>

            {/* Detalhes adicionais */}
            {feedback.details && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <span>💬</span>
                  {t('dashboard.feedbackCard.additionalDetails')}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {feedback.details}
                </p>
              </div>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <span>📅</span>
                {new Date(feedback.created_at).toLocaleDateString(i18n.language || 'pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {userProfile?.id && (
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <span>🆔</span>
                  {userProfile.id.substring(0, 8)}...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancellationFeedbackCard;
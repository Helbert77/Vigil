import React, { useState } from 'react';
import Avatar from '@/components/common/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import GenericModal from '@/src/components/common/GenericModal';
import { useTranslation } from 'react-i18next';

interface AppealCardProps {
  appeal: any;
  onProcess: (appealId: string, violationId: string, action: 'approved' | 'rejected', notes?: string) => void;
}

const AppealCard: React.FC<AppealCardProps> = ({ appeal, onProcess }) => {
  const { t } = useTranslation(['moderation', 'common']);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [action, setAction] = useState<'approved' | 'rejected' | null>(null);
  const [notes, setNotes] = useState('');

  const handleActionClick = (selectedAction: 'approved' | 'rejected') => {
    setAction(selectedAction);
    setIsModalOpen(true);
  };

  const confirmAction = () => {
    if (!action) return;
    onProcess(appeal.id, appeal.violation_id, action, notes);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-md border border-light-border dark:border-dark-border">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <Avatar src={appeal.user?.avatar_url} alt={appeal.user?.username} size="sm" />
              <div>
                <p className="font-bold">{appeal.user?.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('moderation:appealSent', { time: formatDistanceToNow(new Date(appeal.created_at), { addSuffix: true, locale: ptBR }) })}
                </p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold text-gray-600 dark:text-gray-400">{t('moderation:originalViolation')}</h4>
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded mt-1">
                  <p><strong>{t('moderation:action')}:</strong> {appeal.violation?.action_taken}</p>
                  <p><strong>{t('moderation:reason')}:</strong> {appeal.violation?.reason}</p>
                  {appeal.violation?.content_text && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500">{t('moderation:originalContent')}</p>
                      <blockquote className="text-sm italic border-l-2 border-gray-400 pl-2 mt-1">
                        {appeal.violation.content_text}
                      </blockquote>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-600 dark:text-gray-400">{t('moderation:userJustification')}</h4>
                <p className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded mt-1 whitespace-pre-wrap">{appeal.reason}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-2 flex-shrink-0 ml-4">
            <button onClick={() => handleActionClick('approved')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">{t('common:approve')}</button>
            <button onClick={() => handleActionClick('rejected')} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">{t('common:reject')}</button>
          </div>
        </div>
      </div>

      <GenericModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('moderation:confirmActionTitle', { action: action === 'approved' ? t('common:approve') : t('common:reject') })}>
        <div className="space-y-4">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('moderation:internalNotesPlaceholder')} className="w-full h-24 p-2 border rounded-md bg-light-bg dark:bg-dark-bg border-light-border dark:border-dark-border" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">{t('common:cancel')}</button>
            <button onClick={confirmAction} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-gray-600">{t('common:confirm')}</button>
          </div>
        </div>
      </GenericModal>
    </>
  );
};

export default AppealCard;
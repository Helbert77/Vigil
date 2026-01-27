import React from 'react';
import { useToast } from '@/hooks/useToast';
import * as api from '@/src/services/api';
import AppealCard from '@/components/admin/AppealCard';
import { useSession } from '@/contexts/SessionContext';
import { useTranslation } from 'react-i18next';

interface AppealsProps {
  appeals: any[];
  isLoading: boolean;
  onDataChange: () => void;
}

const Appeals: React.FC<AppealsProps> = ({ appeals, isLoading, onDataChange }) => {
  const { addToast } = useToast();
  const { user: moderator } = useSession();
  const { t } = useTranslation('moderation');

  const handleProcessAppeal = async (appealId: string, violationId: string, action: 'approved' | 'rejected', notes?: string) => {
    if (!moderator) return;
    try {
      const { error } = await api.processAppeal(appealId, violationId, action, notes);
      if (error) throw error;
      
      if (action === 'approved') {
        addToast(t('appealApprovedSuccess'), 'success');
      } else {
        addToast(t('appealRejectedSuccess'), 'success');
      }
      
      onDataChange(); // Trigger a refetch
    } catch (error) {
      addToast(t('processAppealError'), 'error');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{t('appealsQueueTitle')}</h1>
      {isLoading ? (
        <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
      ) : appeals.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400"><p>{t('emptyAppealsMessage')}</p></div>
      ) : (
        <div className="space-y-4">
          {appeals.map((appeal) => (
            <AppealCard key={appeal.id} appeal={appeal} onProcess={handleProcessAppeal} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Appeals;
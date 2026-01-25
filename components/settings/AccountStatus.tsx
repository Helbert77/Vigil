import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import * as api from '@/src/services/api';
import { useToast } from '@/hooks/useToast';
import GenericModal from '@/src/components/common/GenericModal';
import { useTranslation } from 'react-i18next';

interface AccountStatusProps {
  user: User;
}

const AccountStatus: React.FC<AccountStatusProps> = ({ user }) => {
  const { t } = useTranslation('settings');
  const [violations, setViolations] = useState<any[]>([]);
  const [appeals, setAppeals] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<any | null>(null);
  const [appealReason, setAppealReason] = useState('');
  const { addToast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [violationsRes, appealsRes] = await Promise.all([
        api.fetchUserViolations(user.id),
        api.fetchUserAppeals(user.id)
      ]);
      if (violationsRes.error) throw violationsRes.error;
      if (appealsRes.error) throw appealsRes.error;
      
      setViolations(violationsRes.data || []);
      const appealsMap = new Map((appealsRes.data || []).map((a: any) => [a.violation_id, a.status]));
      setAppeals(appealsMap);
    } catch (error) {
      addToast(t('account.accountStatusError'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const handleOpenAppealModal = (violation: any) => {
    setSelectedViolation(violation);
    setIsAppealModalOpen(true);
  };

  const handleSendAppeal = async () => {
    if (!appealReason.trim() || !selectedViolation) return;
    try {
      const { error } = await api.createAppeal({
        violation_id: selectedViolation.id,
        user_id: user.id,
        reason: appealReason,
      });
      if (error) throw error;
      addToast(t('account.appealSent'), 'success');
      fetchData(); // Refresh data
    } catch (error) {
      addToast(t('account.appealError'), 'error');
    } finally {
      setIsAppealModalOpen(false);
      setAppealReason('');
      setSelectedViolation(null);
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 text-xs font-semibold bg-yellow-200 text-yellow-800 rounded-full">{t('account.pending')}</span>;
      case 'approved': return <span className="px-2 py-1 text-xs font-semibold bg-green-200 text-green-800 rounded-full">{t('account.approved')}</span>;
      case 'rejected': return <span className="px-2 py-1 text-xs font-semibold bg-red-200 text-red-800 rounded-full">{t('account.rejected')}</span>;
      default: return null;
    }
  };

  if (isLoading) return <p>{t('account.loadingAccountStatus')}</p>;

  return (
    <div>
      <h3 className="font-medium text-gray-800 dark:text-gray-200">{t('account.accountStatusTitle')}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t('account.accountStatusDesc')}</p>
      <div className="space-y-3">
        {violations.length > 0 ? violations.map(v => (
          <div key={v.id} className="p-3 bg-light-bg dark:bg-dark-bg rounded-lg text-sm flex justify-between items-center">
            <div>
              <p><strong>{t('account.action')}:</strong> <span className="font-mono uppercase">{v.action_taken}</span></p>
              <p><strong>{t('account.reason')}:</strong> {v.reason || t('account.notAvailable')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('account.onDate', { date: new Date(v.created_at).toLocaleString() })}
              </p>
            </div>
            <div>
              {appeals.has(v.id) ? (
                getStatusChip(appeals.get(v.id)!)
              ) : (
                <button onClick={() => handleOpenAppealModal(v)} className="px-3 py-1 bg-primary text-white rounded-full text-xs hover:bg-gray-600">{t('account.appeal')}</button>
              )}
            </div>
          </div>
        )) : <p className="text-sm text-gray-500">{t('account.noViolations')}</p>}
      </div>

      <GenericModal isOpen={isAppealModalOpen} onClose={() => setIsAppealModalOpen(false)} title={t('account.appealDecision')}>
        <div className="space-y-4">
          <p className="text-sm">{t('account.appealingAction')} <strong>{selectedViolation?.action_taken.toUpperCase()}</strong></p>
          <textarea value={appealReason} onChange={(e) => setAppealReason(e.target.value)} placeholder={t('messages.explainAppeal')} className="w-full h-32 p-2 border rounded-md bg-light-bg dark:bg-dark-bg border-light-border dark:border-dark-border" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsAppealModalOpen(false)} className="px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">{t('account.cancel')}</button>
            <button onClick={handleSendAppeal} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-gray-600">{t('account.sendAppeal')}</button>
          </div>
        </div>
      </GenericModal>
    </div>
  );
};

export default AccountStatus;
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';
import ModerationCard from '@/components/admin/ModerationCard';
import TimelineModerationSection from '../../src/components/timeline/TimelineModerationSection';
import * as api from '../../src/services/api';
import { useTranslation } from 'react-i18next';

interface ModerationProps {
  queue: any[];
  isLoading: boolean;
  onDataChange: () => void;
}

const Moderation: React.FC<ModerationProps> = ({ queue, isLoading, onDataChange }) => {
  const { addToast } = useToast();
  const { t } = useTranslation('moderation');

  const handleAction = async (params: { itemId: string; action: 'approved' | 'rejected' | 'warn' | 'suspend'; reason?: string; duration?: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await api.processModerationAction({ ...params, moderatorId: user.id });
      if (error) throw error;
      addToast(t('actionExecutedSuccess', { action: params.action }), 'success');
      onDataChange(); // Trigger a refetch
    } catch (error) {
      addToast(t('processingActionError'), 'error');
      console.error(error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{t('pageTitle')}</h1>
      
      {/* NOVA SEÇÃO - Eventos da Timeline */}
      <div className="mb-8">
        <TimelineModerationSection />
      </div>

      {/* SEÇÃO EXISTENTE - Posts e Comentários */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('sectionPosts')}</h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : queue.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>{t('emptyQueueMessage')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {queue.map((item) => (
              <ModerationCard key={item.id} item={item} onAction={handleAction} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Moderation;
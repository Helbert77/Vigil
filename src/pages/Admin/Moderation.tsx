import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';
import ModerationCard from '@/components/admin/ModerationCard';
import * as api from '@/src/services/api';
import { UUID } from '@/types';

interface ModerationProps {
  queue: any[];
  isLoading: boolean;
  onDataChange: () => void;
}

const Moderation: React.FC<ModerationProps> = ({ queue, isLoading, onDataChange }) => {
  const { addToast } = useToast();

  const handleAction = async (params: { itemId: string; action: 'approved' | 'rejected' | 'warn' | 'suspend'; reason?: string; duration?: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const item = queue.find(q => q.id === params.itemId);
    if (!item) {
      addToast('Item não encontrado na fila.', 'error');
      return;
    }

    try {
      const apiParams = {
        itemId: item.id as UUID,
        action: params.action,
        reason: params.reason,
        duration: params.duration,
        moderatorId: user.id as UUID,
      };
      const { error } = await api.processModerationAction(apiParams);
      if (error) throw error;
      addToast(`Ação "${params.action}" executada com sucesso.`, 'success');
      onDataChange(); // Trigger a refetch
    } catch (error) {
      addToast('Erro ao processar a ação.', 'error');
      console.error(error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Fila de Moderação</h1>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : queue.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>A fila de moderação está vazia. Bom trabalho!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((item) => (
            <ModerationCard key={item.id} item={item} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Moderation;
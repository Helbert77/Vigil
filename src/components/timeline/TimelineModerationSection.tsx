import React, { useState } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { useTimelineModeration } from '../../hooks/useTimelineModeration';
import { useToast } from '@/hooks/useToast';
import TimelineModerationCard from './TimelineModerationCard';
import AddEventModal from '@/components/timeline/AddEventModal';
import { TimelineModerationQueueItem, TimelineEvent } from '@/types';
import * as api from '../../services/api';

const TimelineModerationSection: React.FC = () => {
  const { user } = useSession();
  const { addToast } = useToast();
  const { queue, loading, refetch } = useTimelineModeration(user?.id || null, user?.role || null);
  const [editingItem, setEditingItem] = useState<TimelineModerationQueueItem | null>(null);

  const handleApprove = async (itemId: string) => {
    if (!user) return;

    try {
      const { error } = await api.approveTimelineEvent(itemId, user.id);
      if (error) throw error;
      addToast('Evento aprovado e adicionado à timeline!', 'success');
      refetch();
    } catch (error) {
      console.error('Erro ao aprovar evento:', error);
      addToast('Erro ao aprovar evento. Tente novamente.', 'error');
    }
  };

  const handleReject = async (itemId: string, reason?: string) => {
    if (!user) return;

    try {
      const { error } = await api.rejectTimelineEvent(itemId, user.id, reason);
      if (error) throw error;
      addToast('Evento rejeitado.', 'success');
      refetch();
    } catch (error) {
      console.error('Erro ao rejeitar evento:', error);
      addToast('Erro ao rejeitar evento. Tente novamente.', 'error');
    }
  };

  const handleEdit = (item: TimelineModerationQueueItem) => {
    setEditingItem(item);
  };

  const handleSaveEdit = async () => {
    refetch();
    setEditingItem(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Eventos da Timeline Pendentes
        </h2>
        <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 rounded-full text-sm font-semibold">
          {queue.length} pendente{queue.length !== 1 ? 's' : ''}
        </span>
      </div>

      {queue.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>Nenhum evento da timeline aguardando moderação.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((item) => (
            <TimelineModerationCard
              key={item.id}
              item={item}
              onApprove={handleApprove}
              onReject={handleReject}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Modal de Edição - Reutiliza AddEventModal */}
      {editingItem && (
        <AddEventModal
          onClose={() => setEditingItem(null)}
          onEventAdded={handleSaveEdit}
          editingEvent={{
            id: editingItem.id,
            title: editingItem.title,
            year: editingItem.year,
            category: editingItem.category,
            description: editingItem.description,
            country: editingItem.country,
            source_1: editingItem.source_1,
            source_2: editingItem.source_2,
            event_date: editingItem.event_date,
            x_position: 0,
            y_position: 0
          } as TimelineEvent}
          isModerationEdit={true}
          queueItemId={editingItem.id}
        />
      )}
    </div>
  );
};

export default TimelineModerationSection;

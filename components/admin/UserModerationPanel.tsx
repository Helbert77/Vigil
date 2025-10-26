import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import * as api from '@/src/services/api';
import { useToast } from '@/hooks/useToast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import GenericModal from '@/src/components/common/GenericModal';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { useSession } from '@/contexts/SessionContext';
import { Icon } from '@/components/icons/Icon';

const TrashIcon = () => <Icon className="h-4 w-4 text-gray-500 hover:text-red-500"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></Icon>;

interface UserModerationPanelProps {
  user: User;
}

const UserModerationPanel: React.FC<UserModerationPanelProps> = ({ user }) => {
  const { user: moderator } = useSession();
  const [violations, setViolations] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'warn' | 'suspend' | 'ban' | null>(null);
  const [reason, setReason] = useState('');
  const [newNote, setNewNote] = useState('');
  const { addToast } = useToast();

  const [isResetScoreModalOpen, setIsResetScoreModalOpen] = useState(false);
  const [isClearHistoryModalOpen, setIsClearHistoryModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<any | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [violationsRes, notesRes, pointsRes] = await Promise.all([
        api.fetchUserViolations(user.id),
        api.fetchModeratorNotes(user.id),
        api.getUserViolationPoints(user.id)
      ]);

      if (violationsRes.error) throw violationsRes.error;
      if (notesRes.error) throw notesRes.error;
      if (pointsRes.error) throw pointsRes.error;

      setViolations(violationsRes.data || []);
      setNotes(notesRes.data || []);
      setPoints(pointsRes.data || 0);
    } catch (error) {
      addToast('Erro ao carregar histórico de moderação.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [user.id, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleActionClick = (action: 'warn' | 'suspend' | 'ban') => {
    setSelectedAction(action);
    setIsActionModalOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedAction || !moderator || !reason.trim()) {
      addToast('O motivo da ação é obrigatório.', 'error');
      return;
    }

    const { error } = await api.addManualViolation({
      targetUserId: user.id,
      action: selectedAction,
      reason: reason,
    });

    if (error) {
      addToast(`Erro ao aplicar ${selectedAction}.`, 'error');
    } else {
      addToast(`Ação de ${selectedAction} aplicada e usuário notificado.`, 'success');
      fetchData();
    }

    setIsActionModalOpen(false);
    setReason('');
    setSelectedAction(null);
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !moderator) return;
    const { error } = await api.addModeratorNote({
      user_id: user.id,
      moderator_id: moderator.id,
      note: newNote,
    });
    if (error) {
      addToast('Erro ao adicionar nota.', 'error');
    } else {
      addToast('Nota adicionada.', 'success');
      setNewNote('');
      fetchData();
    }
  };

  const handleResetScore = async () => {
    const { error } = await api.resetViolationPoints(user.id);
    if (error) {
        addToast('Erro ao zerar pontuação.', 'error');
    } else {
        addToast('Pontuação do usuário zerada.', 'success');
        fetchData();
    }
    setIsResetScoreModalOpen(false);
  };

  const handleClearHistory = async () => {
      const { error } = await api.clearViolationHistory(user.id);
      if (error) {
          addToast('Erro ao limpar histórico.', 'error');
      } else {
          addToast('Histórico de violações limpo.', 'success');
          fetchData();
      }
      setIsClearHistoryModalOpen(false);
  };

  const handleDeleteNote = async () => {
      if (!noteToDelete) return;
      const { error } = await api.deleteModeratorNote(noteToDelete.id);
      if (error) {
          addToast('Erro ao apagar nota.', 'error');
      } else {
          addToast('Nota apagada.', 'success');
          fetchData();
      }
      setNoteToDelete(null);
  };

  if (isLoading) return <div className="flex justify-center items-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
        <h3 className="font-bold mb-2">Ações Rápidas</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => handleActionClick('warn')} className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm">Advertir</button>
          <button onClick={() => handleActionClick('suspend')} className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm">Suspender</button>
          <button onClick={() => handleActionClick('ban')} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Banir</button>
          <button onClick={() => setIsResetScoreModalOpen(true)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">Zerar Pontuação</button>
          <button onClick={() => setIsClearHistoryModalOpen(true)} className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm">Limpar Histórico</button>
        </div>
        <h3 className="font-bold mb-1">Pontos de Violação Ativos</h3>
        <p className="text-2xl font-bold">{points}</p>
      </div>

      <div>
        <h3 className="font-bold mb-2">Histórico Disciplinar</h3>
        <div className="space-y-3">
          {violations.length > 0 ? violations.map(v => (
            <div key={v.id} className="p-3 bg-light-bg dark:bg-dark-bg rounded-lg text-sm">
              <p><strong>Ação:</strong> <span className="font-mono uppercase">{v.action_taken}</span> (+{v.points} pts)</p>
              <p><strong>Motivo:</strong> {v.reason || 'N/A'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Por {v.moderator?.username || 'Sistema'} em {new Date(v.created_at).toLocaleString('pt-BR')}
              </p>
            </div>
          )) : <p className="text-sm text-gray-500">Nenhuma violação encontrada.</p>}
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-2">Notas Internas</h3>
        <div className="space-y-3 mb-4">
          {notes.length > 0 ? notes.map(n => (
            <div key={n.id} className="flex justify-between items-start p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
              <div>
                <p>{n.note}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Por {n.moderator?.username || 'Sistema'} - {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
              <button onClick={() => setNoteToDelete(n)} className="p-1">
                <TrashIcon />
              </button>
            </div>
          )) : <p className="text-sm text-gray-500">Nenhuma nota interna.</p>}
        </div>
        <div className="flex gap-2">
          <input value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Adicionar nova nota..." className="flex-grow p-2 border rounded bg-light-bg dark:bg-dark-bg border-light-border dark:border-dark-border" />
          <button onClick={handleAddNote} className="px-4 py-2 bg-primary text-white rounded hover:bg-gray-600">Salvar</button>
        </div>
      </div>

      <GenericModal isOpen={isActionModalOpen} onClose={() => setIsActionModalOpen(false)} title={`Aplicar ${selectedAction}`}>
        <div className="space-y-4">
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo da ação (obrigatório)..." className="w-full h-24 p-2 border rounded-md bg-light-bg dark:bg-dark-bg border-light-border dark:border-dark-border" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsActionModalOpen(false)} className="px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">Cancelar</button>
            <button onClick={confirmAction} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-gray-600">Confirmar Ação</button>
          </div>
        </div>
      </GenericModal>

      <ConfirmationModal isOpen={isResetScoreModalOpen} onClose={() => setIsResetScoreModalOpen(false)} onConfirm={handleResetScore} title="Zerar Pontuação?" message={`Tem certeza que deseja zerar todos os pontos de violação de @${user.username}? Esta ação não pode ser desfeita.`} confirmText="Sim, zerar" isDestructive />
      <ConfirmationModal isOpen={isClearHistoryModalOpen} onClose={() => setIsClearHistoryModalOpen(false)} onConfirm={handleClearHistory} title="Limpar Histórico?" message={`Tem certeza que deseja apagar todo o histórico de violações de @${user.username}? Esta ação é irreversível.`} confirmText="Sim, limpar" isDestructive />
      <ConfirmationModal isOpen={!!noteToDelete} onClose={() => setNoteToDelete(null)} onConfirm={handleDeleteNote} title="Apagar Nota?" message="Tem certeza que deseja apagar esta nota interna permanentemente?" confirmText="Sim, apagar" isDestructive />
    </div>
  );
};

export default UserModerationPanel;
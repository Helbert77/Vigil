import React, { useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { Community } from '@/types';
import { getRequiredPlanLabel } from '@/src/utils/communityAccess';

const XIcon = () => <Icon className="h-6 w-6"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></Icon>;

interface EditCommunityPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: Community;
  onUpdate: (communityId: string, requiredPlan: 'all' | 'basic+' | 'pro+' | 'premium') => Promise<void>;
}

const EditCommunityPlanModal: React.FC<EditCommunityPlanModalProps> = ({ isOpen, onClose, community, onUpdate }) => {
  const [requiredPlan, setRequiredPlan] = useState<'all' | 'basic+' | 'pro+' | 'premium'>(community.requiredPlan || 'all');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsUpdating(true);
    try {
      await onUpdate(community.id, requiredPlan);
      onClose();
    } catch (error) {
      // Erro já tratado no hook
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center">
          <h2 className="text-xl font-bold">Editar Acesso</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
            <XIcon />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Comunidade: <span className="font-bold text-gray-900 dark:text-white">{community.name}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Status Atual: <span className="font-bold text-gray-900 dark:text-white">{getRequiredPlanLabel(community.requiredPlan)}</span>
            </p>
          </div>
          <div>
            <label htmlFor="required-plan" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quem pode acessar
            </label>
            <select
              id="required-plan"
              value={requiredPlan}
              onChange={(e) => setRequiredPlan(e.target.value as any)}
              className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">Todos (Free, Basic, Pro, Premium)</option>
              <option value="basic+">Basic, Pro e Premium</option>
              <option value="pro+">Pro e Premium</option>
              <option value="premium">Apenas Premium</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              A comunidade será visível para todos, mas apenas usuários com o plano selecionado poderão entrar.
            </p>
          </div>
        </div>
        <div className="p-4 border-t border-light-border dark:border-dark-border flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white font-bold py-2 px-6 rounded-full transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="bg-primary hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-full transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isUpdating ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCommunityPlanModal;


import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import * as api from '@/src/services/api';
import { Icon } from '@/components/icons/Icon';

const AlertTriangleIcon = () => (
  <Icon className="h-5 w-5 text-orange-500">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </Icon>
);

const ClockIcon = () => (
  <Icon className="h-5 w-5 text-blue-500">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </Icon>
);

interface AccountDeletionRequest {
  id: string;
  user_id: string;
  scheduled_deletion_date: string;
  status: string;
  grace_period_days: number;
  created_at: string;
}

const AccountDeletionStatus: React.FC = () => {
  const { addToast } = useToast();
  const [deletionRequest, setDeletionRequest] = useState<AccountDeletionRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    checkDeletionStatus();
  }, []);

  const checkDeletionStatus = async () => {
    setLoading(true);
    try {
      const { data, error } = await api.getAccountDeletionStatus();
      if (error) {
        // Check if it's a table not found error
        if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
          if (error.message.includes('Funcionalidade não disponível') || 
              error.message.includes('Table not found') ||
              (error.message.includes('relation') && error.message.includes('does not exist'))) {
            console.debug('Account deletion feature not available - table not found');
            setDeletionRequest(null);
          } else {
            console.error('Error checking deletion status:', error);
          }
        } else {
            console.error('An unexpected error occurred:', error);
        }
      } else {
        setDeletionRequest(data);
      }
    } catch (error) {
      console.error('Error checking deletion status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDeletion = async () => {
    setCancelling(true);
    try {
      const { error } = await api.cancelAccountDeletion();
      if (error) {
        addToast('Erro ao cancelar exclusão da conta.', 'error');
      } else {
        // Send cancellation confirmation email
        await api.sendDeletionEmail('deletion_cancelled');
        
        addToast('Exclusão da conta cancelada com sucesso!', 'success');
        setDeletionRequest(null);
      }
    } catch (error) {
      addToast('Erro ao cancelar exclusão da conta.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysRemaining = (dateString: string) => {
    const deletionDate = new Date(dateString);
    const now = new Date();
    const diffTime = deletionDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="animate-pulse flex items-center space-x-3">
          <div className="w-5 h-5 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!deletionRequest) {
    return null;
  }

  const daysRemaining = getDaysRemaining(deletionRequest.scheduled_deletion_date);
  const isUrgent = daysRemaining <= 3;

  return (
    <div className={`rounded-lg p-4 border ${
      isUrgent 
        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
        : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
    }`}>
      <div className="flex items-start space-x-3">
        {isUrgent ? <AlertTriangleIcon /> : <ClockIcon />}
        <div className="flex-1">
          <h3 className={`font-medium ${
            isUrgent 
              ? 'text-red-900 dark:text-red-100' 
              : 'text-orange-900 dark:text-orange-100'
          }`}>
            Exclusão de Conta Agendada
          </h3>
          <div className={`mt-1 text-sm ${
            isUrgent 
              ? 'text-red-700 dark:text-red-300' 
              : 'text-orange-700 dark:text-orange-300'
          }`}>
            <p>
              Sua conta está agendada para exclusão em{' '}
              <strong>{formatDate(deletionRequest.scheduled_deletion_date)}</strong>
            </p>
            <p className="mt-1">
              {daysRemaining > 0 ? (
                <>
                  <strong>{daysRemaining} dia{daysRemaining !== 1 ? 's' : ''}</strong> restante{daysRemaining !== 1 ? 's' : ''} para cancelar.
                </>
              ) : (
                <strong>A exclusão será processada em breve.</strong>
              )}
            </p>
          </div>
          
          {daysRemaining > 0 && (
            <div className="mt-4 flex space-x-3">
              <button
                onClick={handleCancelDeletion}
                disabled={cancelling}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium disabled:bg-green-300 disabled:cursor-not-allowed text-sm"
              >
                {cancelling ? 'Cancelando...' : 'Cancelar Exclusão'}
              </button>
              <button
                onClick={() => api.downloadUserData()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-sm"
              >
                Baixar Meus Dados
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountDeletionStatus;
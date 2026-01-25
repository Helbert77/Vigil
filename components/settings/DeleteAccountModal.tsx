import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { useToast } from '@/hooks/useToast';
import * as api from '@/src/services/api';
import { Icon } from '@/components/icons/Icon';
import { useTranslation } from 'react-i18next';

const AlertTriangleIcon = () => (
  <Icon className="h-6 w-6 text-red-500">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </Icon>
);

const CheckIcon = () => (
  <Icon className="h-5 w-5 text-green-500">
    <polyline points="20 6 9 17 4 12"></polyline>
  </Icon>
);

const XIcon = () => (
  <Icon className="h-5 w-5 text-red-500">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </Icon>
);

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  user: User;
  preDeletionChecks: PreDeletionChecks;
}

interface DeletionOption {
  type: 'immediate' | 'scheduled';
  gracePeriodDays?: number;
}

interface PreDeletionChecks {
  hasActiveSubscription: boolean;
  hasPendingOperations: boolean;
  subscriptionPlan?: string;
  pendingOperationsCount?: number;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  user,
  preDeletionChecks
}) => {
  const { t } = useTranslation(['settings', 'common']);
  const { addToast } = useToast();
  const [step, setStep] = useState<'checks' | 'options' | 'password' | 'confirmation'>('checks');
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checks, setChecks] = useState<PreDeletionChecks>(preDeletionChecks);
  const [deletionOption, setDeletionOption] = useState<DeletionOption>({ type: 'scheduled', gracePeriodDays: 7 });
  const [downloadingData, setDownloadingData] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setStep('checks');
      setPassword('');
      setConfirmText('');
      setDeletionOption({ type: 'scheduled', gracePeriodDays: 7 });
      setDownloadingData(false);
    }
  }, [isOpen]);

  const handlePasswordSubmit = async () => {
    if (!password) {
      addToast('Por favor, digite sua senha atual.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await api.verifyCurrentPassword(password);
      if (error) {
        addToast('Senha incorreta.', 'error');
        return;
      }
      
      setStep('confirmation');
    } catch (error: any) {
      addToast('Erro ao verificar senha.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadData = async () => {
    setDownloadingData(true);
    try {
      const { error } = await api.downloadUserData();
      if (error) {
        addToast('Erro ao baixar dados.', 'error');
      } else {
        addToast('Download iniciado! Verifique sua pasta de downloads.', 'success');
      }
    } catch (error) {
      addToast('Erro ao baixar dados.', 'error');
    } finally {
      setDownloadingData(false);
    }
  };

  const handleFinalConfirmation = async () => {
    if (confirmText !== 'EXCLUIR MINHA CONTA') {
      addToast('Digite exatamente "EXCLUIR MINHA CONTA" para confirmar.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      if (deletionOption.type === 'scheduled') {
        const { error } = await api.scheduleAccountDeletion(deletionOption.gracePeriodDays);
        if (error) {
          addToast('Erro ao agendar exclusão da conta.', 'error');
          return;
        }
        
        // Send confirmation email
        const scheduledDate = new Date();
        scheduledDate.setDate(scheduledDate.getDate() + deletionOption.gracePeriodDays!);
        
        await api.sendDeletionEmail(
          'deletion_scheduled',
          scheduledDate.toISOString(),
          deletionOption.gracePeriodDays
        );
        
        addToast(`Exclusão agendada para ${deletionOption.gracePeriodDays} dias. Você receberá um email de confirmação.`, 'success');
      } else {
        await onConfirm();
      }
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = !checks.hasActiveSubscription && !checks.hasPendingOperations;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-card rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 flex items-center justify-center">
              <AlertTriangleIcon />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Excluir Conta
            </h2>
          </div>

          {step === 'checks' && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Verificando o status da sua conta antes da exclusão...
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">
                    {checks.hasActiveSubscription ? <XIcon /> : <CheckIcon />}
                  </div>
                  <span className={`flex-1 ${checks.hasActiveSubscription ? 'text-red-600' : 'text-green-600'}`}>
                    {checks.hasActiveSubscription 
                      ? `Assinatura ativa (${checks.subscriptionPlan})` 
                      : 'Nenhuma assinatura ativa'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">
                    {checks.hasPendingOperations ? <XIcon /> : <CheckIcon />}
                  </div>
                  <span className={`flex-1 ${checks.hasPendingOperations ? 'text-red-600' : 'text-green-600'}`}>
                    {checks.hasPendingOperations 
                      ? `${checks.pendingOperationsCount} operações pendentes` 
                      : 'Nenhuma operação pendente'}
                  </span>
                </div>
              </div>

              {checks.hasActiveSubscription && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    <strong>Atenção:</strong> Você possui uma assinatura ativa ({checks.subscriptionPlan}). 
                    Cancele sua assinatura antes de excluir a conta para evitar cobranças futuras.
                  </p>
                </div>
              )}

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                <p className="text-red-800 dark:text-red-200 text-sm">
                  <strong>Esta ação é irreversível!</strong> Todos os seus dados serão permanentemente excluídos:
                </p>
                <ul className="mt-2 text-red-700 dark:text-red-300 text-sm list-disc list-inside">
                  <li>Posts e comentários</li>
                  <li>Mensagens e conversas</li>
                  <li>Configurações e preferências</li>
                  <li>Histórico de atividades</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => canProceed ? setStep('options') : null}
                  disabled={!canProceed}
                  className={`px-4 py-2 rounded-md font-medium ${
                    canProceed
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {canProceed ? t('messages.continue') : t('messages.resolveIssues')}
                </button>
              </div>
            </div>
          )}

          {step === 'options' && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Escolha como deseja proceder com a exclusão da sua conta:
              </p>

              <div className="space-y-4">
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="deletionOption"
                      checked={deletionOption.type === 'scheduled'}
                      onChange={() => setDeletionOption({ type: 'scheduled', gracePeriodDays: 7 })}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Exclusão Agendada (Recomendado)
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Sua conta será marcada para exclusão e você terá um período de carência para cancelar.
                      </div>
                      {deletionOption.type === 'scheduled' && (
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Período de carência:
                          </label>
                          <select
                            value={deletionOption.gracePeriodDays}
                            onChange={(e) => setDeletionOption({ type: 'scheduled', gracePeriodDays: parseInt(e.target.value) })}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg text-gray-900 dark:text-white text-sm"
                          >
                            <option value={7}>7 dias</option>
                            <option value={14}>14 dias</option>
                            <option value={30}>30 dias</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="deletionOption"
                      checked={deletionOption.type === 'immediate'}
                      onChange={() => setDeletionOption({ type: 'immediate' })}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Exclusão Imediata
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Sua conta será excluída imediatamente após a confirmação. Esta ação é irreversível.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">
                      Baixar seus dados
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Recomendamos baixar uma cópia dos seus dados antes da exclusão.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadData}
                    disabled={downloadingData}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:bg-blue-300 disabled:cursor-not-allowed text-sm"
                  >
                    {downloadingData ? 'Baixando...' : 'Baixar Dados'}
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setStep('checks')}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                >
                  Voltar
                </button>
                <button
                  onClick={() => setStep('password')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium"
                >
                  {t('messages.continue')}
                </button>
              </div>
            </div>
          )}

          {step === 'password' && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Para sua segurança, confirme sua senha atual:
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Senha Atual
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg text-gray-900 dark:text-white"
                  placeholder={t('messages.enterCurrentPassword')}
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setStep('checks')}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                >
                  Voltar
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  disabled={isLoading || !password}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Verificando...' : 'Verificar Senha'}
                </button>
              </div>
            </div>
          )}

          {step === 'confirmation' && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Como confirmação final, digite exatamente o texto abaixo:
              </p>

              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                <code className="text-red-600 dark:text-red-400 font-mono">
                  EXCLUIR MINHA CONTA
                </code>
              </div>

              <div>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg text-gray-900 dark:text-white"
                  placeholder={t('messages.typeDeleteAccount')}
                  onKeyPress={(e) => e.key === 'Enter' && handleFinalConfirmation()}
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setStep('password')}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                >
                  Voltar
                </button>
                <button
                  onClick={handleFinalConfirmation}
                  disabled={isLoading || confirmText !== 'EXCLUIR MINHA CONTA'}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Excluindo...' : 'Excluir Conta'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
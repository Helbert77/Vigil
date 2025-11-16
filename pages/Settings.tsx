import React, { useState, useEffect } from 'react';
import Card from '@/components/common/Card';
import { useTheme } from '@/hooks/useTheme';
import { User } from '@/types';
import { useToast } from '@/hooks/useToast';
import SettingsToggle from '@/components/settings/SettingsToggle';
import MutedWordsInput from '@/components/settings/MutedWordsInput';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import BlockedUsersList from '@/components/settings/BlockedUsersList';
import GenericModal from '@/src/components/common/GenericModal';
import * as api from '@/src/services/api';
import { useSession } from '@/contexts/SessionContext';
import { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from '@supabase/supabase-js';
import AccountStatus from '@/components/settings/AccountStatus';
import { Icon } from '@/components/icons/Icon';
import DeleteAccountModal from '@/components/settings/DeleteAccountModal';
import AccountDeletionStatus from '@/components/settings/AccountDeletionStatus';

const LogOutIcon = () => <Icon className="h-5 w-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></Icon>;

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700 dark:text-gray-300">Tema</span>
      <button
        onClick={toggleTheme}
        className={`relative inline-flex flex-shrink-0 items-center h-6 rounded-full w-11 transition-colors ${
          theme === 'dark' ? 'bg-secondary' : 'bg-gray-300 dark:bg-gray-600'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary dark:focus:ring-offset-dark-card`}
        role="switch"
        aria-checked={theme === 'dark'}
      >
        <span
          className={`${
            theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
          } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
        />
      </button>
    </div>
  );
};

interface SettingsProps {
    user: User;
    onUpdateUser: () => Promise<void>;
    blockedUsers: User[];
    onBlockToggle: (userId: string) => void;
    onLogout: () => void;
    onSupportButtonToggle: (show: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser, blockedUsers, onBlockToggle, onLogout, onSupportButtonToggle }) => {
  const { session } = useSession();
  const { addToast } = useToast();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCheckingForDeletion, setIsCheckingForDeletion] = useState(false);
  const [preDeletionChecks, setPreDeletionChecks] = useState<any>(null);
  const [isBlockedListModalOpen, setIsBlockedListModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showSupportButton, setShowSupportButton] = useState(true);

  // Carregar preferência do botão de suporte
  useEffect(() => {
    const loadSupportButtonPreference = async () => {
      const shouldShow = await api.fetchShowSupportButton(user.id);
      setShowSupportButton(shouldShow);
    };
    loadSupportButtonPreference();
  }, [user.id]);

  const handleOpenDeleteModal = async () => {
    setIsCheckingForDeletion(true);
    try {
      const { data: subscription } = await api.getUserSubscription(user.id);
      const hasActiveSubscription = subscription && subscription.plan !== 'free';

      const { count: pendingOperationsCount } = await api.getPendingOperationsSafe(user.id);

      const checks = {
        hasActiveSubscription,
        hasPendingOperations: pendingOperationsCount > 0,
        subscriptionPlan: subscription?.plan,
        pendingOperationsCount
      };

      setPreDeletionChecks(checks);
      setIsDeleteModalOpen(true);
    } catch (error) {
      console.error('Error performing pre-deletion checks:', error);
      addToast('Erro ao verificar status da conta.', 'error');
    } finally {
      setIsCheckingForDeletion(false);
    }
  };

  const handleNotificationToggle = async (key: keyof NonNullable<User['notifications']>) => {
    const currentNotifications = user.notifications || { likes: true, comments: true, newFollowers: false, messages: true };
    const newNotifications = { ...currentNotifications, [key]: !currentNotifications[key] };
    
    try {
      const { error } = await api.updateUser(user.id, { notifications_settings: newNotifications });
      if (error) throw error;
      await onUpdateUser();
    } catch (error) {
      console.error('Error updating notification settings:', error);
      addToast('Falha ao salvar a configuração.', 'error');
    }
  };

  const handleSupportButtonToggle = async () => {
    const newValue = !showSupportButton;
    
    try {
      const { success } = await api.updateShowSupportButton(user.id, newValue);
      if (success) {
        setShowSupportButton(newValue);
        onSupportButtonToggle(newValue); // Atualizar estado no App
      } else {
        throw new Error('Falha ao atualizar preferência');
      }
    } catch (error) {
      console.error('Error updating support button preference:', error);
      addToast('Falha ao salvar a configuração.', 'error');
    }
  };

  const handleAddMutedWord = async (word: string) => {
    const currentWords = user.mutedWords || [];
    if (!currentWords.includes(word)) {
      const newMutedWords = [...currentWords, word];
      try {
        const { error } = await api.updateUser(user.id, { muted_words: newMutedWords });
        if (error) throw error;
        await onUpdateUser();
        // Toast removido - palavra aparece na lista
      } catch (error) {
        addToast('Falha ao adicionar palavra.', 'error');
      }
    }
  };

  const handleRemoveMutedWord = async (word: string) => {
    const newMutedWords = (user.mutedWords || []).filter((w: string) => w !== word);
    try {
        const { error } = await api.updateUser(user.id, { muted_words: newMutedWords });
        if (error) throw error;
        await onUpdateUser();
        // Toast removido - palavra desaparece da lista
    } catch (error) {
        addToast('Falha ao remover palavra.', 'error');
    }
  };
  
  const handleSensitiveContentToggle = async () => {
    const newValue = !user.showSensitiveContent;
    try {
        const { error } = await api.updateUser(user.id, { show_sensitive_content: newValue });
        if (error) throw error;
        await onUpdateUser();
    } catch (error) {
        addToast('Falha ao salvar configuração.', 'error');
    }
  };

  const handleActivityStatusToggle = async () => {
    const newValue = !user.showActivityStatus;
    try {
        const { error } = await api.updateUser(user.id, { show_activity_status: newValue });
        if (error) throw error;
        await onUpdateUser();
    } catch (error) {
        addToast('Falha ao salvar configuração.', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { error } = await api.deleteUserAccount();
      if (error) throw error;
      addToast('Sua conta foi excluída permanentemente.', 'success');
      await api.logout();
    } catch (error: any) {
      let errorMessage = 'Ocorreu um erro ao excluir sua conta.';
      if (error instanceof FunctionsHttpError) {
        try {
          const { error: functionError } = await error.context.json();
          errorMessage = `Erro do servidor: ${functionError || error.message}`;
        } catch {
          errorMessage = `Erro do servidor: ${error.message}`;
        }
      } else if (error instanceof FunctionsRelayError) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else if (error instanceof FunctionsFetchError) {
        errorMessage = 'Não foi possível conectar ao servidor para excluir a conta.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      addToast(errorMessage, 'error');
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      addToast('A senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('As senhas não coincidem.', 'error');
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const { error } = await api.updateUserPassword(newPassword);
      if (error) throw error;
      addToast('Senha atualizada com sucesso!', 'success');
      setIsPasswordModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      addToast(`Erro ao atualizar a senha: ${error.message}`, 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
        </div>
        <div className="space-y-8">
          <Card>
            <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">Aparência</h2>
            <div className="divide-y divide-light-border dark:divide-dark-border">
              <div className="pb-4">
                <ThemeToggle />
              </div>
              <SettingsToggle
                label="Botão de suporte"
                description="Mostrar o botão flutuante de suporte na tela."
                isEnabled={showSupportButton}
                onToggle={handleSupportButtonToggle}
              />
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">Notificações</h2>
            <div className="divide-y divide-light-border dark:divide-dark-border">
              <SettingsToggle
                label="Curtidas"
                description="Notificar quando alguém curtir seu post."
                isEnabled={user.notifications?.likes ?? true}
                onToggle={() => handleNotificationToggle('likes')}
              />
              <SettingsToggle
                label="Comentários e Posts"
                description="Notificar quando alguém responder ou mencionar você."
                isEnabled={user.notifications?.comments ?? true}
                onToggle={() => handleNotificationToggle('comments')}
              />
              <SettingsToggle
                label="Novos seguidores"
                description="Notificar quando alguém começar a seguir você."
                isEnabled={user.notifications?.newFollowers ?? false}
                onToggle={() => handleNotificationToggle('newFollowers')}
              />
              <SettingsToggle
                label="Mensagens Diretas"
                description="Notificar quando você receber uma nova mensagem."
                isEnabled={user.notifications?.messages ?? true}
                onToggle={() => handleNotificationToggle('messages')}
              />
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Privacidade e Conteúdo</h2>
            <div className="divide-y divide-light-border dark:divide-dark-border">
              <SettingsToggle
                label="Mostrar Conteúdo Sensível"
                description="Exibir mídias que possam conter conteúdo gráfico ou perturbador sem aviso prévio."
                isEnabled={user.showSensitiveContent ?? false}
                onToggle={handleSensitiveContentToggle}
              />
              <SettingsToggle
                label="Status de Atividade"
                description="Permitir que outros usuários vejam quando você está online ou esteve ativo recentemente."
                isEnabled={user.showActivityStatus ?? true}
                onToggle={handleActivityStatusToggle}
              />
              <div className="py-4">
                <MutedWordsInput
                  mutedWords={user.mutedWords || []}
                  onAddWord={handleAddMutedWord}
                  onRemoveWord={handleRemoveMutedWord}
                />
              </div>
              <div className="py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-gray-800 dark:text-gray-200">Contas Bloqueadas</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie as contas que você bloqueou.</p>
                    </div>
                    <button onClick={() => setIsBlockedListModalOpen(true)} className="text-sm font-semibold text-primary hover:underline">
                        Ver Lista ({blockedUsers.length})
                    </button>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Conta</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700 dark:text-gray-300">Email</span>
                <span className="text-gray-500 dark:text-gray-400">{session?.user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700 dark:text-gray-300">Senha</span>
                <button onClick={() => setIsPasswordModalOpen(true)} className="text-sm font-semibold text-primary hover:underline">
                  Alterar Senha
                </button>
              </div>
              
              {/* Linha divisória e botão Sair */}
              <div className="pt-3 border-t border-light-border dark:border-dark-border">
                <button
                    onClick={onLogout}
                    className="w-full sm:w-auto flex items-center justify-start gap-3 text-red-500 hover:text-red-600 active:text-red-700 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 font-bold py-2 px-3 rounded-md transition-colors duration-200"
                    aria-label="Sair da conta"
                    >
                    <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">
                      <LogOutIcon />
                    </div>
                    <span className="flex items-center">Sair</span>
                </button>
              </div>
              
              <div className="pt-4 border-t border-light-border dark:border-dark-border">
                <AccountStatus user={user} />
              </div>
              <div className="pt-4 border-t border-light-border dark:border-dark-border space-y-4">
                <AccountDeletionStatus />
                <button
                    onClick={handleOpenDeleteModal}
                    disabled={isCheckingForDeletion}
                    className="w-full sm:w-auto border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    {isCheckingForDeletion ? 'Verificando...' : 'Excluir Conta'}
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
      {preDeletionChecks && (
        <DeleteAccountModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteAccount}
          user={user}
          preDeletionChecks={preDeletionChecks}
        />
      )}
      <GenericModal
        isOpen={isBlockedListModalOpen}
        onClose={() => setIsBlockedListModalOpen(false)}
        title="Contas Bloqueadas"
      >
        <BlockedUsersList blockedUsers={blockedUsers} onUnblock={onBlockToggle} />
      </GenericModal>
      <GenericModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Alterar Senha"
      >
        <div className="space-y-3 md:space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nova Senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-3 md:py-2 border border-light-border dark:border-dark-border rounded-md shadow-sm bg-light-bg dark:bg-dark-bg text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmar Nova Senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-3 md:py-2 border border-light-border dark:border-dark-border rounded-md shadow-sm bg-light-bg dark:bg-dark-bg text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handlePasswordChange}
              disabled={isUpdatingPassword}
              className="bg-primary hover:bg-gray-600 text-white font-bold py-3 md:py-2 px-4 rounded-full transition-colors disabled:bg-gray-400 text-base"
            >
              {isUpdatingPassword ? 'Salvando...' : 'Salvar Nova Senha'}
            </button>
          </div>
        </div>
      </GenericModal>
    </>
  );
};

export default Settings;
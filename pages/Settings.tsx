import React, { useState } from 'react';
import Card from '@/components/common/Card';
import { useTheme } from '@/hooks/useTheme';
import { User } from '@/types';
import { useToast } from '@/hooks/useToast';
import SettingsToggle from '@/components/settings/SettingsToggle';
import MutedWordsInput from '@/components/settings/MutedWordsInput';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700 dark:text-gray-300">Theme</span>
      <button
        onClick={toggleTheme}
        className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
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
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
  const { addToast } = useToast();

  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    newFollowers: false,
  });

  const [mutedWords, setMutedWords] = useState<string[]>(['mainstream media', 'official story']);

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddMutedWord = (word: string) => {
    setMutedWords(prev => [...prev, word]);
    addToast(`'${word}' foi silenciada.`, 'success');
  };

  const handleRemoveMutedWord = (word: string) => {
    setMutedWords(prev => prev.filter(w => w !== word));
    addToast(`'${word}' não está mais silenciada.`, 'info');
  };

  const handleSaveChanges = () => {
    // Em um aplicativo real, isso salvaria as configurações no backend.
    console.log('Saving settings:', { notifications, mutedWords });
    addToast('Alterações salvas com sucesso!', 'success');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <button 
            onClick={handleSaveChanges}
            className="bg-secondary hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-colors duration-200">
            Salvar Alterações
        </button>
      </div>
      <div className="space-y-8">
        <Card>
          <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">Aparência</h2>
          <ThemeToggle />
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">Notificações</h2>
          <div className="divide-y divide-light-border dark:divide-dark-border">
            <SettingsToggle 
              label="Curtidas"
              description="Notificar quando alguém curtir seu post."
              isEnabled={notifications.likes}
              onToggle={() => handleNotificationToggle('likes')}
            />
            <SettingsToggle 
              label="Comentários e menções"
              description="Notificar quando alguém responder ou mencionar você."
              isEnabled={notifications.comments}
              onToggle={() => handleNotificationToggle('comments')}
            />
            <SettingsToggle 
              label="Novos seguidores"
              description="Notificar quando alguém começar a seguir você."
              isEnabled={notifications.newFollowers}
              onToggle={() => handleNotificationToggle('newFollowers')}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Privacidade e Conteúdo</h2>
          <MutedWordsInput 
            mutedWords={mutedWords}
            onAddWord={handleAddMutedWord}
            onRemoveWord={handleRemoveMutedWord}
          />
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Conta</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Username</label>
              <input 
                type="text" 
                value={user.username} 
                disabled 
                className="mt-1 block w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md shadow-sm py-2 px-3 focus:outline-none cursor-not-allowed"
              />
            </div>
            <div className="pt-2 flex flex-wrap gap-4">
                <button 
                  onClick={() => addToast('Sessão encerrada! (simulado)', 'info')}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200">
                  Sair
                </button>
                <button
                    onClick={() => {
                        localStorage.clear();
                        addToast('Dados locais foram limpos. A página será recarregada.', 'info');
                        setTimeout(() => window.location.reload(), 1500);
                    }}
                    className="w-full sm:w-auto border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
                    >
                    Limpar Dados Locais
                </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
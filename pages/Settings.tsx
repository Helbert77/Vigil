import React from 'react';
import Card from '../components/common/Card';
import { useTheme } from '../hooks/useTheme';
import { User } from '../types';
import { useToast } from '../hooks/useToast';

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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Settings</h1>
      <div className="space-y-6">
        <Card>
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Appearance</h2>
          <div className="space-y-4">
            <ThemeToggle />
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Account</h2>
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
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
              <input 
                type="email" 
                value="alex.cipher@vigil.net" 
                disabled 
                className="mt-1 block w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md shadow-sm py-2 px-3 focus:outline-none cursor-not-allowed"
              />
            </div>
            <div className="pt-2">
                <button 
                  onClick={() => addToast('Logged out successfully! (mocked)', 'info')}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200">
                  Log Out
                </button>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Application Data</h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">This will clear all local data, including your theme preference.</p>
            <div className="pt-2">
                <button
                    onClick={() => {
                        localStorage.clear();
                        addToast('Local data has been cleared. The page will now reload.', 'info');
                        setTimeout(() => window.location.reload(), 1500);
                    }}
                    className="w-full sm:w-auto border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
                    >
                    Clear Local Data
                </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
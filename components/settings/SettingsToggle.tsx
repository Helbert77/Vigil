import React from 'react';

interface SettingsToggleProps {
  label: string;
  description: string;
  isEnabled: boolean;
  onToggle: () => void;
}

const SettingsToggle: React.FC<SettingsToggleProps> = ({ label, description, isEnabled, onToggle }) => {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="font-medium text-gray-800 dark:text-gray-200">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isEnabled ? 'bg-secondary' : 'bg-gray-300 dark:bg-gray-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary dark:focus:ring-offset-dark-card`}
        role="switch"
        aria-checked={isEnabled}
      >
        <span
          className={`${
            isEnabled ? 'translate-x-6' : 'translate-x-1'
          } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
        />
      </button>
    </div>
  );
};

export default SettingsToggle;
import React, { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import Avatar from '../common/Avatar';
import { Icon } from '../icons/Icon';
import { User } from '../../types';

const LogoIcon = () => (
    <svg 
        className="h-8 w-8 text-primary" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        {/* Outer Triangle */}
        <path d="M12 2 L1 21 H23 Z" />
        {/* Inner Eye Circle */}
        <circle cx="12" cy="14" r="5" />
        {/* Pupil */}
        <circle cx="12" cy="14" r="1.5" fill="currentColor"/>
        {/* Radiating lines from the eye */}
        <path d="M12 9 V 4" />
        <path d="M12 19 V 20.5" />
        <path d="M15.53 17.53 L 18 20" />
        <path d="M8.47 17.53 L 6 20" />
        <path d="M15.53 10.47 L 18 8" />
        <path d="M8.47 10.47 L 6 8" />
    </svg>
);

const SunIcon = () => <Icon><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></Icon>;
const MoonIcon = () => <Icon><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></Icon>;
const SearchIcon = () => <Icon><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></Icon>;

interface HeaderProps {
    onNavigateProfile: () => void;
    user: User;
    onSearch: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigateProfile, user, onSearch }) => {
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-sm border-b border-light-border dark:border-dark-border z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center space-x-4">
          <LogoIcon />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Vigil</h1>
        </div>
        
        <div className="flex-1 max-w-md hidden sm:block">
           <form onSubmit={handleSearchSubmit} className="relative">
              <input 
                type="text" 
                placeholder="Search Vigil..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
           </form>
        </div>

        <div className="flex items-center space-x-4">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Toggle theme">
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
          <div className="cursor-pointer" onClick={onNavigateProfile}>
            <Avatar src={user.avatarUrl} alt={user.name} size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
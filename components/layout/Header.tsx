import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme';
import Avatar from '../common/Avatar';
import { Icon } from '../icons/Icon';
import { LogoIcon } from '../icons/LogoIcon';
import { User, Community, TrendingTopic } from '@/types';
import SearchPopup from '../search/SearchPopup';

const SunIcon = () => <Icon><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></Icon>;
const MoonIcon = () => <Icon><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></Icon>;
const SearchIcon = () => <Icon className="h-5 w-5"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></Icon>;
const MoreHorizontalIcon = () => <Icon><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></Icon>;
const MenuIcon = () => <Icon className="h-6 w-6"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></Icon>;
const XIcon = () => <Icon className="h-6 w-6"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></Icon>;
const LogOutIcon = () => <Icon className="h-5 w-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></Icon>;

interface HeaderProps {
    onNavigateProfile: () => void;
    user: User;
    onSearch: (query: string) => void;
    onNavigateHome: () => void;
    onNavigateToAdvancedSearch: (query: string) => void;
    query: string;
    allUsers: User[];
    communities: Community[];
    trendingTopics: TrendingTopic[];
    onNavigateToUser: (userId: string) => void;
    onNavigateToCommunity: (communityId: string) => void;
    onNavigateToTopic: (tag: string) => void;
    onToggleMobileSidebar?: () => void;
    isMobileSidebarOpen?: boolean;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    onNavigateProfile, user, onSearch, onNavigateHome, onNavigateToAdvancedSearch, query,
    allUsers, communities, trendingTopics, onNavigateToUser, onNavigateToCommunity, onNavigateToTopic,
    onToggleMobileSidebar, isMobileSidebarOpen = false, onLogout
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isAdvancedSearchMenuOpen, setIsAdvancedSearchMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const advancedMenuRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    onSearch(newQuery);
    setIsPopupOpen(!!newQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onNavigateToAdvancedSearch(query);
      setIsPopupOpen(false);
      setIsMobileSearchOpen(false);
    }
  };

  useEffect(() => {
    if (!query) {
        setIsPopupOpen(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsPopupOpen(false);
      }
      if (advancedMenuRef.current && !advancedMenuRef.current.contains(event.target as Node)) {
        setIsAdvancedSearchMenuOpen(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setIsMobileSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdvancedSearchClick = () => {
    onNavigateToAdvancedSearch(query);
    setIsPopupOpen(false);
    setIsAdvancedSearchMenuOpen(false);
    setIsMobileSearchOpen(false);
  };

  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
    if (!isMobileSearchOpen && query) {
      setIsPopupOpen(true);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-light-card/95 dark:bg-dark-card/95 backdrop-blur-md border-b border-light-border dark:border-dark-border z-50">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 flex items-center justify-between h-14 sm:h-16">
          {/* Mobile Menu Button & Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {onToggleMobileSidebar && (
              <button 
                onClick={onToggleMobileSidebar}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={isMobileSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
              >
                {isMobileSidebarOpen ? <XIcon /> : <MenuIcon />}
              </button>
            )}
            <div 
              className="flex items-center cursor-pointer"
              onClick={onNavigateHome}
            >
              <LogoIcon className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12" />
            </div>
          </div>
          
          {/* Desktop Search */}
          <div className="hidden md:block w-full max-w-md lg:max-w-lg xl:max-w-xl px-4" ref={searchContainerRef}>
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="Buscar no Vigil..." 
                  value={query}
                  onChange={handleSearchChange}
                  onFocus={() => setIsPopupOpen(!!query)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-full py-2.5 pl-10 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon />
                </div>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="relative" ref={advancedMenuRef}>
                    <button 
                      onClick={() => setIsAdvancedSearchMenuOpen(prev => !prev)}
                      className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Opções de busca"
                    >
                      <MoreHorizontalIcon />
                    </button>
                    {isAdvancedSearchMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 w-56 md:w-48 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-lg z-30">
                        <button 
                          onClick={handleAdvancedSearchClick}
                          className="w-full text-left flex items-center space-x-3 px-4 py-3 md:py-3 text-sm md:text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
                        >
                          <SearchIcon />
                          <span>Busca avançada</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {isPopupOpen && (
                  <SearchPopup
                    query={query}
                    users={allUsers}
                    communities={communities}
                    topics={trendingTopics}
                    onNavigateToUser={onNavigateToUser}
                    onNavigateToCommunity={onNavigateToCommunity}
                    onNavigateToTopic={onNavigateToTopic}
                    onGoToAdvancedSearch={handleAdvancedSearchClick}
                  />
                )}
             </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile Search Button */}
            <button 
              onClick={handleMobileSearchToggle}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Buscar"
            >
              <SearchIcon />
            </button>
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary" 
              aria-label="Alternar tema"
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
            
            {/* User Avatar */}
            <div className="cursor-pointer" onClick={onNavigateProfile}>
              <Avatar 
                src={user.avatarUrl} 
                alt={user.name} 
                size="sm" 
                userId={user.id} 
                showStatus={true} 
                className="sm:w-8 sm:h-8 lg:w-10 lg:h-10"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileSearchOpen(false)}>
          <div 
            className="absolute top-14 left-0 right-0 bg-light-card dark:bg-dark-card border-b border-light-border dark:border-dark-border p-4"
            onClick={(e) => e.stopPropagation()}
            ref={mobileSearchRef}
          >
            <div className="relative">
              <input 
                type="text" 
                placeholder="Buscar no Vigil..." 
                value={query}
                onChange={handleSearchChange}
                onFocus={() => setIsPopupOpen(!!query)}
                onKeyDown={handleKeyDown}
                className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-full py-3 pl-12 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                autoFocus
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <button 
                onClick={() => setIsMobileSearchOpen(false)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                <XIcon />
              </button>
              {isPopupOpen && (
                <div className="mt-2">
                  <SearchPopup
                    query={query}
                    users={allUsers}
                    communities={communities}
                    topics={trendingTopics}
                    onNavigateToUser={onNavigateToUser}
                    onNavigateToCommunity={onNavigateToCommunity}
                    onNavigateToTopic={onNavigateToTopic}
                    onGoToAdvancedSearch={handleAdvancedSearchClick}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
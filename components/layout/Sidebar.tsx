import React, { useEffect } from 'react';
import { Icon } from '@/components/icons/Icon';
import NavLink from './NavLink';
import { PostIcon } from '@/src/components/icons/PostIcon';
import Tooltip from '@/components/common/Tooltip';
import { User } from '@/types';
import { DiamondIcon } from '@/src/components/icons/DiamondIcon'; // Caminho corrigido
import { canAccessLibrary, getLibraryAccessDeniedMessage } from '@/src/utils/libraryAccess';
import { useToast } from '@/hooks/useToast';

const HomeIcon = () => <Icon><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></Icon>;
const UserIcon = () => <Icon><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></Icon>;
const BellIcon = () => <Icon><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></Icon>;
const MailIcon = () => <Icon><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></Icon>;
const BookmarkIcon = () => <Icon><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></Icon>;
const UsersIcon = () => <Icon><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></Icon>;
const SettingsIcon = () => <Icon><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0 .33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></Icon>;

const TimelineIcon = () => <Icon><path d="M3 3v18h18"></path><path d="M7 12h10"></path><path d="M7 8h7"></path><path d="M7 16h4"></path></Icon>;
const LibraryIcon = () => <Icon><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></Icon>;
const ShieldIcon = () => <Icon><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></Icon>;
const DashboardIcon = () => <Icon><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></Icon>;
const GavelIcon = () => <Icon><path d="m14 13-7.5 7.5"/><path d="m18 17-5.5 5.5"/><path d="m15 6-3.5 3.5"/><path d="m2 21 6-6"/><path d="m3 3 7.5 7.5"/><path d="m13 1 6 6"/><path d="M12 6 9 3 3 9l3 3"/><path d="M18 12 21 9l-6-6-3 3"/></Icon>;

interface SidebarProps {
  user: User | null;
  currentPage: string;
  setCurrentPage: (page: any) => void;
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
  isCollapsed: boolean;
  pendingModerationCount: number;
  pendingAppealsCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ user, currentPage, setCurrentPage, unreadNotificationsCount, unreadMessagesCount, isCollapsed, pendingModerationCount, pendingAppealsCount }) => {
  const isModerator = user?.role === 'admin' || user?.role === 'moderator';
  const { addToast } = useToast();

  const handlePostClick = () => {
    if (currentPage !== 'Home') {
      setCurrentPage('Home');
      setTimeout(() => {
        document.getElementById('create-post-textarea')?.focus();
      }, 0);
    } else {
      document.getElementById('create-post-textarea')?.focus();
    }
  };

  const handleLibraryClick = () => {
    if (!user) return;

    // Verificar se o usuário tem acesso à biblioteca
    if (!canAccessLibrary(user.plan, user.role)) {
      // Mostrar mensagem de erro
      addToast(getLibraryAccessDeniedMessage(), 'error');
      // Redirecionar para a página Premium
      setCurrentPage('Premium');
      return;
    }

    // Se tem acesso, navegar normalmente
    setCurrentPage('Library');
  };

  useEffect(() => {
    // Component mounted
  }, []);

  return (
    <div className={`flex flex-col h-full w-full ${isCollapsed ? 'items-center' : ''} 
      ${/* Mobile styles */ ''}
      md:sticky md:top-20 md:h-[calc(100vh-6rem)]
      ${/* Mobile full height */ ''}
      h-[calc(100vh-4rem)] overflow-hidden
    `}>
      {/* Mobile header with user info */}
      <div className="md:hidden p-4 border-b border-light-border dark:border-dark-border">
        {user && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                @{user.username}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto sidebar-scrollable p-2 md:p-0">
        <nav className={`space-y-1 ${isCollapsed ? 'px-1' : 'px-2 md:px-0'}`}>
          <NavLink 
            icon={<HomeIcon />} 
            label="Home" 
            isActive={currentPage === 'Home'} 
            onClick={() => setCurrentPage('Home')} 
            isCollapsed={isCollapsed} 
          />
          <NavLink 
            icon={<BellIcon />} 
            label="Notifications" 
            isActive={currentPage === 'Notifications'} 
            onClick={() => setCurrentPage('Notifications')} 
            notificationCount={unreadNotificationsCount} 
            isCollapsed={isCollapsed} 
          />
          <NavLink 
            icon={<MailIcon />} 
            label="Messages" 
            isActive={currentPage === 'Messages'} 
            onClick={() => setCurrentPage('Messages')} 
            notificationCount={unreadMessagesCount} 
            isCollapsed={isCollapsed} 
          />
          <NavLink 
            icon={<BookmarkIcon />} 
            label="Saved" 
            isActive={currentPage === 'Saved'} 
            onClick={() => setCurrentPage('Saved')} 
            isCollapsed={isCollapsed} 
          />
          <NavLink 
            icon={<UsersIcon />} 
            label="Communities" 
            isActive={currentPage === 'Communities'} 
            onClick={() => setCurrentPage('Communities')} 
            isCollapsed={isCollapsed} 
          />
          <NavLink 
            icon={<LibraryIcon />} 
            label="Biblioteca" 
            isActive={currentPage === 'Library'} 
            onClick={handleLibraryClick} 
            isCollapsed={isCollapsed} 
          />
          <NavLink 
            icon={<TimelineIcon />} 
            label="Timeline" 
            isActive={currentPage === 'Timeline'} 
            onClick={() => setCurrentPage('Timeline')} 
            isCollapsed={isCollapsed} 
          />
          <NavLink 
            icon={<UserIcon />} 
            label="Profile" 
            isActive={currentPage === 'Profile'} 
            onClick={() => setCurrentPage('Profile')} 
            isCollapsed={isCollapsed} 
          />
          <NavLink 
            icon={<SettingsIcon />} 
            label="Settings" 
            isActive={currentPage === 'Settings'} 
            onClick={() => setCurrentPage('Settings')} 
            isCollapsed={isCollapsed} 
          />
          <NavLink 
            icon={<DiamondIcon />} 
            label="Premium" 
            isActive={currentPage === 'Premium'} 
            onClick={() => setCurrentPage('Premium')} 
            isCollapsed={isCollapsed} 
          />
          {isModerator && (
            <>
              <div className="border-t border-light-border dark:border-dark-border my-2 md:my-3"></div>
              <NavLink 
                icon={<DashboardIcon />} 
                label="Dashboard" 
                isActive={currentPage === 'Dashboard'} 
                onClick={() => setCurrentPage('Dashboard')} 
                isCollapsed={isCollapsed} 
              />
              <NavLink 
                icon={<ShieldIcon />} 
                label="Moderação" 
                isActive={currentPage === 'Moderation'} 
                onClick={() => setCurrentPage('Moderation')} 
                notificationCount={pendingModerationCount} 
                isCollapsed={isCollapsed} 
              />
              <NavLink 
                icon={<GavelIcon />} 
                label="Apelações" 
                isActive={currentPage === 'Appeals'} 
                onClick={() => setCurrentPage('Appeals')} 
                notificationCount={pendingAppealsCount} 
                isCollapsed={isCollapsed} 
              />
            </>
          )}
        </nav>

        {/* Post Button */}
        <div className={`mt-4 md:mt-6 px-2 md:px-0 ${isCollapsed ? 'flex justify-center' : ''}`}>
          {isCollapsed ? (
            <Tooltip text="Post" position="right">
              <button 
                onClick={handlePostClick}
                className="w-12 h-12 bg-primary hover:bg-gray-600 text-white font-bold rounded-full flex items-center justify-center transition-all duration-200 transform active:scale-95 shadow-lg"
              >
                <PostIcon />
              </button>
            </Tooltip>
          ) : (
            <button 
              onClick={handlePostClick}
              className="w-full bg-primary hover:bg-gray-600 text-white font-bold py-3 md:py-2 px-4 rounded-full transition-all duration-200 transform active:scale-95 shadow-lg text-base md:text-sm"
            >
              Criar Post
            </button>
          )}
        </div>
      </div>


    </div>
  );
};

export default Sidebar;
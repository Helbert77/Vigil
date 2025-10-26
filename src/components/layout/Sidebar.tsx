import React, { useEffect } from 'react';
import { Icon } from '@/components/icons/Icon';
import NavLink from './NavLink';
import { PostIcon } from '@/src/components/icons/PostIcon';
import Tooltip from '@/components/common/Tooltip';
import { User } from '@/types';
import { DiamondIcon } from '@/src/components/icons/DiamondIcon'; // Caminho corrigido

const HomeIcon = () => <Icon><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></Icon>;
const UserIcon = () => <Icon><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></Icon>;
const BellIcon = () => <Icon><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></Icon>;
const MailIcon = () => <Icon><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></Icon>;
const BookmarkIcon = () => <Icon><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></Icon>;
const UsersIcon = () => <Icon><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></Icon>;
const SettingsIcon = () => <Icon><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0 .33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></Icon>;
const LogOutIcon = () => <Icon><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></Icon>;
const TimelineIcon = () => <Icon><path d="M3 3v18h18"></path><path d="M7 12h10"></path><path d="M7 8h7"></path><path d="M7 16h4"></path></Icon>;
const ShieldIcon = () => <Icon><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></Icon>;
const DashboardIcon = () => <Icon><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></Icon>;
const GavelIcon = () => <Icon><path d="m14 13-7.5 7.5"/><path d="m18 17-5.5 5.5"/><path d="m15 6-3.5 3.5"/><path d="m2 21 6-6"/><path d="m3 3 7.5 7.5"/><path d="m13 1 6 6"/><path d="M12 6 9 3 3 9l3 3"/><path d="M18 12 21 9l-6-6-3 3"/></Icon>;

interface SidebarProps {
  user: User | null;
  currentPage: string;
  setCurrentPage: (page: any) => void;
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
  onLogout: () => void;
  isCollapsed: boolean;
  pendingModerationCount: number;
  pendingAppealsCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ user, currentPage, setCurrentPage, unreadNotificationsCount, unreadMessagesCount, onLogout, isCollapsed, pendingModerationCount, pendingAppealsCount }) => {
  const isModerator = user?.role === 'admin' || user?.role === 'moderator';

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

  return (
    <div className={`sticky top-20 flex flex-col h-[calc(100vh-6rem)] w-full ${isCollapsed ? 'items-center' : ''}`}>
      <div className="flex-grow">
        <nav className="space-y-2">
          <NavLink icon={<HomeIcon />} label="Home" isActive={currentPage === 'Home'} onClick={() => setCurrentPage('Home')} isCollapsed={isCollapsed} />
          <NavLink icon={<BellIcon />} label="Notifications" isActive={currentPage === 'Notifications'} onClick={() => setCurrentPage('Notifications')} notificationCount={unreadNotificationsCount} isCollapsed={isCollapsed} />
          <NavLink icon={<MailIcon />} label="Messages" isActive={currentPage === 'Messages'} onClick={() => setCurrentPage('Messages')} notificationCount={unreadMessagesCount} isCollapsed={isCollapsed} />
          <NavLink icon={<BookmarkIcon />} label="Saved" isActive={currentPage === 'Saved'} onClick={() => setCurrentPage('Saved')} isCollapsed={isCollapsed} />
          <NavLink icon={<UsersIcon />} label="Communities" isActive={currentPage === 'Communities'} onClick={() => setCurrentPage('Communities')} isCollapsed={isCollapsed} />
          <NavLink icon={<TimelineIcon />} label="Timeline" isActive={currentPage === 'Timeline'} onClick={() => setCurrentPage('Timeline')} isCollapsed={isCollapsed} />
          <NavLink icon={<UserIcon />} label="Profile" isActive={currentPage === 'Profile'} onClick={() => setCurrentPage('Profile')} isCollapsed={isCollapsed} />
          <NavLink icon={<SettingsIcon />} label="Settings" isActive={currentPage === 'Settings'} onClick={() => setCurrentPage('Settings')} isCollapsed={isCollapsed} />
          <NavLink icon={<DiamondIcon />} label="Premium" isActive={currentPage === 'Premium'} onClick={() => setCurrentPage('Premium')} isCollapsed={isCollapsed} />
          {isModerator && (
            <>
              <NavLink icon={<DashboardIcon />} label="Dashboard" isActive={currentPage === 'Dashboard'} onClick={() => setCurrentPage('Dashboard')} isCollapsed={isCollapsed} />
              <NavLink icon={<ShieldIcon />} label="Moderação" isActive={currentPage === 'Moderation'} onClick={() => setCurrentPage('Moderation')} notificationCount={pendingModerationCount} isCollapsed={isCollapsed} />
              <NavLink icon={<GavelIcon />} label="Apelações" isActive={currentPage === 'Appeals'} onClick={() => setCurrentPage('Appeals')} notificationCount={pendingAppealsCount} isCollapsed={isCollapsed} />
            </>
          )}
        </nav>
        <div className="mt-4 flex justify-center">
          {isCollapsed ? (
            <Tooltip text="Post" position="right">
              <button 
                onClick={handlePostClick}
                className="w-12 h-12 bg-primary hover:bg-gray-600 text-white font-bold rounded-full flex items-center justify-center transition-all duration-200 transform active:scale-95">
                <PostIcon />
              </button>
            </Tooltip>
          ) : (
            <button 
              onClick={handlePostClick}
              className="w-full bg-primary hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-200 transform active:scale-95">
              Post
            </button>
          )}
        </div>
      </div>
      <div className="mt-auto w-full">
        <button 
          onClick={onLogout} 
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-500 ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? 'Sair' : ''}
        >
          <LogOutIcon />
          {!isCollapsed && <span className="hidden md:inline font-bold">Sair</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
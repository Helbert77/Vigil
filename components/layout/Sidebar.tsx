import React from 'react';
import { Icon } from '../icons/Icon';

const HomeIcon = () => <Icon><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></Icon>;
const UserIcon = () => <Icon><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></Icon>;
const BellIcon = () => <Icon><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></Icon>;
const MailIcon = () => <Icon><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></Icon>;
const BookmarkIcon = () => <Icon><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></Icon>;
const UsersIcon = () => <Icon><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></Icon>;
const SettingsIcon = () => <Icon><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></Icon>;

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: 'Home' | 'Profile' | 'Settings' | 'Notifications' | 'Messages' | 'Saved' | 'Communities') => void;
}

const NavLink: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${isActive ? 'bg-primary/20 text-primary font-bold' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
    {icon}
    <span className="hidden md:inline">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  const handlePostClick = () => {
    // Navigate to home if not already there, then focus.
    if (currentPage !== 'Home') {
      setCurrentPage('Home');
      // Use a timeout to allow the home page to render before focusing
      setTimeout(() => {
        document.getElementById('create-post-textarea')?.focus();
      }, 0);
    } else {
      document.getElementById('create-post-textarea')?.focus();
    }
  };

  return (
    <div className="sticky top-20">
      <nav className="space-y-2">
        <NavLink
          icon={<HomeIcon />}
          label="Home"
          isActive={currentPage === 'Home'}
          onClick={() => setCurrentPage('Home')}
        />
        <NavLink
          icon={<BellIcon />}
          label="Notifications"
          isActive={currentPage === 'Notifications'}
          onClick={() => setCurrentPage('Notifications')}
        />
        <NavLink
          icon={<MailIcon />}
          label="Messages"
          isActive={currentPage === 'Messages'}
          onClick={() => setCurrentPage('Messages')}
        />
        <NavLink
          icon={<BookmarkIcon />}
          label="Saved"
          isActive={currentPage === 'Saved'}
          onClick={() => setCurrentPage('Saved')}
        />
        <NavLink
          icon={<UsersIcon />}
          label="Communities"
          isActive={currentPage === 'Communities'}
          onClick={() => setCurrentPage('Communities')}
        />
        <NavLink
          icon={<UserIcon />}
          label="Profile"
          isActive={currentPage === 'Profile'}
          onClick={() => setCurrentPage('Profile')}
        />
        <NavLink
          icon={<SettingsIcon />}
          label="Settings"
          isActive={currentPage === 'Settings'}
          onClick={() => setCurrentPage('Settings')}
        />
      </nav>
      <button 
        onClick={handlePostClick}
        className="mt-4 w-full bg-primary hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200">
        Post
      </button>
    </div>
  );
};

export default Sidebar;

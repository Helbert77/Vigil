import React from 'react';

interface NavLinkProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  notificationCount?: number;
  isCollapsed: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ icon, label, isActive, onClick, notificationCount = 0, isCollapsed }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 relative ${
      isActive 
        ? 'bg-primary/20 text-primary font-bold' 
        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
    } ${isCollapsed ? 'justify-center' : ''}`}
    title={isCollapsed ? label : ''}
  >
    <div className="relative">
      {icon}
      {notificationCount > 0 && (
        <span className={`absolute top-0 right-0 flex items-center justify-center h-4 min-w-[1rem] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold border-2 border-light-card dark:border-dark-card ${isCollapsed ? '-mt-1 -mr-1' : ''}`}>
          {notificationCount}
        </span>
      )}
    </div>
    {!isCollapsed && <span className="hidden md:inline">{label}</span>}
  </button>
);

export default NavLink;
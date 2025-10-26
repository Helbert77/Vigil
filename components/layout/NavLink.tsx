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
    className={`w-full flex items-center transition-colors duration-200 relative rounded-lg
      ${/* Mobile and desktop spacing */ ''}
      ${isCollapsed ? 'justify-center p-3' : 'space-x-3 px-3 py-3 md:py-2'}
      ${/* Active and hover states */ ''}
      ${isActive 
        ? 'bg-primary/20 text-primary font-bold' 
        : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
      }
      ${/* Touch targets for mobile */ ''}
      min-h-[44px] md:min-h-[36px]
    `}
    title={isCollapsed ? label : ''}
  >
    <div className="relative flex-shrink-0">
      <div className="w-5 h-5 md:w-4 md:h-4">
        {icon}
      </div>
      {notificationCount > 0 && (
        <span className={`absolute flex items-center justify-center h-4 min-w-[1rem] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold border-2 border-light-card dark:border-dark-card
          ${isCollapsed ? '-top-1 -right-1' : '-top-1 -right-2'}
        `}>
          {notificationCount > 99 ? '99+' : notificationCount}
        </span>
      )}
    </div>
    {!isCollapsed && (
      <span className="text-base md:text-sm font-medium truncate">
        {label}
      </span>
    )}
  </button>
);

export default NavLink;
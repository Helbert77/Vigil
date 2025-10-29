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
      ${/* Reduced spacing and padding */ ''}
      ${isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2'}
      ${/* Active and hover states */ ''}
      ${isActive 
        ? 'bg-primary/20 text-primary font-bold' 
        : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
      }
      ${/* Consistent touch targets */ ''}
      min-h-[40px]
    `}
    title={isCollapsed ? label : ''}
  >
    <div className="relative flex-shrink-0 flex items-center justify-center">
      <div className="w-6 h-6 flex items-center justify-center">
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
      <span className="text-base font-medium truncate flex items-center leading-5">
        {label}
      </span>
    )}
  </button>
);

export default NavLink;
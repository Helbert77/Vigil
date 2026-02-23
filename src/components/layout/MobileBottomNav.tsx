import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import type { Page } from '@/src/utils/history';

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  unreadMessagesCount?: number;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

const HomeIcon = () => (
  <Icon><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></Icon>
);
const ExploreIcon = () => (
  <Icon><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></Icon>
);
const MailIcon = () => (
  <Icon><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></Icon>
);
const UsersIcon = () => (
  <Icon><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Icon>
);
const LibraryIcon = () => (
  <Icon><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></Icon>
);
const TimelineIcon = () => (
  <Icon><path d="M3 3v18h18" /><path d="M7 12h10" /><path d="M7 8h7" /><path d="M7 16h4" /></Icon>
);

const MobileBottomNav: React.FC<Props> = ({ currentPage, onNavigate, unreadMessagesCount = 0, scrollContainerRef }) => {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef<number>(0);

  useEffect(() => {
    const container = scrollContainerRef?.current;
    if (!container) return;

    lastY.current = container.scrollTop || 0;
    const onScroll = () => {
      const y = container.scrollTop || 0;
      const diff = y - lastY.current;
      if (Math.abs(diff) > 4) {
        if (diff > 0 && y > 48) setHidden(true); else setHidden(false);
        lastY.current = y;
      }
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [scrollContainerRef]);

  const Item: React.FC<{label: string; active: boolean; onClick: () => void; badge?: number; children: React.ReactNode}> = ({ label, active, onClick, badge = 0, children }) => (
    <button
      aria-label={label}
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 px-1 py-1 rounded-xl transition-colors ${active ? 'text-secondary' : 'text-gray-700 dark:text-gray-200'}`}
    >
      <div className={`relative w-6 h-6 ${active ? 'text-secondary' : ''}`}>{children}{badge > 0 && (
        <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] bg-secondary text-white flex items-center justify-center">{badge}</span>
      )}</div>
    </button>
  );

  return (
    <div
      role="navigation"
      className={`md:hidden flex-shrink-0 z-50 transition-all duration-200 overflow-hidden ${hidden ? 'max-h-0' : 'max-h-24'}`}
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="mx-auto max-w-screen-sm">
        <div className="m-3 mt-0 rounded-2xl border bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border shadow-lg">
          <div className="flex items-center justify-between px-2 py-2">
            <Item label="Home" active={currentPage === 'Home'} onClick={() => onNavigate('Home')}><HomeIcon /></Item>
            <Item label="Explore" active={currentPage === 'Explore'} onClick={() => onNavigate('Explore')}><ExploreIcon /></Item>
            <Item label="Messages" active={currentPage === 'Messages'} onClick={() => onNavigate('Messages')} badge={unreadMessagesCount}><MailIcon /></Item>
            <Item label="Communities" active={currentPage === 'Communities'} onClick={() => onNavigate('Communities')}><UsersIcon /></Item>
            <Item label="Biblioteca" active={currentPage === 'Library'} onClick={() => onNavigate('Library')}><LibraryIcon /></Item>
            <Item label="Timeline" active={currentPage === 'Timeline'} onClick={() => onNavigate('Timeline')}><TimelineIcon /></Item>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;

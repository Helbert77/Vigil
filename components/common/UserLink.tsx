import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User } from '@/types';
import ProfileHoverCard from './ProfileHoverCard';

interface UserLinkProps {
  children: React.ReactNode;
  user: User;
  isFollowing: boolean;
  onFollowToggle: (userId: string) => void;
  onViewProfile: (userId:string) => void;
  isCurrentUser: boolean;
  onOpenFollowModal: (user: User, tab: 'followers' | 'following') => void;
  className?: string;
}

const UserLink: React.FC<UserLinkProps> = ({ children, user, className, ...props }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [cardPositionStyle, setCardPositionStyle] = useState<React.CSSProperties>({});
  const hoverTimeout = useRef<number | null>(null);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isHovering && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const cardWidth = 320; // w-80 from ProfileHoverCard
      const cardHeightEstimate = 280; // An estimated height for the card
      const margin = 16; // 1rem safety margin

      let top = rect.bottom + 8; // Default position below the element
      let left = rect.left;

      // If it overflows the bottom, flip it to the top
      if (top + cardHeightEstimate > viewportHeight - margin) {
        top = rect.top - cardHeightEstimate - 8;
      }

      // If it overflows the right, align it to the right edge of the trigger
      if (left + cardWidth > viewportWidth - margin) {
        left = rect.right - cardWidth;
      }

      // Ensure it doesn't go off the left side of the screen
      if (left < margin) {
        left = margin;
      }

      setCardPositionStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
      });
    }
  }, [isHovering]);

  const handleMouseEnter = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    hoverTimeout.current = window.setTimeout(() => {
      setIsHovering(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    hoverTimeout.current = window.setTimeout(() => {
      setIsHovering(false);
    }, 300);
  };

  const HoverCardPortal = () => {
    if (!isHovering) return null;

    return createPortal(
      <div
        style={cardPositionStyle}
        className="z-50"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <ProfileHoverCard user={user} {...props} />
      </div>,
      document.body
    );
  };

  return (
    <span
      ref={containerRef}
      className="inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span
        className={`hover:underline cursor-pointer ${className || ''}`}
        onClick={(e) => { e.stopPropagation(); props.onViewProfile(user.id); }}
      >
        {children}
      </span>
      <HoverCardPortal />
    </span>
  );
};

export default UserLink;
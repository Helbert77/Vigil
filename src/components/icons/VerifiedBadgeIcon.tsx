import React from 'react';

interface VerifiedBadgeIconProps extends React.SVGProps<SVGSVGElement> {
  plan: 'pro' | 'premium';
  className?: string;
}

export const VerifiedBadgeIcon: React.FC<VerifiedBadgeIconProps> = ({ plan, className, ...props }) => {
  const colorClass = plan === 'premium' ? 'text-yellow-500' : 'text-secondary';
  
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`${colorClass} ${className || ''}`}
      {...props}
    >
      <path d="M23,12l-2.44-2.79l0.34-3.69l-3.61-0.82L15.4,1.48L12,2.82L8.6,1.48L6.71,4.7L3.1,5.52l0.34,3.69L1,12l2.44,2.79 l-0.34,3.69l3.61,0.82L8.6,22.52L12,21.18l3.4,1.34l1.89-3.22l3.61-0.82l-0.34-3.69L23,12z" />
      <path fill="#FFF" d="M10.09,16.72L6.27,12.9l1.41-1.41 l2.41,2.41l5.6-5.59l1.41,1.41L10.09,16.72z" />
    </svg>
  );
};
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div 
      className={`bg-light-card dark:bg-dark-card p-3 md:p-4 rounded-lg shadow-sm ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
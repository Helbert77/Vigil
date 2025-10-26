import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  ...props 
}) => {
  const baseClasses = "font-bold rounded-full transition-colors duration-200 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-primary hover:bg-gray-600 text-white focus:ring-primary dark:focus:ring-offset-dark-card",
    secondary: "bg-secondary hover:bg-blue-700 text-white focus:ring-secondary dark:focus:ring-offset-dark-card",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 dark:focus:ring-offset-dark-card",
    outline: "bg-transparent border border-light-border dark:border-dark-border text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500 dark:focus:ring-offset-dark-card",
  };

  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
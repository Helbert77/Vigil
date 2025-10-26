import React from 'react';

interface LogoIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    className?: string;
}

export const LogoIcon: React.FC<LogoIconProps> = ({ className = 'h-8 w-8', ...props }) => (
    <img 
        src="/logo.png" 
        alt="Vigil Logo" 
        className={className}
        {...props}
    />
);
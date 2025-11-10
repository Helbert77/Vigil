import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
    children: React.ReactNode;
}

export const Icon: React.FC<IconProps> = React.memo(({ children, width, height, className = '', ...props }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={width || "24"} 
        height={height || "24"} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        {children}
    </svg>
));
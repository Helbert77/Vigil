import React from 'react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ title, value, description, icon }) => {
  return (
    <div className="bg-light-card dark:bg-dark-card p-4 md:p-6 rounded-lg shadow-md flex items-center space-x-3 md:space-x-4">
      <div className="bg-primary/10 text-primary p-2 md:p-3 rounded-full flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">{title}</p>
        <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{description}</p>
      </div>
    </div>
  );
};

export default MetricsCard;
import React from 'react';

interface AdMetricsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const AdMetricsCard: React.FC<AdMetricsCardProps> = ({ 
  title, 
  value, 
  description, 
  icon,
  trend 
}) => {
  return (
    <div className="bg-light-card dark:bg-dark-card p-3 md:p-6 rounded-lg shadow-sm border border-light-border dark:border-dark-border">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {value}
          </p>
          {description && (
            <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-gray-500 dark:text-gray-400">vs período anterior</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-primary dark:text-secondary opacity-80">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdMetricsCard;


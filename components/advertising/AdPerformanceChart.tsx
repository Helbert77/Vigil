import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

interface DailyMetric {
  date: string;
  impressions: number;
  clicks: number;
  engagement: number;
}

interface AdPerformanceChartProps {
  data: DailyMetric[];
  isLoading?: boolean;
}

const AdPerformanceChart: React.FC<AdPerformanceChartProps> = ({ data, isLoading }) => {
  const { t } = useTranslation(['ads']);

  if (isLoading) {
    return (
      <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-sm border border-light-border dark:border-dark-border">
        <div className="flex justify-center items-center h-80">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-sm border border-light-border dark:border-dark-border">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {t('ads:charts.dailyPerformance')}
        </h3>
        <div className="flex justify-center items-center h-80 text-gray-500 dark:text-gray-400">
          {t('ads:dashboard.noDataPeriod')}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-sm border border-light-border dark:border-dark-border">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        {t('ads:charts.dailyPerformance')}
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(17, 24, 39, 0.95)',
              border: '1px solid rgba(75, 85, 99, 0.5)',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="impressions" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name={t('ads:metrics.impressions')}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="clicks" 
            stroke="#10b981" 
            strokeWidth={2}
            name={t('ads:metrics.clicks')}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="engagement" 
            stroke="#f59e0b" 
            strokeWidth={2}
            name={t('ads:metrics.engagement')}
            dot={{ fill: '#f59e0b', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdPerformanceChart;

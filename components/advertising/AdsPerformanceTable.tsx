import React from 'react';
import { Icon } from '@/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import { formatNumber, formatCurrency } from '@/src/i18n/formatters';

const EyeIcon = () => <Icon className="h-4 w-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></Icon>;
const MousePointerIcon = () => <Icon className="h-4 w-4"><path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path><path d="m13 13 6 6"></path></Icon>;
const HeartIcon = () => <Icon className="h-4 w-4"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></Icon>;

interface AdPerformance {
  id: string;
  title: string;
  imageUrl?: string;
  status: string;
  impressions: number;
  clicks: number;
  engagement: number;
  ctr: number;
  cost: number;
  cpc: number;
}

interface AdsPerformanceTableProps {
  ads: AdPerformance[];
  isLoading?: boolean;
  onViewDetails?: (adId: string) => void;
}

const AdsPerformanceTable: React.FC<AdsPerformanceTableProps> = ({ 
  ads, 
  isLoading,
  onViewDetails 
}) => {
  const { t } = useTranslation(['ads', 'common']);
  
  // Função para renderizar badge de status
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        label: t('ads:status.active'),
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      },
      paused: {
        label: t('ads:status.paused'),
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      },
      ended: {
        label: t('ads:status.ended'),
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      },
      completed: {
        label: t('ads:status.completed'),
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      },
      rejected: {
        label: t('ads:status.rejected'),
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.className}`}>
        {config.label}
      </span>
    );
  };
  
  if (isLoading) {
    return (
      <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-sm border border-light-border dark:border-dark-border">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!ads || ads.length === 0) {
    return (
      <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-sm border border-light-border dark:border-dark-border">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {t('ads:dashboard.performanceByAd')}
        </h3>
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <p className="text-center">{t('ads:myAds.noAds')}</p>
          <p className="text-sm text-center mt-2">{t('ads:dashboard.createFirstAd')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-sm border border-light-border dark:border-dark-border">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        {t('ads:dashboard.performanceByAd')}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-light-border dark:border-dark-border">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('ads:table.image')}
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('ads:create.adTitle')}
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('ads:table.status')}
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-center gap-1">
                  <EyeIcon />
                  <span>{t('ads:metrics.impressions')}</span>
                </div>
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-center gap-1">
                  <MousePointerIcon />
                  <span>{t('ads:metrics.clicks')}</span>
                </div>
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('ads:metrics.ctr')}
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-center gap-1">
                  <HeartIcon />
                  <span>{t('ads:metrics.engagement')}</span>
                </div>
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('ads:metrics.totalCost')}
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('ads:metrics.avgCpc')}
              </th>
            </tr>
          </thead>
          <tbody>
            {ads.map((ad) => (
              <tr 
                key={ad.id}
                className="border-b border-light-border dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    {ad.imageUrl ? (
                      <img 
                        src={ad.imageUrl} 
                        alt={ad.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 text-xs">
                        {t('ads:table.noImage')}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                    {ad.title}
                  </p>
                </td>
                <td className="py-3 px-4 text-center">
                  {getStatusBadge(ad.status)}
                </td>
                <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                  {formatNumber(ad.impressions)}
                </td>
                <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                  {formatNumber(ad.clicks)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`font-semibold ${
                    ad.ctr >= 2 ? 'text-green-600 dark:text-green-400' :
                    ad.ctr >= 1 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {ad.ctr.toFixed(2)}%
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                  {formatNumber(ad.engagement)}
                </td>
                <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                  {formatCurrency(ad.cost)}
                </td>
                <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                  {formatCurrency(ad.cpc)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdsPerformanceTable;

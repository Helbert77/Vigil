import React from 'react';
import { Icon } from '@/components/icons/Icon';

const EyeIcon = () => <Icon className="h-4 w-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></Icon>;
const MousePointerIcon = () => <Icon className="h-4 w-4"><path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path><path d="m13 13 6 6"></path></Icon>;
const HeartIcon = () => <Icon className="h-4 w-4"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></Icon>;

interface AdPerformance {
  id: string;
  title: string;
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
          Performance por Anúncio
        </h3>
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <p className="text-center">Nenhum anúncio ativo no momento</p>
          <p className="text-sm text-center mt-2">Crie seu primeiro anúncio para começar a ver métricas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-sm border border-light-border dark:border-dark-border">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Performance por Anúncio
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-light-border dark:border-dark-border">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Anúncio
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-center gap-1">
                  <EyeIcon />
                  <span>Impressões</span>
                </div>
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-center gap-1">
                  <MousePointerIcon />
                  <span>Cliques</span>
                </div>
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                CTR
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-center gap-1">
                  <HeartIcon />
                  <span>Engajamento</span>
                </div>
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Custo
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                CPC
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Ações
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
                  <p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                    {ad.title}
                  </p>
                </td>
                <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                  {ad.impressions.toLocaleString('pt-BR')}
                </td>
                <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                  {ad.clicks.toLocaleString('pt-BR')}
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
                  {ad.engagement.toLocaleString('pt-BR')}
                </td>
                <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                  € {ad.cost.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                  € {ad.cpc.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-center">
                  {onViewDetails && (
                    <button
                      onClick={() => onViewDetails(ad.id)}
                      className="text-primary hover:text-secondary text-sm font-medium transition-colors"
                    >
                      Ver detalhes
                    </button>
                  )}
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


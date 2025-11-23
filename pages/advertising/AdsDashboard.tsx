import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { useToast } from '@/hooks/useToast';
import * as api from '@/src/services/api';
import AdMetricsCard from '@/components/advertising/AdMetricsCard';
import AdPerformanceChart from '@/components/advertising/AdPerformanceChart';
import AdsPerformanceTable from '@/components/advertising/AdsPerformanceTable';
import CreateAdModal from '@/components/advertising/CreateAdModal';
import { Icon } from '@/components/icons/Icon';

// Ícones
const EyeIcon = () => <Icon className="h-6 w-6"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></Icon>;
const MousePointerIcon = () => <Icon className="h-6 w-6"><path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path><path d="m13 13 6 6"></path></Icon>;
const HeartIcon = () => <Icon className="h-6 w-6"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></Icon>;
const TrendingUpIcon = () => <Icon className="h-6 w-6"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></Icon>;

interface AdsDashboardProps {
  user: User;
}

const AdsDashboard: React.FC<AdsDashboardProps> = ({ user }) => {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<number>(7);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Estados para métricas
  const [aggregatedMetrics, setAggregatedMetrics] = useState<any>(null);
  const [dailyMetrics, setDailyMetrics] = useState<any[]>([]);
  const [adsPerformance, setAdsPerformance] = useState<any[]>([]);

  // Buscar todas as métricas
  const fetchAllMetrics = async () => {
    setIsLoading(true);
    try {
      // Buscar métricas agregadas
      const aggregated = await api.fetchUserAdMetrics(user.id, timeframe);
      setAggregatedMetrics(aggregated);

      // Buscar métricas diárias para o gráfico
      const daily = await api.fetchDailyAdMetrics(user.id, timeframe);
      setDailyMetrics(daily);

      // Buscar performance individual dos anúncios
      const performance = await api.fetchAdsPerformance(user.id, timeframe);
      setAdsPerformance(performance);

    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      addToast('Erro ao carregar métricas de anúncios', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMetrics();
  }, [timeframe, user.id]);

  // Calcular custo total e CPC médio
  const totalCost = adsPerformance.reduce((sum, ad) => sum + ad.cost, 0);
  const totalClicks = aggregatedMetrics?.total_clicks || 0;
  const avgCpc = totalClicks > 0 ? totalCost / totalClicks : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics de Anúncios
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Acompanhe a performance das suas campanhas
          </p>
        </div>

        {/* Botão Criar Anúncio e Seletor de período */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center bg-secondary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors
              /* Mobile adjustments: smaller size */
              md:py-2 md:px-4 py-1.5 px-3 text-sm md:text-base"
          >
            Criar Anúncio
          </button>

          <label className="text-sm text-gray-600 dark:text-gray-400">
            Período:
          </label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(Number(e.target.value))}
            className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={90}>Últimos 90 dias</option>
          </select>
        </div>
      </div>

      {/* Modal de Criar Anúncio */}
      <CreateAdModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        user={user}
        onAdCreated={fetchAllMetrics}
      />

      {/* Cards de Métricas Principais */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdMetricsCard
              title="Impressões"
              value={aggregatedMetrics?.total_impressions?.toLocaleString('pt-BR') || '0'}
              description="Total de visualizações"
              icon={<EyeIcon />}
            />

            <AdMetricsCard
              title="Cliques"
              value={aggregatedMetrics?.total_clicks?.toLocaleString('pt-BR') || '0'}
              description={`CTR: ${aggregatedMetrics?.ctr?.toFixed(2) || '0.00'}%`}
              icon={<MousePointerIcon />}
            />

            <AdMetricsCard
              title="Engajamento"
              value={aggregatedMetrics?.total_engagement?.toLocaleString('pt-BR') || '0'}
              description={`Taxa: ${aggregatedMetrics?.engagement_rate?.toFixed(2) || '0.00'}%`}
              icon={<HeartIcon />}
            />

            <AdMetricsCard
              title="Custo Total"
              value={`€ ${totalCost.toFixed(2)}`}
              description={`CPC médio: € ${avgCpc.toFixed(2)}`}
              icon={<TrendingUpIcon />}
            />
          </div>

          {/* Métricas Detalhadas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-sm border border-light-border dark:border-dark-border">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Curtidas</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {aggregatedMetrics?.total_likes?.toLocaleString('pt-BR') || '0'}
              </p>
            </div>

            <div className="bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-sm border border-light-border dark:border-dark-border">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Compartilhamentos</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {aggregatedMetrics?.total_shares?.toLocaleString('pt-BR') || '0'}
              </p>
            </div>

            <div className="bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-sm border border-light-border dark:border-dark-border">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Salvamentos</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {aggregatedMetrics?.total_saves?.toLocaleString('pt-BR') || '0'}
              </p>
            </div>
          </div>

          {/* Gráfico de Performance */}
          <AdPerformanceChart data={dailyMetrics} isLoading={false} />

          {/* Tabela de Performance por Anúncio */}
          <AdsPerformanceTable
            ads={adsPerformance}
            isLoading={false}
            onViewDetails={(adId) => {
              // TODO: Implementar navegação para página de detalhes do anúncio
              // addToast('Página de detalhes do anúncio será implementada em breve', 'info');
            }}
          />

          {/* Mensagem se não houver dados */}
          {!isLoading && aggregatedMetrics?.total_impressions === 0 && (
            <div className="bg-light-card dark:bg-dark-card p-8 rounded-lg shadow-sm border border-light-border dark:border-dark-border text-center">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Nenhum dado disponível
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Você ainda não tem anúncios ativos ou métricas registradas no período selecionado.
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center bg-secondary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors
              /* Mobile adjustments: smaller size */
              md:py-2 md:px-4 py-1.5 px-3 text-sm md:text-base"
                >
                  Criar Primeiro Anúncio
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdsDashboard;


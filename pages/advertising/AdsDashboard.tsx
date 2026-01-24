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
  const [selectedAdId, setSelectedAdId] = useState<string>('all'); // 'all' ou ID do anúncio específico

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

  // Filtrar métricas baseado no anúncio selecionado
  const filteredMetrics = React.useMemo(() => {
    if (selectedAdId === 'all') {
      return {
        aggregated: aggregatedMetrics,
        daily: dailyMetrics,
        performance: adsPerformance
      };
    }

    // Encontrar o anúncio específico
    const selectedAd = adsPerformance.find(ad => ad.id === selectedAdId);
    
    if (!selectedAd) {
      return {
        aggregated: aggregatedMetrics,
        daily: dailyMetrics,
        performance: adsPerformance
      };
    }

    // Criar métricas agregadas apenas para o anúncio selecionado
    const filteredAggregated = {
      total_impressions: selectedAd.impressions,
      total_clicks: selectedAd.clicks,
      total_engagement: selectedAd.engagement,
      total_likes: 0, // Não temos esse detalhe por anúncio nas métricas atuais
      total_shares: 0,
      total_saves: 0,
      ctr: selectedAd.ctr,
      engagement_rate: selectedAd.impressions > 0 
        ? ((selectedAd.engagement / selectedAd.impressions) * 100).toFixed(2)
        : 0
    };

    // Filtrar métricas diárias para o anúncio selecionado
    // Como não temos métricas diárias por anúncio específico da API,
    // vamos criar uma distribuição proporcional baseada nas métricas do anúncio
    const filteredDaily = dailyMetrics.map(day => {
      if (!aggregatedMetrics || aggregatedMetrics.total_impressions === 0) {
        return day;
      }
      
      // Calcular proporção deste anúncio no total
      const adProportion = selectedAd.impressions / aggregatedMetrics.total_impressions;
      
      return {
        date: day.date,
        impressions: Math.round(day.impressions * adProportion),
        clicks: Math.round(day.clicks * adProportion),
        engagement: Math.round(day.engagement * adProportion)
      };
    });

    // Filtrar tabela de performance para mostrar apenas o anúncio selecionado
    const filteredPerformance = adsPerformance.filter(ad => ad.id === selectedAdId);

    return {
      aggregated: filteredAggregated,
      daily: filteredDaily,
      performance: filteredPerformance
    };
  }, [selectedAdId, aggregatedMetrics, dailyMetrics, adsPerformance]);

  // Calcular custo total e CPC médio baseado nas métricas filtradas
  const totalCost = filteredMetrics.performance.reduce((sum, ad) => sum + ad.cost, 0);
  const totalClicks = filteredMetrics.aggregated?.total_clicks || 0;
  const avgCpc = totalClicks > 0 ? totalCost / totalClicks : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Analytics de Anúncios
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Acompanhe a performance das suas campanhas
          </p>
        </div>

        {/* Botão Criar Anúncio e Seletor de período */}
        <div className="flex items-center gap-3 ml-auto">
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

      {/* Filtro por Anúncio */}
      <div className="flex items-center gap-3">
        <label htmlFor="ad-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Filtrar por anúncio:
        </label>
        <select
          id="ad-filter"
          value={selectedAdId}
          onChange={(e) => setSelectedAdId(e.target.value)}
          className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary min-w-[250px]"
        >
          <option value="all">Todos os anúncios</option>
          {adsPerformance.map((ad) => (
            <option key={ad.id} value={ad.id}>
              {ad.title}
            </option>
          ))}
        </select>
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
              value={filteredMetrics.aggregated?.total_impressions?.toLocaleString('pt-BR') || '0'}
              description="Total de visualizações"
              icon={<EyeIcon />}
            />

            <AdMetricsCard
              title="Cliques"
              value={filteredMetrics.aggregated?.total_clicks?.toLocaleString('pt-BR') || '0'}
              description={`CTR: ${filteredMetrics.aggregated?.ctr?.toFixed(2) || '0.00'}%`}
              icon={<MousePointerIcon />}
            />

            <AdMetricsCard
              title="Engajamento"
              value={filteredMetrics.aggregated?.total_engagement?.toLocaleString('pt-BR') || '0'}
              description={`Taxa: ${filteredMetrics.aggregated?.engagement_rate || '0.00'}%`}
              icon={<HeartIcon />}
            />

            <AdMetricsCard
              title="Custo Total"
              value={`€ ${totalCost.toFixed(2)}`}
              description={avgCpc !== null ? `CPC médio: € ${avgCpc.toFixed(2)}` : 'CPC médio: Sem cliques'}
              icon={<TrendingUpIcon />}
            />
          </div>

          {/* Métricas Detalhadas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
            <div className="bg-light-card dark:bg-dark-card p-3 md:p-4 rounded-lg shadow-sm border border-light-border dark:border-dark-border">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1">Curtidas</p>
              <p className="text-base md:text-xl font-bold text-gray-900 dark:text-white">
                {filteredMetrics.aggregated?.total_likes?.toLocaleString('pt-BR') || '0'}
              </p>
            </div>

            <div className="bg-light-card dark:bg-dark-card p-3 md:p-4 rounded-lg shadow-sm border border-light-border dark:border-dark-border">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1">Compartilhamentos</p>
              <p className="text-base md:text-xl font-bold text-gray-900 dark:text-white">
                {filteredMetrics.aggregated?.total_shares?.toLocaleString('pt-BR') || '0'}
              </p>
            </div>

            <div className="bg-light-card dark:bg-dark-card p-3 md:p-4 rounded-lg shadow-sm border border-light-border dark:border-dark-border">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1">Salvamentos</p>
              <p className="text-base md:text-xl font-bold text-gray-900 dark:text-white">
                {filteredMetrics.aggregated?.total_saves?.toLocaleString('pt-BR') || '0'}
              </p>
            </div>
          </div>

          {/* Gráfico de Performance */}
          <AdPerformanceChart data={filteredMetrics.daily} isLoading={false} />

          {/* Tabela de Performance por Anúncio */}
          <AdsPerformanceTable
            ads={filteredMetrics.performance}
            isLoading={false}
            onViewDetails={(adId) => {
              // TODO: Implementar navegação para página de detalhes do anúncio
              // addToast('Página de detalhes do anúncio será implementada em breve', 'info');
            }}
          />

          {/* Mensagem se não houver dados */}
          {!isLoading && filteredMetrics.aggregated?.total_impressions === 0 && (
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


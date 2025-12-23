import React, { useEffect, useState } from 'react';
import { ConversionMetrics, ConversionEvent } from '@/types';
import * as api from '@/src/services/api';
import { useToast } from '@/hooks/useToast';
import Card from '@/components/common/Card';

export const AnalyticsDashboard: React.FC = () => {
  const { addToast } = useToast();
  const [metrics, setMetrics] = useState<ConversionMetrics[]>([]);
  const [events, setEvents] = useState<ConversionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      
      switch (dateRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
      }

      const startDateStr = startDate.toISOString().split('T')[0];

      // Carregar métricas
      const { data: metricsData, error: metricsError } = await api.fetchConversionMetrics(startDateStr, endDate);
      if (!metricsError && metricsData) {
        setMetrics(metricsData);
      }

      // Carregar eventos recentes
      const { data: eventsData, error: eventsError } = await api.fetchConversionEvents(50);
      if (!eventsError && eventsData) {
        setEvents(eventsData);
      }
    } catch (error) {
      console.error('[AnalyticsDashboard] Error loading analytics:', error);
      addToast('Erro ao carregar analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calcular totais
  const calculateTotals = () => {
    const totals = {
      trials_started: 0,
      trials_converted: 0,
      trials_expired: 0,
      trials_canceled: 0,
      revenue: 0,
      conversion_rate: 0,
    };

    metrics.forEach(m => {
      totals.trials_started += m.trials_started;
      totals.trials_converted += m.trials_converted;
      totals.trials_expired += m.trials_expired;
      totals.trials_canceled += m.trials_canceled;
      totals.revenue += m.revenue;
    });

    if (totals.trials_started > 0) {
      totals.conversion_rate = (totals.trials_converted / totals.trials_started) * 100;
    }

    return totals;
  };

  // Agrupar métricas por plano
  const getMetricsByPlan = () => {
    const byPlan: Record<string, typeof totals> = {
      basic: { trials_started: 0, trials_converted: 0, trials_expired: 0, trials_canceled: 0, revenue: 0, conversion_rate: 0 },
      pro: { trials_started: 0, trials_converted: 0, trials_expired: 0, trials_canceled: 0, revenue: 0, conversion_rate: 0 },
      premium: { trials_started: 0, trials_converted: 0, trials_expired: 0, trials_canceled: 0, revenue: 0, conversion_rate: 0 },
    };

    metrics.forEach(m => {
      if (byPlan[m.plan]) {
        byPlan[m.plan].trials_started += m.trials_started;
        byPlan[m.plan].trials_converted += m.trials_converted;
        byPlan[m.plan].trials_expired += m.trials_expired;
        byPlan[m.plan].trials_canceled += m.trials_canceled;
        byPlan[m.plan].revenue += m.revenue;
      }
    });

    // Calcular conversion rate
    Object.keys(byPlan).forEach(plan => {
      if (byPlan[plan].trials_started > 0) {
        byPlan[plan].conversion_rate = (byPlan[plan].trials_converted / byPlan[plan].trials_started) * 100;
      }
    });

    return byPlan;
  };

  const totals = calculateTotals();
  const byPlan = getMetricsByPlan();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            📊 Analytics de Conversão
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Métricas de trial e conversão de usuários
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setDateRange('7d')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              dateRange === '7d'
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            7 dias
          </button>
          <button
            onClick={() => setDateRange('30d')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              dateRange === '30d'
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            30 dias
          </button>
          <button
            onClick={() => setDateRange('90d')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              dateRange === '90d'
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            90 dias
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 md:p-6">
          <div className="text-3xl mb-2">🚀</div>
          <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {totals.trials_started}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Trials Iniciados</div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
            {totals.trials_converted}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Convertidos</div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="text-3xl mb-2">📈</div>
          <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
            {totals.conversion_rate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Taxa de Conversão</div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
            €{totals.revenue.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Receita Total</div>
        </Card>
      </div>

      {/* Metrics by Plan */}
      <Card className="p-4 md:p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Métricas por Plano
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-2 text-gray-700 dark:text-gray-300 font-semibold">Plano</th>
                <th className="text-right py-3 px-2 text-gray-700 dark:text-gray-300 font-semibold">Trials</th>
                <th className="text-right py-3 px-2 text-gray-700 dark:text-gray-300 font-semibold">Convertidos</th>
                <th className="text-right py-3 px-2 text-gray-700 dark:text-gray-300 font-semibold">Expirados</th>
                <th className="text-right py-3 px-2 text-gray-700 dark:text-gray-300 font-semibold">Cancelados</th>
                <th className="text-right py-3 px-2 text-gray-700 dark:text-gray-300 font-semibold">Taxa Conv.</th>
                <th className="text-right py-3 px-2 text-gray-700 dark:text-gray-300 font-semibold">Receita</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(byPlan).map(([plan, data]) => (
                <tr key={plan} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-2">
                    <span className="font-semibold text-gray-900 dark:text-white uppercase">
                      {plan}
                    </span>
                  </td>
                  <td className="text-right py-3 px-2 text-gray-700 dark:text-gray-300">
                    {data.trials_started}
                  </td>
                  <td className="text-right py-3 px-2 text-green-600 dark:text-green-400 font-semibold">
                    {data.trials_converted}
                  </td>
                  <td className="text-right py-3 px-2 text-orange-600 dark:text-orange-400">
                    {data.trials_expired}
                  </td>
                  <td className="text-right py-3 px-2 text-red-600 dark:text-red-400">
                    {data.trials_canceled}
                  </td>
                  <td className="text-right py-3 px-2 text-blue-600 dark:text-blue-400 font-semibold">
                    {data.conversion_rate.toFixed(1)}%
                  </td>
                  <td className="text-right py-3 px-2 text-purple-600 dark:text-purple-400 font-semibold">
                    €{data.revenue.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Conversion Funnel */}
      <Card className="p-4 md:p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Funil de Conversão
        </h2>
        <div className="space-y-3">
          {/* Trial Started */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Trials Iniciados
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {totals.trials_started} (100%)
              </span>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Converted */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Convertidos para Pago
              </span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {totals.trials_converted} ({totals.conversion_rate.toFixed(1)}%)
              </span>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-green-500 h-full transition-all duration-500" 
                style={{ width: `${totals.conversion_rate}%` }} 
              />
            </div>
          </div>

          {/* Expired */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Expirados sem Conversão
              </span>
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                {totals.trials_expired} ({totals.trials_started > 0 ? ((totals.trials_expired / totals.trials_started) * 100).toFixed(1) : 0}%)
              </span>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-orange-500 h-full transition-all duration-500" 
                style={{ width: `${totals.trials_started > 0 ? (totals.trials_expired / totals.trials_started) * 100 : 0}%` }} 
              />
            </div>
          </div>

          {/* Canceled */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Cancelados Durante Trial
              </span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                {totals.trials_canceled} ({totals.trials_started > 0 ? ((totals.trials_canceled / totals.trials_started) * 100).toFixed(1) : 0}%)
              </span>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-red-500 h-full transition-all duration-500" 
                style={{ width: `${totals.trials_started > 0 ? (totals.trials_canceled / totals.trials_started) * 100 : 0}%` }} 
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Events */}
      <Card className="p-4 md:p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Eventos Recentes
        </h2>
        <div className="overflow-x-auto">
          <div className="space-y-2 min-w-[500px]">
            {events.length === 0 ? (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                Nenhum evento registrado ainda
              </p>
            ) : (
              events.slice(0, 20).map((event: any) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-2xl">
                      {event.event_type === 'trial_started' && '🚀'}
                      {event.event_type === 'converted_to_paid' && '✅'}
                      {event.event_type === 'trial_expired' && '⏰'}
                      {event.event_type === 'canceled_trial' && '❌'}
                      {event.event_type === 'trial_day_3' && '📅'}
                      {event.event_type === 'trial_day_7' && '📅'}
                      {event.event_type === 'trial_expiring_soon' && '⚠️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white truncate">
                        @{event.profile?.username || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {event.event_type.replace(/_/g, ' ')}
                        {event.event_data?.plan && ` - ${event.event_data.plan.toUpperCase()}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                    {new Date(event.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};


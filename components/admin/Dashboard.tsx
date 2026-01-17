import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';
import MetricsCard from './MetricsCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Icon } from '@/components/icons/Icon';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import * as api from '@/src/services/api';
import CancellationFeedbackCard from '@/src/components/admin/CancellationFeedbackCard';

const ClockIcon = () => <Icon className="h-6 w-6"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></Icon>;
const CheckIcon = () => <Icon className="h-6 w-6"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></Icon>;
const XCircleIcon = () => <Icon className="h-6 w-6"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></Icon>;
const AlertTriangleIcon = () => <Icon className="h-6 w-6"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></Icon>;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState(7); // Default to 7 days
  const { addToast } = useToast();
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<any[]>([]);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_dashboard_metrics', { days_interval: timeframe });
      if (error) throw error;
      setMetrics(data);
    } catch (error) {
      addToast('Erro ao carregar as métricas do dashboard.', 'error');
      // Error log removed for production
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeedback = async () => {
    try {
      const { data, error } = await api.fetchCancellationFeedback();
      if (error) throw error;
      setFeedback(data || []);
    } catch (error) {
      addToast('Erro ao carregar feedback de cancelamento.', 'error');
      // Error log removed for production
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchFeedback();
  }, [timeframe]);

  const handleClearCounters = async () => {
    setIsClearModalOpen(false);
    addToast('Limpando contadores...', 'info');
    try {
      const { error: modError } = await api.clearResolvedModerationQueue();
      if (modError) throw modError;

      const { error: vioError } = await api.clearAllViolationHistory();
      if (vioError) throw vioError;
      
      addToast('Contadores do dashboard zerados com sucesso!', 'success');
      await fetchMetrics();

    } catch (error) {
      addToast('Erro ao zerar os contadores.', 'error');
      // Error log removed for production
    }
  };

  const formatSeconds = (seconds: number) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
  };

  const violationData = metrics?.violation_distribution 
    ? Object.entries(metrics.violation_distribution).map(([name, value]) => ({ name, value }))
    : [];

  const activityData = metrics?.activity_timeline 
    ? metrics.activity_timeline.map((item: any) => ({ ...item, date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) }))
    : [];

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard de Moderação</h1>
        <div className="flex items-center gap-4">
          <select value={timeframe} onChange={(e) => setTimeframe(Number(e.target.value))} className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-md px-3 py-1">
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={90}>Últimos 90 dias</option>
          </select>
          <button 
            onClick={() => setIsClearModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md text-sm"
          >
            Limpar Contadores
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard title="Itens Pendentes" value={metrics?.total_pending || 0} description="Aguardando revisão" icon={<AlertTriangleIcon />} />
        <MetricsCard title="Itens Aprovados" value={metrics?.approved_period || 0} description={`Nos últimos ${timeframe} dias`} icon={<CheckIcon />} />
        <MetricsCard title="Itens Rejeitados" value={metrics?.rejected_period || 0} description={`Nos últimos ${timeframe} dias`} icon={<XCircleIcon />} />
        <MetricsCard title="Tempo Médio de Revisão" value={formatSeconds(metrics?.avg_review_time_seconds)} description={`Nos últimos ${timeframe} dias`} icon={<ClockIcon />} />
        <MetricsCard title="Usuários Advertidos" value={metrics?.warned_period || 0} description={`Nos últimos ${timeframe} dias`} icon={<AlertTriangleIcon />} />
        <MetricsCard title="Usuários Suspensos" value={metrics?.suspended_period || 0} description={`Nos últimos ${timeframe} dias`} icon={<ClockIcon />} />
        <MetricsCard title="Usuários Banidos" value={metrics?.banned_period || 0} description={`Nos últimos ${timeframe} dias`} icon={<XCircleIcon />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-md">
          <h3 className="font-bold mb-4">Atividade de Moderação</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.3)" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Itens Criados" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-md">
          <h3 className="font-bold mb-4">Distribuição de Violações</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={violationData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {violationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analytics de Cancelamento */}
      {feedback.length > 0 && (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-md mb-6">
          <h3 className="font-bold mb-4 text-xl">📊 Analytics de Cancelamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="text-3xl mb-2">📉</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {feedback.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total de Cancelamentos</div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {feedback.filter((f: any) => f.reason === 'É muito caro').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Preço Alto</div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="text-3xl mb-2">📦</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {feedback.filter((f: any) => f.reason === 'Não uso os recursos premium').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Não Usa Recursos</div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="text-3xl mb-2">⚠️</div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {feedback.filter((f: any) => f.reason === 'Problemas técnicos').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Problemas Técnicos</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-md">
        <h3 className="font-bold mb-4 text-xl">💬 Feedback de Cancelamento Recente</h3>
        {feedback.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {feedback.map(item => (
              <CancellationFeedbackCard key={item.id} feedback={item} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            Nenhum feedback de cancelamento recente.
          </p>
        )}
      </div>

      <ConfirmationModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleClearCounters}
        title="Limpar Contadores do Dashboard?"
        message="Esta ação irá apagar permanentemente o histórico de violações de todos os usuários e os itens já resolvidos da fila de moderação. Esta ação não pode ser desfeita."
        confirmText="Sim, limpar tudo"
        isDestructive={true}
      />
    </div>
  );
};

export default Dashboard;
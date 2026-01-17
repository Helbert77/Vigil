import React, { useState, useEffect } from 'react';
import { useToast } from '../../../hooks/useToast';
import Card from '../../../components/common/Card';
import * as api from '../../services/api';

interface TrialCoupon {
  id: string;
  code: string;
  plan: 'basic' | 'pro' | 'premium';
  trial_days: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
  is_active: boolean;
}

interface CouponUsage {
  id: string;
  user_id: string;
  plan_activated: string;
  trial_days_granted: number;
  used_at: string;
  profiles?: {
    username?: string;
    email?: string;
  };
}

const CouponManagement: React.FC = () => {
  const { addToast } = useToast();
  const [coupons, setCoupons] = useState<TrialCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<TrialCoupon | null>(null);
  const [couponUsages, setCouponUsages] = useState<CouponUsage[]>([]);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    code: '',
    plan: 'basic' as 'basic' | 'pro' | 'premium',
    trial_days: 7,
    max_uses: null as number | null,
    valid_from: '',
    valid_until: '',
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await api.fetchTrialCoupons();
      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      addToast('Erro ao carregar cupons', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCouponUsages = async (couponId: string) => {
    try {
      const coupon = coupons.find(c => c.id === couponId);
      if (!coupon) {
        addToast('Cupom não encontrado', 'error');
        return;
      }
      
      setSelectedCoupon(coupon);
      const { data, error } = await api.fetchCouponUsages(couponId);
      if (error) throw error;
      setCouponUsages(data || []);
      setIsUsageModalOpen(true);
    } catch (error) {
      console.error('Error fetching coupon usages:', error);
      addToast('Erro ao carregar usos do cupom', 'error');
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim()) {
      addToast('Código do cupom é obrigatório', 'error');
      return;
    }

    if (formData.trial_days < 1 || formData.trial_days > 30) {
      addToast('Dias de trial deve ser entre 1 e 30', 'error');
      return;
    }

    try {
      // Converter strings vazias para null
      const couponData = {
        ...formData,
        valid_from: formData.valid_from.trim() || null,
        valid_until: formData.valid_until.trim() || null,
      };
      
      const { data, error } = await api.createTrialCoupon(couponData);
      
      if (error) {
        // Extrair mensagem de erro mais específica
        const errorMessage = error.message || 
                           (typeof error === 'string' ? error : 'Erro desconhecido');
        throw new Error(errorMessage);
      }

      // Verificar se a resposta indica erro mesmo sem error object
      if (data && !data.success && data.error) {
        throw new Error(data.error);
      }

      addToast('Cupom criado com sucesso!', 'success');
      setIsCreateModalOpen(false);
      setFormData({
        code: '',
        plan: 'basic',
        trial_days: 7,
        max_uses: null,
        valid_from: '',
        valid_until: '',
      });
      fetchCoupons();
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      
      // Extrair mensagem de erro mais amigável
      let errorMessage = 'Erro ao criar cupom';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.error) {
        errorMessage = error.error;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      // Mapear códigos de erro para mensagens mais amigáveis
      if (error?.code || error?.response?.data?.code) {
        const errorCode = error.code || error.response?.data?.code;
        switch (errorCode) {
          case 'UNAUTHORIZED':
            errorMessage = 'Você não está autenticado. Faça login novamente.';
            break;
          case 'FORBIDDEN':
            errorMessage = 'Você não tem permissão para criar cupons.';
            break;
          case 'CODE_ALREADY_EXISTS':
            errorMessage = errorMessage || 'Este código de cupom já está em uso.';
            break;
          case 'INVALID_CODE_LENGTH':
            errorMessage = 'O código do cupom deve ter entre 3 e 20 caracteres.';
            break;
          case 'INVALID_PLAN':
            errorMessage = 'Plano inválido. Escolha: basic, pro ou premium.';
            break;
          case 'INVALID_TRIAL_DAYS':
            errorMessage = 'Dias de trial devem estar entre 1 e 30.';
            break;
          case 'INVALID_DATE_RANGE':
            errorMessage = 'A data de término deve ser posterior à data de início.';
            break;
          case 'MISSING_FIELDS':
            errorMessage = 'Preencha todos os campos obrigatórios.';
            break;
          case 'DATABASE_ERROR':
            errorMessage = errorMessage || 'Erro ao salvar no banco de dados. Tente novamente.';
            break;
        }
      }
      
      addToast(errorMessage, 'error');
    }
  };

  const handleToggleCoupon = async (couponId: string, isActive: boolean) => {
    try {
      const { error } = await api.toggleCouponStatus(couponId, !isActive);
      if (error) throw error;

      addToast(`Cupom ${!isActive ? 'ativado' : 'desativado'} com sucesso!`, 'success');
      fetchCoupons();
    } catch (error: any) {
      console.error('Error toggling coupon:', error);
      addToast(error.message || 'Erro ao alterar status do cupom', 'error');
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pro': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'premium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sem limite';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('Código copiado!', 'success');
  };

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Carregando cupons...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestão de Cupons de Trial
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Crie e gerencie cupons promocionais para trials gratuitos
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Criar Cupom
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{coupons.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total de Cupons</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {coupons.filter(c => c.is_active).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Cupons Ativos</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {coupons.reduce((sum, c) => sum + c.current_uses, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total de Usos</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {coupons.filter(c => c.max_uses && c.current_uses >= c.max_uses).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Cupons Esgotados</div>
          </div>
        </Card>
      </div>

      {/* Coupons List */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Cupons Criados</h3>
          
          {coupons.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Nenhum cupom criado ainda. Clique em "Criar Cupom" para começar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4">Código</th>
                    <th className="text-left py-3 px-4">Plano</th>
                    <th className="text-left py-3 px-4">Dias</th>
                    <th className="text-left py-3 px-4">Usos</th>
                    <th className="text-left py-3 px-4">Validade</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">
                            {coupon.code}
                          </code>
                          <button
                            onClick={() => copyToClipboard(coupon.code)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            title="Copiar código"
                          >
                            📋
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(coupon.plan)}`}>
                          {coupon.plan.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">{coupon.trial_days} dias</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span>{coupon.current_uses}</span>
                          {coupon.max_uses && (
                            <>
                              <span>/</span>
                              <span>{coupon.max_uses}</span>
                            </>
                          )}
                          {coupon.current_uses > 0 && (
                            <button
                              onClick={() => fetchCouponUsages(coupon.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                              title="Ver detalhes de uso"
                            >
                              👁️
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div>
                          <div>De: {formatDate(coupon.valid_from)}</div>
                          <div>Até: {formatDate(coupon.valid_until)}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          coupon.is_active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {coupon.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleToggleCoupon(coupon.id, coupon.is_active)}
                            className={`px-3 py-1 rounded text-sm ${
                              coupon.is_active
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {coupon.is_active ? 'Desativar' : 'Ativar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Create Coupon Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Criar Novo Cupom</h3>
            
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Código do Cupom</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                    placeholder="Ex: PROMO2026"
                    maxLength={20}
                  />
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-md transition-colors"
                    title="Gerar código aleatório"
                  >
                    🎲
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Plano</label>
                <select
                  value={formData.plan}
                  onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                >
                  <option value="basic">Basic (R$ 3,99)</option>
                  <option value="pro">Pro (R$ 8,99)</option>
                  <option value="premium">Premium (R$ 19,99)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Dias de Trial (1-30)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.trial_days}
                  onChange={(e) => setFormData(prev => ({ ...prev, trial_days: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Limite de Usos (opcional)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_uses || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    max_uses: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  placeholder="Deixe vazio para ilimitado"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Válido de (opcional)</label>
                  <input
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Válido até (opcional)</label>
                  <input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Criar Cupom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Usage Details Modal */}
      {isUsageModalOpen && selectedCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detalhes de Uso - {selectedCoupon.code}</h3>
              <button
                onClick={() => setIsUsageModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {couponUsages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum uso registrado ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {couponUsages.map((usage) => (
                  <div key={usage.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{usage.profiles?.username || 'Usuário'}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{usage.profiles?.email || 'Email não disponível'}</div>
                        <div className="text-sm text-gray-500">
                          Plano: {usage.plan_activated.toUpperCase()} • {usage.trial_days_granted} dias
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(usage.used_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;
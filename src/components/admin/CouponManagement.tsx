import React, { useState, useEffect } from 'react';
import { useToast } from '../../../hooks/useToast';
import Card from '../../../components/common/Card';
import * as api from '../../services/api';
import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation(['admin', 'common']);
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
      addToast(t('admin:coupons.errors.fetch'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCouponUsages = async (couponId: string) => {
    try {
      const coupon = coupons.find(c => c.id === couponId);
      if (!coupon) {
        addToast(t('admin:coupons.errors.notFound'), 'error');
        return;
      }
      
      setSelectedCoupon(coupon);
      const { data, error } = await api.fetchCouponUsages(couponId);
      if (error) throw error;
      setCouponUsages(data || []);
      setIsUsageModalOpen(true);
    } catch (error) {
      console.error('Error fetching coupon usages:', error);
      addToast(t('admin:coupons.errors.fetchUsage'), 'error');
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
      addToast(t('admin:coupons.errors.codeRequired'), 'error');
      return;
    }

    if (formData.trial_days < 1 || formData.trial_days > 30) {
      addToast(t('admin:coupons.errors.invalidDays'), 'error');
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
                           (typeof error === 'string' ? error : t('admin:coupons.errors.createUnknown'));
        throw new Error(errorMessage);
      }

      // Verificar se a resposta indica erro mesmo sem error object
      if (data && !data.success && data.error) {
        throw new Error(data.error);
      }

      addToast(t('admin:coupons.success.created'), 'success');
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
      let errorMessage = t('admin:coupons.errors.create');
      
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
            errorMessage = t('admin:coupons.errors.unauthorized');
            break;
          case 'FORBIDDEN':
            errorMessage = t('admin:coupons.errors.forbidden');
            break;
          case 'CODE_ALREADY_EXISTS':
            errorMessage = errorMessage || t('admin:coupons.errors.codeExists');
            break;
          case 'INVALID_CODE_LENGTH':
            errorMessage = t('admin:coupons.errors.invalidCodeLength');
            break;
          case 'INVALID_PLAN':
            errorMessage = t('admin:coupons.errors.invalidPlan');
            break;
          case 'INVALID_TRIAL_DAYS':
            errorMessage = t('admin:coupons.errors.invalidTrialDays');
            break;
          case 'INVALID_DATE_RANGE':
            errorMessage = t('admin:coupons.errors.invalidDateRange');
            break;
          case 'MISSING_FIELDS':
            errorMessage = t('admin:coupons.errors.missingFields');
            break;
          case 'DATABASE_ERROR':
            errorMessage = errorMessage || t('admin:coupons.errors.databaseError');
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

      addToast(!isActive ? t('admin:coupons.success.activated') : t('admin:coupons.success.deactivated'), 'success');
      fetchCoupons();
    } catch (error: any) {
      console.error('Error toggling coupon:', error);
      addToast(error.message || t('admin:coupons.errors.toggle'), 'error');
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
    if (!dateString) return t('admin:coupons.table.noLimit');
    return new Date(dateString).toLocaleDateString(i18n.language || 'pt-BR');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast(t('admin:coupons.success.copied'), 'success');
  };

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">{t('common:loading')}</span>
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
            {t('admin:coupons.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('admin:coupons.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {t('admin:coupons.createCoupon')}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{coupons.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('admin:coupons.cards.total')}</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {coupons.filter(c => c.is_active).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('admin:coupons.cards.active')}</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {coupons.reduce((sum, c) => sum + c.current_uses, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('admin:coupons.cards.totalUses')}</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {coupons.filter(c => c.max_uses && c.current_uses >= c.max_uses).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('admin:coupons.cards.depleted')}</div>
          </div>
        </Card>
      </div>

      {/* Coupons List */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('admin:coupons.table.title')}</h3>
          
          {coupons.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {t('admin:coupons.table.noCoupons')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4">{t('admin:coupons.table.columns.code')}</th>
                    <th className="text-left py-3 px-4">{t('admin:coupons.table.columns.plan')}</th>
                    <th className="text-left py-3 px-4">{t('admin:coupons.table.columns.days')}</th>
                    <th className="text-left py-3 px-4">{t('admin:coupons.table.columns.uses')}</th>
                    <th className="text-left py-3 px-4">{t('admin:coupons.table.columns.validity')}</th>
                    <th className="text-left py-3 px-4">{t('admin:coupons.table.columns.status')}</th>
                    <th className="text-left py-3 px-4">{t('admin:coupons.table.columns.actions')}</th>
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
                            title={t('admin:coupons.table.copy')}
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
                      <td className="py-3 px-4">{coupon.trial_days} {t('common:days', { count: coupon.trial_days, defaultValue: 'dias' })}</td>
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
                              title={t('admin:coupons.table.viewUsage')}
                            >
                              👁️
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div>
                          <div>{t('admin:coupons.table.from', { date: formatDate(coupon.valid_from) })}</div>
                          <div>{t('admin:coupons.table.to', { date: formatDate(coupon.valid_until) })}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          coupon.is_active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {coupon.is_active ? t('admin:coupons.table.active') : t('admin:coupons.table.inactive')}
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
                            {coupon.is_active ? t('admin:coupons.table.deactivate') : t('admin:coupons.table.activate')}
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
            <h3 className="text-lg font-semibold mb-4">{t('admin:coupons.createModal.title')}</h3>
            
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('admin:coupons.createModal.code')}</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                    placeholder={t('admin:coupons.createModal.codePlaceholder')}
                    maxLength={20}
                  />
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-md transition-colors"
                    title={t('admin:coupons.createModal.generateRandom')}
                  >
                    🎲
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('admin:coupons.createModal.plan')}</label>
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
                <label className="block text-sm font-medium mb-1">{t('admin:coupons.createModal.trialDays')}</label>
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
                <label className="block text-sm font-medium mb-1">{t('admin:coupons.createModal.usageLimit')}</label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_uses || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    max_uses: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  placeholder={t('admin:coupons.createModal.usageLimitPlaceholder')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('admin:coupons.createModal.validFrom')}</label>
                  <input
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('admin:coupons.createModal.validUntil')}</label>
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
                  {t('admin:coupons.createModal.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {t('admin:coupons.createModal.submit')}
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
              <h3 className="text-lg font-semibold">{t('admin:coupons.usageModal.title', { code: selectedCoupon.code })}</h3>
              <button
                onClick={() => setIsUsageModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {couponUsages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t('admin:coupons.usageModal.noUsage')}
              </div>
            ) : (
              <div className="space-y-3">
                {couponUsages.map((usage) => (
                  <div key={usage.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{usage.profiles?.username || t('admin:coupons.usageModal.user')}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{usage.profiles?.email || t('admin:coupons.usageModal.emailNotAvailable')}</div>
                        <div className="text-sm text-gray-500">
                          {t('admin:coupons.usageModal.planDetails', { plan: usage.plan_activated.toUpperCase(), days: usage.trial_days_granted })}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(usage.used_at).toLocaleString(i18n.language || 'pt-BR')}
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
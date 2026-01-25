import React, { useState, useEffect } from 'react';
import { User, Ad } from '@/types';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/integrations/supabase/client';
import CreateAdModal from '@/components/advertising/CreateAdModal';
import EditAdModal from '@/components/advertising/EditAdModal';
import AdActionsMenu from '@/components/advertising/AdActionsMenu';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { Icon } from '@/components/icons/Icon';
import { pushHistoryState, type NavigationSnapshot } from '@/src/utils/history';
import { useTranslation } from 'react-i18next';
import { formatDate, formatCurrency } from '@/src/i18n/formatters';

const EyeIcon = () => <Icon className="h-5 w-5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></Icon>;
const HeartIcon = () => <Icon className="h-5 w-5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></Icon>;
const ShareIcon = () => <Icon className="h-5 w-5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" x2="12" y1="2" y2="15"></line></Icon>;

interface MyAdsProps {
  user: User;
}

const MyAds: React.FC<MyAdsProps> = ({ user }) => {
  const { addToast } = useToast();
  const { t } = useTranslation(['ads', 'common']);
  const [ads, setAds] = useState<any[]>([]);
  const [allAdsCount, setAllAdsCount] = useState(0); // Contador total de anúncios
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'ended'>('all');
  const [adToDelete, setAdToDelete] = useState<string | null>(null);
  const [adToPause, setAdToPause] = useState<{ id: string; status: string } | null>(null);

  const fetchMyAds = async () => {
    setIsLoading(true);
    try {
      // Buscar contagem total primeiro
      const { count: totalCount, error: countError } = await supabase
        .from('anuncios')
        .select('*', { count: 'exact', head: true })
        .eq('advertiser_id', user.id);

      if (!countError && totalCount !== null) {
        setAllAdsCount(totalCount);
      }

      // Buscar todos os anúncios primeiro
      let query = supabase
        .from('anuncios')
        .select('*')
        .eq('advertiser_id', user.id)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Verificar e atualizar anúncios expirados no frontend
      const now = new Date();
      const expiredAdIds: string[] = [];
      
      let updatedAds = (data || []).map((ad: any) => {
        // Verificar se a data de término passou
        if (ad.end_date && new Date(ad.end_date) < now && ad.status !== 'ended') {
          expiredAdIds.push(ad.id);
          return { ...ad, status: 'ended', completion_reason: 'duration_ended' };
        }
        return ad;
      });

      // Atualizar no banco de dados se houver anúncios expirados
      if (expiredAdIds.length > 0) {
        await supabase
          .from('anuncios')
          .update({
            status: 'ended',
            completion_reason: 'duration_ended',
          })
          .in('id', expiredAdIds);
      }

      // Aplicar filtro após verificar expiração
      if (filter !== 'all') {
        if (filter === 'ended') {
          // Para 'ended', incluir anúncios com status 'ended' ou que expiraram por data
          updatedAds = updatedAds.filter((ad: any) => {
            const isEnded = ad.status === 'ended';
            const isExpired = ad.end_date && new Date(ad.end_date) < now;
            return isEnded || isExpired;
          });
        } else {
          updatedAds = updatedAds.filter((ad: any) => ad.status === filter);
        }
      }

      setAds(updatedAds);
    } catch (error: any) {
      console.error('Erro ao buscar anúncios:', error);
      addToast(t('common:error'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAds();
  }, [user.id, filter]);

  const handleDeleteAd = async () => {
    if (!adToDelete) return;

    try {
      const { data, error } = await supabase
        .from('anuncios')
        .delete()
        .eq('id', adToDelete)
        .eq('advertiser_id', user.id)
        .select();

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error(t('common:error'));
      }

      setAdToDelete(null);
      fetchMyAds();
    } catch (error: any) {
      addToast(error.message || t('common:error'), 'error');
    }
  };

  const handleToggleStatus = async () => {
    if (!adToPause) return;

    const newStatus = adToPause.status === 'active' ? 'paused' : 'active';

    try {
      const { error } = await supabase
        .from('anuncios')
        .update({ status: newStatus })
        .eq('id', adToPause.id)
        .eq('advertiser_id', user.id);

      if (error) throw error;

      setAdToPause(null);
      fetchMyAds();
    } catch (error: any) {
      addToast(t('common:error'), 'error');
    }
  };

  const handleEditAd = (ad: Ad) => {
    setEditingAd(ad);
    setIsEditModalOpen(true);
  };

  const handleUpgradePlan = (ad: Ad) => {
    // Usar navegação SPA sem reload
    const snapshot: NavigationSnapshot = {
      page: 'SelectAdPlan',
      activeAdId: ad.id,
    };

    pushHistoryState(snapshot);
    window.dispatchEvent(new CustomEvent('navigation', { detail: snapshot }));
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-900 text-green-200',
      paused: 'bg-yellow-900 text-yellow-200',
      ended: 'bg-gray-700 text-gray-300'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {t(`ads:myAds.status.${status}`)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap gap-2 md:gap-4 justify-between items-center">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {t('ads:myAds.title')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('ads:myAds.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center bg-secondary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors text-sm md:text-base whitespace-nowrap flex-shrink-0"
        >
          {t('ads:dashboard.createAd')}
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-1 md:gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-2 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-colors text-xs md:text-sm ${filter === 'all'
            ? 'bg-primary text-white'
            : 'bg-light-card dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
        >
          <span className="hidden sm:inline">{t('ads:filter.allAds')} ({allAdsCount})</span>
          <span className="sm:hidden">{t('ads:filter.allAds')} ({allAdsCount})</span>
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-2 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-colors text-xs md:text-sm ${filter === 'active'
            ? 'bg-primary text-white'
            : 'bg-light-card dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
        >
          {t('ads:myAds.status.active')}
        </button>
        <button
          onClick={() => setFilter('paused')}
          className={`px-2 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-colors text-xs md:text-sm ${filter === 'paused'
            ? 'bg-primary text-white'
            : 'bg-light-card dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
        >
          {t('ads:myAds.status.paused')}
        </button>
        <button
          onClick={() => setFilter('ended')}
          className={`px-2 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-colors text-xs md:text-sm ${filter === 'ended'
            ? 'bg-primary text-white'
            : 'bg-light-card dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
        >
          {t('ads:myAds.status.ended')}
        </button>
      </div>

      {/* Modal de Criar Anúncio */}
      <CreateAdModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        user={user}
        onAdCreated={fetchMyAds}
      />

      {editingAd && (
        <EditAdModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingAd(null);
          }}
          user={user}
          ad={editingAd}
          onAdUpdated={fetchMyAds}
        />
      )}

      {/* Lista de Anúncios */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-light-card dark:bg-dark-card p-12 rounded-lg shadow-sm border border-light-border dark:border-dark-border text-center flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">📢</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('ads:myAds.noAds')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {filter === 'all'
              ? t('ads:myAds.noAdsDesc')
              : t('ads:myAds.noAdsDesc')
            }
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center bg-secondary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors
              /* Mobile adjustments: smaller size */
              md:py-2 md:px-4 py-1.5 px-3 text-sm md:text-base"
          >
            {t('ads:dashboard.createFirstAd')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="bg-light-card dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border overflow-hidden"
            >
              {/* Imagem/Vídeo */}
              {ad.image_url && (
                <img
                  src={ad.image_url}
                  alt={ad.title}
                  className="w-full h-32 md:h-48 object-cover"
                />
              )}
              {ad.video_url && !ad.image_url && (
                <video
                  src={ad.video_url}
                  className="w-full h-32 md:h-48 object-cover"
                  controls
                />
              )}

              {/* Conteúdo */}
              <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                {/* Título e Status */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                        {ad.title}
                      </h3>
                      <div className="flex items-center gap-1 md:gap-2">
                        {getStatusBadge(ad.status)}
                        <AdActionsMenu
                          ad={ad}
                          onEdit={handleEditAd}
                          onUpgradePlan={handleUpgradePlan}
                          onDelete={(ad) => setAdToDelete(ad.id)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {ad.description}
                </p>

                {/* Métricas */}
                <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <EyeIcon />
                    <span>{ad.views_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HeartIcon />
                    <span>{ad.likes_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShareIcon />
                    <span>{ad.shares_count || 0}</span>
                  </div>
                </div>

                {/* Datas e Budget */}
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col gap-1">
                    {ad.start_date && (
                      <span>{t('common:start')}: {formatDate(new Date(ad.start_date))}</span>
                    )}
                    {ad.end_date && (
                      <span>{t('common:end')}: {formatDate(new Date(ad.end_date))}</span>
                    )}
                  </div>
                  {ad.budget !== undefined && ad.budget !== null && (
                    <div className="text-right">
                      <span className="block">{t('common:remaining')}:</span>
                      <span className={`font-bold ${(() => {
                          // Verificar se está encerrado por status ou por data
                          const isEnded = ad.status === 'ended';
                          const isExpired = ad.end_date && new Date(ad.end_date) < new Date();
                          const shouldShowZero = isEnded || isExpired;

                          if (shouldShowZero) {
                            return 'text-red-500';
                          }

                          let remaining = ad.budget;

                          // Cálculo para pacotes baseados em tempo
                          if (ad.payment_type === 'package' && ad.start_date && ad.end_date && ad.status === 'active') {
                            const start = new Date(ad.start_date).getTime();
                            const end = new Date(ad.end_date).getTime();
                            const now = new Date().getTime();
                            const totalDuration = end - start;
                            const elapsed = now - start;

                            if (totalDuration > 0) {
                              const percentageRemaining = Math.max(0, 1 - (elapsed / totalDuration));
                              remaining = ad.budget * percentageRemaining;
                            }
                          }

                          return remaining <= 0 ? 'text-red-500' : 'text-green-600 dark:text-green-400';
                        })()
                        }`}>
                        {formatCurrency((() => {
                          // Verificar se está encerrado por status ou por data
                          const isEnded = ad.status === 'ended';
                          const isExpired = ad.end_date && new Date(ad.end_date) < new Date();
                          const shouldShowZero = isEnded || isExpired;

                          if (shouldShowZero) {
                            return 0;
                          }

                          let remaining = ad.budget;

                          if (ad.payment_type === 'package' && ad.start_date && ad.end_date && ad.status === 'active') {
                            const start = new Date(ad.start_date).getTime();
                            const end = new Date(ad.end_date).getTime();
                            const now = new Date().getTime();
                            const totalDuration = end - start;
                            const elapsed = now - start;

                            if (totalDuration > 0) {
                              const percentageRemaining = Math.max(0, 1 - (elapsed / totalDuration));
                              remaining = ad.budget * percentageRemaining;
                            }
                          }

                          return remaining;
                        })())}
                      </span>
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="flex gap-2 pt-2 border-t border-light-border dark:border-dark-border">
                  <button
                    onClick={() => setAdToPause({ id: ad.id, status: ad.status })}
                    disabled={ad.status === 'ended' || (ad.status === 'paused' && ad.approval_status !== 'approved')}
                    className={`flex-1 px-2 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-colors text-xs md:text-sm ${ad.status === 'ended'
                      ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                      : ad.status === 'paused' && ad.approval_status !== 'approved'
                        ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                        : ad.status === 'active'
                          ? 'bg-yellow-900 text-yellow-200 hover:bg-yellow-800'
                          : 'bg-green-900 text-green-200 hover:bg-green-800'
                      }`}
                    title={ad.status === 'paused' && ad.approval_status !== 'approved' ? t('ads:actions.waitingApproval') : ''}
                  >
                    {ad.status === 'active'
                      ? t('ads:actions.pause')
                      : ad.status === 'paused'
                        ? (ad.approval_status !== 'approved' ? t('ads:actions.waitingApproval') : t('ads:actions.activate'))
                        : t('ads:actions.ended')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={!!adToDelete}
        onClose={() => setAdToDelete(null)}
        onConfirm={handleDeleteAd}
        title={t('ads:actions.deleteTitle')}
        message={t('ads:actions.deleteMessage')}
        confirmText={t('ads:actions.deleteConfirm')}
        cancelText={t('common:cancel')}
        isDestructive={true}
      />

      {/* Modal de Confirmação de Pausar/Ativar */}
      <ConfirmationModal
        isOpen={!!adToPause}
        onClose={() => setAdToPause(null)}
        onConfirm={handleToggleStatus}
        title={adToPause?.status === 'active' ? t('ads:actions.pauseTitle') : t('ads:actions.activateTitle')}
        message={
          adToPause?.status === 'active'
            ? t('ads:actions.pauseMessage')
            : t('ads:actions.activateMessage')
        }
        confirmText={adToPause?.status === 'active' ? t('ads:actions.pauseConfirm') : t('ads:actions.activateConfirm')}
        cancelText={t('common:cancel')}
        isDestructive={false}
      />
    </div>
  );
};

export default MyAds;

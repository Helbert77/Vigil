import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/integrations/supabase/client';
import { approveAd, rejectAd } from '@/src/services/adApprovalService';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/src/contexts/LanguageContext';

interface AdApprovalQueueProps {
  user: User;
  onAdProcessed?: () => void;
}

interface PendingAd {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  video_url: string | null;
  link_url: string | null;
  advertiser_id: string;
  advertiser_name: string;
  advertiser_avatar: string | null;
  payment_type: 'package' | 'cpm' | 'credits' | null;
  package_type: string | null;
  budget: number | null;
  cpm_rate: number | null;
  max_impressions: number | null;
  payment_status: string;
  approval_status: string;
  created_at: string;
  stripe_payment_intent_id: string | null;
}

const AdApprovalQueue: React.FC<AdApprovalQueueProps> = ({ user, onAdProcessed }) => {
  const { addToast } = useToast();
  const { t } = useTranslation(['ads', 'admin']);
  const { language } = useLanguage();
  const [ads, setAds] = useState<PendingAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState<PendingAd | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPendingAds = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('anuncios')
        .select('*')
        .eq('approval_status', 'pending_approval')
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }
      
      setAds(data as PendingAd[] || []);
    } catch (error: any) {
      console.error('Erro ao buscar anúncios pendentes:', error);
      addToast(t('ads:approvalQueue.errors.fetch'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Verificar se o usuário tem permissão
    if (user.role !== 'admin' && user.role !== 'moderator') {
      addToast(t('ads:approvalQueue.errors.permission'), 'error');
      return;
    }

    fetchPendingAds();
  }, [user.role, t]);


  const handleApprove = async () => {
    if (!selectedAd) return;

    setIsProcessing(true);
    try {
      const { error } = await approveAd({
        adId: selectedAd.id,
        adminId: user.id
      });

      if (error) throw new Error(error);

      // Notificação já é enviada pelo serviço approveAd

      // addToast('Anúncio aprovado com sucesso', 'success');
      setShowApproveModal(false);
      setSelectedAd(null);
      fetchPendingAds();
      if (onAdProcessed) onAdProcessed();
    } catch (error: any) {
      addToast(t('ads:approvalQueue.errors.approve', { error: error.message }), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedAd) return;

    if (!rejectionReason.trim()) {
      addToast(t('ads:approvalQueue.errors.reasonRequired'), 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await rejectAd({
        adId: selectedAd.id,
        adminId: user.id,
        reason: rejectionReason.trim()
      });

      if (error) throw new Error(error);

      // Notificação já é enviada pelo serviço rejectAd

      // addToast('Anúncio rejeitado com sucesso', 'success');
      setShowRejectModal(false);
      setSelectedAd(null);
      setRejectionReason('');
      fetchPendingAds();
      if (onAdProcessed) onAdProcessed();
    } catch (error: any) {
      addToast(t('ads:approvalQueue.errors.reject', { error: error.message }), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaymentTypeBadge = (ad: PendingAd) => {
    if (ad.payment_type === 'package' && ad.package_type) {
      return (
        <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-xs font-medium">
          {t('ads:approvalQueue.badges.package', { type: ad.package_type.toUpperCase() })}
        </span>
      );
    }
    if (ad.payment_type === 'cpm') {
      return (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
          {t('ads:approvalQueue.badges.cpm', { rate: ad.cpm_rate?.toFixed(2), budget: ad.budget?.toFixed(2) })}
        </span>
      );
    }
    if (ad.payment_type === 'credits') {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">
          {t('ads:approvalQueue.badges.credits', { budget: ad.budget?.toFixed(2) })}
        </span>
      );
    }
    return null;
  };

  if (user.role !== 'admin' && user.role !== 'moderator') {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg text-center">
        <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">
          {t('admin:accessDenied')}
        </h2>
        <p className="text-red-600 dark:text-red-300">
          {t('ads:approvalQueue.errors.permission')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap gap-2 md:gap-4 justify-between items-center">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {t('ads:approvalQueue.title')}
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-0.5 md:mt-1">
            {t('ads:approvalQueue.subtitle', { count: ads.length })}
          </p>
        </div>
        <button
          onClick={fetchPendingAds}
          className="bg-primary hover:bg-gray-600 text-white font-medium px-3 md:px-6 py-1.5 md:py-2 rounded-lg transition-colors text-xs md:text-base whitespace-nowrap flex-shrink-0"
          disabled={isLoading}
        >
          {isLoading ? t('ads:approvalQueue.loading') : t('ads:approvalQueue.refresh')}
        </button>
      </div>

      {/* Lista de Anúncios Pendentes */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-light-card dark:bg-dark-card p-12 rounded-lg shadow-sm border border-light-border dark:border-dark-border text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('ads:approvalQueue.noPendingAds')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('ads:approvalQueue.noPendingAdsDesc')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="bg-light-card dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border overflow-hidden hover:shadow-lg transition-shadow"
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
                {/* Título */}
                <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                  {ad.title}
                </h3>

                {/* Badge de Tipo de Pagamento */}
                <div className="flex flex-wrap gap-1 md:gap-2">
                  {getPaymentTypeBadge(ad)}
                </div>

                {/* Descrição */}
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {ad.description}
                </p>

                {/* Informações do Anunciante */}
                <div className="flex items-center gap-2 pt-2 border-t border-light-border dark:border-dark-border">
                  {ad.advertiser_avatar ? (
                    <img
                      src={ad.advertiser_avatar}
                      alt={ad.advertiser_name}
                      className="w-6 h-6 md:w-8 md:h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary text-white flex items-center justify-center text-[10px] md:text-xs font-bold">
                      {ad.advertiser_name[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-gray-900 dark:text-white truncate">
                      {ad.advertiser_name}
                    </p>
                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
                      {new Date(ad.created_at).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Link */}
                {ad.link_url && (
                  <a
                    href={ad.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] md:text-xs text-blue-600 dark:text-blue-400 hover:underline block truncate"
                  >
                    🔗 {ad.link_url}
                  </a>
                )}

                {/* Ações */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedAd(ad);
                      setShowApproveModal(true);
                    }}
                    className="flex-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 font-medium px-2 md:px-4 py-1.5 md:py-2 rounded-lg transition-colors text-xs md:text-sm"
                  >
                    {t('ads:approvalQueue.actions.approve')}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAd(ad);
                      setShowRejectModal(true);
                    }}
                    className="flex-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 font-medium px-2 md:px-4 py-1.5 md:py-2 rounded-lg transition-colors text-xs md:text-sm"
                  >
                    {t('ads:approvalQueue.actions.reject')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmação de Aprovação */}
      <ConfirmationModal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setSelectedAd(null);
        }}
        onConfirm={handleApprove}
        title={t('ads:approvalQueue.modals.approveTitle')}
        message={t('ads:approvalQueue.modals.approveMessage', { title: selectedAd?.title })}
        confirmText={isProcessing ? t('ads:approvalQueue.actions.approving') : t('ads:approvalQueue.actions.confirmApprove')}
        cancelText={t('ads:approvalQueue.actions.cancel')}
        isDestructive={false}
      />

      {/* Modal de Rejeição */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('ads:approvalQueue.modals.rejectTitle')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('ads:approvalQueue.modals.rejectMessage', { title: selectedAd?.title })}
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={t('ads:approvalQueue.modals.rejectPlaceholder')}
              className="w-full px-4 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={4}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
              {rejectionReason.length}/500
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedAd(null);
                  setRejectionReason('');
                }}
                disabled={isProcessing}
                className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {t('ads:approvalQueue.actions.cancel')}
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !rejectionReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? t('ads:approvalQueue.actions.rejecting') : t('ads:approvalQueue.actions.confirmReject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdApprovalQueue;
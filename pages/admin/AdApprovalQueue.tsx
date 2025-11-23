import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/integrations/supabase/client';
import { approveAd, rejectAd } from '@/src/services/adApprovalService';
import ConfirmationModal from '@/components/common/ConfirmationModal';

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
  payment_type: 'package' | 'cpm' | null;
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

      if (error) throw error;

      setAds(data as PendingAd[] || []);
    } catch (error: any) {
      console.error('Erro ao buscar anúncios pendentes:', error);
      addToast('Erro ao carregar anúncios pendentes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Verificar se o usuário tem permissão
    if (user.role !== 'admin' && user.role !== 'moderator') {
      addToast('Você não tem permissão para acessar esta página', 'error');
      return;
    }

    fetchPendingAds();
  }, [user.role]);

  const sendNotification = async (recipientId: string, type: 'ad_approved' | 'ad_rejected', adId: string, reason?: string) => {
    try {
      await supabase.from('notifications').insert({
        recipient_id: recipientId,
        actor_id: user.id, // Admin/Moderator
        type: type,
        metadata: {
          ad_id: adId,
          reason: reason
        }
      });
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  };

  const handleApprove = async () => {
    if (!selectedAd) return;

    setIsProcessing(true);
    try {
      const { error } = await approveAd({
        adId: selectedAd.id,
        adminId: user.id
      });

      if (error) throw new Error(error);

      // Enviar notificação
      await sendNotification(selectedAd.advertiser_id, 'ad_approved', selectedAd.id);

      // addToast('Anúncio aprovado com sucesso', 'success');
      setShowApproveModal(false);
      setSelectedAd(null);
      fetchPendingAds();
      if (onAdProcessed) onAdProcessed();
    } catch (error: any) {
      addToast(`Erro ao aprovar anúncio: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedAd) return;

    if (!rejectionReason.trim()) {
      addToast('Por favor, informe o motivo da rejeição', 'error');
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

      // Enviar notificação
      await sendNotification(selectedAd.advertiser_id, 'ad_rejected', selectedAd.id, rejectionReason.trim());

      // addToast('Anúncio rejeitado com sucesso', 'success');
      setShowRejectModal(false);
      setSelectedAd(null);
      setRejectionReason('');
      fetchPendingAds();
      if (onAdProcessed) onAdProcessed();
    } catch (error: any) {
      addToast(`Erro ao rejeitar anúncio: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaymentTypeBadge = (ad: PendingAd) => {
    if (ad.payment_type === 'package' && ad.package_type) {
      return (
        <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-xs font-medium">
          📦 Pacote {ad.package_type.toUpperCase()}
        </span>
      );
    }
    if (ad.payment_type === 'cpm') {
      return (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
          💰 CPM €{ad.cpm_rate?.toFixed(2)} - Budget €{ad.budget?.toFixed(2)}
        </span>
      );
    }
    return null;
  };

  if (user.role !== 'admin' && user.role !== 'moderator') {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg text-center">
        <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">
          Acesso Negado
        </h2>
        <p className="text-red-600 dark:text-red-300">
          Apenas administradores e moderadores podem acessar esta página.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Aprovar Anúncios
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {ads.length} anúncio{ads.length !== 1 ? 's' : ''} aguardando aprovação
          </p>
        </div>
        <button
          onClick={fetchPendingAds}
          className="bg-primary hover:bg-gray-600 text-white font-medium px-6 py-2 rounded-lg transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Carregando...' : 'Atualizar'}
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
            Nenhum anúncio pendente
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Todos os anúncios pagos foram aprovados ou rejeitados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                  className="w-full h-48 object-cover"
                />
              )}
              {ad.video_url && !ad.image_url && (
                <video
                  src={ad.video_url}
                  className="w-full h-48 object-cover"
                  controls
                />
              )}

              {/* Conteúdo */}
              <div className="p-4 space-y-3">
                {/* Título */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {ad.title}
                </h3>

                {/* Badge de Tipo de Pagamento */}
                <div className="flex flex-wrap gap-2">
                  {getPaymentTypeBadge(ad)}
                </div>

                {/* Descrição */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {ad.description}
                </p>

                {/* Informações do Anunciante */}
                <div className="flex items-center gap-2 pt-2 border-t border-light-border dark:border-dark-border">
                  {ad.advertiser_avatar ? (
                    <img
                      src={ad.advertiser_avatar}
                      alt={ad.advertiser_name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                      {ad.advertiser_name[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {ad.advertiser_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(ad.created_at).toLocaleDateString('pt-BR', {
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
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline block truncate"
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
                    className="flex-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    ✓ Aprovar
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAd(ad);
                      setShowRejectModal(true);
                    }}
                    className="flex-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    ✗ Rejeitar
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
        title="Aprovar Anúncio?"
        message={`Tem certeza que deseja aprovar o anúncio "${selectedAd?.title}"? Ele será ativado e começará a ser exibido para os usuários.`}
        confirmText={isProcessing ? 'Aprovando...' : 'Sim, aprovar'}
        cancelText="Cancelar"
        isDestructive={false}
      />

      {/* Modal de Rejeição */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Rejeitar Anúncio
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Por favor, informe o motivo da rejeição do anúncio "{selectedAd?.title}":
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ex: Conteúdo inadequado, violação das políticas, imagens de baixa qualidade..."
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
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !rejectionReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Rejeitando...' : 'Rejeitar Anúncio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdApprovalQueue;


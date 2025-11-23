import React, { useState, useEffect } from 'react';
import { processAdRefund } from '@/src/services/refundService';
import { supabase } from '@/integrations/supabase/client';
import { Ad, User } from '@/types';
import EditAdModal from './EditAdModal';

interface RejectedAdModalProps {
    isOpen: boolean;
    onClose: () => void;
    adId: string;
    user: User;
    onRefundSuccess?: () => void;
}

const RejectedAdModal: React.FC<RejectedAdModalProps> = ({
    isOpen,
    onClose,
    adId,
    user,
    onRefundSuccess
}) => {
    const [ad, setAd] = useState<Ad | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen && adId) {
            fetchAd();
        }
    }, [isOpen, adId]);

    const fetchAd = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('anuncios')
            .select('*')
            .eq('id', adId)
            .single();

        if (error) {
            // console.error('Error fetching ad:', error);
            setError('Erro ao carregar detalhes do anúncio.');
        } else {
            setAd(data);
        }
        setLoading(false);
    };

    const handleRefund = async () => {
        if (!ad) return;

        setIsProcessing(true);
        setError(null);

        try {
            await processAdRefund(ad.id, user.id);
            setSuccess(true);

            // Atualizar o status do anúncio localmente
            setAd(prev => prev ? { ...prev, payment_status: 'refunded', status: 'ended' } : null);

            setTimeout(() => {
                onRefundSuccess?.();
                // Não fechar automaticamente para deixar o usuário ver a mensagem de sucesso
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Erro ao processar reembolso');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    const handleAdUpdated = () => {
        fetchAd(); // Recarregar dados do anúncio
        // Talvez fechar o modal de rejeição se o status mudar para pendente?
        // Por enquanto, apenas recarregamos.
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : !ad ? (
                        <div className="text-center py-8">
                            <p className="text-red-500">Erro ao carregar anúncio.</p>
                            <button onClick={onClose} className="mt-4 text-gray-500 hover:text-gray-700">Fechar</button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-center">
                            {/* Ícone de Alerta */}
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Anúncio Rejeitado
                            </h3>

                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                O anúncio <strong>"{ad.title}"</strong> não foi aprovado.
                            </p>

                            {/* Motivo da Rejeição */}
                            <div className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg p-4 mb-6 text-left">
                                <p className="text-xs font-bold text-red-800 dark:text-red-200 mb-1 uppercase tracking-wide">
                                    Motivo da Rejeição:
                                </p>
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    {ad.rejection_reason || 'Violação das diretrizes da comunidade.'}
                                </p>
                            </div>

                            {/* Mensagens de Status */}
                            {error && (
                                <div className="w-full bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="w-full bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        Reembolso solicitado com sucesso! O valor será estornado em 5-10 dias úteis.
                                    </p>
                                </div>
                            )}

                            {/* Botões de Ação */}
                            <div className="flex flex-col w-full gap-3">
                                {!success && ad.payment_status !== 'refunded' && (
                                    <>
                                        <button
                                            onClick={handleEdit}
                                            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            Editar e Corrigir
                                        </button>

                                        <div className="relative flex py-2 items-center">
                                            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                                            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">OU</span>
                                            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                                        </div>

                                        <button
                                            onClick={handleRefund}
                                            disabled={isProcessing}
                                            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-3 px-4 rounded-lg transition-colors"
                                        >
                                            {isProcessing ? 'Processando...' : 'Solicitar Reembolso'}
                                        </button>
                                    </>
                                )}

                                <button
                                    onClick={onClose}
                                    className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors mt-2"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {ad && (
                <EditAdModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    user={user}
                    ad={ad}
                    onAdUpdated={handleAdUpdated}
                />
            )}
        </>
    );
};

export default RejectedAdModal;

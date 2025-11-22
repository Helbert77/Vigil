import React, { useState } from 'react';
import { processAdRefund } from '@/src/services/api';

interface RejectedAdModalProps {
    isOpen: boolean;
    onClose: () => void;
    ad: {
        id: string;
        title: string;
        rejection_reason?: string;
        payment_status: string;
    };
    userId: string;
    onRefundSuccess?: () => void;
}

const RejectedAdModal: React.FC<RejectedAdModalProps> = ({
    isOpen,
    onClose,
    ad,
    userId,
    onRefundSuccess
}) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleRefund = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            await processAdRefund(ad.id, userId);
            setSuccess(true);

            setTimeout(() => {
                onRefundSuccess?.();
                onClose();
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Erro ao processar reembolso');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
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
                        {ad.payment_status !== 'refunded' && !success && (
                            <button
                                onClick={handleRefund}
                                disabled={isProcessing}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                            >
                                {isProcessing ? 'Processando...' : '💸 Solicitar Reembolso'}
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-3 px-4 rounded-lg transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RejectedAdModal;

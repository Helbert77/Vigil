import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { AD_PRICING_CONFIG, formatPrice, calculateCreditWithBonus } from '@/src/config/adPricing';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/integrations/supabase/client';

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onCreditSelect?: (amount: number) => void;
}

const XIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const BuyCreditsModal: React.FC<BuyCreditsModalProps> = ({ isOpen, onClose, user, onCreditSelect }) => {
  const { addToast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchUserCredits();
      fetchTransactions();
    }
  }, [isOpen, user.id]);

  const fetchUserCredits = async () => {
    const { data, error } = await supabase
      .from('user_ad_credits')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setBalance(data.balance);
    }
  };

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('ad_credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setTransactions(data);
    }
  };

  const handleBuyCredits = async () => {
    if (!selectedAmount) {
      addToast('Selecione um valor', 'error');
      return;
    }

    // Se há callback de seleção, usar o fluxo unificado
    if (onCreditSelect) {
      onCreditSelect(selectedAmount);
      onClose();
      return;
    }

    // Fluxo direto (mantido para compatibilidade)
    setIsLoading(true);

    try {
      // Usar o método nativo do Supabase para chamar Edge Functions
      const { data, error } = await supabase.functions.invoke('create-ad-checkout-session', {
        body: {
          userId: user.id,
          paymentType: 'credits',
          creditAmount: selectedAmount,
          successUrl: `${window.location.origin}/advertising/my-ads?credits=success`,
          cancelUrl: `${window.location.origin}/advertising/my-ads?credits=canceled`,
        },
      });

      if (error) {
        throw new Error(`Erro na requisição: ${error.message}`);
      }

      if (!data) {
        throw new Error('Resposta vazia do servidor');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        window.location.href = data.url;
      }

    } catch (error: any) {
      addToast(error.message || 'Erro ao processar pagamento', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Comprar Créditos
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Use créditos para criar anúncios personalizados com orçamento flexível
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <XIcon />
          </button>
        </div>

        <div className="p-6">
          {/* Saldo atual */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white mb-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Saldo Atual</p>
                <p className="text-4xl font-bold">{formatPrice(balance)}</p>
              </div>
              <div className="text-5xl">💰</div>
            </div>
          </div>

          {/* Opções de créditos */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Escolha o valor
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {AD_PRICING_CONFIG.credits.options.map((option) => {
                const totalWithBonus = calculateCreditWithBonus(option.value);
                const isSelected = selectedAmount === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedAmount(option.value)}
                    disabled={isLoading}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all duration-200
                      ${isSelected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500'
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700'
                      }
                      ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                    `}
                  >
                    {option.bonus && (
                      <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        +{option.bonus}%
                      </span>
                    )}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(option.value)}
                      </div>
                      {option.bonus && (
                        <div className="text-sm text-green-600 dark:text-green-400 font-semibold mt-1">
                          Recebe {formatPrice(totalWithBonus)}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Informações sobre créditos */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Como usar os créditos?
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-7">
              <li>• Use créditos para criar anúncios CPM personalizados</li>
              <li>• 1 crédito = €1,00</li>
              <li>• CPM: €8,00 por 1.000 impressões</li>
              <li>• Créditos não expiram</li>
              <li>• Bônus automático em compras acima de €50</li>
            </ul>
          </div>

          {/* Histórico de transações */}
          {transactions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Últimas Transações
              </h3>
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`
                      text-lg font-bold
                      ${transaction.amount > 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                      }
                    `}>
                      {transaction.amount > 0 ? '+' : ''}{formatPrice(Math.abs(transaction.amount))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleBuyCredits}
              disabled={isLoading || !selectedAmount}
              className={`
                flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200
                ${selectedAmount && !isLoading
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isLoading
                ? 'Processando...'
                : selectedAmount
                  ? `Comprar ${formatPrice(selectedAmount)}`
                  : 'Selecione um valor'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyCreditsModal;


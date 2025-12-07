import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/integrations/supabase/client';
import { AD_PRICING_CONFIG, getPackageArray, PackageType, formatPrice, calculateCreditWithBonus } from '@/src/config/adPricing';
import AdPackageCard from '@/components/advertising/AdPackageCard';
import CPMCalculator from '@/components/advertising/CPMCalculator';
import { pushHistoryState } from '@/src/utils/history';

interface SelectAdPlanProps {
  user: User;
}

const SelectAdPlan: React.FC<SelectAdPlanProps> = ({ user }) => {
  const { addToast } = useToast();

  // Obter ad_id da URL
  const urlParams = new URLSearchParams(window.location.search);
  const adId = urlParams.get('ad_id');

  const [adData, setAdData] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState<'packages' | 'cpm' | 'credits'>('packages');
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [selectedCpmBudget, setSelectedCpmBudget] = useState<number | null>(null);
  const [selectedCreditAmount, setSelectedCreditAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!adId) {
      addToast('ID do anúncio não encontrado', 'error');
      window.location.href = '/?page=MyAds';
      return;
    }

    fetchAdData();
  }, [adId]);

  useEffect(() => {
    if (selectedTab === 'credits') {
      fetchUserCredits();
      fetchTransactions();
    }
  }, [selectedTab, user.id]);

  const fetchAdData = async () => {
    if (!adId) return;

    const { data, error } = await supabase
      .from('anuncios')
      .select('*')
      .eq('id', adId)
      .single();

    if (error || !data) {
      addToast('Anúncio não encontrado', 'error');
      window.location.href = '/?page=MyAds';
      return;
    }

    if (data.advertiser_id !== user.id) {
      addToast('Você não tem permissão para acessar este anúncio', 'error');
      window.location.href = '/?page=MyAds';
      return;
    }

    setAdData(data);
  };

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

  const handleProceedToPayment = async () => {
    // Validações baseadas no que foi selecionado
    if (selectedTab === 'packages' && !selectedPackage) {
      addToast('Selecione um pacote', 'error');
      return;
    }

    if (selectedTab === 'cpm' && !selectedCpmBudget) {
      addToast('Defina um orçamento', 'error');
      return;
    }

    if (selectedTab === 'credits' && !selectedCreditAmount) {
      addToast('Selecione um valor de créditos', 'error');
      return;
    }

    if (selectedTab === 'credits' && selectedCreditAmount) {
      // Usuário selecionou créditos na aba, processar como compra de créditos
      setIsLoading(true);

      try {
        const requestBody = {
          userId: user.id,
          adId: adId, // ✅ CORREÇÃO: Incluir adId para créditos
          paymentType: 'credits',
          creditAmount: selectedCreditAmount,
          successUrl: `${window.location.origin}/?page=PaymentSuccess&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/?page=SelectAdPlan&ad_id=${adId}`,
        };

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-ad-checkout-session`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro na requisição: ${response.status} - ${errorText || 'Resposta vazia'}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error(`Resposta inválida do servidor: ${text || 'Resposta não é JSON'}`);
        }

        const text = await response.text();
        if (!text || text.trim() === '') {
          throw new Error('Resposta vazia do servidor');
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          throw new Error(`Erro ao processar resposta: ${parseError instanceof Error ? parseError.message : 'JSON inválido'}`);
        }

        if (data.error) {
          throw new Error(data.error);
        }

        if (data.url) {
          window.location.href = data.url;
        }

      } catch (error: any) {
        addToast(error.message || 'Erro ao processar pagamento', 'error');
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);

    try {
      const requestBody = {
        userId: user.id,
        adId: adId,
        paymentType: selectedTab === 'packages' ? 'package' : 'cpm',
        ...(selectedPackage && { packageType: selectedPackage }),
        ...(selectedCpmBudget && { cpmBudget: selectedCpmBudget }),
        successUrl: `${window.location.origin}/?page=PaymentSuccess&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/?page=SelectAdPlan&ad_id=${adId}`,
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-ad-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na requisição: ${response.status} - ${errorText || 'Resposta vazia'}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Resposta inválida do servidor: ${text || 'Resposta não é JSON'}`);
      }

      const text = await response.text();
      if (!text || text.trim() === '') {
        throw new Error('Resposta vazia do servidor');
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Erro ao processar resposta: ${parseError instanceof Error ? parseError.message : 'JSON inválido'}`);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        window.location.href = data.url;
      }

    } catch (error: any) {
      addToast(error.message || 'Erro ao processar pagamento', 'error');
      setIsLoading(false);
    }
  };

  const handleBack = async () => {
    if (adId) {
      // Se o usuário voltar, excluímos o anúncio rascunho para não ficar "pendente" sem pagamento
      // Isso corrige o problema de anúncios criados sem checkout
      try {
        const { error } = await supabase
          .from('anuncios')
          .delete()
          .eq('id', adId)
          .eq('payment_status', 'pending'); // Garantir que só deleta se estiver pendente

        if (error) {
          console.error('Erro ao limpar anúncio rascunho:', error);
        } else {
          // console.log('Anúncio rascunho limpo com sucesso');
        }
      } catch (err) {
        console.error('Erro ao tentar excluir anúncio:', err);
      }
    }

    pushHistoryState({ page: 'MyAds' });
    window.dispatchEvent(new CustomEvent('navigation', { detail: { page: 'MyAds' } }));
  };

  if (!adData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const packages = getPackageArray();

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">


          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para Meus Anúncios
          </button>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Escolha o Plano do seu Anúncio
          </h1>
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-400">
            Selecione um pacote fixo, defina um orçamento personalizado ou compre créditos
          </p>
        </div>

        {/* Preview do anúncio */}
        <div className="bg-light-card dark:bg-dark-card rounded-xl p-6 shadow-lg mb-8 border border-light-border dark:border-dark-border">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Preview do Anúncio
          </h3>
          <div className="flex items-start space-x-4">
            {adData.image_url && (
              <img
                src={adData.image_url}
                alt={adData.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
            )}
            <div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                {adData.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {adData.description}
              </p>
              {adData.link_url && (
                <a
                  href={adData.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-blue-600 text-sm mt-2 inline-block"
                >
                  {adData.link_url}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 sm:space-x-4 mb-6 border-b border-light-border dark:border-dark-border">
          <button
            onClick={() => {
              setSelectedTab('packages');
              setSelectedCreditAmount(null);
            }}
            className={`
              pb-4 px-1 sm:px-2 font-semibold transition-colors relative text-xs sm:text-sm
              ${selectedTab === 'packages'
                ? 'text-primary dark:text-primary'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            <span className="hidden sm:inline">Pacotes Fixos</span>
            <span className="sm:hidden">Pacotes</span>
            {selectedTab === 'packages' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => {
              setSelectedTab('cpm');
              setSelectedCreditAmount(null);
            }}
            className={`
              pb-4 px-1 sm:px-2 font-semibold transition-colors relative text-xs sm:text-sm
              ${selectedTab === 'cpm'
                ? 'text-primary dark:text-primary'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            <span className="hidden sm:inline">Orçamento Personalizado (CPM)</span>
            <span className="sm:hidden">CPM</span>
            {selectedTab === 'cpm' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => {
              setSelectedTab('credits');
              setSelectedPackage(null);
              setSelectedCpmBudget(null);
            }}
            className={`
              pb-4 px-1 sm:px-2 font-semibold transition-colors relative text-xs sm:text-sm
              ${selectedTab === 'credits'
                ? 'text-primary dark:text-primary'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            <span className="hidden sm:inline">Comprar Créditos</span>
            <span className="sm:hidden">Créditos</span>
            {selectedTab === 'credits' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {/* Conteúdo das tabs */}
        {selectedTab === 'packages' ? (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {packages.map((pkg) => (
                <AdPackageCard
                  key={pkg.name}
                  package={pkg}
                  isSelected={selectedPackage === pkg.name}
                  onSelect={() => setSelectedPackage(pkg.name)}
                  disabled={isLoading}
                />
              ))}
            </div>

            <div className="bg-amber-50 dark:bg-yellow-900/20 border border-amber-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800 dark:text-yellow-200">
                💡 <strong>Dica:</strong> O pacote Ouro oferece o melhor custo-benefício com alcance máximo e recursos premium!
              </p>
            </div>
          </div>
        ) : selectedTab === 'cpm' ? (
          <div>
            <CPMCalculator
              onBudgetConfirm={(budget, impressions) => {
                setSelectedCpmBudget(budget);
              }}
              disabled={isLoading}
            />
          </div>
        ) : (
          <div>
            {/* Saldo atual */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white mb-6 shadow-lg">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {AD_PRICING_CONFIG.credits.options.map((option) => {
                  const totalWithBonus = calculateCreditWithBonus(option.value);
                  const isSelected = selectedCreditAmount === option.value;

                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedCreditAmount(option.value);
                        setSelectedPackage(null);
                        setSelectedCpmBudget(null);
                      }}
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
            <div className="bg-sky-50 dark:bg-blue-900/20 border border-sky-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-sky-900 dark:text-blue-100 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Como usar os créditos?
              </h4>
              <ul className="text-sm text-sky-800 dark:text-blue-200 space-y-1 ml-7">
                <li>• Use créditos para criar anúncios CPM personalizados</li>
                <li>• 1 crédito = €1,00</li>
                <li>• CPM: €6,00 por 1.000 impressões</li>
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
          </div>
        )}

        {/* Botão de prosseguir */}
        <div className="sticky bottom-0 bg-light-card dark:bg-dark-card border-t border-light-border dark:border-dark-border p-4 sm:p-6 -mx-4 sm:-mx-6 lg:-mx-8 shadow-lg">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-0 sm:justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Após o pagamento, seu anúncio será enviado para aprovação
              </p>
            </div>
            <button
              onClick={handleProceedToPayment}
              disabled={
                isLoading ||
                (selectedTab === 'packages' && !selectedPackage) ||
                (selectedTab === 'cpm' && !selectedCpmBudget) ||
                (selectedTab === 'credits' && !selectedCreditAmount)
              }
              className={`
                px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 w-full sm:w-auto
                ${(selectedPackage || selectedCpmBudget || selectedCreditAmount) && !isLoading
                  ? 'bg-primary hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isLoading
                ? 'Processando...'
                : selectedTab === 'credits' && selectedCreditAmount
                  ? `Comprar ${formatPrice(selectedCreditAmount)} em Créditos →`
                  : 'Prosseguir para Pagamento →'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectAdPlan;


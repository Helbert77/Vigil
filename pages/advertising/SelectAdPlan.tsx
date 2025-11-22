import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/integrations/supabase/client';
import { AD_PRICING_CONFIG, getPackageArray, PackageType } from '@/src/config/adPricing';
import AdPackageCard from '@/components/advertising/AdPackageCard';
import CPMCalculator from '@/components/advertising/CPMCalculator';
import BuyCreditsModal from '@/components/advertising/BuyCreditsModal';
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
  const [selectedTab, setSelectedTab] = useState<'packages' | 'cpm'>('packages');
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [selectedCpmBudget, setSelectedCpmBudget] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);

  useEffect(() => {
    if (!adId) {
      addToast('ID do anúncio não encontrado', 'error');
      window.location.href = '/?page=MyAds';
      return;
    }

    fetchAdData();
  }, [adId]);

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

  const handleProceedToPayment = async () => {
    if (selectedTab === 'packages' && !selectedPackage) {
      addToast('Selecione um pacote', 'error');
      return;
    }

    if (selectedTab === 'cpm' && !selectedCpmBudget) {
      addToast('Defina um orçamento', 'error');
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

      const data = await response.json();

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
          console.log('Anúncio rascunho limpo com sucesso');
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
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">


          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para Meus Anúncios
          </button>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Escolha o Plano do seu Anúncio
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Selecione um pacote fixo ou defina um orçamento personalizado
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
        <div className="flex space-x-4 mb-6 border-b border-light-border dark:border-dark-border">
          <button
            onClick={() => setSelectedTab('packages')}
            className={`
              pb-4 px-2 font-semibold transition-colors relative
              ${selectedTab === 'packages'
                ? 'text-primary dark:text-primary'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            Pacotes Fixos
            {selectedTab === 'packages' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setSelectedTab('cpm')}
            className={`
              pb-4 px-2 font-semibold transition-colors relative
              ${selectedTab === 'cpm'
                ? 'text-primary dark:text-primary'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            Orçamento Personalizado (CPM)
            {selectedTab === 'cpm' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {/* Conteúdo das tabs */}
        {selectedTab === 'packages' ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                💡 <strong>Dica:</strong> O pacote Ouro oferece o melhor custo-benefício com alcance máximo e recursos premium!
              </p>
            </div>
          </div>
        ) : (
          <div>
            <CPMCalculator
              onBudgetConfirm={(budget, impressions) => {
                setSelectedCpmBudget(budget);
              }}
              disabled={isLoading}
            />
          </div>
        )}

        {/* Botão de comprar créditos */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-1">
                Prefere usar créditos?
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Compre créditos e use quando quiser criar novos anúncios CPM
              </p>
            </div>
            <button
              onClick={() => setIsBuyCreditsOpen(true)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
            >
              Comprar Créditos
            </button>
          </div>
        </div>

        {/* Botão de prosseguir */}
        <div className="sticky bottom-0 bg-light-card dark:bg-dark-card border-t border-light-border dark:border-dark-border p-6 -mx-4 sm:-mx-6 lg:-mx-8 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Após o pagamento, seu anúncio será enviado para aprovação
              </p>
            </div>
            <button
              onClick={handleProceedToPayment}
              disabled={isLoading || (selectedTab === 'packages' && !selectedPackage) || (selectedTab === 'cpm' && !selectedCpmBudget)}
              className={`
                px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200
                ${(selectedPackage || selectedCpmBudget) && !isLoading
                  ? 'bg-primary hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isLoading
                ? 'Processando...'
                : 'Prosseguir para Pagamento →'
              }
            </button>
          </div>
        </div>
      </div>

      {/* Modal de compra de créditos */}
      <BuyCreditsModal
        isOpen={isBuyCreditsOpen}
        onClose={() => setIsBuyCreditsOpen(false)}
        user={user}
      />
    </div>
  );
};

export default SelectAdPlan;


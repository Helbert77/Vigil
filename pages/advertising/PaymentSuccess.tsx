import React, { useEffect, useState } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice, formatNumber } from '@/src/config/adPricing';

interface PaymentSuccessProps {
  user: User;
}

const CheckCircleIcon = () => (
  <svg className="w-24 h-24 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ user }) => {
  const [adData, setAdData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Obter session_id da URL
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      // Redirecionar para MyAds usando o sistema de navegação do App
      window.location.href = '/?page=MyAds';
      return;
    }

    fetchAdData();
  }, [sessionId]);

  const fetchAdData = async () => {
    try {
      const { data, error } = await supabase
        .from('anuncios')
        .select('*')
        .eq('stripe_session_id', sessionId)
        .single();

      if (error || !data) {
        console.error('Ad not found');
        window.location.href = '/?page=MyAds';
        return;
      }

      setAdData(data);
    } catch (error) {
      console.error('Error fetching ad:', error);
      window.location.href = '/?page=MyAds';
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!adData) return null;

  const getPackageInfo = () => {
    if (adData.payment_type === 'package' && adData.package_type) {
      return {
        type: 'Pacote',
        name: adData.package_type.charAt(0).toUpperCase() + adData.package_type.slice(1),
        duration: Math.round((new Date(adData.end_date).getTime() - new Date(adData.start_date).getTime()) / (1000 * 60 * 60 * 24)),
        impressions: adData.max_impressions,
      };
    } else if (adData.payment_type === 'cpm') {
      return {
        type: 'CPM Personalizado',
        budget: adData.budget,
        impressions: Math.floor((adData.budget / 8) * 1000),
      };
    }
    return null;
  };

  const packageInfo = getPackageInfo();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Cartão principal */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Ícone de sucesso */}
          <CheckCircleIcon />
          
          {/* Mensagem principal */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mt-6 mb-3">
            Pagamento Realizado!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-8">
            Seu anúncio foi criado com sucesso
          </p>

          {/* Alerta de aprovação */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  Aguardando Aprovação
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Seu anúncio passará por uma análise de um moderador antes de começar a ser exibido.
                  Você receberá uma notificação assim que for aprovado.
                </p>
              </div>
            </div>
          </div>

          {/* Resumo do anúncio */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Resumo do Anúncio
            </h2>
            
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Título:</span>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {adData.title}
                </p>
              </div>

              {adData.image_url && (
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Imagem:</span>
                  <img
                    src={adData.image_url}
                    alt={adData.title}
                    className="mt-2 w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              {packageInfo && (
                <>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Plano:</span>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {packageInfo.type}
                        {packageInfo.name && ` ${packageInfo.name}`}
                      </p>
                    </div>
                    
                    {packageInfo.duration && (
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Duração:</span>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {packageInfo.duration} dias
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Impressões:</span>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatNumber(packageInfo.impressions)}
                      </p>
                    </div>
                    
                    {packageInfo.budget && (
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Orçamento:</span>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatPrice(packageInfo.budget)}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Próximos passos */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              📋 Próximos Passos
            </h3>
            <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-start">
                <span className="font-semibold mr-2">1.</span>
                <span>Um moderador revisará seu anúncio (geralmente em até 24 horas)</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">2.</span>
                <span>Você receberá uma notificação quando for aprovado</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">3.</span>
                <span>Seu anúncio começará a ser exibido automaticamente</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">4.</span>
                <span>Acompanhe as métricas na página "Meus Anúncios"</span>
              </li>
            </ol>
          </div>

          {/* Botão de ação */}
          <button
            onClick={() => { window.location.href = '/?page=MyAds'; }}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Ver Meus Anúncios
          </button>

          {/* Link para suporte */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Alguma dúvida?{' '}
            <a href="/support" className="text-primary-600 hover:text-primary-700 font-medium">
              Entre em contato com o suporte
            </a>
          </p>
        </div>

        {/* Confetti animation poderia ser adicionado aqui com react-confetti */}
      </div>
    </div>
  );
};

export default PaymentSuccess;


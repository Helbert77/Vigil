import React, { useState, useEffect } from "react";
import { PricingCard } from "@/src/components/premium/PricingCard";
import { useSession } from "@/contexts/SessionContext";
import { useToast } from "@/hooks/useToast";
import Card from "@/components/common/Card";
import { User } from "@/types";
import PricingComparisonTable from "@/src/components/premium/PricingComparisonTable";
import * as api from '@/src/services/api';
import CancellationModal from "@/src/components/premium/CancellationModal";
import { getCurrentPrice, isPromotionActive, getTrialDays, calculateAnnualBonus, formatPrice } from '@/src/utils/pricingUtils';

interface PremiumPageProps {
  user: User;
  onUpdateUser: (updates: Partial<User>) => Promise<void>;
}

export default function PremiumPage({ user: propUser, onUpdateUser }: PremiumPageProps) {
  const { session, refreshUser } = useSession();
  const { addToast } = useToast();
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Use the prop user instead of session user
  const user = propUser;
  const currentPlan = user?.plan || 'free';
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'basic' | 'pro' | 'premium'>(currentPlan as any);

  useEffect(() => {
    setSelectedPlan(currentPlan as any);
  }, [currentPlan]);

  // Verificar se promoção está ativa
  const promotionActive = isPromotionActive();
  
  // Debug: log para verificar se a promoção está ativa
  console.log('[PremiumPage] Promoção ativa:', promotionActive);

  // Função para calcular desconto percentual
  const calculateDiscount = (originalPrice: number, promoPrice: number) => {
    if (originalPrice === 0) return 0;
    return Math.round(((originalPrice - promoPrice) / originalPrice) * 100);
  };

  // Calcular preços dinâmicos (promocionais e originais)
  const prices = {
    free: {
      monthly: { value: 0, display: "Grátis", original: null, discount: 0 },
      annually: { value: 0, display: "Grátis", original: null, discount: 0 },
    },
    basic: {
      monthly: { 
        value: getCurrentPrice('basic', 'monthly', promotionActive), 
        display: formatPrice(getCurrentPrice('basic', 'monthly', promotionActive)) + '/mês',
        original: promotionActive ? formatPrice(getCurrentPrice('basic', 'monthly', false)) + '/mês' : null,
        discount: promotionActive ? calculateDiscount(getCurrentPrice('basic', 'monthly', false), getCurrentPrice('basic', 'monthly', true)) : 0
      },
      annually: { 
        value: getCurrentPrice('basic', 'annually', promotionActive), 
        display: formatPrice(getCurrentPrice('basic', 'annually', promotionActive)) + '/ano',
        original: promotionActive ? formatPrice(getCurrentPrice('basic', 'annually', false)) + '/ano' : null,
        discount: promotionActive ? calculateDiscount(getCurrentPrice('basic', 'annually', false), getCurrentPrice('basic', 'annually', true)) : 0
      },
    },
    pro: {
      monthly: { 
        value: getCurrentPrice('pro', 'monthly', promotionActive), 
        display: formatPrice(getCurrentPrice('pro', 'monthly', promotionActive)) + '/mês',
        original: promotionActive ? formatPrice(getCurrentPrice('pro', 'monthly', false)) + '/mês' : null,
        discount: promotionActive ? calculateDiscount(getCurrentPrice('pro', 'monthly', false), getCurrentPrice('pro', 'monthly', true)) : 0
      },
      annually: { 
        value: getCurrentPrice('pro', 'annually', promotionActive), 
        display: formatPrice(getCurrentPrice('pro', 'annually', promotionActive)) + '/ano',
        original: promotionActive ? formatPrice(getCurrentPrice('pro', 'annually', false)) + '/ano' : null,
        discount: promotionActive ? calculateDiscount(getCurrentPrice('pro', 'annually', false), getCurrentPrice('pro', 'annually', true)) : 0
      },
    },
    premium: {
      monthly: { 
        value: getCurrentPrice('premium', 'monthly', promotionActive), 
        display: formatPrice(getCurrentPrice('premium', 'monthly', promotionActive)) + '/mês',
        original: promotionActive ? formatPrice(getCurrentPrice('premium', 'monthly', false)) + '/mês' : null,
        discount: promotionActive ? calculateDiscount(getCurrentPrice('premium', 'monthly', false), getCurrentPrice('premium', 'monthly', true)) : 0
      },
      annually: { 
        value: getCurrentPrice('premium', 'annually', promotionActive), 
        display: formatPrice(getCurrentPrice('premium', 'annually', promotionActive)) + '/ano',
        original: promotionActive ? formatPrice(getCurrentPrice('premium', 'annually', false)) + '/ano' : null,
        discount: promotionActive ? calculateDiscount(getCurrentPrice('premium', 'annually', false), getCurrentPrice('premium', 'annually', true)) : 0
      },
    },
  };

  const calculateSavings = (monthlyPrice: number, annualPrice: number) => {
    const annualCostMonthly = monthlyPrice * 12;
    if (annualCostMonthly === 0) return 0;
    const savings = annualCostMonthly - annualPrice;
    return Math.round((savings / annualCostMonthly) * 100);
  };

  const basicSavings = calculateSavings(prices.basic.monthly.value, prices.basic.annually.value);
  const proSavings = calculateSavings(prices.pro.monthly.value, prices.pro.annually.value);
  const premiumSavings = calculateSavings(prices.premium.monthly.value, prices.premium.annually.value);

  // Calcular bônus anual
  const proAnnualBonus = calculateAnnualBonus('pro');
  const premiumAnnualBonus = calculateAnnualBonus('premium');

  // Handler para iniciar trial
  const handleStartTrial = async (plan: 'pro' | 'premium') => {
    if (!session?.user) {
      addToast('Você precisa estar logado para iniciar um teste.', 'error');
      return;
    }

    try {
      // Verificar se já usou trial
      const { hasUsed, error: checkError } = await api.hasUsedTrial(session.user.id, plan);
      
      if (checkError) {
        console.error('Erro ao verificar trial:', checkError);
        // Se a tabela não está configurada, mostrar mensagem apropriada
        if (checkError.code === 'PGRST204' || checkError.code === '42P01') {
          addToast('Sistema de trials ainda não está configurado. Use "Escolher Plano".', 'info');
          return;
        }
      }
      
      if (hasUsed) {
        addToast('Você já utilizou o período de teste para este plano.', 'info');
        return;
      }
      
      // Iniciar trial
      const { error } = await api.startTrial(session.user.id, plan);
      
      if (error) {
        console.error('Erro ao iniciar trial:', error);
        if (error.code === 'PGRST204' || error.code === '42P01') {
          addToast('Sistema de trials ainda não está configurado. Use "Escolher Plano".', 'info');
        } else {
          addToast('Erro ao iniciar teste. Tente novamente.', 'error');
        }
      } else {
        addToast(`Teste de ${getTrialDays(plan)} dias iniciado com sucesso!`, 'success');
        await refreshUser();
      }
    } catch (err) {
      console.error('Erro inesperado ao iniciar trial:', err);
      addToast('Erro ao processar solicitação de teste.', 'error');
    }
  };

  const handleConfirmPlan = async () => {
    if (!session?.user) {
      addToast("Você precisa estar logado para assinar um plano.", "error");
      return;
    }

    if (currentPlan === selectedPlan) {
      addToast(`Você já está no plano ${selectedPlan.toUpperCase()}.`, "info");
      return;
    }

    setIsUpdatingPlan(true);
    try {
      const { error } = await api.upsertSubscription(session.user.id, selectedPlan);

      if (error) {
        console.error("PremiumPage: Error updating plan:", error);
        addToast("Erro ao atualizar plano. Tente novamente.", "error");
      } else {
        addToast(`Plano ${selectedPlan.toUpperCase()} ativado com sucesso!`, "success");
        await refreshUser();
      }
    } catch (error) {
      console.error("PremiumPage: Unexpected error during plan update:", error);
      addToast("Ocorreu um erro inesperado ao atualizar o plano.", "error");
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  const handleCancelSubscription = async (reason: string, details: string) => {
    if (!session?.user || !user) {
      addToast("Você precisa estar logado.", "error");
      return;
    }

    setIsCancelling(true);
    try {
      const { error: feedbackError } = await api.submitCancellationFeedback({
        user_id: session.user.id,
        previous_plan: user.plan || 'unknown',
        reason: reason,
        details: details,
      });

      if (feedbackError) {
        console.error("PremiumPage: Error submitting cancellation feedback:", feedbackError);
      }

      const { error } = await api.upsertSubscription(session.user.id, 'free');

      if (error) {
        console.error("PremiumPage: Error cancelling subscription:", error);
        addToast("Erro ao cancelar a assinatura. Tente novamente.", "error");
      } else {
        addToast("Sua assinatura foi cancelada com sucesso.", "success");
        await refreshUser();
        setIsCancelModalOpen(false);
      }
    } catch (error) {
      console.error("PremiumPage: Unexpected error during cancellation:", error);
      addToast("Ocorreu um erro inesperado ao cancelar a assinatura.", "error");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Escolha o quanto de verdade você quer enxergar
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          Cada plano desbloqueia um novo nível de liberdade, acesso e conexão. O despertar começa com uma escolha.
        </p>
        
        {/* Banner de Promoção */}
        {promotionActive && (
          <div className="mt-8 mx-auto max-w-3xl">
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-1 shadow-2xl">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">🎉</span>
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400">
                    Promoção de Lançamento
                  </h2>
                  <span className="text-2xl">🚀</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg font-semibold mb-1">
                  Preços especiais para os primeiros membros da comunidade Vigil
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Economize até 25% nos planos mensais e garanta acesso vitalício aos preços promocionais!
                </p>
                <div className="mt-4 inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-full text-sm font-bold">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                  </svg>
                  <span>Oferta por tempo limitado - Não perca!</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center mb-12">
        <div className="inline-flex rounded-full bg-light-bg dark:bg-dark-bg p-1 shadow-sm border border-light-border dark:border-dark-border">
          <button
            onClick={() => setBillingCycle('annually')}
            className={`px-6 py-1 rounded-full text-sm font-semibold transition-all duration-200 flex items-center flex-1 justify-center
              ${billingCycle === 'annually'
                ? 'bg-dark-bg dark:bg-gray-800 text-primary dark:text-blue-400 shadow-md'
                : 'bg-transparent text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
          >
            Anual
          </button>
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-1 rounded-full text-sm font-semibold transition-all duration-200 flex items-center flex-1 justify-center
              ${billingCycle === 'monthly'
                ? 'bg-dark-bg dark:bg-gray-800 text-primary dark:text-blue-400 shadow-md'
                : 'bg-transparent text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
          >
            Mensal
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 max-w-6xl mx-auto items-start">
        <PricingCard
          title="Basic"
          price={prices.basic[billingCycle].display}
          originalPrice={prices.basic[billingCycle].original}
          promotionalDiscount={prices.basic[billingCycle].discount}
          features={[
            "Acesso ilimitado a recursos básicos",
            "Editar Post",
            "Posts mais longos",
          ]}
          onSelect={() => setSelectedPlan("basic")}
          onConfirm={handleConfirmPlan}
          isSelected={selectedPlan === 'basic'}
          currentPlan={currentPlan}
          isUpdatingPlan={isUpdatingPlan}
          billingCycle={billingCycle}
          annualSavingsPercentage={basicSavings}
          isPromotional={promotionActive}
        />

        <div className="relative h-full">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
            <span className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold inline-block">
              mais vantajoso
            </span>
          </div>
          <div className="h-full">
            <PricingCard
              title="Pro"
              price={prices.pro[billingCycle].display}
              originalPrice={prices.pro[billingCycle].original}
              promotionalDiscount={prices.pro[billingCycle].discount}
              features={[
                "Tudo do plano Basic",
                "Selo verificado",
                "Suporte prioritário por e-mail",
                "Anúncios Reduzidos",
              ]}
              onSelect={() => setSelectedPlan("pro")}
              onConfirm={handleConfirmPlan}
              isSelected={selectedPlan === 'pro'}
              currentPlan={currentPlan}
              isUpdatingPlan={isUpdatingPlan}
              billingCycle={billingCycle}
              annualSavingsPercentage={proSavings}
              showTrialButton={currentPlan === 'free' || currentPlan === 'basic'}
              trialDays={getTrialDays('pro')}
              onStartTrial={() => handleStartTrial('pro')}
              annualBonus={billingCycle === 'annually' ? proAnnualBonus : undefined}
              isPromotional={promotionActive}
            />
          </div>
        </div>

        <PricingCard
          title="Premium"
          price={prices.premium[billingCycle].display}
          originalPrice={prices.premium[billingCycle].original}
          promotionalDiscount={prices.premium[billingCycle].discount}
          features={[
            "Tudo do plano Pro",
            "Sem anúncios",
            "Criar novas comunidades",
            "Acesso total a página E-Books",
            "Atendimento e Suporte via chat",
            "Acesso antecipado a novos recursos",
          ]}
          highlighted
          onSelect={() => setSelectedPlan("premium")}
          onConfirm={handleConfirmPlan}
          isSelected={selectedPlan === 'premium'}
          currentPlan={currentPlan}
          isUpdatingPlan={isUpdatingPlan}
          billingCycle={billingCycle}
          annualSavingsPercentage={premiumSavings}
          showTrialButton={currentPlan === 'free' || currentPlan === 'basic' || currentPlan === 'pro'}
          trialDays={getTrialDays('premium')}
          onStartTrial={() => handleStartTrial('premium')}
          annualBonus={billingCycle === 'annually' ? premiumAnnualBonus : undefined}
          isPromotional={promotionActive}
        />
      </div>

      <PricingComparisonTable currentPlan={currentPlan} />

      <Card className="mt-16 max-w-3xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Seu Plano Atual: {currentPlan.toUpperCase()}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Você pode fazer upgrade ou gerenciar sua assinatura a qualquer momento.
        </p>
      </Card>

      <div className="mt-16 text-center text-gray-500 dark:text-gray-400 text-sm">
        {currentPlan !== 'free' && (
          <button onClick={() => setIsCancelModalOpen(true)} className="underline hover:text-primary transition-colors">
            Cancelar a qualquer momento.
          </button>
        )}
        {currentPlan !== 'free' && <span className="ml-1">Sem taxas ocultas.</span>}
        {currentPlan === 'free' && <span>Sem taxas ocultas.</span>}
      </div>

      <CancellationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelSubscription}
        isCancelling={isCancelling}
      />
    </div>
  );
}
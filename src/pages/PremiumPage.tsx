import React, { useState, useEffect } from "react";
import { PricingCard } from "@/src/components/premium/PricingCard";
import { useSession } from "@/contexts/SessionContext";
import { useToast } from "@/hooks/useToast";
import Card from "@/components/common/Card";
import { User } from "@/types";
import PricingComparisonTable from "@/src/components/premium/PricingComparisonTable";
import * as api from '@/src/services/api';
import CancellationModal from "@/src/components/premium/CancellationModal";

export default function PremiumPage() {
  const { user, session, refreshUser } = useSession();
  const { addToast } = useToast();
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
  const currentPlan = (user as User)?.plan || 'free';
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'basic' | 'pro' | 'premium'>(currentPlan as any);

  useEffect(() => {
    setSelectedPlan(currentPlan as any);
  }, [currentPlan]);

  const prices = {
    free: {
      monthly: { value: 0, display: "Grátis" },
      annually: { value: 0, display: "Grátis" },
    },
    basic: {
      monthly: { value: 3.25, display: "€3,25/mês" },
      annually: { value: 34.32, display: "€34,32/ano" },
    },
    pro: {
      monthly: { value: 8.95, display: "€8,95/mês" },
      annually: { value: 91.29, display: "€91,29/ano" },
    },
    premium: {
      monthly: { value: 35.95, display: "€35,95/mês" },
      annually: { value: 358.06, display: "€358,06/ano" },
    },
  };

  const calculateSavings = (monthlyPrice: number, annualPrice: number) => {
    const annualCostMonthly = monthlyPrice * 12;
    if (annualCostMonthly === 0) return 0;
    const savings = annualCostMonthly - annualPrice;
    return (savings / annualCostMonthly) * 100;
  };

  const basicSavings = calculateSavings(prices.basic.monthly.value, prices.basic.annually.value);
  const proSavings = calculateSavings(prices.pro.monthly.value, prices.pro.annually.value);
  const premiumSavings = calculateSavings(prices.premium.monthly.value, prices.premium.annually.value);

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
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
          Torne-se Premium <span className="animated-gradient">🚀</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          Desbloqueie todo o potencial do Vigil com planos flexíveis e recursos exclusivos.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-full bg-light-bg dark:bg-dark-bg p-1 shadow-sm">
          <button
            onClick={() => setBillingCycle('annually')}
            className={`px-6 py-1 rounded-full text-sm font-semibold transition-colors duration-200 flex items-center
              ${billingCycle === 'annually'
                ? 'bg-dark-bg text-white shadow-md border border-primary'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
          >
            Anual <span className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white px-2 py-0.5 rounded-full text-xs font-bold ml-2">mais vantajoso</span>
          </button>
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-1 rounded-full text-sm font-semibold transition-colors duration-200 flex items-center
              ${billingCycle === 'monthly'
                ? 'bg-dark-bg text-white shadow-md border border-primary'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
          >
            Mensal
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 max-w-6xl mx-auto">
        <PricingCard
          title="Basic"
          price={prices.basic[billingCycle].display}
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
        />

        <PricingCard
          title="Pro"
          price={prices.pro[billingCycle].display}
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
        />

        <PricingCard
          title="Premium"
          price={prices.premium[billingCycle].display}
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
        <button onClick={() => setIsCancelModalOpen(true)} className="underline hover:text-primary transition-colors">
          Cancelar a qualquer momento.
        </button>
        <span className="ml-1">Sem taxas ocultas.</span>
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
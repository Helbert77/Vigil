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
  
  // Estados para cupom de trial
  const [couponCode, setCouponCode] = useState('');
  const [couponValidation, setCouponValidation] = useState<{
    valid: boolean;
    coupon?: any;
    error?: string;
  } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Use the prop user instead of session user
  const user = propUser;
  const currentPlan = user?.plan || 'free';
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'basic' | 'pro' | 'premium'>(currentPlan as any);

  useEffect(() => {
    setSelectedPlan(currentPlan as any);
  }, [currentPlan]);

  // Verificar se retornou do checkout
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutStatus = urlParams.get('checkout');
    const couponUsed = urlParams.get('coupon');
    const planActivated = urlParams.get('plan');

    if (checkoutStatus === 'success') {
      addToast('Pagamento processado com sucesso! Aguarde a confirmação da assinatura.', 'success');
      
      // ✅ Registrar uso do cupom se foi usado
      if (couponUsed && couponValidation?.valid && session?.user?.id && planActivated) {
        api.recordCouponUsage({
          couponId: couponValidation.coupon.id,
          userId: session.user.id,
          planActivated: planActivated,
          trialDaysGranted: couponValidation.coupon.trialDays,
        }).then(({ error }) => {
          if (error) {
            console.error('[PremiumPage] Error recording coupon usage:', error);
          } else {
            console.log('[PremiumPage] Coupon usage recorded successfully');
          }
        });
      }
      
      // Limpar parâmetro da URL
      window.history.replaceState({}, '', window.location.pathname);
      
      // ✅ CRÍTICO: Atualizar dados do usuário para carregar subscription atualizada
      // Aguardar um pouco para o webhook processar, depois fazer múltiplas tentativas
      const refreshWithRetry = async () => {
        await refreshUser(); // Primeira tentativa imediata
        setTimeout(() => refreshUser(), 2000); // Segunda tentativa após 2s
        setTimeout(() => refreshUser(), 5000); // Terceira tentativa após 5s
      };
      refreshWithRetry();
    } else if (checkoutStatus === 'canceled') {
      addToast('Checkout cancelado. Você pode tentar novamente quando quiser.', 'info');
      // Limpar parâmetro da URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [addToast, refreshUser, couponValidation, session]);

  // Verificar se promoção está ativa
  const promotionActive = isPromotionActive();

  // Debug: log para verificar se a promoção está ativa
  // console.log('[PremiumPage] Promoção ativa:', promotionActive);

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

  // Handler para validar cupom
  const handleValidateCoupon = async () => {
    if (!session?.user || !couponCode.trim()) {
      addToast('Digite um código de cupom', 'error');
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const { data, error } = await api.validateTrialCoupon(
        couponCode.trim().toUpperCase(),
        session.user.id
      );

      if (error) throw error;

      setCouponValidation(data);

      if (data.valid) {
        // Forçar seleção do plano do cupom
        setSelectedPlan(data.coupon.plan);
        addToast(`✅ Cupom válido! ${data.coupon.trialDays} dias de teste do ${data.coupon.plan.toUpperCase()}`, 'success');
      } else {
        addToast(data.error || 'Cupom inválido', 'error');
      }
    } catch (err) {
      console.error('Erro ao validar cupom:', err);
      addToast('Erro ao validar cupom', 'error');
    } finally {
      setIsValidatingCoupon(false);
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

    // Não permitir assinar plano Free via botão
    if (selectedPlan === 'free') {
      addToast("Para cancelar sua assinatura, use a opção de cancelamento abaixo.", "info");
      return;
    }

    // Validar se cupom aplicado corresponde ao plano selecionado
    if (couponValidation?.valid && couponValidation.coupon.plan !== selectedPlan) {
      addToast(`Este cupom é válido apenas para o plano ${couponValidation.coupon.plan.toUpperCase()}. Por favor, selecione o plano correto.`, "error");
      return;
    }

    setIsUpdatingPlan(true);
    try {
      // Criar URLs de sucesso e cancelamento
      const baseUrl = window.location.origin;
      
      // Incluir trialDays e informações do cupom se válido
      const trialDays = couponValidation?.valid ? couponValidation.coupon.trialDays : 0;
      const couponParam = couponValidation?.valid ? `&coupon=${couponCode}` : '';
      const planParam = `&plan=${selectedPlan}`;
      
      const successUrl = `${baseUrl}/?page=Premium&checkout=success${couponParam}${planParam}`;
      const cancelUrl = `${baseUrl}/?page=Premium&checkout=canceled`;

      // Criar sessão de checkout no Stripe
      const { data, error } = await api.createStripeCheckoutSession({
        userId: session.user.id,
        plan: selectedPlan as 'basic' | 'pro' | 'premium',
        billingCycle: billingCycle,
        successUrl,
        cancelUrl,
        trialDays,
      });

      if (error) {
        console.error("PremiumPage: Error creating checkout session:", error);
        console.error("PremiumPage: Error details:", JSON.stringify(error, null, 2));
        addToast(`Erro ao iniciar checkout: ${error.message || 'Tente novamente'}`, "error");
      } else if (data?.url) {
        // Redirecionar para o Stripe Checkout
        addToast("Redirecionando para o checkout...", "info");
        window.location.href = data.url;
      } else {
        console.error("PremiumPage: No URL returned:", data);
        addToast("Erro ao obter URL de checkout.", "error");
      }
    } catch (error) {
      console.error("PremiumPage: Unexpected error during checkout:", error);
      addToast("Ocorreu um erro inesperado ao processar o checkout.", "error");
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
        <h1 className="text-xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Escolha o quanto de verdade você quer enxergar
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          Cada plano desbloqueia um novo nível de liberdade, acesso e conexão. O despertar começa com uma escolha.
        </p>

        {/* Banner de Trial Ativo */}
        {user?.subscription_status === 'trialing' && user?.trial_ends_at && (
          <div className="mt-8 mx-auto max-w-3xl">
            <div className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-2xl p-1 shadow-2xl animate-pulse-glow">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">🎉</span>
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400">
                    Você está em Período de Teste!
                  </h2>
                  <span className="text-2xl">✨</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg font-semibold mb-1">
                  Aproveite todos os recursos do plano {user.plan.toUpperCase()} gratuitamente
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  Seu teste expira em: <span className="font-bold text-green-600 dark:text-green-400">
                    {new Date(user.trial_ends_at).toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-bold">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>
                      {Math.ceil((new Date(user.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias restantes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>Oferta por tempo limitado - Não perca!</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Campo de Cupom - Ocultar se usuário já tem trial ativo */}
      {user?.subscription_status !== 'trialing' && (
        <div className="max-w-md mx-auto mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              🎁 Tem um Cupom de Teste Grátis?
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setCouponValidation(null);
                }}
                placeholder="Digite o código"
                className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white uppercase"
                maxLength={50}
              />
              <button
                onClick={handleValidateCoupon}
                disabled={isValidatingCoupon || !couponCode.trim()}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
              >
                {isValidatingCoupon ? 'Validando...' : 'Aplicar'}
              </button>
            </div>
            
            {couponValidation && (
              <div className={`mt-4 p-3 rounded-lg ${
                couponValidation.valid 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
              }`}>
                {couponValidation.valid ? (
                  <>
                    <p className="font-bold">✅ Cupom Aplicado!</p>
                    <p className="text-sm">{couponValidation.coupon.description}</p>
                    <p className="text-sm font-semibold mt-1">
                      {couponValidation.coupon.trialDays} dias grátis do plano {couponValidation.coupon.plan.toUpperCase()}
                    </p>
                    <p className="text-xs mt-2 opacity-80">
                      ⚠️ Apenas o plano {couponValidation.coupon.plan.toUpperCase()} está disponível com este cupom
                    </p>
                    <button
                      onClick={() => {
                        setCouponCode('');
                        setCouponValidation(null);
                        addToast('Cupom removido. Agora você pode escolher qualquer plano.', 'info');
                      }}
                      className="mt-2 text-xs underline hover:no-underline"
                    >
                      Remover cupom e escolher outro plano
                    </button>
                  </>
                ) : (
                  <p className="font-bold">❌ {couponValidation.error}</p>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      <div className="flex justify-center mb-12">
        <div className="inline-flex rounded-full bg-light-bg dark:bg-dark-bg p-1 shadow-sm border border-light-border dark:border-dark-border">
          <button
            onClick={() => setBillingCycle('annually')}
            className={`px-6 py-1 rounded-full text-sm font-semibold transition-all duration-200 flex items-center flex-1 justify-center
              ${billingCycle === 'annually'
                ? 'bg-blue-100 text-blue-700 shadow-md'
                : 'bg-transparent text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
          >
            Anual
          </button>
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-1 rounded-full text-sm font-semibold transition-all duration-200 flex items-center flex-1 justify-center
              ${billingCycle === 'monthly'
                ? 'bg-blue-100 text-blue-700 shadow-md'
                : 'bg-transparent text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
          >
            Mensal
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 max-w-6xl mx-auto items-stretch">
        {/* Basic Plan */}
        <div className={`relative h-full ${couponValidation?.valid && couponValidation.coupon.plan !== 'basic' ? 'opacity-40 pointer-events-none' : ''}`}>
          {couponValidation?.valid && couponValidation.coupon.plan !== 'basic' && (
            <div className="absolute inset-0 bg-black/10 dark:bg-black/30 rounded-2xl z-10 flex items-center justify-center">
              <div className="bg-gray-900/90 text-white px-4 py-2 rounded-lg text-sm font-bold">
                Cupom não válido para este plano
              </div>
            </div>
          )}
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
            onSelect={() => {
              if (!couponValidation?.valid || couponValidation.coupon.plan === 'basic') {
                setSelectedPlan("basic");
              }
            }}
            onConfirm={handleConfirmPlan}
            isSelected={selectedPlan === 'basic'}
            currentPlan={currentPlan}
            isUpdatingPlan={isUpdatingPlan}
            billingCycle={billingCycle}
            annualSavingsPercentage={basicSavings}
            isPromotional={promotionActive}
          />
        </div>

        {/* Pro Plan */}
        <div className="relative h-full">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
            <span className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold inline-block">
              mais vantajoso
            </span>
          </div>
          <div className={`h-full relative ${couponValidation?.valid && couponValidation.coupon.plan !== 'pro' ? 'opacity-40 pointer-events-none' : ''}`}>
            {couponValidation?.valid && couponValidation.coupon.plan !== 'pro' && (
              <div className="absolute inset-0 bg-black/10 dark:bg-black/30 rounded-2xl z-10 flex items-center justify-center">
                <div className="bg-gray-900/90 text-white px-4 py-2 rounded-lg text-sm font-bold">
                  Cupom não válido para este plano
                </div>
              </div>
            )}
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
                "Criar salas de chat Privativas",
              ]}
              onSelect={() => {
                if (!couponValidation?.valid || couponValidation.coupon.plan === 'pro') {
                  setSelectedPlan("pro");
                }
              }}
              onConfirm={handleConfirmPlan}
              isSelected={selectedPlan === 'pro'}
              currentPlan={currentPlan}
              isUpdatingPlan={isUpdatingPlan}
              billingCycle={billingCycle}
              annualSavingsPercentage={proSavings}
              showTrialButton={false}
              annualBonus={billingCycle === 'annually' ? proAnnualBonus : undefined}
              isPromotional={promotionActive}
            />
          </div>
        </div>

        {/* Premium Plan */}
        <div className={`relative h-full ${couponValidation?.valid && couponValidation.coupon.plan !== 'premium' ? 'opacity-40 pointer-events-none' : ''}`}>
          {couponValidation?.valid && couponValidation.coupon.plan !== 'premium' && (
            <div className="absolute inset-0 bg-black/10 dark:bg-black/30 rounded-2xl z-10 flex items-center justify-center">
              <div className="bg-gray-900/90 text-white px-4 py-2 rounded-lg text-sm font-bold">
                Cupom não válido para este plano
              </div>
            </div>
          )}
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
              "Criar salas de chat Privativas",
            ]}
            highlighted
            onSelect={() => {
              if (!couponValidation?.valid || couponValidation.coupon.plan === 'premium') {
                setSelectedPlan("premium");
              }
            }}
            onConfirm={handleConfirmPlan}
            isSelected={selectedPlan === 'premium'}
            currentPlan={currentPlan}
            isUpdatingPlan={isUpdatingPlan}
            billingCycle={billingCycle}
            annualSavingsPercentage={premiumSavings}
            showTrialButton={false}
            annualBonus={billingCycle === 'annually' ? premiumAnnualBonus : undefined}
            isPromotional={promotionActive}
          />
        </div>
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
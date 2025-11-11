import { PRICING_CONFIG } from '../config/pricing';

export function getCurrentPrice(
  plan: 'basic' | 'pro' | 'premium',
  billingCycle: 'monthly' | 'annually',
  isPromotional: boolean = false
): number {
  const priceSet = isPromotional ? PRICING_CONFIG.promotional : PRICING_CONFIG.standard;
  return priceSet[plan][billingCycle];
}

export function isPromotionActive(): boolean {
  if (!PRICING_CONFIG.promotion.active) return false;
  const endDate = new Date(PRICING_CONFIG.promotion.endDate);
  return new Date() < endDate;
}

export function getTrialDays(plan: 'pro' | 'premium'): number {
  return PRICING_CONFIG.trials[plan];
}

export function calculateAnnualBonus(plan: 'pro' | 'premium'): { freeMonths: number; totalMonths: number } {
  return PRICING_CONFIG.annualBonus[plan];
}

export function getPlanLimits(plan: 'free' | 'basic' | 'pro' | 'premium') {
  return PRICING_CONFIG.limits[plan];
}

export function formatPrice(price: number, currency: string = '$'): string {
  return `${currency}${price.toFixed(2)}`;
}

export function calculateSavings(monthlyPrice: number, annualPrice: number): number {
  const annualCostMonthly = monthlyPrice * 12;
  if (annualCostMonthly === 0) return 0;
  const savings = annualCostMonthly - annualPrice;
  return Math.round((savings / annualCostMonthly) * 100);
}


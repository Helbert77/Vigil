/**
 * Configuração de Preços e Pacotes de Anúncios
 * Sistema de anúncios pagos do Vigil
 */

export type PackageType = 'bronze' | 'silver' | 'gold' | 'platinum';
export type PaymentType = 'free' | 'package' | 'cpm';

export interface AdPackage {
  name: PackageType;
  displayName: string;
  price: number;
  duration: number; // dias
  impressions: number;
  features: string[];
  recommended?: boolean;
  badge?: string;
}

export interface CPMConfig {
  rate: number; // EUR por 1.000 impressões
  minBudget: number;
  maxBudget: number;
}

export interface CreditOption {
  value: number;
  bonus?: number; // Bônus em porcentagem
}

export const AD_PRICING_CONFIG = {
  currency: 'EUR',
  currencySymbol: '€',
  
  packages: {
    bronze: {
      name: 'bronze' as PackageType,
      displayName: 'Bronze',
      price: 9.90,
      duration: 7,
      impressions: 5000,
      features: [
        '7 dias de exposição',
        '5.000 impressões garantidas',
        'Suporte por email',
      ],
    },
    silver: {
      name: 'silver' as PackageType,
      displayName: 'Prata',
      price: 24.90,
      duration: 15,
      impressions: 15000,
      features: [
        '15 dias de exposição',
        '15.000 impressões garantidas',
        'Destaque em 3 comunidades',
        'Suporte prioritário',
      ],
    },
    gold: {
      name: 'gold' as PackageType,
      displayName: 'Ouro',
      price: 49.90,
      duration: 30,
      impressions: 50000,
      features: [
        '30 dias de exposição',
        '50.000 impressões garantidas',
        'Destaque em todas as comunidades',
        'Relatório detalhado',
        'Suporte prioritário',
      ],
      recommended: true,
      badge: 'Mais Popular',
    },
    platinum: {
      name: 'platinum' as PackageType,
      displayName: 'Platina',
      price: 99.90,
      duration: 60,
      impressions: 150000,
      features: [
        '60 dias de exposição',
        '150.000 impressões garantidas',
        'Destaque premium',
        'Pin no topo por 3 dias',
        'Relatório completo com insights',
        'Suporte VIP 24/7',
      ],
      badge: 'Melhor Valor',
    },
  } as Record<PackageType, AdPackage>,
  
  cpm: {
    rate: 8.00, // EUR por 1.000 impressões
    minBudget: 10.00,
    maxBudget: 500.00,
  } as CPMConfig,
  
  credits: {
    options: [
      { value: 10 },
      { value: 25 },
      { value: 50, bonus: 5 }, // 5% de bônus
      { value: 100, bonus: 10 }, // 10% de bônus
      { value: 250, bonus: 15 }, // 15% de bônus
      { value: 500, bonus: 20 }, // 20% de bônus
    ] as CreditOption[],
  },
};

/**
 * Utilitários para formatação e cálculos
 */

export const formatPrice = (price: number, currency: string = AD_PRICING_CONFIG.currencySymbol): string => {
  return `${currency}${price.toFixed(2).replace('.', ',')}`;
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString('pt-BR');
};

export const calculateCPMImpressions = (budget: number, rate: number = AD_PRICING_CONFIG.cpm.rate): number => {
  return Math.floor((budget / rate) * 1000);
};

export const calculateCPMCost = (impressions: number, rate: number = AD_PRICING_CONFIG.cpm.rate): number => {
  return (impressions / 1000) * rate;
};

export const getCostPerImpression = (rate: number = AD_PRICING_CONFIG.cpm.rate): number => {
  return rate / 1000;
};

export const calculateCreditWithBonus = (amount: number): number => {
  const option = AD_PRICING_CONFIG.credits.options.find(opt => opt.value === amount);
  if (option && option.bonus) {
    return amount + (amount * option.bonus / 100);
  }
  return amount;
};

export const getPackageArray = (): AdPackage[] => {
  return Object.values(AD_PRICING_CONFIG.packages);
};

export const getPackageByName = (name: PackageType): AdPackage | undefined => {
  return AD_PRICING_CONFIG.packages[name];
};

/**
 * Validações
 */

export const isValidBudget = (budget: number): boolean => {
  return budget >= AD_PRICING_CONFIG.cpm.minBudget && budget <= AD_PRICING_CONFIG.cpm.maxBudget;
};

export const isValidPackageType = (type: string): type is PackageType => {
  return ['bronze', 'silver', 'gold', 'platinum'].includes(type);
};

export const isValidPaymentType = (type: string): type is PaymentType => {
  return ['free', 'package', 'cpm'].includes(type);
};


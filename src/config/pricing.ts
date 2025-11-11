export const PRICING_CONFIG = {
  // Preços padrão
  standard: {
    basic: {
      monthly: 3.99,
      annually: 47.88, // 12 meses
    },
    pro: {
      monthly: 8.99,
      annually: 107.88, // 12 meses
    },
    premium: {
      monthly: 19.99,
      annually: 239.88, // 12 meses
    },
  },
  
  // Preços promocionais (20% de desconto sobre os preços padrão)
  promotional: {
    basic: {
      monthly: 3.19,  // $3.99 - 20% = $3.19
      annually: 38.30, // $47.88 - 20% = $38.30
    },
    pro: {
      monthly: 7.19,  // $8.99 - 20% = $7.19
      annually: 86.30, // $107.88 - 20% = $86.30
    },
    premium: {
      monthly: 15.99, // $19.99 - 20% = $15.99
      annually: 191.90, // $239.88 - 20% = $191.90
    },
  },
  
  // Períodos de teste
  trials: {
    pro: 7, // dias
    premium: 14, // dias
  },
  
  // Bônus anuais
  annualBonus: {
    pro: {
      freeMonths: 3,
      totalMonths: 15, // 12 + 3
    },
    premium: {
      freeMonths: 6,
      totalMonths: 18, // 12 + 6
    },
  },
  
  // Limites por plano
  limits: {
    free: {
      postCharLimit: 280,
      canEditPost: false,
      canAccessCommunities: false,
      canAccessLibrary: false,
      canCreateCommunities: false,
      hasAds: true,
      supportLevel: 'none' as const,
    },
    basic: {
      postCharLimit: 1000,
      canEditPost: true,
      canAccessCommunities: false,
      canAccessLibrary: false,
      canCreateCommunities: false,
      hasAds: true,
      supportLevel: 'none' as const,
    },
    pro: {
      postCharLimit: 5000,
      canEditPost: true,
      canAccessCommunities: true,
      canAccessLibrary: true,
      canCreateCommunities: false,
      hasAds: 'reduced' as const,
      supportLevel: 'email' as const,
      hasVerifiedBadge: true,
    },
    premium: {
      postCharLimit: 25000,
      canEditPost: true,
      canAccessCommunities: true,
      canAccessLibrary: true,
      canCreateCommunities: true,
      hasAds: false,
      supportLevel: 'chat' as const,
      hasVerifiedBadge: true,
      earlyAccess: true,
    },
  },
  
  // Configuração de promoção
  promotion: {
    active: true,
    endDate: '2026-02-11', // Promoção de lançamento
    canExtend: true,
    maxExtensionMonths: 2,
  },
};


// Utilitário para verificar acesso a comunidades baseado no plano do usuário

export type UserPlan = 'free' | 'basic' | 'pro' | 'premium';
export type RequiredPlan = 'all' | 'basic+' | 'pro+' | 'premium';

/**
 * Verifica se o usuário tem acesso à comunidade baseado no plano requerido
 */
export function canAccessCommunity(userPlan: UserPlan, requiredPlan?: RequiredPlan): boolean {
  // Se não houver restrição ou for 'all', todos podem acessar
  if (!requiredPlan || requiredPlan === 'all') {
    return true;
  }

  // Mapeamento de hierarquia de planos
  const planHierarchy: Record<UserPlan, number> = {
    free: 0,
    basic: 1,
    pro: 2,
    premium: 3
  };

  const userPlanLevel = planHierarchy[userPlan];

  // Verificar requisitos
  switch (requiredPlan) {
    case 'basic+':
      return userPlanLevel >= planHierarchy.basic;
    case 'pro+':
      return userPlanLevel >= planHierarchy.pro;
    case 'premium':
      return userPlanLevel >= planHierarchy.premium;
    default:
      return true;
  }
}

/**
 * Retorna o nome amigável do plano requerido
 */
export function getRequiredPlanLabel(requiredPlan?: RequiredPlan): string {
  switch (requiredPlan) {
    case 'all':
      return 'Todos';
    case 'basic+':
      return 'Basic+';
    case 'pro+':
      return 'Pro+';
    case 'premium':
      return 'Premium';
    default:
      return 'Todos';
  }
}

/**
 * Retorna a cor do badge baseado no plano requerido
 */
export function getRequiredPlanColor(requiredPlan?: RequiredPlan): string {
  switch (requiredPlan) {
    case 'all':
      return 'bg-gray-500';
    case 'basic+':
      return 'bg-green-500';
    case 'pro+':
      return 'bg-yellow-500';
    case 'premium':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

/**
 * Retorna mensagem de erro quando usuário não tem acesso
 */
export function getAccessDeniedMessage(requiredPlan: RequiredPlan): string {
  switch (requiredPlan) {
    case 'basic+':
      return 'Esta comunidade requer plano Basic ou superior.';
    case 'pro+':
      return 'Esta comunidade requer plano Pro ou superior.';
    case 'premium':
      return 'Esta comunidade é exclusiva para usuários Premium.';
    default:
      return 'Você não tem acesso a esta comunidade.';
  }
}


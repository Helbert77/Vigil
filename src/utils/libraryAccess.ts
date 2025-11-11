// Utilitário para verificar acesso à biblioteca baseado no plano do usuário

export type UserPlan = 'free' | 'basic' | 'pro' | 'premium';
export type UserRole = 'user' | 'moderator' | 'admin';

/**
 * Verifica se o usuário tem acesso à página da biblioteca
 * Apenas usuários Pro, Premium e Admin podem acessar
 */
export function canAccessLibrary(userPlan: UserPlan, userRole?: UserRole): boolean {
  // Admins sempre têm acesso
  if (userRole === 'admin') {
    return true;
  }

  // Moderadores e demais precisam de plano Pro ou Premium
  return userPlan === 'pro' || userPlan === 'premium';
}

/**
 * Verifica se o usuário pode adicionar itens à biblioteca
 * Apenas usuários Premium e Admin podem adicionar itens
 */
export function canAddLibraryItems(userPlan: UserPlan, userRole?: UserRole): boolean {
  // Admins sempre podem adicionar
  if (userRole === 'admin') {
    return true;
  }

  // Apenas Premium pode adicionar
  return userPlan === 'premium';
}

/**
 * Retorna mensagem de erro quando usuário não tem acesso à biblioteca
 */
export function getLibraryAccessDeniedMessage(): string {
  return 'Este recurso requer assinatura Premium';
}

/**
 * Retorna mensagem de erro quando usuário não pode adicionar itens
 */
export function getAddItemDeniedMessage(): string {
  return 'Apenas usuários Premium e Administradores podem adicionar itens à biblioteca';
}

/**
 * Retorna o plano mínimo necessário para acessar a biblioteca
 */
export function getMinimumPlanForLibrary(): string {
  return 'Pro';
}

/**
 * Retorna o plano mínimo necessário para adicionar itens
 */
export function getMinimumPlanForAddingItems(): string {
  return 'Premium';
}


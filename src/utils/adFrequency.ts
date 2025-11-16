import { Post, Ad, User } from '../../types';

/**
 * Retorna a frequência de anúncios baseada no plano do usuário
 * @param userPlan - Plano do usuário
 * @returns Número de posts entre cada anúncio (0 = sem anúncios)
 */
export const getAdFrequency = (userPlan: User['plan']): number => {
  switch (userPlan) {
    case 'free':
      return 4; // 1 anúncio a cada 4 posts
    case 'basic':
      return 6; // 1 anúncio a cada 6 posts
    case 'pro':
      return 8; // 1 anúncio a cada 8 posts
    case 'premium':
      return 0; // Sem anúncios
    default:
      return 4; // Padrão: free
  }
};

/**
 * Verifica se anúncios devem ser exibidos para o usuário
 * @param userPlan - Plano do usuário
 * @param userRole - Role do usuário (opcional)
 * @returns true se anúncios devem ser exibidos
 */
export const shouldShowAd = (userPlan: User['plan'], userRole?: User['role']): boolean => {
  // Admin e moderadores não veem anúncios
  if (userRole === 'admin' || userRole === 'moderator') {
    return false;
  }
  
  // Premium não vê anúncios
  if (userPlan === 'premium') {
    return false;
  }
  
  return true;
};

/**
 * Injeta anúncios entre os posts baseado na frequência do plano do usuário
 * @param posts - Array de posts
 * @param ads - Array de anúncios disponíveis
 * @param userPlan - Plano do usuário
 * @param userRole - Role do usuário (opcional)
 * @returns Array mesclado de posts e anúncios
 */
export const injectAdsIntoPosts = (
  posts: Post[],
  ads: Ad[],
  userPlan: User['plan'],
  userRole?: User['role']
): (Post | Ad)[] => {
  // Se não deve mostrar anúncios, retorna apenas os posts
  if (!shouldShowAd(userPlan, userRole)) {
    return posts;
  }
  
  // Se não há anúncios disponíveis, retorna apenas os posts
  if (!ads || ads.length === 0) {
    return posts;
  }
  
  const frequency = getAdFrequency(userPlan);
  
  // Se frequência é 0, não mostra anúncios
  if (frequency === 0) {
    return posts;
  }
  
  const result: (Post | Ad)[] = [];
  let adIndex = 0;
  
  posts.forEach((post, index) => {
    // Adiciona o post
    result.push(post);
    
    // Insere anúncio após cada N posts (frequência)
    if ((index + 1) % frequency === 0 && ads.length > 0) {
      // Usa rotação circular dos anúncios disponíveis
      result.push(ads[adIndex % ads.length]);
      adIndex++;
    }
  });
  
  return result;
};

/**
 * Calcula estatísticas de anúncios para um feed
 * @param totalPosts - Total de posts no feed
 * @param userPlan - Plano do usuário
 * @returns Número estimado de anúncios que serão exibidos
 */
export const calculateAdCount = (totalPosts: number, userPlan: User['plan']): number => {
  const frequency = getAdFrequency(userPlan);
  
  if (frequency === 0) {
    return 0;
  }
  
  return Math.floor(totalPosts / frequency);
};


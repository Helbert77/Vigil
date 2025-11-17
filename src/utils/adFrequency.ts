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
 * Separa anúncios próprios dos demais
 * @param ads - Array de anúncios
 * @param userId - ID do usuário atual
 * @returns Objeto com anúncios próprios e de terceiros
 */
export const separateOwnAds = (ads: Ad[], userId: string) => {
  const ownAds: Ad[] = [];
  const otherAds: Ad[] = [];
  
  ads.forEach(ad => {
    if (ad.advertiser_id === userId) {
      ownAds.push(ad);
    } else {
      otherAds.push(ad);
    }
  });
  
  return { ownAds, otherAds };
};

/**
 * Injeta anúncios entre os posts baseado na frequência do plano do usuário
 * IMPORTANTE: Anúncios próprios do usuário são SEMPRE exibidos, independente do plano
 * @param posts - Array de posts
 * @param ads - Array de anúncios disponíveis
 * @param userPlan - Plano do usuário
 * @param userRole - Role do usuário (opcional)
 * @param userId - ID do usuário atual (para separar anúncios próprios)
 * @returns Array mesclado de posts e anúncios
 */
export const injectAdsIntoPosts = (
  posts: Post[],
  ads: Ad[],
  userPlan: User['plan'],
  userRole?: User['role'],
  userId?: string
): (Post | Ad)[] => {
  if (!ads || ads.length === 0) {
    return posts;
  }
  
  const { ownAds, otherAds } = userId ? separateOwnAds(ads, userId) : { ownAds: [], otherAds: ads };
  
  // Para usuários premium/admin/moderadores: APENAS anúncios próprios
  if (!shouldShowAd(userPlan, userRole)) {
    if (ownAds.length === 0) {
      return posts;
    }
    
    const result: (Post | Ad)[] = [];
    let ownAdIndex = 0;
    const fixedFrequency = 5;
    
    posts.forEach((post, index) => {
      result.push(post);
      
      if ((index + 1) % fixedFrequency === 0 && ownAds.length > 0) {
        const adIndex = ownAdIndex % ownAds.length;
        result.push(ownAds[adIndex]);
        ownAdIndex++;
      }
    });
    
    return result;
  }
  
  // Para usuários free/basic: mostrar anúncios de terceiros
  const frequency = getAdFrequency(userPlan);
  const allAdsToInject = [...ownAds, ...otherAds];
  
  if (allAdsToInject.length === 0) {
    return posts;
  }
  
  const result: (Post | Ad)[] = [];
  let adIndex = 0;
  
  posts.forEach((post, index) => {
    result.push(post);
    
    if ((index + 1) % frequency === 0 && allAdsToInject.length > 0) {
      result.push(allAdsToInject[adIndex % allAdsToInject.length]);
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


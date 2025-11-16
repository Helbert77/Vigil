import { Post, Ad } from '../../types';

/**
 * Type guard para verificar se um item é um anúncio
 * @param item - Item que pode ser Post ou Ad
 * @returns true se o item for um Ad
 */
export const isAd = (item: Post | Ad): item is Ad => {
  return 'advertiser_name' in item;
};

/**
 * Type guard para verificar se um item é um post
 * @param item - Item que pode ser Post ou Ad
 * @returns true se o item for um Post
 */
export const isPost = (item: Post | Ad): item is Post => {
  return 'user' in item && !('advertiser_name' in item);
};


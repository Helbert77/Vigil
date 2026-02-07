import { Community } from '../../types';
import { TFunction } from 'i18next';

export const getCommunityTranslation = (community: Community, t: TFunction) => {
  const nameKey = `communities:db_communities.${community.id}.name`;
  const descKey = `communities:db_communities.${community.id}.description`;

  const name = t(nameKey, { defaultValue: community.name });
  const description = t(descKey, { defaultValue: community.description });

  return { name, description };
};

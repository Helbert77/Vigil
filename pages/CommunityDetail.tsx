import React, { useState, useMemo } from 'react';
import { Community, Post, User, ActiveMember, Poll, EvidenceItem } from '../types';
import Card from '../components/common/Card';
import PostCard from '../components/post/PostCard';
import AdCard from '../components/ads/AdCard';
import { Icon } from '../components/icons/Icon';
import Avatar from '../components/common/Avatar';
import CreatePost from '@/src/components/post/CreatePost';
import { VerifiedBadgeIcon } from '@/src/components/icons/VerifiedBadgeIcon';
import { ModeratorBadgeIcon } from '@/src/components/icons/ModeratorBadgeIcon';
import EditCommunityPlanModal from '@/components/communities/EditCommunityPlanModal';
import { getRequiredPlanLabel, getRequiredPlanColor, getRequiredPlanLabelKey } from '@/src/utils/communityAccess';
import { getCommunityTranslation } from '@/src/utils/communityUtils';
import { useAdsWithState, useAdTracking } from '../src/hooks/useAdsWithState';
import { useAdInteractions } from '../src/hooks/useAdInteractions';
import { injectAdsIntoPosts } from '../src/utils/adFrequency';
import { isAd } from '../src/utils/typeGuards';
import { useTranslation } from 'react-i18next';

const ArrowLeftIcon = () => <Icon><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></Icon>;
const UsersIcon = () => <Icon className="h-4 w-4 mr-1"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></Icon>;
const MessageSquareIcon = () => <Icon className="h-4 w-4 mr-1"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></Icon>;
const PinIcon = () => <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></Icon>;
const GavelIcon = () => <Icon className="h-6 w-6 mr-2"><path d="m14 13-7.5 7.5"/><path d="m18 17-5.5 5.5"/><path d="m15 6-3.5 3.5"/><path d="m2 21 6-6"/><path d="m3 3 7.5 7.5"/><path d="m13 1 6 6"/><path d="M12 6 9 3 3 9l3 3"/><path d="M18 12 21 9l-6-6-3 3"/></Icon>;
const TrophyIcon = () => <Icon className="h-6 w-6 mr-2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></Icon>;

interface CommunityDetailProps {
  community: Community;
  posts: Post[];
  activeMembers: ActiveMember[];
  onUpdatePost: (postId: string, updates: Partial<Post>) => void;
  savedPostIds: string[];
  onToggleSave: (postId: string) => void;
  onNavigateBack: () => void;
  onViewProfile: (userId: string) => void;
  user: User;
  isJoined: boolean;
  onJoinCommunityToggle: (communityId: string) => void;
  onToggleLike: (postId: string, isCurrentlyLiked: boolean) => void;
  onIncrementView: (type: 'post' | 'comment', id: string) => void;
  onViewPost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onBlockToggle: (userId: string) => void;
  blockedUserIds: string[];
  shareableUsers: User[];
  onSendMessage: (params: { targetUserId: string, text: string }) => void;
  followedUserIds: string[];
  onFollowToggle: (userId: string) => void;
  onOpenFollowModal: (user: User, tab: 'followers' | 'following') => void;
  onAddPost: (text: string, imageUrl?: string, videoUrl?: string, audioUrl?: string, poll?: Poll, communityId?: string, evidenceBoard?: EvidenceItem[]) => void;
  communities: Community[];
  joinedCommunityIds: string[];
  onVoteOnPoll: (postId: string, optionIndex: number) => void;
  allUsers: User[];
  setCurrentPage: (page: any) => void;
  onUpdateCommunityPlan?: (communityId: string, requiredPlan: 'all' | 'basic+' | 'pro+' | 'premium') => Promise<void>;
}

const CommunityDetail: React.FC<CommunityDetailProps> = ({ community, posts, activeMembers, onUpdatePost, savedPostIds, onToggleSave, onNavigateBack, onViewProfile, user, isJoined, onJoinCommunityToggle, onToggleLike, onIncrementView, onViewPost, onDeletePost, onBlockToggle, blockedUserIds, shareableUsers, onSendMessage, followedUserIds, onFollowToggle, onOpenFollowModal, onAddPost, communities, joinedCommunityIds, onVoteOnPoll, allUsers, setCurrentPage, onUpdateCommunityPlan }) => {
  const { t } = useTranslation(['communities', 'posts', 'common']);
  const { name: translatedName, description: translatedDescription } = getCommunityTranslation(community, t);
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  
  // Buscar anúncios ativos para esta comunidade com estado local
  const { 
    ads, 
    updateAdLikes, 
    updateAdShares, 
    updateAdViews 
  } = useAdsWithState('community', community.id, user.id);
  
  // Hook para rastrear métricas de anúncios
  const trackAdMetric = useAdTracking(user.id, user.plan, 'community', community.id);

  // Hook para gerenciar interações com anúncios (com callbacks de atualização otimista)
  const {
    likedAdIds,
    savedAdIds,
    hiddenAdIds,
    toggleAdLike,
    toggleAdSave,
    hideAd,
    incrementAdShares,
    incrementAdViews,
  } = useAdInteractions(user.id, updateAdLikes, updateAdShares);
  
  // Verificar se o usuário tem acesso à comunidade
  const hasAccess = React.useMemo(() => {
    // Admin tem acesso irrestrito a todas as comunidades
    if (user.role === 'admin') return true;
    
    if (!community.requiredPlan || community.requiredPlan === 'all') return true;
    
    const planHierarchy: Record<string, number> = {
      free: 0,
      basic: 1,
      pro: 2,
      premium: 3
    };
    
    const userPlanLevel = planHierarchy[user.plan] || 0;
    
    switch (community.requiredPlan) {
      case 'basic+': return userPlanLevel >= planHierarchy.basic;
      case 'pro+': return userPlanLevel >= planHierarchy.pro;
      case 'premium': return userPlanLevel >= planHierarchy.premium;
      default: return true;
    }
  }, [community.requiredPlan, user.plan, user.role]);
  
  // Filtrar posts apenas se o usuário tiver acesso à comunidade
  const communityPosts = hasAccess 
    ? posts.filter((post: Post) => post.communityId === community.id)
    : [];
  const pinnedPosts = communityPosts.filter(post => post.isPinned);
  const regularPosts = communityPosts.filter(post => !post.isPinned);
  
  // Mesclar posts regulares com anúncios
  // IMPORTANTE: Passa user.id para incluir anúncios próprios
  const regularPostsWithAds = useMemo(() => {
    const allAds = ads.filter(ad => !hiddenAdIds.includes(ad.id));
    return injectAdsIntoPosts(regularPosts, allAds, user.plan, user.role, user.id);
  }, [regularPosts, ads, user.plan, user.role, user.id, hiddenAdIds]);
  
  // Verificar se o usuário é o criador da comunidade ou admin/moderador
  const canEditCommunity = user.id === community.creatorId || user.role === 'admin' || user.role === 'moderator';

  return (
    <div>
      <div className="flex items-center mb-4">
        <button onClick={onNavigateBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label={t('communities:goBack')}>
          <ArrowLeftIcon />
        </button>
        <h1 className="text-xl font-bold ml-4">{t('communities:community')}</h1>
      </div>

      <Card className="mb-6 overflow-hidden p-0 sm:p-0">
        <div className="relative">
          <img src={community.bannerUrl} alt={`${translatedName} banner`} className="h-32 sm:h-48 w-full object-cover" />
          {community.requiredPlan && community.requiredPlan !== 'all' && (
            <div className={`absolute top-2 right-2 ${getRequiredPlanColor(community.requiredPlan)} text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg`}>
              {t(getRequiredPlanLabelKey(community.requiredPlan))}
            </div>
          )}
        </div>
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{translatedName}</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{translatedDescription}</p>
            </div>
            {canEditCommunity && onUpdateCommunityPlan && (
              <button
                onClick={() => setIsEditPlanModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 whitespace-nowrap"
                title={t('communities:editAccessTooltip')}
              >
                {t('communities:editAccess')}
              </button>
            )}
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                <div className="flex items-center">
                    <UsersIcon />
                    <span>{(community.memberCount ?? 0).toLocaleString()} {t('communities:members')}</span>
                </div>
                <div className="flex items-center">
                    <MessageSquareIcon />
                    <span>{(community.postsCount ?? 0).toLocaleString()} {t('posts:posts')}</span>
                </div>
            </div>
            <button
              onClick={() => onJoinCommunityToggle(community.id)}
              className={`font-bold py-1 px-4 rounded-full text-sm transition-colors duration-200 z-10 ${
                isJoined
                  ? 'bg-transparent border border-primary text-primary hover:bg-primary/10'
                  : 'bg-primary hover:bg-gray-600 text-white'
              }`}
            >
              {isJoined ? t('communities:joined') : t('communities:join')}
            </button>
          </div>
        </div>
      </Card>

      {isJoined && (
        <div className="mb-6">
          <CreatePost 
            onAddPost={onAddPost} 
            user={user} 
            community={community}
            allUsers={allUsers}
            setCurrentPage={setCurrentPage}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {pinnedPosts.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 flex items-center"><PinIcon /> {t('posts:pinnedPosts')}</h3>
              <div className="space-y-4">
                {pinnedPosts.map((post: Post) => (
                  <PostCard key={post.id} post={post} isSaved={savedPostIds.includes(post.id)} onUpdatePost={onUpdatePost} onToggleSave={onToggleSave} user={user} onToggleLike={onToggleLike} onIncrementView={onIncrementView} onViewPost={onViewPost} onDeletePost={onDeletePost} onBlockToggle={onBlockToggle} blockedUserIds={blockedUserIds} shareableUsers={shareableUsers} onSendMessage={onSendMessage} followedUserIds={followedUserIds} onViewProfile={onViewProfile} onFollowToggle={onFollowToggle} onOpenFollowModal={onOpenFollowModal} onVoteOnPoll={onVoteOnPoll} allUsers={allUsers} />
                ))}
              </div>
            </div>
          )}

          <h3 className="text-xl font-bold mb-4">{t('posts:latestPosts')}</h3>
          <div>
            {regularPostsWithAds.length > 0 ? (
              regularPostsWithAds.map((item, index) => {
                // Verificar se é um anúncio ou post
                if (isAd(item)) {
                  return (
                    <AdCard
                      key={`ad-${item.id}-${index}`}
                      ad={item}
                      user={user}
                      onTrackMetric={trackAdMetric}
                      shareableUsers={shareableUsers}
                      onSendMessage={onSendMessage}
                      isLiked={likedAdIds.includes(item.id)}
                      isSaved={savedAdIds.includes(item.id)}
                      onToggleLike={toggleAdLike}
                      onToggleSave={toggleAdSave}
                      onHideAd={hideAd}
                      onIncrementShares={incrementAdShares}
                      onIncrementViews={updateAdViews}
                    />
                  );
                } else {
                  return (
                    <PostCard 
                      key={`post-${item.id}-${index}`} 
                      post={item} 
                      isSaved={savedPostIds.includes(item.id)} 
                      onUpdatePost={onUpdatePost} 
                      onToggleSave={onToggleSave} 
                      user={user} 
                      onToggleLike={onToggleLike} 
                      onIncrementView={onIncrementView} 
                      onViewPost={onViewPost} 
                      onDeletePost={onDeletePost} 
                      onBlockToggle={onBlockToggle} 
                      blockedUserIds={blockedUserIds} 
                      shareableUsers={shareableUsers} 
                      onSendMessage={onSendMessage} 
                      followedUserIds={followedUserIds} 
                      onViewProfile={onViewProfile} 
                      onFollowToggle={onFollowToggle} 
                      onOpenFollowModal={onOpenFollowModal} 
                      onVoteOnPoll={onVoteOnPoll} 
                      allUsers={allUsers} 
                    />
                  );
                }
              })
            ) : (
              <Card>
                <p className="text-center text-gray-500 dark:text-gray-400 p-4">
                  {t('communities:noPostsYet')}
                </p>
              </Card>
            )}
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <Card>
            <h3 className="text-lg font-bold mb-4 flex items-center"><GavelIcon /> {t('communities:communityRules')}</h3>
            {community.rules && community.rules.length > 0 ? (
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                {community.rules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('communities:noRulesDefined')}</p>
            )}
          </Card>
          <Card>
            <h3 className="text-lg font-bold mb-4 flex items-center"><TrophyIcon /> {t('communities:activeMembers')}</h3>
            {activeMembers && activeMembers.length > 0 ? (
              <div className="space-y-4">
                {activeMembers.map(member => (
                  <div key={member.user_id} className="flex items-center justify-between cursor-pointer" onClick={() => onViewProfile(member.user_id)}>
                    <div className="flex items-center space-x-3">
                      <Avatar src={member.avatar_url} alt={member.name} size="md" />
                      <div>
                        <div className="flex items-center gap-1">
                          <p className="font-bold text-sm">{member.name}</p>
                          {(member.plan === 'pro' || member.plan === 'premium') && <VerifiedBadgeIcon plan={member.plan} className="h-4 w-4" />}
                          {allUsers.find(u => u.id === member.user_id)?.role && ['admin', 'moderator'].includes(allUsers.find(u => u.id === member.user_id)!.role!) && <ModeratorBadgeIcon className="h-4 w-4" />}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">@{member.username}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{member.post_count} {t('posts:posts')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('communities:noActiveMembers')}</p>
            )}
          </Card>
        </aside>
      </div>
      
      {onUpdateCommunityPlan && (
        <EditCommunityPlanModal
          isOpen={isEditPlanModalOpen}
          onClose={() => setIsEditPlanModalOpen(false)}
          community={community}
          onUpdate={onUpdateCommunityPlan}
        />
      )}
    </div>
  );
};

export default CommunityDetail;
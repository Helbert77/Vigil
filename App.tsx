import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Rightbar from '@/components/layout/Rightbar';
import Home from '@/pages/Home';
import Profile from '@/pages/Profile';
import Header from '@/components/layout/Header';
import Settings from '@/pages/Settings';
import Notifications from '@/pages/Notifications';
import Messages from '@/pages/Messages';
import Saved from '@/pages/Saved';
import Communities from '@/pages/Communities';
import PostDetail from '@/pages/PostDetail';
import Search from '@/pages/Search';
import CommunityDetail from '@/pages/CommunityDetail';
import TopicDetail from '@/pages/TopicDetail';
import About from '@/pages/About';
import TermsOfService from '@/pages/TermsOfService';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import CookiePolicy from '@/pages/CookiePolicy';
import Disclaimer from '@/pages/Disclaimer';
import Accessibility from '@/pages/Accessibility';
import PremiumPage from '@/src/pages/PremiumPage';
import ToastContainer from '@/components/common/ToastContainer';
import { User, Post, Comment, ActiveMember, Community, Notification, Conversation, Poll, EvidenceItem } from '@/types';
import { useSession } from '@/contexts/SessionContext';
import { canAccessLibrary, getLibraryAccessDeniedMessage } from '@/src/utils/libraryAccess';
import { useToast } from '@/hooks/useToast';

import Login from '@/pages/Login';
import UpdatePassword from '@/pages/UpdatePassword';
import FollowListModal from '@/components/profile/FollowListModal';
import { UsersProvider } from '@/contexts/UsersContext';
import SupportButton from '@/components/support/SupportButton';
import { useUserData } from '@/src/hooks/useUserData';
import { usePosts } from '@/src/hooks/usePosts';
import { useCommunities } from '@/src/hooks/useCommunities';
import { useNotifications } from '@/src/hooks/useNotifications';
import { useConversations } from '@/src/hooks/useConversations';
import { useModerationData } from '@/src/hooks/useModerationData';
import { useLibrary } from '@/src/hooks/useLibrary';
import * as api from '@/src/services/api';
import SplashScreen from '@/pages/SplashScreen';
import Timeline from '@/pages/Timeline';
import Library from '@/pages/Library';
import { ChevronLeftIcon } from './components/icons/ChevronLeftIcon';
import Moderation from '@/pages/admin/Moderation';
import Dashboard from '@/components/admin/Dashboard';
import Appeals from '@/pages/admin/Appeals';
import TrendingTopicsPage from '@/pages/TrendingTopics';
import ExploreUsers from '@/components/ExploreUsers';
import MobileBottomNav from '@/src/components/layout/MobileBottomNav';
import {
  buildPathFromSnapshot,
  parseLocationToSnapshot,
  pushHistoryState,
  samePath,
  type NavigationSnapshot,
} from '@/src/utils/history';

type Page = 'Home' | 'Profile' | 'Settings' | 'Notifications' | 'Messages' | 'Saved' | 'Communities' | 'Library' | 'Timeline' | 'PostDetail' | 'Search' | 'CommunityDetail' | 'TopicDetail' | 'About' | 'TermsOfService' | 'PrivacyPolicy' | 'CookiePolicy' | 'Disclaimer' | 'Accessibility' | 'UpdatePassword' | 'Moderation' | 'Dashboard' | 'Appeals' | 'Premium' | 'TrendingTopics' | 'ExploreUsers';

const App: React.FC = () => {
  const { session, user: appUser, loading: sessionLoading, refreshUser } = useSession();
  const { addToast } = useToast();
  
  // State for navigation and UI
  const [currentPage, setCurrentPage] = useState<Page>('Home');
  const [previousPage, setPreviousPage] = useState<Page>('Home');
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewedUserId, setViewedUserId] = useState<string | null>(null);
  const [activeCommunityId, setActiveCommunityId] = useState<string | null>(null);
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followModalData, setFollowModalData] = useState<{ user: User; initialFollowers: User[]; initialFollowing: User[]; initialTab: 'followers' | 'following'; } | null>(null);
  const [activeMembers, setActiveMembers] = useState<ActiveMember[]>([]);
  const mainContentRef = useRef<HTMLElement>(null);
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const previousUserRef = useRef<User | null>(null);

  // Custom Hooks for data logic
  const { allUsers, followedUserIds, blockedUserIds, blockedUsersList, usersToFollow, handleFollowToggle, handleBlockToggle, handleUpdateUser } = useUserData(appUser, refreshUser);
  const { communities, setCommunities, joinedCommunityIds, trendingTopics, handleJoinCommunityToggle, handleCreateCommunity, handleUpdateCommunityPlan, fetchTrendingTopics } = useCommunities(appUser);
  const { posts, isPostsLoading, savedPostIds, handleAddPost, handleDeletePost, handleUpdatePost, handleToggleLike, handleToggleCommentLike, handleToggleSavePost, handleVoteOnPoll, handleAddComment, handleUpdateComment, handleDeleteComment, handleIncrementView } = usePosts(appUser, allUsers, setCommunities, fetchTrendingTopics);
  const { notifications, unreadNotificationsCount, handleClearNotifications, markNotificationsAsRead } = useNotifications(appUser, allUsers);
  const { conversations, unreadMessagesCount, handleSendMessage, isLoading: isConversationsLoading, markMessagesAsRead, handleDeleteConversation } = useConversations(appUser);
  const { moderationQueue, appealsQueue, pendingModerationCount, pendingAppealsCount, isLoadingModeration, refetchModerationData } = useModerationData(appUser);
  const { items: libraryItems, isLoading: isLibraryLoading, handleAddItem: handleAddLibraryItem, handleUpdateItem: handleUpdateLibraryItem, handleDeleteItem: handleDeleteLibraryItem, handleIncrementView: handleIncrementLibraryView, handleIncrementDownload: handleIncrementLibraryDownload } = useLibrary(appUser);

  useEffect(() => {
    // User state updated - logs removed for production
  }, [appUser]);

  // Web Push subscribe (PWA)
  useEffect(() => {
    const subscribePush = async () => {
      try {
        if (!appUser) return;
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
        const registration = await navigator.serviceWorker.ready;
        const key = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        if (!key) return;
        const convertedKey = Uint8Array.from(atob(key.replace(/_/g, '/').replace(/-/g, '+')), c => c.charCodeAt(0));
        const sub = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: convertedKey });
        await api.savePushSubscription(appUser.id, sub);
      } catch {}
    };
    subscribePush();
  }, [appUser]);

  useEffect(() => {
    if (!appUser) return;
    (window as any).testPush = async (payload?: { title: string; body: string; url?: string; icon?: string; tag?: string }) => {
      const p = payload || { title: 'Teste', body: 'Push de teste', url: '/' };
      try {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(p.title, { body: p.body, icon: p.icon || '/logo.png', data: { url: p.url || '/' }, tag: p.tag || 'test' });
      } catch {}
    };
    return () => { try { delete (window as any).testPush; } catch {} };
  }, [appUser]);

  // Capacitor Push registration
  useEffect(() => {
    const setupCapacitorPush = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) return;
        const { PushNotifications } = await import('@capacitor/push-notifications');
        const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
        const perm = await PushNotifications.requestPermissions();
        if (perm.receive === 'granted') {
          await PushNotifications.register();
        }
        PushNotifications.addListener('registration', async (token) => {
          if (appUser) {
            const platform = Capacitor.getPlatform() === 'ios' ? 'ios' : 'android';
            await api.saveDeviceToken(appUser.id, token.value, platform);
          }
        });
        PushNotifications.addListener('pushNotificationReceived', async () => {
          try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch {}
        });
      } catch {}
    };
    setupCapacitorPush();
  }, [appUser]);

  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  const handleToggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleNavigation = (page: Page) => {
    if (page === 'Home' && currentPage === 'Home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Verificar acesso à biblioteca
    if (page === 'Library' && appUser) {
      if (!canAccessLibrary(appUser.plan, appUser.role)) {
        addToast(getLibraryAccessDeniedMessage(), 'error');
        setCurrentPage('Premium');
        const snapshot: NavigationSnapshot = {
          page: 'Premium',
          viewedUserId,
          activeCommunityId,
          activePostId,
          activeCommentId,
          activeTag,
          searchQuery,
        };
        const targetPath = buildPathFromSnapshot(snapshot);
        const currentFullPath = window.location.pathname + window.location.search;
        if (!samePath(currentFullPath, targetPath)) {
          pushHistoryState(snapshot);
        }
        return;
      }
    }
    
    // Não faz scroll automático para a página de mensagens para manter o título visível
    if (page !== 'Messages') {
      scrollToTop();
    }
    
    if (page === 'Home') { setActiveTag(null); setSearchQuery(''); }
    if (page === 'Profile') setViewedUserId(null);
    if (page === 'Notifications' && unreadNotificationsCount > 0) {
      markNotificationsAsRead();
    }
    if (page === 'Messages' && unreadMessagesCount > 0) {
      markMessagesAsRead();
    }
    setCurrentPage(page);
    // Build and push a snapshot reflecting current state for static pages
    const snapshot: NavigationSnapshot = {
      page,
      viewedUserId,
      activeCommunityId,
      activePostId,
      activeCommentId,
      activeTag,
      searchQuery,
    };
    const targetPath = buildPathFromSnapshot(snapshot);
    const currentFullPath = window.location.pathname + window.location.search;
    if (!samePath(currentFullPath, targetPath)) {
      pushHistoryState(snapshot);
    }
  };

  useEffect(() => {
    // This effect resets the page to Home upon login.
    // It checks if the user state has transitioned from logged-out to logged-in.
    if (!previousUserRef.current && appUser) {
        handleNavigation('Home');
    }
    // Store the current user state for the next render comparison.
    previousUserRef.current = appUser;
  }, [appUser]);

  const refetchActiveMembers = React.useCallback(async (communityId: string) => {
    try {
      const { data, error } = await api.fetchActiveMembers(communityId);
      if (error) throw error;
      setActiveMembers(data as ActiveMember[]);
    } catch (error) {
      // Error handling - log removed for production
    }
  }, []);

  // Apply a navigation snapshot to local state
  const applySnapshotToState = (snapshot: NavigationSnapshot) => {
    setCurrentPage(snapshot.page as Page);
    setViewedUserId(snapshot.viewedUserId || null);
    setActiveCommunityId(snapshot.activeCommunityId || null);
    setActivePostId(snapshot.activePostId || null);
    setActiveCommentId(snapshot.activeCommentId || null);
    setActiveTag(snapshot.activeTag || null);
    setSearchQuery(snapshot.searchQuery || '');
    if (snapshot.activeCommunityId) {
      refetchActiveMembers(snapshot.activeCommunityId);
    }
  };

  // Initial URL parse and popstate listener
  useEffect(() => {
    const initialSnapshot = parseLocationToSnapshot(window.location.pathname, window.location.search);
    // Ensure current history entry has a usable state
    pushHistoryState(initialSnapshot, true);
    applySnapshotToState(initialSnapshot);

    const onPopState = (event: PopStateEvent) => {
      const state = (event.state || {}) as NavigationSnapshot;
      if (state && state.page) {
        applySnapshotToState(state);
      } else {
        const fallback = parseLocationToSnapshot(window.location.pathname, window.location.search);
        applySnapshotToState(fallback);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleAddPostAndUpdate = async (text: string, imageUrl?: string, videoUrl?: string, audioUrl?: string, poll?: Poll, communityId?: string, evidenceBoard?: EvidenceItem[]) => {
    await handleAddPost(text, imageUrl, videoUrl, audioUrl, poll, communityId, evidenceBoard);
    if (communityId && communityId === activeCommunityId) {
      refetchActiveMembers(communityId);
    }
  };

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    if (params.get('type') === 'recovery') {
      setCurrentPage('UpdatePassword');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplashScreen(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleViewPost = (postId: string) => {
    scrollToTop();
    setPreviousPage(currentPage);
    setActivePostId(postId);
    setActiveCommentId(null);
    setCurrentPage('PostDetail');
    const snapshot: NavigationSnapshot = {
      page: 'PostDetail',
      activePostId: postId,
      activeCommentId: null,
      viewedUserId,
      activeCommunityId,
      activeTag,
      searchQuery,
    };
    pushHistoryState(snapshot);
  };

  const handleViewCommentThread = (commentId: string) => {
    scrollToTop();
    const findPostId = (comments: Comment[]): string | null => {
      for (const c of comments) {
        if (c.id === commentId) return null;
        if (c.replies) { const found = findPostId(c.replies); if (found) return found; }
      }
      return null;
    };
    let targetPostId: string | null = null;
    for (const p of posts) {
      if (p.comments.some((c: Comment) => c.id === commentId) || findPostId(p.comments)) {
        targetPostId = p.id;
        break;
      }
    }
    if (targetPostId) setActivePostId(targetPostId);
    setActiveCommentId(commentId);
    setCurrentPage('PostDetail');
    const snapshot: NavigationSnapshot = {
      page: 'PostDetail',
      activePostId: targetPostId || activePostId,
      activeCommentId: commentId,
      viewedUserId,
      activeCommunityId,
      activeTag,
      searchQuery,
    };
    pushHistoryState(snapshot);
  };

  const handleViewProfile = (userId: string) => {
    scrollToTop();
    setSearchQuery('');
    setViewedUserId(userId);
    setCurrentPage('Profile');
    const snapshot: NavigationSnapshot = {
      page: 'Profile',
      viewedUserId: userId,
      activeCommunityId,
      activePostId,
      activeCommentId,
      activeTag,
      searchQuery: '',
    };
    pushHistoryState(snapshot);
  };
  const handleViewCommunity = async (communityId: string) => {
    scrollToTop();
    setSearchQuery('');
    setActiveCommunityId(communityId);
    refetchActiveMembers(communityId);
    setCurrentPage('CommunityDetail');
    const snapshot: NavigationSnapshot = {
      page: 'CommunityDetail',
      activeCommunityId: communityId,
      viewedUserId,
      activePostId,
      activeCommentId,
      activeTag,
      searchQuery: '',
    };
    pushHistoryState(snapshot);
  };
  const handleViewTag = (tag: string) => {
    scrollToTop();
    setSearchQuery('');
    setActiveTag(tag);
    setCurrentPage('TopicDetail');
    const snapshot: NavigationSnapshot = {
      page: 'TopicDetail',
      activeTag: tag,
      viewedUserId,
      activeCommunityId,
      activePostId,
      activeCommentId,
      searchQuery: '',
    };
    pushHistoryState(snapshot);
  };
  const handleNavigateToAdvancedSearch = (query: string) => {
    scrollToTop();
    setSearchQuery(query);
    setCurrentPage('Search');
    const snapshot: NavigationSnapshot = {
      page: 'Search',
      searchQuery: query,
      viewedUserId,
      activeCommunityId,
      activePostId,
      activeCommentId,
      activeTag,
    };
    pushHistoryState(snapshot);
  };

  const handleFetchFollows = async (userId: string) => {
    try {
      const { followerIds, followingIds } = await api.fetchFollows(userId);
      return {
        followers: allUsers.filter((u: User) => followerIds.includes(u.id)),
        following: allUsers.filter((u: User) => followingIds.includes(u.id)),
      };
    } catch (error) {
      return { followers: [], following: [] };
    }
  };

  const handleOpenFollowModal = async (userToView: User, tab: 'followers' | 'following') => {
    const { followers, following } = await handleFetchFollows(userToView.id);
    setFollowModalData({ user: userToView, initialFollowers: followers, initialFollowing: following, initialTab: tab });
    setIsFollowModalOpen(true);
  };

  const forceWebBrowserLogout = () => {
    console.log("Forçando logout no ambiente de navegador web...");
    // Prefixo das mensagens visualizadas para não serem apagadas no logout
    const VIEWED_MESSAGES_KEY_PREFIX = 'vigil_viewed_messages_';

    // Limpar localStorage seletivamente (preservar mensagens visualizadas)
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && !key.startsWith(VIEWED_MESSAGES_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      // Silencioso: se algo falhar, não interrompe o fluxo de logout
    }

    // Limpar sessionStorage normalmente
    sessionStorage.clear();

    // Limpar todos os cookies do domínio
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }

    console.log("Limpeza de dados do cliente concluída.");
    window.location.href = '/';
  };

  const handleLogout = async () => {
    // Detecção do ambiente Trae (exemplo)
    const isTraeEnvironment = navigator.userAgent.includes("Trae");

    if (isTraeEnvironment) {
      forceWebBrowserLogout();
      return;
    }

    try {
      // Timeout para evitar que o logout trave indefinidamente
      const logoutPromise = api.logout();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout no logout')), 10000)
      );

      const result = await Promise.race([logoutPromise, timeoutPromise]);
      const error = (result as any)?.error;

      if (error) {
        console.warn('Ocorreu um erro durante o logout, forçando a limpeza local e redirecionamento.', error);
        // Forçar limpeza local mesmo com erro
        forceWebBrowserLogout();
        return;
      } else {
        console.log('Logout bem-sucedido, redirecionando...');
      }

    } catch (e) {
      console.error('Erro crítico no handleLogout, forçando redirecionamento:', e);
      // Em caso de erro de rede (como net::ERR_ABORTED), forçar limpeza local
      forceWebBrowserLogout();
      return;
    }
    
    // Redirecionamento apenas se não houve erro crítico
    window.location.href = '/';
  };

  const filteredContent = useMemo(() => {
    const mutedWords = (appUser?.mutedWords || []).map(w => w.trim().toLowerCase()).filter(Boolean);
    const filterComments = (comments: Comment[]): Comment[] => comments.filter(c => !blockedUserIds.includes(c.user.id) && !mutedWords.some(word => c.text.toLowerCase().includes(word))).map(c => ({ ...c, replies: c.replies ? filterComments(c.replies) : [] }));
    
    // Filtrar posts considerando restrições de comunidade
    const filteredPosts = posts.filter((p: Post) => {
      // Filtrar usuários bloqueados e palavras silenciadas
      if (blockedUserIds.includes(p.user.id)) return false;
      if (mutedWords.some(word => p.text.toLowerCase().includes(word))) return false;
      
      // Se o post pertence a uma comunidade, verificar acesso
      if (p.communityId) {
        const community = communities.find(c => c.id === p.communityId);
        if (community && community.requiredPlan && community.requiredPlan !== 'all') {
          // Importar a função de verificação de acesso
          const canAccessCommunity = (userPlan: string, requiredPlan: string): boolean => {
            const planHierarchy: Record<string, number> = {
              free: 0,
              basic: 1,
              pro: 2,
              premium: 3
            };
            const userPlanLevel = planHierarchy[userPlan] || 0;
            switch (requiredPlan) {
              case 'basic+': return userPlanLevel >= planHierarchy.basic;
              case 'pro+': return userPlanLevel >= planHierarchy.pro;
              case 'premium': return userPlanLevel >= planHierarchy.premium;
              default: return true;
            }
          };
          
          // Verificar se o usuário tem acesso à comunidade
          if (!canAccessCommunity(appUser?.plan || 'free', community.requiredPlan)) {
            return false;
          }
        }
      }
      
      return true;
    }).map((p: Post) => ({ ...p, comments: filterComments(p.comments) }));
    
    const filteredAllUsers = allUsers.filter((u: User) => !blockedUserIds.includes(u.id));
    const filteredNotifications = notifications.filter((n: Notification) => !blockedUserIds.includes(n.actor.id));
    const filteredConversations = conversations.filter((c: Conversation) => c.participants.every((p: User) => !blockedUserIds.includes(p.id)));
    const filteredUsersToFollow = usersToFollow.filter((u: User) => 
      !blockedUserIds.includes(u.id) && 
      !followedUserIds.includes(u.id) && 
      u.id !== appUser?.id
    );
    return { filteredPosts, filteredAllUsers, filteredNotifications, filteredConversations, filteredUsersToFollow };
  }, [posts, allUsers, notifications, conversations, usersToFollow, blockedUserIds, followedUserIds, appUser, communities]);

  if (sessionLoading) return <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div></div>;
  
  if (!session && showSplashScreen) {
    return <SplashScreen />;
  }

  if (currentPage === 'UpdatePassword') return <><ToastContainer /><UpdatePassword /></>;
  if (!session || !appUser) return <><ToastContainer /><Login /></>;

  const renderPage = () => {
    if (!session) {
      const hash = window.location.hash;
      if (hash.includes('type=recovery')) {
        return <UpdatePassword />;
      }
      return <Login />;
    }
    switch (currentPage) {
      case 'Home':
        return <Home 
          posts={filteredContent.filteredPosts} 
          onFollowToggle={handleFollowToggle} 
          onToggleLike={handleToggleLike} 
          onToggleSave={handleToggleSavePost} 
          onAddComment={handleAddComment} 
          onUpdateComment={handleUpdateComment} 
          onDeleteComment={handleDeleteComment} 
          onToggleCommentLike={handleToggleCommentLike} 
          onVoteOnPoll={handleVoteOnPoll} 
          onViewPost={handleViewPost} 
          onViewProfile={handleViewProfile} 
          onOpenFollowModal={handleOpenFollowModal} 
          onIncrementView={handleIncrementView} 
          onAddPost={handleAddPostAndUpdate} 
          onUpdatePost={handleUpdatePost} 
          onDeletePost={handleDeletePost} 
          usersToFollow={filteredContent.filteredUsersToFollow} 
          trendingTopics={trendingTopics} 
          onJoinCommunity={handleJoinCommunityToggle} 
          user={appUser} 
          communities={communities} 
          joinedCommunityIds={joinedCommunityIds} 
          blockedUserIds={blockedUserIds} 
          onBlockToggle={handleBlockToggle}
          shareableUsers={allUsers} 
          onSendMessage={handleSendMessage} 
          followedUserIds={followedUserIds} 
          allUsers={allUsers} 
          setCurrentPage={handleNavigation}
          onViewCommunity={handleViewCommunity}
          onViewTag={handleViewTag}
          onNavigateToAdvancedSearch={handleNavigateToAdvancedSearch}
          savedPostIds={savedPostIds}
        />;
      case 'Profile':
        // Sempre buscar de allUsers primeiro para garantir dados atualizados em tempo real
        const userToView = viewedUserId 
          ? allUsers.find(u => u.id === viewedUserId) 
          : allUsers.find(u => u.id === appUser.id) || appUser;
        
        if (!userToView) return null;
        return <Profile 
          user={userToView} 
          posts={posts.filter(p => p.user.id === userToView.id)}
          followers={[]} 
          following={[]} 
          onUpdatePost={handleUpdatePost}
          savedPostIds={savedPostIds}
          onToggleSave={handleToggleSavePost}
          onUpdateUser={userToView.id === appUser.id ? handleUpdateUser : undefined}
          onViewPost={handleViewPost}
          currentUser={appUser}
          onUpdateCurrentUser={handleUpdateUser}
          followedUserIds={followedUserIds}
          onFollowToggle={handleFollowToggle}
          blockedUserIds={blockedUserIds}
          onBlockToggle={handleBlockToggle}
          onToggleLike={handleToggleLike}
          onIncrementView={handleIncrementView}
          onDeletePost={handleDeletePost}
          shareableUsers={allUsers}
          onSendMessage={handleSendMessage}
          onViewProfile={handleViewProfile}
          onFetchFollows={handleFetchFollows}
          onOpenFollowModal={handleOpenFollowModal}
          onVoteOnPoll={handleVoteOnPoll}
          allUsers={allUsers}
        />;
      case 'Settings':
        return <Settings 
          onLogout={handleLogout} 
          user={appUser} 
          onUpdateUser={() => handleUpdateUser({})} 
          blockedUsers={blockedUsersList} 
          onBlockToggle={handleBlockToggle} 
        />;
      case 'Notifications':
        return <Notifications 
          notifications={filteredContent.filteredNotifications} 
          onClearAll={handleClearNotifications} 
          onViewPost={handleViewPost} 
          onViewProfile={handleViewProfile} 
          onFollowToggle={handleFollowToggle}
          followedUserIds={followedUserIds}
          currentUser={appUser}
          onOpenFollowModal={handleOpenFollowModal}
        />;
      case 'Messages':
        return <Messages 
          conversations={filteredContent.filteredConversations} 
          handleSendMessage={handleSendMessage} 
          isLoading={isConversationsLoading} 
          onDeleteConversation={handleDeleteConversation} 
          followedUsers={allUsers.filter(u => followedUserIds.includes(u.id))}
        />;
      case 'Saved':
        return <Saved 
          savedPostIds={savedPostIds} 
          posts={posts} 
          onToggleSave={handleToggleSavePost} 
          onViewPost={handleViewPost} 
          user={appUser}
          onToggleLike={handleToggleLike}
          onIncrementView={handleIncrementView}
          onUpdatePost={handleUpdatePost}
          onDeletePost={handleDeletePost}
          onBlockToggle={handleBlockToggle}
          blockedUserIds={blockedUserIds}
          shareableUsers={allUsers}
          onSendMessage={handleSendMessage}
          followedUserIds={followedUserIds}
          onViewProfile={handleViewProfile}
          onFollowToggle={handleFollowToggle}
          onOpenFollowModal={handleOpenFollowModal}
          onVoteOnPoll={handleVoteOnPoll}
          allUsers={allUsers}
        />;
      case 'Communities':
        return <Communities 
          communities={communities} 
          joinedCommunityIds={joinedCommunityIds} 
          onJoinCommunityToggle={handleJoinCommunityToggle} 
          onCreateCommunity={handleCreateCommunity} 
          onViewCommunity={handleViewCommunity}
          user={appUser}
          setCurrentPage={handleNavigation}
        />;
      case 'Library':
        // Verificação de segurança adicional para acesso direto via URL
        if (!canAccessLibrary(appUser.plan, appUser.role)) {
          addToast(getLibraryAccessDeniedMessage(), 'error');
          setTimeout(() => handleNavigation('Premium'), 100);
          return null;
        }
        return <Library 
          items={libraryItems}
          user={appUser}
          onAddItem={handleAddLibraryItem}
          onUpdateItem={handleUpdateLibraryItem}
          onDeleteItem={handleDeleteLibraryItem}
          onIncrementView={handleIncrementLibraryView}
          onIncrementDownload={handleIncrementLibraryDownload}
        />;
      case 'Timeline':
        return <Timeline />;
      case 'PostDetail':
        const post = posts.find(p => p.id === activePostId);
        if (!post) return null;
        
        // Determinar para onde voltar baseado na origem do post
        const handlePostDetailBack = () => {
          if (post.communityId && previousPage === 'CommunityDetail') {
            // Se veio de uma comunidade, voltar para ela
            handleNavigation('CommunityDetail');
          } else if (previousPage && previousPage !== 'PostDetail') {
            // Se veio de outra página (não outro post), voltar para ela
            handleNavigation(previousPage);
          } else {
            // Caso padrão: voltar para Home
            handleNavigation('Home');
          }
        };
        
        return <PostDetail 
          post={post} 
          onFollowToggle={handleFollowToggle} 
          onToggleLike={handleToggleLike} 
          onToggleSave={handleToggleSavePost} 
          onAddComment={handleAddComment} 
          onUpdateComment={handleUpdateComment} 
          onDeleteComment={handleDeleteComment} 
          onToggleCommentLike={handleToggleCommentLike} 
          onVoteOnPoll={handleVoteOnPoll} 
          onViewProfile={handleViewProfile} 
          onOpenFollowModal={handleOpenFollowModal} 
          onIncrementView={handleIncrementView} 
          onUpdatePost={handleUpdatePost} 
          onDeletePost={handleDeletePost} 
          activeCommentId={activeCommentId} 
          onViewCommentThread={handleViewCommentThread}
          user={appUser}
          onBlockToggle={handleBlockToggle}
          onSendMessage={handleSendMessage}
          shareableUsers={allUsers}
          savedPostIds={savedPostIds}
          onToggleSaveComment={() => {}}
          savedCommentIds={[]}
          onNavigateBack={handlePostDetailBack}
          onViewPost={handleViewPost}
          blockedUserIds={blockedUserIds}
          followedUserIds={followedUserIds}
          allUsers={allUsers}
        />;
      case 'Search':
        return <Search 
          onViewPost={handleViewPost} 
          onViewProfile={handleViewProfile} 
          onSearch={setSearchQuery}
          query={searchQuery}
          posts={filteredContent.filteredPosts}
          onUpdatePost={handleUpdatePost}
          savedPostIds={savedPostIds}
          onToggleSave={handleToggleSavePost}
          currentUser={appUser}
          allUsers={allUsers}
          onToggleLike={handleToggleLike}
          onIncrementView={handleIncrementView}
          onDeletePost={handleDeletePost}
          onBlockToggle={handleBlockToggle}
          blockedUserIds={blockedUserIds}
          shareableUsers={allUsers}
          onSendMessage={handleSendMessage}
          followedUserIds={followedUserIds}
          onFollowToggle={handleFollowToggle}
          onOpenFollowModal={handleOpenFollowModal}
          onVoteOnPoll={handleVoteOnPoll}
          communities={communities}
          joinedCommunityIds={joinedCommunityIds}
        />;
      case 'CommunityDetail':
        const community = communities.find(c => c.id === activeCommunityId);
        if (!community) return null;
        return <CommunityDetail 
          community={community} 
          onAddPost={handleAddPostAndUpdate} 
          onViewPost={handleViewPost} 
          onViewProfile={handleViewProfile} 
          onJoinCommunityToggle={handleJoinCommunityToggle} 
          activeMembers={activeMembers}
          user={appUser}
          posts={posts.filter(p => p.communityId === community.id)}
          onUpdatePost={handleUpdatePost}
          savedPostIds={savedPostIds}
          onToggleSave={handleToggleSavePost}
          onToggleLike={handleToggleLike}
          onIncrementView={handleIncrementView}
          onDeletePost={handleDeletePost}
          onBlockToggle={handleBlockToggle}
          blockedUserIds={blockedUserIds}
          shareableUsers={allUsers}
          onSendMessage={handleSendMessage}
          followedUserIds={followedUserIds}
          onFollowToggle={handleFollowToggle}
          onOpenFollowModal={handleOpenFollowModal}
          onVoteOnPoll={handleVoteOnPoll}
          allUsers={allUsers}
          isJoined={joinedCommunityIds.includes(community.id)}
          onNavigateBack={() => handleNavigation('Communities')}
          communities={communities}
          joinedCommunityIds={joinedCommunityIds}
          setCurrentPage={handleNavigation}
          onUpdateCommunityPlan={handleUpdateCommunityPlan}
        />;
      case 'TopicDetail':
        return activeTag ? <TopicDetail 
          tag={activeTag} 
          onViewPost={handleViewPost} 
          onViewProfile={handleViewProfile} 
          posts={posts.filter(p => p.tags?.includes(activeTag))}
          onUpdatePost={handleUpdatePost}
          savedPostIds={savedPostIds}
          onToggleSave={handleToggleSavePost}
          user={appUser}
          onToggleLike={handleToggleLike}
          onIncrementView={handleIncrementView}
          onDeletePost={handleDeletePost}
          onBlockToggle={handleBlockToggle}
          blockedUserIds={blockedUserIds}
          shareableUsers={allUsers}
          onSendMessage={handleSendMessage}
          followedUserIds={followedUserIds}
          onFollowToggle={handleFollowToggle}
          onOpenFollowModal={handleOpenFollowModal}
          onVoteOnPoll={handleVoteOnPoll}
          allUsers={allUsers}
          onNavigateBack={() => handleNavigation('Home')}
        /> : null;
      case 'About':
        return <About />;
      case 'TermsOfService':
        return <TermsOfService />;
      case 'PrivacyPolicy':
        return <PrivacyPolicy />;
      case 'CookiePolicy':
        return <CookiePolicy />;
      case 'Disclaimer':
        return <Disclaimer />;
      case 'Accessibility':
        return <Accessibility />;
      case 'Moderation':
        return <Moderation queue={moderationQueue} onDataChange={refetchModerationData} isLoading={isLoadingModeration} />;
      case 'Dashboard':
        return <Dashboard />;
      case 'Appeals':
        return <Appeals appeals={appealsQueue} onDataChange={refetchModerationData} isLoading={isLoadingModeration} />;
      case 'Premium':
        return <PremiumPage user={appUser} onUpdateUser={handleUpdateUser} />;
      case 'TrendingTopics':
        return <TrendingTopicsPage trendingTopics={trendingTopics} onViewTag={handleViewTag} onGoBack={() => handleNavigation('Home')} />;
      case 'ExploreUsers':
        return <ExploreUsers 
          usersToFollow={filteredContent.filteredUsersToFollow} 
          onFollowToggle={handleFollowToggle} 
          onViewProfile={handleViewProfile} 
          currentUser={appUser}
          followedUserIds={followedUserIds}
          onOpenFollowModal={handleOpenFollowModal}
          onGoBack={() => handleNavigation('Home')}
        />;
      default:
        return <Home 
          posts={filteredContent.filteredPosts} 
          onFollowToggle={handleFollowToggle} 
          onToggleLike={handleToggleLike} 
          onToggleSave={handleToggleSavePost} 
          onAddComment={handleAddComment} 
          onUpdateComment={handleUpdateComment} 
          onDeleteComment={handleDeleteComment} 
          onToggleCommentLike={handleToggleCommentLike} 
          onVoteOnPoll={handleVoteOnPoll} 
          onViewPost={handleViewPost} 
          onViewProfile={handleViewProfile} 
          onOpenFollowModal={handleOpenFollowModal} 
          onIncrementView={handleIncrementView} 
          onAddPost={handleAddPostAndUpdate} 
          onUpdatePost={handleUpdatePost} 
          onDeletePost={handleDeletePost} 
          usersToFollow={filteredContent.filteredUsersToFollow} 
          trendingTopics={trendingTopics} 
          onJoinCommunity={handleJoinCommunityToggle} 
          user={appUser} 
          communities={communities} 
          joinedCommunityIds={joinedCommunityIds} 
          blockedUserIds={blockedUserIds} 
          onBlockToggle={handleBlockToggle}
          shareableUsers={allUsers} 
          onSendMessage={handleSendMessage} 
          followedUserIds={followedUserIds} 
          allUsers={allUsers} 
          setCurrentPage={setCurrentPage} 
          onViewCommunity={handleViewCommunity}
          onViewTag={handleViewTag}
          onNavigateToAdvancedSearch={handleNavigateToAdvancedSearch}
          savedPostIds={savedPostIds}
        />;
    }
  };
  return (
    <UsersProvider users={allUsers}>
      <div className="min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-300">
        <ToastContainer />
        <Header 
          user={appUser} 
          onNavigateProfile={() => handleNavigation('Profile')} 
          onSearch={setSearchQuery} 
          onNavigateHome={() => handleNavigation('Home')} 
          onNavigateToAdvancedSearch={handleNavigateToAdvancedSearch} 
          query={searchQuery} 
          allUsers={filteredContent.filteredAllUsers} 
          communities={communities} 
          trendingTopics={trendingTopics} 
          onNavigateToUser={(id) => { handleViewProfile(id); setSearchQuery(''); }} 
          onNavigateToCommunity={(id) => { handleViewCommunity(id); setSearchQuery(''); }} 
          onNavigateToTopic={(tag) => { handleViewTag(tag); setSearchQuery(''); }}
          onToggleMobileSidebar={handleToggleMobileSidebar}
          isMobileSidebarOpen={isMobileSidebarOpen}
          onLogout={handleLogout}
        />
        
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden" 
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
        
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 lg:gap-8 pt-16 sm:pt-20">
          {/* Mobile Sidebar */}
          <aside className={`fixed top-16 left-0 w-64 h-full bg-light-card dark:bg-dark-card border-r border-light-border dark:border-dark-border z-50 transform transition-transform duration-300 md:hidden ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <Sidebar 
              user={appUser}
              currentPage={currentPage} 
              setCurrentPage={(page) => {
                handleNavigation(page);
                setIsMobileSidebarOpen(false);
              }} 
              unreadNotificationsCount={unreadNotificationsCount} 
              unreadMessagesCount={unreadMessagesCount} 
              isCollapsed={false}
              pendingModerationCount={pendingModerationCount}
              pendingAppealsCount={pendingAppealsCount}
            />
          </aside>
          
          {/* Desktop Sidebar */}
          <aside className={`hidden md:block relative transition-all duration-300 ${isSidebarCollapsed ? 'md:col-span-1' : 'md:col-span-3 lg:col-span-2'}`}>
            <Sidebar 
              user={appUser}
              currentPage={currentPage} 
              setCurrentPage={handleNavigation} 
              unreadNotificationsCount={unreadNotificationsCount} 
              unreadMessagesCount={unreadMessagesCount} 
              isCollapsed={isSidebarCollapsed}
              pendingModerationCount={pendingModerationCount}
              pendingAppealsCount={pendingAppealsCount}
            />
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
              className="absolute top-5 -right-4 z-10 bg-light-card dark:bg-dark-card p-1.5 rounded-full shadow-lg border border-light-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={isSidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
            >
              <ChevronLeftIcon className={`h-5 w-5 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </aside>
          
          <main ref={mainContentRef} id="main-content" className={`transition-all duration-300 ${isSidebarCollapsed ? 'md:col-span-11 lg:col-span-8' : 'md:col-span-9 lg:col-span-7'}`}>
            {renderPage()}
          </main>
          
          <aside className="hidden lg:block lg:col-span-3">
            <Rightbar 
              trendingTopics={trendingTopics} 
              usersToFollow={filteredContent.filteredUsersToFollow} 
              onViewTag={handleViewTag} 
              onViewProfile={handleViewProfile} 
              followedUserIds={followedUserIds} 
              onFollowToggle={handleFollowToggle} 
              onNavigateAbout={() => handleNavigation('About')} 
              onNavigateTerms={() => handleNavigation('TermsOfService')} 
              onNavigatePrivacy={() => handleNavigation('PrivacyPolicy')} 
              onNavigateCookies={() => handleNavigation('CookiePolicy')} 
              onNavigateDisclaimer={() => handleNavigation('Disclaimer')} 
              onNavigateAccessibility={() => handleNavigation('Accessibility')} 
              onOpenFollowModal={handleOpenFollowModal} 
              currentUser={appUser!} 
              onNavigatePremium={() => handleNavigation('Premium')} 
              onNavigateTrendingTopics={() => handleNavigation('TrendingTopics')}
              onNavigateExploreUsers={() => handleNavigation('ExploreUsers')}
            />
          </aside>
        </div>
        
        {isFollowModalOpen && followModalData && (
          <FollowListModal 
            isOpen={isFollowModalOpen} 
            onClose={() => setIsFollowModalOpen(false)} 
            initialUser={followModalData.user} 
            initialFollowers={followModalData.initialFollowers} 
            initialFollowing={followModalData.initialFollowing} 
            initialTab={followModalData.initialTab} 
            currentUser={appUser} 
            followedUserIds={followedUserIds} 
            onFollowToggle={handleFollowToggle} 
            onViewProfile={(id) => { setIsFollowModalOpen(false); handleViewProfile(id); }} 
            onFetchFollows={handleFetchFollows} 
          />
        )}
        
        {/* Botão de Suporte Flutuante - Apenas para usuários Basic, Pro e Premium */}
        {(appUser.plan === 'basic' || appUser.plan === 'pro' || appUser.plan === 'premium') && (
          <SupportButton user={appUser} variant="floating" />
        )}

        <MobileBottomNav
          currentPage={currentPage}
          onNavigate={(p) => handleNavigation(p)}
          unreadNotificationsCount={unreadNotificationsCount}
          unreadMessagesCount={unreadMessagesCount}
        />
      </div>
    </UsersProvider>
  );
};

export default App;

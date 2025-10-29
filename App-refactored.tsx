import React, { useEffect, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Rightbar from '@/components/layout/Rightbar';
import Header from '@/components/layout/Header';
import ToastContainer from '@/components/common/ToastContainer';
import FollowListModal from '@/components/profile/FollowListModal';
import SplashScreen from '@/pages/SplashScreen';
import UpdatePassword from '@/pages/UpdatePassword';
import Login from '@/pages/Login';
import { ChevronLeftIcon } from './components/icons/ChevronLeftIcon';

// Router
import { AppRouter } from '@/src/components/routing/AppRouter';

// Contexts
import { useSession } from '@/contexts/SessionContext';
import { UsersProvider } from '@/contexts/UsersContext';
import { NavigationProvider, useNavigation, Page } from '@/src/contexts/NavigationContext';
import { UIStateProvider, useUIState } from '@/src/contexts/UIStateContext';

// Hooks
import { useUserData } from '@/src/hooks/useUserData';
import { usePosts } from '@/src/hooks/usePosts';
import { useCommunities } from '@/src/hooks/useCommunities';
import { useNotifications } from '@/src/hooks/useNotifications';
import { useConversations } from '@/src/hooks/useConversations';
import { useModerationData } from '@/src/hooks/useModerationData';

// API
import * as api from '@/src/services/api';

// Types
import { User } from '@/types';

const AppContent: React.FC = () => {
  const { session, user: appUser, loading: sessionLoading, refreshUser } = useSession();
  const { 
    navigationState,
    handleFetchFollows, 
    handleViewPost,
    handleViewProfile,
    handleViewCommunity,
    handleViewTag,
    handleNavigation,
    handleNavigateToAdvancedSearch,
    setSearchQuery,
    setCurrentPage
  } = useNavigation();
  const { 
    uiState, 
    setShowSplashScreen, 
    setIsSidebarCollapsed, 
    setIsMobileSidebarOpen,
    handleOpenFollowModal,
    handleToggleMobileSidebar,
    setIsFollowModalOpen,
    setFollowModalData 
  } = useUIState();

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Adapter function for setCurrentPage
  const adaptedSetCurrentPage = (page: string) => {
    const validPages: Page[] = ['Home', 'Profile', 'Settings', 'Notifications', 'Messages', 'Saved', 'Communities', 'Timeline', 'PostDetail', 'Search', 'CommunityDetail', 'TopicDetail', 'About', 'TermsOfService', 'PrivacyPolicy', 'CookiePolicy', 'Disclaimer', 'Accessibility', 'UpdatePassword', 'Moderation', 'Dashboard', 'Appeals', 'Premium', 'TrendingTopics', 'ExploreUsers'];
    if (validPages.includes(page as Page)) {
      setCurrentPage(page as Page);
    }
  };

  const mainContentRef = useRef<HTMLDivElement>(null);

  // Data hooks
  const {
    allUsers,
    followedUserIds,
    blockedUserIds,
    blockedUsersList,
    usersToFollow,
    handleUpdateUser,
    handleFollowToggle,
    handleBlockToggle,
  } = useUserData(appUser, () => Promise.resolve());

  const {
    posts,
    isPostsLoading,
    savedPostIds,
    handleAddPost,
    handleUpdatePost,
    handleDeletePost,
    handleToggleLike,
    handleToggleSavePost,
    handleAddComment,
    handleUpdateComment,
    handleDeleteComment,
    handleToggleCommentLike,
    handleVoteOnPoll,
    handleIncrementView,
  } = usePosts(appUser, allUsers, () => {}, () => {});

  const {
    communities,
    joinedCommunityIds,
    trendingTopics,
    handleJoinCommunityToggle,
    handleCreateCommunity,
    fetchTrendingTopics,
  } = useCommunities(appUser);

  const {
    notifications,
    unreadNotificationsCount,
    handleClearNotifications,
    markNotificationsAsRead,
  } = useNotifications(appUser, allUsers);

  const {
    conversations,
    unreadMessagesCount,
    handleSendMessage,
    isLoading: isConversationsLoading,
    markMessagesAsRead,
    handleDeleteConversation,
  } = useConversations(appUser);

  const {
    moderationQueue,
    appealsQueue,
    pendingModerationCount,
    pendingAppealsCount,
    isLoadingModeration,
    refetchModerationData,
  } = useModerationData(appUser);

  // Filtered content based on blocked users and muted words
  const filteredContent = React.useMemo(() => {
    const filteredPosts = posts.filter(post => 
      !blockedUserIds.includes(post.user.id) &&
      !appUser?.mutedWords?.some((word: string) => 
        post.text.toLowerCase().includes(word.toLowerCase())
      )
    );

    const filteredNotifications = notifications.filter(notification => 
      !blockedUserIds.includes(notification.actor?.id || '')
    );

    const filteredConversations = conversations.filter(conversation => 
      !conversation.participants.some(participant => blockedUserIds.includes(participant.id))
    );

    const filteredUsersToFollow = allUsers.filter(user => 
      user.id !== appUser?.id && 
      !followedUserIds.includes(user.id) &&
      !blockedUserIds.includes(user.id)
    ).slice(0, 5);

    const filteredAllUsers = allUsers.filter(user => 
      !blockedUserIds.includes(user.id)
    );

    return {
      filteredPosts,
      filteredNotifications,
      filteredConversations,
      filteredUsersToFollow,
      filteredAllUsers,
    };
  }, [posts, notifications, conversations, allUsers, blockedUserIds, followedUserIds, appUser]);

  // Splash screen logic
  useEffect(() => {
    if (session && appUser) {
      const timer = setTimeout(() => {
        setShowSplashScreen(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [session, appUser, setShowSplashScreen]);

  // Adapted function for FollowListModal
  const adaptedFetchFollows = async (userId: string): Promise<{ followers: User[], following: User[] }> => {
    const followers = await handleFetchFollows(userId, 'followers');
    const following = await handleFetchFollows(userId, 'following');
    return { followers, following };
  };

  // Adapted function for Rightbar
  const adaptedOpenFollowModal = async (user: User, tab: 'followers' | 'following' = 'followers') => {
    const { followers, following } = await adaptedFetchFollows(user.id);
    handleOpenFollowModal(user, followers, following, tab);
  };

  // Adapted functions for AppRouter
  const adaptedToggleLike = (postId: string) => {
    handleToggleLike(postId, false); // Default to false for isCurrentlyLiked
  };

  const adaptedToggleCommentLike = (commentId: string) => {
    handleToggleCommentLike(commentId, '', false); // Default values for postId and isCurrentlyLiked
  };

  const adaptedIncrementView = (postId: string) => {
    handleIncrementView('post', postId); // Default to 'post' type
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await api.logout();
      window.location.reload();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Force web browser logout
  const forceWebBrowserLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  // Wrapper function to adapt Page vs string types
  const adaptedHandleNavigation = (page: string) => {
    handleNavigation(page as any);
  };

  // Show splash screen
  if (uiState.showSplashScreen && session && appUser) {
    return <SplashScreen />;
  }

  // Show update password if needed
  if (session?.user?.user_metadata?.force_password_update) {
    return <UpdatePassword />;
  }

  // Show login if no session
  if (!session) {
    return <Login />;
  }

  // Show loading if no user data
  if (!appUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <UsersProvider users={allUsers}>
      <div className="min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-300">
        <ToastContainer />
        
        <Header 
          user={appUser} 
          onNavigateProfile={() => handleViewProfile(appUser.id)} 
          onSearch={setSearchQuery} 
          onNavigateHome={() => setCurrentPage('Home')} 
          onNavigateToAdvancedSearch={handleNavigateToAdvancedSearch} 
          query={navigationState.searchQuery} 
          allUsers={filteredContent.filteredAllUsers} 
          communities={communities} 
          trendingTopics={trendingTopics} 
          onNavigateToUser={(id) => { 
            handleViewProfile(id); 
            setSearchQuery(''); 
          }} 
          onNavigateToCommunity={(id) => { 
            handleViewCommunity(id); 
            setSearchQuery(''); 
          }} 
          onNavigateToTopic={(tag) => { 
            handleViewTag(tag); 
            setSearchQuery(''); 
          }}
          onToggleMobileSidebar={handleToggleMobileSidebar}
          isMobileSidebarOpen={uiState.isMobileSidebarOpen}
          onLogout={handleLogout}
        />
        
        {/* Mobile Sidebar Overlay */}
        {uiState.isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden" 
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
        
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 lg:gap-8 pt-16 sm:pt-20">
          {/* Mobile Sidebar */}
          <aside className={`fixed top-16 left-0 w-64 h-full bg-light-card dark:bg-dark-card border-r border-light-border dark:border-dark-border z-50 transform transition-transform duration-300 md:hidden ${uiState.isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <Sidebar 
              user={appUser}
              currentPage={navigationState.currentPage} 
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
          <aside className={`hidden md:block relative transition-all duration-300 ${uiState.isSidebarCollapsed ? 'md:col-span-1' : 'md:col-span-3 lg:col-span-2'}`}>
            <Sidebar 
              user={appUser}
              currentPage={navigationState.currentPage} 
              setCurrentPage={adaptedHandleNavigation} 
              unreadNotificationsCount={unreadNotificationsCount} 
              unreadMessagesCount={unreadMessagesCount} 
              isCollapsed={uiState.isSidebarCollapsed}
              pendingModerationCount={pendingModerationCount}
              pendingAppealsCount={pendingAppealsCount}
            />
            <button 
              onClick={() => setIsSidebarCollapsed(!uiState.isSidebarCollapsed)} 
              className="absolute top-5 -right-4 z-10 bg-light-card dark:bg-dark-card p-1.5 rounded-full shadow-lg border border-light-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={uiState.isSidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
            >
              <ChevronLeftIcon className={`h-5 w-5 transition-transform duration-300 ${uiState.isSidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </aside>
          
          <main ref={mainContentRef} id="main-content" className={`transition-all duration-300 ${uiState.isSidebarCollapsed ? 'md:col-span-11 lg:col-span-8' : 'md:col-span-9 lg:col-span-7'}`}>
            <AppRouter 
              // Navigation props
              currentPage={navigationState.currentPage}
              activePostId={navigationState.activePostId}
              activeCommentId={navigationState.activeCommentId}
              viewedUserId={navigationState.viewedUserId}
              activeCommunityId={navigationState.activeCommunityId}
              activeTag={navigationState.activeTag}
              searchQuery={navigationState.searchQuery}
              handleNavigation={adaptedHandleNavigation}
              handleViewPost={handleViewPost}
              handleViewProfile={handleViewProfile}
              handleViewCommunity={handleViewCommunity}
              handleViewTag={handleViewTag}
              handleNavigateToAdvancedSearch={handleNavigateToAdvancedSearch}
              setSearchQuery={setSearchQuery}
              setCurrentPage={adaptedSetCurrentPage}
              
              // User and session props
              appUser={appUser}
              session={session}
              sessionLoading={sessionLoading}
              refreshUser={refreshUser}
              
              // Data props
              posts={posts}
              allUsers={allUsers}
              communities={communities}
              notifications={notifications}
              conversations={conversations}
              moderationQueue={moderationQueue}
              appealsQueue={appealsQueue}
              trendingTopics={trendingTopics}
              
              // State props
              followedUserIds={followedUserIds}
              blockedUserIds={blockedUserIds}
              blockedUsersList={blockedUsersList}
              usersToFollow={usersToFollow}
              joinedCommunityIds={joinedCommunityIds}
              savedPostIds={savedPostIds}
              unreadNotificationsCount={unreadNotificationsCount}
              unreadMessagesCount={unreadMessagesCount}
              pendingModerationCount={pendingModerationCount}
              pendingAppealsCount={pendingAppealsCount}
              
              // Loading states
              isPostsLoading={isPostsLoading}
              isConversationsLoading={isConversationsLoading}
              isLoadingModeration={isLoadingModeration}
              
              // Handler props
              handleFollowToggle={handleFollowToggle}
              handleBlockToggle={handleBlockToggle}
              handleUpdateUser={handleUpdateUser}
              handleJoinCommunityToggle={handleJoinCommunityToggle}
              handleCreateCommunity={handleCreateCommunity}
              handleAddPost={handleAddPost}
              handleDeletePost={handleDeletePost}
              handleUpdatePost={handleUpdatePost}
              handleToggleLike={adaptedToggleLike}
              handleToggleCommentLike={adaptedToggleCommentLike}
              handleToggleSavePost={handleToggleSavePost}
              handleVoteOnPoll={handleVoteOnPoll}
              handleAddComment={handleAddComment}
              handleUpdateComment={handleUpdateComment}
              handleDeleteComment={handleDeleteComment}
              handleIncrementView={adaptedIncrementView}
              handleClearNotifications={handleClearNotifications}
              markNotificationsAsRead={markNotificationsAsRead}
              handleSendMessage={handleSendMessage}
              markMessagesAsRead={markMessagesAsRead}
              handleDeleteConversation={handleDeleteConversation}
              refetchModerationData={refetchModerationData}
              fetchTrendingTopics={fetchTrendingTopics}
              handleFetchFollows={adaptedFetchFollows}
              
              // UI state props
              handleOpenFollowModal={adaptedOpenFollowModal}
              setFollowModalData={setFollowModalData}
              scrollToTop={scrollToTop}
              handleLogout={handleLogout}
            />
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
              onOpenFollowModal={adaptedOpenFollowModal} 
              currentUser={appUser} 
              onNavigatePremium={() => handleNavigation('Premium')} 
              onNavigateTrendingTopics={() => handleNavigation('TrendingTopics')}
              onNavigateExploreUsers={() => handleNavigation('ExploreUsers')}
            />
          </aside>
        </div>
        
        {uiState.isFollowModalOpen && uiState.followModalData && (
          <FollowListModal 
            isOpen={uiState.isFollowModalOpen} 
            onClose={() => setIsFollowModalOpen(false)} 
            initialUser={uiState.followModalData.user} 
            initialFollowers={uiState.followModalData.initialFollowers} 
            initialFollowing={uiState.followModalData.initialFollowing} 
            initialTab={uiState.followModalData.initialTab} 
            currentUser={appUser} 
            followedUserIds={followedUserIds} 
            onFollowToggle={handleFollowToggle} 
            onViewProfile={(id) => { 
              setIsFollowModalOpen(false); 
              handleViewProfile(id); 
            }} 
            onFetchFollows={adaptedFetchFollows} 
          />
        )}
      </div>
    </UsersProvider>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <NavigationProvider>
        <UIStateProvider>
          <AppContent />
        </UIStateProvider>
      </NavigationProvider>
    </BrowserRouter>
  );
};

export default App;
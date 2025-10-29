import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';

// Layout Components
import Sidebar from '@/components/layout/Sidebar';
import Rightbar from '@/components/layout/Rightbar';
import Header from '@/components/layout/Header';
import ToastContainer from '@/components/common/ToastContainer';
import FollowListModal from '@/components/profile/FollowListModal';
import SplashScreen from '@/pages/SplashScreen';

// Routing
import { AppRouter } from '@/src/components/routing/AppRouter';

// Contexts
import { useSession } from '@/contexts/SessionContext';
import { UsersProvider } from '@/contexts/UsersContext';
import { NavigationProvider, useNavigation, Page } from '@/src/contexts/NavigationContext';
import { UIStateProvider, useUIState } from '@/src/contexts/UIStateContext';

// Custom Hooks
import { useUserData } from '@/src/hooks/useUserData';
import { usePosts } from '@/src/hooks/usePosts';
import { useCommunities } from '@/src/hooks/useCommunities';
import { useNotifications } from '@/src/hooks/useNotifications';
import { useConversations } from '@/src/hooks/useConversations';
import { useModerationData } from '@/src/hooks/useModerationData';

// Types
import { User, ActiveMember } from '@/types';

// Services
import * as api from '@/src/services/api';

const AppContent: React.FC = () => {
  const { session, user: appUser, loading: sessionLoading, refreshUser } = useSession();
  const { 
    navigationState,
    handleNavigation,
    handleViewPost,
    handleViewProfile,
    handleViewCommunity,
    handleViewTag,
    handleNavigateToAdvancedSearch,
    setSearchQuery,
    setCurrentPage,
    handleFetchFollows
  } = useNavigation();
  
  const {
    currentPage, 
    activePostId, 
    activeCommentId, 
    viewedUserId, 
    activeCommunityId, 
    activeTag, 
    searchQuery
  } = navigationState;
  
  const {
    uiState,
    setIsFollowModalOpen,
    setFollowModalData,
    setShowSplashScreen,
    setIsSidebarCollapsed,
    setIsMobileSidebarOpen,
    handleOpenFollowModal,
    handleToggleMobileSidebar
  } = useUIState();
  
  const {
    isFollowModalOpen,
    followModalData,
    showSplashScreen,
    isSidebarCollapsed,
    isMobileSidebarOpen
  } = uiState;

  // Local state
  const [activeMembers, setActiveMembers] = useState<ActiveMember[]>([]);
  const mainContentRef = useRef<HTMLElement>(null);
  const previousUserRef = useRef<User | null>(null);

  // Custom Hooks for data logic
  const { 
    allUsers, 
    followedUserIds, 
    blockedUserIds, 
    blockedUsersList, 
    usersToFollow, 
    handleFollowToggle, 
    handleBlockToggle, 
    handleUpdateUser 
  } = useUserData(appUser, refreshUser);
  
  const { 
    communities, 
    setCommunities, 
    joinedCommunityIds, 
    trendingTopics, 
    handleJoinCommunityToggle, 
    handleCreateCommunity, 
    fetchTrendingTopics 
  } = useCommunities(appUser);
  
  const { 
    posts, 
    isPostsLoading, 
    savedPostIds, 
    handleAddPost, 
    handleDeletePost, 
    handleUpdatePost, 
    handleToggleLike, 
    handleToggleCommentLike, 
    handleToggleSavePost, 
    handleVoteOnPoll, 
    handleAddComment, 
    handleUpdateComment, 
    handleDeleteComment, 
    handleIncrementView 
  } = usePosts(appUser, allUsers, setCommunities, fetchTrendingTopics);
  
  const { 
    notifications, 
    unreadNotificationsCount, 
    handleClearNotifications, 
    markNotificationsAsRead 
  } = useNotifications(appUser, allUsers);
  
  const { 
    conversations, 
    unreadMessagesCount, 
    handleSendMessage, 
    isLoading: isConversationsLoading, 
    markMessagesAsRead, 
    handleDeleteConversation 
  } = useConversations(appUser);
  
  const { 
    moderationQueue, 
    appealsQueue, 
    pendingModerationCount, 
    pendingAppealsCount, 
    isLoadingModeration, 
    refetchModerationData 
  } = useModerationData(appUser);

  // Effects
  useEffect(() => {
    console.log('%c[App.tsx] Estado do usuário atualizado:', 'color: magenta; font-weight: bold;', appUser);
    if (appUser) {
      console.log(`%c[App.tsx] A função atual do usuário é: ${appUser.role}`, 'color: magenta; font-weight: bold;');
    }
  }, [appUser]);

  // Splash screen logic
  useEffect(() => {
    if (!sessionLoading && session) {
      const timer = setTimeout(() => {
        setShowSplashScreen(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [sessionLoading, session, setShowSplashScreen]);

  // Utility functions
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };



  const handleLogout = async () => {
    try {
      // Timeout para evitar que o logout trave indefinidamente
      const logoutPromise = api.logout();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout no logout')), 10000)
      );

      const result = await Promise.race([logoutPromise, timeoutPromise]);
      const error = (result as any)?.error;

      if (error) {
        console.warn('Erro durante o logout, mas continuando com redirecionamento:', error);
      }
      
      window.location.reload();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, forçar redirecionamento para garantir que o usuário seja deslogado
      window.location.reload();
    }
  };

  // Wrapper function to adapt handleFetchFollows signature for FollowListModal
  const adaptedFetchFollows = async (userId: string): Promise<{ followers: User[], following: User[] }> => {
    const [followers, following] = await Promise.all([
      handleFetchFollows(userId, 'followers'),
      handleFetchFollows(userId, 'following')
    ]);
    return { followers, following };
  };

  // Wrapper function to adapt handleOpenFollowModal signature for Rightbar
  const adaptedOpenFollowModal = async (user: User, tab: 'followers' | 'following' = 'followers') => {
    const { followers, following } = await adaptedFetchFollows(user.id);
    handleOpenFollowModal(user, followers, following, tab);
  };

  // Wrapper functions to adapt signatures for AppRouter
  const adaptedToggleLike = (postId: string) => {
    handleToggleLike(postId, false); // Default to false for isCurrentlyLiked
  };

  const adaptedToggleCommentLike = (commentId: string) => {
    handleToggleCommentLike(commentId, '', false); // Default values for postId and isCurrentlyLiked
  };

  const adaptedIncrementView = (postId: string) => {
    handleIncrementView('post', postId); // Default to 'post' type
  };

  // Wrapper functions to adapt Page vs string types
  const adaptedHandleNavigation = (page: string) => {
    handleNavigation(page as Page);
  };

  const adaptedSetCurrentPage = (page: string) => {
    setCurrentPage(page as Page);
  };

  // Filter functions
  const filteredPosts = posts.filter(post => {
    if (currentPage === 'Home') {
      if (!appUser) return true;
      return followedUserIds.includes(post.user.id) || post.user.id === appUser.id;
    }
    if (currentPage === 'Profile' && viewedUserId) {
      return post.user.id === viewedUserId;
    }
    if (currentPage === 'CommunityDetail' && activeCommunityId) {
      return post.communityId === activeCommunityId;
    }
    if (currentPage === 'TopicDetail' && activeTag) {
      return post.tags?.includes(activeTag);
    }
    if (currentPage === 'Search' && searchQuery) {
      const query = searchQuery.toLowerCase();
      return post.text.toLowerCase().includes(query) ||
             post.tags?.some(tag => tag.toLowerCase().includes(query));
    }
    return true;
  });

  const filteredUsers = allUsers.filter(user => {
    if (currentPage === 'Search' && searchQuery) {
      const query = searchQuery.toLowerCase();
      return user.username.toLowerCase().includes(query) ||
             user.name.toLowerCase().includes(query);
    }
    return true;
  });

  const filteredCommunities = communities.filter(community => {
    if (currentPage === 'Search' && searchQuery) {
      const query = searchQuery.toLowerCase();
      return community.name.toLowerCase().includes(query) ||
             community.description.toLowerCase().includes(query);
    }
    return true;
  });

  // Show splash screen
  if (showSplashScreen && !sessionLoading && session) {
    return <SplashScreen />;
  }

  // Show login if no session
  if (!sessionLoading && !session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AppRouter
          // Navigation props
          currentPage={currentPage}
          activePostId={activePostId}
          activeCommentId={activeCommentId}
          viewedUserId={viewedUserId}
          activeCommunityId={activeCommunityId}
          activeTag={activeTag}
          searchQuery={searchQuery}
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
          posts={filteredPosts}
          allUsers={filteredUsers}
          communities={filteredCommunities}
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
        <ToastContainer />
      </div>
    );
  }

  return (
    <UsersProvider users={allUsers}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ToastContainer />
        
        {appUser && (
          <Header 
            user={appUser}
            onNavigateProfile={() => handleNavigation('Profile')}
            onSearch={setSearchQuery}
            onNavigateHome={() => handleNavigation('Home')}
            onNavigateToAdvancedSearch={handleNavigateToAdvancedSearch}
            query={searchQuery}
            allUsers={allUsers}
            communities={communities}
            trendingTopics={trendingTopics}
            onNavigateToUser={handleViewProfile}
            onNavigateToCommunity={handleViewCommunity}
            onNavigateToTopic={handleViewTag}
            onToggleMobileSidebar={handleToggleMobileSidebar}
            onLogout={handleLogout}
          />
        )}

        {/* Mobile Sidebar */}
        <Sidebar
          user={appUser}
          currentPage={currentPage}
          setCurrentPage={adaptedSetCurrentPage}
          unreadNotificationsCount={unreadNotificationsCount}
          unreadMessagesCount={unreadMessagesCount}
          pendingModerationCount={pendingModerationCount}
          pendingAppealsCount={pendingAppealsCount}
          isCollapsed={false}
        />

        <div className="flex">
          {/* Desktop Sidebar */}
          <Sidebar
            user={appUser}
            currentPage={currentPage}
            setCurrentPage={adaptedSetCurrentPage}
            unreadNotificationsCount={unreadNotificationsCount}
            unreadMessagesCount={unreadMessagesCount}
            pendingModerationCount={pendingModerationCount}
            pendingAppealsCount={pendingAppealsCount}
            isCollapsed={isSidebarCollapsed}
          />

          <main 
            ref={mainContentRef}
            className={`flex-1 transition-all duration-300 ${
              isSidebarCollapsed ? 'ml-16' : 'ml-64'
            } lg:mr-80`}
          >
          <AppRouter
            // Navigation props
            currentPage={currentPage}
            activePostId={activePostId}
            activeCommentId={activeCommentId}
            viewedUserId={viewedUserId}
            activeCommunityId={activeCommunityId}
            activeTag={activeTag}
            searchQuery={searchQuery}
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
            posts={filteredPosts}
            allUsers={filteredUsers}
            communities={filteredCommunities}
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

        {appUser && (
          <Rightbar
            currentUser={appUser}
            usersToFollow={usersToFollow}
            trendingTopics={trendingTopics}
            followedUserIds={followedUserIds}
            onViewProfile={handleViewProfile}
            onViewTag={handleViewTag}
            onFollowToggle={handleFollowToggle}
            onOpenFollowModal={adaptedOpenFollowModal}
            onNavigateAbout={() => {}}
            onNavigateTerms={() => {}}
            onNavigatePrivacy={() => {}}
            onNavigateCookies={() => {}}
            onNavigateDisclaimer={() => {}}
            onNavigateAccessibility={() => {}}
            onNavigatePremium={() => {}}
          />
        )}
      </div>

      {isFollowModalOpen && followModalData && appUser && (
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
          onViewProfile={handleViewProfile}
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
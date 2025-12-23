import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PageLoader from '../common/PageLoader';
import { User } from '@/types';

// Lazy loaded components
import {
  LazyHome,
  LazyProfile,
  LazySettings,
  LazyNotifications,
  LazyMessages,
  LazySaved,
  LazyCommunities,
  LazyPostDetail,
  LazySearch,
  LazyCommunityDetail,
  LazyTopicDetail,
  LazyTimeline,
  LazyAbout,
  LazyTermsOfService,
  LazyPrivacyPolicy,
  LazyCookiePolicy,
  LazyDisclaimer,
  LazyAccessibility,
  LazyModeration,
  LazyDashboard,
  LazyAppeals,
  LazyAdmin,
  LazyPremiumPage,
  LazyTrendingTopicsPage,
  LazyExploreUsers,
  LazyTestAnalytics,
  LazyLogin,
  LazyUpdatePassword,
  LazySplashScreen,
} from './LazyPages';

// Loading component for full page
const FullPageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <PageLoader message="Carregando página..." size="large" />
  </div>
);

interface AppRouterProps {
  // Navigation props
  currentPage: string;
  activePostId: string | null;
  activeCommentId: string | null;
  viewedUserId: string | null;
  activeCommunityId: string | null;
  activeTag: string | null;
  searchQuery: string;
  handleNavigation: (page: string) => void;
  handleViewPost: (postId: string, commentId?: string) => void;
  handleViewProfile: (userId: string) => void;
  handleViewCommunity: (communityId: string) => void;
  handleViewTag: (tag: string) => void;
  handleNavigateToAdvancedSearch: () => void;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: string) => void;
  
  // User and session props
  appUser: any;
  session: any;
  sessionLoading: boolean;
  refreshUser: () => void;
  
  // Data props
  posts: any[];
  allUsers: any[];
  communities: any[];
  notifications: any[];
  conversations: any[];
  moderationQueue: any[];
  appealsQueue: any[];
  trendingTopics: any[];
  
  // State props
  followedUserIds: string[];
  blockedUserIds: string[];
  blockedUsersList: any[];
  usersToFollow: any[];
  joinedCommunityIds: string[];
  savedPostIds: string[];
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
  pendingModerationCount: number;
  pendingAppealsCount: number;
  
  // Loading states
  isPostsLoading: boolean;
  isConversationsLoading: boolean;
  isLoadingModeration: boolean;
  
  // Handler props
  handleFollowToggle: (userId: string) => void;
  handleBlockToggle: (userId: string) => void;
  handleUpdateUser: (updates: any) => Promise<void>;
  handleJoinCommunityToggle: (communityId: string) => void;
  handleCreateCommunity: (community: any) => Promise<void>;
  handleAddPost: (post: any) => void;
  handleDeletePost: (postId: string) => void;
  handleUpdatePost: (postId: string, updates: any) => void;
  handleToggleLike: (postId: string) => void;
  handleToggleCommentLike: (commentId: string) => void;
  handleToggleSavePost: (postId: string) => void;
  handleVoteOnPoll: (postId: string, optionIndex: number) => void;
  handleAddComment: (postId: string, comment: any) => void;
  handleUpdateComment: (commentId: string, updates: any) => void;
  handleDeleteComment: (commentId: string) => void;
  handleIncrementView: (postId: string) => void;
  handleClearNotifications: () => void;
  markNotificationsAsRead: () => void;
  handleSendMessage: (params: { conversationId?: string, targetUserId?: string, text: string }) => Promise<string | undefined>;
  markMessagesAsRead: (conversationId: string) => void;
  handleDeleteConversation: (conversationId: string) => Promise<void>;
  refetchModerationData: () => void;
  fetchTrendingTopics: () => void;
  handleFetchFollows: (userId: string) => Promise<{ followers: User[], following: User[] }>;
  
  // UI state props
  handleOpenFollowModal: (user: User, tab: 'followers' | 'following') => void;
  setFollowModalData: (data: any) => void;
  scrollToTop: () => void;
  handleLogout: () => void;
}

export const AppRouter: React.FC<AppRouterProps> = (props) => {
  // Se não há sessão, mostrar login
  if (!props.session) {
    return (
      <Routes>
        <Route path="/login" element={<LazyLogin />} />
        <Route path="/update-password" element={<LazyUpdatePassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        {/* Página inicial */}
        <Route path="/" element={
          <LazyHome 
            posts={props.posts}
            onFollowToggle={props.handleFollowToggle}
            onToggleLike={props.handleToggleLike}
            onToggleSave={props.handleToggleSavePost}
            onAddComment={props.handleAddComment}
            onUpdateComment={props.handleUpdateComment}
            onDeleteComment={props.handleDeleteComment}
            onToggleCommentLike={props.handleToggleCommentLike}
            onVoteOnPoll={props.handleVoteOnPoll}
            onViewPost={props.handleViewPost}
            onViewProfile={props.handleViewProfile}
            onOpenFollowModal={props.handleOpenFollowModal}
            onIncrementView={props.handleIncrementView}
            onAddPost={props.handleAddPost}
            onUpdatePost={props.handleUpdatePost}
            onDeletePost={props.handleDeletePost}
            usersToFollow={props.usersToFollow}
            trendingTopics={props.trendingTopics}
            onJoinCommunity={props.handleJoinCommunityToggle}
            user={props.appUser}
            communities={props.communities}
            joinedCommunityIds={props.joinedCommunityIds}
            blockedUserIds={props.blockedUserIds}
            onBlockToggle={props.handleBlockToggle}
            shareableUsers={props.allUsers}
            onSendMessage={props.handleSendMessage}
            followedUserIds={props.followedUserIds}
            allUsers={props.allUsers}
            setCurrentPage={props.setCurrentPage}
            onViewCommunity={props.handleViewCommunity}
            onViewTag={props.handleViewTag}
            onNavigateToAdvancedSearch={props.handleNavigateToAdvancedSearch}
            savedPostIds={props.savedPostIds}
          />
        } />

        {/* Perfil */}
        <Route path="/profile/:userId?" element={
          <LazyProfile 
            user={props.viewedUserId ? props.allUsers.find(u => u.id === props.viewedUserId) : props.appUser}
            posts={props.posts.filter(p => p.user?.id === (props.viewedUserId || props.appUser?.id))}
            followers={[]}
            following={[]}
            onUpdatePost={props.handleUpdatePost}
            savedPostIds={props.savedPostIds}
            onToggleSave={props.handleToggleSavePost}
            onUpdateUser={props.viewedUserId === props.appUser?.id ? props.handleUpdateUser : undefined}
            onViewPost={props.handleViewPost}
            currentUser={props.appUser}
            onUpdateCurrentUser={props.handleUpdateUser}
            followedUserIds={props.followedUserIds}
            onFollowToggle={props.handleFollowToggle}
            blockedUserIds={props.blockedUserIds}
            onBlockToggle={props.handleBlockToggle}
            onToggleLike={props.handleToggleLike}
            onIncrementView={props.handleIncrementView}
            onDeletePost={props.handleDeletePost}
            shareableUsers={props.allUsers}
            onSendMessage={props.handleSendMessage}
            onViewProfile={props.handleViewProfile}
            onFetchFollows={props.handleFetchFollows}
            onOpenFollowModal={props.handleOpenFollowModal}
            onVoteOnPoll={props.handleVoteOnPoll}
            allUsers={props.allUsers}
          />
        } />

        {/* Configurações */}
        <Route path="/settings" element={
          <LazySettings 
            onLogout={props.handleLogout}
            user={props.appUser}
            onUpdateUser={() => props.handleUpdateUser({})}
            blockedUsers={props.blockedUsersList}
            onBlockToggle={props.handleBlockToggle}
          />
        } />

        {/* Notificações */}
        <Route path="/notifications" element={
          <LazyNotifications 
            notifications={props.notifications}
            onClearAll={props.handleClearNotifications}
            onViewPost={props.handleViewPost}
            onViewProfile={props.handleViewProfile}
            onFollowToggle={props.handleFollowToggle}
            followedUserIds={props.followedUserIds}
            currentUser={props.appUser}
            onOpenFollowModal={props.handleOpenFollowModal}
          />
        } />

        {/* Mensagens */}
        <Route path="/messages" element={
          <LazyMessages 
            conversations={props.conversations}
            handleSendMessage={props.handleSendMessage}
            isLoading={props.isConversationsLoading}
            onDeleteConversation={props.handleDeleteConversation}
            followedUsers={props.allUsers.filter(u => props.followedUserIds.includes(u.id))}
          />
        } />

        {/* Salvos */}
        <Route path="/saved" element={
          <LazySaved 
            savedPostIds={props.savedPostIds}
            posts={props.posts}
            onToggleSave={props.handleToggleSavePost}
            onViewPost={props.handleViewPost}
            user={props.appUser}
            onToggleLike={props.handleToggleLike}
            onIncrementView={props.handleIncrementView}
            onUpdatePost={props.handleUpdatePost}
            onDeletePost={props.handleDeletePost}
            onBlockToggle={props.handleBlockToggle}
            blockedUserIds={props.blockedUserIds}
            shareableUsers={props.allUsers}
            onSendMessage={props.handleSendMessage}
            followedUserIds={props.followedUserIds}
            onViewProfile={props.handleViewProfile}
            onFollowToggle={props.handleFollowToggle}
            onOpenFollowModal={props.handleOpenFollowModal}
            onVoteOnPoll={props.handleVoteOnPoll}
            allUsers={props.allUsers}
          />
        } />

        {/* Comunidades */}
        <Route path="/communities" element={
          <LazyCommunities 
            communities={props.communities}
            joinedCommunityIds={props.joinedCommunityIds}
            onJoinCommunityToggle={props.handleJoinCommunityToggle}
            onCreateCommunity={props.handleCreateCommunity}
            onViewCommunity={props.handleViewCommunity}
            user={props.appUser}
            setCurrentPage={props.setCurrentPage}
          />
        } />

        {/* Detalhes da comunidade */}
        <Route path="/community/:communityId" element={
          <LazyCommunityDetail 
            community={props.communities.find(c => c.id === props.activeCommunityId)}
            onAddPost={props.handleAddPost}
            onViewPost={props.handleViewPost}
            onViewProfile={props.handleViewProfile}
            onJoinCommunityToggle={props.handleJoinCommunityToggle}
            activeMembers={[]}
            user={props.appUser}
            posts={props.posts.filter(p => p.communityId === props.activeCommunityId)}
            onUpdatePost={props.handleUpdatePost}
            savedPostIds={props.savedPostIds}
            onToggleSave={props.handleToggleSavePost}
            onToggleLike={props.handleToggleLike}
            onIncrementView={props.handleIncrementView}
            onDeletePost={props.handleDeletePost}
            onBlockToggle={props.handleBlockToggle}
            blockedUserIds={props.blockedUserIds}
            shareableUsers={props.allUsers}
            onSendMessage={props.handleSendMessage}
            followedUserIds={props.followedUserIds}
            onFollowToggle={props.handleFollowToggle}
            onOpenFollowModal={props.handleOpenFollowModal}
            onVoteOnPoll={props.handleVoteOnPoll}
            allUsers={props.allUsers}
            isJoined={props.joinedCommunityIds.includes(props.activeCommunityId || '')}
            onNavigateBack={() => props.setCurrentPage('Communities')}
            communities={props.communities}
            joinedCommunityIds={props.joinedCommunityIds}
            setCurrentPage={props.setCurrentPage}
          />
        } />

        {/* Busca */}
        <Route path="/search" element={
          <LazySearch 
            onViewPost={props.handleViewPost}
            onViewProfile={props.handleViewProfile}
            onSearch={props.setSearchQuery}
            query={props.searchQuery}
            posts={props.posts}
            onUpdatePost={props.handleUpdatePost}
            savedPostIds={props.savedPostIds}
            onToggleSave={props.handleToggleSavePost}
            currentUser={props.appUser}
            allUsers={props.allUsers}
            onToggleLike={props.handleToggleLike}
            onIncrementView={props.handleIncrementView}
            onDeletePost={props.handleDeletePost}
            onBlockToggle={props.handleBlockToggle}
            blockedUserIds={props.blockedUserIds}
            shareableUsers={props.allUsers}
            onSendMessage={props.handleSendMessage}
            followedUserIds={props.followedUserIds}
            onFollowToggle={props.handleFollowToggle}
            onOpenFollowModal={props.handleOpenFollowModal}
            onVoteOnPoll={props.handleVoteOnPoll}
            communities={props.communities}
            joinedCommunityIds={props.joinedCommunityIds}
          />
        } />

        {/* Detalhes do post */}
        <Route path="/post/:postId" element={
          <LazyPostDetail 
            post={props.posts.find(p => p.id === props.activePostId)}
            onFollowToggle={props.handleFollowToggle}
            onToggleLike={props.handleToggleLike}
            onToggleSave={props.handleToggleSavePost}
            onAddComment={props.handleAddComment}
            onUpdateComment={props.handleUpdateComment}
            onDeleteComment={props.handleDeleteComment}
            onToggleCommentLike={props.handleToggleCommentLike}
            onVoteOnPoll={props.handleVoteOnPoll}
            onViewProfile={props.handleViewProfile}
            onOpenFollowModal={props.handleOpenFollowModal}
            onIncrementView={props.handleIncrementView}
            onUpdatePost={props.handleUpdatePost}
            onDeletePost={props.handleDeletePost}
            activeCommentId={props.activeCommentId}
            onViewCommentThread={(commentId: string) => {}}
            user={props.appUser}
            onBlockToggle={props.handleBlockToggle}
            onSendMessage={props.handleSendMessage}
            shareableUsers={props.allUsers}
            savedPostIds={props.savedPostIds}
            onToggleSaveComment={() => {}}
            savedCommentIds={[]}
            onNavigateBack={() => props.setCurrentPage('Home')}
            onViewPost={props.handleViewPost}
            blockedUserIds={props.blockedUserIds}
            followedUserIds={props.followedUserIds}
            allUsers={props.allUsers}
          />
        } />

        {/* Timeline */}
        <Route path="/timeline" element={<LazyTimeline />} />

        {/* Páginas estáticas */}
        <Route path="/about" element={<LazyAbout />} />
        <Route path="/terms" element={<LazyTermsOfService />} />
        <Route path="/privacy" element={<LazyPrivacyPolicy />} />
        <Route path="/cookies" element={<LazyCookiePolicy />} />
        <Route path="/disclaimer" element={<LazyDisclaimer />} />
        <Route path="/accessibility" element={<LazyAccessibility />} />

        {/* Premium */}
        <Route path="/premium" element={
          <LazyPremiumPage 
            user={props.appUser}
            onUpdateUser={props.handleUpdateUser}
          />
        } />

        {/* Admin */}
        <Route path="/admin" element={<LazyAdmin />} />
        <Route path="/moderation" element={
          <LazyModeration 
            queue={props.moderationQueue}
            onDataChange={props.refetchModerationData}
            isLoading={props.isLoadingModeration}
          />
        } />
        <Route path="/dashboard" element={<LazyDashboard />} />
        <Route path="/appeals" element={
          <LazyAppeals 
            appeals={props.appealsQueue}
            onDataChange={props.refetchModerationData}
            isLoading={props.isLoadingModeration}
          />
        } />

        {/* Trending Topics */}
        <Route path="/trending" element={
          <LazyTrendingTopicsPage 
            trendingTopics={props.trendingTopics}
            onViewTag={props.handleViewTag}
            onGoBack={() => props.setCurrentPage('Home')}
          />
        } />

        {/* Explore Users */}
        <Route path="/explore" element={
          <LazyExploreUsers 
            usersToFollow={props.usersToFollow}
            onFollowToggle={props.handleFollowToggle}
            onViewProfile={props.handleViewProfile}
            currentUser={props.appUser}
            followedUserIds={props.followedUserIds}
            onOpenFollowModal={props.handleOpenFollowModal}
            onGoBack={() => props.setCurrentPage('Home')}
          />
        } />

        {/* Bibliotecas removidas */}

        {/* Teste de Analytics */}
        <Route path="/test-analytics" element={<LazyTestAnalytics />} />

        {/* Topic Detail */}
        <Route path="/topic/:tag" element={
          props.activeTag ? (
            <LazyTopicDetail 
              tag={props.activeTag}
              onViewPost={props.handleViewPost}
              onViewProfile={props.handleViewProfile}
              posts={props.posts.filter(p => p.tags?.includes(props.activeTag))}
              onUpdatePost={props.handleUpdatePost}
              savedPostIds={props.savedPostIds}
              onToggleSave={props.handleToggleSavePost}
              user={props.appUser}
              onToggleLike={props.handleToggleLike}
              onIncrementView={props.handleIncrementView}
              onDeletePost={props.handleDeletePost}
              onBlockToggle={props.handleBlockToggle}
              blockedUserIds={props.blockedUserIds}
              shareableUsers={props.allUsers}
              onSendMessage={props.handleSendMessage}
              followedUserIds={props.followedUserIds}
              onFollowToggle={props.handleFollowToggle}
              onOpenFollowModal={props.handleOpenFollowModal}
              onVoteOnPoll={props.handleVoteOnPoll}
              allUsers={props.allUsers}
              onNavigateBack={() => props.setCurrentPage('Home')}
            />
          ) : <Navigate to="/" replace />
        } />

        {/* Auth routes */}
        <Route path="/login" element={<LazyLogin />} />
        <Route path="/update-password" element={<LazyUpdatePassword />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
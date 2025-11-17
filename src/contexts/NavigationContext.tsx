import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Page = 'Home' | 'Profile' | 'Settings' | 'Notifications' | 'Messages' | 'Saved' | 'Communities' | 'Library' | 'Timeline' | 'PostDetail' | 'Search' | 'CommunityDetail' | 'TopicDetail' | 'About' | 'TermsOfService' | 'PrivacyPolicy' | 'CookiePolicy' | 'Disclaimer' | 'Accessibility' | 'UpdatePassword' | 'Moderation' | 'Dashboard' | 'Appeals' | 'Premium' | 'TrendingTopics' | 'ExploreUsers' | 'SelectAdPlan' | 'PaymentSuccess';

interface NavigationState {
  currentPage: Page;
  previousPage: Page | null;
  activePostId: string | null;
  activeCommentId: string | null;
  activeTag: string | null;
  viewedUserId: string | null;
  activeCommunityId: string | null;
  searchQuery: string;
}

interface NavigationContextType {
  navigationState: NavigationState;
  setCurrentPage: (page: Page) => void;
  setActivePostId: (id: string | null) => void;
  setActiveCommentId: (id: string | null) => void;
  setActiveTag: (tag: string | null) => void;
  setViewedUserId: (id: string | null) => void;
  setActiveCommunityId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  handleNavigation: (page: Page) => void;
  handleViewPost: (postId: string, commentId?: string) => void;
  handleViewProfile: (userId: string) => void;
  handleViewCommunity: (communityId: string) => void;
  handleViewTag: (tag: string) => void;
  handleViewCommentThread: (postId: string, commentId: string) => void;
  handleNavigateToAdvancedSearch: () => void;
  handleFetchFollows: (userId: string, type: 'followers' | 'following') => Promise<any[]>;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentPage: 'Home',
    previousPage: null,
    activePostId: null,
    activeCommentId: null,
    activeTag: null,
    viewedUserId: null,
    activeCommunityId: null,
    searchQuery: '',
  });

  const setCurrentPage = (page: Page) => {
    setNavigationState(prev => ({
      ...prev,
      previousPage: prev.currentPage,
      currentPage: page,
    }));
  };

  const setActivePostId = (id: string | null) => {
    setNavigationState(prev => ({ ...prev, activePostId: id }));
  };

  const setActiveCommentId = (id: string | null) => {
    setNavigationState(prev => ({ ...prev, activeCommentId: id }));
  };

  const setActiveTag = (tag: string | null) => {
    setNavigationState(prev => ({ ...prev, activeTag: tag }));
  };

  const setViewedUserId = (id: string | null) => {
    setNavigationState(prev => ({ ...prev, viewedUserId: id }));
  };

  const setActiveCommunityId = (id: string | null) => {
    setNavigationState(prev => ({ ...prev, activeCommunityId: id }));
  };

  const setSearchQuery = (query: string) => {
    setNavigationState(prev => ({ ...prev, searchQuery: query }));
  };

  const handleNavigation = (page: Page) => {
    setCurrentPage(page);
  };

  const handleViewPost = (postId: string, commentId?: string) => {
    setActivePostId(postId);
    if (commentId) {
      setActiveCommentId(commentId);
    }
    setCurrentPage('PostDetail');
  };

  const handleViewProfile = (userId: string) => {
    setViewedUserId(userId);
    setCurrentPage('Profile');
  };

  const handleViewCommunity = (communityId: string) => {
    setActiveCommunityId(communityId);
    setCurrentPage('CommunityDetail');
  };

  const handleViewTag = (tag: string) => {
    setActiveTag(tag);
    setCurrentPage('TopicDetail');
  };

  const handleViewCommentThread = (postId: string, commentId: string) => {
    setActivePostId(postId);
    setActiveCommentId(commentId);
    setCurrentPage('PostDetail');
  };

  const handleNavigateToAdvancedSearch = () => {
    setCurrentPage('Search');
  };

  const handleFetchFollows = async (userId: string, type: 'followers' | 'following'): Promise<any[]> => {
    // Esta função deve ser implementada com a lógica real de busca de seguidores
    // Por enquanto, retorna um array vazio
    return [];
  };

  const value: NavigationContextType = {
    navigationState,
    setCurrentPage,
    setActivePostId,
    setActiveCommentId,
    setActiveTag,
    setViewedUserId,
    setActiveCommunityId,
    setSearchQuery,
    handleNavigation,
    handleViewPost,
    handleViewProfile,
    handleViewCommunity,
    handleViewTag,
    handleViewCommentThread,
    handleNavigateToAdvancedSearch,
    handleFetchFollows,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
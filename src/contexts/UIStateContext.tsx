import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types';

interface FollowModalData {
  user: User;
  initialFollowers: User[];
  initialFollowing: User[];
  initialTab: 'followers' | 'following';
}

interface UIState {
  isFollowModalOpen: boolean;
  followModalData: FollowModalData | null;
  showSplashScreen: boolean;
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
}

interface UIStateContextType {
  uiState: UIState;
  setIsFollowModalOpen: (isOpen: boolean) => void;
  setFollowModalData: (data: FollowModalData | null) => void;
  setShowSplashScreen: (show: boolean) => void;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  setIsMobileSidebarOpen: (open: boolean) => void;
  handleOpenFollowModal: (user: User, initialFollowers: User[], initialFollowing: User[], initialTab: 'followers' | 'following') => void;
  handleToggleMobileSidebar: () => void;
}

const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

export const useUIState = () => {
  const context = useContext(UIStateContext);
  if (context === undefined) {
    throw new Error('useUIState must be used within a UIStateProvider');
  }
  return context;
};

interface UIStateProviderProps {
  children: ReactNode;
}

export const UIStateProvider: React.FC<UIStateProviderProps> = ({ children }) => {
  const [uiState, setUIState] = useState<UIState>({
    isFollowModalOpen: false,
    followModalData: null,
    showSplashScreen: true,
    isSidebarCollapsed: false,
    isMobileSidebarOpen: false,
  });

  const setIsFollowModalOpen = (isOpen: boolean) => {
    setUIState(prev => ({ ...prev, isFollowModalOpen: isOpen }));
  };

  const setFollowModalData = (data: FollowModalData | null) => {
    setUIState(prev => ({ ...prev, followModalData: data }));
  };

  const setShowSplashScreen = (show: boolean) => {
    setUIState(prev => ({ ...prev, showSplashScreen: show }));
  };

  const setIsSidebarCollapsed = (collapsed: boolean) => {
    setUIState(prev => ({ ...prev, isSidebarCollapsed: collapsed }));
  };

  const setIsMobileSidebarOpen = (open: boolean) => {
    setUIState(prev => ({ ...prev, isMobileSidebarOpen: open }));
  };

  const handleOpenFollowModal = (
    user: User,
    initialFollowers: User[],
    initialFollowing: User[],
    initialTab: 'followers' | 'following'
  ) => {
    setFollowModalData({
      user,
      initialFollowers,
      initialFollowing,
      initialTab,
    });
    setIsFollowModalOpen(true);
  };

  const handleToggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!uiState.isMobileSidebarOpen);
  };

  const value: UIStateContextType = {
    uiState,
    setIsFollowModalOpen,
    setFollowModalData,
    setShowSplashScreen,
    setIsSidebarCollapsed,
    setIsMobileSidebarOpen,
    handleOpenFollowModal,
    handleToggleMobileSidebar,
  };

  return (
    <UIStateContext.Provider value={value}>
      {children}
    </UIStateContext.Provider>
  );
};
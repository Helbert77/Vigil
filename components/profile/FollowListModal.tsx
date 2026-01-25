import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { Icon } from '../icons/Icon';
import UserListItem from './UserListItem';
import { useTranslation } from 'react-i18next';

const XIcon = () => <Icon className="h-6 w-6"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></Icon>;
const ArrowLeftIcon = () => <Icon className="h-6 w-6"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></Icon>;

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUser: User;
  initialFollowers: User[];
  initialFollowing: User[];
  initialTab: 'followers' | 'following';
  currentUser: User;
  followedUserIds: string[];
  onFollowToggle: (userId: string) => void;
  onViewProfile: (userId: string) => void;
  onFetchFollows: (userId: string) => Promise<{ followers: User[], following: User[] }>;
}

const FollowListModal: React.FC<FollowListModalProps> = ({ isOpen, onClose, initialUser, initialFollowers, initialFollowing, initialTab, currentUser, followedUserIds, onFollowToggle, onViewProfile, onFetchFollows }) => {
  const { t } = useTranslation(['profile']);
  const [userStack, setUserStack] = useState<User[]>([initialUser]);
  const [currentLists, setCurrentLists] = useState({ followers: initialFollowers, following: initialFollowing });
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  const [isLoading, setIsLoading] = useState(false);

  const currentUserInStack = userStack[userStack.length - 1];

  useEffect(() => {
    const fetchNewData = async () => {
      if (userStack.length === 1) {
        setCurrentLists({ followers: initialFollowers, following: initialFollowing });
        return;
      }
      setIsLoading(true);
      const newData = await onFetchFollows(currentUserInStack.id);
      setCurrentLists(newData);
      setIsLoading(false);
    };
    fetchNewData();
  }, [userStack, initialFollowers, initialFollowing, onFetchFollows, currentUserInStack.id]);

  if (!isOpen) return null;

  const handleBack = () => {
    setUserStack(prev => prev.slice(0, -1));
  };

  const handleNavigateToUserFollows = (user: User, tab: 'followers' | 'following') => {
    setUserStack(prev => [...prev, user]);
    setActiveTab(tab);
  };

  const handleViewProfileAndClose = (userId: string) => {
    onViewProfile(userId);
    onClose();
  };

  const renderUserList = (users: User[]) => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    }
    if (users.length === 0) {
      return <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('profile:noUsersFound')}</p>;
    }
    return (
      <div className="space-y-2">
        {users.map(user => (
          <UserListItem
            key={user.id}
            user={user}
            currentUser={currentUser}
            isFollowing={followedUserIds.includes(user.id)}
            onFollowToggle={onFollowToggle}
            onViewProfile={handleViewProfileAndClose}
            onViewFollowers={(u) => handleNavigateToUserFollows(u, 'followers')}
            onViewFollowing={(u) => handleNavigateToUserFollows(u, 'following')}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 md:p-4" onClick={onClose}>
      <div className="bg-light-card dark:bg-dark-card rounded-lg md:rounded-xl shadow-xl w-full max-w-lg max-h-[95vh] md:max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-3 md:p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center shrink-0">
          <div className="flex items-center min-w-0 flex-1">
            {userStack.length > 1 && (
              <button onClick={handleBack} className="mr-2 md:mr-4 p-1 md:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0">
                <ArrowLeftIcon />
              </button>
            )}
            <div className="flex min-w-0">
              <button
                onClick={() => setActiveTab('followers')}
                className={`px-3 md:px-4 py-2 font-bold text-sm md:text-base truncate ${activeTab === 'followers' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              >
                {t('profile:followers')}
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className={`px-3 md:px-4 py-2 font-bold text-sm md:text-base truncate ${activeTab === 'following' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              >
                {t('profile:following')}
              </button>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 flex-shrink-0 p-1">
            <XIcon />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 md:p-4">
          {activeTab === 'followers' ? renderUserList(currentLists.followers) : renderUserList(currentLists.following)}
        </div>
      </div>
    </div>
  );
};

export default FollowListModal;
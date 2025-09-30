import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Rightbar from './components/layout/Rightbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Header from './components/layout/Header';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Saved from './pages/Saved';
import Communities from './pages/Communities';
import PostDetail from './pages/PostDetail';
import Search from './pages/Search';
import CommunityDetail from './pages/CommunityDetail';
import TopicDetail from './pages/TopicDetail';
import ToastContainer from './components/common/ToastContainer';
import { MOCK_USER, MOCK_POSTS, MOCK_CONVERSATIONS, MOCK_ALL_USERS, MOCK_COMMUNITIES } from './constants';
import { Post, Poll, Conversation, User } from './types';

type Page = 'Home' | 'Profile' | 'Settings' | 'Notifications' | 'Messages' | 'Saved' | 'Communities' | 'PostDetail' | 'Search' | 'CommunityDetail' | 'TopicDetail';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Home');
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [user, setUser] = useState<User>(MOCK_USER);
  const [viewedUserId, setViewedUserId] = useState<string | null>(null);
  const [activeCommunityId, setActiveCommunityId] = useState<string | null>(null);
  const [followedUserIds, setFollowedUserIds] = useState<string[]>([]);

  const [savedPostIds, setSavedPostIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('savedPostIds');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse saved posts from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('savedPostIds', JSON.stringify(savedPostIds));
  }, [savedPostIds]);

  const handleUpdateUser = (updates: Partial<User>) => {
    setUser(prevUser => ({...prevUser, ...updates}));
  };

  const handleAddPost = (text: string, imageUrl?: string, videoUrl?: string, poll?: Poll) => {
    if (!text.trim() && !imageUrl && !videoUrl && !poll) return;
    
    const newPost: Post = {
      id: `p${Date.now()}`,
      user: user,
      text,
      imageUrl,
      videoUrl,
      poll,
      timestamp: 'Just now',
      likes: 0,
      comments: [],
      shares: 0,
    };
    setPosts([newPost, ...posts]);
    if (currentPage !== 'Home') {
      setCurrentPage('Home');
    }
  };

  const handleUpdatePost = (postId: string, updates: Partial<Post>) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, ...updates } : p));
  };
  
  const handleToggleSavePost = (postId: string) => {
    setSavedPostIds(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleFollowToggle = (userId: string) => {
    const isFollowing = followedUserIds.includes(userId);
    setFollowedUserIds(prev => 
      isFollowing 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
    setUser(prevUser => ({
      ...prevUser,
      followingCount: isFollowing ? prevUser.followingCount - 1 : prevUser.followingCount + 1
    }));
  };

  const handleViewPost = (postId: string) => {
    setActivePostId(postId);
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage('Search');
  };

  const handleNavigation = (page: Page) => {
    if (page === 'Home') {
      setActiveTag(null);
      setSearchQuery('');
    }
    if (page === 'Profile') {
      setViewedUserId(null);
    }
    setCurrentPage(page);
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'Home':
        return <Home 
                  user={user} 
                  posts={posts} 
                  onAddPost={handleAddPost} 
                  onUpdatePost={handleUpdatePost} 
                  savedPostIds={savedPostIds} 
                  onToggleSave={handleToggleSavePost} 
                />;
      case 'Profile': {
        const userToView = viewedUserId ? MOCK_ALL_USERS.find(u => u.id === viewedUserId) : user;
        if (!userToView) {
            setCurrentPage('Home');
            return null;
        }
        return <Profile 
                 user={userToView} 
                 posts={posts} 
                 onUpdatePost={handleUpdatePost} 
                 savedPostIds={savedPostIds} 
                 onToggleSave={handleToggleSavePost} 
                 onUpdateUser={userToView.id === user.id ? handleUpdateUser : undefined}
               />;
      }
      case 'Settings':
        return <Settings user={user} />;
      case 'Notifications':
        return <Notifications onViewPost={handleViewPost} />;
      case 'Messages':
        return <Messages user={user} conversations={conversations} setConversations={setConversations} />;
      case 'Saved':
        return <Saved user={user} posts={posts} savedPostIds={savedPostIds} onUpdatePost={handleUpdatePost} onToggleSave={handleToggleSavePost} />;
      case 'Communities':
        return <Communities onViewCommunity={handleViewCommunity} />;
      case 'PostDetail': {
        const post = posts.find(p => p.id === activePostId);
        if (!post) {
            setCurrentPage('Notifications');
            return <Notifications onViewPost={handleViewPost} />;
        }
        return <PostDetail
            user={user}
            post={post}
            onUpdatePost={handleUpdatePost}
            savedPostIds={savedPostIds}
            onToggleSave={handleToggleSavePost}
            onNavigateBack={() => setCurrentPage('Notifications')}
        />;
      }
      case 'CommunityDetail': {
        const community = MOCK_COMMUNITIES.find(c => c.id === activeCommunityId);
        if (!community) {
            setCurrentPage('Communities');
            return <Communities onViewCommunity={handleViewCommunity} />;
        }
        return <CommunityDetail
            community={community}
            posts={posts}
            onUpdatePost={handleUpdatePost}
            savedPostIds={savedPostIds}
            onToggleSave={handleToggleSavePost}
            onNavigateBack={() => setCurrentPage('Communities')}
            user={user}
        />;
      }
      case 'TopicDetail': {
        if (!activeTag) {
            setCurrentPage('Home');
            return null;
        }
        return <TopicDetail
            tag={activeTag}
            posts={posts}
            onUpdatePost={handleUpdatePost}
            savedPostIds={savedPostIds}
            onToggleSave={handleToggleSavePost}
            onNavigateBack={() => setCurrentPage('Home')}
            user={user}
        />;
      }
      case 'Search':
        return <Search 
                  query={searchQuery}
                  posts={posts}
                  onUpdatePost={handleUpdatePost}
                  savedPostIds={savedPostIds}
                  onToggleSave={handleToggleSavePost}
                  onViewProfile={handleViewProfile}
                  currentUser={user}
                  onSearch={handleSearch}
                />;
      default:
        return <Home user={user} posts={posts} onAddPost={handleAddPost} onUpdatePost={handleUpdatePost} savedPostIds={savedPostIds} onToggleSave={handleToggleSavePost} />;
    }
  };

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <ToastContainer />
      <Header user={user} onNavigateProfile={() => handleNavigation('Profile')} onSearch={handleSearch} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 pt-20">
        <aside className="md:col-span-3 lg:col-span-2">
          <Sidebar currentPage={currentPage} setCurrentPage={handleNavigation} />
        </aside>
        <main className="md:col-span-9 lg:col-span-7">
          {renderPage()}
        </main>
        <aside className="hidden lg:block lg:col-span-3">
          <Rightbar 
            onViewTag={handleViewTag} 
            onViewProfile={handleViewProfile}
            followedUserIds={followedUserIds}
            onFollowToggle={handleFollowToggle}
          />
        </aside>
      </div>
    </div>
  );
};

export default App;
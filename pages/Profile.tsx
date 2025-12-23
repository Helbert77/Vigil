import React, { useState, useEffect } from 'react';
import { User, Post } from '../types';
import Card from '../components/common/Card';
import Avatar from '../components/common/Avatar';
import PostCard from '../components/post/PostCard';
import { Icon } from '../components/icons/Icon';
import ImageUploader from '../components/profile/ImageUploader';
import ProfileActionsMenu from '../components/profile/ProfileActionsMenu';
import { useSession } from '@/contexts/SessionContext';
import UserModerationPanel from '@/components/admin/UserModerationPanel';
import { VerifiedBadgeIcon } from '@/src/components/icons/VerifiedBadgeIcon';
import { ModeratorBadgeIcon } from '@/src/components/icons/ModeratorBadgeIcon';
import * as api from '@/src/services/api';
import { useToast } from '@/hooks/useToast';
import { GamificationTab } from '@/src/components/gamification/GamificationTab';

const CalendarIcon = () => <Icon className="h-5 w-5"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></Icon>;
const ListIcon = () => <Icon className="h-5 w-5"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></Icon>;
const GridIcon = () => <Icon className="h-5 w-5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></Icon>;
const HeartIcon = () => <Icon className="h-5 w-5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></Icon>;
const MessageCircleIcon = () => <Icon className="h-5 w-5"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></Icon>;
const VideoIcon = () => <Icon className="h-5 w-5"><g><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></g></Icon>;
const ShieldIcon = () => <Icon className="h-5 w-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></Icon>;

interface ProfileProps {
  user: User;
  posts: Post[];
  followers: User[];
  following: User[];
  onUpdatePost: (postId: string, updates: Partial<Post>) => void;
  savedPostIds: string[];
  onToggleSave: (postId: string) => void;
  onUpdateUser?: (updates: Partial<User>) => Promise<void>;
  onViewPost: (postId: string) => void;
  currentUser: User;
  onUpdateCurrentUser: (updates: Partial<User>) => Promise<void>;
  followedUserIds: string[];
  onFollowToggle: (userId: string) => void;
  blockedUserIds: string[];
  onBlockToggle: (userId: string) => void;
  onToggleLike: (postId: string, isCurrentlyLiked: boolean) => void;
  onIncrementView: (type: 'post' | 'comment', id: string) => void;
  onDeletePost: (postId: string) => void;
  shareableUsers: User[];
  onSendMessage: (params: { targetUserId: string, text: string }) => void;
  onViewProfile: (userId: string) => void;
  onFetchFollows: (userId: string) => Promise<{ followers: User[], following: User[] }>;
  onOpenFollowModal: (user: User, tab: 'followers' | 'following') => void;
  onVoteOnPoll: (postId: string, optionIndex: number) => void;
  allUsers: User[];
}

const Profile: React.FC<ProfileProps> = ({ user, posts, onUpdatePost, savedPostIds, onToggleSave, onUpdateUser, onViewPost, currentUser, onUpdateCurrentUser, followedUserIds, onFollowToggle, blockedUserIds, onBlockToggle, onToggleLike, onIncrementView, onDeletePost, shareableUsers, onSendMessage, onViewProfile, onOpenFollowModal, onVoteOnPoll, allUsers }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'gamification' | 'moderation'>('posts');
  const [selectedRole, setSelectedRole] = useState(user.role || 'user');
  const { addToast } = useToast();
  
  const { user: sessionUser } = useSession();
  const isModerator = sessionUser && ['admin', 'moderator'].includes(sessionUser.role || 'user');
  const isAdminViewing = currentUser.role === 'admin';
  
  const viewMode = currentUser.profileViewMode || 'list';

  const isCurrentUserProfile = user.id === currentUser.id;
  const isFollowing = followedUserIds.includes(user.id);
  const isBlocked = blockedUserIds.includes(user.id);

  useEffect(() => {
    if (isEditing) {
      setEditedUser({
        name: user.name,
        username: user.username,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        bannerUrl: user.bannerUrl,
      });
    }
  }, [isEditing, user]);
  
  useEffect(() => {
    setIsEditing(false);
    setActiveTab('posts');
    setSelectedRole(user.role || 'user');
  }, [user.id, user.role]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedUser((prev: Partial<User>) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (type: 'avatarUrl' | 'bannerUrl', url: string) => {
    setEditedUser((prev: Partial<User>) => ({ ...prev, [type]: url }));
  };

  const handleSave = async () => {
    if (onUpdateUser) {
        await onUpdateUser(editedUser);
    }
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({});
  };

  const handleFollow = async () => {
    onFollowToggle(user.id);
  };

  const handleViewModeChange = (mode: 'list' | 'grid') => {
    onUpdateCurrentUser({ profileViewMode: mode });
  };

  const handleRoleChange = async () => {
    try {
      const { error } = await api.updateUserRole(user.id, selectedRole as 'user' | 'moderator' | 'admin');
      if (error) throw error;
      addToast(`Função de @${user.username} atualizada para ${selectedRole}.`, 'success');
      // Note: A full user list refresh would be ideal here, but for now, the UI will update on next load.
    } catch (error) {
      addToast('Erro ao atualizar a função do usuário.', 'error');
    }
  };

  const userPosts = posts.filter((post: Post) => post.user.id === user.id);
  const mediaPosts = userPosts.filter((post: Post) => post.imageUrl || post.videoUrl);
  
  return (
    <>
      <Card className="mb-6 overflow-hidden">
        <div className="relative h-32 sm:h-48 bg-gray-700 -m-4 sm:-m-6">
          {isEditing ? (
            <div className="relative h-full w-full">
              <img src={editedUser.bannerUrl || user.bannerUrl || 'https://picsum.photos/seed/default-banner/1500/500'} alt="Profile banner" className="h-full w-full object-cover opacity-70" />
              <ImageUploader
                userId={user.id}
                filePath="banner"
                onUpload={(url: string) => handleImageUpload('bannerUrl', url)}
              />
            </div>
          ) : (
            user.bannerUrl && <img src={user.bannerUrl} alt="Profile banner" className="h-full w-full object-cover" />
          )}
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden p-4 -mt-16">
          {/* Avatar centralizado */}
          <div className="flex justify-center mb-6">
            <div className="relative border-4 border-light-card dark:border-dark-card rounded-full">
               <Avatar src={isEditing ? editedUser.avatarUrl || user.avatarUrl : user.avatarUrl} alt={user.name} size="lg" userId={user.id} showStatus={true} />
               {isEditing && (
                  <div className="rounded-full overflow-hidden absolute inset-0">
                      <ImageUploader
                          userId={user.id}
                          filePath="avatar"
                          onUpload={(url: string) => handleImageUpload('avatarUrl', url)}
                      />
                  </div>
               )}
            </div>
          </div>

          {/* Container flex para nome (esquerda) e botão editar (direita) */}
          <div className="flex justify-between items-start mb-4 mt-2">
            {/* Nome do usuário - lado esquerdo */}
            <div className="flex-1 pr-4">
              {isEditing ? (
                <div className="space-y-3 mt-2">
                  <input 
                      type="text"
                      name="name"
                      value={editedUser.name || ''}
                      onChange={handleInputChange}
                      className="font-bold w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      placeholder="Your Name"
                  />
                   <input 
                      type="text"
                      name="username"
                      value={editedUser.username || ''}
                      onChange={handleInputChange}
                      className="text-gray-500 dark:text-gray-400 w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      placeholder="Your Username"
                  />
                </div>
              ) : (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                    {(user.plan === 'pro' || user.plan === 'premium') && <VerifiedBadgeIcon plan={user.plan} className="h-4 w-4" />}
                    {user.role && ['admin', 'moderator'].includes(user.role) && <ModeratorBadgeIcon className="h-4 w-4" />}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">@{user.username}</p>
                </div>
              )}
            </div>

            {/* Botão editar perfil - lado direito */}
            <div className="flex items-center space-x-2 ml-4">
              {!isCurrentUserProfile && (
                <ProfileActionsMenu user={user} isBlocked={isBlocked} onBlockToggle={onBlockToggle} />
              )}
              {isCurrentUserProfile ? (
                isEditing ? (
                  <div className="flex space-x-2">
                    <button onClick={handleCancel} className="bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 font-bold py-2 px-3 rounded-full transition-all duration-200 transform active:scale-95 text-sm">Cancel</button>
                    <button onClick={handleSave} className="bg-primary hover:bg-gray-600 text-white font-bold py-2 px-3 rounded-full transition-all duration-200 transform active:scale-95 text-sm">Save</button>
                  </div>
                ) : (
                  onUpdateUser && <button onClick={() => setIsEditing(true)} className="bg-primary hover:bg-gray-600 text-white font-bold py-2 px-3 rounded-full transition-all duration-200 transform active:scale-95 text-sm">Edit Profile</button>
                )
              ) : (
                <button 
                  onClick={handleFollow}
                  className={`font-bold py-2 px-3 rounded-full text-sm transition-colors duration-200 transform active:scale-95 ${
                    isFollowing 
                      ? 'bg-transparent border border-primary text-primary hover:bg-primary/10'
                      : 'bg-primary hover:bg-gray-600 text-white'
                  }`}
                >
                  {isFollowing ? 'Seguindo' : 'Seguir'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex flex-row items-end space-x-6 p-4 -mt-10">
          <div className="relative border-4 border-light-card dark:border-dark-card rounded-full">
             <Avatar src={isEditing ? editedUser.avatarUrl || user.avatarUrl : user.avatarUrl} alt={user.name} size="lg" userId={user.id} showStatus={true} />
             {isEditing && (
                <div className="rounded-full overflow-hidden absolute inset-0">
                    <ImageUploader
                        userId={user.id}
                        filePath="avatar"
                        onUpload={(url: string) => handleImageUpload('avatarUrl', url)}
                    />
                </div>
             )}
          </div>
          <div className="flex-grow text-left pt-6">
             {isEditing ? (
                <div className="space-y-3 mt-2">
                    <input 
                        type="text"
                        name="name"
                        value={editedUser.name || ''}
                        onChange={handleInputChange}
                        className="font-bold w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                        placeholder="Your Name"
                    />
                     <input 
                        type="text"
                        name="username"
                        value={editedUser.username || ''}
                        onChange={handleInputChange}
                        className="text-gray-500 dark:text-gray-400 w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                        placeholder="Your Username"
                    />
                </div>
             ) : (
                <>
                    <div className="flex items-center gap-2 mt-2">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                      {(user.plan === 'pro' || user.plan === 'premium') && <VerifiedBadgeIcon plan={user.plan} className="h-5 w-5" />}
                      {user.role && ['admin', 'moderator'].includes(user.role) && <ModeratorBadgeIcon className="h-5 w-5" />}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">@{user.username}</p>
                </>
             )}
          </div>
          <div className="flex items-center space-x-2">
            {!isCurrentUserProfile && (
              <ProfileActionsMenu user={user} isBlocked={isBlocked} onBlockToggle={onBlockToggle} />
            )}
            {isCurrentUserProfile ? (
              isEditing ? (
                <div className="flex space-x-2">
                  <button onClick={handleCancel} className="bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 font-bold py-2 px-4 rounded-full transition-all duration-200 transform active:scale-95">Cancel</button>
                  <button onClick={handleSave} className="bg-primary hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-200 transform active:scale-95">Save</button>
                </div>
              ) : (
                onUpdateUser && <button onClick={() => setIsEditing(true)} className="bg-primary hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-200 transform active:scale-95">Edit Profile</button>
              )
            ) : (
              <button 
                onClick={handleFollow}
                className={`font-bold py-2 px-4 rounded-full text-sm transition-colors duration-200 transform active:scale-95 ${
                  isFollowing 
                    ? 'bg-transparent border border-primary text-primary hover:bg-primary/10'
                    : 'bg-primary hover:bg-gray-600 text-white'
                }`}
              >
                {isFollowing ? 'Seguindo' : 'Seguir'}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Bio and Stats Layout */}
        <div className="sm:hidden mt-4 pt-4 border-t border-light-border dark:border-dark-border px-4 pb-4">
          {isEditing ? (
            <textarea
                name="bio"
                value={editedUser.bio || ''}
                onChange={handleInputChange}
                className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary"
                rows={3}
                placeholder="Your bio"
            />
          ) : (
            <>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{user.bio || 'No bio provided.'}</p>
              
              {/* Data de entrada */}
              <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <CalendarIcon />
                  <span>{user.joinDate}</span>
              </div>
              
              {/* Botões seguindo e seguidores na mesma linha */}
              <div className="flex items-center gap-6 text-sm">
                  <button onClick={() => onOpenFollowModal(user, 'following')} className="hover:underline">
                      <span className="font-bold text-gray-800 dark:text-gray-200">{user.followingCount.toLocaleString()}</span>
                      <span className="ml-1 text-gray-500 dark:text-gray-400">Seguindo</span>
                  </button>
                  <button onClick={() => onOpenFollowModal(user, 'followers')} className="hover:underline">
                      <span className="font-bold text-gray-800 dark:text-gray-200">{user.followersCount.toLocaleString()}</span>
                      <span className="ml-1 text-gray-500 dark:text-gray-400">Seguidores</span>
                  </button>
              </div>
            </>
          )}
        </div>

        {/* Desktop Bio and Stats Layout */}
        <div className="hidden sm:block mt-4 pt-4 border-t border-light-border dark:border-dark-border px-4 pb-4">
          {isEditing ? (
            <textarea
                name="bio"
                value={editedUser.bio || ''}
                onChange={handleInputChange}
                className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary"
                rows={3}
                placeholder="Your bio"
            />
          ) : (
            <>
              <p className="text-gray-700 dark:text-gray-300">{user.bio || 'No bio provided.'}</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400 mt-4">
                  <div className="flex items-center space-x-1">
                      <CalendarIcon />
                      <span>{user.joinDate}</span>
                  </div>
                  <button onClick={() => onOpenFollowModal(user, 'following')} className="hover:underline">
                      <span className="font-bold text-gray-800 dark:text-gray-200">{user.followingCount.toLocaleString()}</span>
                      <span className="ml-1">Seguindo</span>
                  </button>
                  <button onClick={() => onOpenFollowModal(user, 'followers')} className="hover:underline">
                      <span className="font-bold text-gray-800 dark:text-gray-200">{user.followersCount.toLocaleString()}</span>
                      <span className="ml-1">Seguidores</span>
                  </button>
              </div>
            </>
          )}
        </div>
      </Card>

      {isAdminViewing && !isCurrentUserProfile && (
        <Card className="mb-6">
          <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Painel de Administrador</h3>
          <div className="flex items-center space-x-4">
            <label htmlFor="role-select" className="font-medium">Função do Usuário:</label>
            <select
              id="role-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as 'user' | 'moderator' | 'admin')}
              className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={handleRoleChange} className="bg-secondary text-white font-bold py-2 px-4 rounded-full text-sm">Salvar Função</button>
          </div>
        </Card>
      )}

      <div className="flex border-b border-light-border dark:border-dark-border mb-4 overflow-x-auto">
        <button onClick={() => setActiveTab('posts')} className={`px-4 py-2 font-bold whitespace-nowrap ${activeTab === 'posts' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 dark:text-gray-400'}`}>Posts</button>
        <button onClick={() => setActiveTab('media')} className={`px-4 py-2 font-bold whitespace-nowrap ${activeTab === 'media' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 dark:text-gray-400'}`}>Mídia</button>
        <button onClick={() => setActiveTab('gamification')} className={`px-4 py-2 font-bold whitespace-nowrap ${activeTab === 'gamification' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 dark:text-gray-400'}`}>Seu Progresso</button>
        {isModerator && <button onClick={() => setActiveTab('moderation')} className={`px-4 py-2 font-bold flex items-center gap-2 whitespace-nowrap ${activeTab === 'moderation' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 dark:text-gray-400'}`}><ShieldIcon /> Moderação</button>}
      </div>

      {activeTab === 'posts' && (
        <div>
            {userPosts.length > 0 ? (
            userPosts.map((post: Post) => 
                <PostCard 
                key={post.id} 
                post={post} 
                onUpdatePost={onUpdatePost} 
                isSaved={savedPostIds.includes(post.id)}
                onToggleSave={onToggleSave}
                user={currentUser}
                onToggleLike={onToggleLike}
                onIncrementView={onIncrementView}
                onViewPost={onViewPost}
                onDeletePost={onDeletePost}
                onBlockToggle={onBlockToggle}
                blockedUserIds={blockedUserIds}
                shareableUsers={allUsers}
                onSendMessage={onSendMessage}
                followedUserIds={followedUserIds}
                onViewProfile={onViewProfile}
                onFollowToggle={onFollowToggle}
                onOpenFollowModal={onOpenFollowModal}
                onVoteOnPoll={onVoteOnPoll}
                allUsers={allUsers}
                />)
            ) : (
            <Card>
                <p>No posts yet. Time to reveal a truth.</p>
            </Card>
            )}
        </div>
      )}

      {activeTab === 'media' && (
        <div>
            {mediaPosts.length > 0 ? (
                <div className="grid grid-cols-3 gap-1">
                    {mediaPosts.map((post: Post) => (
                        <div key={post.id} className="relative aspect-square group cursor-pointer" onClick={() => onViewPost(post.id)}>
                            <img src={post.imageUrl || post.videoUrl} alt="Post media" className="w-full h-full object-cover" />
                            {post.videoUrl && (
                                <div className="absolute top-2 right-2 text-white drop-shadow-md">
                                    <VideoIcon />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white space-x-6 text-lg">
                                <div className="flex items-center space-x-1 font-bold">
                                    <HeartIcon />
                                    <span>{post.likes}</span>
                                </div>
                                <div className="flex items-center space-x-1 font-bold">
                                    <MessageCircleIcon />
                                    <span>{post.commentsCount}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <Card>
                    <p className="text-center p-8 text-gray-500 dark:text-gray-400">No posts with media found.</p>
                </Card>
            )}
        </div>
      )}

      {activeTab === 'gamification' && (
        <GamificationTab userId={user.id} isOwnProfile={isCurrentUserProfile} />
      )}

      {activeTab === 'moderation' && isModerator && (
        <UserModerationPanel user={user} />
      )}
    </>
  );
};

export default Profile;
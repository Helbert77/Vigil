import React, { useState, useRef, useEffect } from 'react';
import { User, Post } from '../types';
import Card from '../components/common/Card';
import Avatar from '../components/common/Avatar';
import PostCard from '../components/post/PostCard';
import { Icon } from '../components/icons/Icon';

const CameraIcon = () => <Icon><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></Icon>;
const CalendarIcon = () => <Icon className="h-5 w-5"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></Icon>;
const ListIcon = () => <Icon className="h-5 w-5"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></Icon>;
const GridIcon = () => <Icon className="h-5 w-5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></Icon>;
const HeartIcon = () => <Icon className="h-5 w-5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></Icon>;
const MessageCircleIcon = () => <Icon className="h-5 w-5"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></Icon>;
const VideoIcon = () => <Icon className="h-5 w-5"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></Icon>;

interface ProfileProps {
  user: User;
  posts: Post[];
  onUpdatePost: (postId: string, updates: Partial<Post>) => void;
  savedPostIds: string[];
  onToggleSave: (postId: string) => void;
  onUpdateUser?: (updates: Partial<User>) => void;
  onViewPost: (postId: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, posts, onUpdatePost, savedPostIds, onToggleSave, onUpdateUser, onViewPost }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setEditedUser({
        name: user.name,
        username: user.username,
        bio: user.bio,
      });
      setAvatarPreview(null);
      setBannerPreview(null);
    }
  }, [isEditing, user]);
  
  useEffect(() => {
    setIsEditing(false);
  }, [user.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (type === 'avatar') {
        setAvatarPreview(previewUrl);
        setEditedUser(prev => ({ ...prev, avatarUrl: previewUrl }));
      } else {
        setBannerPreview(previewUrl);
        setEditedUser(prev => ({ ...prev, bannerUrl: previewUrl }));
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (onUpdateUser) {
        onUpdateUser(editedUser);
    }
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({});
    setAvatarPreview(null);
    setBannerPreview(null);
  };

  const userPosts = posts.filter(post => post.user.id === user.id);
  const mediaPosts = userPosts.filter(post => post.imageUrl || post.videoUrl);
  
  const currentBanner = bannerPreview || user.bannerUrl;
  const currentAvatar = avatarPreview || user.avatarUrl;

  return (
    <div>
      <Card className="mb-6 overflow-hidden">
        <input type="file" ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'banner')} className="hidden" accept="image/*" />
        <input type="file" ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'avatar')} className="hidden" accept="image/*" />
        
        <div className="relative h-32 sm:h-48 bg-gray-700 -m-4 sm:-m-6">
          {currentBanner && <img src={currentBanner} alt="Profile banner" className="h-full w-full object-cover" />}
          {isEditing && onUpdateUser && (
            <button
              onClick={() => bannerInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
            >
              <CameraIcon />
              <span className="ml-2">Change Banner</span>
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 p-4 -mt-16 sm:-mt-12">
          <div className="relative border-4 border-light-card dark:border-dark-card rounded-full">
             <Avatar src={currentAvatar} alt={user.name} size="lg" />
             {isEditing && onUpdateUser && (
               <button
                 onClick={() => avatarInputRef.current?.click()}
                 className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
               >
                 <CameraIcon />
               </button>
             )}
          </div>
          <div className="flex-grow text-center sm:text-left pt-4 sm:pt-0">
             {isEditing ? (
                <div className="space-y-2">
                    <input 
                        type="text"
                        name="name"
                        value={editedUser.name || ''}
                        onChange={handleInputChange}
                        className="text-2xl font-bold w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Your Name"
                    />
                     <input 
                        type="text"
                        name="username"
                        value={editedUser.username || ''}
                        onChange={handleInputChange}
                        className="text-gray-500 dark:text-gray-400 w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Your Username"
                    />
                </div>
             ) : (
                <>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
                </>
             )}
          </div>
          {isEditing ? (
            <div className="flex space-x-2">
              <button onClick={handleCancel} className="bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 font-bold py-2 px-4 rounded-full">Cancel</button>
              <button onClick={handleSave} className="bg-primary hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full">Save</button>
            </div>
          ) : (
            onUpdateUser && <button onClick={() => setIsEditing(true)} className="bg-primary hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full">Edit Profile</button>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border px-4 pb-4">
          {isEditing ? (
            <textarea
                name="bio"
                value={editedUser.bio || ''}
                onChange={handleInputChange}
                className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary"
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
                  <div>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{user.followingCount.toLocaleString()}</span>
                      <span className="ml-1">Following</span>
                  </div>
                  <div>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{user.followersCount.toLocaleString()}</span>
                      <span className="ml-1">Followers</span>
                  </div>
              </div>
            </>
          )}
        </div>
      </Card>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{onUpdateUser ? 'Your Posts' : 'Posts'}</h3>
        <div className="flex items-center space-x-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
            <button onClick={() => setViewMode('list')} className={`px-3 py-1 rounded-md text-sm font-semibold ${viewMode === 'list' ? 'bg-light-card dark:bg-dark-card shadow' : 'text-gray-600 dark:text-gray-400'}`}>
                <ListIcon />
            </button>
            <button onClick={() => setViewMode('grid')} className={`px-3 py-1 rounded-md text-sm font-semibold ${viewMode === 'grid' ? 'bg-light-card dark:bg-dark-card shadow' : 'text-gray-600 dark:text-gray-400'}`}>
                <GridIcon />
            </button>
        </div>
      </div>

      {viewMode === 'list' && (
        <div>
            {userPosts.length > 0 ? (
            userPosts.map((post) => 
                <PostCard 
                key={post.id} 
                post={post} 
                onUpdatePost={onUpdatePost} 
                isSaved={savedPostIds.includes(post.id)}
                onToggleSave={onToggleSave}
                user={user}
                />)
            ) : (
            <Card>
                <p>No posts yet. Time to reveal a truth.</p>
            </Card>
            )}
        </div>
      )}

      {viewMode === 'grid' && (
        <div>
            {mediaPosts.length > 0 ? (
                <div className="grid grid-cols-3 gap-1">
                    {mediaPosts.map(post => (
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
                                    <span>{post.comments.length}</span>
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
    </div>
  );
};

export default Profile;
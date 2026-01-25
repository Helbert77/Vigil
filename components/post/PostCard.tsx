import React, { useState, useRef, useEffect, memo, useMemo } from 'react';
import { Post, Poll, User, EvidenceItem } from '../../types';
import Card from '../common/Card';
import Avatar from '../common/Avatar';
import { Icon } from '../icons/Icon';
import ShareDmModal from './ShareDmModal';
import { useToast } from '../../hooks/useToast';
import { EyeIcon } from '../icons/EyeIcon';
import PostActionsMenu from './PostActionsMenu';
import ConfirmationModal from '../common/ConfirmationModal';
import Tooltip from '../common/Tooltip';
import UserLink from '@/components/common/UserLink';
import { renderTextWithMentions, formatDateDayMonth, formatTimeOnly, formatDateTimeComplete } from '@/src/utils/textUtils';
import { VerifiedBadgeIcon } from '@/src/components/icons/VerifiedBadgeIcon';
import { ModeratorBadgeIcon } from '@/src/components/icons/ModeratorBadgeIcon';
import { useSimpleTimeAgo } from '../../hooks/useTimeAgoOptimized';
import ResilientVideo from '@/src/components/common/ResilientVideo';
import MediaViewer from '@/src/components/common/MediaViewer';
import { useTranslation } from 'react-i18next';

const HeartIcon = ({ filled }: { filled: boolean }) => (
    <Icon className={filled ? 'text-red-500' : ''} fill={filled ? 'currentColor' : 'none'}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </Icon>
);
const MessageCircleIcon = () => <Icon><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></Icon>;
const ShareIcon = () => <Icon><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" x2="12" y1="2" y2="15"></line></Icon>;
const BookmarkIcon = ({ filled }: { filled: boolean }) => (
    <Icon className={filled ? 'text-yellow-500' : ''} fill={filled ? 'currentColor' : 'none'}>
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
    </Icon>
);
const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><polyline points="20 6 9 17 4 12"></polyline></Icon>;
const EyeOffIcon = () => <Icon><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></Icon>;


// Icons for Share Menu
const LinkIcon = () => <Icon className="h-5 w-5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></Icon>;
const WhatsAppIcon = () => <Icon className="h-5 w-5 text-green-500"><path d="M21.5 14.9c-1.3-0.7-2.7-1.3-4-2 -0.3-0.1-0.6-0.2-0.9 0s-0.5 0.5-0.7 0.8l-0.8 1c-0.2 0.3-0.5 0.3-0.8 0.2 -1.6-0.6-3-1.8-4.2-3.1 -1.2-1.3-2.1-2.8-2.6-4.4 -0.1-0.3 0-0.6 0.2-0.8l1-1c0.3-0.2 0.5-0.5 0.7-0.8 0.2-0.3 0.2-0.6 0.1-0.9 -0.6-1.3-1.3-2.7-2-4 -0.2-0.4-0.6-0.6-1-0.6h-1.5c-0.5 0-1 0.5-1.2 1 -0.5 1.1-0.5 2.8 0.3 5 1.4 3.6 4.1 6.8 7.5 8.6 2.1 1.1 4.1 1.4 6 0.9 0.5-0.1 1-0.6 1.2-1.2v-1.5c0-0.4-0.2-0.8-0.6-1z"></path></Icon>;
const TelegramIcon = () => <Icon className="h-5 w-5 text-blue-400"><path d="M22 2L11 13l-2 9 4-7 8-5-11 9-2-5Z"></path><path d="M22 2L2 9l9 4 4 9Z"></path></Icon>;
const FacebookIcon = () => <Icon className="h-5 w-5 text-blue-600"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></Icon>;
const InstagramIcon = () => <Icon className="h-5 w-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></Icon>;
const SendIcon = () => <Icon className="h-5 w-5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></Icon>;

// Icons for Evidence Board
const FileTextIcon = ({ className }: { className?: string }) => <Icon className={`h-6 w-6 text-blue-500 ${className || ''}`}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></Icon>;
const ImageIcon = ({ className }: { className?: string }) => <Icon className={`h-6 w-6 text-green-500 ${className || ''}`}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></Icon>;
const LinkIconEvidence = ({ className }: { className?: string }) => <Icon className={`h-6 w-6 text-purple-500 ${className || ''}`}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></Icon>;
const VideoIconEvidence = ({ className }: { className?: string }) => <Icon className={`h-6 w-6 text-red-500 ${className || ''}`}><g><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></g></Icon>;

// Componente memoizado para exibir o tempo otimizado
const TimeDisplay = memo(({ timestamp, className }: { timestamp: string; className?: string }) => {
  const timeAgo = useSimpleTimeAgo(timestamp);
  
  return (
    <span className={className}>
      {timeAgo}
    </span>
  );
});

TimeDisplay.displayName = 'TimeDisplay';

interface PollDisplayProps {
  poll: Poll;
  postId: string;
  userVotedOption: number | null | undefined;
  onVote: (postId: string, optionIndex: number) => void;
}

const PollDisplay: React.FC<PollDisplayProps> = ({ poll, postId, userVotedOption, onVote }) => {
    const { t } = useTranslation(['posts', 'common']);
    const [timeRemaining, setTimeRemaining] = useState('');
    const [isPollActive, setIsPollActive] = useState(true);

    useEffect(() => {
        const calculateTime = () => {
            const endDate = new Date(poll.endDate);
            const now = new Date();
            const diff = endDate.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeRemaining(t('posts:pollEnded'));
                setIsPollActive(false);
                return;
            }
            
            setIsPollActive(true);
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);

            let remaining = '';
            if (days > 0) remaining += `${days}d `;
            if (hours > 0) remaining += `${hours}h `;
            if (minutes > 0 && days === 0) remaining += `${minutes}m `;
            if (remaining === '' && diff > 0) remaining = t('posts:lessThanMinute') + ' '
            
            setTimeRemaining(remaining.trim() + ' ' + t('posts:remaining'));
        };

        calculateTime();
        const interval = setInterval(calculateTime, 60000); // update every minute

        return () => clearInterval(interval);
    }, [poll.endDate]);


    const totalVotes = poll.options.reduce((sum: number, option) => sum + option.votes, 0);

    const handleVote = (optionIndex: number) => {
        if (userVotedOption !== null && userVotedOption !== undefined) return;
        onVote(postId, optionIndex);
    };
    
    return (
        <div className="space-y-2 md:space-y-3">
            {poll.options.map((option, index: number) => {
                const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                const isVotedByUser = userVotedOption === index;
                const showResults = userVotedOption !== null && userVotedOption !== undefined || !isPollActive;

                return (
                    <button 
                        key={index}
                        onClick={(e) => { e.stopPropagation(); handleVote(index); }} // Stop propagation here
                        disabled={userVotedOption !== null && userVotedOption !== undefined || !isPollActive}
                        className={`w-full text-left p-2 md:p-3 border rounded-lg transition-all duration-300 relative overflow-hidden ${isVotedByUser ? 'border-primary font-bold' : 'border-light-border dark:border-dark-border'} ${userVotedOption === null && isPollActive ? 'hover:border-primary' : 'cursor-default'}`}
                    >
                        {showResults && (
                             <div className="absolute top-0 left-0 h-full bg-primary/20" style={{ width: `${percentage}%` }}></div>
                        )}
                        <div className="flex justify-between items-center relative z-10">
                            <div className="flex items-center flex-1 min-w-0">
                                {isVotedByUser && <CheckIcon className="h-4 w-4 md:h-5 md:w-5 text-primary mr-2 flex-shrink-0" />}
                                <span className="text-sm md:text-base truncate">{option.text}</span>
                            </div>
                            {showResults && <span className="font-semibold text-sm md:text-base ml-2 flex-shrink-0">{Math.round(percentage)}%</span>}
                        </div>
                    </button>
                )
            })}
             <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{totalVotes.toLocaleString()} {t('posts:votes')} · {timeRemaining}</p>
        </div>
    );
};

interface EvidenceBoardDisplayProps {
  items: EvidenceItem[];
  isClickable: boolean;
  onViewPost?: () => void;
}

const EvidenceBoardDisplay: React.FC<EvidenceBoardDisplayProps> = ({ items, isClickable, onViewPost }) => {
  const [viewerState, setViewerState] = React.useState<{ isOpen: boolean; mediaUrl: string; mediaType: 'image' | 'video'; alt: string }>({
    isOpen: false,
    mediaUrl: '',
    mediaType: 'image',
    alt: ''
  });

  const renderIcon = (type: EvidenceItem['type']) => {
    switch (type) {
      case 'text': return <FileTextIcon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />;
      case 'image': return <ImageIcon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />;
      case 'video': return <VideoIconEvidence className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />;
      case 'link': return <LinkIconEvidence className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />;
      default: return null;
    }
  };

  const handleMediaClick = (url: string, type: 'image' | 'video', title: string) => {
    // Só abre em tela cheia se não estiver no feed (isClickable = false)
    if (!isClickable) {
      setViewerState({
        isOpen: true,
        mediaUrl: url,
        mediaType: type,
        alt: title
      });
    } else if (onViewPost) {
      // Se estiver no feed, redireciona para o post
      onViewPost();
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg p-3 md:p-4 flex flex-col">
            <div className="flex items-center mb-2 min-w-0">
              {renderIcon(item.type)}
              <h4 className="font-bold ml-2 truncate text-sm md:text-base">{item.title}</h4>
            </div>
            <div className="flex-grow">
              {item.type === 'text' && <p className="text-xs md:text-sm whitespace-pre-wrap">{item.content}</p>}
              {item.type === 'image' && (
                <img 
                  src={item.content} 
                  alt={item.title} 
                  className="rounded-md w-full h-auto object-cover max-h-32 md:max-h-48 cursor-pointer hover:opacity-90 transition-opacity" 
                  onClick={() => handleMediaClick(item.content, 'image', item.title)}
                />
              )}
              {item.type === 'video' && (
                <video 
                  src={item.content} 
                  controls 
                  className="rounded-md w-full h-auto max-h-32 md:max-h-48 cursor-pointer" 
                  onClick={() => handleMediaClick(item.content, 'video', item.title)}
                />
              )}
              {item.type === 'link' && <a href={item.content} target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm text-secondary hover:underline break-all">{item.content}</a>}
            </div>
          </div>
        ))}
      </div>
      <MediaViewer
        isOpen={viewerState.isOpen}
        onClose={() => setViewerState({ ...viewerState, isOpen: false })}
        mediaUrl={viewerState.mediaUrl}
        mediaType={viewerState.mediaType}
        alt={viewerState.alt}
      />
    </>
  );
};


interface PostCardProps {
  post: Post;
  onUpdatePost: (postId: string, updates: Partial<Post>) => void;
  isSaved: boolean;
  onToggleSave: (postId: string) => void;
  user: User;
  onToggleLike: (postId: string, isCurrentlyLiked: boolean) => void;
  onIncrementView: (type: 'post' | 'comment', id: string) => void;
  onViewPost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onBlockToggle: (userId: string) => void;
  blockedUserIds: string[];
  isClickable?: boolean;
  shareableUsers: User[];
  onSendMessage: (params: { targetUserId: string, text: string }) => void;
  followedUserIds: string[];
  onViewProfile: (userId: string) => void;
  onFollowToggle: (userId: string) => void;
  onOpenFollowModal: (user: User, tab: 'followers' | 'following') => void;
  onMediaLoad?: () => void;
  onVoteOnPoll: (postId: string, optionIndex: number) => void;
  allUsers: User[];
}

const PostCard: React.FC<PostCardProps> = ({ post, onUpdatePost, isSaved, onToggleSave, user, onToggleLike, onIncrementView, onViewPost, onDeletePost, onBlockToggle, blockedUserIds, isClickable = true, shareableUsers, onSendMessage, followedUserIds, onViewProfile, onFollowToggle, onOpenFollowModal, onMediaLoad, onVoteOnPoll, allUsers }) => {
  const { t } = useTranslation(['posts', 'common']);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showDmModal, setShowDmModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(post.text);
  const [isMediaVisible, setIsMediaVisible] = useState(false);
  const [showDateTime, setShowDateTime] = useState(false);
  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState(false);
  const { addToast } = useToast();
  const hasBeenViewed = useRef(false);

  const shareContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasBeenViewed.current) {
      onIncrementView('post', post.id);
      hasBeenViewed.current = true;
    }
    // Reinicia o estado de visibilidade sempre que o post mudar
    setIsMediaVisible(false);
  }, [post.id, onIncrementView]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (shareContainerRef.current && !shareContainerRef.current.contains(event.target as Node)) {
            setShowShareMenu(false);
        }
    };

    if (showShareMenu) {
        document.addEventListener('mousedown', handleClickOutside);
    } else {
        document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
}, [showShareMenu]);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLike(post.id, !!post.liked_by_user);
  };
  
  const copyToClipboard = (text: string): Promise<void> => {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    } else {
      return new Promise((resolve, reject) => {
        try {
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.left = '-9999px';
          textArea.style.top = '-9999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          if (successful) {
            resolve();
          } else {
            reject(new Error('Fallback: Copying text command was unsuccessful'));
          }
        } catch (err) {
          reject(err);
        }
      });
    }
  };

  const handleShare = (e: React.MouseEvent, platform: 'copy' | 'whatsapp' | 'telegram' | 'facebook' | 'instagram') => {
    e.stopPropagation();
    const postUrl = `https://vigil.net/post/${post.id}`;
    const encodedUrl = encodeURIComponent(postUrl);
    const postText = `Check out this post on Vigil: "${post.text}"`;
    const encodedText = encodeURIComponent(postText);
    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'instagram':
        copyToClipboard(postUrl)
          .then(() => {
            // Toast removido - ação de copiar é instantânea
          })
          .catch(err => {
            addToast('Could not copy link. Please try again.', 'error');
          });
        break;
      case 'copy':
        copyToClipboard(postUrl)
          .then(() => {
            // Toast removido - ação de copiar é instantânea
          })
          .catch(err => {
            addToast('Could not copy link. Please try again.', 'error');
          });
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }

    if (platform !== 'copy' && platform !== 'instagram') {
        onUpdatePost(post.id, { shares: post.shares + 1 });
    }
    setShowShareMenu(false);
  };

  const handleDeleteRequest = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    onDeletePost(post.id);
    setIsDeleteModalOpen(false);
  };

  const handleCardClick = () => {
    if (isClickable && !isEditing) {
      setShowDateTime(!showDateTime);
      onViewPost(post.id);
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleEdit = () => {
    setEditedText(post.text);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (editedText.trim() === post.text) {
      setIsEditing(false);
      return;
    }
    onUpdatePost(post.id, { text: editedText });
    setIsEditing(false);
  };

  const isFollowing = useMemo(() => followedUserIds.includes(post.user.id), [followedUserIds, post.user.id]);
  const isCurrentUser = useMemo(() => post.user.id === user.id, [post.user.id, user.id]);
  // CORREÇÃO: A lógica agora verifica corretamente se deve mostrar o aviso
  // Mostra o aviso SE: o post tem mídia sensível E o usuário NÃO quer ver conteúdo sensível E a mídia ainda não foi revelada
  const showSensitiveWarning = useMemo(() => 
    post.media_is_sensitive && !user.showSensitiveContent && !isMediaVisible,
    [post.media_is_sensitive, user.showSensitiveContent, isMediaVisible]
  );

  const handleMediaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Só abre em tela cheia se não estiver no feed (isClickable = false)
    if (!isClickable && !showSensitiveWarning) {
      setIsMediaViewerOpen(true);
    } else if (isClickable && !isEditing) {
      // Se estiver no feed, redireciona para o post
      onViewPost(post.id);
    }
  };

  return (
    <>
      <Card
        className={`mb-3 md:mb-4 relative ${isClickable && !isEditing ? 'cursor-pointer' : ''}`}
        onClick={handleCardClick}
        role={isClickable ? 'link' : undefined}
        tabIndex={isClickable ? 0 : -1}
        onKeyDown={(e) => {
          if (isClickable && !isEditing && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setShowDateTime(!showDateTime);
            onViewPost(post.id);
          }
        }}
      >
        <div className="flex items-start space-x-3 md:space-x-4">
          <div onClick={(e) => { e.stopPropagation(); onViewProfile(post.user.id); }} className="cursor-pointer flex-shrink-0">
            <Avatar src={post.user.avatarUrl} alt={post.user.name} size="md" userId={post.user.id} showStatus={true} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start">
              <div className="flex-1 min-w-0">
                {/* Layout para mobile (< 480px) */}
                <div className="block max-[479px]:block min-[480px]:hidden">
                  <div className="flex items-center gap-1 flex-wrap">
                    <UserLink
                      user={post.user}
                      isFollowing={isFollowing}
                      onFollowToggle={onFollowToggle}
                      onViewProfile={onViewProfile}
                      isCurrentUser={isCurrentUser}
                      onOpenFollowModal={onOpenFollowModal}
                    >
                      <span className="font-bold text-gray-900 dark:text-white text-sm">{post.user.name}</span>
                    </UserLink>
                    {(post.user.plan === 'pro' || post.user.plan === 'premium') && <VerifiedBadgeIcon plan={post.user.plan} className="h-3 w-3 flex-shrink-0" />}
                    {post.user.role && ['admin', 'moderator'].includes(post.user.role) && <ModeratorBadgeIcon className="h-3 w-3 flex-shrink-0" />}
                    <UserLink
                      user={post.user}
                      isFollowing={isFollowing}
                      onFollowToggle={onFollowToggle}
                      onViewProfile={onViewProfile}
                      isCurrentUser={isCurrentUser}
                      onOpenFollowModal={onOpenFollowModal}
                    >
                      <span className="text-gray-500 dark:text-gray-400 text-sm">@{post.user.username}</span>
                    </UserLink>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">-</span>
                    <TimeDisplay timestamp={post.timestamp} className="text-gray-500 dark:text-gray-400 text-sm" />
                  </div>
                </div>

                {/* Layout para desktop (>= 480px) */}
                <div className="hidden min-[480px]:block">
                  <div className="flex items-center gap-1 flex-wrap">
                    <UserLink
                      user={post.user}
                      isFollowing={isFollowing}
                      onFollowToggle={onFollowToggle}
                      onViewProfile={onViewProfile}
                      isCurrentUser={isCurrentUser}
                      onOpenFollowModal={onOpenFollowModal}
                    >
                      <span className="font-bold text-gray-900 dark:text-white text-sm md:text-base">{post.user.name}</span>
                    </UserLink>
                    {(post.user.plan === 'pro' || post.user.plan === 'premium') && <VerifiedBadgeIcon plan={post.user.plan} className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />}
                    {post.user.role && ['admin', 'moderator'].includes(post.user.role) && <ModeratorBadgeIcon className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />}
                    <UserLink
                      user={post.user}
                      isFollowing={isFollowing}
                      onFollowToggle={onFollowToggle}
                      onViewProfile={onViewProfile}
                      isCurrentUser={isCurrentUser}
                      onOpenFollowModal={onOpenFollowModal}
                    >
                      <span className="text-gray-500 dark:text-gray-400 text-sm md:text-base">@{post.user.username}</span>
                    </UserLink>
                    <span className="text-gray-500 dark:text-gray-400 text-sm md:text-base">-</span>
                    <TimeDisplay timestamp={post.timestamp} className="text-gray-500 dark:text-gray-400 text-sm md:text-base" />
                  </div>
                </div>
                {isEditing ? (
                  <div className="mt-2 w-full">
                    <textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md p-2 md:p-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      rows={4}
                      autoFocus
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <button onClick={handleCancelEdit} className="text-xs md:text-sm font-bold py-1 px-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-300">Cancelar</button>
                      <button onClick={handleSaveEdit} className="bg-primary text-white text-xs md:text-sm font-bold py-1 px-3 rounded-full hover:bg-gray-600 transition-colors">Salvar</button>
                    </div>
                  </div>
                ) : (
                  post.text && <p className={`mt-1 md:mt-2 text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words text-sm md:text-base leading-relaxed ${isClickable ? 'line-clamp-3' : ''}`}>{renderTextWithMentions(post.text, allUsers, user, followedUserIds, onFollowToggle, onViewProfile, onOpenFollowModal)}</p>
                )}
              </div>
              <div className="pl-2 md:pl-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <PostActionsMenu
                  post={post}
                  currentUser={user}
                  onDelete={handleDeleteRequest}
                  onBlockToggle={onBlockToggle}
                  isBlocked={blockedUserIds.includes(post.user.id)}
                  onEdit={handleEdit}
                />
              </div>
            </div>
          </div>
        </div>
        
        {!isEditing && (
          <>
            <div className="mt-3 md:mt-4">
              <div className="relative max-h-64 md:max-h-96 overflow-hidden">
                {(post.imageUrl || post.videoUrl) && (
                  <>
                    {post.imageUrl && (
                      <img 
                        src={post.imageUrl} 
                        alt="Post content" 
                        className={`rounded-lg w-full object-contain transition-all duration-300 ${showSensitiveWarning ? 'blur-xl' : 'cursor-pointer hover:opacity-90'}`} 
                        onLoad={onMediaLoad} 
                        style={{ maxHeight: window.innerWidth < 768 ? '256px' : '384px' }}
                        onClick={handleMediaClick}
                      />
                    )}
                    {post.videoUrl && (
                      <div 
                        className={`relative ${showSensitiveWarning ? '' : 'cursor-pointer'}`}
                        onClick={handleMediaClick}
                      >
                        <ResilientVideo
                          src={post.videoUrl}
                          controls={!showSensitiveWarning}
                          className={`rounded-lg w-full bg-dark-bg transition-all duration-300 ${showSensitiveWarning ? 'blur-xl' : ''}`}
                          onLoadedData={onMediaLoad}
                          style={{ maxHeight: window.innerWidth < 768 ? '256px' : '384px' }}
                        />
                      </div>
                    )}
                    {showSensitiveWarning && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg" onClick={(e) => e.stopPropagation()}>
                        <EyeOffIcon />
                        <p className="text-white font-semibold mt-2 mb-4 text-sm md:text-base">Conteúdo Sensível</p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setIsMediaVisible(true); }} 
                          className="bg-white/90 text-black font-bold py-2 px-4 md:px-6 rounded-full backdrop-blur-sm hover:bg-white transition-colors text-sm md:text-base"
                        >
                          Ver Conteúdo
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
              {post.audioUrl && (
                  <audio src={post.audioUrl} controls className="w-full mt-2 md:mt-3" onClick={(e) => e.stopPropagation()} />
              )}
              {post.poll && (
                  <div onClick={(e) => e.stopPropagation()} className="poll-mobile mt-3 md:mt-4">
                    <PollDisplay poll={post.poll} postId={post.id} userVotedOption={post.user_voted_option} onVote={onVoteOnPoll} />
                  </div>
              )}
              {post.evidenceBoard && post.evidenceBoard.length > 0 && (
                <div onClick={(e) => e.stopPropagation()} className="evidence-board-mobile mt-3 md:mt-4">
                  <EvidenceBoardDisplay 
                    items={post.evidenceBoard} 
                    isClickable={isClickable}
                    onViewPost={() => onViewPost(post.id)}
                  />
                </div>
              )}
            </div>

            <div className="postcard-actions flex justify-around mt-3 md:mt-4 pt-2 border-t border-light-border dark:border-dark-border" onClick={(e) => e.stopPropagation()}>
              <Tooltip text="Curtir">
                <button onClick={handleLike} className="flex items-center space-x-1 md:space-x-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500 transition-colors duration-200 transform active:scale-110">
                  <HeartIcon filled={!!post.liked_by_user} />
                  <span className="text-xs md:text-sm">{post.likes}</span>
                </button>
              </Tooltip>
              <Tooltip text="Comentar">
                <button onClick={(e) => handleActionClick(e, () => onViewPost(post.id))} className="flex items-center space-x-1 md:space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-500 transition-colors duration-200 transform active:scale-110">
                  <MessageCircleIcon />
                  <span className="text-xs md:text-sm">{post.commentsCount}</span>
                </button>
              </Tooltip>
              <div className="relative" ref={shareContainerRef} onClick={(e) => e.stopPropagation()}>
                <Tooltip text={t('posts:share')}>
                  <button onClick={(e) => handleActionClick(e, () => setShowShareMenu(!showShareMenu))} className="flex items-center space-x-1 md:space-x-2 text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-500 transition-colors duration-200 transform active:scale-110">
                    <ShareIcon />
                    <span className="text-xs md:text-sm">{post.shares}</span>
                  </button>
                </Tooltip>
                {showShareMenu && (
                  <div className="share-menu-mobile absolute bottom-full right-1/2 translate-x-1/2 mb-2 w-48 md:w-56 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-lg z-10 overflow-hidden">
                      <button onClick={(e) => handleActionClick(e, () => { setShowDmModal(true); setShowShareMenu(false); })} className="w-full text-left flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 text-xs md:text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                          <SendIcon />
                          <span className="truncate">Direct Message</span>
                      </button>
                      <button onClick={(e) => handleShare(e, 'copy')} className="w-full text-left flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 text-xs md:text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                          <LinkIcon />
                          <span className="truncate">Copy Link</span>
                      </button>
                      <button onClick={(e) => handleShare(e, 'whatsapp')} className="w-full text-left flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 text-xs md:text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                          <WhatsAppIcon />
                          <span className="truncate">WhatsApp</span>
                      </button>
                      <button onClick={(e) => handleShare(e, 'telegram')} className="w-full text-left flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 text-xs md:text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                          <TelegramIcon />
                          <span className="truncate">Telegram</span>
                      </button>
                      <button onClick={(e) => handleShare(e, 'facebook')} className="w-full text-left flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 text-xs md:text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                          <FacebookIcon />
                          <span className="truncate">Facebook</span>
                      </button>
                      <button onClick={(e) => handleShare(e, 'instagram')} className="w-full text-left flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 text-xs md:text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                          <InstagramIcon />
                          <span className="truncate">Instagram</span>
                      </button>
                  </div>
                )}
              </div>
              <Tooltip text="Salvar">
                <button onClick={(e) => handleActionClick(e, () => onToggleSave(post.id))} className="flex items-center space-x-1 md:space-x-2 text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-500 transition-colors duration-200 transform active:scale-110">
                  <BookmarkIcon filled={isSaved} />
                </button>
              </Tooltip>
              <Tooltip text="Visualizações">
                <div className="views-mobile flex items-center space-x-1 md:space-x-2 text-gray-500 dark:text-gray-400">
                  <EyeIcon />
                  <span className="text-xs md:text-sm">{post.views}</span>
                </div>
              </Tooltip>
            </div>
          </>
        )}
        
        {/* Data e hora com posicionamento absoluto */}
        {showDateTime && (
          <div 
            className="absolute bottom-2 left-2 bg-black/70 dark:bg-white/70 text-white dark:text-black px-2 py-1 rounded text-xs font-medium transition-all duration-300 ease-in-out transform opacity-100 scale-100"
            style={{ 
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)'
            }}
            role="tooltip"
            aria-label="Data e hora do post"
          >
            {formatDateTimeComplete(post.timestamp)}
          </div>
        )}
      </Card>
      {showDmModal && <ShareDmModal post={post} onClose={() => setShowDmModal(false)} onUpdatePost={onUpdatePost} shareableUsers={shareableUsers} onSendMessage={onSendMessage} />}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Apagar Post?"
        message="Esta ação é irreversível. Você tem certeza de que deseja apagar este post permanentemente?"
        confirmText="Sim, apagar"
        isDestructive={true}
      />
      {(post.imageUrl || post.videoUrl) && (
        <MediaViewer
          isOpen={isMediaViewerOpen}
          onClose={() => setIsMediaViewerOpen(false)}
          mediaUrl={post.imageUrl || post.videoUrl || ''}
          mediaType={post.imageUrl ? 'image' : 'video'}
          alt="Conteúdo do post"
        />
      )}
    </>
  );
};

export default memo(PostCard);
import React, { useState, useRef, useEffect } from 'react';
import { Post, Comment, Poll, User } from '../../types';
import Card from '../common/Card';
import Avatar from '../common/Avatar';
import { Icon } from '../icons/Icon';
import ShareDmModal from './ShareDmModal';
import TheoryAnalysisModal from './TheoryAnalysisModal';
import { useToast } from '../../hooks/useToast';

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
const BrainCircuitIcon = () => <Icon><path d="M12 2a2.5 2.5 0 0 0-2.5 2.5v.5a2.5 2.5 0 0 0 5 0v-.5A2.5 2.5 0 0 0 12 2zM7.5 10a2.5 2.5 0 0 0 0 5h.5a2.5 2.5 0 0 0 0-5h-.5zM16.5 10a2.5 2.5 0 0 0 0 5h.5a2.5 2.5 0 0 0 0-5h-.5zM12 15.5a2.5 2.5 0 0 0 2.5-2.5v-.5a2.5 2.5 0 0 0-5 0v.5a2.5 2.5 0 0 0 2.5 2.5zM5 8a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1a2 2 0 0 1 0 4H5a2 2 0 0 0-2 2v1h18v-1a2 2 0 0 0-2-2h-1a2 2 0 0 1 0-4h1a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2.3a2.5 2.5 0 0 1-4.4-2.5v-.5a2.5 2.5 0 0 1-2.6 0v.5a2.5 2.5 0 0 1-4.4 2.5H5z"/></Icon>;

// Icons for Share Menu
const LinkIcon = () => <Icon className="h-5 w-5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></Icon>;
const WhatsAppIcon = () => <Icon className="h-5 w-5 text-green-500"><path d="M21.5 14.9c-1.3-0.7-2.7-1.3-4-2 -0.3-0.1-0.6-0.2-0.9 0s-0.5 0.5-0.7 0.8l-0.8 1c-0.2 0.3-0.5 0.3-0.8 0.2 -1.6-0.6-3-1.8-4.2-3.1 -1.2-1.3-2.1-2.8-2.6-4.4 -0.1-0.3 0-0.6 0.2-0.8l1-1c0.3-0.2 0.5-0.5 0.7-0.8 0.2-0.3 0.2-0.6 0.1-0.9 -0.6-1.3-1.3-2.7-2-4 -0.2-0.4-0.6-0.6-1-0.6h-1.5c-0.5 0-1 0.5-1.2 1 -0.5 1.1-0.5 2.8 0.3 5 1.4 3.6 4.1 6.8 7.5 8.6 2.1 1.1 4.1 1.4 6 0.9 0.5-0.1 1-0.6 1.2-1.2v-1.5c0-0.4-0.2-0.8-0.6-1z"></path></Icon>;
const TelegramIcon = () => <Icon className="h-5 w-5 text-blue-400"><path d="M22 2L11 13l-2 9 4-7 8-5-11 9-2-5Z"></path><path d="M22 2L2 9l9 4 4 9Z"></path></Icon>;
const FacebookIcon = () => <Icon className="h-5 w-5 text-blue-600"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></Icon>;
const InstagramIcon = () => <Icon className="h-5 w-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></Icon>;
const SendIcon = () => <Icon className="h-5 w-5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></Icon>;

interface PollDisplayProps {
  poll: Poll;
  postId: string;
  onUpdatePost: (postId: string, updates: Partial<Post>) => void;
}

const PollDisplay: React.FC<PollDisplayProps> = ({ poll, postId, onUpdatePost }) => {
    const [votedOption, setVotedOption] = useState<number | null>(null);
    const [timeRemaining, setTimeRemaining] = useState('');
    const [isPollActive, setIsPollActive] = useState(true);

    useEffect(() => {
        const calculateTime = () => {
            const endDate = new Date(poll.endDate);
            const now = new Date();
            const diff = endDate.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeRemaining('Poll ended');
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
            if (remaining === '' && diff > 0) remaining = 'less than a minute '
            
            setTimeRemaining(remaining.trim() + ' left');
        };

        calculateTime();
        const interval = setInterval(calculateTime, 60000); // update every minute

        return () => clearInterval(interval);
    }, [poll.endDate]);


    const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

    const handleVote = (optionIndex: number) => {
        if (votedOption !== null || !isPollActive) return;

        const newOptions = poll.options.map((option, index) => 
            index === optionIndex ? { ...option, votes: option.votes + 1 } : option
        );
        const newPoll = { ...poll, options: newOptions };
        
        onUpdatePost(postId, { poll: newPoll });
        setVotedOption(optionIndex);
    };
    
    return (
        <div className="space-y-2">
            {poll.options.map((option, index) => {
                const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                const isVoted = votedOption === index;
                const showResults = votedOption !== null || !isPollActive;

                return (
                    <button 
                        key={index}
                        onClick={() => handleVote(index)}
                        disabled={votedOption !== null || !isPollActive}
                        className={`w-full text-left p-2 border rounded-lg transition-all duration-300 relative ${isVoted ? 'border-primary' : 'border-light-border dark:border-dark-border'} ${votedOption === null && isPollActive ? 'hover:border-primary' : 'cursor-default'} ${!isPollActive && votedOption === null ? 'opacity-70' : ''}`}
                    >
                        {showResults && (
                             <div className="absolute top-0 left-0 h-full bg-primary/20 rounded-md" style={{ width: `${percentage}%` }}></div>
                        )}
                        <div className="flex justify-between items-center font-semibold relative z-10">
                            <span>{option.text}</span>
                            {showResults && <span>{Math.round(percentage)}%</span>}
                        </div>
                    </button>
                )
            })}
             <p className="text-xs text-gray-500 dark:text-gray-400">{totalVotes} votes · {timeRemaining}</p>
        </div>
    );
};


interface PostCardProps {
  post: Post;
  onUpdatePost: (postId: string, updates: Partial<Post>) => void;
  isSaved: boolean;
  onToggleSave: (postId: string) => void;
  user: User;
  defaultCommentsOpen?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, onUpdatePost, isSaved, onToggleSave, user, defaultCommentsOpen = false }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(defaultCommentsOpen);
  const [commentText, setCommentText] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showDmModal, setShowDmModal] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const { addToast } = useToast();

  const shareContainerRef = useRef<HTMLDivElement>(null);

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

  const handleLike = () => {
    const newLikes = post.likes + (isLiked ? -1 : 1);
    onUpdatePost(post.id, { likes: newLikes });
    setIsLiked(!isLiked);
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

  const handleShare = (platform: 'copy' | 'whatsapp' | 'telegram' | 'facebook' | 'instagram') => {
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
            addToast('Post link copied! Best for sharing in Instagram Stories or bio.', 'success');
          })
          .catch(err => {
            console.error('Failed to copy for Instagram:', err);
            addToast('Could not copy link. Please try again.', 'error');
          });
        break;
      case 'copy':
        copyToClipboard(postUrl)
          .then(() => {
            addToast('Post link copied to clipboard!', 'success');
          })
          .catch(err => {
            console.error('Failed to copy link:', err);
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

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    const newComment: Comment = {
      id: `c${Date.now()}`,
      user: user,
      text: commentText,
      timestamp: 'Just now',
    };
    
    onUpdatePost(post.id, { comments: [...post.comments, newComment] });
    setCommentText('');
  };

  return (
    <>
      <Card className="mb-4">
        <div className="flex items-start space-x-4">
          <Avatar src={post.user.avatarUrl} alt={post.user.name} size="md" />
          <div className="flex-1">
            <div className="flex items-baseline space-x-2">
              <p className="font-bold text-gray-900 dark:text-white">{post.user.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">@{post.user.username}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">· {post.timestamp}</p>
            </div>
            {post.text && <p className="mt-1 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{post.text}</p>}
          </div>
        </div>
        
        <div className="mt-4 pl-16">
          {post.imageUrl && (
              <img src={post.imageUrl} alt="Post content" className="rounded-lg w-full object-cover" />
          )}
          {post.videoUrl && (
              <video src={post.videoUrl} controls className="rounded-lg w-full bg-dark-bg" />
          )}
          {post.poll && (
              <PollDisplay poll={post.poll} postId={post.id} onUpdatePost={onUpdatePost} />
          )}
        </div>

        <div className="flex justify-around mt-4 pt-2 border-t border-light-border dark:border-dark-border">
          <button onClick={handleLike} className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500 transition-colors duration-200 transform active:scale-110">
            <HeartIcon filled={isLiked} />
            <span>{post.likes}</span>
          </button>
          <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-500 transition-colors duration-200 transform active:scale-110">
            <MessageCircleIcon />
            <span>{post.comments.length}</span>
          </button>
          <div className="relative" ref={shareContainerRef}>
            <button onClick={() => setShowShareMenu(!showShareMenu)} className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-500 transition-colors duration-200 transform active:scale-110">
              <ShareIcon />
              <span>{post.shares}</span>
            </button>
            {showShareMenu && (
              <div className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 w-56 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-lg z-10 overflow-hidden">
                  <button onClick={() => { setShowDmModal(true); setShowShareMenu(false); }} className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                      <SendIcon />
                      <span>Direct Message</span>
                  </button>
                  <button onClick={() => handleShare('copy')} className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                      <LinkIcon />
                      <span>Copy Link</span>
                  </button>
                  <button onClick={() => handleShare('whatsapp')} className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                      <WhatsAppIcon />
                      <span>WhatsApp</span>
                  </button>
                  <button onClick={() => handleShare('telegram')} className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                      <TelegramIcon />
                      <span>Telegram</span>
                  </button>
                  <button onClick={() => handleShare('facebook')} className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                      <FacebookIcon />
                      <span>Facebook</span>
                  </button>
                  <button onClick={() => handleShare('instagram')} className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                      <InstagramIcon />
                      <span>Instagram</span>
                  </button>
              </div>
            )}
          </div>
           <button onClick={() => onToggleSave(post.id)} className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-500 transition-colors duration-200 transform active:scale-110">
            <BookmarkIcon filled={isSaved} />
          </button>
          <button onClick={() => setIsAnalysisModalOpen(true)} className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-500 transition-colors duration-200 transform active:scale-110" title="Analyze Theory">
            <BrainCircuitIcon />
          </button>
        </div>

        {showComments && (
          <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
              <form onSubmit={handleAddComment} className="flex items-start space-x-3 mb-4">
                  <Avatar src={user.avatarUrl} alt={user.name} size="sm" />
                  <div className="flex-1">
                      <input 
                          type="text"
                          placeholder="Add a comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                  </div>
                  <button type="submit" className="bg-secondary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-sm">Reply</button>
              </form>
              <div className="space-y-4">
                  {post.comments.map(comment => (
                      <div key={comment.id} className="flex items-start space-x-3">
                          <Avatar src={comment.user.avatarUrl} alt={comment.user.name} size="sm" />
                          <div className="flex-1 bg-light-bg dark:bg-dark-bg p-3 rounded-lg">
                              <div className="flex items-baseline space-x-2">
                                  <p className="font-bold text-sm">{comment.user.name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">@{comment.user.username}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">· {comment.timestamp}</p>
                              </div>
                              <p className="text-sm mt-1">{comment.text}</p>
                          </div>
                      </div>
                  ))}
                  {post.comments.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400 text-center">No comments yet. Start the conversation.</p>}
              </div>
          </div>
        )}
      </Card>
      {showDmModal && <ShareDmModal post={post} onClose={() => setShowDmModal(false)} onUpdatePost={onUpdatePost} />}
      {isAnalysisModalOpen && <TheoryAnalysisModal postText={post.text} onClose={() => setIsAnalysisModalOpen(false)} />}
    </>
  );
};

export default PostCard;
import { useState, useEffect, useCallback } from 'react';
import { Post, Poll, User, Comment, EvidenceItem, Community } from '@/types';
import { useToast } from '@/hooks/useToast';
import * as api from '@/src/services/api';
import { supabase } from '@/integrations/supabase/client';
import { extractHashtags } from '../utils/hashtags';
import { logger } from '../utils/Logger';

interface DbPost {
  id: string; content: string; image_url?: string; video_url?: string; audio_url?: string; poll_data?: Poll; evidence_board_data?: EvidenceItem[]; created_at: string; likes_count: number; comments_count: number; shares_count: number; views_count: number; community_id?: string; user_id: string; is_pinned?: boolean; media_is_sensitive?: boolean;
  profiles: { id: string; first_name?: string; last_name?: string; username: string; avatar_url?: string; plan?: User['plan']; role?: User['role']; following_count?: number; followers_count?: number; } | null;
  comments: DbComment[]; post_likes: { user_id: string }[]; poll_votes: { option_index: number }[];
}

interface DbComment {
  id: string; post_id: string; user_id: string; content: string; image_url?: string; created_at: string; parent_comment_id?: string; likes_count: number; views_count: number;
  comment_likes: { user_id: string }[];
  profiles: { id: string; first_name?: string; last_name?: string; username: string; avatar_url?: string; plan?: User['plan']; role?: User['role']; following_count?: number; followers_count?: number; } | null;
}

const getCharacterLimit = (plan: 'free' | 'basic' | 'pro' | 'premium'): number => {
  switch (plan) {
    case 'basic': return 1000;
    case 'pro': return 5000;
    case 'premium': return 25000;
    case 'free':
    default: return 280;
  }
};

export const usePosts = (appUser: User | null, allUsers: User[], setCommunities: React.Dispatch<React.SetStateAction<Community[]>>, fetchTrendingTopics: () => void) => {
  const { addToast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);

  const fetchPosts = useCallback(async () => {
    if (!appUser) { setIsPostsLoading(false); return; }
    setIsPostsLoading(true);
    try {
      const { data, error } = await api.fetchPosts(appUser.id);
      if (error) throw error;

      if (data) {
        const fetchedPosts: Post[] = (data as any as DbPost[])
        .filter(dbPost => dbPost.profiles)
        .map((dbPost: DbPost) => {
          const postUser: User = {
            id: dbPost.profiles!.id, name: `${dbPost.profiles!.first_name || ''} ${dbPost.profiles!.last_name || ''}`.trim() || dbPost.profiles!.username,
            username: dbPost.profiles!.username, avatarUrl: dbPost.profiles!.avatar_url || `https://picsum.photos/seed/${dbPost.profiles!.id}/100/100`,
            joinDate: '', followingCount: dbPost.profiles!.following_count || 0, followersCount: dbPost.profiles!.followers_count || 0, plan: dbPost.profiles!.plan || 'free', role: dbPost.profiles!.role || 'user',
          };
          const allComments: Comment[] = (dbPost.comments || []).filter(c => c.profiles).map((dbComment: DbComment) => {
            const commentUser: User = {
                id: dbComment.profiles!.id, name: `${dbComment.profiles!.first_name || ''} ${dbComment.profiles!.last_name || ''}`.trim() || dbComment.profiles!.username,
                username: dbComment.profiles!.username, avatarUrl: dbComment.profiles!.avatar_url || `https://picsum.photos/seed/${dbComment.profiles!.id}/100/100`,
                joinDate: '', followingCount: dbComment.profiles!.following_count || 0, followersCount: dbComment.profiles!.followers_count || 0, plan: dbComment.profiles!.plan || 'free', role: dbComment.profiles!.role || 'user',
              };
            return { id: dbComment.id, user: commentUser, text: dbComment.content, imageUrl: dbComment.image_url, timestamp: dbComment.created_at, parent_comment_id: dbComment.parent_comment_id, replies: [], likes: dbComment.likes_count || 0, liked_by_user: dbComment.comment_likes.some(l => l.user_id === appUser.id), views: dbComment.views_count || 0 };
          });
          const commentMap = new Map(allComments.map(c => [c.id, c]));
          const rootComments: Comment[] = [];
          allComments.forEach(c => { if (c.parent_comment_id && commentMap.has(c.parent_comment_id)) { commentMap.get(c.parent_comment_id)?.replies?.push(c); } else { rootComments.push(c); } });
          
          return {
            id: dbPost.id, user: postUser, text: dbPost.content, imageUrl: dbPost.image_url, videoUrl: dbPost.video_url, audioUrl: dbPost.audio_url, poll: dbPost.poll_data, evidenceBoard: dbPost.evidence_board_data,
            timestamp: dbPost.created_at, likes: dbPost.likes_count, comments: rootComments, commentsCount: dbPost.comments_count, shares: dbPost.shares_count, communityId: dbPost.community_id,
            liked_by_user: dbPost.post_likes.some(l => l.user_id === appUser.id), views: dbPost.views_count || 0, isPinned: dbPost.is_pinned, user_voted_option: dbPost.poll_votes[0]?.option_index ?? null,
            media_is_sensitive: dbPost.media_is_sensitive,
            mediaIsSensitive: dbPost.media_is_sensitive,
            tags: extractHashtags(dbPost.content),
          };
        });
        setPosts(fetchedPosts);
      }
    } catch (error) {
      // Error log removed for production
      addToast('Erro ao carregar posts.', 'error');
    } finally {
      setIsPostsLoading(false);
    }
  }, [appUser, addToast]);

  useEffect(() => {
    if (appUser) {
      fetchPosts();
    }
  }, [appUser, fetchPosts]);

  useEffect(() => {
    if (!appUser) return;

    const channel = supabase.channel('public:posts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' },
        () => {
            setTimeout(() => {
                fetchPosts();
                fetchTrendingTopics();
            }, 1000);
        })
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, [appUser, fetchPosts, fetchTrendingTopics]);

  const fetchSavedPosts = useCallback(async () => {
    if (!appUser) return;
    try {
      const { data, error } = await api.fetchSavedPostIds(appUser.id);
      if (error) throw error;
      setSavedPostIds(data.map((item: { post_id: string }) => item.post_id));
    } catch (error) {
      // Error log removed for production
    }
  }, [appUser]);

  useEffect(() => {
    fetchSavedPosts();
  }, [fetchSavedPosts]);

  const sendMentionNotifications = useCallback(async (text: string, postId: string) => {
    if (!appUser) return;
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex);
    if (!matches) return;

    const mentionedUsernames = [...new Set(matches.map(m => m.substring(1).toLowerCase()))];
    const mentionedUsers = allUsers.filter(u => mentionedUsernames.includes(u.username.toLowerCase()) && u.id !== appUser.id);

    for (const user of mentionedUsers) {
      await api.createNotification({
        recipient_id: user.id,
        actor_id: appUser.id,
        type: 'mention',
        post_id: postId,
      });
    }
  }, [appUser, allUsers]);

  const handleAddPost = useCallback(async (text: string, imageUrl?: string, videoUrl?: string, audioUrl?: string, poll?: Poll, communityId?: string, evidenceBoard?: EvidenceItem[], media_is_sensitive?: boolean) => {
    if (!appUser) return;

    if (!text.trim() && !imageUrl && !videoUrl && !audioUrl && !poll && (!evidenceBoard || evidenceBoard.length === 0)) return;

    const characterLimit = getCharacterLimit(appUser.plan);
    if (text.length > characterLimit) {
      addToast(`Sua postagem excede o limite de ${characterLimit} caracteres do seu plano.`, 'error');
      return;
    }

    // --- MODERATION CHECK ---
    if (text.trim()) {
      try {
        const { data: moderationResult, error: moderationError } = await api.moderateContent(text);
        if (moderationError) throw new Error(moderationError.message);
        if (moderationResult.action !== 'approved') {
          addToast('Seu post foi retido para revisão por violar as diretrizes da comunidade.', 'info');
          return;
        }
      } catch (error) {
         // Error log removed for production
         addToast('Não foi possível verificar o conteúdo. Tente novamente.', 'error');
        return;
      }
    }
    // --- END MODERATION CHECK ---

    const mutedWords = (appUser.mutedWords || []).map(w => w.trim().toLowerCase()).filter(Boolean);
    const postTextLower = text.toLowerCase();
    const foundMutedWord = mutedWords.find(word => postTextLower.includes(word));

    if (foundMutedWord) {
        addToast(`Sua postagem não foi criada porque contém uma palavra silenciada: "${foundMutedWord}"`, 'error');
        return;
    }

    const tempId = `temp_${Date.now()}`;
    const newPost: Post = {
      id: tempId, user: appUser, text, imageUrl, videoUrl, audioUrl, poll, evidenceBoard, timestamp: new Date().toISOString(),
      likes: 0, comments: [], commentsCount: 0, shares: 0, communityId, liked_by_user: false, views: 0, isPinned: false, user_voted_option: null, media_is_sensitive,
      mediaIsSensitive: media_is_sensitive,
    };
    setPosts(prevPosts => [newPost, ...prevPosts]);
    if (communityId) {
      setCommunities(prev => prev.map(c => c.id === communityId ? { ...c, postsCount: c.postsCount + 1 } : c));
    }

    try {
      const { data: newDbPost, error } = await api.addPost({ user_id: appUser.id, content: text, image_url: imageUrl, video_url: videoUrl, audio_url: audioUrl, poll_data: poll, community_id: communityId || null, evidence_board_data: evidenceBoard, media_is_sensitive });
      if (error) throw error;

      const finalPost: Post = {
        ...newPost,
        id: newDbPost.id,
        timestamp: newDbPost.created_at,
        comments: [],
        liked_by_user: false,
      };

      setPosts(prevPosts => prevPosts.map(p => (p.id === tempId ? finalPost : p)));
      fetchTrendingTopics();
      await sendMentionNotifications(text, newDbPost.id);
    } catch (error) {
      addToast('Erro ao criar postagem.', 'error');
      setPosts(prevPosts => prevPosts.filter(p => p.id !== tempId));
      if (communityId) {
        setCommunities(prev => prev.map(c => c.id === communityId ? { ...c, postsCount: c.postsCount - 1 } : c));
      }
    }
  }, [appUser, addToast, setCommunities, fetchTrendingTopics, sendMentionNotifications]);

  const handleDeletePost = useCallback(async (postId: string) => {
    const originalPosts = [...posts];
    const postToDelete = posts.find(p => p.id === postId);
    const communityId = postToDelete?.communityId;

    setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
    if (communityId) {
      setCommunities(prev => prev.map(c => c.id === communityId ? { ...c, postsCount: Math.max(0, c.postsCount - 1) } : c));
    }

    try {
      const { error } = await api.deletePost(postId);
      if (error) throw error;
      fetchTrendingTopics();
    } catch (error) {
      addToast('Erro ao apagar post.', 'error');
      setPosts(originalPosts);
      if (communityId) {
        setCommunities(prev => prev.map(c => c.id === communityId ? { ...c, postsCount: c.postsCount + 1 } : c));
      }
    }
  }, [addToast, posts, fetchTrendingTopics, setCommunities]);

  const handleUpdatePost = useCallback(async (postId: string, updates: Partial<Post>) => {
    const dbUpdates: { [key: string]: any } = {};
    if (updates.shares !== undefined) dbUpdates.shares_count = updates.shares;
    if (updates.text !== undefined) dbUpdates.content = updates.text;
    if (Object.keys(dbUpdates).length > 0) {
      try {
        const { error } = await api.updatePost(postId, dbUpdates);
        if (error) throw error;
        fetchPosts();
        if (updates.text) {
          await sendMentionNotifications(updates.text, postId);
        }
      } catch (error) {
        addToast('Erro ao atualizar postagem.', 'error');
      }
    }
  }, [addToast, fetchPosts, sendMentionNotifications]);

  const handleToggleLike = useCallback(async (postId: string, isCurrentlyLiked: boolean) => {
    if (!appUser) return;
    setPosts(prevPosts => prevPosts.map(p => p.id === postId ? { ...p, liked_by_user: !isCurrentlyLiked, likes: isCurrentlyLiked ? p.likes - 1 : p.likes + 1 } : p));
    try {
      const { error } = await api.togglePostLike(postId, appUser.id, isCurrentlyLiked);
      if (error) throw error;
      if (!isCurrentlyLiked) {
        const post = posts.find(p => p.id === postId);
        if (post && post.user.id !== appUser.id) {
          await api.createNotification({ recipient_id: post.user.id, actor_id: appUser.id, type: 'like', post_id: postId });
        }
      }
    } catch (error) {
      addToast('Falha ao curtir o post.', 'error');
      setPosts(prevPosts => prevPosts.map(p => p.id === postId ? { ...p, liked_by_user: isCurrentlyLiked, likes: isCurrentlyLiked ? p.likes + 1 : p.likes - 1 } : p));
    }
  }, [appUser, posts, addToast]);

  const handleToggleCommentLike = useCallback(async (commentId: string, postId: string, isCurrentlyLiked: boolean) => {
    if (!appUser) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // A new, more robust way to find the comment, no matter how nested it is.
    const flattenComments = (comments: Comment[]): Comment[] => {
      return comments.reduce((acc, comment) => {
        acc.push(comment);
        if (comment.replies && comment.replies.length > 0) {
          acc.push(...flattenComments(comment.replies));
        }
        return acc;
      }, [] as Comment[]);
    };

    const allPostComments = flattenComments(post.comments);
    const likedComment = allPostComments.find(c => c.id === commentId);
    const recipientId = likedComment?.user.id;

    setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === postId) {
            const updateReplies = (comments: Comment[]): Comment[] => comments.map(c => {
                if (c.id === commentId) return { ...c, liked_by_user: !isCurrentlyLiked, likes: isCurrentlyLiked ? c.likes - 1 : c.likes + 1 };
                if (c.replies) return { ...c, replies: updateReplies(c.replies) };
                return c;
            });
            return { ...p, comments: updateReplies(p.comments) };
        }
        return p;
    }));
    try {
      const { error } = await api.toggleCommentLike(commentId, appUser.id, isCurrentlyLiked);
      if (error) throw error;
      if (!isCurrentlyLiked && recipientId && recipientId !== appUser.id) {
        await api.createNotification({ recipient_id: recipientId, actor_id: appUser.id, type: 'comment_like', post_id: postId });
      }
    } catch (error) {
      addToast('Falha ao curtir o comentário.', 'error');
      // Revert the optimistic update on failure for a smoother UX
      setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === postId) {
            const revertReplies = (comments: Comment[]): Comment[] => comments.map(c => {
                if (c.id === commentId) return { ...c, liked_by_user: isCurrentlyLiked, likes: isCurrentlyLiked ? c.likes + 1 : c.likes - 1 };
                if (c.replies) return { ...c, replies: revertReplies(c.replies) };
                return c;
            });
            return { ...p, comments: revertReplies(p.comments) };
        }
        return p;
      }));
    }
  }, [appUser, addToast, posts]);

  const handleToggleSavePost = useCallback(async (postId: string) => {
    if (!appUser) return;
    const isCurrentlySaved = savedPostIds.includes(postId);
    setSavedPostIds(prev => isCurrentlySaved ? prev.filter(id => id !== postId) : [...prev, postId]);
    try {
      const { error } = await api.toggleSavePost(postId, appUser.id, isCurrentlySaved);
      if (error) throw error;
    } catch (error) {
      addToast('Falha ao salvar post.', 'error');
      setSavedPostIds(prev => isCurrentlySaved ? [...prev, postId] : prev.filter(id => id !== postId));
    }
  }, [appUser, savedPostIds, addToast]);

  const handleVoteOnPoll = useCallback(async (postId: string, optionIndex: number) => {
    if (!appUser) return;
    try {
      const { error } = await api.voteOnPoll(postId, optionIndex);
      if (error) throw error;
      fetchPosts();
    } catch (error) {
      addToast('Falha ao registrar seu voto.', 'error');
    }
  }, [appUser, addToast, fetchPosts]);

  const handleAddComment = useCallback(async (postId: string, commentText: string, imageUrl?: string, parentCommentId?: string) => {
    if (!appUser || (!commentText.trim() && !imageUrl)) return;

    // --- MODERATION CHECK ---
    if (commentText.trim()) {
      try {
        const { data: moderationResult, error: moderationError } = await api.moderateContent(commentText);
        if (moderationError) throw new Error(moderationError.message);
        if (moderationResult.action !== 'approved') {
          addToast('Seu comentário foi retido para revisão por violar as diretrizes da comunidade.', 'info');
          return;
        }
      } catch (error) {
         // Error log removed for production
         addToast('Não foi possível verificar o conteúdo do comentário. Tente novamente.', 'error');
        return;
      }
    }
    // --- END MODERATION CHECK ---

    try {
      const { error } = await api.addComment({ post_id: postId, user_id: appUser.id, content: commentText, image_url: imageUrl, parent_comment_id: parentCommentId });
      if (error) throw error;
      addToast('Comentário adicionado!', 'success');
      fetchPosts();
      
      let recipientId: string | null = null;
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      if (parentCommentId) {
        const findComment = (comments: Comment[], id: string): Comment | undefined => {
          for (const c of comments) {
            if (c.id === id) return c;
            if (c.replies) { const found = findComment(c.replies, id); if (found) return found; }
          }
          return undefined;
        };
        const parentComment = findComment(post.comments, parentCommentId);
        if (parentComment) recipientId = parentComment.user.id;
      } else {
        recipientId = post.user.id;
      }
      if (recipientId && recipientId !== appUser.id) {
        await api.createNotification({ recipient_id: recipientId, actor_id: appUser.id, type: 'comment', post_id: postId });
      }
      await sendMentionNotifications(commentText, postId);
    } catch (error) {
      // Error log removed for production
      addToast('Erro ao adicionar comentário.', 'error');
    }
  }, [appUser, addToast, fetchPosts, posts, sendMentionNotifications]);

  const handleUpdateComment = useCallback(async (commentId: string, newText: string) => {
    try {
      const { error } = await api.updateComment(commentId, newText);
      if (error) throw error;
      addToast('Comentário atualizado!', 'success');
      fetchPosts();
      const post = posts.find(p => p.comments.some(c => c.id === commentId));
      if (post) {
        await sendMentionNotifications(newText, post.id);
      }
    } catch (error) {
      // Error log removed for production
      addToast('Erro ao editar comentário.', 'error');
    }
  }, [addToast, fetchPosts, posts, sendMentionNotifications]);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    try {
      const { error } = await api.deleteComment(commentId);
      if (error) throw error;
      addToast('Comentário apagado.', 'success');
      fetchPosts();
    } catch (error) {
      // Error log removed for production
      addToast('Erro de moderação. Tente novamente.', 'error');
    }
  }, [addToast, fetchPosts]);

  const handleIncrementView = useCallback(async (type: 'post' | 'comment', id: string) => {
    if (type === 'post') {
      // 1. Atualiza otimisticamente no frontend
      setPosts(prev => prev.map(p => 
        p.id === id ? { ...p, views: p.views + 1 } : p
      ));
      
      // 2. Salva no banco de dados de forma assíncrona usando RPC
      try {
        await supabase.rpc('increment_post_views', { post_id: id });
      } catch (error) {
        // Silenciosamente ignora erros - o incremento local já foi feito
      }
    } else {
      // Para comentários
      // 1. Atualiza otimisticamente no frontend
      setPosts(prev => prev.map(p => {
        const updateCommentsViews = (comments: Comment[]): Comment[] => {
          return comments.map(c => {
            if (c.id === id) {
              return { ...c, views: c.views + 1 };
            }
            return {
              ...c,
              replies: c.replies ? updateCommentsViews(c.replies) : c.replies
            };
          });
        };
        return {
          ...p,
          comments: updateCommentsViews(p.comments)
        };
      }));
      
      // 2. Salva no banco de dados de forma assíncrona usando RPC
      try {
        await supabase.rpc('increment_comment_views', { comment_id: id });
      } catch (error) {
        // Silenciosamente ignora erros - o incremento local já foi feito
      }
    }
  }, [setPosts]);

  return { posts, isPostsLoading, savedPostIds, handleAddPost, handleDeletePost, handleUpdatePost, handleToggleLike, handleToggleCommentLike, handleToggleSavePost, handleVoteOnPoll, handleAddComment, handleUpdateComment, handleDeleteComment, handleIncrementView };
};
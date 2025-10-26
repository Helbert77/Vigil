import { supabase } from '@/integrations/supabase/client';
import { Poll, EvidenceItem, User } from '@/types';

// --- Auth API ---
export const logout = () => supabase.auth.signOut();
export const updateUserPassword = (newPassword: string) => 
  supabase.auth.updateUser({ password: newPassword });

// --- Content Moderation API ---
export const moderateContent = (text: string) =>
  supabase.functions.invoke('moderar-conteudo', {
    body: { texto: text },
  });

export const processModerationAction = (actionData: { itemId: string; action: string; moderatorId: string; reason?: string; duration?: string }) =>
  supabase.functions.invoke('process-moderation-action', {
    body: actionData,
  });

export const fetchUserViolations = (userId: string) =>
  supabase.from('user_violations').select('*, moderator:moderator_id(username)').eq('user_id', userId).order('created_at', { ascending: false });

export const fetchModeratorNotes = (userId: string) =>
    supabase.from('moderator_notes').select('*, moderator:moderator_id(username)').eq('user_id', userId).order('created_at', { ascending: false });

export const addModeratorNote = (noteData: { user_id: string; moderator_id: string; note: string }) =>
    supabase.from('moderator_notes').insert(noteData);

export const getUserViolationPoints = (userId: string) =>
    supabase.rpc('get_user_violation_points', { user_uuid: userId });

export const createAppeal = (appealData: { violation_id: string; user_id: string; reason: string; }) =>
    supabase.from('moderation_appeals').insert(appealData);

export const fetchUserAppeals = (userId: string) =>
    supabase.from('moderation_appeals').select('violation_id, status').eq('user_id', userId);

export const fetchModerationQueue = () =>
  supabase
    .from('moderation_queue')
    .select('*, author:author_id(*)')
    .eq('status', 'pending')
    .order('severity_score', { ascending: false });

export const fetchAppealsQueue = () =>
  supabase
    .from('moderation_appeals')
    .select(`
      *, 
      violation:violation_id(*), 
      user:user_id(*)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

export const processAppeal = (appealId: string, violationId: string, action: 'approved' | 'rejected', notes?: string) =>
  supabase.functions.invoke('process-appeal', {
    body: { appealId, violationId, action, notes },
  });

export const addManualViolation = (actionData: { targetUserId: string; action: string; reason: string; }) =>
  supabase.functions.invoke('manual-moderation-action', {
    body: actionData,
  });

export const resetViolationPoints = (userId: string) =>
  supabase.rpc('reset_user_violation_points', { user_uuid: userId });

export const clearViolationHistory = (userId: string) =>
  supabase.rpc('clear_user_violation_history', { user_uuid: userId });

export const deleteModeratorNote = (noteId: string) =>
  supabase.from('moderator_notes').delete().eq('id', noteId);

export const createReport = (reportData: { reporter_id: string; content_id: string; content_type: 'post' | 'comment'; reason: string; notes?: string; }) =>
  supabase.from('reports').insert(reportData);

export const clearResolvedModerationQueue = () =>
  supabase.rpc('clear_resolved_moderation_queue');

export const clearAllViolationHistory = () =>
  supabase.rpc('clear_all_violation_history');


// --- Posts API ---
export const fetchPosts = (userId: string) => 
  supabase
    .from('posts')
    .select(`
      id, content, image_url, video_url, audio_url, poll_data, evidence_board_data, created_at, 
      likes_count, comments_count, shares_count, views_count, community_id, user_id, is_pinned, media_is_sensitive,
      profiles (*), 
      comments (*, profiles (*), comment_likes(user_id)), 
      post_likes ( user_id ), 
      poll_votes!left ( option_index )
    `)
    .eq('poll_votes.user_id', userId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .order('created_at', { foreignTable: 'comments', ascending: false });

export const addPost = (postData: { user_id: string; content: string; image_url?: string; video_url?: string; audio_url?: string; poll_data?: Poll; community_id?: string | null; evidence_board_data?: EvidenceItem[]; media_is_sensitive?: boolean; }) =>
  supabase.from('posts').insert(postData).select().single();

export const deletePost = (postId: string) =>
  supabase.from('posts').delete().eq('id', postId);

export const updatePost = (postId: string, updates: { [key: string]: any }) =>
  supabase.from('posts').update(updates).eq('id', postId);

export const togglePostLike = (postId: string, userId: string, isCurrentlyLiked: boolean) => {
  if (isCurrentlyLiked) {
    return supabase.from('post_likes').delete().match({ post_id: postId, user_id: userId });
  } else {
    return supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
  }
};

export const fetchSavedPostIds = (userId: string) =>
  supabase.from('saved_posts').select('post_id').eq('user_id', userId);

export const toggleSavePost = (postId: string, userId: string, isCurrentlySaved: boolean) => {
  if (isCurrentlySaved) {
    return supabase.from('saved_posts').delete().match({ user_id: userId, post_id: postId });
  } else {
    return supabase.from('saved_posts').insert({ user_id: userId, post_id: postId });
  }
};

export const voteOnPoll = (postId: string, optionIndex: number) =>
  supabase.rpc('vote_on_poll', { post_id_in: postId, option_index_in: optionIndex });

export const incrementPostView = (postId: string) =>
  supabase.rpc('increment_post_view', { post_id_in: postId });

// --- Comments API ---
export const addComment = (commentData: { post_id: string; user_id: string; content: string; image_url?: string; parent_comment_id?: string }) =>
  supabase.from('comments').insert(commentData);

export const updateComment = (commentId: string, newText: string) =>
  supabase.from('comments').update({ content: newText }).eq('id', commentId);

export const deleteComment = (commentId: string) =>
  supabase.from('comments').delete().eq('id', commentId);

export const toggleCommentLike = (commentId: string, userId: string, isCurrentlyLiked: boolean) => {
  if (isCurrentlyLiked) {
    return supabase.from('comment_likes').delete().match({ comment_id: commentId, user_id: userId });
  } else {
    return supabase.from('comment_likes').insert({ comment_id: commentId, user_id: userId });
  }
};

export const fetchCommentAuthor = (commentId: string) =>
  supabase.from('comments').select('user_id').eq('id', commentId).single();

export const incrementCommentView = (commentId: string) =>
  supabase.rpc('increment_comment_view', { comment_id_in: commentId });

// --- Users & Profiles API ---
export const fetchAllUsers = () => supabase.from('profiles').select('*');

export const fetchFollowedIds = (userId: string) =>
  supabase.from('followers').select('following_id').eq('follower_id', userId);

export const fetchBlockedIds = (userId: string) =>
  supabase.from('blocked_users').select('blocked_id').eq('blocker_id', userId);

export const fetchBlockedProfiles = (blockedIds: string[]) =>
  supabase.from('profiles').select('*').in('id', blockedIds);

export const fetchUsersToFollow = async (userId: string) => {
  try {
    // Buscar todos os perfis disponíveis
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', userId) // Excluir o próprio usuário
      .limit(20); // Limitar para performance

    if (profilesError) throw profilesError;

    return { data: profiles, error: null };
  } catch (error) {
    console.error('Error fetching users to follow:', error);
    return { data: null, error };
  }
};

export const followUser = (followerId: string, followingId: string) =>
  supabase.from('followers').insert({ follower_id: followerId, following_id: followingId });

export const unfollowUser = (followerId: string, followingId: string) =>
  supabase.from('followers').delete().match({ follower_id: followerId, following_id: followingId });

export const blockUser = (blockerId: string, blockedId: string) =>
  supabase.from('blocked_users').insert({ blocker_id: blockerId, blocked_id: blockedId });

export const unblockUser = (blockerId: string, blockedId: string) =>
  supabase.from('blocked_users').delete().match({ blocker_id: blockerId, blocked_id: blockedId });

export const updateUser = (userId: string, updates: { [key: string]: any }) =>
  supabase.from('profiles').update(updates).eq('id', userId);

export const updateUserRole = (userId: string, role: 'user' | 'moderator' | 'admin') =>
  supabase.from('profiles').update({ role }).eq('id', userId);

export const deleteUserAccount = () =>
  supabase.functions.invoke('delete-user');

export const fetchFollows = async (userId: string) => {
    const { data: followersData, error: followersError } = await supabase.from('followers').select('follower_id').eq('following_id', userId);
    const { data: followingData, error: followingError } = await supabase.from('followers').select('following_id').eq('follower_id', userId);
    if (followersError || followingError) throw new Error(followersError?.message || followingError?.message);
    return {
        followerIds: followersData.map(f => f.follower_id),
        followingIds: followingData.map(f => f.following_id),
    };
};

// --- Timeline Events API ---
export const fetchTimelineEvents = () =>
  supabase.rpc('get_timeline_events_with_children');

export const createTimelineEvent = (eventData: {
  title: string;
  year: number;
  category: 'politics' | 'science' | 'health' | 'religion' | 'technology' | 'society';
  description?: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  status: 'confirmed' | 'disputed' | 'debunked';
  country?: string;
  parent_id?: string;
  x_position?: number;
  y_position?: number;
  source_1?: string;
  source_2?: string;
  evidence_level?: 'baixo' | 'medio' | 'alto' | 'confirmado';
  social_damage?: 'baixo' | 'medio' | 'alto' | 'critico';
  event_date?: string;
  image_url?: string;
}) =>
  supabase.from('timeline_events').insert(eventData).select().single();

export const updateTimelineEvent = (eventId: string, updates: { [key: string]: any }) =>
  supabase.from('timeline_events').update(updates).eq('id', eventId);

export const deleteTimelineEvent = (eventId: string) =>
  supabase.from('timeline_events').delete().eq('id', eventId);

export const updateEventPosition = (eventId: string, x: number, y: number) =>
  supabase.rpc('update_event_position', { 
    event_id_in: eventId, 
    x_pos: x, 
    y_pos: y 
  });

// --- Communities API ---
export const fetchCommunities = () => supabase.from('communities').select('*');

export const fetchJoinedCommunityIds = (userId: string) =>
  supabase.from('user_communities').select('community_id').eq('user_id', userId);

export const joinCommunity = (userId: string, communityId: string) =>
  supabase.from('user_communities').insert({ user_id: userId, community_id: communityId });

export const leaveCommunity = (userId: string, communityId: string) =>
  supabase.from('user_communities').delete().eq('user_id', userId).eq('community_id', communityId);

export const createCommunity = (communityData: { id: string; name: string; description: string; rules: string[]; tag: string; banner_url: string; }) =>
  supabase.from('communities').insert(communityData).select().single();

export const fetchActiveMembers = (communityId: string) =>
  supabase.rpc('get_community_active_members', { community_id_in: communityId });

// --- Topics API ---
export const fetchTrendingTopics = async () => {
  console.log('[API] fetchTrendingTopics called');
  try {
    const result = await supabase.rpc('get_trending_topics');
    console.log('[API] fetchTrendingTopics raw result:', result);
    console.log('[API] fetchTrendingTopics result.data:', result.data);
    console.log('[API] fetchTrendingTopics result.error:', result.error);
    
    // O resultado vem em result.data, não diretamente no result
    if (result.error) {
      console.error('[API] RPC error:', result.error);
      return { data: [], error: result.error };
    }
    
    // Retorna o formato correto
    return { data: result.data || [], error: null };
  } catch (error) {
    console.error('[API] fetchTrendingTopics exception:', error);
    return { data: [], error };
  }
};

// --- Notifications API ---
export const fetchNotifications = (userId: string) =>
  supabase.from('notifications').select(`*, actor:actor_id (*)`).eq('recipient_id', userId).order('created_at', { ascending: false });

export const createNotification = (notification: { recipient_id: string; actor_id: string; type: 'like' | 'comment' | 'follow' | 'comment_like' | 'mention' | 'message'; post_id?: string; }) =>
  supabase.rpc('create_notification_if_enabled', {
    p_recipient_id: notification.recipient_id,
    p_actor_id: notification.actor_id,
    p_type: notification.type,
    p_post_id: notification.post_id
  });

export const clearAllNotifications = (userId: string) =>
  supabase.from('notifications').delete().eq('recipient_id', userId);

export const markAllNotificationsAsRead = (userId: string) =>
  supabase.from('notifications').update({ is_read: true }).eq('recipient_id', userId).eq('is_read', false);

// --- Conversations API ---
export const fetchConversationIds = (userId: string) =>
  supabase.from('conversation_participants').select('conversation_id').eq('user_id', userId);

export const fetchFullConversations = (conversationIds: string[]) =>
  supabase
    .from('conversations')
    .select(`id, participants:conversation_participants(user_id, profiles(*)), messages(*)`)
    .in('id', conversationIds)
    .order('created_at', { foreignTable: 'messages', ascending: true });

export const sendMessage = async (messageData: { conversationId?: string, targetUserId?: string, text: string }) => {
  try {
    console.log('API sendMessage called with:', messageData);
    
    const response = await supabase.functions.invoke('send-message', { 
      body: { 
        conversation_id: messageData.conversationId, 
        target_user_id: messageData.targetUserId, 
        content: messageData.text 
      } 
    });
    
    console.log('Edge function response:', response);
    
    if (response.error) {
      console.error('Edge function error:', response.error);
      throw response.error;
    }
    
    return response;
  } catch (error) {
    console.error('Error in sendMessage API:', error);
    throw error;
  }
};

export const hardDeleteConversation = (conversationId: string) =>
  supabase.functions.invoke('hard-delete-conversation', {
    body: { conversation_id: conversationId },
  });

// --- Subscriptions API ---
export const upsertSubscription = (userId: string, plan: 'free' | 'basic' | 'pro' | 'premium') =>
  supabase.from('subscriptions').upsert({ user_id: userId, plan, status: 'active' }, { onConflict: 'user_id' });

export const fetchUserSubscription = (userId: string) =>
  supabase.from('subscriptions').select('plan').eq('user_id', userId).single();

export const submitCancellationFeedback = (feedbackData: { user_id: string; previous_plan: string; reason: string; details: string; }) =>
  supabase.from('cancellation_feedback').insert(feedbackData);

export const fetchCancellationFeedback = () =>
  supabase.rpc('get_cancellation_feedback_with_profiles');
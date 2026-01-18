import { supabase } from '../../integrations/supabase/client';
import { canAccessLibrary, canAddLibraryItems } from '@/src/utils/libraryAccess';

// Utility function for standardized error handling and logging
const handleApiError = (error: any, operation: string, context?: any) => {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    operation,
    error: {
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint
    },
    context
  };

  // Log different error types appropriately
  if (error?.code === 'PGRST205') {
    console.warn(`[${timestamp}] Table not found in ${operation}:`, errorInfo);
  } else if (error?.code === 'PGRST116') {
    console.warn(`[${timestamp}] Column not found in ${operation}:`, errorInfo);
  } else if (error?.code === '42703') {
    console.warn(`[${timestamp}] PostgreSQL column error in ${operation}:`, errorInfo);
  } else if (error?.message?.includes('JWT')) {
    console.error(`[${timestamp}] Authentication error in ${operation}:`, errorInfo);
  } else {
    console.error(`[${timestamp}] API error in ${operation}:`, errorInfo);
  }

  return errorInfo;
};

// Utility function to check if error is related to missing table/column
const isMissingResourceError = (error: any) => {
  return error?.code === 'PGRST205' || // Table not found
         error?.code === 'PGRST116' || // Column not found
         error?.code === '42703' ||    // PostgreSQL: column does not exist
         error?.message?.includes('column') ||
         error?.message?.includes('table') ||
         error?.message?.includes('relation');
};

// Cache for table existence checks to avoid repeated API calls
const tableExistenceCache = new Map<string, boolean>();

// Function to check if a table exists
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  // Check cache first
  if (tableExistenceCache.has(tableName)) {
    return tableExistenceCache.get(tableName)!;
  }

  try {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    const exists = !error || !isMissingResourceError(error);
    
    // Cache the result for 5 minutes
    tableExistenceCache.set(tableName, exists);
    setTimeout(() => tableExistenceCache.delete(tableName), 5 * 60 * 1000);
    
    return exists;
  } catch (error) {
    console.debug(`Table existence check failed for ${tableName}:`, error);
    return false;
  }
};
import { Poll, EvidenceItem, User } from '@/types';

// --- Session Management ---
export const ensureValidSession = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Falha na autenticação. Faça login novamente.');
    }
    
    if (!session) {
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    
    // If session is close to expiring (within 5 minutes), refresh it
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at || 0;
    const timeUntilExpiry = expiresAt - now;
    
    if (timeUntilExpiry < 300) { // Less than 5 minutes
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('Session refresh error:', refreshError);
        throw new Error('Falha ao renovar sessão. Faça login novamente.');
      }
      
      if (!refreshedSession) {
        throw new Error('Não foi possível renovar a sessão. Faça login novamente.');
      }
      
      return refreshedSession;
    }
    
    return session;
  } catch (error) {
    console.error('Error ensuring valid session:', error);
    throw error;
  }
};

// Removido: funcionalidades da tabela library_items

// --- Auth API ---
export const logout = async () => {
  try {
    // Limpar configurações de sessão relacionadas ao "Mantenha-me conectado"
    localStorage.removeItem('keepLoggedIn');
    localStorage.removeItem('sessionExpiry');
    
    // Verificar se já existe uma sessão ativa antes de tentar fazer logout
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Se não há sessão ativa, considerar logout bem-sucedido
      // console.log('Nenhuma sessão ativa encontrada, logout local realizado');
      return { error: null };
    }
    
    // Criar um AbortController para cancelar a requisição se necessário
    const abortController = new AbortController();
    
    // Tentar fazer logout do Supabase com timeout e controle de abort
    // Usar escopo "local" para evitar chamada de rede que pode ser abortada em navegação
    const signOutPromise = supabase.auth.signOut({ scope: 'local' });
    const timeoutPromise = new Promise((_, reject) => {
      const timeoutId = setTimeout(() => {
        abortController.abort();
        reject(new Error('Timeout na requisição de logout'));
      }, 5000); // Reduzido para 5 segundos
      
      // Limpar timeout se a promise for resolvida
      signOutPromise.finally(() => clearTimeout(timeoutId));
    });

    const result = await Promise.race([signOutPromise, timeoutPromise]);
    const error = (result as any)?.error;
    
    // Tratar AuthSessionMissingError como um sucesso, pois o usuário já está deslogado
    if (error && error.name !== 'AuthSessionMissingError') {
      console.warn('Erro no logout do Supabase (não crítico):', error);
      // Mesmo com outros erros, retornar um objeto de erro para o App.tsx decidir o que fazer
      return { error };
    }
    
    // Se não houver erro ou for AuthSessionMissingError, considerar sucesso
    return { error: null };

  } catch (networkError: unknown) {
    const errorMessage = networkError instanceof Error ? networkError.message : String(networkError);
    const errorName = networkError instanceof Error ? networkError.name : '';
    
    // Para erros de rede específicos (como net::ERR_ABORTED), silenciar e considerar sucesso
    if (errorMessage.includes('ERR_ABORTED') || 
        errorMessage.includes('Timeout') ||
        errorMessage.includes('AbortError') ||
        errorName === 'AbortError') {
      // Não logar erro para ERR_ABORTED pois é esperado em algumas situações
      // console.log('Logout local realizado (conexão interrompida)');
      return { error: null };
    }
    
    // Para outros tipos de erro, logar apenas como warning
    console.warn('Erro durante o logout (dados locais limpos):', errorMessage);
    
    // Sempre retornar sucesso após limpar dados locais
    return { error: null };
  }
};
export const updateUserPassword = (newPassword: string) => 
  supabase.auth.updateUser({ password: newPassword });

export const verifyCurrentPassword = async (currentPassword: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      throw new Error('Usuário não encontrado');
    }

    // Attempt to sign in with current credentials to verify password
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    });

    if (error) {
      throw new Error('Senha incorreta');
    }

    return { error: null };
  } catch (error) {
    console.error('Error verifying password:', error);
    return { error };
  }
};

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

type ReportContentType = 'post' | 'comment' | 'ad';

export const createReport = async (reportData: { reporter_id: string; content_id: string; content_type: ReportContentType; reason: string; notes?: string; }) => {
  try {
    // 0. Verificar se já existe uma denúncia deste usuário para este conteúdo
    const { data: existingReport, error: checkError } = await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', reportData.reporter_id)
      .eq('content_id', reportData.content_id)
      .eq('content_type', reportData.content_type)
      .maybeSingle();

    if (checkError) {
      console.warn('Erro ao verificar denúncia existente:', checkError);
    }

    // Se já existe uma denúncia, retornar erro amigável
    if (existingReport) {
      return { 
        data: null, 
        error: { 
          message: 'Você já denunciou este conteúdo anteriormente.',
          code: 'DUPLICATE_REPORT'
        } 
      };
    }

    // 1. Inserir a denúncia na tabela reports
    const { data: reportRecord, error: reportError } = await supabase
      .from('reports')
      .insert(reportData)
      .select()
      .single();

    if (reportError) {
      // Se for erro de duplicata, retornar mensagem amigável
      if (reportError.code === '23505' || reportError.message?.includes('duplicate')) {
        return { 
          data: null, 
          error: { 
            message: 'Você já denunciou este conteúdo anteriormente.',
            code: 'DUPLICATE_REPORT'
          } 
        };
      }
      handleApiError(reportError, 'createReport - insert report', reportData);
      return { data: null, error: reportError };
    }

    // 2. Buscar o conteúdo denunciado
    let contentText = 'Conteúdo não disponível';
    let authorId: string | null = null;

    if (reportData.content_type === 'post' || reportData.content_type === 'comment') {
      const contentTable = reportData.content_type === 'post' ? 'posts' : 'comments';
      
      const { data: content, error: contentError } = await supabase
        .from(contentTable)
        .select('*, profiles(*)')
        .eq('id', reportData.content_id)
        .single();

      if (!contentError && content) {
        contentText = content?.content || 'Conteúdo não disponível';
        authorId = content?.user_id || content?.profiles?.id || null;
      }
    } else if (reportData.content_type === 'ad') {
      const { data: adContent, error: adError } = await supabase
        .from('anuncios')
        .select('id, title, description, advertiser_name, advertiser_avatar, created_by')
        .eq('id', reportData.content_id)
        .single();

      if (!adError && adContent) {
        const title = adContent.title ?? 'Anúncio';
        const description = adContent.description ?? '';
        contentText = `${title}\n${description}`.trim() || 'Anúncio sem descrição';
        authorId = adContent.created_by ?? null;
      }
    }

    // 3. Calcular severity score
    let severityScore = 50;
    const reasonLower = reportData.reason.toLowerCase();
    
    if (reasonLower.includes('spam')) severityScore = 60;
    else if (reasonLower.includes('harassment') || reasonLower.includes('assédio')) severityScore = 85;
    else if (reasonLower.includes('hate') || reasonLower.includes('ódio')) severityScore = 95;
    else if (reasonLower.includes('violence') || reasonLower.includes('violência')) severityScore = 90;
    else if (reasonLower.includes('self_harm') || reasonLower.includes('autopreservação')) severityScore = 95;
    else if (reasonLower.includes('sexual')) severityScore = 90;
    else if (reasonLower.includes('misinformation') || reasonLower.includes('desinformação')) severityScore = 70;

    // 4. Determinar tipos de violação
    const violationTypes: string[] = [];
    if (reasonLower.includes('spam')) violationTypes.push('spam');
    if (reasonLower.includes('harassment') || reasonLower.includes('assédio')) violationTypes.push('harassment');
    if (reasonLower.includes('hate') || reasonLower.includes('ódio')) violationTypes.push('hate_speech');
    if (reasonLower.includes('violence') || reasonLower.includes('violência')) violationTypes.push('violence');
    if (reasonLower.includes('self_harm')) violationTypes.push('self_harm');
    if (reasonLower.includes('sexual')) violationTypes.push('sexual_content');
    if (reasonLower.includes('misinformation') || reasonLower.includes('desinformação')) violationTypes.push('misinformation');
    
    if (violationTypes.length === 0) violationTypes.push('other');

    // 5. Inserir na fila de moderação
    const moderationQueueData = {
      content_id: reportData.content_id,
      content_type: reportData.content_type,
      content_text: contentText,
      author_id: authorId,
      severity_score: severityScore,
      violation_types: violationTypes,
      status: 'pending'
    };

    const { error: queueError } = await supabase
      .from('moderation_queue')
      .insert(moderationQueueData);

    if (queueError) {
      console.error('Erro ao adicionar à fila de moderação:', queueError);
    }

    return { data: reportRecord, error: null };
  } catch (error) {
    handleApiError(error, 'createReport - general', reportData);
    return { data: null, error };
  }
};

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

export const deletePost = async (postId: string) => {
  try {
    const result = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);
    
    return result;
  } catch (error) {
    return { data: null, error };
  }
};

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

// Não fazemos nada no backend - apenas incrementamos localmente
// O contador de views é gerenciado apenas no frontend para performance
export const incrementPostView = async (postId: string) => {
  // Retorna sucesso sem fazer chamada ao banco
  return { data: null, error: null };
};

// --- Support API ---
export const submitSupportTicket = async (ticketData: any) => {
  const { data, error } = await supabase.functions.invoke('send-support-email', {
    body: ticketData
  });
  
  if (error) throw error;
  return data;
};

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

export const fetchFollowersWithProfiles = async (userId: string) => {
  try {
    // Buscar IDs dos seguidores (pessoas que o usuário segue)
    const { data: followersData, error: followersError } = await fetchFollowedIds(userId);
    
    if (followersError) throw followersError;
    
    if (!followersData || followersData.length === 0) {
      return { data: [], error: null };
    }
    
    // Extrair IDs dos seguidores
    const followerIds = followersData.map((f: any) => f.following_id);
    
    // Buscar perfis completos dos seguidores
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', followerIds);
    
    if (profilesError) throw profilesError;
    
    return { data: profilesData || [], error: null };
  } catch (error) {
    console.error('Error fetching followers with profiles:', error);
    return { data: null, error };
  }
};

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

// Removido: API da Library e mapeamentos

// --- Trial Coupons API ---
export const fetchTrialCoupons = () =>
  supabase
    .from('trial_coupons')
    .select('*')
    .order('created_at', { ascending: false });

export const createTrialCoupon = async (couponData: {
  code: string;
  plan: 'basic' | 'pro' | 'premium';
  trial_days: number;
  max_uses: number | null;
  valid_from: string | null;
  valid_until: string | null;
}) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-trial-coupon', {
      body: couponData
    });

    if (error) {
      // Criar objeto de erro mais detalhado
      const enhancedError: any = new Error(error.message || 'Erro ao criar cupom');
      enhancedError.code = error.name || 'FUNCTION_ERROR';
      enhancedError.originalError = error;
      throw enhancedError;
    }

    // Verificar se a resposta indica erro
    if (data && !data.success) {
      const apiError: any = new Error(data.error || 'Erro ao criar cupom');
      apiError.code = data.code || 'API_ERROR';
      apiError.details = data.details;
      throw apiError;
    }

    return { data: data?.coupon || data, error: null };
  } catch (error: any) {
    // Re-throw com informações adicionais se necessário
    if (error.message && error.code) {
      throw error;
    }
    
    // Criar erro padronizado
    const standardError: any = new Error(
      error.message || 'Erro desconhecido ao criar cupom'
    );
    standardError.code = error.code || 'UNKNOWN_ERROR';
    standardError.originalError = error;
    throw standardError;
  }
};

export const toggleCouponStatus = async (couponId: string, isActive: boolean) => {
  const { data, error } = await supabase.functions.invoke('manage-trial-coupon', {
    body: {
      couponId,
      action: 'toggle_status',
      isActive
    }
  });

  if (error) {
    throw error;
  }

  if (!data.success) {
    throw new Error(data.error || 'Failed to toggle coupon status');
  }

  return { data: data.result, error: null };
};

export const fetchCouponUsages = (couponId: string) =>
  supabase
    .from('trial_coupon_usage')
    .select(`
      *,
      profiles:user_id (
        username,
        email
      )
    `)
    .eq('coupon_id', couponId)
    .order('used_at', { ascending: false });

// --- User Data API ---
export const fetchInitialData = async (user: User) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Fetch user's data
    const [profileData, postsData, commentsData, notificationsData] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('posts').select('*').eq('user_id', user.id),
      supabase.from('comments').select('*').eq('user_id', user.id),
      supabase.from('notifications').select('*').eq('user_id', user.id)
    ]);

    const userData = {
      profile: profileData.data,
      posts: postsData.data || [],
      comments: commentsData.data || [],
      notifications: notificationsData.data || [],
      exportDate: new Date().toISOString()
    };

    // Create and download JSON file
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `vigil-user-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { error: null };
  } catch (error) {
    console.error('Error downloading user data:', error);
    return { error };
  }
};

// Send deletion confirmation email
export const sendDeletionEmail = async (
  type: 'deletion_scheduled' | 'deletion_cancelled' | 'deletion_reminder',
  scheduledDate?: string,
  gracePeriodDays?: number
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get user profile for name
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, full_name')
      .eq('id', user.id)
      .single();

    const userName = profile?.full_name || profile?.username || 'Usuário';

    const { data, error } = await supabase.functions.invoke('send-deletion-email', {
      body: {
        type,
        userEmail: user.email,
        userName,
        scheduledDate,
        gracePeriodDays
      }
    });

    if (error) {
      console.error('Error sending deletion email:', error);
      return { data: null, error: error.message };
    }

   return { data, error: null };
  } catch (error: unknown) {
     console.error('Error sending deletion email:', error);
     return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
   }
};

// --- Account Deletion API ---
export const getAccountDeletionStatus = async (): Promise<{ data: any | null; error: any | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const tableExists = await checkTableExists('account_deletion_requests');
    if (!tableExists) {
      const err = { message: 'Funcionalidade não disponível: tabela account_deletion_requests ausente', code: 'PGRST205' };
      handleApiError(err, 'getAccountDeletionStatus', { user_id: user.id, table_name: 'account_deletion_requests' });
      return { data: null, error: err };
    }

    const { data, error } = await supabase
      .from('account_deletion_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      handleApiError(error, 'getAccountDeletionStatus', { user_id: user.id });
      return { data: null, error };
    }

    const latest = Array.isArray(data) ? (data[0] || null) : null;
    console.debug('Deletion status fetched', { user_id: user.id, latest });
    return { data: latest, error: null };
  } catch (error) {
    handleApiError(error, 'getAccountDeletionStatus');
    return { data: null, error };
  }
};

export const scheduleAccountDeletion = async (
  gracePeriodDays: number = 7
): Promise<{ data: any | null; error: any | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const tableExists = await checkTableExists('account_deletion_requests');
    if (!tableExists) {
      const err = { message: 'Funcionalidade não disponível: tabela account_deletion_requests ausente', code: 'PGRST205' };
      handleApiError(err, 'scheduleAccountDeletion', { user_id: user.id, table_name: 'account_deletion_requests' });
      return { data: null, error: err };
    }

    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + gracePeriodDays);

    const { data, error } = await supabase
      .from('account_deletion_requests')
      .insert({
        user_id: user.id,
        status: 'scheduled',
        grace_period_days: gracePeriodDays,
        scheduled_deletion_date: scheduledDate.toISOString()
      })
      .select()
      .single();

    if (error) {
      handleApiError(error, 'scheduleAccountDeletion', { user_id: user.id });
      return { data: null, error };
    }

    console.debug('Account deletion scheduled', { user_id: user.id, gracePeriodDays, scheduledDate });
    return { data, error: null };
  } catch (error) {
    handleApiError(error, 'scheduleAccountDeletion');
    return { data: null, error };
  }
};

export const cancelAccountDeletion = async (): Promise<{ data: any | null; error: any | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const tableExists = await checkTableExists('account_deletion_requests');
    if (!tableExists) {
      const err = { message: 'Funcionalidade não disponível: tabela account_deletion_requests ausente', code: 'PGRST205' };
      handleApiError(err, 'cancelAccountDeletion', { user_id: user.id, table_name: 'account_deletion_requests' });
      return { data: null, error: err };
    }

    // Update latest scheduled request to cancelled
    const { data: latestArr } = await supabase
      .from('account_deletion_requests')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'scheduled')
      .order('created_at', { ascending: false })
      .limit(1);

    const latestId = Array.isArray(latestArr) && latestArr[0]?.id;
    if (!latestId) {
      return { data: null, error: null };
    }

    const { data, error } = await supabase
      .from('account_deletion_requests')
      .update({ status: 'cancelled' })
      .eq('id', latestId)
      .select()
      .single();

    if (error) {
      handleApiError(error, 'cancelAccountDeletion', { user_id: user.id, request_id: latestId });
      return { data: null, error };
    }

    console.debug('Account deletion cancelled', { user_id: user.id, request_id: latestId });
    return { data, error: null };
  } catch (error) {
    handleApiError(error, 'cancelAccountDeletion');
    return { data: null, error };
  }
};

export const deleteUserAccount = async (): Promise<{ data: any | null; error: any | null }> => {
  try {
    const { data, error } = await supabase.functions.invoke('delete-user', { body: {} });
    if (error) {
      handleApiError(error, 'deleteUserAccount');
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    handleApiError(error, 'deleteUserAccount');
    return { data: null, error };
  }
};

// Convenience alias expected by UI components
export const downloadUserData = async (): Promise<{ error: any | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const [profileData, postsData, commentsData, notificationsData] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('posts').select('*').eq('user_id', user.id),
      supabase.from('comments').select('*').eq('user_id', user.id),
      supabase.from('notifications').select('*').eq('user_id', user.id)
    ]);

    const userData = {
      profile: profileData.data,
      posts: postsData.data || [],
      comments: commentsData.data || [],
      notifications: notificationsData.data || [],
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vigil-user-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { error: null };
  } catch (error) {
    handleApiError(error, 'downloadUserData');
    return { error };
  }
};

export const fetchFollows = async (userId: string) => {
    const { data: followersData, error: followersError } = await supabase.from('followers').select('follower_id').eq('following_id', userId);
    const { data: followingData, error: followingError } = await supabase.from('followers').select('following_id').eq('follower_id', userId);
    if (followersError || followingError) throw new Error(followersError?.message || followingError?.message);
    return {
        followerIds: (followersData || []).map((f: { follower_id: string }) => f.follower_id),
        followingIds: (followingData || []).map((f: { following_id: string }) => f.following_id),
    };
};

// --- Timeline Events API ---
export const fetchTimelineEvents = () =>
  supabase
    .from('timeline_events')
    .select('*')
    .order('year', { ascending: true });

export const createTimelineEvent = (eventData: {
  title: string;
  year: number;
  category: 'politics' | 'science' | 'health' | 'religion' | 'technology' | 'society';
  description?: string;
  country?: string;
  parent_id?: string;
  x_position?: number;
  y_position?: number;
  source_1?: string;
  source_2?: string;
  event_date?: string;
  image_url?: string;
}) =>
  supabase.from('timeline_events').insert(eventData).select().single();

export const voteOnEvent = async (
  eventId: string, 
  voteType: 'up' | 'down', 
  userId: string
) => {
  // Buscar evento atual
  const { data: event, error: fetchError } = await supabase
    .from('timeline_events')
    .select('upvotes, downvotes, user_votes')
    .eq('id', eventId)
    .single();

  if (fetchError || !event) {
    return { data: null, error: fetchError || new Error('Evento não encontrado') };
  }

  const userVotes = event.user_votes || {};
  const previousVote = userVotes[userId];
  
  let upvotes = event.upvotes || 0;
  let downvotes = event.downvotes || 0;

  // Se clicou no mesmo botão, remove o voto
  if (previousVote === voteType) {
    if (voteType === 'up') upvotes--;
    if (voteType === 'down') downvotes--;
    delete userVotes[userId];
  } else {
    // Remover voto anterior se existir
    if (previousVote === 'up') upvotes--;
    if (previousVote === 'down') downvotes--;

    // Adicionar novo voto
    if (voteType === 'up') upvotes++;
    if (voteType === 'down') downvotes++;
    
    userVotes[userId] = voteType;
  }

  return supabase
    .from('timeline_events')
    .update({ upvotes, downvotes, user_votes: userVotes })
    .eq('id', eventId);
};

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

export const createCommunity = (communityData: { id: string; name: string; description: string; rules: string[]; tag: string; banner_url: string; required_plan?: string; creator_id?: string; }) =>
  supabase.from('communities').insert(communityData).select().single();

export const updateCommunity = async (communityId: string, updates: {
  name?: string;
  description?: string;
  rules?: string[];
  banner_url?: string;
  required_plan?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('communities')
      .update(updates)
      .eq('id', communityId)
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateCommunityPlan = async (communityId: string, requiredPlan: string) => {
  try {
    // Buscar a comunidade atual para verificar permissões
    const { data: currentCommunity, error: fetchError } = await supabase
      .from('communities')
      .select('id, creator_id, required_plan')
      .eq('id', communityId)
      .single();
    
    if (fetchError || !currentCommunity) {
      return { data: null, error: fetchError || new Error('Comunidade não encontrada') };
    }
    
    // Atualizar com RPC para contornar possíveis problemas de RLS
    const { error: rpcError } = await supabase.rpc('update_community_required_plan', {
      p_community_id: communityId,
      p_required_plan: requiredPlan
    });
    
    // Se RPC falhar, tentar update direto
    if (rpcError) {
      const { error: updateError } = await supabase
        .from('communities')
        .update({ required_plan: requiredPlan })
        .eq('id', communityId);
      
      if (updateError) {
        return { data: null, error: updateError };
      }
    }
    
    // Buscar os dados atualizados
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .eq('id', communityId)
      .single();
    
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const fetchActiveMembers = (communityId: string) =>
  supabase.rpc('get_community_active_members', { community_id_in: communityId });

// --- Topics API ---
export const fetchTrendingTopics = async () => {
  try {
    const result = await supabase.rpc('get_trending_topics');
    
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

export const createNotification = (notification: { recipient_id: string; actor_id: string; type: 'like' | 'comment' | 'follow' | 'comment_like' | 'mention' | 'message' | 'chat_room_invitation' | 'room_access_request' | 'room_access_approved' | 'room_access_rejected' | 'timeline_approved' | 'timeline_rejected' | 'timeline_moderation_pending'; post_id?: string; metadata?: any; }) =>
  supabase.rpc('create_notification_if_enabled', {
    p_recipient_id: notification.recipient_id,
    p_actor_id: notification.actor_id,
    p_type: notification.type,
    p_post_id: notification.post_id,
    p_metadata: notification.metadata
  });

// Request room access
export const requestRoomAccess = async (roomId: string): Promise<{ data: any | null; error: any | null }> => {
  try {
    const { data, error } = await supabase.functions.invoke('request-room-access', {
      body: { room_id: roomId }
    });
    
    if (error) {
      handleApiError(error, 'requestRoomAccess');
      return { data: null, error };
    }
    
    if (data?.error) {
      return { data: null, error: new Error(data.error) };
    }
    
    return { data: data?.request || null, error: null };
  } catch (error) {
    handleApiError(error, 'requestRoomAccess');
    return { data: null, error };
  }
};

// Approve room access request
export const approveRoomAccess = async (requestId: string): Promise<{ data: any | null; error: any | null }> => {
  try {
    const response = await supabase.functions.invoke('approve-room-access', {
      body: { request_id: requestId }
    });
    
    const { data, error } = response;
    
    if (error) {
      handleApiError(error, 'approveRoomAccess');
      
      // Try to get error message from data (Supabase puts error body in data even on HTTP errors)
      let errorMessage = 'Erro ao aprovar pedido de acesso';
      if (data?.error) {
        errorMessage = data.error;
      } else if (data?.message) {
        errorMessage = data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      return { data: null, error: new Error(errorMessage) };
    }
    
    // Check if the response contains an error (even with status 200)
    if (data?.error) {
      return { data: null, error: new Error(data.error) };
    }
    
    // Check if success is false
    if (data?.success === false && data?.error) {
      return { data: null, error: new Error(data.error) };
    }
    
    return { data: data || null, error: null };
  } catch (error) {
    handleApiError(error, 'approveRoomAccess');
    const errorMessage = error instanceof Error ? error.message : 'Erro ao aprovar pedido de acesso';
    return { data: null, error: new Error(errorMessage) };
  }
};

// Reject room access request
export const rejectRoomAccess = async (requestId: string): Promise<{ data: any | null; error: any | null }> => {
  try {
    const response = await supabase.functions.invoke('reject-room-access', {
      body: { request_id: requestId }
    });
    
    const { data, error } = response;
    
    if (error) {
      handleApiError(error, 'rejectRoomAccess');
      
      // Try to get error message from data (Supabase puts error body in data even on HTTP errors)
      let errorMessage = 'Erro ao rejeitar pedido de acesso';
      if (data?.error) {
        errorMessage = data.error;
      } else if (data?.message) {
        errorMessage = data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      return { data: null, error: new Error(errorMessage) };
    }
    
    // Check if the response contains an error (even with status 200)
    if (data?.error) {
      return { data: null, error: new Error(data.error) };
    }
    
    // Check if success is false
    if (data?.success === false && data?.error) {
      return { data: null, error: new Error(data.error) };
    }
    
    return { data: data || null, error: null };
  } catch (error) {
    handleApiError(error, 'rejectRoomAccess');
    const errorMessage = error instanceof Error ? error.message : 'Erro ao rejeitar pedido de acesso';
    return { data: null, error: new Error(errorMessage) };
  }
};

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
    // Ensure we have a valid session before making the API call
    await ensureValidSession();
    
    const response = await supabase.functions.invoke('send-message', { 
      body: { 
        conversation_id: messageData.conversationId, 
        target_user_id: messageData.targetUserId, 
        content: messageData.text 
      } 
    });
    
    if (response.error) {
      throw response.error;
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

export const hardDeleteConversation = (conversationId: string) =>
  supabase.functions.invoke('hard-delete-conversation', {
    body: { conversation_id: conversationId },
  });

export const clearRoomMessages = (roomId: string) =>
  supabase.functions.invoke('clear-room-messages', {
    body: { room_id: roomId },
  });

// --- Library API ---
// Função auxiliar para obter usuário atual
const getCurrentUserProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, role')
      .eq('id', user.id)
      .single();

    return profile || null;
  } catch {
    // Silenciar erros de rede (ERR_ABORTED / Failed to fetch)
    return null;
  }
};

export const fetchLibraryItems = async () => {
  const profile = await getCurrentUserProfile();
  if (!profile || !canAccessLibrary(profile.plan, profile.role)) {
    // Retorna lista vazia em vez de erro para evitar logs de erro esperados
    return { data: [], error: null } as any;
  }
  return supabase.from('library_items').select('*').order('date', { ascending: false });
};

export const addLibraryItem = async (itemData: any) => {
  // Validar permissão para adicionar
  const profile = await getCurrentUserProfile();
  if (!profile || !canAddLibraryItems(profile.plan, profile.role)) {
    return { 
      data: null, 
      error: { message: 'Apenas usuários Premium e Administradores podem adicionar itens.' } 
    };
  }
  
  // Adicionar created_by automaticamente
  const { data: { user } } = await supabase.auth.getUser();
  const itemWithCreator = { 
    ...itemData, 
    created_by: user?.id 
  };
  
  return supabase.from('library_items').insert(itemWithCreator).select().single();
};

export const updateLibraryItem = async (id: string, updates: any) => {
  const profile = await getCurrentUserProfile();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!profile || !user) {
    return { data: null, error: { message: 'Usuário não autenticado.' } };
  }
  
  // Buscar item para verificar o criador
  const { data: item } = await supabase
    .from('library_items')
    .select('created_by')
    .eq('id', id)
    .single();
  
  // Permitir se for admin OU criador do item
  const isCreator = item?.created_by === user.id;
  const isAdmin = profile.role === 'admin';
  
  if (!isAdmin && !isCreator) {
    return { 
      data: null, 
      error: { message: 'Apenas administradores ou o criador podem modificar este item.' } 
    };
  }
  
  return supabase.from('library_items').update(updates).eq('id', id);
};

export const deleteLibraryItem = async (id: string) => {
  const profile = await getCurrentUserProfile();
  const { data: { user } } = await supabase.auth.getUser();
  
  // console.log('[deleteLibraryItem] Iniciando exclusão:', { id, userId: user?.id, userRole: profile?.role });
  
  if (!profile || !user) {
    console.error('[deleteLibraryItem] Usuário não autenticado');
    return { data: null, error: { message: 'Usuário não autenticado.' } };
  }
  
  // Buscar item para verificar o criador
  const { data: item, error: fetchError } = await supabase
    .from('library_items')
    .select('created_by')
    .eq('id', id)
    .single();
  
  if (fetchError) {
    console.error('[deleteLibraryItem] Erro ao buscar item:', fetchError);
    return { data: null, error: { message: 'Item não encontrado.' } };
  }
  
  // console.log('[deleteLibraryItem] Item encontrado:', { itemId: id, createdBy: item?.created_by, currentUser: user.id });
  
  // Permitir se for admin OU criador do item
  const isCreator = item?.created_by === user.id;
  const isAdmin = profile.role === 'admin';
  
  // console.log('[deleteLibraryItem] Verificação de permissões:', { isAdmin, isCreator });
  
  if (!isAdmin && !isCreator) {
    console.error('[deleteLibraryItem] Permissão negada');
    return { 
      data: null, 
      error: { message: 'Apenas administradores ou o criador podem excluir este item.' } 
    };
  }
  
  // console.log('[deleteLibraryItem] Executando DELETE no banco...');
  const result = await supabase.from('library_items').delete().eq('id', id);
  
  if (result.error) {
    console.error('[deleteLibraryItem] Erro ao excluir do banco:', result.error);
  } else {
    // console.log('[deleteLibraryItem] Item excluído com sucesso do banco');
  }
  
  return result;
};

export const incrementLibraryItemViews = (id: string) =>
  supabase.rpc('increment_library_item_views', { item_id: id });

export const incrementLibraryItemDownloads = (id: string) =>
  supabase.rpc('increment_library_item_downloads', { item_id: id });

// --- Subscriptions API ---
export const upsertSubscription = (userId: string, plan: 'free' | 'basic' | 'pro' | 'premium') =>
  supabase.from('subscriptions').upsert({ user_id: userId, plan, status: 'active' }, { onConflict: 'user_id' });

export const fetchUserSubscription = (userId: string) =>
  supabase.from('subscriptions').select('plan').eq('user_id', userId).single();

export const getUserSubscription = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('plan, status, created_at, updated_at')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }
    
    return { data: data || { plan: 'free', status: 'active' }, error: null };
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return { data: { plan: 'free', status: 'active' }, error };
  }
};

export const submitCancellationFeedback = (feedbackData: { user_id: string; previous_plan: string; reason: string; details: string; }) =>
  supabase.from('cancellation_feedback').insert(feedbackData);

export const fetchCancellationFeedback = () =>
  supabase.rpc('get_cancellation_feedback_with_profiles');

// Cancelar assinatura via Stripe
export const cancelSubscription = async (userId: string, reason?: string, details?: string) => {
  return supabase.functions.invoke('cancel-subscription', {
    body: {
      userId,
      reason,
      details,
    },
  });
};

// Alternative function to check for pending operations without status column dependency
export const getPendingOperationsSafe = async (userId: string) => {
  try {
    // Since most tables don't have status columns, we'll check for recent activity instead
    const [recentComments, recentReports] = await Promise.all([
      supabase
        .from('comments')
        .select('id, created_at')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .then((result: { data: { id: string; created_at: string }[] | null; error: { code?: string; message?: string } | null }) => {
          if (result.error) {
            console.debug('Error querying recent comments:', result.error);
            return { data: [], error: null };
          }
          return result;
        }),
      supabase
        .from('reports')
        .select('id, created_at')
        .eq('reporter_id', userId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .then((result: { data: { id: string; created_at: string }[] | null; error: { code?: string; message?: string } | null }) => {
          if (result.error) {
            console.debug('Error querying recent reports:', result.error);
            return { data: [], error: null };
          }
          return result;
        })
    ]);

    const totalRecent = (recentComments.data?.length || 0) + 
                       (recentReports.data?.length || 0);

    return { 
      count: totalRecent, 
      details: {
        posts: 0, // Posts don't have pending status
        comments: recentComments.data?.length || 0,
        reports: recentReports.data?.length || 0
      },
      error: null 
    };
  } catch (error) {
    console.debug('Error checking recent operations:', error);
    return { count: 0, details: { posts: 0, comments: 0, reports: 0 }, error };
  }
};

// Function to check for pending operations
export const getPendingOperations = async (userId: string) => {
  try {
    // Check for pending comments and reports (posts don't have status column)
    const [pendingComments, pendingReports] = await Promise.all([
      supabase.from('comments').select('id').eq('user_id', userId).eq('status', 'pending').then((result: { data: { id: string }[] | null; error: { code?: string; message?: string } | null }) => {
        // Handle case where comments table doesn't have status column or other errors
        if (result.error) {
          if (result.error.code === 'PGRST116' || // Column doesn't exist
              result.error.code === 'PGRST205' || // Table doesn't exist
              result.error.code === '42703' ||    // PostgreSQL: column does not exist
              result.error.message?.includes('column') ||
              result.error.message?.includes('status')) {
            console.debug('Comments table does not have status column, returning empty array');
            return { data: [], error: null };
          }
          console.warn('Error querying comments:', result.error);
          return { data: [], error: null };
        }
        return result;
      }),
      supabase.from('reports').select('id').eq('reporter_id', userId).eq('status', 'pending').then((result: { data: { id: string }[] | null; error: { code?: string; message?: string } | null }) => {
        // Handle case where reports table doesn't have status column or doesn't exist
        if (result.error) {
          if (result.error.code === 'PGRST116' || // Column doesn't exist
              result.error.code === 'PGRST205' || // Table doesn't exist
              result.error.code === '42703' ||    // PostgreSQL: column does not exist
              result.error.message?.includes('column') ||
              result.error.message?.includes('status')) {
            console.debug('Reports table does not have status column or does not exist, returning empty array');
            return { data: [], error: null };
          }
          console.warn('Error querying reports:', result.error);
          return { data: [], error: null };
        }
        return result;
      })
    ]);

    const totalPending = (pendingComments.data?.length || 0) + 
                        (pendingReports.data?.length || 0);

    return { 
      count: totalPending, 
      details: {
        posts: 0, // Posts don't have pending status
        comments: pendingComments.data?.length || 0,
        reports: pendingReports.data?.length || 0
      },
      error: null 
    };
  } catch (error) {
    console.debug('Error checking pending operations:', error);
    return { count: 0, details: { posts: 0, comments: 0, reports: 0 }, error };
  }
};

// ==================== TRIAL AND SUBSCRIPTION FUNCTIONS ====================

// Iniciar trial
export const startTrial = async (userId: string, plan: 'pro' | 'premium') => {
  try {
    const { getTrialDays } = await import('../utils/pricingUtils');
    const trialDays = getTrialDays(plan);
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);
    
    const currentPeriodStart = new Date();
    
    const subscriptionData = {
      user_id: userId,
      plan,
      status: 'trialing' as const,
      trial_ends_at: trialEndsAt.toISOString(),
      billing_cycle: 'monthly' as const,
      current_period_start: currentPeriodStart.toISOString(),
      current_period_end: trialEndsAt.toISOString(),
    };
    
    // 1. Criar/atualizar subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();
    
    if (error) {
      console.error('[startTrial] Erro ao criar subscription:', error);
      return { data: null, error };
    }
    
    // 2. Atualizar profile para ativar o plano premium
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ plan: plan })
      .eq('id', userId);
    
    if (profileError) {
      console.error('[startTrial] Erro ao atualizar profile:', profileError);
      // Reverter subscription se falhar ao atualizar profile
      await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', userId);
      
      return { 
        data: null, 
        error: { 
          message: 'Erro ao ativar plano premium. Tente novamente.',
          code: profileError.code
        } 
      };
    }
    
    console.log(`[startTrial] Trial iniciado com sucesso para usuário ${userId} no plano ${plan}`);
    return { data, error: null };
  } catch (err: any) {
    console.error('[startTrial] Erro inesperado:', err);
    return { 
      data: null, 
      error: { 
        message: err?.message || 'Erro ao iniciar período de teste.',
        code: err?.code
      } 
    };
  }
};

// Verificar se usuário já usou trial
export const hasUsedTrial = async (userId: string, plan: 'pro' | 'premium') => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id, trial_ends_at, plan')
      .eq('user_id', userId)
      .not('trial_ends_at', 'is', null);
    
    if (error) {
      // Se tabela não existe ou não tem permissão
      if (error.code === 'PGRST204' || error.code === '42P01' || error.code === '42501') {
        return { hasUsed: false, error };
      }
      // Se não encontrou registros, não usou trial
      if (error.code === 'PGRST116') {
        return { hasUsed: false, error: null };
      }
      return { hasUsed: false, error };
    }
    
    // Verificar se algum dos registros é do plano solicitado
    const hasUsedForPlan = data && data.some(sub => sub.plan === plan && sub.trial_ends_at);
    
    return { hasUsed: hasUsedForPlan, error: null };
  } catch (err: any) {
    console.error('[hasUsedTrial] Erro inesperado:', err);
    return { 
      hasUsed: false, 
      error: { 
        message: err?.message || 'Erro ao verificar trial',
        code: err?.code
      } 
    };
  }
};

// Criar Stripe Checkout Session (preparação)
export const createStripeCheckoutSession = async (params: {
  userId: string;
  plan: 'basic' | 'pro' | 'premium';
  billingCycle: 'monthly' | 'annually';
  successUrl: string;
  cancelUrl: string;
  trialDays?: number;
}) => {
  return supabase.functions.invoke('create-checkout-session', {
    body: params,
  });
};

// Criar Stripe Portal Session (gerenciar assinatura)
export const createStripePortalSession = async (userId: string, returnUrl: string) => {
  return supabase.functions.invoke('create-portal-session', {
    body: { userId, returnUrl },
  });
};

// --- Trial Coupons API ---

// Validar cupom de trial
export const validateTrialCoupon = async (code: string, userId: string) => {
  return supabase.functions.invoke('validate-trial-coupon', {
    body: { code, userId },
  });
};

// Registrar uso de cupom
export const recordCouponUsage = async (params: {
  couponId: string;
  userId: string;
  planActivated: string;
  trialDaysGranted: number;
  stripeSessionId?: string;
}) => {
  const { data, error } = await supabase
    .from('trial_coupon_usage')
    .insert({
      coupon_id: params.couponId,
      user_id: params.userId,
      plan_activated: params.planActivated,
      trial_days_granted: params.trialDaysGranted,
      stripe_session_id: params.stripeSessionId,
    });

  // Incrementar contador de uso
  if (!error) {
    await supabase.rpc('increment_coupon_usage', { coupon_id_param: params.couponId });
  }

  return { data, error };
};

// Salvar assinatura de Web Push
export const savePushSubscription = async (userId: string, subscription: any) => {
  return supabase.from('push_subscriptions').upsert({ user_id: userId, subscription });
};

// ============================================
// GAMIFICATION API
// ============================================

// Buscar dados de gamificação do usuário
export const fetchUserGamification = async (userId: string) => {
  return supabase
    .from('user_gamification')
    .select('*')
    .eq('user_id', userId)
    .single();
};

// Adicionar XP ao usuário
export const addXPToUser = async (params: {
  userId: string;
  xpAmount: number;
  sourceType: string;
  sourceId?: string;
  description?: string;
}) => {
  return supabase.rpc('add_xp_to_user', {
    p_user_id: params.userId,
    p_xp_amount: params.xpAmount,
    p_source_type: params.sourceType,
    p_source_id: params.sourceId,
    p_description: params.description,
  });
};

// Desbloquear conquista
export const unlockAchievement = async (userId: string, achievementCode: string) => {
  return supabase.rpc('unlock_achievement', {
    p_user_id: userId,
    p_achievement_code: achievementCode,
  });
};

// Buscar conquistas do usuário
export const fetchUserAchievements = async (userId: string) => {
  return supabase
    .from('user_achievements')
    .select(`
      *,
      achievement:achievements(*)
    `)
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });
};

// Buscar todas as conquistas
export const fetchAllAchievements = async () => {
  return supabase
    .from('achievements')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true });
};

// Buscar missões ativas
export const fetchActiveMissions = async () => {
  return supabase
    .from('missions')
    .select('*')
    .eq('is_active', true)
    .order('mission_type', { ascending: true });
};

// Buscar progresso de missões do usuário
export const fetchUserMissionProgress = async (userId: string) => {
  const today = new Date().toISOString().split('T')[0];
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toISOString().split('T')[0];

  return supabase
    .from('user_mission_progress')
    .select(`
      *,
      mission:missions(*)
    `)
    .eq('user_id', userId)
    .gte('reset_date', weekStartStr)
    .order('created_at', { ascending: false });
};

// Atualizar progresso de missão
export const updateMissionProgress = async (userId: string, missionId: string, increment: number = 1) => {
  return supabase.rpc('update_mission_progress', {
    p_user_id: userId,
    p_mission_id: missionId,
    p_increment: increment,
  });
};

// Buscar histórico de XP
export const fetchXPHistory = async (userId: string, limit: number = 50) => {
  return supabase
    .from('xp_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
};

// Buscar ranking de usuários por XP
export const fetchXPLeaderboard = async (limit: number = 100) => {
  return supabase
    .from('user_gamification')
    .select(`
      *,
      profile:profiles(id, username, avatar_url, plan)
    `)
    .order('total_xp', { ascending: false })
    .limit(limit);
};

// Processar ação de gamificação (via Edge Function)
export const processGamificationAction = async (params: {
  userId: string;
  actionType: 'post_created' | 'like_received' | 'comment_made' | 'comment_received' | 'login' | 'profile_completed';
  metadata?: Record<string, any>;
}) => {
  return supabase.functions.invoke('process-gamification-action', {
    body: params,
  });
};

// ============================================
// ANALYTICS API
// ============================================

// Registrar evento de conversão
export const trackConversionEvent = async (params: {
  userId: string;
  eventType: string;
  eventData?: Record<string, any>;
}) => {
  return supabase.from('conversion_events').insert({
    user_id: params.userId,
    event_type: params.eventType,
    event_data: params.eventData,
  });
};

// Buscar métricas de conversão (admin)
export const fetchConversionMetrics = async (startDate: string, endDate: string) => {
  return supabase
    .from('conversion_metrics')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });
};

// Buscar eventos de conversão (admin)
export const fetchConversionEvents = async (limit: number = 100) => {
  return supabase
    .from('conversion_events')
    .select(`
      *,
      profile:profiles(id, username, plan)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);
};

// Enviar push (admin/teste)
// Enviar push: para produção, utilize um servidor externo com web-push
export const sendPush = async (_userId: string, _payload: { title: string; body: string; icon?: string; url?: string; tag?: string }) => {
  return { data: null, error: { message: 'Configure o envio de push via servidor externo (web-push).' } } as any;
};

// Salvar token de dispositivo (Capacitor/FCM/APNs)
export const saveDeviceToken = async (userId: string, token: string, platform: 'android' | 'ios') => {
  return supabase.from('device_tokens').upsert({ user_id: userId, token, platform });
};

// --- Ads API ---

/**
 * Busca anúncios ativos
 * Retorna apenas anúncios com status 'active', approval_status 'approved' e dentro do período de validade
 */
export const fetchActiveAds = () => {
  const now = new Date().toISOString();
  
  return supabase
    .from('anuncios')
    .select('*')
    .eq('status', 'active')
    .eq('approval_status', 'approved')
    .eq('payment_status', 'paid')
    .lte('start_date', now)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order('created_at', { ascending: false });
};

/**
 * Busca um anúncio específico por ID
 */
export const fetchAdById = (adId: string) => {
  return supabase
    .from('anuncios')
    .select('*')
    .eq('id', adId)
    .single();
};

/**
 * Rastreia métrica de anúncio (impressão, clique, like, share, save)
 */
export const trackAdMetric = async (params: {
  adId: string;
  userId: string;
  eventType: 'impression' | 'click' | 'like' | 'share' | 'save';
  userPlan: string;
  feedType: 'main' | 'community';
  communityId?: string;
}) => {
  return await supabase.from('ad_metrics').insert({
    ad_id: params.adId,
    user_id: params.userId,
    event_type: params.eventType,
    user_plan: params.userPlan,
    feed_type: params.feedType,
    community_id: params.communityId || null,
  });
};

/**
 * Busca métricas de um anúncio específico
 */
export const fetchAdMetrics = (adId: string) => {
  return supabase
    .from('ad_metrics')
    .select('*')
    .eq('ad_id', adId)
    .order('created_at', { ascending: false });
};

// --- Ad Interactions API ---

/**
 * Toggle like em anúncio (igual a post_likes)
 */
export const toggleAdLike = async (adId: string, userId: string, isCurrentlyLiked: boolean) => {
  if (isCurrentlyLiked) {
    return await supabase.from('ad_likes').delete().match({ ad_id: adId, user_id: userId });
  } else {
    return await supabase.from('ad_likes').insert({ ad_id: adId, user_id: userId });
  }
};

/**
 * Busca IDs de anúncios curtidos pelo usuário
 */
export const fetchLikedAdIds = async (userId: string) => {
  return await supabase.from('ad_likes').select('ad_id').eq('user_id', userId);
};

/**
 * Toggle save em anúncio (igual a saved_posts)
 */
export const toggleSaveAd = async (adId: string, userId: string, isCurrentlySaved: boolean) => {
  if (isCurrentlySaved) {
    return await supabase.from('saved_ads').delete().match({ ad_id: adId, user_id: userId });
  } else {
    return await supabase.from('saved_ads').insert({ ad_id: adId, user_id: userId });
  }
};

/**
 * Busca IDs de anúncios salvos pelo usuário
 */
export const fetchSavedAdIds = async (userId: string) => {
  return await supabase.from('saved_ads').select('ad_id').eq('user_id', userId);
};

/**
 * Ocultar anúncio (persiste no banco)
 */
export const hideAd = async (adId: string, userId: string) => {
  return await supabase.from('hidden_ads').insert({ ad_id: adId, user_id: userId });
};

/**
 * Busca IDs de anúncios ocultos pelo usuário
 */
export const fetchHiddenAdIds = async (userId: string) => {
  return await supabase.from('hidden_ads').select('ad_id').eq('user_id', userId);
};

/**
 * Incrementar contador de shares (atualiza diretamente na tabela ads)
 */
export const incrementAdShares = async (adId: string) => {
  return await supabase.rpc('increment_ad_shares', { ad_uuid: adId });
};

/**
 * Incrementar contador de visualizações (atualiza diretamente na tabela ads)
 */
export const incrementAdViews = async (adId: string) => {
  return await supabase.rpc('increment_ad_views', { ad_uuid: adId });
};

/**
 * Criar comentário em anúncio
 */
export const createAdComment = async (params: { ad_id: string; user_id: string; content: string; image_url?: string; parent_comment_id?: string }) => {
  return await supabase.from('ad_comments').insert(params).select().single();
};

/**
 * Buscar comentários de um anúncio
 */
export const fetchAdComments = async (adId: string) => {
  // Buscar comentários
  const { data: comments, error: commentsError } = await supabase
    .from('ad_comments')
    .select('*')
    .eq('ad_id', adId)
    .order('created_at', { ascending: false });

  if (commentsError) {
    return { data: null, error: commentsError };
  }

  if (!comments || comments.length === 0) {
    return { data: [], error: null };
  }

  // Buscar dados dos usuários separadamente
  const userIds = [...new Set(comments.map(c => c.user_id))];
  
  // Buscar perfis usando a estrutura correta da tabela profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, first_name, last_name, avatar_url')
    .in('id', userIds);

  if (profilesError) {
    return { data: null, error: profilesError };
  }

  // Combinar comentários com dados dos usuários
  const allComments = comments.map(comment => {
    const profile = profiles?.find(p => p.id === comment.user_id);
    return {
      ...comment,
      user: profile ? {
        id: profile.id,
        username: profile.username,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username,
        avatar_url: profile.avatar_url
      } : null,
      replies: [] as any[]
    };
  });

  // Organizar comentários em estrutura de árvore
  const commentMap = new Map(allComments.map(c => [c.id, c]));
  const rootComments: any[] = [];

  allComments.forEach(comment => {
    if (comment.parent_comment_id) {
      const parent = commentMap.get(comment.parent_comment_id);
      if (parent) {
        parent.replies.push(comment);
      }
    } else {
      rootComments.push(comment);
    }
  });

  return { data: rootComments, error: null };
};

/**
 * Busca estatísticas agregadas de um anúncio
 */
export const fetchAdStats = async (adId: string) => {
  const { data, error } = await supabase
    .from('ad_metrics')
    .select('event_type')
    .eq('ad_id', adId);

  if (error) return { data: null, error };

  // Agregar estatísticas
  const stats = {
    impressions: 0,
    clicks: 0,
    likes: 0,
    shares: 0,
    saves: 0,
    ctr: 0, // Click-through rate
  };

  data?.forEach((metric: { event_type: string }) => {
    switch (metric.event_type) {
      case 'impression':
        stats.impressions++;
        break;
      case 'click':
        stats.clicks++;
        break;
      case 'like':
        stats.likes++;
        break;
      case 'share':
        stats.shares++;
        break;
      case 'save':
        stats.saves++;
        break;
    }
  });

  // Calcular CTR (Click-Through Rate)
  if (stats.impressions > 0) {
    stats.ctr = (stats.clicks / stats.impressions) * 100;
  }

  return { data: stats, error: null };
};

/**
 * Curtir/descurtir comentário de anúncio
 */
export const toggleAdCommentLike = async (commentId: string, userId: string): Promise<{ success: boolean; isLiked: boolean }> => {
  const { data: existingLike, error: fetchError } = await supabase
    .from('ad_comment_likes')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .maybeSingle();

  if (fetchError) {
    return { success: false, isLiked: false };
  }

  if (existingLike) {
    const { error: deleteError } = await supabase
      .from('ad_comment_likes')
      .delete()
      .eq('id', existingLike.id);

    if (deleteError) {
      return { success: false, isLiked: true };
    }

    return { success: true, isLiked: false };
  } else {
    const { error: insertError } = await supabase
      .from('ad_comment_likes')
      .insert({ comment_id: commentId, user_id: userId });

    if (insertError) {
      return { success: false, isLiked: false };
    }

    return { success: true, isLiked: true };
  }
};

/**
 * Buscar IDs de comentários de anúncios curtidos pelo usuário
 */
export const fetchLikedAdCommentIds = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('ad_comment_likes')
    .select('comment_id')
    .eq('user_id', userId);

  if (error || !data) return [];
  return data.map((like: { comment_id: string }) => like.comment_id);
};

/**
 * Salvar/dessalvar comentário de anúncio
 */
export const toggleSaveAdComment = async (commentId: string, userId: string): Promise<{ success: boolean; isSaved: boolean }> => {
  const { data: existingSave, error: fetchError } = await supabase
    .from('saved_ad_comments')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .maybeSingle();

  if (fetchError) {
    return { success: false, isSaved: false };
  }

  if (existingSave) {
    const { error: deleteError } = await supabase
      .from('saved_ad_comments')
      .delete()
      .eq('id', existingSave.id);

    if (deleteError) {
      return { success: false, isSaved: true };
    }

    return { success: true, isSaved: false };
  } else {
    const { error: insertError } = await supabase
      .from('saved_ad_comments')
      .insert({ comment_id: commentId, user_id: userId });

    if (insertError) {
      return { success: false, isSaved: false };
    }

    return { success: true, isSaved: true };
  }
};

/**
 * Buscar IDs de comentários de anúncios salvos pelo usuário
 */
export const fetchSavedAdCommentIds = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('saved_ad_comments')
    .select('comment_id')
    .eq('user_id', userId);

  if (error || !data) return [];
  return data.map((save: { comment_id: string }) => save.comment_id);
};

/**
 * Incrementar visualizações de comentário de anúncio
 */
export const incrementAdCommentViews = async (commentId: string): Promise<boolean> => {
  const { error } = await supabase.rpc('increment_ad_comment_views', {
    comment_id_param: commentId
  });

  return !error;
};

/**
 * Atualizar texto de comentário de anúncio
 */
export const updateAdComment = async (commentId: string, newText: string): Promise<boolean> => {
  const { error } = await supabase.rpc('update_ad_comment_text', {
    comment_id_param: commentId,
    new_text: newText
  });

  return !error;
};

/**
 * Deletar comentário de anúncio
 */
export const deleteAdComment = async (commentId: string): Promise<boolean> => {
  const { error } = await supabase.rpc('delete_ad_comment', {
    comment_id_param: commentId
  });

  return !error;
};

/**
 * Atualizar preferência de exibição do botão de suporte
 */
export const updateShowSupportButton = async (userId: string, showButton: boolean): Promise<{ success: boolean; error?: any }> => {
  const { error } = await supabase
    .from('profiles')
    .update({ show_support_button: showButton })
    .eq('id', userId);

  if (error) {
    handleApiError(error, 'updateShowSupportButton', { userId, showButton });
    return { success: false, error };
  }

  return { success: true };
};

/**
 * Buscar preferência de exibição do botão de suporte
 */
export const fetchShowSupportButton = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('show_support_button')
    .eq('id', userId)
    .single();

  if (error || !data) {
    // Se houver erro ou não encontrar, retornar true (mostrar por padrão)
    return true;
  }

  // Se o campo for null (novo usuário), mostrar por padrão
  return data.show_support_button !== false;
};

/**
 * =====================================================
 * FUNÇÕES DE MÉTRICAS DE ANÚNCIOS
 * =====================================================
 */

/**
 * Buscar métricas agregadas de anúncios do usuário
 */
export const fetchUserAdMetrics = async (userId: string, daysInterval: number = 7): Promise<{
  total_impressions: number;
  total_clicks: number;
  total_likes: number;
  total_shares: number;
  total_saves: number;
  total_engagement: number;
  ctr: number;
  engagement_rate: number;
}> => {
  const { data, error } = await supabase.rpc('get_user_ad_metrics', {
    p_user_id: userId,
    p_days_interval: daysInterval
  });

  if (error) {
    handleApiError(error, 'fetchUserAdMetrics', { userId, daysInterval });
    // Retornar valores zerados em caso de erro
    return {
      total_impressions: 0,
      total_clicks: 0,
      total_likes: 0,
      total_shares: 0,
      total_saves: 0,
      total_engagement: 0,
      ctr: 0,
      engagement_rate: 0
    };
  }

  return data || {
    total_impressions: 0,
    total_clicks: 0,
    total_likes: 0,
    total_shares: 0,
    total_saves: 0,
    total_engagement: 0,
    ctr: 0,
    engagement_rate: 0
  };
};

/**
 * Buscar métricas diárias para gráficos
 */
export const fetchDailyAdMetrics = async (userId: string, daysInterval: number = 7): Promise<Array<{
  date: string;
  impressions: number;
  clicks: number;
  engagement: number;
}>> => {
  const { data, error } = await supabase.rpc('get_daily_ad_metrics', {
    p_user_id: userId,
    p_days_interval: daysInterval
  });

  if (error) {
    handleApiError(error, 'fetchDailyAdMetrics', { userId, daysInterval });
    return [];
  }

  // Formatar datas para exibição
  return (data || []).map((item: any) => ({
    date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    impressions: Number(item.impressions) || 0,
    clicks: Number(item.clicks) || 0,
    engagement: Number(item.engagement) || 0
  }));
};

/**
 * Buscar performance individual de cada anúncio
 */
export const fetchAdsPerformance = async (userId: string, daysInterval: number = 7): Promise<Array<{
  id: string;
  title: string;
  impressions: number;
  clicks: number;
  engagement: number;
  ctr: number;
  cost: number;
  cpc: number;
}>> => {
  const { data, error } = await supabase.rpc('get_ads_performance', {
    p_user_id: userId,
    p_days_interval: daysInterval
  });

  if (error) {
    handleApiError(error, 'fetchAdsPerformance', { userId, daysInterval });
    return [];
  }

  return (data || []).map((item: any) => ({
    id: item.ad_id,
    title: item.ad_title || 'Sem título',
    impressions: Number(item.impressions) || 0,
    clicks: Number(item.clicks) || 0,
    engagement: Number(item.engagement) || 0,
    ctr: Number(item.ctr) || 0,
    cost: Number(item.cost) || 0,
    cpc: Number(item.cpc) || 0
  }));
};
/**
 * Processar reembolso de an�ncio rejeitado
 */
export const processAdRefund = async (adId: string, userId: string) => {
  const { data, error } = await supabase.functions.invoke('process-ad-refund', {
    body: { adId, userId }
  });

  if (error) throw error;
  return data;
};
/**
 * Buscar detalhes completos de um anúncio específico
 */
export const fetchAdDetails = async (adId: string): Promise<{
  ad_id: string;
  ad_title: string;
  ad_description: string;
  ad_image_url: string | null;
  ad_video_url: string | null;
  ad_link_url: string;
  ad_status: string;
  ad_type: string;
  ad_start_date: string;
  ad_end_date: string | null;
  ad_budget: number;
  total_impressions: number;
  total_clicks: number;
  total_likes: number;
  total_shares: number;
  total_saves: number;
  total_comments: number;
  total_engagement: number;
  ctr: number;
  engagement_rate: number;
  cost: number;
  cpc: number;
} | null> => {
  const { data, error } = await supabase.rpc('get_ad_details', {
    p_ad_id: adId
  });

  if (error) {
    handleApiError(error, 'fetchAdDetails', { adId });
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  const item = data[0];
  return {
    ad_id: item.ad_id,
    ad_title: item.ad_title || 'Sem título',
    ad_description: item.ad_description || '',
    ad_image_url: item.ad_image_url,
    ad_video_url: item.ad_video_url,
    ad_link_url: item.ad_link_url || '',
    ad_status: item.ad_status || 'active',
    ad_type: item.ad_type || 'native',
    ad_start_date: item.ad_start_date,
    ad_end_date: item.ad_end_date,
    ad_budget: Number(item.ad_budget) || 0,
    total_impressions: Number(item.total_impressions) || 0,
    total_clicks: Number(item.total_clicks) || 0,
    total_likes: Number(item.total_likes) || 0,
    total_shares: Number(item.total_shares) || 0,
    total_saves: Number(item.total_saves) || 0,
    total_comments: Number(item.total_comments) || 0,
    total_engagement: Number(item.total_engagement) || 0,
    ctr: Number(item.ctr) || 0,
    engagement_rate: Number(item.engagement_rate) || 0,
    cost: Number(item.cost) || 0,
    cpc: Number(item.cpc) || 0
  };
};

/**
 * Buscar métricas diárias de um anúncio específico
 */
export const fetchAdDailyMetrics = async (adId: string, daysInterval: number = 30): Promise<Array<{
  date: string;
  impressions: number;
  clicks: number;
  engagement: number;
}>> => {
  const { data, error } = await supabase.rpc('get_ad_daily_metrics', {
    p_ad_id: adId,
    p_days_interval: daysInterval
  });

  if (error) {
    handleApiError(error, 'fetchAdDailyMetrics', { adId, daysInterval });
    return [];
  }

  return (data || []).map((item: any) => ({
    date: item.date,
    impressions: Number(item.impressions) || 0,
    clicks: Number(item.clicks) || 0,
    engagement: Number(item.engagement) || 0
  }));
};

// ============================================
// TIMELINE MODERATION - NOVAS FUNÇÕES
// NÃO MODIFICAM AS FUNÇÕES EXISTENTES
// ============================================

// Submeter evento para moderação (usuários comuns)
export const submitTimelineEventForModeration = async (eventData: {
  title: string;
  year: number;
  category: 'politics' | 'science' | 'health' | 'religion' | 'technology' | 'society';
  description?: string;
  country?: string;
  source_1?: string;
  source_2?: string;
  event_date?: string;
  image_url?: string;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Usuário não autenticado') };

  // 1. Inserir evento na fila
  const result = await supabase
    .from('timeline_moderation_queue')
    .insert({
      ...eventData,
      author_id: user.id,
      status: 'pending'
    })
    .select()
    .single();

  if (result.error) return result;

  // 2. Notificar todos os moderadores
  try {
    const { data: moderators } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['admin', 'moderator']);

    if (moderators && moderators.length > 0) {
      const notifications = moderators.map(mod => ({
        recipient_id: mod.id,
        actor_id: user.id,
        type: 'timeline_moderation_pending',
        post_id: null, // NULL para notificações de timeline (não é um post)
        metadata: { 
          queue_item_id: result.data.id,
          event_title: eventData.title,
          event_year: eventData.year,
          event_category: eventData.category
        }
      }));

      await supabase.from('notifications').insert(notifications);
    }
  } catch (notificationError) {
    console.error('Erro ao notificar moderadores:', notificationError);
  }

  return result;
};

// Buscar fila de moderação de eventos da timeline
export const fetchTimelineModerationQueue = async () => {
  // Primeiro buscar os eventos
  const eventsResult = await supabase
    .from('timeline_moderation_queue')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (eventsResult.error) {
    return eventsResult;
  }

  // Depois buscar os autores separadamente
  const events = eventsResult.data || [];
  const authorIds = [...new Set(events.map(event => event.author_id))];
  
  let authorsData = [];
  if (authorIds.length > 0) {
    const authorsResult = await supabase
      .from('profiles')
      .select('*')
      .in('id', authorIds);
    
    authorsData = authorsResult.data || [];
  }

  // Combinar os dados
  const eventsWithAuthors = events.map(event => ({
    ...event,
    author: authorsData.find(author => author.id === event.author_id)
  }));

  return {
    data: eventsWithAuthors,
    error: null
  };
};

// Aprovar evento da timeline
export const approveTimelineEvent = async (queueItemId: string, moderatorId: string) => {
  // 1. Buscar item da fila
  const { data: queueItem, error: fetchError } = await supabase
    .from('timeline_moderation_queue')
    .select('*')
    .eq('id', queueItemId)
    .single();

  if (fetchError || !queueItem) {
    return { data: null, error: fetchError || new Error('Item não encontrado') };
  }

  // 2. Inserir na timeline_events
  const { data: newEvent, error: insertError } = await supabase
    .from('timeline_events')
    .insert({
      title: queueItem.title,
      year: queueItem.year,
      category: queueItem.category,
      description: queueItem.description,
      country: queueItem.country,
      source_1: queueItem.source_1,
      source_2: queueItem.source_2,
      event_date: queueItem.event_date,
      image_url: queueItem.image_url,
      x_position: 0,
      y_position: 0,
      created_by: queueItem.author_id
    })
    .select()
    .single();

  if (insertError) {
    return { data: null, error: insertError };
  }

  // 3. Atualizar status na fila
  const { error: updateError } = await supabase
    .from('timeline_moderation_queue')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: moderatorId
    })
    .eq('id', queueItemId);

  if (updateError) {
    return { data: null, error: updateError };
  }

  // 4. Criar notificação para o autor
  try {
    await supabase.from('notifications').insert({
      recipient_id: queueItem.author_id,
      actor_id: moderatorId,
      type: 'timeline_approved',
      post_id: null, // NULL para notificações de timeline (não é um post)
      metadata: {
        timeline_event_id: newEvent.id,
        event_title: queueItem.title,
        event_year: queueItem.year,
        event_category: queueItem.category
      }
    });
  } catch (notificationError) {
    console.error('Erro ao criar notificação de aprovação:', notificationError);
  }

  return { data: newEvent, error: null };
};

// Rejeitar evento da timeline
export const rejectTimelineEvent = async (
  queueItemId: string,
  moderatorId: string,
  reason?: string
) => {
  // 1. Buscar autor do item
  const { data: queueItem, error: fetchError } = await supabase
    .from('timeline_moderation_queue')
    .select('author_id')
    .eq('id', queueItemId)
    .single();

  if (fetchError || !queueItem) {
    return { error: fetchError || new Error('Item não encontrado') };
  }

  // 2. Atualizar status na fila
  const { error: updateError } = await supabase
    .from('timeline_moderation_queue')
    .update({
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: moderatorId,
      rejection_reason: reason
    })
    .eq('id', queueItemId);

  if (updateError) {
    return { error: updateError };
  }

  // 3. Criar notificação para o autor
  try {
    await supabase.from('notifications').insert({
      recipient_id: queueItem.author_id,
      actor_id: moderatorId,
      type: 'timeline_rejected',
      post_id: null, // NULL para notificações de timeline (não é um post)
      metadata: {
        queue_item_id: queueItemId,
        ...(reason && { rejection_reason: reason })
      }
    });
  } catch (notificationError) {
    console.error('Erro ao criar notificação de rejeição:', notificationError);
  }

  return { error: null };
};

// Atualizar evento na fila (para edição pelo moderador)
export const updateTimelineQueueItem = (queueItemId: string, updates: {
  title?: string;
  year?: number;
  category?: 'politics' | 'science' | 'health' | 'religion' | 'technology' | 'society';
  description?: string;
  country?: string;
  source_1?: string;
  source_2?: string;
  event_date?: string;
  image_url?: string;
}) =>
  supabase
    .from('timeline_moderation_queue')
    .update(updates)
    .eq('id', queueItemId);
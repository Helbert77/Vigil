import { supabase } from '../../integrations/supabase/client';

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
import { LibraryItem } from '../data/library';

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

// Tenta criar/configurar a tabela library_items automaticamente via RPC exec_sql
export const ensureLibraryItemsTable = async (): Promise<boolean> => {
  const migrationSQL = `
    -- Create table if not exists
    create extension if not exists pgcrypto;
    create extension if not exists "uuid-ossp";

    create table if not exists public.library_items (
      id uuid default gen_random_uuid() primary key,
      type text not null,
      title text not null,
      author text,
      description text,
      cover_url text,
      date timestamp with time zone,
      published_date date,
      category text,
      tags text[],
      read_url text,
      download_url text,
      downloads integer default 0,
      views integer default 0,
      created_at timestamp with time zone default now()
    );

    -- Enable RLS and policies
    alter table public.library_items enable row level security;

    create policy if not exists "Public read library items" on public.library_items
      for select using (true);

    create policy if not exists "Authenticated insert library items" on public.library_items
      for insert to authenticated
      with check (auth.role() = 'authenticated');

    -- Indexes
    create index if not exists idx_library_items_type on public.library_items(type);
    create index if not exists idx_library_items_date on public.library_items(date);
    create index if not exists idx_library_items_tags on public.library_items using gin(tags);
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    if (error) {
      handleApiError(error, 'ensureLibraryItemsTable', { suggestion: 'Verificar função RPC exec_sql e permissões' });
      return false;
    }
    const exists = await checkTableExists('library_items');
    return exists;
  } catch (err: any) {
    handleApiError(err, 'ensureLibraryItemsTable');
    return false;
  }
};

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
      console.log('Nenhuma sessão ativa encontrada, logout local realizado');
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
      console.log('Logout local realizado (conexão interrompida)');
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

// --- Library API ---
// Mapeia nomes camelCase do frontend para snake_case do banco
const mapLibraryItemToDb = (item: Omit<LibraryItem, 'id' | 'downloads' | 'views'>) => ({
  type: item.type,
  title: item.title,
  author: item.author,
  description: item.description,
  cover_url: item.coverUrl,
  date: item.date,
  published_date: item.publishedDate,
  category: item.category,
  tags: item.tags,
  read_url: item.readUrl,
  download_url: item.downloadUrl,
});

// Converte registro do banco para o tipo LibraryItem do frontend
const mapDbToLibraryItem = (row: any): LibraryItem => ({
  id: row.id,
  type: row.type,
  title: row.title,
  author: row.author,
  description: row.description ?? '',
  coverUrl: row.cover_url ?? '',
  date: row.date ? new Date(row.date).toISOString() : new Date().toISOString(),
  publishedDate: row.published_date ? new Date(row.published_date).toISOString() : undefined,
  category: row.category ?? undefined,
  tags: row.tags ?? [],
  readUrl: row.read_url ?? undefined,
  downloadUrl: row.download_url ?? undefined,
  downloads: row.downloads ?? 0,
  views: row.views ?? 0,
});

export const addLibraryItem = async (item: Omit<LibraryItem, 'id' | 'downloads' | 'views'>) => {
  // Verifica se tabela existe; tenta criar automaticamente se ausente
  let tableExists = await checkTableExists('library_items');
  if (!tableExists) {
    const created = await ensureLibraryItemsTable();
    tableExists = created;
  }

  const dbItem = mapLibraryItemToDb(item);
  const { data, error } = await supabase.from('library_items').insert(dbItem).select().single();
  if (error) {
    // Log detalhado e retorna erro para que UI possa fazer fallback
    handleApiError(error, 'addLibraryItem', { table_name: 'library_items' });
    return { data: null, error };
  }
  return { data: mapDbToLibraryItem(data), error: null };
};

export const getLibraryItems = async (): Promise<{ data: LibraryItem[] | null; error: any }> => {
  const { data, error } = await supabase.from('library_items').select('*');

  if (error) {
    handleApiError(error, 'getLibraryItems');
    return { data: null, error };
  }

  const mapped = data.map(mapDbToLibraryItem);
  return { data: mapped, error: null };
};

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
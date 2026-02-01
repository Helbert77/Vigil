export type UUID = string;

export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  bannerUrl?: string;
  bio?: string;
  joinDate: string;
  createdAt?: string; // Data raw do banco para cálculos (ISO string)
  followingCount: number;
  followersCount: number;
  theme?: 'light' | 'dark';
  role?: 'user' | 'moderator' | 'admin';
  // New settings fields
  notifications?: {
    likes: boolean;
    comments: boolean;
    newFollowers: boolean;
    messages: boolean;
  };
  mutedWords?: string[];
  showSensitiveContent?: boolean;
  showActivityStatus?: boolean;
  profileViewMode?: 'list' | 'grid';
  plan: 'free' | 'basic' | 'pro' | 'premium';
  subscription_status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
  trial_ends_at?: string | null;
  subscription_started_at?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  cancel_at_period_end?: boolean;
  current_period_end?: string | null;
  canceled_at?: string | null;
  // Gamification fields
  gamification?: UserGamification;
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  imageUrl?: string; // Adicionado: URL da imagem para o comentário
  timestamp: string;
  replies?: Comment[];
  parent_comment_id?: string;
  likes: number;
  liked_by_user?: boolean;
  views: number;
}

// New Poll types
export interface PollOption {
  text: string;
  votes: number;
}

export interface Poll {
  options: PollOption[];
  endDate: string; // ISO Date string
}

export interface EvidenceItem {
  id: string;
  type: 'text' | 'image' | 'link' | 'video';
  title: string;
  content: string;
}

export interface Post {
  id: string;
  user: User;
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  poll?: Poll;
  evidenceBoard?: EvidenceItem[];
  timestamp: string;
  likes: number;
  comments: Comment[];
  commentsCount: number;
  shares: number;
  communityId?: string; // Adicionado: ID da comunidade à qual o post pertence
  liked_by_user?: boolean;
  views: number;
  isPinned?: boolean; // Novo campo para posts fixados
  user_voted_option?: number | null; // Novo campo para rastrear o voto do usuário
  media_is_sensitive?: boolean; // Novo campo para conteúdo sensível
  mediaIsSensitive?: boolean;
  tags?: string[];
}

export interface Notification {
  id: string;
  actor: User; // O usuário que realizou a ação
  type: 'like' | 'comment' | 'follow' | 'comment_like' | 'mention' | 'message' | 'ad_approval_pending' | 'ad_approved' | 'ad_rejected' | 'chat_room_invitation' | 'room_access_request' | 'room_access_approved' | 'room_access_rejected' | 'timeline_approved' | 'timeline_rejected' | 'timeline_moderation_pending' | 'subscription_activated' | 'subscription_trial_started' | 'subscription_canceled' | 'subscription_upgraded' | 'subscription_downgraded' | 'subscription_payment_failed' | 'subscription_renewed';
  post_id?: string;
  is_read: boolean;
  created_at: string;
  metadata?: {
    ad_id?: string;
    ad_title?: string;
    rejection_reason?: string;
    room_id?: string;
    room_name?: string;
    request_id?: string;
    plan?: string;
    status?: string;
    next_billing_date?: number;
    next_billing_date_formatted?: string;
    active_until?: string;
    active_until_formatted?: string;
    trial_days?: number;
    can_reactivate?: boolean;
    message?: string;
    title?: string;
    [key: string]: any;
  };
}

export interface ChatMessage {
  id: string;
  senderId: string; // 'u1' for MOCK_USER, or other user's id
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  messages: ChatMessage[];
}

export interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  postsCount: number; // Novo campo
  bannerUrl: string;
  tag: string;
  rules?: string[]; // Novo campo para regras
  requiredPlan?: 'all' | 'basic+' | 'pro+' | 'premium'; // Plano mínimo requerido
  creatorId?: string; // ID do criador da comunidade
}

export interface TimelineEvent {
  id: string;
  title: string;
  title_en?: string;
  year: number;
  category: 'politics' | 'science' | 'health' | 'religion' | 'technology' | 'society';
  description?: string;
  description_en?: string;
  country?: string;
  parent_id?: string;
  x_position: number;
  y_position: number;
  children_ids?: string[];
  source_1?: string;
  source_2?: string;
  event_date?: string;
  image_url?: string;
  upvotes?: number;
  downvotes?: number;
  user_votes?: { [userId: string]: 'up' | 'down' };
}

export interface TimelineModerationQueueItem {
  id: string;
  title: string;
  year: number;
  category: 'politics' | 'science' | 'health' | 'religion' | 'technology' | 'society';
  description?: string;
  country?: string;
  source_1?: string;
  source_2?: string;
  event_date?: string;
  image_url?: string;
  author_id: string;
  author?: User; // Populated via join
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
}

export interface TrendingTopic {
  tag: string;
  post_count: number;
}

// Novo tipo para membros ativos
export interface ActiveMember {
  user_id: string;
  username: string;
  avatar_url: string;
  name: string;
  post_count: number;
  plan?: 'free' | 'basic' | 'pro' | 'premium';
}

// Tipo para itens da biblioteca
export interface LibraryItem {
  id: string;
  type: 'ebook' | 'article' | 'magazine' | 'document' | 'link';
  title: string;
  author: string;
  description?: string;
  description_en?: string;
  cover_url?: string;
  file_url?: string;
  date: string;
  published_date?: string;
  tags?: string[];
  downloads: number;
  views: number;
  created_at: string;
  created_by?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'basic' | 'pro' | 'premium';
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
  billing_cycle: 'monthly' | 'annually';
  current_period_start: string;
  current_period_end: string;
  trial_ends_at?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  promotional_price?: boolean;
  user?: {
    id: string;
    username: string;
    name?: string;
    avatar_url?: string;
  };
  created_at: string;
  updated_at: string;
}

// Tipo para anúncios
export interface Ad {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  video_url?: string;
  link_url: string;
  advertiser_id?: string; // ID do anunciante para identificar anúncios próprios
  advertiser_name: string;
  advertiser_avatar?: string;
  type: 'native' | 'adsense';
  status: 'active' | 'paused' | 'ended';
  start_date: string;
  end_date?: string;
  // Contadores reais do banco de dados
  likes_count?: number;
  shares_count?: number;
  views_count?: number;
  clicks_count?: number;
  // Campos para compatibilidade com PostCard
  likes?: number; // Alias para likes_count
  comments?: number;
  shares?: number; // Alias para shares_count
  views?: number;
  timestamp?: string;
  // Campos administrativos e financeiros
  approval_status?: 'pending_approval' | 'approved' | 'rejected';
  rejection_reason?: string;
  payment_status?: 'pending' | 'paid' | 'refunded' | 'failed';
  payment_type?: 'package' | 'cpm';
  budget?: number;
  stripe_payment_intent_id?: string;
}

export interface AdComment {
  id: string;
  ad_id: string;
  user_id: string;
  user?: {
    id: string;
    username: string;
    name?: string;
    avatar_url?: string;
  };
  content: string;
  image_url?: string;
  likes_count?: number;
  views_count?: number;
  created_at: string;
  updated_at: string;
  replies?: AdComment[];
  parent_comment_id?: string;
}

// ============================================
// GAMIFICATION TYPES
// ============================================

export interface UserGamification {
  user_id: string;
  total_xp: number;
  current_level: number;
  xp_to_next_level: number;
  daily_login_streak: number;
  last_login_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  category: 'social' | 'content' | 'engagement' | 'special';
  requirement_type: 'count' | 'streak' | 'time' | 'special';
  requirement_value?: number;
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  mission_type: 'daily' | 'weekly';
  action_type: string;
  target_count: number;
  xp_reward: number;
  is_active: boolean;
  created_at: string;
}

export interface UserMissionProgress {
  id: string;
  user_id: string;
  mission_id: string;
  current_count: number;
  completed: boolean;
  reset_date: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  mission?: Mission;
}

export interface XPHistory {
  id: string;
  user_id: string;
  xp_amount: number;
  source_type: 'post' | 'like' | 'comment' | 'login' | 'achievement' | 'mission' | 'level_up';
  source_id?: string;
  description?: string;
  created_at: string;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface ConversionEvent {
  id: string;
  user_id: string;
  event_type: 'trial_started' | 'trial_day_3' | 'trial_day_7' | 'trial_expiring_soon' | 'trial_expired' | 'converted_to_paid' | 'canceled_trial' | 'churned';
  event_data?: Record<string, any>;
  created_at: string;
}

export interface ConversionMetrics {
  id: string;
  date: string;
  plan: 'basic' | 'pro' | 'premium';
  trials_started: number;
  trials_converted: number;
  trials_expired: number;
  trials_canceled: number;
  conversion_rate: number;
  revenue: number;
  created_at: string;
  updated_at: string;
}
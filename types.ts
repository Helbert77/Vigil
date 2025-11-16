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
  type: 'like' | 'comment' | 'follow' | 'comment_like' | 'mention' | 'message';
  post_id?: string;
  is_read: boolean;
  created_at: string;
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
  year: number;
  category: 'politics' | 'science' | 'health' | 'religion' | 'technology' | 'society';
  description?: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  status: 'confirmed' | 'disputed' | 'debunked';
  country?: string;
  parent_id?: string;
  x_position: number;
  y_position: number;
  children_ids?: string[];
  source_1?: string;
  source_2?: string;
  evidence_level?: 'baixo' | 'medio' | 'alto' | 'confirmado';
  social_damage?: 'baixo' | 'medio' | 'alto' | 'critico';
  verification_priority?: 'baixa' | 'media' | 'alta' | 'urgente';
  event_date?: string;
  image_url?: string;
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
  advertiser_name: string;
  advertiser_avatar?: string;
  type: 'native' | 'adsense';
  status: 'active' | 'paused' | 'ended';
  start_date: string;
  end_date?: string;
  // Contadores reais do banco de dados
  likes_count?: number;
  shares_count?: number;
  // Campos para compatibilidade com PostCard
  likes?: number; // Alias para likes_count
  comments?: number;
  shares?: number; // Alias para shares_count
  views?: number;
  timestamp?: string;
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
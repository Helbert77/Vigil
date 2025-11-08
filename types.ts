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

export interface TheoryAnalysis {
  keyPoints: string[];
  possibleFallacies: string[];
  counterArguments: string[];
  relatedTopics: string[];
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
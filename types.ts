export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  bannerUrl?: string;
  bio?: string;
  joinDate: string;
  followingCount: number;
  followersCount: number;
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  timestamp: string;
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

export interface Post {
  id: string;
  user: User;
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  poll?: Poll;
  timestamp: string;
  likes: number;
  comments: Comment[];
  shares: number;
}

export interface Notification {
    id: string;
    user: User;
    text: string;
    timestamp: string;
    postId?: string;
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
  bannerUrl: string;
  tag: string;
}

export interface TheoryAnalysis {
  keyPoints: string[];
  possibleFallacies: string[];
  counterArguments: string[];
  relatedTopics: string[];
}
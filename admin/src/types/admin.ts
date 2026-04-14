// Admin panel TypeScript types

export interface MCQ {
  id: string;
  topic_id: string;
  question: string;
  options: string[];
  correct_option: number;
  explanation: string;
  source: string;
  year: number | null;
  paper: string | null;
  created_at: string;
}

export interface Flashcard {
  id: string;
  topic_id: string;
  front: string;
  back: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review: string | null;
  last_reviewed: string | null;
  created_at: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  published_at: string;
  linked_topics: string[];
  tags: string[];
  importance: 'high' | 'medium' | 'low';
  url: string | null;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  author_name: string;
  author_title: string | null;
  type: 'strategy' | 'question' | 'discussion' | 'resource';
  title: string;
  body: string;
  tags: string[];
  upvotes: number;
  comments: number;
  views: number;
  is_pinned: boolean;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  author_name: string;
  body: string;
  upvotes: number;
  created_at: string;
  post?: { title: string };
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  exam_stage: 'prelims' | 'mains' | 'interview';
  target_year: number;
  optional_subject: string | null;
  daily_goal_minutes: number;
  streak_days: number;
  xp: number;
  created_at: string;
  practiceStats?: {
    total_attempted: number;
    correct_answers: number;
    accuracy: number;
  } | null;
}

export interface DashboardStats {
  mcqs: number;
  flashcards: number;
  articles: number;
  users: number;
  posts: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminState {
  secret: string | null;
  isAuthenticated: boolean;
  login: (secret: string) => Promise<boolean>;
  logout: () => void;
}

export const TOPIC_OPTIONS = [
  { value: 'gs1-heritage', label: 'GS I — Heritage' },
  { value: 'gs2-constitution', label: 'GS II — Constitution' },
  { value: 'gs2-governance', label: 'GS II — Governance' },
  { value: 'gs3-economy', label: 'GS III — Economy' },
  { value: 'gs3-environment', label: 'GS III — Environment' },
  { value: 'gs3-scitech', label: 'GS III — Sci & Tech' },
  { value: 'gs4-ethics', label: 'GS IV — Ethics' },
  { value: 'csat-logic', label: 'CSAT — Logic' },
  { value: 'csat-data', label: 'CSAT — Data' },
  { value: 'csat-english', label: 'CSAT — English' },
];

// Shared TypeScript types for the UPSC Pathfinder API

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  examStage: 'prelims' | 'mains' | 'interview';
  targetYear: number;
  optionalSubject?: string;
  dailyGoalMinutes: number;
  streakDays: number;
  xp: number;
  createdAt: string;
  updatedAt: string;
}

export interface TopicProgress {
  id: string;
  userId: string;
  topicId: string;
  completedSubtopics: number;
  totalSubtopics: number;
  percentComplete: number;
  lastStudied: string;
  mcqScore?: number;
  notesReadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MCQ {
  id: string;
  topicId: string;
  question: string;
  options: string[]; // A, B, C, D
  correctOption: number;
  explanation: string;
  source: string;
  year?: number;
  paper?: string;
}

export interface MCQAnswer {
  id: string;
  userId: string;
  mcqId: string;
  selectedOption: number;
  isCorrect: boolean;
  answeredAt: string;
}

export interface Flashcard {
  id: string;
  topicId: string;
  front: string;
  back: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview?: string;
  lastReviewed?: string;
}

export interface FlashcardSRS {
  id: string;
  userId: string;
  cardId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string;
  lastReviewed: string;
}

export interface CommunityPost {
  id: string;
  userId: string;
  authorName: string;
  authorTitle?: string;
  type: 'strategy' | 'question' | 'discussion' | 'resource';
  title: string;
  body: string;
  tags: string[];
  upvotes: number;
  comments: number;
  views: number;
  createdAt: string;
  isPinned?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  authorName: string;
  body: string;
  upvotes: number;
  createdAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  linkedTopics: string[];
  tags: string[];
  importance: 'high' | 'medium' | 'low';
  url?: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'article' | 'post' | 'mcq' | 'flashcard';
  createdAt: string;
}

export interface PracticeStats {
  id: string;
  userId: string;
  totalAttempted: number;
  correctAnswers: number;
  accuracy: number;
  weakTopics: string[];
  strongTopics: string[];
  lastUpdated: string;
}

export interface StudyStreak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  totalActiveDays: number;
}

// Request/Response types
export interface AuthPayload {
  userId: string;
  email: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
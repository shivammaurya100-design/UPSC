// Core TypeScript types for UPSC Pathfinder

// ============================================================
// User & Progress
// ============================================================

export type ExamStage = 'prelims' | 'mains' | 'interview';

export interface UserProfile {
  id: string;
  name: string;
  examStage: ExamStage;
  targetYear: number;
  optionalSubject?: string;
  dailyGoalMinutes: number;
  streakDays: number;
  xp: number;
}

// ============================================================
// Syllabus Tree
// ============================================================

export type SyllabusCategory =
  | 'history'
  | 'geography'
  | 'polity'
  | 'economy'
  | 'environment'
  | 'science'
  | 'currentAffairs'
  | 'ethics'
  | 'csat'
  | 'optional';

export type GSPaper = 'GS I' | 'GS II' | 'GS III' | 'GS IV';

export interface SyllabusNode {
  id: string;
  title: string;
  category: SyllabusCategory;
  paper: GSPaper | 'CSAT' | 'Essay' | 'Optional';
  children?: SyllabusNode[];
  depth: number;
  isCompleted: boolean;
}

// ============================================================
// Topics & Content
// ============================================================

export interface Topic {
  id: string;
  title: string;
  description: string;
  category: SyllabusCategory;
  paper: GSPaper | 'CSAT' | 'Essay' | 'Optional';
  subtopics: string[];
  progress: number; // 0–100
  lastStudied?: string; // ISO date
  estimatedMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  isBookmarked: boolean;
}

export interface Note {
  id: string;
  topicId: string;
  title: string;
  content: string; // Markdown/structured text
  keyPoints: string[]; // Bulleted takeaways
  importantLinks: string[];
  tags: string[];
}

export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
  isRoot?: boolean;
}

export interface MindMap {
  topicId: string;
  root: MindMapNode;
}

// ============================================================
// Questions
// ============================================================

export interface MCQ {
  id: string;
  topicId: string;
  question: string;
  options: string[]; // A, B, C, D
  correctOption: number; // 0-based index
  explanation: string;
  source: string; // e.g., "PYQ 2023", "Practice"
  year?: number;
}

export interface PYQ extends MCQ {
  year: number;
  paper: GSPaper | 'CSAT';
  set: string; // e.g., "Set A", "Morning"
}

// ============================================================
// Flashcards
// ============================================================

export interface Flashcard {
  id: string;
  topicId: string;
  front: string; // Question / Prompt
  back: string; // Answer
  nextReview?: string; // ISO date
  easeFactor: number;
  interval: number; // days
  repetitions: number;
}

// ============================================================
// Practice & Tests
// ============================================================

export type TestStatus = 'not_started' | 'in_progress' | 'completed';

export interface SectionalTest {
  id: string;
  topicId: string;
  title: string;
  questions: MCQ[];
  durationMinutes: number;
  status: TestStatus;
}

export interface MockTest {
  id: string;
  title: string;
  paper: 'GS I' | 'GS II' | 'GS III' | 'GS IV' | 'CSAT' | 'Essay';
  questions: MCQ[];
  durationMinutes: number;
  attemptedAt?: string;
  score?: number;
  negativeMarking: boolean;
}

// ============================================================
// Current Affairs
// ============================================================

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url?: string;
  linkedTopics: string[]; // topicId[]
  tags: string[];
  importance: 'high' | 'medium' | 'low';
  isBookmarked?: boolean;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorTitle?: string;
  authorAvatar?: string;
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

// ============================================================
// Navigation Types
// ============================================================

export type RootStackParamList = {
  MainTabs: undefined;
  // Home
  Home: undefined;
  // Learn stack
  LearnHome: undefined;
  TopicList: { category: SyllabusCategory; paper: GSPaper | 'CSAT' | 'Essay' | 'Optional' };
  TopicDetail: { topic: Topic };
  SyllabusBrowser: undefined;
  DoubtAssistant: { topicId?: string };
  // Practice stack
  PracticeHome: undefined;
  MCQPractice: { topicId: string };
  MCQReview: { topicId: string };
  AnswerWriting: { topicId: string };
  EvaluationHistory: undefined;
  WeaknessFocus: undefined;
  PracticeStatsDetail: undefined;
  FlashcardDeck: undefined;
  FlashcardPractice: { topicId: string };
  // Tests stack
  TestsHome: undefined;
  SectionalTest: { testId: string };
  MockTest: { testId: string };
  // Community stack
  CommunityHome: undefined;
  PostDetail: { post: CommunityPost };
  // Current Affairs stack
  CurrentAffairsHome: undefined;
  ArticleDetail: { article: NewsArticle };
  // Profile stack
  ProfileHome: undefined;
  Settings: undefined;
};

export type TabParamList = {
  Home: undefined;
  Community: undefined;
  Profile: undefined;
};

// ============================================================
// UI Helpers
// ============================================================

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

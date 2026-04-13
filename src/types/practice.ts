// Extended types for Practice, Tests, Community, Subscription modules

import {
  SyllabusCategory,
  GSPaper,
  MCQ,
  PYQ,
  Flashcard,
  TestStatus,
} from './index';

// ============================================================
// Practice Module
// ============================================================

export type MCQFilter = 'all' | 'practice' | 'pyq';
export type MCQDifficulty = 'easy' | 'medium' | 'hard';

export interface MCQAttempt {
  id: string;
  mcqId: string;
  selectedOption: number | null;
  isCorrect: boolean;
  attemptedAt: string;
  timeSpentSeconds: number;
}

export interface PracticeSession {
  id: string;
  topicId: string;
  mode: 'practice' | 'test';
  filter: MCQFilter;
  questions: MCQ[];
  attempts: MCQAttempt[];
  startedAt: string;
  completedAt?: string;
  score?: number;
  totalTimeSeconds?: number;
}

export interface AnswerSubmission {
  id: string;
  topicId: string;
  question: string;
  answer: string; // markdown text
  wordCount: number;
  submittedAt: string;
  evaluation?: AIAnswerEvaluation;
  peerReviews?: PeerReview[];
}

export interface AIAnswerEvaluation {
  score: number; // 0–100
  relevance: number; // 0–10
  structure: number; // 0–10
  depth: number; // 0–10
  currentExamples: number; // 0–10
  overallFeedback: string;
  improvementPoints: string[];
  suggestedKeywords: string[];
}

export interface PeerReview {
  reviewerId: string;
  reviewerName: string;
  score: number;
  feedback: string;
  givenAt: string;
}

export interface PracticeStats {
  totalAttempted: number;
  correctAnswers: number;
  accuracy: number;
  streakDays: number;
  avgTimePerQuestion: number;
  weakTopics: string[];
  strongTopics: string[];
  improvementPercent: number;
}

// ============================================================
// Tests Module
// ============================================================

export type TestType = 'sectional' | 'full_length';
export type TestMode = 'practice' | 'exam';

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
  selectedOption: number | null;
  isAnswered: boolean;
  isMarked: boolean;
}

export interface TestSession {
  id: string;
  title: string;
  type: TestType;
  paper: GSPaper | 'CSAT' | 'Essay' | 'All GS';
  questions: TestQuestion[];
  durationMinutes: number;
  mode: TestMode;
  negativeMarking: boolean;
  negativeMark: number; // fraction, e.g. 0.33
  startedAt?: string;
  completedAt?: string;
  submittedAnswers: Map<string, number>;
  score?: number;
  rank?: number;
  percentile?: number;
  sectionTime: Record<string, number>;
}

export interface TestAnalytics {
  topicWiseScore: Record<string, { correct: number; total: number }>;
  difficultyWiseScore: Record<MCQDifficulty, { correct: number; total: number }>;
  timePerQuestion: number;
  accuracyTrend: number[];
  improvementAreas: string[];
  strongAreas: string[];
}

export interface TestResult {
  sessionId: string;
  title: string;
  paper: GSPaper | 'CSAT' | 'Essay';
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  score: number;
  maxScore: number;
  negativeMarks: number;
  finalScore: number;
  timeTaken: string;
  rank?: number;
  percentile?: number;
  analytics: TestAnalytics;
}

// ============================================================
// Community Module
// ============================================================

export type PostType = 'discussion' | 'doubt' | 'strategy' | 'motivation';

export interface CommunityPost {
  id: string;
  type: PostType;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  upvotes: number;
  comments: number;
  views: number;
  tags: string[];
  topicId?: string;
  paper?: GSPaper | 'CSAT';
  createdAt: string;
  isPinned: boolean;
  isAnswered?: boolean; // for doubts
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
  upvotes: number;
  isAccepted: boolean; // for doubt posts
  createdAt: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  category: SyllabusCategory;
  paper?: GSPaper | 'CSAT' | 'Essay';
  members: number;
  description: string;
  isJoined: boolean;
}

// ============================================================
// Subscription
// ============================================================

export type SubscriptionTier = 'free' | 'pro' | 'premium';

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  priceINR: number;
  priceUSD: number;
  durationDays: number;
  features: string[];
  isPopular: boolean;
}

export interface UserSubscription {
  tier: SubscriptionTier;
  startDate: string;
  expiryDate: string;
  autoRenew: boolean;
  paymentMethod?: string;
  transactionId?: string;
}

// Spaced Repetition Service using SM-2 algorithm
// Based on: SuperMemo 2 (SM-2) algorithm by Piotr Wozniak

import { Flashcard } from '../types';

// SR rating scale (1-5)
export type SRRating = 1 | 2 | 3 | 4 | 5;

export interface SRSession {
  topicId: string;
  cards: Flashcard[];
  currentIndex: number;
  results: Array<{ cardId: string; rating: SRRating; isCorrect: boolean }>;
  startedAt: string;
}

export interface DeckStats {
  total: number;
  new: number;
  learning: number;
  mastered: number;
  dueToday: number;
  avgEaseFactor: number;
}

export interface ReviewLog {
  cardId: string;
  topicId: string;
  rating: SRRating;
  isCorrect: boolean;
  easeFactor: number;
  interval: number;
  reviewedAt: string;
}

// ============================================================
// SM-2 Algorithm
// ============================================================

/**
 * SM-2 Spaced Repetition Algorithm
 *
 * Rating scale:
 * 1 - Complete blackout (reset)
 * 2 - Incorrect, remembered after hint
 * 3 - Correct with difficulty
 * 4 - Correct with hesitation
 * 5 - Perfect recall
 *
 * Parameters per card:
 * - easeFactor: How easy the card is (default 2.5, min 1.3)
 * - interval: Days until next review
 * - repetitions: Number of successful reviews
 */
export function calculateNextReview(
  card: Flashcard,
  rating: SRRating,
): { easeFactor: number; interval: number; repetitions: number } {
  let { easeFactor, interval, repetitions } = card;

  if (rating < 3) {
    // Failed — reset repetitions
    repetitions = 0;
    interval = 1;
  } else {
    // Passed
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor
  // EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
  // where q = rating
  easeFactor = easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));

  // Minimum ease factor
  if (easeFactor < 1.3) easeFactor = 1.3;

  return { easeFactor, interval, repetitions };
}

/**
 * Map rating to correctness
 */
export function isCorrect(rating: SRRating): boolean {
  return rating >= 3;
}

/**
 * Get human-readable next review date
 */
export function getNextReviewDate(interval: number): string {
  const date = new Date();
  date.setDate(date.getDate() + interval);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/**
 * Check if a card is due for review today
 */
export function isDue(card: Flashcard): boolean {
  if (!card.nextReview) return true; // New card
  return new Date(card.nextReview) <= new Date();
}

/**
 * Check if a card is a "new" card (never reviewed)
 */
export function isNew(card: Flashcard): boolean {
  return card.repetitions === 0;
}

/**
 * Check if a card is in "learning" phase (interval < 21 days)
 */
export function isLearning(card: Flashcard): boolean {
  return card.interval < 21;
}

/**
 * Check if a card is "mastered" (interval > 60 days)
 */
export function isMastered(card: Flashcard): boolean {
  return card.interval > 60;
}

// ============================================================
// Deck Statistics
// ============================================================

export function computeDeckStats(cards: Flashcard[]): DeckStats {
  let total = cards.length;
  let newCards = 0;
  let learning = 0;
  let mastered = 0;
  let dueToday = 0;
  let totalEase = 0;

  for (const card of cards) {
    if (isNew(card)) newCards++;
    else if (isLearning(card)) learning++;
    else if (isMastered(card)) mastered++;
    if (isDue(card)) dueToday++;
    totalEase += card.easeFactor;
  }

  return {
    total,
    new: newCards,
    learning,
    mastered,
    dueToday,
    avgEaseFactor: total > 0 ? Math.round((totalEase / total) * 100) / 100 : 2.5,
  };
}

// ============================================================
// Session Management
// ============================================================

export function createSession(
  topicId: string,
  cards: Flashcard[],
): SRSession {
  return {
    topicId,
    cards,
    currentIndex: 0,
    results: [],
    startedAt: new Date().toISOString(),
  };
}

/**
 * Get cards due for review in a session
 * Priority: Learning cards > New cards > Mastered due cards
 */
export function getSessionCards(cards: Flashcard[], limit = 20): Flashcard[] {
  const dueCards = cards.filter(isDue);
  const learning = dueCards.filter(isLearning).slice(0, 10);
  const newCards = dueCards.filter(isNew).slice(0, 5);
  const mastered = dueCards.filter(isMastered).slice(0, 5);

  const result = [...learning, ...newCards, ...mastered].slice(0, limit);
  return result;
}

// ============================================================
// Review Log (persisted to AsyncStorage in production)
// ============================================================

const reviewLog: ReviewLog[] = [];

export function logReview(card: Flashcard, rating: SRRating): void {
  const entry: ReviewLog = {
    cardId: card.id,
    topicId: card.topicId,
    rating,
    isCorrect: isCorrect(rating),
    easeFactor: card.easeFactor,
    interval: card.interval,
    reviewedAt: new Date().toISOString(),
  };
  reviewLog.push(entry);
}

export function getReviewLog(topicId?: string): ReviewLog[] {
  if (topicId) return reviewLog.filter((r) => r.topicId === topicId);
  return [...reviewLog];
}

// ============================================================
// Rating UI helpers
// ============================================================

export const RATING_LABELS: Record<SRRating, { label: string; emoji: string; color: string; description: string }> = {
  1: { label: 'Again', emoji: '⏪', color: '#EF4444', description: 'Complete blackout — reset' },
  2: { label: 'Hard', emoji: '😓', color: '#F59E0B', description: 'Remembered with difficulty' },
  3: { label: 'Good', emoji: '👍', color: '#6366F1', description: 'Correct after thinking' },
  4: { label: 'Easy', emoji: '💪', color: '#10B981', description: 'Recalled with ease' },
  5: { label: 'Perfect', emoji: '🏆', color: '#06B6D4', description: 'Instant recall' },
};

export function getRatingLabel(rating: SRRating): string {
  return RATING_LABELS[rating].label;
}

export function getRatingEmoji(rating: SRRating): string {
  return RATING_LABELS[rating].emoji;
}

// ============================================================
// Progress Tracking
// ============================================================

export interface ProgressSnapshot {
  date: string;
  cardsReviewed: number;
  newCards: number;
  accuracy: number;
}

export const progressHistory: ProgressSnapshot[] = [];

export function recordProgress(cardsReviewed: number, newCards: number, correct: number): void {
  const accuracy = cardsReviewed > 0 ? Math.round((correct / cardsReviewed) * 100) : 0;
  progressHistory.push({
    date: new Date().toISOString(),
    cardsReviewed,
    newCards,
    accuracy,
  });
}

export function getWeeklyProgress(): ProgressSnapshot[] {
  return progressHistory.slice(-7);
}
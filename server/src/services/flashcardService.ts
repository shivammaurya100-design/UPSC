// Flashcard service — SM-2 spaced repetition algorithm

import { v4 as uuidv4 } from 'uuid';
import { getOne, getAll, run } from '../utils/db';
import { FlashcardSRS } from '../types';

interface DBFlashcardSRS {
  id: string;
  user_id: string;
  card_id: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review: string;
  last_reviewed: string;
}

function toSRS(d: DBFlashcardSRS): FlashcardSRS {
  return {
    id: d.id,
    userId: d.user_id,
    cardId: d.card_id,
    easeFactor: d.ease_factor,
    interval: d.interval,
    repetitions: d.repetitions,
    nextReview: d.next_review,
    lastReviewed: d.last_reviewed,
  };
}

// ─── SM-2 Algorithm ────────────────────────────────────────────────
// rating: 0-5 (0=complete blackout → 5=perfect response)
// Returns { easeFactor, interval, repetitions, nextReview }

export function sm2(
  rating: number,
  prevEaseFactor: number,
  prevInterval: number,
  prevRepetitions: number
): { easeFactor: number; interval: number; repetitions: number; nextReview: Date } {
  let easeFactor = prevEaseFactor;
  let interval = prevInterval;
  let repetitions = prevRepetitions;

  if (rating < 3) {
    // Reset on failure
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(prevInterval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor: EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));

  // Minimum ease factor of 1.3
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { easeFactor, interval, repetitions, nextReview };
}

export interface ReviewInput {
  cardId: string;
  rating: number; // 0-5
}

export function reviewCard(userId: string, input: ReviewInput): FlashcardSRS {
  const existing = getOne<DBFlashcardSRS>(
    'SELECT * FROM flashcard_srs WHERE user_id = ? AND card_id = ?',
    [userId, input.cardId]
  );

  const ef = existing?.ease_factor ?? 2.5;
  const iv = existing?.interval ?? 0;
  const rep = existing?.repetitions ?? 0;

  const result = sm2(input.rating, ef, iv, rep);

  if (existing) {
    run(
      `UPDATE flashcard_srs SET ease_factor = ?, interval = ?, repetitions = ?,
       next_review = ?, last_reviewed = datetime('now') WHERE user_id = ? AND card_id = ?`,
      [result.easeFactor, result.interval, result.repetitions, result.nextReview.toISOString(), userId, input.cardId]
    );
  } else {
    run(
      `INSERT INTO flashcard_srs (id, user_id, card_id, ease_factor, interval, repetitions, next_review)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), userId, input.cardId, result.easeFactor, result.interval, result.repetitions, result.nextReview.toISOString()]
    );
  }

  return {
    id: existing?.id ?? uuidv4(),
    userId,
    cardId: input.cardId,
    easeFactor: result.easeFactor,
    interval: result.interval,
    repetitions: result.repetitions,
    nextReview: result.nextReview.toISOString(),
    lastReviewed: new Date().toISOString(),
  };
}

export function getCardsForReview(userId: string, limit = 20): string[] {
  const now = new Date().toISOString();
  const rows = getAll<{ card_id: string }>(
    `SELECT card_id FROM flashcard_srs
     WHERE user_id = ? AND next_review <= ?
     ORDER BY next_review ASC LIMIT ?`,
    [userId, now, limit]
  );

  // Also return new cards the user hasn't started yet
  const startedCards = getAll<{ card_id: string }>(
    'SELECT card_id FROM flashcard_srs WHERE user_id = ?',
    [userId]
  );
  const startedIds = new Set(startedCards.map(r => r.card_id));

  const newCards = getAll<{ id: string }>(
    `SELECT id FROM flashcards WHERE id NOT IN (${startedIds.size > 0 ? Array(startedIds.size).fill('?').join(',') : 'NULL'}) LIMIT ?`,
    [...Array.from(startedIds), limit - rows.length]
  );

  return [...rows.map(r => r.card_id), ...newCards.map(r => r.id)].slice(0, limit);
}

export function getCardSRS(userId: string, cardId: string): FlashcardSRS | null {
  const d = getOne<DBFlashcardSRS>(
    'SELECT * FROM flashcard_srs WHERE user_id = ? AND card_id = ?',
    [userId, cardId]
  );
  return d ? toSRS(d) : null;
}

export function getReviewStats(userId: string) {
  const total = getOne<{ cnt: number }>('SELECT COUNT(*) as cnt FROM flashcard_srs WHERE user_id = ?', [userId]);
  const due = getOne<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM flashcard_srs WHERE user_id = ? AND next_review <= ?',
    [userId, new Date().toISOString()]
  );
  return {
    totalCards: total?.cnt ?? 0,
    dueToday: due?.cnt ?? 0,
  };
}
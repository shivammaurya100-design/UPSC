// Flashcard service — SM-2 spaced repetition algorithm via Supabase

import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../utils/supabase';

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

// SM-2 Algorithm
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
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(prevInterval * easeFactor);
    repetitions += 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { easeFactor, interval, repetitions, nextReview };
}

export interface ReviewInput {
  cardId: string;
  rating: number;
}

export async function reviewCard(userId: string, input: ReviewInput): Promise<FlashcardSRS> {
  const { data: existing } = await supabaseAdmin
    .from('flashcard_srs').select('*')
    .eq('user_id', userId).eq('card_id', input.cardId).single();

  const ef = existing?.ease_factor ?? 2.5;
  const iv = existing?.interval ?? 0;
  const rep = existing?.repetitions ?? 0;

  const result = sm2(input.rating, ef, iv, rep);

  if (existing) {
    await supabaseAdmin.from('flashcard_srs').update({
      ease_factor: result.easeFactor,
      interval: result.interval,
      repetitions: result.repetitions,
      next_review: result.nextReview.toISOString(),
      last_reviewed: new Date().toISOString(),
    } as any).eq('user_id', userId).eq('card_id', input.cardId);
  } else {
    await supabaseAdmin.from('flashcard_srs').insert({
      id: uuidv4(),
      user_id: userId,
      card_id: input.cardId,
      ease_factor: result.easeFactor,
      interval: result.interval,
      repetitions: result.repetitions,
      next_review: result.nextReview.toISOString(),
    } as any);
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

export async function getCardsForReview(userId: string, limit = 20): Promise<string[]> {
  const now = new Date().toISOString();

  // Due cards
  const { data: dueData } = await supabaseAdmin
    .from('flashcard_srs').select('card_id')
    .eq('user_id', userId)
    .lte('next_review', now)
    .order('next_review', { ascending: true })
    .limit(limit);

  // New cards not started
  const { data: startedData } = await supabaseAdmin
    .from('flashcard_srs').select('card_id')
    .eq('user_id', userId);
  const startedIds = new Set((startedData || []).map((r: any) => r.card_id));

  const { data: newCards } = await supabaseAdmin
    .from('flashcards').select('id')
    .limit(limit - ((dueData || []).length));

  const newIds = (newCards || [])
    .filter((c: any) => !startedIds.has(c.id))
    .map((c: any) => c.id);

  return [...((dueData || []).map((r: any) => r.card_id)), ...newIds].slice(0, limit);
}

export async function getCardSRS(userId: string, cardId: string): Promise<FlashcardSRS | null> {
  const { data } = await supabaseAdmin
    .from('flashcard_srs').select('*')
    .eq('user_id', userId).eq('card_id', cardId).single();
  if (!data) return null;
  const r: any = data;
  return {
    id: r.id, userId: r.user_id, cardId: r.card_id,
    easeFactor: r.ease_factor, interval: r.interval,
    repetitions: r.repetitions, nextReview: r.next_review,
    lastReviewed: r.last_reviewed,
  };
}

export async function getReviewStats(userId: string) {
  const { count: total } = await supabaseAdmin
    .from('flashcard_srs').select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  const now = new Date().toISOString();
  const { count: due } = await supabaseAdmin
    .from('flashcard_srs').select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .lte('next_review', now);

  return { totalCards: total ?? 0, dueToday: due ?? 0 };
}

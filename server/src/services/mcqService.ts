// MCQ service — CRUD, search, answers, stats

import { v4 as uuidv4 } from 'uuid';
import { getOne, getAll, run, db } from '../utils/db';
import { MCQ, MCQAnswer } from '../types';

interface DBMCQ {
  id: string;
  topic_id: string;
  question: string;
  options: string;
  correct_option: number;
  explanation: string;
  source: string;
  year: number | null;
  paper: string | null;
}

function toMCQ(m: DBMCQ): MCQ {
  return {
    id: m.id,
    topicId: m.topic_id,
    question: m.question,
    options: JSON.parse(m.options),
    correctOption: m.correct_option,
    explanation: m.explanation,
    source: m.source,
    year: m.year ?? undefined,
    paper: m.paper ?? undefined,
  };
}

export interface AnswerInput {
  mcqId: string;
  selectedOption: number;
}

export function getMCQsByTopic(topicId: string): MCQ[] {
  return getAll<DBMCQ>('SELECT * FROM mcqs WHERE topic_id = ? ORDER BY id', [topicId]).map(toMCQ);
}

export function getMCQById(id: string): MCQ | null {
  const m = getOne<DBMCQ>('SELECT * FROM mcqs WHERE id = ?', [id]);
  return m ? toMCQ(m) : null;
}

export function searchMCQs(query: string, limit = 20): MCQ[] {
  const q = `%${query.toLowerCase()}%`;
  return getAll<DBMCQ>(
    `SELECT * FROM mcqs
     WHERE LOWER(question) LIKE ? OR LOWER(explanation) LIKE ? OR LOWER(topic_id) LIKE ?
     ORDER BY id LIMIT ?`,
    [q, q, q, limit]
  ).map(toMCQ);
}

export function getAllMCQs(limit = 100, offset = 0): MCQ[] {
  return getAll<DBMCQ>('SELECT * FROM mcqs ORDER BY topic_id, id LIMIT ? OFFSET ?', [limit, offset]).map(toMCQ);
}

export function saveAnswer(
  userId: string,
  input: AnswerInput
): { isCorrect: boolean; correctOption: number } {
  const mcq = getMCQById(input.mcqId);
  if (!mcq) throw new Error('MCQ not found');

  const isCorrect = input.selectedOption === mcq.correctOption;
  const answerId = uuidv4();

  // Upsert answer (re-answering updates the answer)
  run(
    `INSERT INTO mcq_answers (id, user_id, mcq_id, selected_option, is_correct)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id, mcq_id) DO UPDATE SET
       selected_option = excluded.selected_option,
       is_correct = excluded.is_correct,
       answered_at = datetime('now')`,
    [answerId, userId, input.mcqId, input.selectedOption, isCorrect ? 1 : 0]
  );

  return { isCorrect, correctOption: mcq.correctOption };
}

export function getUserAnswers(userId: string): Array<{ mcqId: string; selectedOption: number; isCorrect: boolean; answeredAt: string }> {
  const rows = getAll<{ mcq_id: string; selected_option: number; is_correct: number; answered_at: string }>(
    'SELECT mcq_id, selected_option, is_correct, answered_at FROM mcq_answers WHERE user_id = ?',
    [userId]
  );
  return rows.map(r => ({
    mcqId: r.mcq_id,
    selectedOption: r.selected_option,
    isCorrect: r.is_correct === 1,
    answeredAt: r.answered_at,
  }));
}

export function getUserAnswerForMCQ(userId: string, mcqId: string) {
  return getOne<{ selected_option: number; is_correct: number; answered_at: string }>(
    'SELECT selected_option, is_correct, answered_at FROM mcq_answers WHERE user_id = ? AND mcq_id = ?',
    [userId, mcqId]
  );
}

export function getPracticeStats(userId: string) {
  const stats = getOne<{
    total_attempted: number;
    correct_answers: number;
    accuracy: number;
    weak_topics: string;
    strong_topics: string;
  }>('SELECT * FROM practice_stats WHERE user_id = ?', [userId]);

  if (!stats) return null;

  return {
    totalAttempted: stats.total_attempted,
    correctAnswers: stats.correct_answers,
    accuracy: stats.accuracy,
    weakTopics: JSON.parse(stats.weak_topics || '[]'),
    strongTopics: JSON.parse(stats.strong_topics || '[]'),
  };
}

export function updatePracticeStats(userId: string, isCorrect: boolean) {
  const existing = getOne<{ total_attempted: number; correct_answers: number }>(
    'SELECT total_attempted, correct_answers FROM practice_stats WHERE user_id = ?',
    [userId]
  );

  if (!existing) return;

  const total = existing.total_attempted + 1;
  const correct = existing.correct_answers + (isCorrect ? 1 : 0);
  const accuracy = Math.round((correct / total) * 100);

  run(
    'UPDATE practice_stats SET total_attempted = ?, correct_answers = ?, accuracy = ?, last_updated = datetime(\'now\') WHERE user_id = ?',
    [total, correct, accuracy, userId]
  );
}

// Seed MCQs from practice data
export function seedMCQs(mcqs: Omit<MCQ, 'paper'>[]) {
  const insert = db.transaction((items: Omit<MCQ, 'paper'>[]) => {
    for (const mcq of items) {
      run(
        `INSERT OR IGNORE INTO mcqs (id, topic_id, question, options, correct_option, explanation, source, year)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          mcq.id,
          mcq.topicId,
          mcq.question,
          JSON.stringify(mcq.options),
          mcq.correctOption,
          mcq.explanation,
          mcq.source,
          mcq.year ?? null,
        ]
      );
    }
  });
  insert(mcqs);
}
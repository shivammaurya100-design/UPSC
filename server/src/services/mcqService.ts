// MCQ service — CRUD, search, answers, stats via Supabase

import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../utils/supabase';

export interface MCQ {
  id: string;
  topicId: string;
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
  source: string;
  year?: number;
  paper?: string;
}

function toMCQ(row: any): MCQ {
  return {
    id: row.id,
    topicId: row.topic_id,
    question: row.question,
    options: row.options as string[],
    correctOption: row.correct_option,
    explanation: row.explanation,
    source: row.source,
    year: row.year ?? undefined,
    paper: row.paper ?? undefined,
  };
}

export async function getMCQsByTopic(topicId: string): Promise<MCQ[]> {
  const { data } = await supabaseAdmin
    .from('mcqs').select('*').eq('topic_id', topicId).order('id');
  return (data || []).map(toMCQ);
}

export async function getMCQById(id: string): Promise<MCQ | null> {
  const { data } = await supabaseAdmin.from('mcqs').select('*').eq('id', id).single();
  if (!data) return null;
  return toMCQ(data);
}

export async function searchMCQs(query: string, limit = 20): Promise<MCQ[]> {
  const q = `%${query.toLowerCase()}%`;
  const { data } = await supabaseAdmin
    .from('mcqs').select('*')
    .or(`question.ilike.${q},explanation.ilike.${q},topic_id.ilike.${q}`)
    .limit(limit);
  return (data || []).map(toMCQ);
}

export async function getAllMCQs(limit = 100, offset = 0): Promise<MCQ[]> {
  const { data } = await supabaseAdmin
    .from('mcqs').select('*').range(offset, offset + limit - 1);
  return (data || []).map(toMCQ);
}

export async function saveAnswer(
  userId: string,
  input: { mcqId: string; selectedOption: number }
): Promise<{ isCorrect: boolean; correctOption: number }> {
  const mcq = await getMCQById(input.mcqId);
  if (!mcq) throw new Error('MCQ not found');

  const isCorrect = input.selectedOption === mcq.correctOption;

  await supabaseAdmin.from('mcq_answers').upsert({
    id: uuidv4(),
    user_id: userId,
    mcq_id: input.mcqId,
    selected_option: input.selectedOption,
    is_correct: isCorrect,
  } as any);

  return { isCorrect, correctOption: mcq.correctOption };
}

export async function getUserAnswers(userId: string): Promise<Array<{
  mcqId: string; selectedOption: number; isCorrect: boolean; answeredAt: string;
}>> {
  const { data } = await supabaseAdmin
    .from('mcq_answers').select('mcq_id, selected_option, is_correct, answered_at')
    .eq('user_id', userId);
  if (!data) return [];
  return data.map((r: any) => ({
    mcqId: r.mcq_id,
    selectedOption: r.selected_option,
    isCorrect: r.is_correct,
    answeredAt: r.answered_at,
  }));
}

export async function getUserAnswerForMCQ(userId: string, mcqId: string) {
  const { data } = await supabaseAdmin
    .from('mcq_answers').select('selected_option, is_correct, answered_at')
    .eq('user_id', userId).eq('mcq_id', mcqId).single();
  return data || null;
}

export async function getPracticeStats(userId: string) {
  const { data } = await supabaseAdmin
    .from('practice_stats').select('*').eq('user_id', userId).single();
  if (!data) return null;
  return {
    totalAttempted: (data as any).total_attempted,
    correctAnswers: (data as any).correct_answers,
    accuracy: (data as any).accuracy,
    weakTopics: (data as any).weak_topics || [],
    strongTopics: (data as any).strong_topics || [],
  };
}

export async function updatePracticeStats(userId: string, isCorrect: boolean) {
  const existing = await getPracticeStats(userId);
  if (!existing) return;

  const total = existing.totalAttempted + 1;
  const correct = existing.correctAnswers + (isCorrect ? 1 : 0);
  const accuracy = Math.round((correct / total) * 100);

  await supabaseAdmin.from('practice_stats').update({
    total_attempted: total,
    correct_answers: correct,
    accuracy,
    last_updated: new Date().toISOString(),
  } as any).eq('user_id', userId);
}

// UPSC Pathfinder API client
// Supports three backend modes: local Express, Vercel, or direct Supabase
// Set BACKEND_MODE at the top to switch between them.

import { createClient } from '@supabase/supabase-js';
import type { AIAnswerEvaluation } from '../types/practice';

// ─── Configuration ─────────────────────────────────────────────────
// Choose your backend:
//
//   'local'    — Express backend on localhost:3000  (development)
//   'vercel'   — Express backend on Vercel         (staging/production)
//   'supabase' — Direct Supabase connection         (production, no backend)
//
// To deploy on Vercel: vercel.com → Import project → select server/ directory

type BackendMode = 'local' | 'vercel' | 'supabase';
// ── CHANGE THIS TO SWITCH BACKEND MODE ─────────────────────────────
const BACKEND_MODE = 'local' as BackendMode;
// ───────────────────────────────────────────────────────────────────

const LOCAL_BASE_URL = 'http://localhost:3000';
const VERCEL_API_URL = 'https://upsc-pathfinder-api.vercel.app'; // ← replace with your Vercel URL

// Supabase credentials — only used when BACKEND_MODE = 'supabase'
// Get them from: https://supabase.com/dashboard/project/_/settings/api
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

// ─── Backend URL resolver ──────────────────────────────────────────

function getApiBase(): string {
  const mode: BackendMode = BACKEND_MODE;
  if (mode === 'vercel') return VERCEL_API_URL;
  if (mode === 'local')  return LOCAL_BASE_URL;
  return '';
}

const isExpressBackend = BACKEND_MODE !== 'supabase';
const IS_SUPABASE = BACKEND_MODE === 'supabase';
const API_BASE = getApiBase();

// ─── Supabase Client ────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    },
    autoRefreshToken: true,
    persistSession: true,
  },
});

// ─── Auth helpers ─────────────────────────────────────────────────

let authToken: string | null = null;
export function setAuthToken(token: string | null) { authToken = token; }

async function getAuthHeader(): Promise<Record<string, string>> {
  if (isExpressBackend) {
    return authToken ? { Authorization: `Bearer ${authToken}` } : {} as Record<string, string>;
  }
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token
    ? { Authorization: `Bearer ${data.session.access_token}` }
    : {} as Record<string, string>;
}

async function apiFetch(path: string, init?: RequestInit): Promise<any> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers as Record<string, string> || {}),
      ...headers,
    },
  });
  return res.json();
}

// ─── Auth ─────────────────────────────────────────────────────────

export async function apiRegister(email: string, password: string, name: string) {
  if (IS_SUPABASE) {
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { name } },
    });
    if (error) throw error;
    return { success: true, data: { user: data.user, session: data.session } };
  }
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

export async function apiLogin(email: string, password: string) {
  if (IS_SUPABASE) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { success: true, data: { user: data.user, session: data.session } };
  }
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiLogout() {
  if (IS_SUPABASE) await supabase.auth.signOut();
  authToken = null;
}

export async function getSession() {
  if (IS_SUPABASE) {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }
  return null;
}

// ─── MCQs ─────────────────────────────────────────────────────────

export async function apiGetMCQs(topicId?: string, limit = 50) {
  if (IS_SUPABASE) {
    let q = supabase.from('mcqs').select('*').limit(limit);
    if (topicId) q = q.eq('topic_id', topicId);
    const { data, error } = await q;
    if (error) throw error;
    return { success: true, data: data || [] };
  }
  const query = topicId ? `?topic=${topicId}&limit=${limit}` : `?limit=${limit}`;
  return apiFetch(`/mcqs${query}`);
}

export async function apiSearchMCQs(q: string) {
  if (IS_SUPABASE) {
    const { data, error } = await supabase
      .from('mcqs').select('*').ilike('question', `%${q}%`).limit(20);
    if (error) throw error;
    return { success: true, data: data || [] };
  }
  return apiFetch(`/mcqs/search?q=${encodeURIComponent(q)}`);
}

export async function apiAnswerMCQ(mcqId: string, selectedOption: number) {
  if (IS_SUPABASE) {
    return { success: true, data: { mcqId, selectedOption } };
  }
  return apiFetch('/mcqs/answer', {
    method: 'POST',
    body: JSON.stringify({ mcqId, selectedOption }),
  });
}

// ─── Flashcards ───────────────────────────────────────────────────

export async function apiGetFlashcardsForReview() {
  if (IS_SUPABASE) {
    const { data: srs } = await supabase
      .from('flashcard_srs').select('card_id, next_review')
      .lte('next_review', new Date().toISOString()).limit(20);
    if (!srs || srs.length === 0) return { success: true, data: [], dueCount: 0 };
    const { data, error } = await supabase
      .from('flashcards').select('*').in('id', srs.map((r: any) => r.card_id));
    if (error) throw error;
    return { success: true, data: data || [], dueCount: srs.length };
  }
  return apiFetch('/flashcards/review');
}

export async function apiReviewFlashcard(cardId: string, rating: number) {
  if (IS_SUPABASE) {
    const { data: existing } = await supabase
      .from('flashcard_srs').select('*').eq('card_id', cardId).single();
    const ef = existing?.ease_factor ?? 2.5;
    const iv = existing?.interval ?? 0;
    const rep = existing?.repetitions ?? 0;
    let easeFactor = ef, interval = iv, repetitions = rep;
    if (rating < 3) { repetitions = 0; interval = 1; }
    else {
      if (repetitions === 0) interval = 1;
      else if (repetitions === 1) interval = 6;
      else interval = Math.round(iv * ef);
      repetitions += 1;
    }
    easeFactor = Math.max(1.3, ef + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02)));
    const nextReview = new Date(); nextReview.setDate(nextReview.getDate() + interval);
    if (existing) {
      await supabase.from('flashcard_srs').update({
        ease_factor: easeFactor, interval, repetitions,
        next_review: nextReview.toISOString(), last_reviewed: new Date().toISOString(),
      } as any).eq('card_id', cardId);
    } else {
      const session = await getSession();
      await supabase.from('flashcard_srs').insert({
        card_id: cardId, user_id: session?.user?.id,
        ease_factor: easeFactor, interval, repetitions,
        next_review: nextReview.toISOString(),
      } as any);
    }
    return { success: true, data: { easeFactor, interval, repetitions, nextReview: nextReview.toISOString() } };
  }
  return apiFetch('/flashcards/review', {
    method: 'POST',
    body: JSON.stringify({ cardId, rating }),
  });
}

// ─── Community ────────────────────────────────────────────────────

export async function apiGetPosts(type?: string, page = 1) {
  if (IS_SUPABASE) {
    let q = supabase.from('community_posts').select('*')
      .order('created_at', { ascending: false }).limit(20);
    if (type) q = q.eq('type', type);
    const { data, error } = await q;
    if (error) throw error;
    return { success: true, data: data || [] };
  }
  const query = type ? `?type=${type}&page=${page}` : `?page=${page}`;
  return apiFetch(`/community/posts${query}`);
}

export async function apiGetComments(postId: string) {
  if (IS_SUPABASE) {
    const { data, error } = await supabase
      .from('comments').select('*').eq('post_id', postId)
      .order('upvotes', { ascending: false });
    if (error) throw error;
    return { success: true, data: data || [] };
  }
  return apiFetch(`/community/posts/${postId}/comments`);
}

export async function apiUpvotePost(postId: string) {
  if (IS_SUPABASE) {
    const { data } = await supabase.from('community_posts')
      .select('upvotes').eq('id', postId).single();
    const newCount = (data?.upvotes ?? 0) + 1;
    await supabase.from('community_posts').update({ upvotes: newCount } as any).eq('id', postId);
    return { success: true, data: { upvotes: newCount } };
  }
  return apiFetch(`/community/posts/${postId}/upvote`, { method: 'POST' });
}

// ─── Current Affairs ────────────────────────────────────────────────

export async function apiGetArticles(tag?: string, page = 1) {
  if (IS_SUPABASE) {
    let q = supabase.from('news_articles').select('*')
      .order('published_at', { ascending: false }).limit(20);
    if (tag) q = q.contains('tags', [tag]);
    const { data, error } = await q;
    if (error) throw error;
    return { success: true, data: data || [] };
  }
  const query = tag ? `?tag=${tag}&page=${page}` : `?page=${page}`;
  return apiFetch(`/ca/articles${query}`);
}

// ─── Health check ──────────────────────────────────────────────────

export async function checkBackendHealth(): Promise<boolean> {
  if (IS_SUPABASE) {
    const { error } = await supabase.from('mcqs').select('id').limit(1);
    return !error;
  }
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch { return false; }
}

// ─── AI Answer Evaluation ───────────────────────────────────────────

export async function apiEvaluateAnswer(data: {
  topicId: string; question: string; answer: string;
}): Promise<{ success: boolean; data: AIAnswerEvaluation; evaluationId?: string }> {
  return apiFetch('/ai/evaluate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiGetEvaluations(page = 1): Promise<{
  success: boolean;
  data: { id: string; topic_id: string; question: string; score: number; evaluated_at: string }[];
  total: number;
}> {
  return apiFetch(`/ai/evaluations?page=${page}`);
}

// ─── AI Doubt Assistant ─────────────────────────────────────────────

export async function apiChat(
  message: string,
  topicId?: string,
  history?: { role: 'user' | 'assistant'; content: string }[]
): Promise<{ success: boolean; reply: string; messageId: string }> {
  return apiFetch('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, topicId, history }),
  });
}

export async function apiGetChatHistory(): Promise<{
  success: boolean;
  messages: { id: string; role: 'user' | 'assistant'; content: string; timestamp: string }[];
}> {
  return { success: true, messages: [] };
}

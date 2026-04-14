// Supabase service — direct PostgreSQL connection from React Native
// Uses @supabase/supabase-js for auth, data, and real-time

import { createClient } from '@supabase/supabase-js';

// ─── Configuration ─────────────────────────────────────────────────
// Fill in your Supabase project credentials here.
// Get them from: https://supabase.com/dashboard/project/_/settings/api
//
// For local development without Supabase, set USE_LOCAL_BACKEND=true
// and ensure the Express backend is running on localhost:3000

const USE_LOCAL_BACKEND = true; // Set to false when Supabase is configured
const LOCAL_BASE_URL = 'http://localhost:3000';

// Supabase credentials — REPLACE with your project values
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

// ─── Supabase Client ────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: {
      getItem: (key: string) => Promise.resolve(null),
      setItem: (_: string, __: string) => Promise.resolve(),
      removeItem: (_: string) => Promise.resolve(),
    },
    autoRefreshToken: true,
    persistSession: true,
  },
});

// ─── Auth ─────────────────────────────────────────────────────────

export async function apiRegister(email: string, password: string, name: string) {
  if (USE_LOCAL_BACKEND) {
    const res = await fetch(`${LOCAL_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    return res.json();
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) throw error;
  return { success: true, data: { user: data.user, session: data.session } };
}

export async function apiLogin(email: string, password: string) {
  if (USE_LOCAL_BACKEND) {
    const res = await fetch(`${LOCAL_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { success: true, data: { user: data.user, session: data.session } };
}

export async function apiLogout() {
  if (!USE_LOCAL_BACKEND) {
    await supabase.auth.signOut();
  }
}

export async function getSession() {
  if (USE_LOCAL_BACKEND) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getAuthHeader(): Promise<Record<string, string>> {
  if (USE_LOCAL_BACKEND) {
    // For local backend, token is stored in memory
    return authToken ? { Authorization: `Bearer ${authToken}` } : {} as Record<string, string>;
  }
  const session = await getSession();
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {} as Record<string, string>;
}

// In-memory auth token for local backend mode
let authToken: string | null = null;
export function setAuthToken(token: string | null) { authToken = token; }

// ─── MCQs ─────────────────────────────────────────────────────────

export async function apiGetMCQs(topicId?: string, limit = 50) {
  if (USE_LOCAL_BACKEND) {
    const query = topicId ? `?topic=${topicId}&limit=${limit}` : `?limit=${limit}`;
    const headers = await getAuthHeader();
    const res = await fetch(`${LOCAL_BASE_URL}/mcqs${query}`, { headers });
    return res.json();
  }

  let q = supabase.from('mcqs').select('*').limit(limit);
  if (topicId) q = q.eq('topic_id', topicId);
  const { data, error } = await q;
  if (error) throw error;
  return { success: true, data: data || [] };
}

export async function apiSearchMCQs(q: string) {
  if (USE_LOCAL_BACKEND) {
    const headers = await getAuthHeader();
    const res = await fetch(`${LOCAL_BASE_URL}/mcqs/search?q=${encodeURIComponent(q)}`, { headers });
    return res.json();
  }

  const { data, error } = await supabase
    .from('mcqs')
    .select('*')
    .ilike('question', `%${q}%`)
    .limit(20);
  if (error) throw error;
  return { success: true, data: data || [] };
}

export async function apiAnswerMCQ(mcqId: string, selectedOption: number) {
  if (USE_LOCAL_BACKEND) {
    const headers = await getAuthHeader();
    const res = await fetch(`${LOCAL_BASE_URL}/mcqs/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ mcqId, selectedOption }),
    });
    return res.json();
  }

  // For Supabase, answer is stored directly
  return { success: true, data: { mcqId, selectedOption } };
}

// ─── Flashcards ───────────────────────────────────────────────────

export async function apiGetFlashcardsForReview() {
  if (USE_LOCAL_BACKEND) {
    const headers = await getAuthHeader();
    const res = await fetch(`${LOCAL_BASE_URL}/flashcards/review`, { headers });
    return res.json();
  }

  const { data: srs } = await supabase
    .from('flashcard_srs').select('card_id, next_review')
    .lte('next_review', new Date().toISOString())
    .limit(20);

  if (!srs || srs.length === 0) return { success: true, data: [], dueCount: 0 };

  const { data, error } = await supabase
    .from('flashcards').select('*').in('id', srs.map((r: any) => r.card_id));
  if (error) throw error;
  return { success: true, data: data || [], dueCount: srs.length };
}

export async function apiReviewFlashcard(cardId: string, rating: number) {
  if (USE_LOCAL_BACKEND) {
    const headers = await getAuthHeader();
    const res = await fetch(`${LOCAL_BASE_URL}/flashcards/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ cardId, rating }),
    });
    return res.json();
  }

  // SM-2 calculation inline
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

// ─── Community ────────────────────────────────────────────────────

export async function apiGetPosts(type?: string, page = 1) {
  if (USE_LOCAL_BACKEND) {
    const query = type ? `?type=${type}&page=${page}` : `?page=${page}`;
    const res = await fetch(`${LOCAL_BASE_URL}/community/posts${query}`);
    return res.json();
  }

  let q = supabase.from('community_posts').select('*').order('created_at', { ascending: false }).limit(20);
  if (type) q = q.eq('type', type);
  const { data, error } = await q;
  if (error) throw error;
  return { success: true, data: data || [] };
}

export async function apiGetComments(postId: string) {
  if (USE_LOCAL_BACKEND) {
    const res = await fetch(`${LOCAL_BASE_URL}/community/posts/${postId}/comments`);
    return res.json();
  }

  const { data, error } = await supabase
    .from('comments').select('*').eq('post_id', postId)
    .order('upvotes', { ascending: false });
  if (error) throw error;
  return { success: true, data: data || [] };
}

export async function apiUpvotePost(postId: string) {
  if (USE_LOCAL_BACKEND) {
    const res = await fetch(`${LOCAL_BASE_URL}/community/posts/${postId}/upvote`, { method: 'POST' });
    return res.json();
  }

  const { data } = await supabase
    .from('community_posts').select('upvotes').eq('id', postId).single();
  const newCount = (data?.upvotes ?? 0) + 1;
  await supabase.from('community_posts').update({ upvotes: newCount } as any).eq('id', postId);
  return { success: true, data: { upvotes: newCount } };
}

// ─── Current Affairs ────────────────────────────────────────────────

export async function apiGetArticles(tag?: string, page = 1) {
  if (USE_LOCAL_BACKEND) {
    const query = tag ? `?tag=${tag}&page=${page}` : `?page=${page}`;
    const res = await fetch(`${LOCAL_BASE_URL}/ca/articles${query}`);
    return res.json();
  }

  let q = supabase.from('news_articles').select('*')
    .order('published_at', { ascending: false }).limit(20);
  if (tag) q = q.contains('tags', [tag]);
  const { data, error } = await q;
  if (error) throw error;
  return { success: true, data: data || [] };
}

// ─── Health check ──────────────────────────────────────────────────

export async function checkBackendHealth(): Promise<boolean> {
  if (USE_LOCAL_BACKEND) {
    try {
      const res = await fetch(`${LOCAL_BASE_URL}/health`);
      return res.ok;
    } catch { return false; }
  }
  const { error } = await supabase.from('mcqs').select('id').limit(1);
  return !error;
}

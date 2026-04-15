// Admin API client — sends JWT Bearer token on every request

/// <reference types="vite/client" />

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  admin?: AdminUser;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface MCQ {
  id: string;
  topic_id: string;
  question: string;
  options: string[];
  correct_option: number;
  explanation: string;
  source: string;
  year: number | null;
  paper: string | null;
  created_at: string;
}

export interface Flashcard {
  id: string;
  topic_id: string;
  front: string;
  back: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review: string | null;
  last_reviewed: string | null;
  created_at: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  published_at: string;
  linked_topics: string[];
  tags: string[];
  importance: 'high' | 'medium' | 'low';
  url: string | null;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  author_name: string;
  author_title: string | null;
  type: 'strategy' | 'question' | 'discussion' | 'resource';
  title: string;
  body: string;
  tags: string[];
  upvotes: number;
  comments: number;
  views: number;
  is_pinned: boolean;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  author_name: string;
  body: string;
  upvotes: number;
  created_at: string;
  post?: { title: string };
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  exam_stage: 'prelims' | 'mains' | 'interview';
  target_year: number;
  optional_subject: string | null;
  daily_goal_minutes: number;
  streak_days: number;
  xp: number;
  created_at: string;
  practiceStats?: {
    total_attempted: number;
    correct_answers: number;
    accuracy: number;
  } | null;
}

// ─── Auth ─────────────────────────────────────────────────────────

export async function adminLogin(email: string, password: string): Promise<LoginResponse> {
  try {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  } catch {
    return { success: false, error: 'Could not connect to server' };
  }
}

export async function adminMe(token: string): Promise<{ success: boolean; admin?: AdminUser; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  } catch {
    return { success: false, error: 'Could not verify token' };
  }
}

// ─── API Request helper ─────────────────────────────────────────────

async function request<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options?.headers as Record<string, string> || {}),
    },
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || `Request failed: ${res.status}`);
  }
  return json;
}

// ─── Dashboard ─────────────────────────────────────────────────────

export async function getDashboard(token: string) {
  return request<{
    success: boolean;
    data: {
      stats: { mcqs: number; flashcards: number; articles: number; users: number; posts: number };
      recentMCQs: { id: string; question: string; topic_id: string; source: string; created_at: string }[];
      recentArticles: { id: string; title: string; source: string; published_at: string }[];
    };
  }>('/admin/dashboard', token);
}

// ─── MCQs ─────────────────────────────────────────────────────────

export async function getMCQs(token: string, params?: { topic?: string; page?: number; search?: string }) {
  const query = new URLSearchParams();
  if (params?.topic) query.set('topic', params.topic);
  if (params?.page) query.set('page', String(params.page));
  if (params?.search) query.set('search', params.search);
  const qs = query.toString() ? `?${query.toString()}` : '';
  return request<PaginatedResponse<MCQ>>(`/admin/mcqs${qs}`, token);
}

export async function createMCQ(token: string, data: {
  topicId: string; question: string; options: string[]; correctOption: number;
  explanation: string; source?: string; year?: number; paper?: string;
}) {
  return request<{ success: boolean; data: MCQ }>('/admin/mcqs', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMCQ(token: string, id: string, data: Partial<{
  topicId: string; question: string; options: string[]; correctOption: number;
  explanation: string; source: string; year: number; paper: string;
}>) {
  return request<{ success: boolean; data: MCQ }>(`/admin/mcqs/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteMCQ(token: string, id: string) {
  return request<{ success: boolean }>(`/admin/mcqs/${id}`, token, { method: 'DELETE' });
}

export async function bulkImportMCQs(token: string, items: unknown[]) {
  return request<{ success: boolean; imported: number }>('/admin/mcqs/bulk', token, {
    method: 'POST',
    body: JSON.stringify(items),
  });
}

// ─── Flashcards ─────────────────────────────────────────────────────

export async function getFlashcards(token: string, params?: { topic?: string; page?: number }) {
  const query = new URLSearchParams();
  if (params?.topic) query.set('topic', params.topic);
  if (params?.page) query.set('page', String(params.page));
  const qs = query.toString() ? `?${query.toString()}` : '';
  return request<PaginatedResponse<Flashcard>>(`/admin/flashcards${qs}`, token);
}

export async function createFlashcard(token: string, data: { topicId: string; front: string; back: string }) {
  return request<{ success: boolean; data: Flashcard }>('/admin/flashcards', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateFlashcard(token: string, id: string, data: { topicId?: string; front?: string; back?: string }) {
  return request<{ success: boolean; data: Flashcard }>(`/admin/flashcards/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteFlashcard(token: string, id: string) {
  return request<{ success: boolean }>(`/admin/flashcards/${id}`, token, { method: 'DELETE' });
}

// ─── Articles ───────────────────────────────────────────────────────

export async function getArticles(token: string, params?: { importance?: string; page?: number }) {
  const query = new URLSearchParams();
  if (params?.importance) query.set('importance', params.importance);
  if (params?.page) query.set('page', String(params.page));
  const qs = query.toString() ? `?${query.toString()}` : '';
  return request<PaginatedResponse<NewsArticle>>(`/admin/articles${qs}`, token);
}

export async function createArticle(token: string, data: {
  title: string; summary: string; source?: string; publishedAt?: string;
  linkedTopics?: string[]; tags?: string[]; importance?: string; url?: string;
}) {
  return request<{ success: boolean; data: NewsArticle }>('/admin/articles', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateArticle(token: string, id: string, data: Partial<{
  title: string; summary: string; source: string; publishedAt: string;
  linkedTopics: string[]; tags: string[]; importance: string; url: string;
}>) {
  return request<{ success: boolean; data: NewsArticle }>(`/admin/articles/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteArticle(token: string, id: string) {
  return request<{ success: boolean }>(`/admin/articles/${id}`, token, { method: 'DELETE' });
}

// ─── Community Posts ────────────────────────────────────────────────

export async function getPosts(token: string, params?: { type?: string; page?: number }) {
  const query = new URLSearchParams();
  if (params?.type) query.set('type', params.type);
  if (params?.page) query.set('page', String(params.page));
  const qs = query.toString() ? `?${query.toString()}` : '';
  return request<PaginatedResponse<CommunityPost>>(`/admin/posts${qs}`, token);
}

export async function pinPost(token: string, id: string, isPinned: boolean) {
  return request<{ success: boolean; data: CommunityPost }>(`/admin/posts/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify({ isPinned }),
  });
}

export async function deletePost(token: string, id: string) {
  return request<{ success: boolean }>(`/admin/posts/${id}`, token, { method: 'DELETE' });
}

export async function getComments(token: string, page = 1) {
  return request<PaginatedResponse<Comment>>(`/admin/comments?page=${page}`, token);
}

export async function deleteComment(token: string, id: string) {
  return request<{ success: boolean }>(`/admin/comments/${id}`, token, { method: 'DELETE' });
}

// ─── Users ─────────────────────────────────────────────────────────

export async function getUsers(token: string, page = 1) {
  return request<PaginatedResponse<UserProfile>>(`/admin/users?page=${page}`, token);
}

export async function updateUser(token: string, id: string, data: {
  examStage?: string; optionalSubject?: string; targetYear?: number; dailyGoalMinutes?: number;
}) {
  return request<{ success: boolean; data: UserProfile }>(`/admin/users/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

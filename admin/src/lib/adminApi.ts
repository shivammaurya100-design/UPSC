// Admin API client — sends X-Admin-Secret header on every request

/// <reference types="vite/client" />

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getHeaders(secret: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-Admin-Secret': secret,
  };
}

async function request<T>(
  path: string,
  secret: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...getHeaders(secret),
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

export async function getDashboard(secret: string) {
  return request<{
    success: boolean;
    data: {
      stats: { mcqs: number; flashcards: number; articles: number; users: number; posts: number };
      recentMCQs: { id: string; question: string; topic_id: string; source: string; created_at: string }[];
      recentArticles: { id: string; title: string; source: string; published_at: string }[];
    };
  }>('/admin/dashboard', secret);
}

// ─── MCQs ─────────────────────────────────────────────────────────

export async function getMCQs(secret: string, params?: { topic?: string; page?: number; search?: string }) {
  const query = new URLSearchParams();
  if (params?.topic) query.set('topic', params.topic);
  if (params?.page) query.set('page', String(params.page));
  if (params?.search) query.set('search', params.search);
  const qs = query.toString() ? `?${query.toString()}` : '';
  return request<import('../types/admin').PaginatedResponse<import('../types/admin').MCQ>>(`/admin/mcqs${qs}`, secret);
}

export async function createMCQ(secret: string, data: {
  topicId: string; question: string; options: string[]; correctOption: number;
  explanation: string; source?: string; year?: number; paper?: string;
}) {
  return request<{ success: boolean; data: import('../types/admin').MCQ }>('/admin/mcqs', secret, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMCQ(secret: string, id: string, data: Partial<{
  topicId: string; question: string; options: string[]; correctOption: number;
  explanation: string; source: string; year: number; paper: string;
}>) {
  return request<{ success: boolean; data: import('../types/admin').MCQ }>(`/admin/mcqs/${id}`, secret, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteMCQ(secret: string, id: string) {
  return request<{ success: boolean }>(`/admin/mcqs/${id}`, secret, { method: 'DELETE' });
}

export async function bulkImportMCQs(secret: string, items: any[]) {
  return request<{ success: boolean; imported: number }>('/admin/mcqs/bulk', secret, {
    method: 'POST',
    body: JSON.stringify(items),
  });
}

// ─── Flashcards ─────────────────────────────────────────────────────

export async function getFlashcards(secret: string, params?: { topic?: string; page?: number }) {
  const query = new URLSearchParams();
  if (params?.topic) query.set('topic', params.topic);
  if (params?.page) query.set('page', String(params.page));
  const qs = query.toString() ? `?${query.toString()}` : '';
  return request<import('../types/admin').PaginatedResponse<import('../types/admin').Flashcard>>(`/admin/flashcards${qs}`, secret);
}

export async function createFlashcard(secret: string, data: { topicId: string; front: string; back: string }) {
  return request<{ success: boolean; data: import('../types/admin').Flashcard }>('/admin/flashcards', secret, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateFlashcard(secret: string, id: string, data: { topicId?: string; front?: string; back?: string }) {
  return request<{ success: boolean; data: import('../types/admin').Flashcard }>(`/admin/flashcards/${id}`, secret, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteFlashcard(secret: string, id: string) {
  return request<{ success: boolean }>(`/admin/flashcards/${id}`, secret, { method: 'DELETE' });
}

// ─── Articles ───────────────────────────────────────────────────────

export async function getArticles(secret: string, params?: { importance?: string; page?: number }) {
  const query = new URLSearchParams();
  if (params?.importance) query.set('importance', params.importance);
  if (params?.page) query.set('page', String(params.page));
  const qs = query.toString() ? `?${query.toString()}` : '';
  return request<import('../types/admin').PaginatedResponse<import('../types/admin').NewsArticle>>(`/admin/articles${qs}`, secret);
}

export async function createArticle(secret: string, data: {
  title: string; summary: string; source?: string; publishedAt?: string;
  linkedTopics?: string[]; tags?: string[]; importance?: string; url?: string;
}) {
  return request<{ success: boolean; data: import('../types/admin').NewsArticle }>('/admin/articles', secret, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateArticle(secret: string, id: string, data: Partial<{
  title: string; summary: string; source: string; publishedAt: string;
  linkedTopics: string[]; tags: string[]; importance: string; url: string;
}>) {
  return request<{ success: boolean; data: import('../types/admin').NewsArticle }>(`/admin/articles/${id}`, secret, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteArticle(secret: string, id: string) {
  return request<{ success: boolean }>(`/admin/articles/${id}`, secret, { method: 'DELETE' });
}

// ─── Community Posts ────────────────────────────────────────────────

export async function getPosts(secret: string, params?: { type?: string; page?: number }) {
  const query = new URLSearchParams();
  if (params?.type) query.set('type', params.type);
  if (params?.page) query.set('page', String(params.page));
  const qs = query.toString() ? `?${query.toString()}` : '';
  return request<import('../types/admin').PaginatedResponse<import('../types/admin').CommunityPost>>(`/admin/posts${qs}`, secret);
}

export async function pinPost(secret: string, id: string, isPinned: boolean) {
  return request<{ success: boolean; data: import('../types/admin').CommunityPost }>(`/admin/posts/${id}`, secret, {
    method: 'PUT',
    body: JSON.stringify({ isPinned }),
  });
}

export async function deletePost(secret: string, id: string) {
  return request<{ success: boolean }>(`/admin/posts/${id}`, secret, { method: 'DELETE' });
}

export async function getComments(secret: string, page = 1) {
  return request<import('../types/admin').PaginatedResponse<import('../types/admin').Comment>>(
    `/admin/comments?page=${page}`, secret
  );
}

export async function deleteComment(secret: string, id: string) {
  return request<{ success: boolean }>(`/admin/comments/${id}`, secret, { method: 'DELETE' });
}

// ─── Users ─────────────────────────────────────────────────────────

export async function getUsers(secret: string, page = 1) {
  return request<import('../types/admin').PaginatedResponse<import('../types/admin').UserProfile>>(
    `/admin/users?page=${page}`, secret
  );
}

export async function updateUser(secret: string, id: string, data: {
  examStage?: string; optionalSubject?: string; targetYear?: number; dailyGoalMinutes?: number;
}) {
  return request<{ success: boolean; data: import('../types/admin').UserProfile }>(`/admin/users/${id}`, secret, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ─── Auth ─────────────────────────────────────────────────────────

export async function verifyAdminSecret(secret: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: { 'X-Admin-Secret': secret },
    });
    return res.ok;
  } catch {
    return false;
  }
}

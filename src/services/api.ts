// API client — connects React Native app to backend
// Falls back to mock data when backend is unavailable

const BASE_URL = 'http://localhost:3000';

// ─── In-memory token storage (same pattern as storageService) ──────

const memoryStore: Record<string, string> = {};

const tokenStorage = {
  async getItem(key: string): Promise<string | null> { return memoryStore[key] ?? null; },
  async setItem(key: string, value: string): Promise<void> { memoryStore[key] = value; },
  async removeItem(key: string): Promise<void> { delete memoryStore[key]; },
};

// ─── HTTP helper ───────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  body?: object,
  requiresAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth) {
    const token = await tokenStorage.getItem('auth_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── Auth API ──────────────────────────────────────────────────────

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
      examStage: string;
      targetYear: number;
      optionalSubject?: string;
      dailyGoalMinutes: number;
      streakDays: number;
      xp: number;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export async function apiRegister(email: string, password: string, name: string) {
  const res = await request<AuthResponse>('POST', '/auth/register', { email, password, name });
  if (res.success && res.data?.token) {
    await tokenStorage.setItem('auth_token', res.data.token);
    await tokenStorage.setItem('user_id', res.data.user.id);
  }
  return res;
}

export async function apiLogin(email: string, password: string) {
  const res = await request<AuthResponse>('POST', '/auth/login', { email, password });
  if (res.success && res.data?.token) {
    await tokenStorage.setItem('auth_token', res.data.token);
    await tokenStorage.setItem('user_id', res.data.user.id);
  }
  return res;
}

export async function apiLogout() {
  await tokenStorage.removeItem('auth_token');
  await tokenStorage.removeItem('user_id');
}

export async function apiGetProfile() {
  return request<{ success: boolean; data: any }>('GET', '/auth/profile', undefined, true);
}

// ─── MCQ API ───────────────────────────────────────────────────────

export async function apiGetMCQs(topicId?: string, limit = 50) {
  const query = topicId ? `?topic=${topicId}&limit=${limit}` : `?limit=${limit}`;
  return request<{ success: boolean; data: any[]; count: number }>('GET', `/mcqs${query}`);
}

export async function apiSearchMCQs(q: string) {
  return request<{ success: boolean; data: any[] }>('GET', `/mcqs/search?q=${encodeURIComponent(q)}`);
}

export async function apiAnswerMCQ(mcqId: string, selectedOption: number) {
  return request<{ success: boolean; data: { isCorrect: boolean; correctOption: number } }>(
    'POST', '/mcqs/answer', { mcqId, selectedOption }, true
  );
}

export async function apiGetMCQStats() {
  return request<{ success: boolean; data: { stats: any; answers: any[] } }>(
    'GET', '/mcqs/stats/my', undefined, true
  );
}

// ─── Flashcard API ─────────────────────────────────────────────────

export async function apiGetFlashcardsForReview() {
  return request<{ success: boolean; data: any[]; dueCount: number }>(
    'GET', '/flashcards/review', undefined, true
  );
}

export async function apiReviewFlashcard(cardId: string, rating: number) {
  return request<{ success: boolean; data: any }>(
    'POST', '/flashcards/review', { cardId, rating }, true
  );
}

// ─── Community API ─────────────────────────────────────────────────

export async function apiGetPosts(type?: string, page = 1) {
  const query = type ? `?type=${type}&page=${page}` : `?page=${page}`;
  return request<{ success: boolean; data: any[]; page: number }>('GET', `/community/posts${query}`);
}

export async function apiGetPost(id: string) {
  return request<{ success: boolean; data: any }>('GET', `/community/posts/${id}`);
}

export async function apiUpvotePost(id: string) {
  return request<{ success: boolean; data: { upvotes: number } }>(
    'POST', `/community/posts/${id}/upvote`
  );
}

export async function apiCreateComment(postId: string, body: string) {
  return request<{ success: boolean; data: any }>(
    'POST', `/community/posts/${postId}/comments`, { body }, true
  );
}

// ─── Current Affairs API ───────────────────────────────────────────

export async function apiGetArticles(tag?: string, page = 1) {
  const query = tag ? `?tag=${tag}&page=${page}` : `?page=${page}`;
  return request<{ success: boolean; data: any[]; page: number }>('GET', `/ca/articles${query}`);
}

export async function apiSearchArticles(q: string) {
  return request<{ success: boolean; data: any[] }>(
    'GET', `/ca/articles/search?q=${encodeURIComponent(q)}`
  );
}

// ─── Bookmarks API ─────────────────────────────────────────────────

export async function apiBookmark(itemId: string, itemType: 'article' | 'post' | 'mcq' | 'flashcard') {
  return request<{ success: boolean; data: any }>(
    'POST', '/ca/bookmarks', { itemId, itemType }, true
  );
}

export async function apiRemoveBookmark(itemId: string, itemType = 'article') {
  return request<{ success: boolean; message: string }>(
    'DELETE', `/ca/bookmarks/${itemId}?itemType=${itemType}`, undefined, true
  );
}

// ─── Health check ──────────────────────────────────────────────────

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}
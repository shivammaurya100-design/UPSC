// AsyncStorage persistence layer
// Handles all local storage operations for UPSC Pathfinder
// Uses in-memory store (compatible with AsyncStorage API — swap for real AsyncStorage when needed)

/** In-memory store — replace with: import AsyncStorage from '@react-native-async-storage/async-storage' */
const memoryStore: Record<string, string> = {};

const AsyncStorageMock = {
  getItem: async (key: string): Promise<string | null> => {
    return memoryStore[key] ?? null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    memoryStore[key] = value;
  },
  removeItem: async (key: string): Promise<void> => {
    delete memoryStore[key];
  },
};

const storage = AsyncStorageMock;

// ─── Storage Keys ───────────────────────────────────────────────
const KEYS = {
  USER_PROFILE: '@upf:user_profile',
  TOPIC_PROGRESS: '@upf:topic_progress',      // { topicId: { completed, lastStudied, score } }
  MCQ_ANSWERS: '@upf:mcq_answers',           // { mcqId: { selected, correct, answeredAt } }
  FLASHCARD_SESSIONS: '@upf:flashcard_sessions', // SRS data per card
  BOOKMARKS: '@upf:bookmarks',               // string[] of article/bookmark IDs
  PRACTICE_STATS: '@upf:practice_stats',     // aggregated practice stats
  STUDY_STREAK: '@upf:study_streak',         // { currentStreak, lastActiveDate, history[] }
  SETTINGS: '@upf:settings',                 // app settings
  REVIEW_LOG: '@upf:review_log',             // spaced repetition review log
} as const;

// ─── Generic helpers ────────────────────────────────────────────

async function getItem<T>(key: string): Promise<T | null> {
  try {
    const value = await storage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await storage.setItem(key, JSON.stringify(value));
  } catch {
    // Silently fail in simulator / test environments
  }
}

async function removeItem(key: string): Promise<void> {
  try {
    await storage.removeItem(key);
  } catch {
    // ignore
  }
}

// ─── User Profile ───────────────────────────────────────────────

export interface StoredUserProfile {
  id: string;
  name: string;
  targetYear: number;
  dailyGoalMinutes: number;
  createdAt: string;
}

export async function saveUserProfile(profile: StoredUserProfile): Promise<void> {
  await setItem(KEYS.USER_PROFILE, profile);
}

export async function getUserProfile(): Promise<StoredUserProfile | null> {
  return getItem<StoredUserProfile>(KEYS.USER_PROFILE);
}

// ─── Topic Progress ─────────────────────────────────────────────

export interface TopicProgress {
  topicId: string;
  completedSubtopics: number;
  totalSubtopics: number;
  percentComplete: number;
  lastStudied: string; // ISO
  mcqScore?: number;
  notesReadCount: number;
}

export async function saveTopicProgress(progress: TopicProgress): Promise<void> {
  const all = (await getItem<Record<string, TopicProgress>>(KEYS.TOPIC_PROGRESS)) ?? {};
  all[progress.topicId] = progress;
  await setItem(KEYS.TOPIC_PROGRESS, all);
}

export async function getAllTopicProgress(): Promise<Record<string, TopicProgress>> {
  return (await getItem<Record<string, TopicProgress>>(KEYS.TOPIC_PROGRESS)) ?? {};
}

export async function getTopicProgress(topicId: string): Promise<TopicProgress | null> {
  const all = await getAllTopicProgress();
  return all[topicId] ?? null;
}

// ─── MCQ Answers ────────────────────────────────────────────────

export interface StoredAnswer {
  selectedOption: number;
  isCorrect: boolean;
  answeredAt: string;
}

export async function saveMCQAnswer(mcqId: string, answer: StoredAnswer): Promise<void> {
  const all = (await getItem<Record<string, StoredAnswer>>(KEYS.MCQ_ANSWERS)) ?? {};
  all[mcqId] = answer;
  await setItem(KEYS.MCQ_ANSWERS, all);
}

export async function getMCQAnswer(mcqId: string): Promise<StoredAnswer | null> {
  const all = (await getItem<Record<string, StoredAnswer>>(KEYS.MCQ_ANSWERS)) ?? {};
  return all[mcqId] ?? null;
}

export async function getAllMCQAnswers(): Promise<Record<string, StoredAnswer>> {
  return (await getItem<Record<string, StoredAnswer>>(KEYS.MCQ_ANSWERS)) ?? {};
}

// ─── Flashcard SRS Data ─────────────────────────────────────────

export interface StoredFlashcardSRS {
  cardId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string; // ISO date
  lastReviewed: string;
}

export async function saveFlashcardSRS(data: StoredFlashcardSRS): Promise<void> {
  const all = (await getItem<Record<string, StoredFlashcardSRS>>(KEYS.FLASHCARD_SESSIONS)) ?? {};
  all[data.cardId] = data;
  await setItem(KEYS.FLASHCARD_SESSIONS, all);
}

export async function getFlashcardSRS(cardId: string): Promise<StoredFlashcardSRS | null> {
  const all = (await getItem<Record<string, StoredFlashcardSRS>>(KEYS.FLASHCARD_SESSIONS)) ?? {};
  return all[cardId] ?? null;
}

export async function getAllFlashcardSRS(): Promise<Record<string, StoredFlashcardSRS>> {
  return (await getItem<Record<string, StoredFlashcardSRS>>(KEYS.FLASHCARD_SESSIONS)) ?? {};
}

// ─── Bookmarks ─────────────────────────────────────────────────

export async function getBookmarks(): Promise<string[]> {
  return (await getItem<string[]>(KEYS.BOOKMARKS)) ?? [];
}

export async function addBookmark(id: string): Promise<void> {
  const bookmarks = await getBookmarks();
  if (!bookmarks.includes(id)) {
    await setItem(KEYS.BOOKMARKS, [...bookmarks, id]);
  }
}

export async function removeBookmark(id: string): Promise<void> {
  const bookmarks = await getBookmarks();
  await setItem(KEYS.BOOKMARKS, bookmarks.filter((b) => b !== id));
}

export async function isBookmarked(id: string): Promise<boolean> {
  return (await getBookmarks()).includes(id);
}

// ─── Study Streak ──────────────────────────────────────────────

export interface StoredStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // ISO date string YYYY-MM-DD
  totalActiveDays: number;
}

export async function getStudyStreak(): Promise<StoredStreak> {
  const defaultStreak: StoredStreak = {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    totalActiveDays: 0,
  };
  return (await getItem<StoredStreak>(KEYS.STUDY_STREAK)) ?? defaultStreak;
}

export async function updateStudyStreak(): Promise<StoredStreak> {
  const today = new Date().toISOString().split('T')[0];
  const streak = await getStudyStreak();

  if (streak.lastActiveDate === today) {
    return streak; // already active today
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (streak.lastActiveDate === yesterdayStr) {
    // Continue streak
    streak.currentStreak += 1;
  } else if (streak.lastActiveDate !== today) {
    // Streak broken
    streak.currentStreak = 1;
  }

  streak.lastActiveDate = today;
  streak.totalActiveDays += 1;
  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
  }

  await setItem(KEYS.STUDY_STREAK, streak);
  return streak;
}

// ─── Settings ─────────────────────────────────────────────────

export interface StoredSettings {
  notifications: boolean;
  dailyReminderTime: string; // "07:00"
  streakAlerts: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
  dailyGoalMinutes: number;
  defaultMCQTimer: number; // seconds
}

const DEFAULT_SETTINGS: StoredSettings = {
  notifications: true,
  dailyReminderTime: '07:00',
  streakAlerts: true,
  soundEffects: false,
  hapticFeedback: true,
  dailyGoalMinutes: 60,
  defaultMCQTimer: 40,
};

export async function getSettings(): Promise<StoredSettings> {
  return (await getItem<StoredSettings>(KEYS.SETTINGS)) ?? DEFAULT_SETTINGS;
}

export async function saveSettings(settings: StoredSettings): Promise<void> {
  await setItem(KEYS.SETTINGS, settings);
}

export async function updateSetting<K extends keyof StoredSettings>(
  key: K,
  value: StoredSettings[K],
): Promise<void> {
  const settings = await getSettings();
  settings[key] = value;
  await saveSettings(settings);
}

// ─── Practice Stats ────────────────────────────────────────────

export interface StoredPracticeStats {
  totalAttempted: number;
  correctAnswers: number;
  accuracy: number;
  weakTopics: string[];
  strongTopics: string[];
  lastUpdated: string;
}

export async function savePracticeStats(stats: StoredPracticeStats): Promise<void> {
  await setItem(KEYS.PRACTICE_STATS, { ...stats, lastUpdated: new Date().toISOString() });
}

export async function getPracticeStats(): Promise<StoredPracticeStats | null> {
  return getItem<StoredPracticeStats>(KEYS.PRACTICE_STATS);
}

export async function incrementPracticeAnswer(correct: boolean): Promise<void> {
  const stats = (await getPracticeStats()) ?? {
    totalAttempted: 0,
    correctAnswers: 0,
    accuracy: 0,
    weakTopics: [],
    strongTopics: [],
    lastUpdated: new Date().toISOString(),
  };
  stats.totalAttempted += 1;
  if (correct) stats.correctAnswers += 1;
  stats.accuracy = Math.round((stats.correctAnswers / stats.totalAttempted) * 100);
  await savePracticeStats(stats);
}

// ─── Review Log ────────────────────────────────────────────────

export interface ReviewLogEntry {
  id: string;
  cardId: string;
  rating: number;
  isCorrect: boolean;
  reviewedAt: string;
}

export async function logFlashcardReview(entry: Omit<ReviewLogEntry, 'id'>): Promise<void> {
  const log = (await getItem<ReviewLogEntry[]>(KEYS.REVIEW_LOG)) ?? [];
  log.push({ ...entry, id: `${Date.now()}-${Math.random()}` });
  await setItem(KEYS.REVIEW_LOG, log.slice(-500)); // keep last 500
}

export async function getReviewLog(): Promise<ReviewLogEntry[]> {
  return (await getItem<ReviewLogEntry[]>(KEYS.REVIEW_LOG)) ?? [];
}

// ─── Clear all data ────────────────────────────────────────────

export async function clearAllData(): Promise<void> {
  const keys = Object.values(KEYS);
  await Promise.all(keys.map((k) => removeItem(k)));
}

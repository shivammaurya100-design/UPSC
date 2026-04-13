// App-level state store using React Context + useReducer
// Provides global state for UPSC Pathfinder without external dependencies

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import {
  saveTopicProgress,
  getAllTopicProgress,
  saveMCQAnswer,
  getAllMCQAnswers,
  saveFlashcardSRS,
  getAllFlashcardSRS,
  getBookmarks,
  addBookmark,
  removeBookmark,
  getStudyStreak,
  updateStudyStreak,
  getSettings,
  updateSetting,
  getPracticeStats,
  incrementPracticeAnswer,
  StoredFlashcardSRS,
  StoredStreak,
  StoredSettings,
  StoredPracticeStats,
  TopicProgress,
  StoredAnswer,
} from './storageService';

// ─── State shape ─────────────────────────────────────────────────

export interface AppState {
  // User & auth
  isLoading: boolean;
  isInitialized: boolean;

  // Progress
  topicProgress: Record<string, TopicProgress>;
  mcqAnswers: Record<string, StoredAnswer>;

  // Flashcards
  flashcardSRS: Record<string, StoredFlashcardSRS>;

  // Bookmarks
  bookmarks: string[];

  // Streak
  streak: StoredStreak;

  // Settings
  settings: StoredSettings;

  // Practice stats
  practiceStats: StoredPracticeStats;
}

// ─── Actions ────────────────────────────────────────────────────

type AppAction =
  | { type: 'INIT_LOADED'; payload: Partial<AppState> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_TOPIC_PROGRESS'; payload: TopicProgress }
  | { type: 'SAVE_MCQ_ANSWER'; payload: { mcqId: string; answer: StoredAnswer } }
  | { type: 'UPDATE_FLASHCARD_SRS'; payload: StoredFlashcardSRS }
  | { type: 'SET_BOOKMARKS'; payload: string[] }
  | { type: 'ADD_BOOKMARK'; payload: string }
  | { type: 'REMOVE_BOOKMARK'; payload: string }
  | { type: 'UPDATE_STREAK'; payload: StoredStreak }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<StoredSettings> }
  | { type: 'UPDATE_PRACTICE_STATS'; payload: StoredPracticeStats };

// ─── Reducer ────────────────────────────────────────────────────

const DEFAULT_SETTINGS: StoredSettings = {
  notifications: true,
  dailyReminderTime: '07:00',
  streakAlerts: true,
  soundEffects: false,
  hapticFeedback: true,
  dailyGoalMinutes: 60,
  defaultMCQTimer: 40,
};

const DEFAULT_STREAK: StoredStreak = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  totalActiveDays: 0,
};

const DEFAULT_STATS: StoredPracticeStats = {
  totalAttempted: 0,
  correctAnswers: 0,
  accuracy: 0,
  weakTopics: [],
  strongTopics: [],
  lastUpdated: new Date().toISOString(),
};

const initialState: AppState = {
  isLoading: true,
  isInitialized: false,
  topicProgress: {},
  mcqAnswers: {},
  flashcardSRS: {},
  bookmarks: [],
  streak: DEFAULT_STREAK,
  settings: DEFAULT_SETTINGS,
  practiceStats: DEFAULT_STATS,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'INIT_LOADED':
      return { ...state, ...action.payload, isLoading: false, isInitialized: true };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'UPDATE_TOPIC_PROGRESS':
      return {
        ...state,
        topicProgress: {
          ...state.topicProgress,
          [action.payload.topicId]: action.payload,
        },
      };

    case 'SAVE_MCQ_ANSWER':
      return {
        ...state,
        mcqAnswers: {
          ...state.mcqAnswers,
          [action.payload.mcqId]: action.payload.answer,
        },
      };

    case 'UPDATE_FLASHCARD_SRS':
      return {
        ...state,
        flashcardSRS: {
          ...state.flashcardSRS,
          [action.payload.cardId]: action.payload,
        },
      };

    case 'SET_BOOKMARKS':
      return { ...state, bookmarks: action.payload };

    case 'ADD_BOOKMARK':
      return {
        ...state,
        bookmarks: state.bookmarks.includes(action.payload)
          ? state.bookmarks
          : [...state.bookmarks, action.payload],
      };

    case 'REMOVE_BOOKMARK':
      return {
        ...state,
        bookmarks: state.bookmarks.filter((b) => b !== action.payload),
      };

    case 'UPDATE_STREAK':
      return { ...state, streak: action.payload };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case 'UPDATE_PRACTICE_STATS':
      return { ...state, practiceStats: action.payload };

    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────

interface AppStore extends AppState {
  // Actions
  updateTopicProgress: (progress: TopicProgress) => Promise<void>;
  answerMCQ: (mcqId: string, selectedOption: number, isCorrect: boolean) => Promise<void>;
  updateFlashcardSRS: (data: StoredFlashcardSRS) => Promise<void>;
  toggleBookmark: (id: string) => Promise<void>;
  recordStudyActivity: () => Promise<void>;
  updateSetting: <K extends keyof StoredSettings>(key: K, value: StoredSettings[K]) => Promise<void>;
  incrementPracticeStat: (correct: boolean) => Promise<void>;
  getMCQAnswer: (mcqId: string) => StoredAnswer | undefined;
  isBookmarked: (id: string) => boolean;
  getFlashcardSRS: (cardId: string) => StoredFlashcardSRS | undefined;
  getTopicProgress: (topicId: string) => TopicProgress | undefined;
}

const AppContext = createContext<AppStore | null>(null);

// ─── Provider ──────────────────────────────────────────────────

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const initRef = useRef(false);

  // Load persisted state on mount
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const loadState = async () => {
      try {
        const [topicProgress, mcqAnswers, flashcardSRS, bookmarks, streak, settings, practiceStats] =
          await Promise.all([
            getAllTopicProgress(),
            getAllMCQAnswers(),
            getAllFlashcardSRS(),
            getBookmarks(),
            getStudyStreak(),
            getSettings(),
            getPracticeStats(),
          ]);

        dispatch({
          type: 'INIT_LOADED',
          payload: { topicProgress, mcqAnswers, flashcardSRS, bookmarks, streak, settings, practiceStats: practiceStats ?? DEFAULT_STATS },
        });
      } catch {
        dispatch({ type: 'INIT_LOADED', payload: {} });
      }
    };

    loadState();
  }, []);

  const updateTopicProgress = useCallback(async (progress: TopicProgress) => {
    dispatch({ type: 'UPDATE_TOPIC_PROGRESS', payload: progress });
    await saveTopicProgress(progress as any);
  }, []);

  const answerMCQ = useCallback(async (mcqId: string, selectedOption: number, isCorrect: boolean) => {
    const answer: StoredAnswer = { selectedOption, isCorrect, answeredAt: new Date().toISOString() };
    dispatch({ type: 'SAVE_MCQ_ANSWER', payload: { mcqId, answer } });
    await saveMCQAnswer(mcqId, answer);
  }, []);

  const updateFlashcardSRS = useCallback(async (data: StoredFlashcardSRS) => {
    dispatch({ type: 'UPDATE_FLASHCARD_SRS', payload: data });
    await saveFlashcardSRS(data);
  }, []);

  const toggleBookmark = useCallback(async (id: string) => {
    if (state.bookmarks.includes(id)) {
      dispatch({ type: 'REMOVE_BOOKMARK', payload: id });
      await removeBookmark(id);
    } else {
      dispatch({ type: 'ADD_BOOKMARK', payload: id });
      await addBookmark(id);
    }
  }, [state.bookmarks]);

  const recordStudyActivity = useCallback(async () => {
    const updated = await updateStudyStreak();
    dispatch({ type: 'UPDATE_STREAK', payload: updated });
  }, []);

  const updateSettingAction = useCallback(
    async <K extends keyof StoredSettings>(key: K, value: StoredSettings[K]) => {
      dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: value } as Partial<StoredSettings> });
      await updateSetting(key, value);
    },
    [],
  );

  const incrementPracticeStat = useCallback(async (correct: boolean) => {
    await incrementPracticeAnswer(correct);
    const stats = await getPracticeStats();
    if (stats) dispatch({ type: 'UPDATE_PRACTICE_STATS', payload: stats });
  }, []);

  const getMCQAnswer = useCallback(
    (mcqId: string) => state.mcqAnswers[mcqId],
    [state.mcqAnswers],
  );

  const isBookmarked = useCallback(
    (id: string) => state.bookmarks.includes(id),
    [state.bookmarks],
  );

  const getFlashcardSRS = useCallback(
    (cardId: string) => state.flashcardSRS[cardId],
    [state.flashcardSRS],
  );

  const getTopicProgress = useCallback(
    (topicId: string) => state.topicProgress[topicId],
    [state.topicProgress],
  );

  const store: AppStore = {
    ...state,
    updateTopicProgress,
    answerMCQ,
    updateFlashcardSRS,
    toggleBookmark,
    recordStudyActivity,
    updateSetting: updateSettingAction,
    incrementPracticeStat,
    getMCQAnswer,
    isBookmarked,
    getFlashcardSRS,
    getTopicProgress,
  };

  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
};

// ─── Hook ───────────────────────────────────────────────────────

export function useAppStore(): AppStore {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within <AppProvider>');
  }
  return context;
}

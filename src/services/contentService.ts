import {
  SyllabusNode,
  Topic,
  Note,
  MindMap,
  Flashcard,
  PYQ,
  SyllabusCategory,
  GSPaper,
} from '../types';
import {
  allSyllabusNodes as seedSyllabusNodes,
  mockTopics as seedTopics,
  mockNotes as seedNotes,
  mockMindMaps as seedMindMaps,
  mockPYQs as seedPYQs,
  mockFlashcards as seedFlashcards,
  CATEGORY_META as seedCategoryMeta,
} from '../data/seedData';

// Re-export seed data for components
export const allSyllabusNodes = seedSyllabusNodes;
export const mockTopics = seedTopics;
export const mockNotes = seedNotes;
export const mockMindMaps = seedMindMaps;
export const mockPYQs = seedPYQs;
export const mockFlashcards = seedFlashcards;
export { seedCategoryMeta as CATEGORY_META };

// Simulate network delay (ms)
const MOCK_DELAY = 300;

// ============================================================
// Topic APIs
// ============================================================

export const getTopics = async (): Promise<Topic[]> => {
  await delay(MOCK_DELAY);
  return seedTopics;
};

export const getTopicById = async (id: string): Promise<Topic | undefined> => {
  await delay(MOCK_DELAY);
  return seedTopics.find((t: Topic) => t.id === id);
};

export const getTopicsByCategory = async (
  category: SyllabusCategory,
): Promise<Topic[]> => {
  await delay(MOCK_DELAY);
  return seedTopics.filter((t: Topic) => t.category === category);
};

export const getTopicsByPaper = async (
  paper: GSPaper | 'CSAT' | 'Essay' | 'Optional',
): Promise<Topic[]> => {
  await delay(MOCK_DELAY);
  return seedTopics.filter((t: Topic) => t.paper === paper);
};

export const updateTopicProgress = async (
  id: string,
  progress: number,
): Promise<Topic> => {
  await delay(MOCK_DELAY);
  const topic = seedTopics.find((t: Topic) => t.id === id);
  if (!topic) throw new Error(`Topic ${id} not found`);
  topic.progress = Math.min(100, Math.max(0, progress));
  topic.lastStudied = new Date().toISOString().split('T')[0];
  return topic;
};

// ============================================================
// Notes APIs
// ============================================================

export const getNotesForTopic = async (topicId: string): Promise<Note[]> => {
  await delay(MOCK_DELAY);
  return seedNotes.filter((n: Note) => n.topicId === topicId);
};

export const getAllNotes = async (): Promise<Note[]> => {
  await delay(MOCK_DELAY);
  return seedNotes;
};

// ============================================================
// Mind Map APIs
// ============================================================

export const getMindMapForTopic = async (
  topicId: string,
): Promise<MindMap | undefined> => {
  await delay(MOCK_DELAY);
  return seedMindMaps.find((m: MindMap) => m.topicId === topicId);
};

// ============================================================
// PYQ APIs
// ============================================================

export const getPYQsForTopic = async (topicId: string): Promise<PYQ[]> => {
  await delay(MOCK_DELAY);
  return seedPYQs.filter((p: PYQ) => p.topicId === topicId);
};

export const getAllPYQs = async (): Promise<PYQ[]> => {
  await delay(MOCK_DELAY);
  return seedPYQs;
};

export const getPYQsByYear = async (year: number): Promise<PYQ[]> => {
  await delay(MOCK_DELAY);
  return seedPYQs.filter((p: PYQ) => p.year === year);
};

// ============================================================
// Flashcard APIs
// ============================================================

export const getFlashcardsForTopic = async (
  topicId: string,
): Promise<Flashcard[]> => {
  await delay(MOCK_DELAY);
  return seedFlashcards.filter((f: Flashcard) => f.topicId === topicId);
};

export const getAllFlashcards = async (): Promise<Flashcard[]> => {
  await delay(MOCK_DELAY);
  return seedFlashcards;
};

export const updateFlashcard = async (
  id: string,
  updates: Partial<Flashcard>,
): Promise<Flashcard> => {
  await delay(MOCK_DELAY);
  const card = seedFlashcards.find((f: Flashcard) => f.id === id);
  if (!card) throw new Error(`Flashcard ${id} not found`);
  return { ...card, ...updates };
};

// ============================================================
// Syllabus APIs
// ============================================================

export const getSyllabusTree = async (): Promise<SyllabusNode[]> => {
  await delay(MOCK_DELAY);
  return seedSyllabusNodes;
};

export const toggleSyllabusNode = async (id: string): Promise<SyllabusNode> => {
  await delay(100);
  const node = findNode(seedSyllabusNodes, id);
  if (!node) throw new Error(`Syllabus node ${id} not found`);
  node.isCompleted = !node.isCompleted;
  return node;
};

// ============================================================
// Category APIs
// ============================================================

export const getCategories = (): Array<{
  category: SyllabusCategory;
  label: string;
  icon: string;
  description: string;
  paper: GSPaper | 'CSAT' | 'Essay' | 'Optional';
}> => {
  return Object.entries(seedCategoryMeta).map(([key, val]) => ({
    category: key as SyllabusCategory,
    ...val,
  }));
};

export const getCategoryMeta = (category: SyllabusCategory) => {
  return seedCategoryMeta[category];
};

// ============================================================
// Progress Analytics
// ============================================================

export const getOverallProgress = async (): Promise<{
  overallPercent: number;
  categoryProgress: Record<SyllabusCategory, number>;
  totalTopics: number;
  completedTopics: number;
  totalStudyMinutes: number;
}> => {
  await delay(MOCK_DELAY);

  const totalTopics = seedTopics.length;
  const completedTopics = seedTopics.filter(
    (t: Topic) => t.progress === 100,
  ).length;
  const overallPercent = Math.round(
    seedTopics.reduce(
      (sum: number, t: Topic) => sum + t.progress,
      0,
    ) / totalTopics,
  );

  const categories = Object.keys(seedCategoryMeta) as SyllabusCategory[];
  const categoryProgress: Record<string, number> = {};
  for (const cat of categories) {
    const catTopics = seedTopics.filter((t: Topic) => t.category === cat);
    if (catTopics.length > 0) {
      categoryProgress[cat] = Math.round(
        catTopics.reduce(
          (s: number, t: Topic) => s + t.progress,
          0,
        ) / catTopics.length,
      );
    }
  }

  return {
    overallPercent,
    categoryProgress: categoryProgress as Record<SyllabusCategory, number>,
    totalTopics,
    completedTopics,
    totalStudyMinutes: completedTopics * 45,
  };
};

// ============================================================
// Helpers
// ============================================================

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function findNode(
  nodes: SyllabusNode[],
  id: string,
): SyllabusNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

export function flattenSyllabus(nodes: SyllabusNode[]): SyllabusNode[] {
  const result: SyllabusNode[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children) {
      result.push(...flattenSyllabus(node.children));
    }
  }
  return result;
}
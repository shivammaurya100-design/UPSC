// Search service — MCQ bank search, article search, and syllabus search

import { extendedMCQs } from '../data/practiceData';
import { allSyllabusNodes } from '../services/contentService';
import { MCQ } from '../types';
import { NewsArticle } from '../types';

// ─── Mock news articles (inlined for search — swap with real API) ─────
const MOCK_NEWS: NewsArticle[] = [
  {
    id: 'ca-001',
    title: 'India–EU Free Trade Agreement: Key Trade Barriers Removed After 7 Years of Negotiations',
    summary: 'India and the EU concluded the long-pending FTA. The agreement covers goods, services, investment, and geographical indications.',
    source: 'The Hindu',
    publishedAt: '2 hours ago',
    linkedTopics: ['gs3-economy', 'gs2-governance'],
    tags: ['International Relations', 'Trade', 'Economy'],
    importance: 'high',
  },
  {
    id: 'ca-002',
    title: 'Supreme Court Landmark Ruling: Electoral Bonds Scheme Declared Unconstitutional',
    summary: 'A five-judge bench struck down the Electoral Bonds Scheme as violative of Article 19(1)(a).',
    source: 'Indian Express',
    publishedAt: '4 hours ago',
    linkedTopics: ['gs2-constitution', 'gs2-governance'],
    tags: ['Polity', 'Supreme Court', 'Electoral Reform'],
    importance: 'high',
  },
  {
    id: 'ca-003',
    title: 'COP31 Host City Announced: Brazil to Host 2026 UN Climate Conference in Belém',
    summary: 'COP31 will be held in Belém, Brazil — located in the Amazon basin. India reaffirmed its NDC targets.',
    source: 'PIB',
    publishedAt: '6 hours ago',
    linkedTopics: ['gs3-environment'],
    tags: ['Environment', 'Climate Change', 'International'],
    importance: 'high',
  },
  {
    id: 'ca-004',
    title: 'Gaganyaan Mission Update: ISRO Announces First Uncrewed Test by Q3 2026',
    summary: 'ISRO Chairman announced the first uncrewed test flight of the Gaganyaan mission is scheduled for Q3 2026.',
    source: 'PIB',
    publishedAt: '8 hours ago',
    linkedTopics: ['gs3-scitech'],
    tags: ['Science & Technology', 'Space', 'ISRO'],
    importance: 'medium',
  },
  {
    id: 'ca-005',
    title: '53rd GST Council Meeting: Revisions to Tax Rates on Insurance Premiums & Renewable Energy',
    summary: 'The GST Council approved revised rates on life insurance premiums (18% cap) and simplified rates for renewable energy components.',
    source: 'Economic Times',
    publishedAt: '10 hours ago',
    linkedTopics: ['gs3-economy'],
    tags: ['Economy', 'GST', 'Finance'],
    importance: 'medium',
  },
];

// ─── MCQ Search ────────────────────────────────────────────────

export interface MCQSearchResult {
  mcq: MCQ;
  matchScore: number;
  matchField: 'question' | 'explanation' | 'topic';
}

export function searchMCQs(query: string): MCQSearchResult[] {
  if (!query || query.trim().length < 2) return [];

  const q = query.toLowerCase().trim();
  const terms = q.split(/\s+/);

  const scored = extendedMCQs.map((mcq) => {
    let matchScore = 0;
    let matchField: 'question' | 'explanation' | 'topic' = 'question';

    const qText = mcq.question.toLowerCase();
    const expText = mcq.explanation.toLowerCase();
    const topicText = mcq.topicId.toLowerCase();

    // Exact phrase match (highest score)
    if (qText.includes(q)) { matchScore += 10; matchField = 'question'; }
    if (expText.includes(q)) { matchScore += 8; matchField = 'explanation'; }
    if (topicText.includes(q)) { matchScore += 6; matchField = 'topic'; }

    // Individual term match
    for (const term of terms) {
      if (qText.includes(term)) { matchScore += 3; if (matchScore > 0 && matchField === 'topic') matchField = 'question'; }
      if (expText.includes(term)) { matchScore += 2; if (matchScore > 0 && matchField !== 'explanation') matchField = 'explanation'; }
      if (topicText.includes(term)) { matchScore += 1; }
    }

    return { mcq, matchScore, matchField };
  });

  return scored
    .filter((r) => r.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 20);
}

// ─── Article Search ────────────────────────────────────────────

export interface ArticleSearchResult {
  article: NewsArticle;
  matchScore: number;
  matchField: 'title' | 'summary' | 'tag';
}

export function searchArticles(query: string): ArticleSearchResult[] {
  if (!query || query.trim().length < 2) return [];

  const q = query.toLowerCase().trim();
  const terms = q.split(/\s+/);

  const scored = MOCK_NEWS.map((article) => {
    let matchScore = 0;
    let matchField: 'title' | 'summary' | 'tag' = 'title';

    if (article.title.toLowerCase().includes(q)) { matchScore += 10; matchField = 'title'; }
    if (article.summary.toLowerCase().includes(q)) { matchScore += 6; matchField = 'summary'; }
    if (article.tags.some((t) => t.toLowerCase().includes(q))) { matchScore += 4; matchField = 'tag'; }

    for (const term of terms) {
      if (article.title.toLowerCase().includes(term)) matchScore += 3;
      if (article.summary.toLowerCase().includes(term)) matchScore += 2;
      if (article.tags.some((t) => t.toLowerCase().includes(term))) matchScore += 1;
    }

    return { article, matchScore, matchField };
  });

  return scored
    .filter((r) => r.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);
}

// ─── Syllabus Search ────────────────────────────────────────────

export interface SyllabusSearchResult {
  node: typeof allSyllabusNodes[0];
  matchScore: number;
  depth: number;
}

export function searchSyllabus(query: string): SyllabusSearchResult[] {
  if (!query || query.trim().length < 2) return [];

  const q = query.toLowerCase().trim();

  const scored = allSyllabusNodes.map((node) => {
    let matchScore = 0;
    if (node.title.toLowerCase().includes(q)) matchScore += 10;
    if (node.category.toLowerCase().includes(q)) matchScore += 5;
    return { node, matchScore, depth: node.depth };
  });

  return scored
    .filter((r) => r.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 15);
}

// ─── Unified Search ────────────────────────────────────────────

export interface UnifiedSearchResult {
  type: 'mcq' | 'article' | 'syllabus';
  title: string;
  subtitle: string;
  meta: string;
  score: number;
  data: MCQ | NewsArticle | typeof allSyllabusNodes[0];
}

export function unifiedSearch(query: string): UnifiedSearchResult[] {
  if (!query || query.trim().length < 2) return [];

  const mcqResults = searchMCQs(query).map((r) => ({
    type: 'mcq' as const,
    title: r.mcq.question.slice(0, 80) + (r.mcq.question.length > 80 ? '...' : ''),
    subtitle: r.mcq.explanation.slice(0, 60) + '...',
    meta: r.mcq.source + (r.mcq.year ? ` · ${r.mcq.year}` : ''),
    score: r.matchScore,
    data: r.mcq,
  }));

  const articleResults = searchArticles(query).map((r) => ({
    type: 'article' as const,
    title: r.article.title.slice(0, 80) + (r.article.title.length > 80 ? '...' : ''),
    subtitle: r.article.summary.slice(0, 60) + '...',
    meta: r.article.source + ' · ' + r.article.publishedAt,
    score: r.matchScore,
    data: r.article,
  }));

  const syllabusResults = searchSyllabus(query).map((r) => ({
    type: 'syllabus' as const,
    title: r.node.title,
    subtitle: r.node.category,
    meta: `${r.node.paper} · ${'  '.repeat(r.depth)}Level ${r.depth + 1}`,
    score: r.matchScore,
    data: r.node,
  }));

  return [...mcqResults, ...articleResults, ...syllabusResults]
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}

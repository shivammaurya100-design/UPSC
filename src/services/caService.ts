// Current Affairs service — articles, search, bookmarks

import { v4 as uuidv4 } from 'uuid';
import { getOne, getAll, run } from '../utils/db';
import { NewsArticle, Bookmark } from '../types';

interface DBArticle {
  id: string;
  title: string;
  summary: string;
  source: string | null;
  published_at: string | null;
  linked_topics: string;
  tags: string;
  importance: string;
  url: string | null;
}

function toArticle(a: DBArticle): NewsArticle {
  return {
    id: a.id,
    title: a.title,
    summary: a.summary,
    source: a.source ?? '',
    publishedAt: a.published_at ?? '',
    linkedTopics: JSON.parse(a.linked_topics || '[]'),
    tags: JSON.parse(a.tags || '[]'),
    importance: a.importance as any,
    url: a.url ?? undefined,
  };
}

export function getArticles(tag?: string, importance?: string, page = 1, limit = 20): NewsArticle[] {
  const conditions: string[] = [];
  const params: any[] = [];

  if (tag) {
    conditions.push('tags LIKE ?');
    params.push(`%"${tag}"%`);
  }
  if (importance) {
    conditions.push('importance = ?');
    params.push(importance);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit, (page - 1) * limit);

  return getAll<DBArticle>(
    `SELECT * FROM news_articles ${where} ORDER BY published_at DESC, importance DESC LIMIT ? OFFSET ?`,
    params
  ).map(toArticle);
}

export function getArticleById(id: string): NewsArticle | null {
  const a = getOne<DBArticle>('SELECT * FROM news_articles WHERE id = ?', [id]);
  return a ? toArticle(a) : null;
}

export function searchArticles(query: string, limit = 10): NewsArticle[] {
  const q = `%${query.toLowerCase()}%`;
  return getAll<DBArticle>(
    `SELECT * FROM news_articles
     WHERE LOWER(title) LIKE ? OR LOWER(summary) LIKE ? OR LOWER(tags) LIKE ?
     ORDER BY importance DESC, published_at DESC LIMIT ?`,
    [q, q, q, limit]
  ).map(toArticle);
}

// Bookmarks
export function addBookmark(userId: string, itemId: string, itemType: 'article' | 'post' | 'mcq' | 'flashcard'): Bookmark {
  const id = uuidv4();
  run(
    `INSERT OR IGNORE INTO bookmarks (id, user_id, item_id, item_type) VALUES (?, ?, ?, ?)`,
    [id, userId, itemId, itemType]
  );
  return getOne<Bookmark>('SELECT * FROM bookmarks WHERE user_id = ? AND item_id = ? AND item_type = ?', [userId, itemId, itemType])!;
}

export function removeBookmark(userId: string, itemId: string, itemType: string): void {
  run('DELETE FROM bookmarks WHERE user_id = ? AND item_id = ? AND item_type = ?', [userId, itemId, itemType]);
}

export function getBookmarks(userId: string, itemType?: string): Bookmark[] {
  const where = itemType ? 'WHERE user_id = ? AND item_type = ?' : 'WHERE user_id = ?';
  const params = itemType ? [userId, itemType] : [userId];
  return getAll<Bookmark>(`SELECT * FROM bookmarks ${where} ORDER BY created_at DESC`, params);
}

export function isBookmarked(userId: string, itemId: string, itemType: string): boolean {
  const row = getOne<{ cnt: number }>('SELECT COUNT(*) as cnt FROM bookmarks WHERE user_id = ? AND item_id = ? AND item_type = ?', [userId, itemId, itemType]);
  return (row?.cnt ?? 0) > 0;
}

// Seed articles
export function seedArticles(articles: NewsArticle[]) {
  const insert = db.transaction((items: NewsArticle[]) => {
    for (const a of items) {
      run(
        `INSERT OR IGNORE INTO news_articles (id, title, summary, source, published_at, linked_topics, tags, importance, url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          a.id, a.title, a.summary, a.source, a.publishedAt,
          JSON.stringify(a.linkedTopics), JSON.stringify(a.tags),
          a.importance, a.url ?? null,
        ]
      );
    }
  });
  insert(articles);
}

// Import db for seed
import { db } from '../utils/db';
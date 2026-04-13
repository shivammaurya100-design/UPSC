// SQLite database setup and schema initialization

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/upsc.db');

// Ensure data directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const _db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
_db.pragma('journal_mode = WAL');
_db.pragma('foreign_keys = ON');

export const db: Database.Database = _db;

// ─── Schema Migration ──────────────────────────────────────────────

export function initDB(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      exam_stage TEXT NOT NULL DEFAULT 'prelims' CHECK(exam_stage IN ('prelims','mains','interview')),
      target_year INTEGER DEFAULT 2025,
      optional_subject TEXT,
      daily_goal_minutes INTEGER DEFAULT 60,
      streak_days INTEGER DEFAULT 0,
      xp INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS topic_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      completed_subtopics INTEGER DEFAULT 0,
      total_subtopics INTEGER DEFAULT 0,
      percent_complete REAL DEFAULT 0,
      last_studied TEXT DEFAULT (datetime('now')),
      mcq_score REAL,
      notes_read_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, topic_id)
    );

    CREATE TABLE IF NOT EXISTS mcq_answers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      mcq_id TEXT NOT NULL,
      selected_option INTEGER NOT NULL,
      is_correct INTEGER NOT NULL,
      answered_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, mcq_id)
    );

    CREATE TABLE IF NOT EXISTS flashcards (
      id TEXT PRIMARY KEY,
      topic_id TEXT NOT NULL,
      front TEXT NOT NULL,
      back TEXT NOT NULL,
      ease_factor REAL DEFAULT 2.5,
      interval INTEGER DEFAULT 0,
      repetitions INTEGER DEFAULT 0,
      next_review TEXT,
      last_reviewed TEXT
    );

    CREATE TABLE IF NOT EXISTS flashcard_srs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      card_id TEXT NOT NULL,
      ease_factor REAL DEFAULT 2.5,
      interval INTEGER DEFAULT 0,
      repetitions INTEGER DEFAULT 0,
      next_review TEXT DEFAULT (datetime('now')),
      last_reviewed TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (card_id) REFERENCES flashcards(id) ON DELETE CASCADE,
      UNIQUE(user_id, card_id)
    );

    CREATE TABLE IF NOT EXISTS community_posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_title TEXT,
      type TEXT NOT NULL CHECK(type IN ('strategy','question','discussion','resource')),
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      upvotes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      is_pinned INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      body TEXT NOT NULL,
      upvotes INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS news_articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      source TEXT,
      published_at TEXT,
      linked_topics TEXT DEFAULT '[]',
      tags TEXT DEFAULT '[]',
      importance TEXT DEFAULT 'medium' CHECK(importance IN ('high','medium','low')),
      url TEXT
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      item_type TEXT NOT NULL CHECK(item_type IN ('article','post','mcq','flashcard')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, item_id, item_type)
    );

    CREATE TABLE IF NOT EXISTS practice_stats (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      total_attempted INTEGER DEFAULT 0,
      correct_answers INTEGER DEFAULT 0,
      accuracy REAL DEFAULT 0,
      weak_topics TEXT DEFAULT '[]',
      strong_topics TEXT DEFAULT '[]',
      last_updated TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS study_streaks (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_active_date TEXT,
      total_active_days INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS mcqs (
      id TEXT PRIMARY KEY,
      topic_id TEXT NOT NULL,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      correct_option INTEGER NOT NULL,
      explanation TEXT NOT NULL,
      source TEXT DEFAULT 'Practice',
      year INTEGER,
      paper TEXT
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_topic_progress_user ON topic_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_mcq_answers_user ON mcq_answers(user_id);
    CREATE INDEX IF NOT EXISTS idx_flashcard_srs_user_card ON flashcard_srs(user_id, card_id);
    CREATE INDEX IF NOT EXISTS idx_community_posts_user ON community_posts(user_id);
    CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
    CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id, item_type);
    CREATE INDEX IF NOT EXISTS idx_mcqs_topic ON mcqs(topic_id);
  `);

  console.log('✅ Database initialized at:', DB_PATH);
}

// ─── Query helpers ─────────────────────────────────────────────────

export function getOne<T>(sql: string, params: any[] = []): T | undefined {
  return db.prepare(sql).get(...params) as T | undefined;
}

export function getAll<T>(sql: string, params: any[] = []): T[] {
  return db.prepare(sql).all(...params) as T[];
}

export function run(sql: string, params: any[] = []): Database.RunResult {
  return db.prepare(sql).run(...params);
}

export function getCount(sql: string, params: any[] = []): number {
  const row = db.prepare(sql).get(...params) as { count?: number } | undefined;
  return row?.count ?? 0;
}
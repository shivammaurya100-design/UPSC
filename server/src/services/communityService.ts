// Community service — posts, comments, upvoting

import { v4 as uuidv4 } from 'uuid';
import { getOne, getAll, run } from '../utils/db';
import { CommunityPost, Comment } from '../types';

interface DBPost {
  id: string;
  user_id: string;
  author_name: string;
  author_title: string | null;
  type: string;
  title: string;
  body: string;
  tags: string;
  upvotes: number;
  comments: number;
  views: number;
  created_at: string;
  is_pinned: number;
}

function toPost(p: DBPost): CommunityPost {
  return {
    id: p.id,
    userId: p.user_id,
    authorName: p.author_name,
    authorTitle: p.author_title || undefined,
    type: p.type as any,
    title: p.title,
    body: p.body,
    tags: JSON.parse(p.tags || '[]'),
    upvotes: p.upvotes,
    comments: p.comments,
    views: p.views,
    createdAt: p.created_at,
    isPinned: p.is_pinned === 1,
  };
}

interface DBComment {
  id: string;
  post_id: string;
  user_id: string;
  author_name: string;
  body: string;
  upvotes: number;
  created_at: string;
}

function toComment(c: DBComment): Comment {
  return {
    id: c.id,
    postId: c.post_id,
    userId: c.user_id,
    authorName: c.author_name,
    body: c.body,
    upvotes: c.upvotes,
    createdAt: c.created_at,
  };
}

export interface CreatePostInput {
  type: 'strategy' | 'question' | 'discussion' | 'resource';
  title: string;
  body: string;
  tags: string[];
  authorName: string;
}

export function createPost(userId: string, input: CreatePostInput): CommunityPost {
  const id = uuidv4();
  run(
    `INSERT INTO community_posts (id, user_id, author_name, type, title, body, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, input.authorName, input.type, input.title, input.body, JSON.stringify(input.tags)]
  );
  return getPostById(id)!;
}

export function getPosts(type?: string, page = 1, limit = 20): CommunityPost[] {
  const offset = (page - 1) * limit;
  const where = type ? `WHERE type = ?` : '';
  const params = type ? [type, limit, offset] : [limit, offset];

  return getAll<DBPost>(
    `SELECT * FROM community_posts ${where} ORDER BY is_pinned DESC, created_at DESC LIMIT ? OFFSET ?`,
    params
  ).map(toPost);
}

export function getPostById(id: string): CommunityPost | null {
  // Increment view count
  run('UPDATE community_posts SET views = views + 1 WHERE id = ?', [id]);
  const p = getOne<DBPost>('SELECT * FROM community_posts WHERE id = ?', [id]);
  return p ? toPost(p) : null;
}

export function upvotePost(postId: string): number {
  run('UPDATE community_posts SET upvotes = upvotes + 1 WHERE id = ?', [postId]);
  const p = getOne<DBPost>('SELECT upvotes FROM community_posts WHERE id = ?', [postId]);
  return p?.upvotes ?? 0;
}

export function getComments(postId: string): Comment[] {
  return getAll<DBComment>(
    'SELECT * FROM comments WHERE post_id = ? ORDER BY upvotes DESC, created_at ASC',
    [postId]
  ).map(toComment);
}

export function createComment(userId: string, postId: string, authorName: string, body: string): Comment {
  const id = uuidv4();
  run(
    `INSERT INTO comments (id, post_id, user_id, author_name, body) VALUES (?, ?, ?, ?, ?)`,
    [id, postId, userId, authorName, body]
  );
  run('UPDATE community_posts SET comments = comments + 1 WHERE id = ?', [postId]);
  const d = getOne<DBComment>('SELECT * FROM comments WHERE id = ?', [id])!;
  return toComment(d);
}

export function upvoteComment(commentId: string): number {
  run('UPDATE comments SET upvotes = upvotes + 1 WHERE id = ?', [commentId]);
  const c = getOne<DBComment>('SELECT upvotes FROM comments WHERE id = ?', [commentId]);
  return c?.upvotes ?? 0;
}

export function searchPosts(query: string, limit = 20): CommunityPost[] {
  const q = `%${query.toLowerCase()}%`;
  return getAll<DBPost>(
    `SELECT * FROM community_posts
     WHERE LOWER(title) LIKE ? OR LOWER(body) LIKE ? OR LOWER(tags) LIKE ?
     ORDER BY upvotes DESC LIMIT ?`,
    [q, q, q, limit]
  ).map(toPost);
}

// Seed mock posts
export function seedPosts(posts: CommunityPost[]) {
  const insert = db.transaction((items: CommunityPost[]) => {
    for (const p of items) {
      run(
        `INSERT OR IGNORE INTO community_posts (id, user_id, author_name, author_title, type, title, body, tags, upvotes, comments, views, is_pinned)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.userId ?? 'system', p.authorName, p.authorTitle ?? null, p.type, p.title, p.body, JSON.stringify(p.tags), p.upvotes, p.comments, p.views, p.isPinned ? 1 : 0]
      );
    }
  });
  insert(posts);
}

// Import db for seedPosts
import { db } from '../utils/db';
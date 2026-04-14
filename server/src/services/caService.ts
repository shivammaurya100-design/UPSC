// Current Affairs service — articles, bookmarks via Supabase

import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../utils/supabase';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  linkedTopics: string[];
  tags: string[];
  importance: string;
  url?: string;
}

function toArticle(r: any): NewsArticle {
  return {
    id: r.id, title: r.title, summary: r.summary,
    source: r.source ?? '',
    publishedAt: r.published_at ?? '',
    linkedTopics: r.linked_topics || [],
    tags: r.tags || [],
    importance: r.importance,
    url: r.url ?? undefined,
  };
}

export async function getArticles(tag?: string, importance?: string, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  let query = supabaseAdmin
    .from('news_articles').select('*')
    .order('published_at', { ascending: false })
    .order('importance', { ascending: true })
    .range(offset, offset + limit - 1);

  if (tag) query = query.contains('tags', [tag]);
  if (importance) query = query.eq('importance', importance);

  const { data } = await query;
  return (data || []).map(toArticle);
}

export async function getArticleById(id: string): Promise<NewsArticle | null> {
  const { data } = await supabaseAdmin.from('news_articles').select('*').eq('id', id).single();
  return data ? toArticle(data) : null;
}

export async function searchArticles(query: string, limit = 10): Promise<NewsArticle[]> {
  const q = `%${query.toLowerCase()}%`;
  const { data } = await supabaseAdmin
    .from('news_articles').select('*')
    .or(`title.ilike.${q},summary.ilike.${q}`)
    .order('importance', { ascending: true }).limit(limit);
  return (data || []).map(toArticle);
}

export async function addBookmark(userId: string, itemId: string, itemType: string) {
  await supabaseAdmin.from('bookmarks').upsert({
    id: uuidv4(), user_id: userId, item_id: itemId, item_type: itemType,
  } as any);
  return { success: true };
}

export async function removeBookmark(userId: string, itemId: string, itemType: string) {
  await supabaseAdmin.from('bookmarks')
    .delete().eq('user_id', userId)
    .eq('item_id', itemId).eq('item_type', itemType);
}

export async function getBookmarks(userId: string, itemType?: string) {
  let query = supabaseAdmin.from('bookmarks').select('*').eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (itemType) query = query.eq('item_type', itemType);
  const { data } = await query;
  return data || [];
}

export async function isBookmarked(userId: string, itemId: string, itemType: string): Promise<boolean> {
  const { count } = await supabaseAdmin
    .from('bookmarks').select('id', { count: 'exact', head: true })
    .eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType);
  return (count ?? 0) > 0;
}

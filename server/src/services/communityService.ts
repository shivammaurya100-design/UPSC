// Community service — posts, comments, upvoting via Supabase

import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../utils/supabase';

export interface CommunityPost {
  id: string;
  userId: string;
  authorName: string;
  authorTitle?: string;
  type: string;
  title: string;
  body: string;
  tags: string[];
  upvotes: number;
  comments: number;
  views: number;
  createdAt: string;
  isPinned?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  authorName: string;
  body: string;
  upvotes: number;
  createdAt: string;
}

function toPost(r: any): CommunityPost {
  return {
    id: r.id, userId: r.user_id, authorName: r.author_name,
    authorTitle: r.author_title ?? undefined,
    type: r.type, title: r.title, body: r.body,
    tags: r.tags || [],
    upvotes: r.upvotes, comments: r.comments, views: r.views,
    createdAt: r.created_at, isPinned: r.is_pinned,
  };
}

function toComment(r: any): Comment {
  return {
    id: r.id, postId: r.post_id, userId: r.user_id,
    authorName: r.author_name, body: r.body,
    upvotes: r.upvotes, createdAt: r.created_at,
  };
}

export async function createPost(userId: string, input: any): Promise<CommunityPost> {
  const { data } = await supabaseAdmin.from('community_posts').insert({
    id: uuidv4(), user_id: userId, ...input,
  } as any).select().single();
  return toPost(data);
}

export async function getPosts(type?: string, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  let query = supabaseAdmin
    .from('community_posts').select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (type) query = query.eq('type', type);

  const { data } = await query;
  return (data || []).map(toPost);
}

export async function getPostById(id: string): Promise<CommunityPost | null> {
  try { await supabaseAdmin.rpc('increment_views', { post_id: id }); } catch { /* ignore */ }
  const { data } = await supabaseAdmin.from('community_posts').select('*').eq('id', id).single();
  return data ? toPost(data) : null;
}

export async function upvotePost(postId: string): Promise<number> {
  const { data } = await supabaseAdmin
    .from('community_posts').select('upvotes').eq('id', postId).single();
  const newCount = (data?.upvotes ?? 0) + 1;
  await supabaseAdmin.from('community_posts').update({ upvotes: newCount } as any).eq('id', postId);
  return newCount;
}

export async function getComments(postId: string): Promise<Comment[]> {
  const { data } = await supabaseAdmin
    .from('comments').select('*')
    .eq('post_id', postId)
    .order('upvotes', { ascending: false })
    .order('created_at', { ascending: true });
  return (data || []).map(toComment);
}

export async function createComment(userId: string, postId: string, authorName: string, body: string): Promise<Comment> {
  const { data } = await supabaseAdmin.from('comments').insert({
    id: uuidv4(), post_id: postId, user_id: userId,
    author_name: authorName, body,
  } as any).select().single();

  try { await supabaseAdmin.rpc('increment_comments', { post_id: postId }); } catch { /* ignore */ }
  return toComment(data);
}

export async function upvoteComment(commentId: string): Promise<number> {
  const { data } = await supabaseAdmin
    .from('comments').select('upvotes').eq('id', commentId).single();
  const newCount = (data?.upvotes ?? 0) + 1;
  await supabaseAdmin.from('comments').update({ upvotes: newCount } as any).eq('id', commentId);
  return newCount;
}

export async function searchPosts(query: string, limit = 20): Promise<CommunityPost[]> {
  const q = `%${query.toLowerCase()}%`;
  const { data } = await supabaseAdmin
    .from('community_posts').select('*')
    .or(`title.ilike.${q},body.ilike.${q}`)
    .order('upvotes', { ascending: false }).limit(limit);
  return (data || []).map(toPost);
}

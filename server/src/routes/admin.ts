// Admin CRUD routes — MCQs, flashcards, articles, community, users
// All routes protected by adminAuth middleware (service role key bypasses RLS)

import { Router } from 'express';
import { z } from 'zod';
import { adminAuth } from '../middleware/adminAuth';
import { supabaseAdmin } from '../utils/supabase';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Apply admin auth to all routes
router.use(adminAuth);

// ─── Dashboard ─────────────────────────────────────────────────────

router.get('/dashboard', async (_req, res, next) => {
  try {
    const [mcqCount, flashcardCount, articleCount, userCount, postCount] = await Promise.all([
      supabaseAdmin.from('mcqs').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('flashcards').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('news_articles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('community_posts').select('id', { count: 'exact', head: true }),
    ]);

    const { data: recentMCQs } = await supabaseAdmin
      .from('mcqs').select('id, question, topic_id, source, created_at')
      .order('created_at', { ascending: false }).limit(5);

    const { data: recentArticles } = await supabaseAdmin
      .from('news_articles').select('id, title, source, published_at')
      .order('published_at', { ascending: false }).limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          mcqs: mcqCount.count ?? 0,
          flashcards: flashcardCount.count ?? 0,
          articles: articleCount.count ?? 0,
          users: userCount.count ?? 0,
          posts: postCount.count ?? 0,
        },
        recentMCQs: recentMCQs ?? [],
        recentArticles: recentArticles ?? [],
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── MCQs ───────────────────────────────────────────────────────────

const MCQCreateSchema = z.object({
  topicId: z.string().min(1),
  question: z.string().min(10),
  options: z.array(z.string()).length(4),
  correctOption: z.number().int().min(0).max(3),
  explanation: z.string().min(5),
  source: z.string().optional().default('Practice'),
  year: z.number().int().optional(),
  paper: z.string().optional(),
});

const MCQUpdateSchema = MCQCreateSchema.partial();

router.get('/mcqs', async (req, res, next) => {
  try {
    const topic = req.query.topic as string | undefined;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;
    const search = req.query.search as string | undefined;

    let query = supabaseAdmin.from('mcqs').select('*', { count: 'exact' })
      .order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    if (topic) query = query.eq('topic_id', topic);
    if (search) query = query.ilike('question', `%${search}%`);

    const { data, count, error } = await query;
    if (error) throw error;

    res.json({ success: true, data: data ?? [], total: count ?? 0, page, limit });
  } catch (err) {
    next(err);
  }
});

router.post('/mcqs', async (req, res, next) => {
  try {
    const parsed = MCQCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.message });
      return;
    }
    const { topicId, question, options, correctOption, explanation, source, year, paper } = parsed.data;
    const { data, error } = await supabaseAdmin.from('mcqs').insert({
      id: uuidv4(),
      topic_id: topicId,
      question,
      options,
      correct_option: correctOption,
      explanation,
      source: source ?? 'Practice',
      year: year ?? null,
      paper: paper ?? null,
    } as any).select().single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    next(err);
  }
});

router.put('/mcqs/:id', async (req, res, next) => {
  try {
    const parsed = MCQUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.message });
      return;
    }
    const { topicId, question, options, correctOption, explanation, source, year, paper } = parsed.data;
    const updates: any = {};
    if (topicId !== undefined) updates.topic_id = topicId;
    if (question !== undefined) updates.question = question;
    if (options !== undefined) updates.options = options;
    if (correctOption !== undefined) updates.correct_option = correctOption;
    if (explanation !== undefined) updates.explanation = explanation;
    if (source !== undefined) updates.source = source;
    if (year !== undefined) updates.year = year;
    if (paper !== undefined) updates.paper = paper;

    const { data, error } = await supabaseAdmin.from('mcqs')
      .update(updates).eq('id', req.params.id).select().single();

    if (error) throw error;
    if (!data) { res.status(404).json({ success: false, error: 'MCQ not found' }); return; }
    res.json({ success: true, data });
  } catch (err: any) {
    next(err);
  }
});

router.delete('/mcqs/:id', async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('mcqs').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    next(err);
  }
});

router.post('/mcqs/bulk', async (req, res, next) => {
  try {
    const items = Array.isArray(req.body) ? req.body : req.body.items;
    if (!Array.isArray(items)) {
      res.status(400).json({ success: false, error: 'Expected array of MCQs' });
      return;
    }
    const records = items.map((item: any) => ({
      id: uuidv4(),
      topic_id: item.topicId ?? item.topic_id ?? '',
      question: item.question ?? '',
      options: item.options ?? [],
      correct_option: item.correctOption ?? item.correct_option ?? 0,
      explanation: item.explanation ?? '',
      source: item.source ?? 'Practice',
      year: item.year ?? null,
      paper: item.paper ?? null,
    })).filter((r: any) => r.topic_id && r.question && r.options.length === 4);

    if (records.length === 0) {
      res.status(400).json({ success: false, error: 'No valid MCQs to import' });
      return;
    }
    const { data, error } = await supabaseAdmin.from('mcqs').insert(records as any).select();
    if (error) throw error;
    res.status(201).json({ success: true, data, imported: records.length });
  } catch (err: any) {
    next(err);
  }
});

// ─── Flashcards ─────────────────────────────────────────────────────

const FlashcardCreateSchema = z.object({
  topicId: z.string().min(1),
  front: z.string().min(5),
  back: z.string().min(5),
});

const FlashcardUpdateSchema = FlashcardCreateSchema.partial();

router.get('/flashcards', async (req, res, next) => {
  try {
    const topic = req.query.topic as string | undefined;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;

    let query = supabaseAdmin.from('flashcards').select('*', { count: 'exact' })
      .order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    if (topic) query = query.eq('topic_id', topic);

    const { data, count, error } = await query;
    if (error) throw error;
    res.json({ success: true, data: data ?? [], total: count ?? 0, page, limit });
  } catch (err) {
    next(err);
  }
});

router.post('/flashcards', async (req, res, next) => {
  try {
    const parsed = FlashcardCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.message });
      return;
    }
    const { topicId, front, back } = parsed.data;
    const { data, error } = await supabaseAdmin.from('flashcards').insert({
      id: uuidv4(),
      topic_id: topicId,
      front,
      back,
    } as any).select().single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    next(err);
  }
});

router.put('/flashcards/:id', async (req, res, next) => {
  try {
    const parsed = FlashcardUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.message });
      return;
    }
    const updates: any = {};
    if (req.body.topicId !== undefined) updates.topic_id = req.body.topicId;
    if (req.body.front !== undefined) updates.front = req.body.front;
    if (req.body.back !== undefined) updates.back = req.body.back;

    const { data, error } = await supabaseAdmin.from('flashcards')
      .update(updates).eq('id', req.params.id).select().single();

    if (error) throw error;
    if (!data) { res.status(404).json({ success: false, error: 'Flashcard not found' }); return; }
    res.json({ success: true, data });
  } catch (err: any) {
    next(err);
  }
});

router.delete('/flashcards/:id', async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('flashcards').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    next(err);
  }
});

// ─── Articles ───────────────────────────────────────────────────────

const ArticleCreateSchema = z.object({
  title: z.string().min(5),
  summary: z.string().min(10),
  source: z.string().optional().default(''),
  publishedAt: z.string().optional(),
  linkedTopics: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  importance: z.enum(['high', 'medium', 'low']).optional().default('medium'),
  url: z.string().optional(),
});

const ArticleUpdateSchema = ArticleCreateSchema.partial();

router.get('/articles', async (req, res, next) => {
  try {
    const importance = req.query.importance as string | undefined;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;

    let query = supabaseAdmin.from('news_articles').select('*', { count: 'exact' })
      .order('published_at', { ascending: false }).range(offset, offset + limit - 1);

    if (importance) query = query.eq('importance', importance);

    const { data, count, error } = await query;
    if (error) throw error;
    res.json({ success: true, data: data ?? [], total: count ?? 0, page, limit });
  } catch (err) {
    next(err);
  }
});

router.post('/articles', async (req, res, next) => {
  try {
    const parsed = ArticleCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.message });
      return;
    }
    const { title, summary, source, publishedAt, linkedTopics, tags, importance, url } = parsed.data;
    const { data, error } = await supabaseAdmin.from('news_articles').insert({
      id: uuidv4(),
      title,
      summary,
      source: source ?? '',
      published_at: publishedAt ?? new Date().toISOString(),
      linked_topics: linkedTopics ?? [],
      tags: tags ?? [],
      importance: importance ?? 'medium',
      url: url ?? null,
    } as any).select().single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    next(err);
  }
});

router.put('/articles/:id', async (req, res, next) => {
  try {
    const parsed = ArticleUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.message });
      return;
    }
    const updates: any = {};
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.summary !== undefined) updates.summary = req.body.summary;
    if (req.body.source !== undefined) updates.source = req.body.source;
    if (req.body.publishedAt !== undefined) updates.published_at = req.body.publishedAt;
    if (req.body.linkedTopics !== undefined) updates.linked_topics = req.body.linkedTopics;
    if (req.body.tags !== undefined) updates.tags = req.body.tags;
    if (req.body.importance !== undefined) updates.importance = req.body.importance;
    if (req.body.url !== undefined) updates.url = req.body.url;

    const { data, error } = await supabaseAdmin.from('news_articles')
      .update(updates).eq('id', req.params.id).select().single();

    if (error) throw error;
    if (!data) { res.status(404).json({ success: false, error: 'Article not found' }); return; }
    res.json({ success: true, data });
  } catch (err: any) {
    next(err);
  }
});

router.delete('/articles/:id', async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('news_articles').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    next(err);
  }
});

// ─── Community Posts ────────────────────────────────────────────────

router.get('/posts', async (req, res, next) => {
  try {
    const type = req.query.type as string | undefined;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;

    let query = supabaseAdmin.from('community_posts').select('*', { count: 'exact' })
      .order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    if (type) query = query.eq('type', type);

    const { data, count, error } = await query;
    if (error) throw error;
    res.json({ success: true, data: data ?? [], total: count ?? 0, page, limit });
  } catch (err) {
    next(err);
  }
});

router.put('/posts/:id', async (req, res, next) => {
  try {
    const { isPinned } = req.body as { isPinned?: boolean };
    const updates: any = {};
    if (isPinned !== undefined) updates.is_pinned = isPinned;

    const { data, error } = await supabaseAdmin.from('community_posts')
      .update(updates).eq('id', req.params.id).select().single();

    if (error) throw error;
    if (!data) { res.status(404).json({ success: false, error: 'Post not found' }); return; }
    res.json({ success: true, data });
  } catch (err: any) {
    next(err);
  }
});

router.delete('/posts/:id', async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('community_posts').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    next(err);
  }
});

// ─── Comments ───────────────────────────────────────────────────────

router.get('/comments', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabaseAdmin
      .from('comments').select('*, post:post_id(title)', { count: 'exact' })
      .order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    if (error) throw error;
    res.json({ success: true, data: data ?? [], total: count ?? 0, page, limit });
  } catch (err) {
    next(err);
  }
});

router.delete('/comments/:id', async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('comments').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    next(err);
  }
});

// ─── Users ──────────────────────────────────────────────────────────

router.get('/users', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;

    const { data: profiles, count, error } = await supabaseAdmin
      .from('profiles').select('*', { count: 'exact' })
      .order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    if (error) throw error;

    // Fetch practice stats for each user
    const userIds = (profiles ?? []).map((p: any) => p.id);
    let statsMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: stats } = await supabaseAdmin
        .from('practice_stats').select('*').in('user_id', userIds);
      (stats ?? []).forEach((s: any) => { statsMap[s.user_id] = s; });
    }

    const result = (profiles ?? []).map((p: any) => ({
      ...p,
      practiceStats: statsMap[p.id] ?? null,
    }));

    res.json({ success: true, data: result, total: count ?? 0, page, limit });
  } catch (err) {
    next(err);
  }
});

router.put('/users/:id', async (req, res, next) => {
  try {
    const { examStage, optionalSubject, targetYear, dailyGoalMinutes } = req.body as any;
    const updates: any = {};
    if (examStage !== undefined) updates.exam_stage = examStage;
    if (optionalSubject !== undefined) updates.optional_subject = optionalSubject;
    if (targetYear !== undefined) updates.target_year = targetYear;
    if (dailyGoalMinutes !== undefined) updates.daily_goal_minutes = dailyGoalMinutes;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin.from('profiles')
      .update(updates).eq('id', req.params.id).select().single();

    if (error) throw error;
    if (!data) { res.status(404).json({ success: false, error: 'User not found' }); return; }
    res.json({ success: true, data });
  } catch (err: any) {
    next(err);
  }
});

export default router;

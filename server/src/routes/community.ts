// Community routes — posts, comments, search

import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import * as communityService from '../services/communityService';
import { getProfile } from '../services/authService';

const router = Router();

const CreatePostSchema = z.object({
  type: z.enum(['strategy', 'question', 'discussion', 'resource']),
  title: z.string().min(3).max(200),
  body: z.string().min(10),
  tags: z.array(z.string()),
});

const CreateCommentSchema = z.object({
  body: z.string().min(1).max(2000),
});

// GET /community/posts
router.get('/posts', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const type = req.query.type as string | undefined;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const posts = communityService.getPosts(type, page, limit);
    res.json({ success: true, data: posts, page, limit });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /community/posts
router.post('/posts', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = CreatePostSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.message });
      return;
    }
    const profile = await getProfile(req.user!.userId);
    const authorName = profile?.name || 'Anonymous';

    const post = communityService.createPost(req.user!.userId, {
      ...parsed.data,
      authorName,
    });
    res.status(201).json({ success: true, data: post });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /community/posts/:id
router.get('/posts/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const post = communityService.getPostById(id);
    if (!post) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }
    res.json({ success: true, data: post });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /community/posts/:id/upvote
router.post('/posts/:id/upvote', (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const upvotes = communityService.upvotePost(id);
    res.json({ success: true, data: { upvotes } });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /community/posts/:id/comments
router.get('/posts/:id/comments', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const comments = communityService.getComments(id);
    res.json({ success: true, data: comments });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /community/posts/:id/comments
router.post('/posts/:id/comments', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = CreateCommentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.message });
      return;
    }
    const id = req.params.id as string;
    const profile = await getProfile(req.user!.userId);
    const authorName = profile?.name || 'Anonymous';

    const comment = communityService.createComment(req.user!.userId, id, authorName, parsed.data.body);
    res.status(201).json({ success: true, data: comment });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /community/comments/:id/upvote
router.post('/comments/:id/upvote', (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const upvotes = communityService.upvoteComment(id);
    res.json({ success: true, data: { upvotes } });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /community/search?q=
router.get('/search', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q) {
      res.status(400).json({ success: false, error: 'Query required' });
      return;
    }
    const results = communityService.searchPosts(q, 20);
    res.json({ success: true, data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
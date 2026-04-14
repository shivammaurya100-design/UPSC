// Current Affairs routes — articles, search, bookmarks

import { Router, Response } from 'express';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import * as caService from '../services/caService';

const router = Router();

// GET /ca/articles
router.get('/articles', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tag = req.query.tag as string | undefined;
    const importance = req.query.importance as string | undefined;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const articles = await caService.getArticles(tag, importance, page, limit);
    res.json({ success: true, data: articles, page, limit });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /ca/articles/search?q=
router.get('/articles/search', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q) {
      res.status(400).json({ success: false, error: 'Query required' });
      return;
    }
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 30);
    const results = await caService.searchArticles(q, limit);
    res.json({ success: true, data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /ca/articles/:id
router.get('/articles/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const article = await caService.getArticleById(id);
    if (!article) {
      res.status(404).json({ success: false, error: 'Article not found' });
      return;
    }

    // Include bookmark status if authenticated
    let isBookmarked = false;
    if (req.user) {
      isBookmarked = await caService.isBookmarked(req.user.userId, id, 'article');
    }

    res.json({ success: true, data: { ...article, isBookmarked } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /ca/bookmarks
router.post('/bookmarks', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId, itemType } = req.body as { itemId: string; itemType: 'article' | 'post' | 'mcq' | 'flashcard' };
    if (!itemId || !itemType) {
      res.status(400).json({ success: false, error: 'itemId and itemType required' });
      return;
    }
    const bookmark = await caService.addBookmark(req.user!.userId, itemId, itemType);
    res.status(201).json({ success: true, data: bookmark });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /ca/bookmarks/:itemId
router.delete('/bookmarks/:itemId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const itemType = (req.query.itemType as string) || 'article';
    const itemId = req.params.itemId as string;
    await caService.removeBookmark(req.user!.userId, itemId, itemType);
    res.json({ success: true, message: 'Bookmark removed' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /ca/bookmarks
router.get('/bookmarks', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const itemType = req.query.itemType as string | undefined;
    const bookmarks = await caService.getBookmarks(req.user!.userId, itemType as any);
    res.json({ success: true, data: bookmarks });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
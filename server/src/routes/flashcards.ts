// Flashcard routes — deck, review, SRS

import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { supabaseAdmin } from '../utils/supabase';
import * as flashcardService from '../services/flashcardService';

const router = Router();

const ReviewSchema = z.object({
  cardId: z.string().min(1),
  rating: z.number().int().min(0).max(5),
});

// GET /flashcards/review
router.get('/review', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cardIds = await flashcardService.getCardsForReview(req.user!.userId, 20);

    if (cardIds.length === 0) {
      res.json({ success: true, data: [], dueCount: 0 });
      return;
    }

    const { data: flashcards } = await supabaseAdmin
      .from('flashcards').select('*').in('id', cardIds);

    const result = (flashcards || []).map((card: any) => {
      return {
        id: card.id,
        topicId: card.topic_id,
        front: card.front,
        back: card.back,
        srs: null,
      };
    });

    res.json({ success: true, data: result, dueCount: cardIds.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /flashcards/review
router.post('/review', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = ReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.message });
      return;
    }
    const result = await flashcardService.reviewCard(req.user!.userId, parsed.data);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /flashcards/stats
router.get('/stats', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await flashcardService.getReviewStats(req.user!.userId);
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /flashcards/by-topic/:topicId
router.get('/topic/:topicId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data: flashcards } = await supabaseAdmin
      .from('flashcards').select('*').eq('topic_id', req.params.topicId);

    const result = (flashcards || []).map((card: any) => ({
      id: card.id,
      topicId: card.topic_id,
      front: card.front,
      back: card.back,
      srs: null,
    }));

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

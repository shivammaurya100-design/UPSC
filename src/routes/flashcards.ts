// Flashcard routes — deck, review, SRS

import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import * as flashcardService from '../services/flashcardService';
import { getAll, getOne, run } from '../utils/db';

const router = Router();

const ReviewSchema = z.object({
  cardId: z.string().min(1),
  rating: z.number().int().min(0).max(5),
});

// GET /flashcards/review — cards due for review
router.get('/review', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const cardIds = flashcardService.getCardsForReview(req.user!.userId, 20);

    const flashcards = cardIds.map(id => {
      const card = getOne<{ id: string; topic_id: string; front: string; back: string }>(
        'SELECT * FROM flashcards WHERE id = ?', [id]
      );
      const srs = flashcardService.getCardSRS(req.user!.userId, id);
      return card ? { ...card, topicId: card.topic_id, srs } : null;
    }).filter(Boolean);

    res.json({ success: true, data: flashcards, dueCount: cardIds.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /flashcards/review
router.post('/review', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = ReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.message });
      return;
    }
    const result = flashcardService.reviewCard(req.user!.userId, parsed.data);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /flashcards/stats
router.get('/stats', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = flashcardService.getReviewStats(req.user!.userId);
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /flashcards/by-topic/:topicId
router.get('/topic/:topicId', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const flashcards = getAll<{ id: string; topic_id: string; front: string; back: string }>(
      'SELECT * FROM flashcards WHERE topic_id = ?', [req.params.topicId]
    );
    const result = flashcards.map(card => {
      const srs = flashcardService.getCardSRS(req.user!.userId, card.id);
      return { id: card.id, topicId: card.topic_id, front: card.front, back: card.back, srs };
    });
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
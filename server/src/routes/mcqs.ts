// MCQ routes — list, search, answer, review

import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import * as mcqService from '../services/mcqService';

const router = Router();

const AnswerSchema = z.object({
  mcqId: z.string().min(1),
  selectedOption: z.number().int().min(0).max(3),
});

// GET /mcqs — list all (with optional topic filter)
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const topicId = req.query.topic as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = parseInt(req.query.offset as string) || 0;

    const mcqs = topicId
      ? await mcqService.getMCQsByTopic(topicId)
      : await mcqService.getAllMCQs(limit, offset);

    res.json({ success: true, data: mcqs, count: mcqs.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /mcqs/search?q=
router.get('/search', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q || q.trim().length < 2) {
      res.status(400).json({ success: false, error: 'Query too short' });
      return;
    }
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const results = await mcqService.searchMCQs(q.trim(), limit);
    res.json({ success: true, data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /mcqs/:id
router.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const mcq = await mcqService.getMCQById(id);
    if (!mcq) {
      res.status(404).json({ success: false, error: 'MCQ not found' });
      return;
    }

    // If authenticated, include user's previous answer
    let userAnswer = null;
    if (req.user) {
      const ua = await mcqService.getUserAnswerForMCQ(req.user.userId, mcq.id);
      if (ua) {
        userAnswer = { selectedOption: ua.selected_option, isCorrect: ua.is_correct };
      }
    }

    res.json({ success: true, data: { ...mcq, userAnswer } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /mcqs/answer
router.post('/answer', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = AnswerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.message });
      return;
    }

    const result = await mcqService.saveAnswer(req.user!.userId, parsed.data);
    mcqService.updatePracticeStats(req.user!.userId, result.isCorrect);

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /mcqs/stats/my — user's practice stats
router.get('/stats/my', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await mcqService.getPracticeStats(req.user!.userId);
    const answers = await mcqService.getUserAnswers(req.user!.userId);
    res.json({ success: true, data: { stats, answers } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
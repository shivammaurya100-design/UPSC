// Auth routes — register, login, profile

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { register, login, getProfile, updateProfile } from '../services/authService';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).optional(),
  examStage: z.enum(['prelims', 'mains', 'interview']).optional(),
  targetYear: z.number().int().min(2024).optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const UpdateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  examStage: z.enum(['prelims', 'mains', 'interview']).optional(),
  targetYear: z.number().int().min(2024).optional(),
  optionalSubject: z.string().optional(),
  dailyGoalMinutes: z.number().int().min(15).max(480).optional(),
});

// POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.message });
      return;
    }
    const result = await register({
      email: parsed.data.email,
      password: parsed.data.password,
      name: parsed.data.name ?? '',
      examStage: parsed.data.examStage,
      targetYear: parsed.data.targetYear,
    });
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    res.status(409).json({ success: false, error: err.message });
  }
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.message });
      return;
    }
    const result = await login(parsed.data);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(401).json({ success: false, error: err.message });
  }
});

// GET /auth/profile
router.get('/profile', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = await getProfile(req.user!.userId);
    if (!profile) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    res.json({ success: true, data: profile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /auth/profile
router.patch('/profile', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = UpdateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.message });
      return;
    }
    const profile = await updateProfile(req.user!.userId, parsed.data);
    res.json({ success: true, data: profile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
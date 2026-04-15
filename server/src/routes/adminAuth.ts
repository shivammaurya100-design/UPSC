// Admin auth routes — login with email/password, returns JWT

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import { supabaseAdmin } from '../utils/supabase';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'upsc_admin_jwt_secret_2024_change_this';
const JWT_EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60; // 7 days

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

interface AdminPayload {
  adminId: string;
  email: string;
  role: string;
}

// POST /admin/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Invalid email or password format' });
      return;
    }

    const { email, password } = parsed.data;

    // Look up admin by email
    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .select('id, email, password_hash, name, role')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !admin) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    // Verify password
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    // Generate JWT
    const payload: AdminPayload = {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const signOpts: SignOptions = { expiresIn: JWT_EXPIRES_IN_SECONDS };
    const token = jwt.sign(payload, JWT_SECRET, signOpts);

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (err: any) {
    console.error('Admin login error:', err.message);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// GET /admin/me — verify current token
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET) as AdminPayload;

    res.json({
      success: true,
      admin: {
        id: payload.adminId,
        email: payload.email,
        role: payload.role,
      },
    });
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
});

export default router;

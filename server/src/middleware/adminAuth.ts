// Admin authentication middleware
// Protects all /admin/* routes using JWT Bearer token

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'upsc_admin_jwt_secret_2024_change_this';

interface AdminPayload {
  adminId: string;
  email: string;
  role: string;
}

export interface AuthenticatedAdminRequest extends Request {
  admin?: AdminPayload;
}

export function adminAuth(
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AdminPayload;
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

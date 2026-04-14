// Admin authentication middleware
// Protects all /admin/* routes using a shared secret header

import { Request, Response, NextFunction } from 'express';

export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const secret = req.headers['x-admin-secret'] as string | undefined;

  if (!secret) {
    res.status(401).json({ success: false, error: 'Admin secret required' });
    return;
  }

  if (secret !== process.env.ADMIN_SECRET) {
    res.status(403).json({ success: false, error: 'Invalid admin secret' });
    return;
  }

  next();
}

// Vercel Serverless Entry Point
// Wraps the Express app as a Vercel serverless function
// Works with @vercel/node — no extra package needed

import { VercelRequest, VercelResponse } from '@vercel/node';
import app from './index';

// Vercel serverless function handler
// Each invocation = fresh Lambda cold start
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Suppress console.log in production to reduce log noise
  if (process.env.NODE_ENV === 'production') {
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      // Only log actual errors, not 404s from undefined routes
      if (args[0] instanceof Error || (typeof args[0] === 'string' && !args[0].includes('Route not found'))) {
        originalConsoleError.apply(console, args);
      }
    };
  }

  // Disable Vercel's default body parsing — let Express handle it
  // and set a longer timeout for Supabase queries
  res.setHeader('X-Powered-By', 'UPSC Pathfinder API v2.0');

  // Delegate to Express app
  await app(req, res);
}

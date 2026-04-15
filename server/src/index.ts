// UPSC Pathfinder API — Main Entry Point
// Supports dual mode: Supabase (production) or SQLite (development fallback)

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import mcqRoutes from './routes/mcqs';
import flashcardRoutes from './routes/flashcards';
import communityRoutes from './routes/community';
import caRoutes from './routes/ca';
import adminRoutes from './routes/admin';
import aiRoutes from './routes/ai';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const USE_SUPABASE = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

// ─── Middleware ───────────────────────────────────────────────────

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Secret'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ──────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'UPSC Pathfinder API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    database: USE_SUPABASE ? 'supabase' : 'sqlite',
  });
});

// ─── Routes ────────────────────────────────────────────────────────

app.use('/auth', authRoutes);
app.use('/mcqs', mcqRoutes);
app.use('/flashcards', flashcardRoutes);
app.use('/community', communityRoutes);
app.use('/ca', caRoutes);
app.use('/admin', adminRoutes);
app.use('/ai', aiRoutes);

// ─── 404 Handler ───────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ─── Error Handler ─────────────────────────────────────────────────

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ─── Start ─────────────────────────────────────────────────────────
// Skip app.listen() in Vercel serverless — handler is exported via vercel.ts
if (process.env.VERCEL !== 'true') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
  ╔═══════════════════════════════════════════════════════╗
  ║   UPSC Pathfinder API v2.0                           ║
  ║   Running on http://localhost:${PORT}                  ║
  ║   Database: ${(USE_SUPABASE ? 'Supabase (PostgreSQL)' : 'SQLite (fallback)').padEnd(35)}║
  ╚═══════════════════════════════════════════════════════╝
    `);
  });
}

export default app;

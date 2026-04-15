// AI routes — Answer Evaluation and Doubt Assistant via Claude
// Both features use server-side Claude API to keep the key secure

import { Router, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { supabaseAdmin } from '../utils/supabase';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();
export default router;

// ─── Helpers ────────────────────────────────────────────────────────

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured');
  return new Anthropic({ apiKey });
}

function extractJson(text: string): any {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) return null;
  try {
    return JSON.parse(text.substring(firstBrace, lastBrace + 1));
  } catch {
    return null;
  }
}

// ─── Answer Evaluation ──────────────────────────────────────────────

const EvaluateBodySchema = z.object({
  topicId: z.string().min(1),
  question: z.string().min(10),
  answer: z.string().min(20),
});

router.post('/evaluate', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = EvaluateBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.message });
      return;
    }

    const { topicId, question, answer } = parsed.data;
    const client = getClient();

    const response = await client.messages.create({
      model: 'claude-opus-4-0',
      max_tokens: 1024,
      system: `You are an expert UPSC Mains examiner. Evaluate GS answer writing.

Evaluate on four dimensions (each out of 10):
1. Relevance — Does the answer directly address the question's demand?
2. Structure — Is it well-organized with clear intro/body/conclusion?
3. Depth — Does it show conceptual clarity, analytical ability, and understanding?
4. Current Examples — Does it use relevant facts, case studies, data, or current examples?

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "score": 0-100,
  "relevance": 0-10,
  "structure": 0-10,
  "depth": 0-10,
  "currentExamples": 0-10,
  "overallFeedback": "2-3 sentence overall assessment",
  "improvementPoints": ["point 1", "point 2", "point 3"],
  "suggestedKeywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5"]
}`,
      messages: [{
        role: 'user',
        content: `TOPIC: ${topicId}\n\nQUESTION: ${question}\n\nUSER'S ANSWER:\n${answer}`,
      }],
    });

    const rawText = response.content[0].type === 'text' ? response.content[0].text : '';
    const data = extractJson(rawText);

    if (!data || typeof data.score !== 'number') {
      console.error('Failed to parse Claude evaluation:', rawText);
      res.status(500).json({ success: false, error: 'Failed to parse AI evaluation response' });
      return;
    }

    // Persist evaluation to Supabase
    const userId = req.user!.userId;
    const { data: saved, error: saveErr } = await supabaseAdmin
      .from('ai_evaluations')
      .insert({
        user_id: userId,
        topic_id: topicId,
        question,
        user_answer: answer,
        score: data.score,
        relevance: data.relevance,
        structure: data.structure,
        depth: data.depth,
        current_examples: data.currentExamples ?? 0,
        overall_feedback: data.overallFeedback,
        improvement_points: data.improvementPoints,
        suggested_keywords: data.suggestedKeywords,
      })
      .select()
      .single();

    if (saveErr) console.error('Failed to save evaluation:', saveErr);

    res.json({
      success: true,
      data: {
        score: data.score,
        relevance: data.relevance,
        structure: data.structure,
        depth: data.depth,
        currentExamples: data.currentExamples ?? 0,
        overallFeedback: data.overallFeedback,
        improvementPoints: data.improvementPoints,
        suggestedKeywords: data.suggestedKeywords,
      },
      evaluationId: saved?.id,
    });
  } catch (err: any) {
    console.error('AI evaluation error:', err.message);
    res.status(500).json({ success: false, error: err.message || 'Evaluation failed' });
  }
});

router.get('/evaluations', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const { data, error } = await supabaseAdmin
      .from('ai_evaluations')
      .select('id, topic_id, question, score, evaluated_at')
      .eq('user_id', userId)
      .order('evaluated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const { count } = await supabaseAdmin
      .from('ai_evaluations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    res.json({ success: true, data: data || [], total: count || 0 });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Doubt Assistant ─────────────────────────────────────────────────

const ChatBodySchema = z.object({
  message: z.string().min(1),
  topicId: z.string().optional(),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })).optional(),
});

router.post('/chat', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = ChatBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.message });
      return;
    }

    const { message, topicId, history = [] } = parsed.data;
    const client = getClient();

    const systemPrompt = topicId
      ? `You are an expert UPSC CSE mentor and educator. Answer questions in the context of the UPSC Civil Services Examination (Prelims + Mains).

Guidelines:
- Be precise, analytical, and exam-oriented
- Use examples, case studies, and current examples where relevant
- Explain concepts with UPSC perspective (PYQs, answer writing, GS papers)
- If the question is off-topic, gently redirect to UPSC content
- Keep answers focused — 100–250 words for conceptual questions
- Use bullet points for multi-part questions
- Reference articles of the Constitution, committees, landmark judgments when relevant
- Link static topics to current affairs where possible
- Answer in English`
      : `You are an expert UPSC CSE mentor. Answer all questions from a UPSC perspective. Be precise, analytical, and exam-oriented. Use examples and case studies. Keep answers focused (100–250 words). Answer in English.`;

    const historyMessages = history.slice(-10).map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const response = await client.messages.create({
      model: 'claude-opus-4-0',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        ...historyMessages,
        { role: 'user', content: message },
      ],
    });

    const reply = response.content[0].type === 'text' ? response.content[0].text : '';

    res.json({ success: true, reply, messageId: crypto.randomUUID() });
  } catch (err: any) {
    console.error('AI chat error:', err.message);
    res.status(500).json({ success: false, error: err.message || 'Chat failed' });
  }
});
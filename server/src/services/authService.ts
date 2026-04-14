// Auth service — register, login, JWT management via Supabase Auth

import { supabaseAdmin } from '../utils/supabase';
import { signToken } from '../middleware/auth';

export interface AuthResult {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    examStage: string;
    targetYear: number;
    optionalSubject?: string;
    dailyGoalMinutes: number;
    streakDays: number;
    xp: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  examStage?: 'prelims' | 'mains' | 'interview';
  targetYear?: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

function toUser(data: any): AuthResult['user'] {
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    examStage: data.exam_stage,
    targetYear: data.target_year,
    optionalSubject: data.optional_subject ?? undefined,
    dailyGoalMinutes: data.daily_goal_minutes,
    streakDays: data.streak_days,
    xp: data.xp,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: input.email.toLowerCase(),
    password: input.password,
    email_confirm: true,
    user_metadata: { name: input.name || '' },
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message || 'Registration failed');
  }

  const userId = authData.user.id;

  await supabaseAdmin.from('profiles').upsert({
    id: userId,
    email: input.email.toLowerCase(),
    name: input.name || '',
    exam_stage: input.examStage || 'prelims',
    target_year: input.targetYear || new Date().getFullYear() + 1,
    daily_goal_minutes: 60,
    xp: 0,
    streak_days: 0,
  } as any);

  await supabaseAdmin.from('practice_stats').upsert({ user_id: userId } as any);
  await supabaseAdmin.from('study_streaks').upsert({ user_id: userId } as any);

  const profile = await getProfile(userId);
  const token = signToken({ userId, email: input.email.toLowerCase() });
  return { token, user: profile! };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
    email: input.email.toLowerCase(),
    password: input.password,
  });

  if (authError || !authData.user) {
    throw new Error('Invalid email or password');
  }

  const profile = await getProfile(authData.user.id);
  const token = signToken({ userId: authData.user.id, email: authData.user.email! });
  return { token, user: profile! };
}

export async function getProfile(userId: string): Promise<AuthResult['user'] | null> {
  const { data } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
  if (!data) return null;
  return toUser(data);
}

export async function updateProfile(
  userId: string,
  updates: Partial<AuthResult['user']>
): Promise<AuthResult['user'] | null> {
  const dbUpdates: Record<string, any> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.examStage !== undefined) dbUpdates.exam_stage = updates.examStage;
  if (updates.targetYear !== undefined) dbUpdates.target_year = updates.targetYear;
  if (updates.optionalSubject !== undefined) dbUpdates.optional_subject = updates.optionalSubject;
  if (updates.dailyGoalMinutes !== undefined) dbUpdates.daily_goal_minutes = updates.dailyGoalMinutes;

  if (Object.keys(dbUpdates).length === 0) return getProfile(userId);

  await supabaseAdmin.from('profiles').update({ ...dbUpdates, updated_at: new Date().toISOString() } as any).eq('id', userId);
  return getProfile(userId);
}

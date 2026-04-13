// Auth service — register, login, JWT management

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db, getOne, run } from '../utils/db';
import { signToken } from '../middleware/auth';
import { User } from '../types';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '12', 10);

interface DBUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  exam_stage: string;
  target_year: number;
  optional_subject: string | null;
  daily_goal_minutes: number;
  streak_days: number;
  xp: number;
  created_at: string;
  updated_at: string;
}

function toUser(dbUser: DBUser): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    passwordHash: dbUser.password_hash,
    name: dbUser.name,
    examStage: dbUser.exam_stage as any,
    targetYear: dbUser.target_year,
    optionalSubject: dbUser.optional_subject || undefined,
    dailyGoalMinutes: dbUser.daily_goal_minutes,
    streakDays: dbUser.streak_days,
    xp: dbUser.xp,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
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

export interface AuthResult {
  token: string;
  user: Omit<User, 'passwordHash'>;
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = getOne<DBUser>('SELECT id FROM users WHERE email = ?', [input.email.toLowerCase()]);
  if (existing) {
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const userId = uuidv4();

  run(
    `INSERT INTO users (id, email, password_hash, name, exam_stage, target_year, daily_goal_minutes, xp)
     VALUES (?, ?, ?, ?, ?, ?, 60, 0)`,
    [
      userId,
      input.email.toLowerCase(),
      passwordHash,
      input.name || '',
      input.examStage || 'prelims',
      input.targetYear || new Date().getFullYear() + 1,
    ]
  );

  // Initialize practice stats and streak for new user
  run('INSERT INTO practice_stats (id, user_id) VALUES (?, ?)', [uuidv4(), userId]);
  run('INSERT INTO study_streaks (id, user_id) VALUES (?, ?)', [uuidv4(), userId]);

  const user = getOne<DBUser>('SELECT * FROM users WHERE id = ?', [userId])!;
  const token = signToken({ userId, email: user.email });

  const { passwordHash: _, ...safeUser } = toUser(user);
  return { token, user: safeUser };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = getOne<DBUser>('SELECT * FROM users WHERE email = ?', [input.email.toLowerCase()]);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isValid = await bcrypt.compare(input.password, user.password_hash);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  const token = signToken({ userId: user.id, email: user.email });
  const { passwordHash: _, ...safeUser } = toUser(user);
  return { token, user: safeUser };
}

export async function getProfile(userId: string): Promise<Omit<User, 'passwordHash'> | null> {
  const user = getOne<DBUser>('SELECT * FROM users WHERE id = ?', [userId]);
  if (!user) return null;
  const { passwordHash: _, ...safeUser } = toUser(user);
  return safeUser;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<User, 'name' | 'examStage' | 'targetYear' | 'optionalSubject' | 'dailyGoalMinutes'>>
): Promise<Omit<User, 'passwordHash'> | null> {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.examStage !== undefined) { fields.push('exam_stage = ?'); values.push(updates.examStage); }
  if (updates.targetYear !== undefined) { fields.push('target_year = ?'); values.push(updates.targetYear); }
  if (updates.optionalSubject !== undefined) { fields.push('optional_subject = ?'); values.push(updates.optionalSubject); }
  if (updates.dailyGoalMinutes !== undefined) { fields.push('daily_goal_minutes = ?'); values.push(updates.dailyGoalMinutes); }

  if (fields.length === 0) return getProfile(userId);

  fields.push("updated_at = datetime('now')");
  values.push(userId);

  run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  return getProfile(userId);
}
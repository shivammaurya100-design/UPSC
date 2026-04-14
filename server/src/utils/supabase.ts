// Supabase client — connects to PostgreSQL via Supabase

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

// Service role client — bypasses RLS (for server-side operations)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Public anon client — respects RLS policies (for authenticated users)
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export { supabaseUrl, supabaseAnonKey };

import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client for lead intake.
 * Uses the service role key (bypasses RLS). Never import this from client-side code,
 * and never expose these variables with a PUBLIC_ prefix.
 */
const supabaseUrl = import.meta.env.SUPABASE_URL;
const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;

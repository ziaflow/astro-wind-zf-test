import type { APIRoute } from 'astro';
import { syncClarityToSupabase } from '~/../tools/agents/sync-clarity-to-supabase.mjs';

export const prerender = false;

export const POST: APIRoute = async ({ redirect }) => {
  try {
    await syncClarityToSupabase(1);
  } catch (err) {
    console.error('Manual clarity sync error:', err);
  }
  return redirect('/admin/analytics?tab=clarity');
};

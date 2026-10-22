import type { APIRoute } from 'astro';
import { syncClarityToSupabase } from '~/../tools/agents/sync-clarity-to-supabase.mjs';

export const prerender = false;

export const POST: APIRoute = async ({ redirect }) => {
  try {
    const result = await syncClarityToSupabase(1);
    if (!result.success) {
      return Response.json(
        { success: false, error: 'Clarity sync failed. Check server configuration and logs.' },
        { status: result.code === 'SYNC_NOT_CONFIGURED' ? 503 : 502 }
      );
    }
    return redirect('/admin/analytics?tab=clarity');
  } catch {
    console.error('Manual Clarity sync failed unexpectedly.');
    return Response.json({ success: false, error: 'Clarity sync failed.' }, { status: 500 });
  }
};

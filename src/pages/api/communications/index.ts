import type { APIRoute } from 'astro';
import { supabase } from '~/lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  // Check optional admin authorization if an ADMIN_SECRET or CRON_SECRET is configured
  const url = new URL(request.url);
  const authHeader = request.headers.get('authorization');
  const secretParam = url.searchParams.get('secret');
  const expectedSecret = process.env.ADMIN_SECRET || process.env.CRON_SECRET;

  if (expectedSecret) {
    const bearer = authHeader?.replace(/^Bearer\s+/i, '');
    if (secretParam !== expectedSecret && bearer !== expectedSecret) {
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  const channel = url.searchParams.get('channel');
  const status = url.searchParams.get('status');
  const direction = url.searchParams.get('direction');
  const limit = Math.min(Number(url.searchParams.get('limit') || 50), 100);

  if (!supabase) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Database client unavailable',
        items: [],
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    let query = supabase.from('communications_log').select('*').order('created_at', { ascending: false }).limit(limit);

    if (channel) {
      query = query.eq('channel', channel);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (direction) {
      query = query.eq('direction', direction);
    }

    const { data, error } = await query;

    if (error) {
      return new Response(JSON.stringify({ ok: false, error: error.message, items: [] }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        count: data?.length ?? 0,
        items: data ?? [],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        items: [],
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

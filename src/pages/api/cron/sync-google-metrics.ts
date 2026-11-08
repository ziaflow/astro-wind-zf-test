import type { APIRoute } from 'astro';
import { run as runGoogleMetricsSync } from '../../../../scripts/sync-google-metrics.mjs';

export const prerender = false;

export const GET: APIRoute = async ({ request, url }) => {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const startDate = url.searchParams.get('start_date');
  const endDate = url.searchParams.get('end_date');

  const env = {
    ...process.env,
    ...(startDate ? { SYNC_START_DATE: startDate } : {}),
    ...(endDate ? { SYNC_END_DATE: endDate } : {}),
  };

  try {
    const logs: string[] = [];
    await runGoogleMetricsSync(env, fetch, (msg: string) => logs.push(msg));
    return new Response(JSON.stringify({ success: true, logs }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

import type { APIRoute } from 'astro';
import { run as runCustomerIoSync } from '../../../../scripts/sync-customerio-metrics.mjs';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const logs: string[] = [];
    await runCustomerIoSync(process.env, fetch, (msg) => logs.push(msg));
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


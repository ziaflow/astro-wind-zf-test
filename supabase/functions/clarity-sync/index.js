/* global Deno */
// Scheduled Clarity snapshots. Credentials live in Vault, never in source.
const base = Deno.env.get('SUPABASE_URL');
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const headers = { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey, 'Content-Type': 'application/json' };
async function db(path, body, method = 'POST') {
  const response = await fetch(base + '/rest/v1/' + path, {
    method,
    headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=representation' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw new Error('DATABASE_' + response.status);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
const normal = (name) => name.toLowerCase().replace(/[^a-z]/g, '');
function number(value) {
  const parsed = Number(value ?? 0);
  if (!Number.isSafeInteger(parsed) || parsed < 0) throw new Error('INVALID_METRIC');
  return parsed;
}
export function parseMetrics(payload, captured) {
  if (!Array.isArray(payload)) throw new Error('INVALID_PAYLOAD');
  const metrics = new Map(payload.map((m) => [normal(String(m.metricName)), m.information]));
  if (!Array.isArray(metrics.get('traffic'))) throw new Error('MISSING_TRAFFIC');
  const pages = new Map();
  const fields = {
    traffic: 'total_sessions',
    rageclickcount: 'rage_clicks',
    deadclickcount: 'dead_clicks',
    quickbackclick: 'quick_backs',
    excessivescroll: 'excessive_scrolling',
  };
  for (const [metric, field] of Object.entries(fields)) {
    for (const item of metrics.get(metric) || []) {
      const raw = item.Url ?? item.URL ?? item.url;
      if (!raw) continue;
      let url;
      try {
        url = new URL(raw);
      } catch {
        continue;
      }
      if (!['ziaflow.com', 'www.ziaflow.com'].includes(url.hostname)) continue;
      // Preserve query strings: distinct Clarity URL groups cannot be assumed to contain distinct sessions.
      const path = url.pathname + url.search;
      const row = pages.get(path) || {
        date: captured.slice(0, 10),
        page_path: path,
        total_sessions: 0,
        rage_clicks: 0,
        dead_clicks: 0,
        quick_backs: 0,
        excessive_scrolling: 0,
        created_at: captured,
      };
      row[field] = number(row[field]) + number(metric === 'traffic' ? item.totalSessionCount : item.subTotal);
      pages.set(path, row);
    }
  }
  // Do not sum URL-level session counts into a fabricated site-wide unique-session total.
  return [...pages.values()];
}
async function sameSecret(a, b) {
  const digest = async (s) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
  const [x, y] = await Promise.all([digest(a), digest(b)]);
  let difference = 0;
  for (let i = 0; i < x.length; i++) difference |= x[i] ^ y[i];
  return difference === 0;
}
Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('POST required', { status: 405 });
  const key = req.headers.get('x-sync-key');
  if (!key) return new Response('Unauthorized', { status: 401 });
  let run = null;
  try {
    const config = await db('rpc/clarity_sync_config', {});
    if (!config?.ziaflow_clarity_token || !config?.ziaflow_clarity_sync_key) throw new Error('MISSING_CONFIG');
    if (!(await sameSecret(key, config.ziaflow_clarity_sync_key))) return new Response('Unauthorized', { status: 401 });
    run = await db('rpc/clarity_claim_sync', {});
    if (!run)
      return Response.json({ success: true, skipped: true, reason: 'Slot already attempted or daily budget reached' });
    const response = await fetch(
      'https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=1&dimension1=URL',
      {
        headers: { Authorization: 'Bearer ' + config.ziaflow_clarity_token },
        signal: AbortSignal.timeout(45000),
      }
    );
    if (!response.ok) throw new Error('CLARITY_HTTP_' + response.status);
    const payload = await response.json();
    const captured = new Date().toISOString();
    const rows = parseMetrics(payload, captured);
    // Keep the provider payload even when there is no traffic, preserving honest empty snapshots.
    await db('clarity_sync_runs?id=eq.' + run, { payload }, 'PATCH');
    if (rows.length) await db('metrics_clarity_daily?on_conflict=date,page_path', rows);
    await db(
      'clarity_sync_runs?id=eq.' + run,
      {
        status: 'success',
        finished_at: new Date().toISOString(),
        rows_written: rows.length,
      },
      'PATCH'
    );
    return Response.json({ success: true, run_id: run, rows_written: rows.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_FAILURE';
    const code = /^(DATABASE_\d+|CLARITY_HTTP_\d+|INVALID_METRIC|INVALID_PAYLOAD|MISSING_TRAFFIC|MISSING_CONFIG)$/.test(
      message
    )
      ? message
      : 'SYNC_FAILED';
    if (run) {
      try {
        await db(
          'clarity_sync_runs?id=eq.' + run,
          { status: 'failed', finished_at: new Date().toISOString(), error_code: code },
          'PATCH'
        );
      } catch {
        console.error('Could not record Clarity failure');
      }
    }
    console.error('Clarity sync failed', code);
    return Response.json({ success: false, error: code }, { status: 502 });
  }
});

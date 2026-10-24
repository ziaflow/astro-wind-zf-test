import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

const env = {};
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts
        .slice(1)
        .join('=')
        .trim()
        .replace(/^["']|["']$/g, '');
      if (key && !key.startsWith('#')) {
        env[key] = val;
      }
    }
  }
}

const CLARITY_TOKEN = env.CLARITY_API_TOKEN;
const SUPABASE_URL = env.PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.PUBLIC_SUPABASE_ANON_KEY;

if (!CLARITY_TOKEN) {
  console.error('Missing CLARITY_API_TOKEN in .env');
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in .env');
  process.exit(1);
}

// Fetch live insights from Microsoft Clarity
async function fetchClarity(numOfDays) {
  const url = `https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=${numOfDays}&dimension1=URL`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CLARITY_TOKEN}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Clarity API responded with status ${res.status}: ${res.statusText}`);
  }

  return await res.json();
}

function parseUrlPath(rawUrl) {
  if (!rawUrl) return '/';
  try {
    const parsed = new URL(rawUrl);
    return parsed.pathname || '/';
  } catch {
    return rawUrl;
  }
}

function extractMetrics(data) {
  const traffic = data.find((m) => m.metricName === 'Traffic');
  const rage = data.find((m) => m.metricName === 'RageClickCount');
  const dead = data.find((m) => m.metricName === 'DeadClickCount');
  const quick = data.find((m) => m.metricName === 'QuickBackClick');
  const scroll = data.find((m) => m.metricName === 'ExcessiveScroll');

  const pageMetrics = new Map();

  // Helper to get or init record
  const getRecord = (path) => {
    if (!pageMetrics.has(path)) {
      pageMetrics.set(path, {
        page_path: path,
        total_sessions: 0,
        rage_clicks: 0,
        dead_clicks: 0,
        quick_backs: 0,
        excessive_scrolling: 0,
      });
    }
    return pageMetrics.get(path);
  };

  let aggregateSessions = 0;
  let aggregateRage = 0;
  let aggregateDead = 0;
  let aggregateQuick = 0;
  let aggregateScroll = 0;

  if (traffic?.information) {
    for (const item of traffic.information) {
      const p = parseUrlPath(item.Url);
      const rec = getRecord(p);
      const s = item.totalSessionCount || 0;
      rec.total_sessions += s;
      aggregateSessions += s;
    }
  }

  if (rage?.information) {
    for (const item of rage.information) {
      const p = parseUrlPath(item.Url);
      const rec = getRecord(p);
      const r = item.subTotal || 0;
      rec.rage_clicks += r;
      aggregateRage += r;
    }
  }

  if (dead?.information) {
    for (const item of dead.information) {
      const p = parseUrlPath(item.Url);
      const rec = getRecord(p);
      const d = item.subTotal || 0;
      rec.dead_clicks += d;
      aggregateDead += d;
    }
  }

  if (quick?.information) {
    for (const item of quick.information) {
      const p = parseUrlPath(item.Url);
      const rec = getRecord(p);
      const q = item.subTotal || 0;
      rec.quick_backs += q;
      aggregateQuick += q;
    }
  }

  if (scroll?.information) {
    for (const item of scroll.information) {
      const p = parseUrlPath(item.Url);
      const rec = getRecord(p);
      const e = item.subTotal || 0;
      rec.excessive_scrolling += e;
      aggregateScroll += e;
    }
  }

  return {
    aggregate: {
      page_path: '*',
      total_sessions: aggregateSessions,
      rage_clicks: aggregateRage,
      dead_clicks: aggregateDead,
      quick_backs: aggregateQuick,
      excessive_scrolling: aggregateScroll,
    },
    pages: Array.from(pageMetrics.values()).filter(
      (p) => p.total_sessions > 0 || p.dead_clicks > 0 || p.rage_clicks > 0
    ),
  };
}

async function upsertToSupabase(rows) {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/metrics_clarity_daily?on_conflict=date,page_path`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Supabase upsert error ${res.status}: ${errText}`);
  }

  return await res.json();
}

async function main() {
  console.log('Fetching Microsoft Clarity insights...');

  // 1-day (trailing 24h)
  const data1 = await fetchClarity(1);
  const metrics1 = extractMetrics(data1);

  // Compute date string (local/UTC)
  const today = new Date().toISOString().split('T')[0];

  const rowsToUpsert = [
    {
      date: today,
      page_path: metrics1.aggregate.page_path,
      total_sessions: metrics1.aggregate.total_sessions,
      rage_clicks: metrics1.aggregate.rage_clicks,
      dead_clicks: metrics1.aggregate.dead_clicks,
      quick_backs: metrics1.aggregate.quick_backs,
      excessive_scrolling: metrics1.aggregate.excessive_scrolling,
    },
    ...metrics1.pages.map((p) => ({
      date: today,
      page_path: p.page_path,
      total_sessions: p.total_sessions,
      rage_clicks: p.rage_clicks,
      dead_clicks: p.dead_clicks,
      quick_backs: p.quick_backs,
      excessive_scrolling: p.excessive_scrolling,
    })),
  ];

  console.log(`Writing ${rowsToUpsert.length} metric records to Supabase for date ${today}...`);
  const inserted = await upsertToSupabase(rowsToUpsert);
  console.log('Successfully upserted rows into public.metrics_clarity_daily:', inserted.length);

  console.log('\n--- Telemetry Summary ---');
  console.log(`Date: ${today}`);
  console.log(`Total Sessions: ${metrics1.aggregate.total_sessions}`);
  console.log(`Rage Clicks: ${metrics1.aggregate.rage_clicks}`);
  console.log(`Dead Clicks: ${metrics1.aggregate.dead_clicks}`);
  console.log(`Quick Backs: ${metrics1.aggregate.quick_backs}`);
  console.log(`Excessive Scrolling: ${metrics1.aggregate.excessive_scrolling}`);

  console.log('\nTop Page Paths:');
  console.table(metrics1.pages.slice(0, 8));
}

main().catch((err) => {
  console.error('Execution failed:', err);
  process.exit(1);
});

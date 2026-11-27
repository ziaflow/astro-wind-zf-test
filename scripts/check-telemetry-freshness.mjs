import { pathToFileURL } from 'node:url';

const DAY = 86400000;

function checkTimestamp(failures, name, value, hours, now) {
  const age = now - Date.parse(value);
  if (!value || !Number.isFinite(age) || age < 0) failures.push(`${name}: freshness unknown`);
  else if (age > hours * 3600000) failures.push(`${name}: snapshot older than ${hours} hours`);
}

function checkDate(failures, name, value, now) {
  const date = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? Date.parse(`${value}T00:00:00Z`) : NaN;
  const today = Math.floor(now / DAY) * DAY;
  if (!Number.isFinite(date) || new Date(date).toISOString().slice(0, 10) !== value || date > today) {
    failures.push(`${name}: reporting date unknown`);
  } else if (today - date > 4 * DAY) {
    failures.push(`${name}: reporting date older than 4 days`);
  }
}

// Three days for finalized Google data, plus one day for the daily collector.
export function checkFreshness(clarity, gsc, ga4, now = Date.now()) {
  const failures = [];
  checkTimestamp(failures, 'Clarity', clarity?.finished_at, 18, now);
  checkTimestamp(failures, 'GSC', gsc?.captured_at, 48, now);
  checkDate(failures, 'GSC', gsc?.period_end, now);
  checkDate(failures, 'GA4', ga4?.date, now);
  return failures;
}

export function checkReceipt(failures, name, receipt, now) {
  if (!receipt) { failures.push(`${name}: receipt missing`); return; }
  if (!['success', 'empty', 'failed'].includes(receipt.status)) { failures.push(`${name}: invalid receipt`); return; }
  checkDate(failures, `${name} receipt`, receipt.reporting_date, now);
  if (receipt.status === 'failed') failures.push(`${name}: latest import failed`);
}

export async function run(env = process.env, fetcher = fetch, now = Date.now(), log = console.log) {
  const url = env.SUPABASE_URL || env.PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing server-side Supabase configuration');
  let base;
  try { base = new URL(url); } catch { throw new Error('Unexpected Supabase project URL'); }
  if (base.protocol !== 'https:' || base.hostname !== 'ruhnueopjedaywiqhpgi.supabase.co') {
    throw new Error('Unexpected Supabase project URL');
  }
  async function read(path) {
    let response;
    try {
      response = await fetcher(new URL(`/rest/v1/${path}`, base), {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(15000),
      });
    } catch { throw new Error('Snapshot read failed (network error)'); }
    if (!response.ok) throw new Error(`Snapshot read failed (HTTP ${response.status})`);
    let rows;
    try { rows = await response.json(); } catch { throw new Error('Invalid snapshot response'); }
    if (!Array.isArray(rows)) throw new Error('Invalid snapshot response');
    return rows[0];
  }
  const [clarity, gsc, ga4] = await Promise.all([
    read('clarity_sync_runs?select=finished_at&status=eq.success&order=finished_at.desc&limit=1'),
    read('analytics_source_snapshots?select=captured_at,period_start,period_end&source=eq.gsc&property=eq.sc-domain%3Aziaflow.com&grain=eq.period_aggregate&order=captured_at.desc&limit=1'),
    read('metrics_ga4_daily?select=date&order=date.desc&limit=1'),
  ]);
  let receipts;
  if (env.GOOGLE_METRICS_RECEIPTS_ENABLED === 'true') {
    if (!/^\d+$/.test(env.GA4_PROPERTY_ID || '')) throw new Error('Missing or invalid GA4 property configuration');
    receipts = await Promise.all([
      read(`google_metrics_receipts?select=reporting_date,status,rows_written&source=eq.ga4&property=eq.properties%2F${env.GA4_PROPERTY_ID}&order=reporting_date.desc,created_at.desc,id.desc&limit=1`),
      read('google_metrics_receipts?select=reporting_date,status,rows_written&source=eq.gsc&property=eq.sc-domain%3Aziaflow.com&order=reporting_date.desc,created_at.desc,id.desc&limit=1'),
    ]);
  }
  const effectiveGa4 = receipts?.[0]?.status === 'empty' && (!ga4?.date || receipts[0].reporting_date > ga4.date)
    ? { date: receipts[0].reporting_date } : ga4;
  const failures = checkFreshness(clarity, gsc, effectiveGa4, now);
  if (receipts) {
    checkReceipt(failures, 'GA4', receipts[0], now);
    checkReceipt(failures, 'GSC', receipts[1], now);
  }
  log(JSON.stringify({
    clarity_snapshot_at: clarity?.finished_at ?? null,
    gsc_captured_at: gsc?.captured_at ?? null,
    gsc_period_start: gsc?.period_start ?? null,
    gsc_period_end: gsc?.period_end ?? null,
    ga4_latest_date: ga4?.date ?? null,
    google_receipts: receipts ?? null,
    note: receipts ? 'Empty reports do not establish zero traffic or remove existing rows.' : 'A missing GA4 date may be an empty report; daily collector receipts are only in logs.',
    failures,
  }));
  if (failures.length) throw new Error('Canonical telemetry freshness check failed');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const fs = await import('node:fs');
    const dotenv = await import('dotenv');
    if (fs.existsSync('.env')) dotenv.config({ path: '.env' });
    if (fs.existsSync('.env.local')) dotenv.config({ path: '.env.local', override: true });
  } catch {
    // dotenv is optional in CI.
  }
  run().catch((error) => {
    console.error(
      error.message.startsWith('Snapshot read failed') ||
        error.message.startsWith('Invalid snapshot') ||
        error.message.startsWith('Missing ') ||
        error.message.startsWith('Unexpected ') ||
        error.message.startsWith('Canonical ')
        ? error.message
        : 'Telemetry check failed; inspect configuration and connectivity.'
    );
    process.exitCode = 1;
  });
}

import { pathToFileURL } from 'node:url';

export function checkFreshness(clarity, gsc, now = Date.now()) {
  const failures = [];
  for (const [name, row, field, hours] of [
    ['Clarity', clarity, 'finished_at', 6],
    ['GSC', gsc, 'captured_at', 48],
  ]) {
    const timestamp = row?.[field];
    const age = now - Date.parse(timestamp);
    if (!timestamp || !Number.isFinite(age) || age < 0) failures.push(`${name}: freshness unknown`);
    else if (age > hours * 3600000) failures.push(`${name}: snapshot older than ${hours} hours`);
  }
  return failures;
}

export async function run(env = process.env, fetcher = fetch) {
  const url = env.SUPABASE_URL || env.PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing server-side Supabase configuration');
  const base = new URL(url);
  if (base.protocol !== 'https:' || base.hostname !== 'ruhnueopjedaywiqhpgi.supabase.co') {
    throw new Error('Unexpected Supabase project URL');
  }
  async function read(path) {
    const response = await fetcher(new URL(`/rest/v1/${path}`, base), {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`Snapshot read failed (HTTP ${response.status})`);
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error('Invalid snapshot response');
    return rows[0];
  }
  const [clarity, gsc] = await Promise.all([
    read('clarity_sync_runs?select=finished_at&status=eq.success&order=finished_at.desc&limit=1'),
    read(
      'analytics_source_snapshots?select=captured_at,period_start,period_end&source=eq.gsc&property=eq.sc-domain%3Aziaflow.com&grain=eq.period_aggregate&order=captured_at.desc&limit=1'
    ),
  ]);
  const failures = checkFreshness(clarity, gsc);
  console.log(
    JSON.stringify({
      clarity_snapshot_at: clarity?.finished_at ?? null,
      gsc_captured_at: gsc?.captured_at ?? null,
      gsc_period_start: gsc?.period_start ?? null,
      gsc_period_end: gsc?.period_end ?? null,
      note: 'GSC freshness uses capture time; finalized reporting has an approximately three-day delay.',
      failures,
    })
  );
  if (failures.length) throw new Error('Canonical telemetry freshness check failed');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch((error) => {
    // Never print response bodies, credentials, or raw network errors.
    console.error(
      error.message.startsWith('Snapshot read failed') ||
        error.message.startsWith('Missing ') ||
        error.message.startsWith('Unexpected ') ||
        error.message.startsWith('Canonical ')
        ? error.message
        : 'Telemetry check failed; inspect configuration and connectivity.'
    );
    process.exitCode = 1;
  });
}

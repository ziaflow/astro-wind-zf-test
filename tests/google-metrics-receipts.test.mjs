import test from 'node:test';
import assert from 'node:assert/strict';
import { run, writeReceipt } from '../scripts/sync-google-metrics.mjs';
import { checkReceipt, run as checkFreshness } from '../scripts/check-telemetry-freshness.mjs';

const now = Date.parse('2026-10-24T15:00:00Z');
const env = { SUPABASE_URL: 'https://ruhnueopjedaywiqhpgi.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'synthetic-secret', GOOGLE_CLIENT_ID: 'client', GOOGLE_CLIENT_SECRET: 'secret', GOOGLE_REFRESH_TOKEN: 'refresh', GA4_PROPERTY_ID: '123', SYNC_START_DATE: '2026-10-20', SYNC_END_DATE: '2026-10-20', GOOGLE_METRICS_RECEIPTS_ENABLED: 'true' };
const json = (value) => new Response(JSON.stringify(value));

test('empty imports are persisted without metrics rows and failures remain distinct', async () => {
  const receipts = [], logs = [];
  await assert.rejects(run(env, async (url, options) => {
    if (url.includes('oauth2')) return json({ access_token: 'test' });
    if (url.includes('analyticsdata')) return new Response('private', { status: 403 });
    if (url.includes('webmasters')) return json({ rows: [] });
    if (url.includes('google_metrics_receipts')) { receipts.push(JSON.parse(options.body)); return new Response(null, { status: 201 }); }
    assert.fail('empty reports must not write metric rows');
  }, line => logs.push(line)), /sync failed/);
  assert.deepEqual(receipts.map(({ source, status, rows_written }) => [source, status, rows_written]), [['ga4', 'failed', null], ['gsc', 'empty', 0]]);
  assert.ok(!logs.join('').includes('private'));
});

test('successful imports record counts only after metric writes', async () => {
  const calls = [];
  await run(env, async (url, options) => {
    if (url.includes('oauth2')) return json({ access_token: 'test' });
    if (url.includes('analyticsdata')) return json({ rowCount: 1, rows: [{ dimensionValues: [{ value: '/' }], metricValues: ['4', '5', '1', '0.2', '80'].map(value => ({ value })) }] });
    if (url.includes('webmasters')) return json({ rows: [] });
    calls.push({ url, body: JSON.parse(options.body) });
    return new Response(null, { status: 201 });
  }, () => {});
  assert.match(calls[0].url, /metrics_ga4_daily/);
  assert.deepEqual([calls[1].body.status, calls[1].body.rows_written], ['success', 1]);
  assert.deepEqual([calls[2].body.status, calls[2].body.rows_written], ['empty', 0]);
});

test('missing, failed and delayed receipts are distinguished', () => {
  const check = receipt => { const failures = []; checkReceipt(failures, 'GA4', receipt, now); return failures; };
  assert.deepEqual(check(undefined), ['GA4: receipt missing']);
  assert.deepEqual(check({ status: 'failed', reporting_date: '2026-10-21' }), ['GA4: latest import failed']);
  assert.deepEqual(check({ status: 'empty', reporting_date: '2026-10-20' }), []);
  assert.deepEqual(check({ status: 'success', reporting_date: '2026-10-19' }), ['GA4 receipt: reporting date older than 4 days']);
});

test('replaying the same receipt uses conflict-ignore and keeps one record', async () => {
  const stored = new Map();
  const fetcher = async (url, options) => {
    assert.match(url, /on_conflict=id$/);
    assert.match(options.headers.Prefer, /ignore-duplicates/);
    const record = JSON.parse(options.body);
    if (!stored.has(record.id)) stored.set(record.id, record);
    return new Response(null, { status: 201 });
  };
  const receipt = { id: 'a', source: 'ga4', reporting_date: '2026-10-20', status: 'empty', rows_written: 0 };
  await writeReceipt(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, receipt, fetcher);
  await writeReceipt(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, receipt, fetcher);
  assert.equal(stored.size, 1);
});

test('receipt write failure fails the job without leaking provider responses', async () => {
  const logs = [];
  await assert.rejects(run(env, async url => {
    if (url.includes('oauth2')) return json({ access_token: 'test' });
    if (url.includes('analyticsdata') || url.includes('webmasters')) return json({ rows: [] });
    return new Response('synthetic-secret', { status: 403 });
  }, line => logs.push(line)), /sync failed/);
  assert.ok(!logs.join('').includes('synthetic-secret'));
});

test('fresh confirmed empty GA4 can establish coverage while a missing receipt fails', async () => {
  let missing = false;
  const fetcher = async url => {
    if (url.pathname.endsWith('clarity_sync_runs')) return json([{ finished_at: '2026-10-24T02:00:00Z' }]);
    if (url.pathname.endsWith('analytics_source_snapshots')) return json([{ captured_at: '2026-10-24T14:00:00Z', period_end: '2026-10-21' }]);
    if (url.pathname.endsWith('metrics_ga4_daily')) return json([]);
    if (url.search.includes('source=eq.ga4') && missing) return json([]);
    return json([{ reporting_date: '2026-10-20', status: 'empty', rows_written: 0 }]);
  };
  await checkFreshness(env, fetcher, now, () => {});
  missing = true;
  const logs = [];
  await assert.rejects(checkFreshness(env, fetcher, now, line => logs.push(line)), /freshness check failed/);
  assert.match(logs[0], /GA4: receipt missing/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { checkFreshness, run } from '../scripts/check-telemetry-freshness.mjs';

const now = Date.parse('2026-10-24T15:00:00Z');
const clarity = { finished_at: '2026-10-24T02:00:00Z' };
const gsc = { captured_at: '2026-10-24T14:00:00Z', period_end: '2026-10-21' };
const ga4 = { date: '2026-10-21' };
const env = { SUPABASE_URL: 'https://ruhnueopjedaywiqhpgi.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'synthetic-secret' };

test('12-hour Clarity schedule passes with a grace period and overdue fails', () => {
  assert.deepEqual(checkFreshness(clarity, gsc, ga4, now), []);
  assert.deepEqual(checkFreshness({ finished_at: '2026-10-23T20:59:59Z' }, gsc, ga4, now), ['Clarity: snapshot older than 18 hours']);
});

test('GA4 reporting coverage is independent and missing and stale dates fail', () => {
  assert.deepEqual(checkFreshness(clarity, gsc, ga4, now), []);
  assert.deepEqual(checkFreshness(clarity, gsc, undefined, now), ['GA4: reporting date unknown']);
  assert.deepEqual(checkFreshness(clarity, gsc, { date: '2026-10-19' }, now), ['GA4: reporting date older than 4 days']);
});

test('GSC needs both a fresh capture and a recent finalized reporting period', () => {
  assert.deepEqual(checkFreshness(clarity, { ...gsc, period_end: '2026-10-19' }, ga4, now), ['GSC: reporting date older than 4 days']);
  assert.deepEqual(checkFreshness(clarity, { ...gsc, captured_at: '2026-10-22T14:59:59Z' }, ga4, now), ['GSC: snapshot older than 48 hours']);
  assert.deepEqual(checkFreshness(clarity, { ...gsc, period_end: '2026-10-20' }, { date: '2026-10-20' }, now), []);
});

test('invalid and future dates cannot pass as fresh', () => {
  for (const value of [undefined, 'bad', '2026-02-30', '2026-10-25']) {
    assert.deepEqual(checkFreshness(clarity, gsc, { date: value }, now), ['GA4: reporting date unknown']);
  }
  assert.deepEqual(checkFreshness({ finished_at: '2026-10-25T00:00:00Z' }, gsc, ga4, now), ['Clarity: freshness unknown']);
});

test('reads only the three narrow projections and does not log credentials', async () => {
  const calls = [], logs = [];
  await run(env, async (url) => {
    calls.push(url);
    return { ok: true, json: async () => [url.pathname.endsWith('clarity_sync_runs') ? clarity : url.pathname.endsWith('analytics_source_snapshots') ? gsc : ga4] };
  }, now, (line) => logs.push(line));
  assert.equal(calls.length, 3);
  assert.ok(calls.every((url) => url.hostname === 'ruhnueopjedaywiqhpgi.supabase.co' && !url.search.includes('payload')));
  assert.ok(!logs.join('').includes(env.SUPABASE_SERVICE_ROLE_KEY));
});

test('missing rows are unknown rather than fabricated empty data', async () => {
  const logs = [];
  await assert.rejects(run(env, async (url) => ({ ok: true, json: async () => url.pathname.endsWith('metrics_ga4_daily') ? [] : [url.pathname.endsWith('clarity_sync_runs') ? clarity : gsc] }), now, (line) => logs.push(line)), /freshness check failed/);
  assert.match(logs[0], /GA4: reporting date unknown/);
  assert.match(logs[0], /empty report/);
});

test('API errors and missing configuration are reported safely', async () => {
  await assert.rejects(run({}, () => assert.fail('must not fetch'), now), /Missing server-side Supabase configuration/);
  await assert.rejects(run({ ...env, SUPABASE_URL: 'https://other.supabase.co' }, () => assert.fail('must not fetch'), now), /Unexpected Supabase project URL/);
  await assert.rejects(run(env, async () => ({ ok: false, status: 403 }), now), /Snapshot read failed \(HTTP 403\)/);
  await assert.rejects(run(env, async () => { throw new Error('synthetic-secret'); }, now), (error) => error.message === 'Snapshot read failed (network error)');
});

test('collector evidence distinguishes confirmed empty results from unknown warehouse coverage', async () => {
  const { run: collectGoogle } = await import('../scripts/sync-google-metrics.mjs');
  const logs = [];
  const googleEnv = { ...env, GOOGLE_CLIENT_ID: 'test', GOOGLE_CLIENT_SECRET: 'test', GOOGLE_REFRESH_TOKEN: 'test', GA4_PROPERTY_ID: '379015221', SYNC_START_DATE: '2026-10-21', SYNC_END_DATE: '2026-10-21' };
  await collectGoogle(googleEnv, async (url) => {
    if (url.includes('oauth2')) return new Response(JSON.stringify({ access_token: 'synthetic' }));
    if (url.includes('analyticsdata') || url.includes('webmasters')) return new Response(JSON.stringify({ rows: [] }));
    assert.fail('empty reports must not produce warehouse writes');
  }, (line) => logs.push(JSON.parse(line)));
  assert.deepEqual(logs.map(({ source, date, status, rows_written }) => ({ source, date, status, rows_written })), [
    { source: 'ga4', date: '2026-10-21', status: 'empty', rows_written: 0 },
    { source: 'gsc', date: '2026-10-21', status: 'empty', rows_written: 0 },
  ]);
  assert.deepEqual(checkFreshness(clarity, gsc, undefined, now), ['GA4: reporting date unknown']);
});

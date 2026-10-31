import test from 'node:test';
import assert from 'node:assert/strict';
import { checkFreshness, run } from '../scripts/check-telemetry-freshness.mjs';
const now = Date.parse('2026-10-24T15:00:00Z');
const clarity = { finished_at: '2026-10-24T14:41:00Z' };
const gsc = { captured_at: '2026-10-24T14:00:00Z', period_end: '2026-10-21' };
test('finalized GSC delay does not count as snapshot staleness', () => {
  assert.deepEqual(checkFreshness(clarity, gsc, now), []);
});
test('Clarity six-hour and GSC 48-hour thresholds are independent', () => {
  assert.deepEqual(checkFreshness({ finished_at: '2026-10-24T08:59:59Z' }, gsc, now), [
    'Clarity: snapshot older than 6 hours',
  ]);
  assert.deepEqual(checkFreshness(clarity, { captured_at: '2026-10-22T14:59:59Z' }, now), [
    'GSC: snapshot older than 48 hours',
  ]);
});
test('missing, invalid, and future timestamps remain unknown', () => {
  for (const value of [undefined, 'bad', '2026-10-25T00:00:00Z']) {
    assert.deepEqual(checkFreshness({ finished_at: value }, gsc, now), ['Clarity: freshness unknown']);
  }
});
test('reads only two canonical Supabase projections and never exports provider data', async () => {
  const calls = [];
  await run(
    { SUPABASE_URL: 'https://ruhnueopjedaywiqhpgi.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'test-only' },
    async (url) => {
      calls.push(url);
      return {
        ok: true,
        json: async () => [
          url.pathname.endsWith('clarity_sync_runs')
            ? { finished_at: new Date().toISOString() }
            : { captured_at: new Date().toISOString() },
        ],
      };
    }
  );
  assert.equal(calls.length, 2);
  assert.ok(calls.every((url) => url.hostname === 'ruhnueopjedaywiqhpgi.supabase.co'));
  assert.ok(calls.every((url) => !url.search.includes('payload')));
});
test('rejects another project before any request', async () => {
  await assert.rejects(
    run({ SUPABASE_URL: 'https://other.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'test-only' }, () =>
      assert.fail('must not fetch')
    ),
    /Unexpected/
  );
});

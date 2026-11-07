import test from 'node:test';
import assert from 'node:assert/strict';
import { run } from '../scripts/sync-customerio-metrics.mjs';

const env = {
  SUPABASE_URL: 'https://ruhnueopjedaywiqhpgi.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'private-key',
  CUSTOMERIO_APP_API_KEY: 'cio-key',
  CUSTOMERIO_CAMPAIGN_ID: '4',
  SYNC_START_DATE: '2026-11-01',
  SYNC_END_DATE: '2026-11-02',
};

const json = (data) => new Response(JSON.stringify(data));

test('maps Customer.io series to metrics_customerio_daily with on_conflict merge', async () => {
  const writes = [];
  const fetcher = async (url, options) => {
    if (url.includes('customer.io')) {
      return json({
        metric: [
          {
            date: Math.floor(new Date('2026-11-01T00:00:00Z').getTime() / 1000),
            sent: 10,
            delivered: 10,
            opened: 5,
            clicked: 2,
            unsubscribed: 0,
            spammed: 0,
          },
          {
            date: Math.floor(new Date('2026-11-02T00:00:00Z').getTime() / 1000),
            sent: 8,
            delivered: 8,
            opened: 4,
            clicked: 1,
            unsubscribed: 0,
            spammed: 0,
          },
        ],
      });
    }
    writes.push({ url, options, body: JSON.parse(options.body) });
    return new Response(null, { status: 204 });
  };

  const logs = [];
  await run(env, fetcher, (msg) => logs.push(msg));

  assert.equal(writes.length, 1);
  assert.match(writes[0].url, /on_conflict=date,campaign_id$/);
  assert.equal(writes[0].options.headers.Prefer, 'resolution=merge-duplicates,return=minimal');
  assert.equal(writes[0].body.length, 2);
  assert.equal(writes[0].body[0].sent, 10);
  assert.equal(writes[0].body[0].campaign_id, '4');
  assert.equal(writes[0].body[1].sent, 8);
  assert.match(logs[0], /"status":"success"/);
});

test('missing credentials reject before network call', async () => {
  const fetcher = () => assert.fail('should not reach network');
  await assert.rejects(run({}, fetcher), /Missing/);
  await assert.rejects(run({ ...env, SUPABASE_URL: 'https://evil.supabase.co' }, fetcher), /Unexpected/);
  await assert.rejects(run({ ...env, CUSTOMERIO_CAMPAIGN_ID: 'invalid' }, fetcher), /Invalid numeric/);
});

test('negative counts or invalid dates reject cleanly', async () => {
  const fetcher = async (url) => {
    if (url.includes('customer.io')) {
      return json({
        metric: [
          {
            date: Math.floor(new Date('2026-11-01T00:00:00Z').getTime() / 1000),
            sent: -1,
            delivered: 0,
          },
        ],
      });
    }
    assert.fail('should not write invalid metric');
  };

  await assert.rejects(
    run(env, fetcher, () => {}),
    /negative or invalid/
  );
});

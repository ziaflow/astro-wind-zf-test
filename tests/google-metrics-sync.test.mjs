import test from 'node:test';
import assert from 'node:assert/strict';
import { run } from '../scripts/sync-google-metrics.mjs';
const env = {
  SUPABASE_URL: 'https://ruhnueopjedaywiqhpgi.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'private',
  GOOGLE_CLIENT_ID: 'client',
  GOOGLE_CLIENT_SECRET: 'secret',
  GOOGLE_REFRESH_TOKEN: 'refresh',
  GA4_PROPERTY_ID: '123',
  SYNC_START_DATE: '2026-10-17',
  SYNC_END_DATE: '2026-10-17',
};
const json = (data) => new Response(JSON.stringify(data));
test('real provider rows map to existing unique keys and reruns use merge upserts', async () => {
  const writes = [];
  const fetcher = async (url, options) => {
    if (url.includes('oauth2')) return json({ access_token: 'token' });
    if (url.includes('analyticsdata'))
      return json({
        rowCount: 1,
        rows: [
          { dimensionValues: [{ value: '/' }], metricValues: ['4', '5', '1', '0.2', '80'].map((value) => ({ value })) },
        ],
      });
    if (url.includes('webmasters'))
      return json({
        rows: [{ keys: ['https://ziaflow.com/?q=a', 'query'], clicks: 1, impressions: 10, ctr: 0.1, position: 2 }],
      });
    writes.push({ url, options, body: JSON.parse(options.body) });
    return new Response(null, { status: 204 });
  };
  await run(env, fetcher, () => {});
  await run(env, fetcher, () => {});
  assert.equal(writes.length, 4);
  assert.deepEqual(writes[0].body, writes[2].body);
  assert.equal(writes[0].body[0].avg_engagement_time_sec, 20);
  assert.equal(writes[1].body[0].page_path, '/?q=a');
  assert.match(writes[0].url, /on_conflict=date,page_path$/);
  assert.match(writes[1].url, /on_conflict=date,page_path,query$/);
  assert.equal(writes[0].options.headers.Prefer, 'resolution=merge-duplicates,return=minimal');
  assert.ok(writes.every((w) => !w.url.includes('snapshots')));
});
test('provider failure is redacted, independent source still runs, job fails', async () => {
  const logs = [];
  let gscRead = false;
  await assert.rejects(
    run(
      env,
      async (url) => {
        if (url.includes('oauth2')) return json({ access_token: 'token' });
        if (url.includes('analyticsdata')) return new Response('sensitive body', { status: 403 });
        gscRead = true;
        return json({ rows: [] });
      },
      (line) => logs.push(line)
    ),
    /sync failed/
  );
  assert.ok(gscRead);
  assert.match(logs[0], /HTTP 403/);
  assert.ok(!logs.join('').includes('sensitive'));
  assert.match(logs[1], /empty/);
});
test('missing credentials and invalid date fail before network', async () => {
  const fetcher = () => assert.fail('network must not run');
  await assert.rejects(run({}, fetcher), /Missing/);
  await assert.rejects(run({ ...env, SYNC_START_DATE: '2026-02-30' }, fetcher), /Invalid/);
});
test('thresholded GA4 reports never write misleading daily values', async () => {
  await assert.rejects(
    run(
      env,
      async (url) => {
        if (url.includes('oauth2')) return json({ access_token: 'token' });
        if (url.includes('analyticsdata')) return json({ metadata: { subjectToThresholding: true } });
        if (url.includes('webmasters')) return json({ rows: [] });
        assert.fail('no writes');
      },
      () => {}
    ),
    /sync failed/
  );
});

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const source = readFileSync(new URL('../supabase/functions/clarity-sync/index.js', import.meta.url), 'utf8');
const parse = runInNewContext(
  source.replace('export function parseMetrics', 'function parseMetrics') + '\nparseMetrics;',
  {
    Deno: { env: { get: () => '' }, serve: () => {} },
    URL,
  }
);
const captured = '2026-10-22T23:36:46.000Z';

test('numeric strings and actual QuickbackClick metric map correctly', () => {
  const rows = parse(
    [
      { metricName: 'Traffic', information: [{ Url: 'https://ziaflow.com/contact', totalSessionCount: '12' }] },
      { metricName: 'QuickbackClick', information: [{ Url: 'https://ziaflow.com/contact', subTotal: '3' }] },
      { metricName: 'DeadClickCount', information: [{ Url: 'https://ziaflow.com/contact', subTotal: '2' }] },
    ],
    captured
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].total_sessions, 12);
  assert.equal(rows[0].quick_backs, 3);
  assert.equal(rows[0].dead_clicks, 2);
  assert.equal(rows[0].created_at, captured);
});

test('URL groups remain separate and external preview hosts are excluded', () => {
  const rows = parse(
    [
      {
        metricName: 'Traffic',
        information: [
          { Url: 'https://ziaflow.com/?campaign=a', totalSessionCount: '2' },
          { Url: 'https://ziaflow.com/?campaign=b', totalSessionCount: '3' },
          { Url: 'https://preview.example.com/', totalSessionCount: '100' },
        ],
      },
    ],
    captured
  );
  assert.equal(rows.length, 2);
  assert.equal(
    rows.some((r) => r.page_path === '*'),
    false
  );
  assert.equal(rows[0].page_path, '/?campaign=a');
});

test('invalid payloads and negative metrics fail instead of writing false zeroes', () => {
  assert.throws(() => parse({}, captured), /INVALID_PAYLOAD/);
  assert.throws(() => parse([], captured), /MISSING_TRAFFIC/);
  assert.throws(
    () =>
      parse(
        [{ metricName: 'Traffic', information: [{ Url: 'https://ziaflow.com/', totalSessionCount: '-1' }] }],
        captured
      ),
    /INVALID_METRIC/
  );
});

test('a valid empty Traffic snapshot remains empty', () => {
  assert.equal(parse([{ metricName: 'Traffic', information: [] }], captured).length, 0);
});

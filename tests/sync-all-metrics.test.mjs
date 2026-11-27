import assert from 'node:assert/strict';
import test from 'node:test';
import { parseBingDate, parseUrlPath } from '../scripts/sync-all-metrics.mjs';

test('parseBingDate parses Bing /Date(ms)/ and ISO timestamps', () => {
  assert.equal(parseBingDate('/Date(1762905600000-0800)/'), '2025-11-12');
  assert.equal(parseBingDate('2026-11-12T12:00:00Z'), '2026-11-12');
});

test('parseUrlPath normalizes full URLs and relative paths', () => {
  assert.equal(parseUrlPath('https://ziaflow.com/services/seo?utm=1'), '/services/seo?utm=1');
  assert.equal(parseUrlPath('/contact'), '/contact');
  assert.equal(parseUrlPath('services/ppc'), '/services/ppc');
});

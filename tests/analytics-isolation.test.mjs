import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const source = readFileSync(new URL('../src/components/common/Analytics.astro', import.meta.url), 'utf8');
const script = source.match(/<script is:inline define:vars=\{\{ gaId \}\}>([\s\S]*?)<\/script>/)[1];

function run(hostname, search = '', internalUser = false, storageBlocked = false) {
  const window = { location: { hostname, search } };
  Object.defineProperty(window, 'localStorage', {
    get() {
      if (storageBlocked) throw new Error('Storage disabled');
      return { getItem: () => (internalUser ? '1' : null) };
    },
  });
  vm.runInNewContext(script, { window, URLSearchParams, gaId: 'G-TEST' });
  return window;
}

for (const host of ['localhost', '127.0.0.1', 'preview.vercel.app', 'ziaflow.com.example.org']) {
  for (const search of ['', '?debug_analytics=1']) {
    test(`tracking stays disabled on ${host}${search}`, () => {
      const window = run(host, search);
      assert.equal(window.__zfIsProdHost, false);
      assert.equal(window.gtag, undefined);
      assert.equal(window.dataLayer, undefined);
    });
  }
}

for (const host of ['ziaflow.com', 'www.ziaflow.com']) {
  test(`normal production visit initializes GA on ${host}`, () => {
    const window = run(host);
    assert.equal(window.__zfIsProdHost, true);
    assert.equal(window.dataLayer.length, 2);
    assert.equal(window.dataLayer[1][0], 'config');
    assert.equal(window.dataLayer[1][1], 'G-TEST');
  });
  for (const search of [
    '?utm_source=internal-qa',
    '?utm_medium=verification',
    '?internal_qa=1',
    '?internal_qa=1&debug_analytics=1',
  ]) {
    test(`QA visit stays excluded on ${host}${search}`, () => {
      const window = run(host, search);
      assert.equal(window.__zfIsProdHost, false);
      assert.equal(window.gtag, undefined);
    });
  }
}

test('saved internal-user exclusion stays disabled', () => {
  assert.equal(run('ziaflow.com', '', true).__zfIsProdHost, false);
});

test('blocked browser storage does not prevent URL-based QA exclusion', () => {
  assert.equal(run('ziaflow.com', '?internal_qa=1', false, true).__zfIsProdHost, false);
  assert.equal(run('localhost', '?debug_analytics=1', false, true).__zfIsProdHost, false);
  assert.equal(run('ziaflow.com', '', false, true).__zfIsProdHost, true);
});

test('no-JavaScript fallback cannot bypass host and QA exclusions', () => {
  const body = readFileSync(new URL('../src/components/common/AnalyticsBody.astro', import.meta.url), 'utf8');
  assert.equal(body.includes('googletagmanager.com/ns.html'), false);
});

for (const [host, search, expected] of [
  ['localhost', '?debug_analytics=1', 0],
  ['preview.vercel.app', '', 0],
  ['ziaflow.com', '?internal_qa=1', 0],
  ['ziaflow.com', '', 2],
]) {
  test(`vendor scripts respect exclusions on ${host}${search}`, () => {
    const window = run(host, search);
    const requests = [];
    const document = {
      createElement: () => ({}),
      getElementsByTagName: () => [{ parentNode: { insertBefore: (element) => requests.push(element.src) } }],
      head: { appendChild: (element) => requests.push(element.src) },
    };
    const scripts = [
      ...source.matchAll(/<script is:inline define:vars=\{\{ (?:gaId|gtmId) \}\}>([\s\S]*?)<\/script>/g),
    ];
    for (const match of scripts.slice(1)) {
      vm.runInNewContext(match[1], { window, document, gaId: 'G-TEST', gtmId: 'GTM-TEST' });
    }
    assert.equal(requests.length, expected);
    if (expected) {
      assert.ok(requests.some((url) => url.includes('gtag/js?id=G-TEST')));
      assert.ok(requests.some((url) => url.includes('gtm.js?id=GTM-TEST')));
    }
  });
}

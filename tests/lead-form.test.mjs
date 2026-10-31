import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

function fixture(fetchImpl) {
  let submit,
    nextId = 0;
  const fields = { email: 'qa@example.com', name: 'Internal QA', message: 'QA request' };
  const classes = () => ({ add() {}, remove() {} });
  const status = { classList: classes(), textContent: '' };
  const button = { disabled: false };
  const form = {
    dataset: {},
    parentElement: { querySelector: () => null },
    classList: classes(),
    querySelectorAll: () => [button],
    querySelector: () => status,
    setAttribute() {},
    removeAttribute() {},
    reset() {},
    addEventListener: (_event, callback) => {
      submit = callback;
    },
  };
  const window = {
    location: { pathname: '/audit', origin: 'https://ziaflow.com', search: '?utm_source=qa&utm_campaign=form-test' },
  };
  const module = { exports: {} };
  const compiled = ts.transpileModule(readFileSync(new URL('../src/utils/lead-form.ts', import.meta.url), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  runInNewContext(compiled, {
    module,
    exports: module.exports,
    window,
    document: { querySelectorAll: () => [form] },
    URLSearchParams,
    crypto: { randomUUID: () => `attempt-${++nextId}` },
    fetch: fetchImpl,
    FormData: class {
      entries() {
        return Object.entries(fields);
      }
    },
  });
  module.exports.bindLeadForms();
  return { button, status, window, fields, submit: () => submit({ preventDefault() {} }) };
}
test('a slow response locks the button and concurrent clicks issue one request', async () => {
  let release,
    calls = 0;
  const app = fixture(() => {
    calls++;
    return new Promise((resolve) => {
      release = resolve;
    });
  });
  const first = app.submit();
  assert.equal(app.button.disabled, true);
  await app.submit();
  assert.equal(calls, 1);
  release(Response.json({ submission_id: 'receipt-1' }));
  await first;
  assert.equal(app.button.disabled, false);
  assert.equal(app.window.dataLayer.length, 1);
});
test('lost-response retry reuses the key; attribution is sent without PII in analytics', async () => {
  const bodies = [];
  const app = fixture(async (_url, options) => {
    bodies.push(JSON.parse(options.body));
    if (bodies.length === 1) throw new Error('network failure');
    return Response.json({ submission_id: 'receipt-1', duplicate: true });
  });
  await app.submit();
  assert.equal(app.button.disabled, false);
  await app.submit();
  assert.equal(bodies[0].idempotency_key, bodies[1].idempotency_key);
  assert.equal(bodies[0].page, '/audit');
  assert.equal(bodies[0].utm_campaign, 'form-test');
  assert.equal(app.window.dataLayer, undefined);
});
test('failed persistence does not count as conversion and preserves a useful error', async () => {
  const app = fixture(async () => Response.json({ message: 'Please try again' }, { status: 503 }));
  await app.submit();
  assert.equal(app.window.dataLayer, undefined);
  assert.equal(app.status.textContent, 'Please try again');
  assert.equal(app.button.disabled, false);
});
test('honeypot acknowledgments do not count as conversions', async () => {
  const app = fixture(async () => Response.json({ message: 'Thanks' }));
  await app.submit();
  assert.equal(app.window.dataLayer, undefined);
});
test('accepted-lead analytics exclude email and message content', async () => {
  const app = fixture(async () => Response.json({ submission_id: 'receipt-1', duplicate: false }));
  await app.submit();
  const event = app.window.dataLayer[0];
  assert.equal(event.event, 'generate_lead');
  assert.equal(event.page_path, '/audit');
  assert.equal(event.email, undefined);
  assert.equal(event.message, undefined);
});

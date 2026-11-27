import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import crypto from 'node:crypto';
import test from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../src/pages/api/webhooks/customerio.ts', import.meta.url), 'utf8');
function setup(env = {}) {
  const writes = [];
  const mod = { exports: {} };
  const compiled = ts.transpileModule(source.replaceAll('import.meta.env', 'testEnv'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  runInNewContext(compiled, {
    module: mod,
    exports: mod.exports,
    testEnv: env,
    Response,
    Buffer,
    console,
    require(name) {
      if (name === 'node:crypto') return crypto;
      if (name === '~/lib/supabase-admin')
        return {
          supabaseAdmin: {
            from: () => ({
              upsert: async (rows) => {
                writes.push(rows);
                return { error: null };
              },
            }),
          },
        };
      throw Error(name);
    },
  });
  return {
    writes,
    post: (headers = {}, body = '[{"event_id":"test","timestamp":1700000000}]') =>
      mod.exports.POST({ request: new Request('https://test.invalid', { method: 'POST', headers, body }) }),
  };
}

test('missing authentication configuration fails closed before JSON parsing or writes', async () => {
  const h = setup();
  assert.equal((await h.post({}, 'invalid JSON')).status, 503);
  assert.equal((await h.post({ authorization: 'Bearer arbitrary', 'x-cio-signature': 'arbitrary' })).status, 503);
  assert.equal(h.writes.length, 0);
});

for (const key of ['CIO_WEBHOOK_SIGNING_KEY', 'CUSTOMER_IO_WEBHOOK_SIGNING_KEY']) {
  test(`${key}: accepts exact signed bytes and rejects unsigned, altered, expired and invalid timestamps`, async () => {
    const h = setup({ [key]: 'test-key', CUSTOMER_IO_WEBHOOK_SECRET: 'legacy' });
    const body = '[{"event_id":"signed","timestamp":1700000000}]';
    const sign = (timestamp, payload = body) => ({
      'x-cio-timestamp': timestamp,
      'x-cio-signature': crypto.createHmac('sha256', 'test-key').update(`v0:${timestamp}:${payload}`).digest('hex'),
    });
    const now = String(Math.floor(Date.now() / 1000));
    assert.equal((await h.post(sign(now), body)).status, 200);
    for (const [headers, payload] of [
      [{}, body],
      [{ authorization: 'Bearer legacy' }, body],
      [sign(now), body + ' '],
      [sign('1'), body],
      [sign('NaN'), body],
      [sign('Infinity'), body],
      [sign(String(Number(now) + 600)), body],
    ]) {
      assert.equal((await h.post(headers, payload)).status, 401);
    }
    assert.equal(h.writes.length, 1);
  });
}

test('configured legacy secret requires matching credentials', async () => {
  const h = setup({ CUSTOMER_IO_WEBHOOK_SECRET: 'test-legacy' });
  assert.equal((await h.post()).status, 401);
  assert.equal((await h.post({ authorization: 'Bearer wrong' })).status, 401);
  assert.equal((await h.post({ authorization: 'Bearer test-legacy' })).status, 200);
  assert.equal((await h.post({ 'x-cio-webhook-secret': 'test-legacy' })).status, 200);
  assert.equal(h.writes.length, 2);
});

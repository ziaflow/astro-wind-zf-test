import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/lib/intake-delivery.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const mod = { exports: {} };
runInNewContext(compiled, { module: mod, exports: mod.exports, require: createRequire(import.meta.url), Date, URL });
const { deliverWithReceipt, pipelineBatch } = mod.exports;

function storeFor(initial) {
  let current = initial;
  return {
    read: async () => current,
    replace: async (previous, next) => {
      if (current !== previous) return false;
      current = next;
      return true;
    },
    snapshot: () => current,
  };
}
const receipt = (status) => ({ deliveries: { pipeline: { status } } });

test('pipeline identifies the submitter before the canonical event using stable IDs', () => {
  const result = pipelineBatch('receipt-1', { email: 'test@example.invalid', name: 'Test Person', extra: {} }, '2026-01-01T00:00:00Z');
  assert.equal(result.batch.length, 2);
  assert.equal(result.batch[0].type, 'identify');
  assert.equal(result.batch[0].userId, 'test@example.invalid');
  assert.equal(result.batch[0].messageId, 'intake:receipt-1:identify');
  assert.equal(result.batch[1].type, 'track');
  assert.equal(result.batch[1].userId, result.batch[0].userId);
  assert.equal(result.batch[1].event, 'form_submit');
  assert.equal(result.batch[1].messageId, 'intake:receipt-1:form_submit');
});

test('accepted dispatch is journaled and a replay does not send twice', async () => {
  const store = storeFor(receipt('pending'));
  let calls = 0;
  const send = async () => { calls++; return new Response(null, { status: 200 }); };
  assert.equal(await deliverWithReceipt(store, 'pipeline', send), 'accepted');
  assert.equal(store.snapshot().deliveries.pipeline.http_status, 200);
  assert.equal(await deliverWithReceipt(store, 'pipeline', send), 'accepted');
  assert.equal(calls, 1);
});

test('explicit rejection is retryable while ambiguous failure is held', async () => {
  const failed = storeFor(receipt('pending'));
  assert.equal(await deliverWithReceipt(failed, 'pipeline', async () => new Response(null, { status: 503 })), 'failed');
  assert.equal(await deliverWithReceipt(failed, 'pipeline', async () => new Response(null, { status: 200 })), 'accepted');
  const uncertain = storeFor(receipt('pending'));
  assert.equal(await deliverWithReceipt(uncertain, 'pipeline', async () => { throw Error('timeout'); }), 'uncertain');
  assert.equal(await deliverWithReceipt(uncertain, 'pipeline', async () => { throw Error('must not resend'); }), 'uncertain');
});

test('legacy receipts and simultaneous attempts do not dispatch twice', async () => {
  const legacy = storeFor({});
  assert.equal(await deliverWithReceipt(legacy, 'pipeline', async () => { throw Error('must not send'); }), 'legacy_unknown');
  const store = storeFor(receipt('pending'));
  let calls = 0;
  let release;
  const send = () => { calls++; return new Promise((resolve) => { release = () => resolve(new Response(null, { status: 200 })); }); };
  const first = deliverWithReceipt(store, 'pipeline', send);
  const second = deliverWithReceipt(store, 'pipeline', send);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(calls, 1);
  release();
  assert.deepEqual((await Promise.all([first, second])).sort(), ['accepted', 'in_progress']);
});

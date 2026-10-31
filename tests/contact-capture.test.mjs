import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

function compile(path) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8').replaceAll('import.meta.env', 'testEnv');
  return ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
}
const contactCode = compile('../src/pages/api/contact.ts');
const limiterCode = compile('../src/lib/rate-limiter.ts');
const submissionId = 'bbbbbbbb-3333-4444-8888-bbbbbbbbbbbb';

// Exercise the real handler and rate limiter, substituting only external services.
// Unexpected imports, network requests and email attempts fail the test.
function handler(database, env = {}) {
  const limiterExports = {};
  runInNewContext(limiterCode, { exports: limiterExports });
  const exports = {};
  runInNewContext(contactCode, {
    exports,
    testEnv: env,
    require(name) {
      if (name === 'node:crypto') return { createHash };
      if (name === '~/lib/supabase-admin') return { supabaseAdmin: database };
      if (name === '~/lib/rate-limiter') return limiterExports;
      if (name === 'nodemailer') {
        return {
          createTransport() {
            throw Error('Unexpected email attempt');
          },
        };
      }
      throw Error(`Unexpected import: ${name}`);
    },
    fetch() {
      throw Error('Unexpected network request');
    },
    Response,
    console: { error() {}, warn() {}, log() {} },
  });
  return exports.POST;
}
function request(body, headers = {}) {
  return {
    request: new Request('https://ziaflow.com/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify(body),
    }),
  };
}
function databaseFixture({ receiptError = null, leadError = null, statusError = null, existing = null } = {}) {
  const calls = [];
  return {
    calls,
    from(table) {
      const operation = { table };
      calls.push(operation);
      const query = {
        insert(value) {
          operation.insert = value;
          return query;
        },
        select(value) {
          operation.select = value;
          return query;
        },
        eq(key, value) {
          operation.filter = [key, value];
          return query;
        },
        single() {
          return Promise.resolve(
            operation.insert
              ? { data: receiptError ? null : { id: submissionId }, error: receiptError }
              : { data: existing, error: null }
          );
        },
        upsert(value, options) {
          operation.upsert = value;
          operation.options = options;
          return Promise.resolve({ error: leadError });
        },
        update(value) {
          operation.update = value;
          return query;
        },
        then(resolve, reject) {
          return Promise.resolve({ error: statusError }).then(resolve, reject);
        },
      };
      return query;
    },
  };
}
test('missing database configuration cannot report success', async () => {
  assert.equal((await handler(null)(request({ email: 'qa@example.com' }))).status, 503);
});
test('receipt rejection cannot report success or create a lead', async () => {
  const database = databaseFixture({ receiptError: { code: 'XX000', message: 'Unavailable' } });
  assert.equal((await handler(database)(request({ email: 'qa@example.com' }))).status, 500);
  assert.equal(database.calls.length, 1);
});
test('invalid email is rejected before database access', async () => {
  const database = databaseFixture();
  assert.equal((await handler(database)(request({ email: 'invalid' }))).status, 400);
  assert.equal(database.calls.length, 0);
});
test('authorized QA intake persists a receipt and linked lead before reporting success', async () => {
  const database = databaseFixture();
  const response = await handler(database, { TEST_SUBMISSION_TOKEN: 'test-only' })(
    request(
      {
        email: 'qa@example.com',
        name: 'QA capture',
        page: '/services/seo',
        idempotency_key: 'qa-capture',
      },
      { 'x-test-token': 'test-only' }
    )
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    message: 'Thanks! We received your message.',
    submission_id: submissionId,
    duplicate: false,
  });
  const [receipt, lead, status] = database.calls;
  assert.equal(receipt.table, 'lead_submissions');
  assert.equal(receipt.insert.dedup_key, 'client:qa-capture');
  assert.equal(receipt.insert.is_test, true);
  assert.equal(receipt.insert.page_submitted_from, '/services/seo');
  assert.equal(lead.table, 'leads');
  assert.equal(lead.upsert.submission_id, submissionId);
  assert.equal(lead.upsert.is_test, true);
  assert.equal(lead.options.onConflict, 'submission_id');
  assert.equal(status.update.status, 'persisted');
  assert.equal(status.filter[1], submissionId);
});
test('a client-controlled QA name or flag cannot mark a lead as a test', async () => {
  const database = databaseFixture();
  const response = await handler(database, { TEST_SUBMISSION_TOKEN: 'test-only' })(
    request(
      {
        email: 'qa@example.com',
        name: 'ZIAFLOW QA capture',
        is_test: true,
      },
      { 'x-test-token': 'wrong-token' }
    )
  );
  assert.equal(response.status, 200);
  assert.equal(database.calls[0].insert.is_test, false);
  assert.equal(database.calls[1].upsert.is_test, false);
});
test('lead failure cannot report success or mark the receipt persisted', async () => {
  const database = databaseFixture({ leadError: { message: 'Unavailable' } });
  assert.equal((await handler(database)(request({ email: 'qa@example.com' }))).status, 500);
  assert.equal(database.calls[2].update.error_detail, 'Unavailable');
  assert.equal(
    database.calls.some((call) => call.update?.status === 'persisted'),
    false
  );
});
test('receipt status failure cannot report success', async () => {
  const database = databaseFixture({ statusError: { message: 'Unavailable' } });
  assert.equal((await handler(database)(request({ email: 'qa@example.com' }))).status, 500);
});
test('a persisted duplicate reuses its receipt without writing another lead', async () => {
  const database = databaseFixture({
    receiptError: { code: '23505' },
    existing: { id: submissionId, status: 'persisted' },
  });
  const response = await handler(database)(request({ email: 'qa@example.com', idempotency_key: 'qa-capture' }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).duplicate, true);
  assert.equal(database.calls.length, 2);
  assert.equal(database.calls[1].filter[0], 'dedup_key');
  assert.equal(database.calls[1].filter[1], 'client:qa-capture');
});
test('the real rate limiter rejects the 51st request', async () => {
  const post = handler(null);
  for (let i = 0; i < 50; i++) {
    assert.equal((await post(request({ email: 'invalid' }))).status, 400);
  }
  const response = await post(request({ email: 'invalid' }));
  assert.equal(response.status, 429);
  assert.ok(Number(response.headers.get('retry-after')) > 0);
});

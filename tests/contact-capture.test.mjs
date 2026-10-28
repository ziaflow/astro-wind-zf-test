import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const nativeRequire = createRequire(import.meta.url);
const copy = (value) => JSON.parse(JSON.stringify(value));
function load(path, dependencies = {}, env = {}, globals = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8').replaceAll('import.meta.env', 'testEnv');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  runInNewContext(compiled, {
    module,
    exports: module.exports,
    testEnv: env,
    Response,
    Request,
    URL,
    AbortSignal,
    Buffer,
    console: { warn() {}, error() {}, log() {} },
    ...globals,
    require: (name) => (name in dependencies ? dependencies[name] : nativeRequire(name)),
  });
  return module.exports;
}
const delivery = load('../src/lib/intake-delivery.ts');
function database() {
  const receipts = new Map();
  const leads = new Map();
  let sequence = 0;
  const db = {
    receipts,
    leads,
    from(table) {
      let operation = 'select',
        values,
        filters = [],
        result;
      const query = {
        insert(value) {
          operation = 'insert';
          values = value;
          return query;
        },
        upsert(value) {
          operation = 'upsert';
          values = value;
          return query;
        },
        update(value) {
          operation = 'update';
          values = value;
          return query;
        },
        select() {
          return query;
        },
        eq(key, value) {
          filters.push([key, value]);
          return query;
        },
        single() {
          return execute(true);
        },
        then(resolve, reject) {
          return execute(false).then(resolve, reject);
        },
      };
      async function execute(single) {
        if (result) return result;
        const rows = table === 'leads' ? leads : receipts;
        if (operation === 'insert') {
          if ([...rows.values()].some((row) => row.dedup_key === values.dedup_key))
            return { error: { code: '23505' }, data: null };
          const row = copy({ ...values, id: `00000000-0000-4000-8000-${String(++sequence).padStart(12, '0')}` });
          rows.set(row.id, row);
          result = { data: single ? row : [row], error: null };
        } else if (operation === 'upsert') {
          if (!rows.has(values.submission_id)) rows.set(values.submission_id, copy(values));
          result = { data: null, error: null };
        } else {
          const matched = [...rows.values()].filter((row) =>
            filters.every(([key, value]) =>
              key === 'payload' ? JSON.stringify(row.payload) === value : row[key] === value
            )
          );
          if (operation === 'update') matched.forEach((row) => Object.assign(row, copy(values)));
          result = { data: single ? copy(matched[0] || null) : copy(matched), error: null };
        }
        return result;
      }
      return query;
    },
  };
  return db;
}
function handler({
  db = database(),
  env = {},
  fetch = async () => new Response('', { status: 200 }),
  configured = true,
} = {}) {
  return {
    db,
    post: load(
      '../src/pages/api/contact.ts',
      {
        '~/lib/supabase-admin': { supabaseAdmin: configured ? db : null },
        '~/lib/intake-delivery': delivery,
        '~/lib/rate-limiter': { checkRateLimit: () => ({ allowed: true }), getClientIp: () => '127.0.0.1' },
        nodemailer: { createTransport: () => ({ sendMail: async () => {} }) },
      },
      env,
      { fetch }
    ).POST,
  };
}
const base = {
  email: 'qa@example.com',
  name: 'Internal QA',
  message: 'QA request',
  page: '/audit',
  idempotency_key: 'attempt-1',
};
const request = (body = base, headers = {}) => ({
  request: new Request('https://ziaflow.com/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  }),
});
test('missing persistence configuration cannot report success', async () => {
  assert.equal((await handler({ configured: false }).post(request())).status, 503);
});
test('invalid email and honeypot create no receipts', async () => {
  const { db, post } = handler();
  assert.equal((await post(request({ ...base, email: 'invalid' }))).status, 400);
  assert.equal((await post(request({ ...base, website_url: 'spam' }))).status, 200);
  assert.equal(db.receipts.size, 0);
});
test('audit fields, source page and campaign attribution survive persistence', async () => {
  const { db, post } = handler();
  const response = await post(
    request({
      ...base,
      name: undefined,
      message: undefined,
      first_name: 'Internal',
      last_name: 'QA',
      comments: 'Audit details',
      company_name: 'Test Company',
      page: undefined,
      page_submitted_from: '/booking',
      utm_campaign: 'qa',
    })
  );
  assert.equal(response.status, 200);
  const receipt = [...db.receipts.values()][0];
  assert.equal(receipt.page_submitted_from, '/booking');
  assert.equal(receipt.payload.name, 'Internal QA');
  assert.equal(receipt.payload.message, 'Audit details');
  assert.equal(receipt.payload.company, 'Test Company');
  assert.equal(receipt.payload.extra.utm_campaign, 'qa');
  assert.equal(db.leads.size, 1);
});
test('explicitly rejected delivery retries the same saved receipt once', async () => {
  let attempts = 0;
  const { db, post } = handler({
    env: { CUSTOMER_IO_WEBHOOK_URL: 'https://test.invalid/webhook' },
    fetch: async () => new Response('', { status: ++attempts === 1 ? 503 : 200 }),
  });
  const first = await (await post(request())).json();
  assert.equal(first.delivery.webhook, 'failed');
  const retry = await (await post(request())).json();
  assert.equal(retry.delivery.webhook, 'accepted');
  assert.equal(first.submission_id, retry.submission_id);
  await post(request());
  assert.equal(attempts, 2);
  assert.equal(db.receipts.size, 1);
  assert.equal(db.leads.size, 1);
});
test('simultaneous duplicates claim only one webhook dispatch', async () => {
  let attempts = 0;
  const { db, post } = handler({
    env: { CUSTOMER_IO_WEBHOOK_URL: 'https://test.invalid/webhook' },
    fetch: async () => {
      attempts++;
      return new Response('', { status: 200 });
    },
  });
  await Promise.all([post(request()), post(request())]);
  assert.equal(db.receipts.size, 1);
  assert.equal(db.leads.size, 1);
  assert.equal(attempts, 1);
});
test('ambiguous network failure is held, not blindly resent', async () => {
  let attempts = 0;
  const { post } = handler({
    env: { CUSTOMER_IO_WEBHOOK_URL: 'https://test.invalid/webhook' },
    fetch: async () => {
      attempts++;
      throw new Error('timeout');
    },
  });
  assert.equal((await (await post(request())).json()).delivery.webhook, 'uncertain');
  await post(request());
  assert.equal(attempts, 1);
});
test('retrying with another message cannot overwrite the original receipt', async () => {
  const { db, post } = handler();
  await post(request());
  assert.equal((await post(request({ ...base, message: 'Different content' }))).status, 409);
  assert.equal([...db.receipts.values()][0].payload.message, base.message);
});
test('authenticated tests persist as tests and never send notifications or enrollment events', async () => {
  let sends = 0;
  const { db, post } = handler({
    env: {
      TEST_SUBMISSION_TOKEN: 'internal-test',
      CUSTOMER_IO_WEBHOOK_URL: 'https://test.invalid',
      CIO_CDP_WRITE_KEY: 'test-only',
    },
    fetch: async () => {
      sends++;
      return new Response();
    },
  });
  await post(request(base, { 'x-test-token': 'internal-test' }));
  await post(request());
  assert.equal([...db.receipts.values()][0].is_test, true);
  assert.equal(sends, 0);
});
test('Pipelines identify and canonical event use strict validation and stable IDs', async () => {
  const calls = [];
  const { post } = handler({
    env: { CIO_CDP_WRITE_KEY: 'test-only' },
    fetch: async (url, options) => {
      calls.push({ url, options });
      return new Response('', { status: 200 });
    },
  });
  const first = await (await post(request())).json();
  await post(request());
  assert.equal(calls.length, 1);
  assert.equal(calls[0].options.headers['X-Strict-Mode'], '1');
  const batch = JSON.parse(calls[0].options.body).batch;
  assert.equal(batch[0].type, 'identify');
  assert.equal(batch[1].event, 'form_submit');
  assert.equal(batch[1].properties.submission_id, first.submission_id);
  assert.equal(batch[1].messageId, `intake:${first.submission_id}:form_submit`);
});
test('source paths reject unrelated hosts and retain only the path', () => {
  assert.equal(delivery.sourcePath({ page_url: 'https://ziaflow.com/audit?utm_source=test' }, null), '/audit');
  assert.equal(delivery.sourcePath({ page: '//evil.example/' }, 'https://ziaflow.com/booking'), '/booking');
});
test('historical receipts without dispatch proof are never replayed automatically', async () => {
  const result = await delivery.deliverWithReceipt(
    { read: async () => ({}), replace: async () => false },
    'webhook',
    () => {
      throw new Error('must not send');
    }
  );
  assert.equal(result, 'legacy_unknown');
});

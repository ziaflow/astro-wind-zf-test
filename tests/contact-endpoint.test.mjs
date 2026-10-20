import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';

// Execute the route with isolated, fake providers. Never load credentials or send messages.
const source = readFileSync(new URL('../src/pages/api/contact.ts', import.meta.url), 'utf8').replaceAll(
  'import.meta.env',
  'process.env'
);
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function route({ saved = false, resendResult, receiptFails = false, smtp = false, limited = false, sheet } = {}) {
  let calls = 0;
  let inserts = 0;
  const providers = {
    '~/lib/supabase': {
      supabase: {
        from: () => ({
          insert: () => {
            inserts++;
            return {
              select: () => ({
                single: async () => (saved ? { data: { id: 42 } } : { error: { message: 'Unavailable' } }),
              }),
            };
          },
        }),
      },
    },
    '~/lib/resend': {
      resend: resendResult
        ? {
            emails: {
              send: async () => {
                calls++;
                if (receiptFails && calls > 1) throw new Error('Receipt failed');
                return resendResult;
              },
            },
            events: { send: async () => ({}) },
          }
        : null,
    },
    nodemailer: {
      default: { createTransport: () => ({ sendMail: async () => ({ accepted: ['team@example.com'] }) }) },
    },
    '~/lib/forms/emailTemplates': { getLeadNotificationHtml: () => '', getCustomerReceiptHtml: () => '' },
    '~/lib/communications': { logCommunication: async () => {} },
    '~/lib/customerio': { identifyUser: async () => {}, trackEvent: async () => {} },
    '~/lib/forms/rate-limit': { checkRateLimit: () => ({ allowed: !limited, retryAfterSeconds: 60 }) },
  };
  const exports = {};
  runInNewContext(compiled, {
    exports,
    require: (name) => {
      assert.ok(name in providers, `Unexpected dependency ${name}`);
      return providers[name];
    },
    process: {
      env: {
        ...(smtp ? { SMTP_USER: 'fake', SMTP_PASS: 'fake' } : {}),
        ...(sheet ? { GOOGLE_SCRIPT_URL: 'https://example.invalid', GOOGLE_SCRIPT_SECRET: 'fake' } : {}),
      },
    },
    console: { error() {}, warn() {} },
    Response,
    crypto,
    AbortSignal,
    fetch: async () => Response.json(sheet),
  });
  return {
    post: async (payload) =>
      exports.POST({
        clientAddress: '192.0.2.1',
        request: new Request('http://localhost/api/contact', { method: 'POST', body: JSON.stringify(payload) }),
      }),
    inserts: () => inserts,
  };
}
const inquiry = { name: 'Test Visitor', email: 'visitor@example.com', service_needed: 'Website' };

test('rate-limited submissions never reach storage or messaging providers', async () => {
  const api = route({ limited: true });
  const response = await api.post(inquiry);
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('Retry-After'), '60');
  assert.equal(api.inserts(), 0);
});

test('Google Sheet acknowledgment is checked independently of HTTP success', async () => {
  assert.equal((await route({ sheet: { ok: false } }).post(inquiry)).status, 503);
  assert.equal((await route({ sheet: { ok: true } }).post(inquiry)).status, 200);
});

test('returns 503 when no lead is saved and no notification is accepted', async () => {
  assert.equal((await route().post(inquiry)).status, 503);
});
test('saved lead succeeds even if email is unavailable', async () => {
  assert.equal((await route({ saved: true }).post(inquiry)).status, 200);
});
test('Resend error objects do not count as accepted notifications', async () => {
  assert.equal(
    (await route({ resendResult: { data: null, error: { message: 'Rejected' } } }).post(inquiry)).status,
    503
  );
});
test('accepted team notification succeeds even if the customer receipt throws', async () => {
  assert.equal(
    (await route({ resendResult: { data: { id: 'fake-id' }, error: null }, receiptFails: true }).post(inquiry)).status,
    200
  );
});
test('SMTP can accept a lead when database and Resend are unavailable', async () => {
  assert.equal((await route({ smtp: true }).post(inquiry)).status, 200);
});
test('invalid and oversized payloads never reach lead storage', async () => {
  for (const payload of [
    null,
    [],
    { ...inquiry, email: 'invalid' },
    { ...inquiry, name: ' ' },
    { ...inquiry, comments: {} },
    { ...inquiry, comments: 'x'.repeat(4001) },
    { ...inquiry, website: 'spam' },
  ]) {
    const api = route();
    assert.equal((await api.post(payload)).status, 400);
    assert.equal(api.inserts(), 0);
  }
});

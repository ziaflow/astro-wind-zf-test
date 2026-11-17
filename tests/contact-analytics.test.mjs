import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';
import { createHash } from 'node:crypto';

function endpoint(mode, isTest = false) {
  let source = readFileSync(new URL('../src/pages/api/contact.ts', import.meta.url), 'utf8');
  source = source.replace(/^import .*;\r?\n/gm, '').replaceAll('import.meta.env', 'env').replaceAll('export const ', 'const ');
  source = stripTypeScriptTypes(source) + '\nmodule.exports = POST;';
  const payload = { email: 'person@business.com', message: 'hello', extra: {} };
  const db = { from(table) {
    return {
      insert() { return { select() { return { async single() { return mode === 'new' ? { data: { id: 'receipt' } } : { error: { code: '23505' } }; } }; } }; },
      select() { return { eq() { return { async single() { return { data: { id: 'receipt', status: mode, payload, is_test: isTest } }; } }; } }; },
      async upsert() { return { error: null }; },
      update() { return { async eq() { return { error: null }; } }; },
    };
  } };
  const module = { exports: {} };
  runInNewContext(source, { module, Response, URL, createHash, supabaseAdmin: db, env: { VERCEL_ENV: isTest ? 'preview' : 'production' }, sourcePath: () => '/contact', logger: { info(){}, warn(){}, error(){} }, Sentry: { captureException(){} }, nodemailer: {} });
  return module.exports;
}
function request(extra = {}) { return new Request('https://ziaflow.com/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'person@business.com', message: 'hello', ...extra }) }); }
for (const mode of ['new', 'persisted', 'validated']) {
  test(`contact ${mode} receipt eligibility`, async () => {
    const response = await endpoint(mode)({ request: request() });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.duplicate, mode !== 'new');
    assert.equal(body.analytics_eligible, mode === 'new');
    assert.equal(body.is_test, false);
  });
}
test('test and honeypot responses are ineligible', async () => {
  const qa = await (await endpoint('new', true)({ request: request() })).json();
  assert.equal(qa.analytics_eligible, false);
  const bot = await (await endpoint('new')({ request: request({ website_url: 'spam' }) })).json();
  assert.notEqual(bot.analytics_eligible, true);
});

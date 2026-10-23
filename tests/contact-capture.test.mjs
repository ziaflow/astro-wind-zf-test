import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../src/pages/api/contact.ts', import.meta.url), 'utf8')
  .replaceAll('import.meta.env', 'testEnv')
  .replace(/^import nodemailer.*;$/m, '');
const compiled = ts
  .transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  })
  .outputText.replaceAll('export const ', 'const ');

function handler(fetchImpl, configured = true) {
  return runInNewContext(compiled + '\nPOST;', {
    testEnv: {},
    process: {
      env: configured ? { SUPABASE_URL: 'https://test.invalid', SUPABASE_SERVICE_ROLE_KEY: 'test-only' } : {},
    },
    fetch: fetchImpl,
    Response,
    URL,
    AbortSignal,
    crypto,
    console: { error() {}, warn() {} },
  });
}
function request(body) {
  return {
    request: new Request('https://ziaflow.com/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  };
}
test('missing database configuration cannot report success', async () => {
  const post = handler(() => {
    throw Error('must not fetch');
  }, false);
  assert.equal((await post(request({ email: 'qa@example.com' }))).status, 503);
});
test('database rejection cannot report success', async () => {
  const post = handler(async () => new Response('', { status: 500 }));
  assert.equal((await post(request({ email: 'qa@example.com' }))).status, 502);
});
test('invalid email is rejected before database access', async () => {
  const post = handler(() => {
    throw Error('must not fetch');
  });
  assert.equal((await post(request({ email: 'invalid' }))).status, 400);
});
test('successful QA intake records source and test flag through the atomic RPC', async () => {
  let saved;
  const post = handler(async (url, options) => {
    assert.equal(url, 'https://test.invalid/rest/v1/rpc/record_website_contact');
    saved = JSON.parse(options.body);
    return Response.json(saved.p_id);
  });
  const id = 'bbbbbbbb-3333-4444-8888-bbbbbbbbbbbb';
  const response = await post(
    request({
      submission_id: id,
      email: 'qa@example.com',
      name: 'ZIAFLOW QA capture',
      page_url: 'https://ziaflow.com/services/seo?utm_source=search',
    })
  );
  assert.equal(response.status, 200);
  assert.equal(saved.p_id, id);
  assert.equal(saved.p_metadata.is_test, true);
  assert.equal(saved.p_metadata.source_page, '/services/seo');
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { captureContact } from '../src/lib/contact-intake.ts';
const id = 'bbbbbbbb-3333-4444-8888-bbbbbbbbbbbb';
const env = {
  WEBSITE_INTAKE_ENABLED: 'true',
  SUPABASE_URL: 'https://test.invalid',
  SUPABASE_SERVICE_ROLE_KEY: 'test-only',
};
const body = {
  email: 'QA@EXAMPLE.COM',
  submission_id: id,
  name: 'QA',
  page_url: 'https://ziaflow.com/contact?utm_source=search',
};
const request = (data = body, headers = {}) =>
  new Request('https://ziaflow.com/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(data),
  });
const noNetwork = () => {
  throw Error('must not call provider');
};
test('disabled or unconfigured intake never reports success', async () => {
  assert.equal((await captureContact(request(), {}, noNetwork)).status, 503);
});
test('invalid email, id, JSON and external origin reject before persistence', async () => {
  assert.equal((await captureContact(request({ ...body, email: 'invalid' }), env, noNetwork)).status, 400);
  assert.equal((await captureContact(request({ ...body, submission_id: '' }), env, noNetwork)).status, 400);
  assert.equal((await captureContact(request(body, { origin: 'https://other.invalid' }), env, noNetwork)).status, 403);
  assert.equal((await captureContact(request(null), env, noNetwork)).status, 400);
  assert.equal((await captureContact(request({ ...body, website: 'spam' }), env, noNetwork)).status, 400);
  assert.equal((await captureContact(request({ ...body, page_url: 'http://[' }), env, noNetwork)).status, 400);
});
test('provider rejection, timeout and invalid receipt never report success', async () => {
  for (const send of [
    async () => new Response('', { status: 500 }),
    async () => {
      throw Error('timeout');
    },
    async () => Response.json('wrong-id'),
  ]) {
    assert.equal((await captureContact(request(), env, send)).status, 502);
  }
});
test('receipt records test exclusion, attribution and held follow-up without messaging', async () => {
  let calls = 0;
  const response = await captureContact(request(), env, async (url, options) => {
    calls++;
    assert.equal(String(url), 'https://test.invalid/rest/v1/rpc/record_website_contact');
    const saved = JSON.parse(options.body);
    assert.equal(saved.p_id, id);
    assert.equal(saved.p_payload.email, 'qa@example.com');
    assert.equal(saved.p_metadata.is_test, true);
    assert.equal(saved.p_metadata.source_page, '/contact');
    assert.equal(saved.p_metadata.attribution.utm_source, 'search');
    assert.equal(saved.p_metadata.follow_up_state, 'held');
    assert.equal(saved.p_metadata.marketing_consent, false);
    assert.equal(saved.p_metadata.event_name, 'form_submit');
    return Response.json(id);
  });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).submission_id, id);
  assert.equal(calls, 1);
});
test('retry after ambiguous transport preserves the same RPC id', async () => {
  const seen = [];
  const send = async (_url, options) => {
    seen.push(JSON.parse(options.body).p_id);
    if (seen.length === 1) throw Error('response lost');
    return Response.json(id);
  };
  assert.equal((await captureContact(request(), env, send)).status, 502);
  assert.equal((await captureContact(request(), env, send)).status, 200);
  assert.deepEqual(seen, [id, id]); // Durable deduplication belongs to the database RPC, tested separately.
});
test('preview cannot opt out of QA exclusion', async () => {
  await captureContact(
    request(),
    { ...env, VERCEL_ENV: 'preview', WEBSITE_INTAKE_TEST_ONLY: 'false' },
    async (_url, options) => {
      assert.equal(JSON.parse(options.body).p_metadata.is_test, true);
      return Response.json(id);
    }
  );
});

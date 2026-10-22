import test from 'node:test';
import assert from 'node:assert/strict';
import { sendReviewWelcome } from '../src/lib/growth-tools/welcome.mjs';
const input = { email: 'qa@example.com', name: 'QA Tester', tool: 'Website estimator', submissionId: 'test-request' };
const env = {
  GROWTH_WELCOME_ENABLED: 'true',
  VERCEL_ENV: 'preview',
  GROWTH_WELCOME_TEST_RECIPIENTS: 'qa@example.com',
  CIO_APP_API_KEY: 'test-only',
  CIO_GROWTH_WELCOME_MESSAGE_ID: '2',
};
test('disabled welcome never contacts provider', async () => {
  let calls = 0;
  const r = await sendReviewWelcome(input, {
    env: {},
    fetch: async () => {
      calls++;
    },
  });
  assert.equal(r.state, 'held');
  assert.equal(calls, 0);
});
test('preview cannot send to non-test recipients', async () => {
  const r = await sendReviewWelcome(
    { ...input, email: 'prospect@example.com' },
    {
      env,
      fetch: async () => {
        throw Error('must not call');
      },
    }
  );
  assert.equal(r.reason, 'test_recipient_required');
});
test('missing configuration stays held', async () => {
  const r = await sendReviewWelcome(input, { env: { ...env, CIO_APP_API_KEY: '' } });
  assert.equal(r.reason, 'not_configured');
});
test('accepted is separate from delivered and targets the request email', async () => {
  let body;
  const r = await sendReviewWelcome(input, {
    env,
    fetch: async (url, options) => {
      assert.equal(url, 'https://api.customer.io/v1/send/email');
      body = JSON.parse(options.body);
      return { ok: true, json: async () => ({ delivery_id: 'test-delivery' }) };
    },
  });
  assert.equal(r.state, 'accepted');
  assert.equal(r.deliveryId, 'test-delivery');
  assert.equal(body.to, input.email);
  assert.equal(body.identifiers.email, input.email);
  assert.equal(body.send_to_unsubscribed, false);
});
test('provider rejection recorded without retry', async () => {
  let calls = 0;
  const r = await sendReviewWelcome(input, {
    env,
    fetch: async () => {
      calls++;
      return { ok: false, status: 401 };
    },
  });
  assert.equal(r.reason, 'provider_401');
  assert.equal(calls, 1);
});
test('ambiguous transport failure is not resent', async () => {
  let calls = 0;
  const r = await sendReviewWelcome(input, {
    env,
    fetch: async () => {
      calls++;
      throw Error('timeout');
    },
  });
  assert.equal(r.state, 'unknown');
  assert.equal(calls, 1);
});

import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import {
  buildPublishedPostMarkdown,
  verifySanityWebhookSignature,
} from '../src/lib/integrations/sanity-docs.mjs';

const secret = 'test-webhook-secret';
const body = '{"_id":"post-1","_type":"post"}';
const timestamp = String(Math.floor(Date.now() / 1000));
const signature = createHmac('sha256', secret)
  .update(`${timestamp}.${body}`)
  .digest('base64url');

 test('accepts a valid, recent Sanity signature', () => {
  assert.equal(
    verifySanityWebhookSignature(body, `t=${timestamp},v1=${signature}`, secret),
    true
  );
});

test('rejects a signature for a different body or secret', () => {
  assert.equal(
    verifySanityWebhookSignature(`${body} `, `t=${timestamp},v1=${signature}`, secret),
    false
  );
  assert.equal(
    verifySanityWebhookSignature(body, `t=${timestamp},v1=${signature}`, 'wrong-secret'),
    false
  );
});

test('rejects stale signatures', () => {
  const oldTimestamp = String(Math.floor((Date.now() - 10 * 60 * 1000) / 1000));
  const oldSignature = createHmac('sha256', secret)
    .update(`${oldTimestamp}.${body}`)
    .digest('base64url');

  assert.equal(
    verifySanityWebhookSignature(body, `t=${oldTimestamp},v1=${oldSignature}`, secret),
    false
  );
});

test('renders a markdown page with summary, body, and canonical source link', () => {
  assert.equal(
    buildPublishedPostMarkdown({
      summary: 'A short summary.',
      bodyText: 'First paragraph.\nSecond paragraph.',
      sourceUrl: 'https://ziaflow.com/example-post',
    }),
    'A short summary.\n\nFirst paragraph.\nSecond paragraph.\n\n---\n[View the published post on ziaflow.com](https://ziaflow.com/example-post)'
  );
});

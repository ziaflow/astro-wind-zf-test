import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import {
  buildDocsPageMarkdown,
  buildPublishedPostMarkdown,
  normalizeSanityId,
  parseMarkdownToPortableText,
  verifySanityWebhookSignature,
} from '../src/lib/integrations/sanity-docs.mjs';

const secret = 'test-webhook-secret';
const body = '{"_id":"post-1","_type":"post"}';
const timestamp = String(Math.floor(Date.now() / 1000));
const signature = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('base64url');

test('accepts a valid, recent Sanity signature', () => {
  assert.equal(verifySanityWebhookSignature(body, `t=${timestamp},v1=${signature}`, secret), true);
});

test('rejects a signature for a different body or secret', () => {
  assert.equal(verifySanityWebhookSignature(`${body} `, `t=${timestamp},v1=${signature}`, secret), false);
  assert.equal(verifySanityWebhookSignature(body, `t=${timestamp},v1=${signature}`, 'wrong-secret'), false);
});

test('rejects stale signatures', () => {
  const oldTimestamp = String(Math.floor((Date.now() - 10 * 60 * 1000) / 1000));
  const oldSignature = createHmac('sha256', secret).update(`${oldTimestamp}.${body}`).digest('base64url');

  assert.equal(verifySanityWebhookSignature(body, `t=${oldTimestamp},v1=${oldSignature}`, secret), false);
});

test('normalizes sanity IDs for drafts and published documents', () => {
  const draftResult = normalizeSanityId('drafts.72beeec0-94d8-4b0a');
  assert.equal(draftResult.canonicalId, '72beeec0-94d8-4b0a');
  assert.equal(draftResult.isDraft, true);

  const publishedResult = normalizeSanityId('72beeec0-94d8-4b0a');
  assert.equal(publishedResult.canonicalId, '72beeec0-94d8-4b0a');
  assert.equal(publishedResult.isDraft, false);
});

test('renders a published markdown page with source link', () => {
  assert.equal(
    buildPublishedPostMarkdown({
      summary: 'A short summary.',
      bodyText: 'First paragraph.\nSecond paragraph.',
      sourceUrl: 'https://ziaflow.com/posts/example-post',
    }),
    'A short summary.\n\nFirst paragraph.\nSecond paragraph.\n\n---\n[View the published post on ziaflow.com](https://ziaflow.com/posts/example-post)'
  );
});

test('renders a draft review markdown page with editorial banner and draft metadata', () => {
  const markdown = buildDocsPageMarkdown({
    title: 'New Service Page',
    summary: 'A draft summary.',
    bodyText: 'Draft content for review.',
    sourceUrl: 'https://ziaflow.com/posts/new-service-page',
    isDraft: true,
    sanityId: 'drafts.new-service-page',
  });

  assert.match(markdown, /> 📝 \*\*Draft in Review by Superhuman Go\*\*/);
  assert.match(markdown, /\*Sanity Draft ID:\* `drafts\.new-service-page`/);
  assert.match(markdown, /Draft content for review\./);
});

test('parses reviewed markdown into Sanity Portable Text blocks', () => {
  const inputMarkdown = `
> 📝 **Draft in Review by Superhuman Go**
> Apply edits directly.

## Section 1: Overview
This is the introductory paragraph.

### Core Metrics
- 99.9% uptime SLA
- 45s alert response

1. Step one
2. Step two

---
*Sanity Draft ID:* \`drafts.test-123\`
  `.trim();

  const blocks = parseMarkdownToPortableText(inputMarkdown);
  assert.equal(blocks.length, 7);

  // Check H2
  assert.equal(blocks[0].style, 'h2');
  assert.equal(blocks[0].children[0].text, 'Section 1: Overview');

  // Check Paragraph
  assert.equal(blocks[1].style, 'normal');
  assert.equal(blocks[1].children[0].text, 'This is the introductory paragraph.');

  // Check H3
  assert.equal(blocks[2].style, 'h3');
  assert.equal(blocks[2].children[0].text, 'Core Metrics');

  // Check Bullet Items
  assert.equal(blocks[3].listItem, 'bullet');
  assert.equal(blocks[3].children[0].text, '99.9% uptime SLA');
  assert.equal(blocks[4].listItem, 'bullet');
  assert.equal(blocks[4].children[0].text, '45s alert response');

  // Check Numbered Items
  assert.equal(blocks[5].listItem, 'number');
  assert.equal(blocks[5].children[0].text, 'Step one');
  assert.equal(blocks[6].listItem, 'number');
  assert.equal(blocks[6].children[0].text, 'Step two');
});

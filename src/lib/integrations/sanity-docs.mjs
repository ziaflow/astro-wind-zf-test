import { createHmac, timingSafeEqual } from 'node:crypto';

const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

/**
 * Verify Sanity's `sanity-webhook-signature` against the exact raw request body.
 * @param {string} rawBody
 * @param {string | null} signatureHeader
 * @param {string} secret
 * @param {number} [nowMs]
 * @returns {boolean}
 */
export function verifySanityWebhookSignature(rawBody, signatureHeader, secret, nowMs = Date.now()) {
  if (!signatureHeader || !secret) return false;

  const fields = new Map();
  for (const part of signatureHeader.split(',')) {
    const separator = part.indexOf('=');
    if (separator < 1) continue;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (key && value) {
      const values = fields.get(key) ?? [];
      values.push(value);
      fields.set(key, values);
    }
  }

  const timestamp = fields.get('t')?.[0];
  const signatures = fields.get('v1') ?? [];
  if (!timestamp || signatures.length === 0 || !/^\d+$/.test(timestamp)) return false;

  const numericTimestamp = Number(timestamp);
  const timestampMs = numericTimestamp > 1e12 ? numericTimestamp : numericTimestamp * 1000;
  if (!Number.isFinite(timestampMs) || Math.abs(nowMs - timestampMs) > MAX_CLOCK_SKEW_MS) return false;

  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest();
  return signatures.some((signature) => {
    if (!/^[A-Za-z0-9_-]+$/.test(signature)) return false;
    const received = Buffer.from(signature, 'base64url');
    return received.length === expected.length && timingSafeEqual(received, expected);
  });
}

/**
 * Build the Markdown body for a published Sanity post.
 * @param {{ summary?: string, bodyText?: string, sourceUrl: string }} post
 * @returns {string}
 */
export function buildPublishedPostMarkdown({ summary, bodyText, sourceUrl }) {
  const sections = [];
  const cleanSummary = typeof summary === 'string' ? summary.trim() : '';
  const cleanBody = typeof bodyText === 'string' ? bodyText.replace(/\r\n?/g, '\n').trim() : '';

  if (cleanSummary) sections.push(cleanSummary);
  if (cleanBody) sections.push(cleanBody);
  sections.push(`---\n[View the published post on ziaflow.com](${sourceUrl})`);

  return sections.join('\n\n');
}

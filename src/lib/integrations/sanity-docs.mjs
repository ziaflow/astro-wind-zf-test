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
 * Normalize a Sanity document ID into canonical ID and draft flag.
 * @param {string} id
 * @returns {{ canonicalId: string, isDraft: boolean }}
 */
export function normalizeSanityId(id) {
  const cleanId = String(id || '').trim();
  const isDraft = cleanId.startsWith('drafts.');
  const canonicalId = cleanId.replace(/^drafts\./, '');
  return { canonicalId, isDraft };
}

/**
 * Build the Markdown body for a published Sanity post (backward compatible).
 * @param {{ summary?: string, bodyText?: string, sourceUrl: string }} post
 * @returns {string}
 */
export function buildPublishedPostMarkdown({ summary, bodyText, sourceUrl }) {
  return buildDocsPageMarkdown({ summary, bodyText, sourceUrl, isDraft: false });
}

/**
 * Build Markdown content for a Superhuman Docs page (draft or published).
 * @param {{
 *   title?: string,
 *   summary?: string,
 *   bodyText?: string,
 *   sourceUrl: string,
 *   isDraft?: boolean,
 *   sanityId?: string
 * }} options
 * @returns {string}
 */
export function buildDocsPageMarkdown({
  title = '',
  summary = '',
  bodyText = '',
  sourceUrl,
  isDraft = false,
  sanityId = '',
}) {
  const sections = [];
  const cleanTitle = typeof title === 'string' ? title.trim() : '';
  const cleanSummary = typeof summary === 'string' ? summary.trim() : '';
  const cleanBody = typeof bodyText === 'string' ? bodyText.replace(/\r\n?/g, '\n').trim() : '';

  if (isDraft) {
    sections.push(
      `> 📝 **Draft in Review by Superhuman Go**\n` +
        `> Apply edits, comments, and improvements directly to this document. Upon approval, edits synchronize back to Sanity.`
    );
  }

  if (cleanTitle) sections.push(`# ${cleanTitle}`);
  if (cleanSummary) sections.push(cleanSummary);
  if (cleanBody) sections.push(cleanBody);

  if (isDraft) {
    sections.push(
      `---\n` +
        `*Sanity Draft ID:* \`${sanityId || 'pending'}\`  \n` +
        `*Target Production URL:* [${sourceUrl}](${sourceUrl})`
    );
  } else {
    sections.push(`---\n[View the published post on ziaflow.com](${sourceUrl})`);
  }

  return sections.join('\n\n');
}

/**
 * Parse Markdown text (e.g. from Superhuman Docs after review) into Sanity Portable Text blocks.
 * @param {string} markdown
 * @returns {Array<object>}
 */
export function parseMarkdownToPortableText(markdown) {
  if (!markdown || typeof markdown !== 'string') return [];

  const rawLines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let blockSeq = 0;

  // 1. Strip automated draft banner and trailing metadata
  const lines = [];
  let inBanner = false;

  for (const line of rawLines) {
    if (line.startsWith('> 📝 **Draft in Review')) {
      inBanner = true;
      continue;
    }
    if (inBanner) {
      if (line.startsWith('>') || !line.trim()) continue;
      inBanner = false;
    }
    if (line.startsWith('*Sanity Draft ID:*') || line.startsWith('*Target Production URL:*')) {
      continue;
    }
    lines.push(line);
  }

  // Remove trailing horizontal rule if left behind
  while (lines.length > 0 && (lines[lines.length - 1].trim() === '---' || !lines[lines.length - 1].trim())) {
    lines.pop();
  }

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line || line === '---') {
      i++;
      continue;
    }

    blockSeq++;
    const key = `b_${Date.now().toString(36)}_${blockSeq}`;

    // H2 Heading
    if (line.startsWith('## ')) {
      blocks.push({
        _type: 'block',
        _key: key,
        style: 'h2',
        children: [{ _type: 'span', _key: `s_${key}`, text: line.slice(3).trim(), marks: [] }],
        markDefs: [],
      });
      i++;
      continue;
    }

    // H3 Heading
    if (line.startsWith('### ')) {
      blocks.push({
        _type: 'block',
        _key: key,
        style: 'h3',
        children: [{ _type: 'span', _key: `s_${key}`, text: line.slice(4).trim(), marks: [] }],
        markDefs: [],
      });
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({
        _type: 'block',
        _key: key,
        style: 'blockquote',
        children: [{ _type: 'span', _key: `s_${key}`, text: quoteLines.join(' ').trim(), marks: [] }],
        markDefs: [],
      });
      continue;
    }

    // Bullet List
    if (line.startsWith('- ') || line.startsWith('* ')) {
      let listIdx = 0;
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        const itemText = lines[i]
          .trim()
          .replace(/^[-*]\s+/, '')
          .trim();
        const itemKey = `${key}_${listIdx++}`;
        blocks.push({
          _type: 'block',
          _key: itemKey,
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [{ _type: 'span', _key: `s_${itemKey}`, text: itemText, marks: [] }],
          markDefs: [],
        });
        i++;
      }
      continue;
    }

    // Numbered List
    if (/^\d+\.\s+/.test(line)) {
      let listIdx = 0;
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const itemText = lines[i]
          .trim()
          .replace(/^\d+\.\s+/, '')
          .trim();
        const itemKey = `${key}_${listIdx++}`;
        blocks.push({
          _type: 'block',
          _key: itemKey,
          style: 'normal',
          listItem: 'number',
          level: 1,
          children: [{ _type: 'span', _key: `s_${itemKey}`, text: itemText, marks: [] }],
          markDefs: [],
        });
        i++;
      }
      continue;
    }

    // Normal Paragraph (collect contiguous text lines until empty line or special token)
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('## ') &&
      !lines[i].trim().startsWith('### ') &&
      !lines[i].trim().startsWith('> ') &&
      !lines[i].trim().startsWith('- ') &&
      !lines[i].trim().startsWith('* ') &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      lines[i].trim() !== '---'
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }

    blocks.push({
      _type: 'block',
      _key: key,
      style: 'normal',
      children: [{ _type: 'span', _key: `s_${key}`, text: paraLines.join(' ').trim(), marks: [] }],
      markDefs: [],
    });
  }

  return blocks;
}

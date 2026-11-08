#!/usr/bin/env node
/**
 * Bidirectional Sync: Superhuman Docs -> Sanity Content Lake
 *
 * Fetches reviewed page content from Superhuman Docs (Coda API),
 * converts the markdown into Sanity Portable Text blocks,
 * and patches the draft document in Sanity Content Lake.
 *
 * Usage:
 *   node scripts/sync-docs-to-sanity.mjs --sanity-id <id>
 *   node scripts/sync-docs-to-sanity.mjs --page-id <coda-page-id>
 *   node scripts/sync-docs-to-sanity.mjs --test
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { createClient as createSanityClient } from '@sanity/client';
import { parseMarkdownToPortableText, normalizeSanityId } from '../src/lib/integrations/sanity-docs.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(ROOT_DIR, '.env') });

const DOCS_TOKEN = process.env.SUPERHUMAN_DOCS_API_TOKEN;
const DOCS_ID = process.env.SUPERHUMAN_DOCS_DOC_ID;
const SANITY_TOKEN = process.env.SANITY_API_TOKEN;
const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID || '92p0tpps';
const SANITY_DATASET = process.env.SANITY_DATASET || 'production';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const DOCS_API_ROOT = 'https://coda.io/apis/v1';

async function fetchDocsPageContent(docId, pageId) {
  const url = `${DOCS_API_ROOT}/docs/${encodeURIComponent(docId)}/pages/${encodeURIComponent(pageId)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${DOCS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Docs API error (${res.status}): ${await res.text()}`);
  }

  const page = await res.json();
  return page;
}

async function syncSingleArticle({ sanityId, pageId, mockContent = null }) {
  console.log(`\n--- Synchronizing Article [Sanity: ${sanityId || 'resolve'}, Docs Page: ${pageId || 'resolve'}] ---`);

  let resolvedSanityId = sanityId;
  let resolvedPageId = pageId;

  // Supabase lookup if only one ID is provided
  if ((!resolvedSanityId || !resolvedPageId) && SUPABASE_URL && SUPABASE_KEY) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const query = supabase.from('sanity_docs_sync').select('sanity_document_id, coda_page_id');
    if (resolvedSanityId) {
      query.eq('sanity_document_id', normalizeSanityId(resolvedSanityId).canonicalId);
    } else {
      query.eq('coda_page_id', resolvedPageId);
    }
    const { data: record } = await query.maybeSingle();
    if (record) {
      resolvedSanityId = resolvedSanityId || record.sanity_document_id;
      resolvedPageId = resolvedPageId || record.coda_page_id;
    }
  }

  if (!resolvedSanityId) {
    throw new Error('Could not resolve Sanity document ID');
  }

  const { canonicalId } = normalizeSanityId(resolvedSanityId);
  const targetDraftId = `drafts.${canonicalId}`;

  console.log(`Target Draft ID in Sanity: ${targetDraftId}`);

  let markdown = mockContent;

  if (!markdown && resolvedPageId && DOCS_TOKEN && DOCS_ID) {
    console.log(`Fetching live page content from Docs API for page ${resolvedPageId}...`);
    const pageData = await fetchDocsPageContent(DOCS_ID, resolvedPageId);
    markdown = pageData.content || pageData.subtitle || '';
  }

  if (!markdown) {
    throw new Error('No content available to synchronize. Provide --mock or ensure Docs API is accessible.');
  }

  console.log(`Transforming markdown into Sanity Portable Text blocks...`);
  const blocks = parseMarkdownToPortableText(markdown);
  console.log(`Generated ${blocks.length} Portable Text blocks.`);

  if (!SANITY_TOKEN) {
    console.warn(`SANITY_API_TOKEN is not configured; skipping write to Sanity Content Lake.`);
    return { targetDraftId, blocks, dryRun: true };
  }

  const sanityClient = createSanityClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    token: SANITY_TOKEN,
    useCdn: false,
    apiVersion: '2026-11-04',
  });

  console.log(`Patching Sanity draft document ${targetDraftId}...`);
  const patch = sanityClient.patch(targetDraftId);
  if (blocks.length > 0) {
    patch.set({ body: blocks });
  }
  patch.set({
    reviewStatus: 'superhuman_go_approved',
    lastReviewedAt: new Date().toISOString(),
  });

  const commitResult = await patch.commit();
  console.log(`✔ Draft successfully patched in Sanity (revision: ${commitResult._rev})`);

  // Update Supabase sync status if configured
  if (SUPABASE_URL && SUPABASE_KEY) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    await supabase
      .from('sanity_docs_sync')
      .update({
        review_status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('sanity_document_id', canonicalId);
    console.log(`✔ Supabase sync status updated to 'approved'`);
  }

  return { targetDraftId, revision: commitResult._rev, blocksCount: blocks.length };
}

async function run() {
  const args = process.argv.slice(2);
  let sanityId = null;
  let pageId = null;
  let isTest = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--sanity-id') sanityId = args[++i];
    if (args[i] === '--page-id') pageId = args[++i];
    if (args[i] === '--test') isTest = true;
  }

  if (isTest) {
    console.log('Running test reverse sync with sample reviewed Markdown...');
    const sampleMarkdown = `
> 📝 **Draft in Review by Superhuman Go**
> Apply edits directly.

## Executive Overview
Custom web development and technical SEO must work together to turn search traffic into booked calls.

### Why Speed Matters
- Sub-second first contentful paint directly reduces bounce rates.
- Clean structured data ensures answer engines cite your services accurately.

1. Audit site architecture.
2. Ground all claims in verifiable facts.
3. Track every lead end-to-end.

---
*Sanity Draft ID:* \`drafts.test-article\`  
*Target Production URL:* [https://ziaflow.com/posts/test](https://ziaflow.com/posts/test)
    `.trim();

    const blocks = parseMarkdownToPortableText(sampleMarkdown);
    console.log(`Parsed ${blocks.length} blocks successfully:`);
    console.log(JSON.stringify(blocks.slice(0, 3), null, 2));
    console.log('✔ Portable text parser verification passed.');
    return;
  }

  if (!sanityId && !pageId) {
    console.log(`
Usage:
  node scripts/sync-docs-to-sanity.mjs --sanity-id <id>
  node scripts/sync-docs-to-sanity.mjs --page-id <coda-page-id>
  node scripts/sync-docs-to-sanity.mjs --test
    `);
    process.exit(1);
  }

  await syncSingleArticle({ sanityId, pageId });
}

run().catch((err) => {
  console.error('Sync failed:', err.message);
  process.exit(1);
});

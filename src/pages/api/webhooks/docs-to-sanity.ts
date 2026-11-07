import type { APIRoute } from 'astro';
import { supabaseAdmin } from '~/lib/supabase-admin';
import { parseMarkdownToPortableText, normalizeSanityId } from '~/lib/integrations/sanity-docs.mjs';

export const prerender = false;

const json = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export const POST: APIRoute = async ({ request }) => {
  // 1. Authenticate webhook secret
  const configuredSecret = import.meta.env.DOCS_TO_SANITY_WEBHOOK_SECRET;
  if (!configuredSecret) {
    console.error('[docs-to-sanity] required webhook secret is not configured');
    return json({ error: 'Reverse sync integration is not configured' }, 503);
  }

  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim() || request.headers.get('x-docs-webhook-secret') || '';
  if (token !== configuredSecret) {
    return json({ error: 'Unauthorized' }, 401);
  }

  // 2. Parse payload
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid JSON payload' }, 400);
  }

  const pageId = typeof payload.pageId === 'string' ? payload.pageId.trim() : '';
  const rawSanityId = typeof payload.sanityId === 'string' ? payload.sanityId.trim() : '';
  const markdownContent = typeof payload.content === 'string' ? payload.content : '';
  const status = typeof payload.status === 'string' ? payload.status.toLowerCase().trim() : '';

  if (!pageId && !rawSanityId) {
    return json({ error: 'Missing pageId or sanityId' }, 400);
  }

  if (status && status !== 'approved' && status !== 'ready_for_sanity') {
    return json({ status: 'skipped', reason: `Status '${status}' is not approved for sync` }, 200);
  }

  // 3. Resolve Sanity Canonical ID
  let canonicalId = '';
  if (rawSanityId) {
    canonicalId = normalizeSanityId(rawSanityId).canonicalId;
  } else if (pageId && supabaseAdmin) {
    const { data: mapping } = await supabaseAdmin
      .from('sanity_docs_sync')
      .select('sanity_document_id')
      .eq('coda_page_id', pageId)
      .maybeSingle();

    if (mapping?.sanity_document_id) {
      canonicalId = mapping.sanity_document_id;
    }
  }

  if (!canonicalId) {
    return json({ error: 'Could not resolve matching Sanity document ID' }, 404);
  }

  // 4. Initialize Sanity Client
  const sanityToken = import.meta.env.SANITY_API_TOKEN;
  const sanityProjectId = import.meta.env.SANITY_PROJECT_ID || '92p0tpps';
  const sanityDataset = import.meta.env.SANITY_DATASET || 'production';

  if (!sanityToken) {
    console.error('[docs-to-sanity] missing SANITY_API_TOKEN');
    return json({ error: 'Sanity API token is not configured' }, 503);
  }

  try {
    const { createClient } = await import('@sanity/client');
    const sanityClient = createClient({
      projectId: sanityProjectId,
      dataset: sanityDataset,
      token: sanityToken,
      useCdn: false,
      apiVersion: '2026-11-04',
    });

    const targetDraftId = `drafts.${canonicalId}`;
    const blocks = parseMarkdownToPortableText(markdownContent);

    // 5. Patch Sanity draft document with reviewed blocks
    const patch = sanityClient.patch(targetDraftId);
    if (blocks.length > 0) {
      patch.set({ body: blocks });
    }
    patch.set({
      reviewStatus: 'superhuman_go_approved',
      lastReviewedAt: new Date().toISOString(),
    });

    const result = await patch.commit();

    // 6. Update sync tracking in Supabase
    if (supabaseAdmin) {
      await supabaseAdmin
        .from('sanity_docs_sync')
        .update({
          review_status: 'approved',
          updated_at: new Date().toISOString(),
        })
        .eq('sanity_document_id', canonicalId);
    }

    return json(
      {
        status: 'synced_to_sanity',
        sanityId: targetDraftId,
        blocksCount: blocks.length,
        revision: result._rev,
      },
      200
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to patch Sanity';
    console.error('[docs-to-sanity] patch error:', msg);
    return json({ error: msg }, 502);
  }
};

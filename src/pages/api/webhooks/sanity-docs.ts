import type { APIRoute } from 'astro';
import { supabaseAdmin } from '~/lib/supabase-admin';
import { buildPublishedPostMarkdown, verifySanityWebhookSignature } from '~/lib/integrations/sanity-docs.mjs';

export const prerender = false;

const MAX_BODY_BYTES = 1_000_000;
const PROCESSING_LEASE_MS = 5 * 60 * 1000;
const DOCS_API_ROOT = 'https://coda.io/apis/v1';

type JsonObject = Record<string, unknown>;

interface SanityPostWebhook {
  _id?: unknown;
  _rev?: unknown;
  _type?: unknown;
  _deleted?: unknown;
  _updatedAt?: unknown;
  title?: unknown;
  slug?: unknown;
  seoDescription?: unknown;
  bodyText?: unknown;
}

interface SyncRecord {
  sanity_document_id: string;
  coda_page_id: string | null;
  sanity_revision: string | null;
  sync_status: 'processing' | 'synced' | 'error';
  last_error: string | null;
  updated_at: string;
}

const json = (body: JsonObject, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

const asTrimmedString = (value: unknown, maxLength: number) =>
  typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, maxLength) : '';

const getSlug = (value: unknown) => {
  const raw = typeof value === 'string' ? value : typeof value === 'object' && value !== null ? (value as { current?: unknown }).current : '';
  const slug = asTrimmedString(raw, 250);
  return /^[a-zA-Z0-9][a-zA-Z0-9/_-]*$/.test(slug) ? slug.replace(/^\/+|\/+$/g, '') : '';
};

const apiUrl = (docId: string, suffix = '') =>
  `${DOCS_API_ROOT}/docs/${encodeURIComponent(docId)}/pages${suffix}`;

const docsRequest = async (url: string, token: string, body: JsonObject) => {
  const response = await fetch(url, {
    method: url.endsWith('/pages') ? 'POST' : 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    redirect: 'error',
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) throw new Error(`Docs API returned HTTP ${response.status}`);
  return response.json().catch(() => ({})) as Promise<{ id?: string }>;
};

const makePageBody = (markdown: string) => ({
  type: 'canvas',
  canvasContent: { format: 'markdown', content: markdown },
});

const createDocsPage = async (
  docId: string,
  token: string,
  parentPageId: string,
  title: string,
  summary: string,
  markdown: string
) => {
  const result = await docsRequest(apiUrl(docId), token, {
    name: title,
    ...(summary ? { subtitle: summary } : {}),
    ...(parentPageId ? { parentPageId } : {}),
    pageContent: makePageBody(markdown),
  });

  if (!result.id) throw new Error('Docs API accepted page creation without returning a page ID');
  return result.id;
};

const updateDocsPage = async (
  docId: string,
  pageId: string,
  token: string,
  title: string,
  summary: string,
  markdown: string
) => {
  await docsRequest(apiUrl(docId, `/${encodeURIComponent(pageId)}`), token, {
    name: title,
    ...(summary ? { subtitle: summary } : {}),
    contentUpdate: {
      insertionMode: 'replace',
      canvasContent: { format: 'markdown', content: markdown },
    },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const webhookSecret = import.meta.env.SANITY_DOCS_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[sanity-docs-webhook] required webhook secret is not configured');
    return json({ error: 'Integration is not configured' }, 503);
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) return json({ error: 'Request body is too large' }, 413);

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return json({ error: 'Could not read request body' }, 400);
  }

  if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) return json({ error: 'Request body is too large' }, 413);

  const signature = request.headers.get('sanity-webhook-signature');
  if (!verifySanityWebhookSignature(rawBody, signature, webhookSecret)) {
    return json({ error: 'Invalid or expired webhook signature' }, 401);
  }

  let payload: SanityPostWebhook;
  try {
    const parsed: unknown = JSON.parse(rawBody);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return json({ error: 'Expected a single Sanity document object' }, 400);
    }
    payload = parsed as SanityPostWebhook;
  } catch {
    return json({ error: 'Invalid JSON payload' }, 400);
  }

  const documentId = asTrimmedString(payload._id, 200);
  if (!documentId || documentId.startsWith('drafts.') || payload._deleted === true || payload._type !== 'post') {
    return json({ status: 'skipped', reason: 'Only published Sanity post documents are synchronized' }, 202);
  }

  const revision = asTrimmedString(payload._rev, 128);
  const title = asTrimmedString(payload.title, 200);
  const slug = getSlug(payload.slug);
  const summary = asTrimmedString(payload.seoDescription, 300);
  const bodyText = typeof payload.bodyText === 'string' ? payload.bodyText.slice(0, 200_000).trim() : '';

  if (!revision || !title || !slug) {
    return json({ error: 'Sanity post must include _rev, title, and a valid slug' }, 400);
  }

  const docsToken = import.meta.env.SUPERHUMAN_DOCS_API_TOKEN;
  const docsId = import.meta.env.SUPERHUMAN_DOCS_DOC_ID;
  const parentPageId = import.meta.env.SUPERHUMAN_DOCS_PARENT_PAGE_ID || '';
  if (!docsToken || !docsId) {
    console.error('[sanity-docs-webhook] required Docs API configuration is missing');
    return json({ error: 'Integration is not configured' }, 503);
  }

  if (!supabaseAdmin) {
    console.error('[sanity-docs-webhook] Supabase service client is unavailable');
    return json({ error: 'Sync state is unavailable' }, 503);
  }

  const sourceUrl = `https://ziaflow.com/${slug}`;
  const markdown = buildPublishedPostMarkdown({ summary, bodyText, sourceUrl });
  const now = new Date().toISOString();
  const table = supabaseAdmin.from('sanity_docs_sync');

  let pageId: string | null = null;
  let claimed = false;

  const { data: inserted, error: insertError } = await table
    .insert({
      sanity_document_id: documentId,
      coda_page_id: null,
      sanity_revision: null,
      sync_status: 'processing',
      last_error: null,
      updated_at: now,
    })
    .select('sanity_document_id, coda_page_id, sanity_revision, sync_status, last_error, updated_at')
    .maybeSingle();

  if (inserted) {
    claimed = true;
  } else if (insertError?.code === '23505') {
    const { data: existing, error: lookupError } = await table
      .select('sanity_document_id, coda_page_id, sanity_revision, sync_status, last_error, updated_at')
      .eq('sanity_document_id', documentId)
      .maybeSingle();

    if (lookupError || !existing) {
      console.error('[sanity-docs-webhook] could not read sync state');
      return json({ error: 'Sync state is unavailable' }, 503);
    }

    const current = existing as SyncRecord;
    if (current.sync_status === 'synced' && current.sanity_revision === revision) {
      return json({ status: 'unchanged', documentId }, 200);
    }

    const updatedAtMs = Date.parse(current.updated_at);
    if (
      current.sync_status === 'processing' &&
      Number.isFinite(updatedAtMs) &&
      Date.now() - updatedAtMs < PROCESSING_LEASE_MS
    ) {
      return json({ status: 'already_processing' }, 202);
    }

    const { data: claimedRow, error: claimError } = await table
      .update({ sync_status: 'processing', last_error: null, updated_at: now })
      .eq('sanity_document_id', documentId)
      .eq('sync_status', current.sync_status)
      .eq('updated_at', current.updated_at)
      .select('coda_page_id')
      .maybeSingle();

    if (claimError) {
      console.error('[sanity-docs-webhook] could not claim sync state');
      return json({ error: 'Sync state is unavailable' }, 503);
    }
    if (!claimedRow) return json({ status: 'already_processing' }, 202);

    pageId = typeof claimedRow.coda_page_id === 'string' ? claimedRow.coda_page_id : null;
    claimed = true;
  } else {
    console.error('[sanity-docs-webhook] could not create sync state');
    return json({ error: 'Sync state is unavailable' }, 503);
  }

  if (!claimed) return json({ status: 'already_processing' }, 202);

  try {
    if (pageId) {
      await updateDocsPage(docsId, pageId, docsToken, title, summary, markdown);
    } else {
      pageId = await createDocsPage(docsId, docsToken, parentPageId, title, summary, markdown);
    }

    const syncedAt = new Date().toISOString();
    const { error: saveError } = await table
      .update({
        coda_page_id: pageId,
        sanity_revision: revision,
        sync_status: 'synced',
        last_error: null,
        updated_at: syncedAt,
      })
      .eq('sanity_document_id', documentId)
      .eq('sync_status', 'processing');

    if (saveError) {
      console.error('[sanity-docs-webhook] Docs page synced but mapping could not be saved');
      return json({ error: 'Page synced but sync state could not be saved' }, 503);
    }

    return json({ status: 'synced', documentId }, 200);
  } catch (error) {
    const safeError = error instanceof Error ? error.message.slice(0, 200) : 'Sync failed';
    await table
      .update({ sync_status: 'error', last_error: safeError, updated_at: new Date().toISOString() })
      .eq('sanity_document_id', documentId)
      .eq('sync_status', 'processing');

    console.error('[sanity-docs-webhook] sync failed:', safeError);
    return json({ error: 'Could not synchronize the published post' }, 502);
  }
};

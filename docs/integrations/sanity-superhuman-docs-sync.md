# Sanity → Superhuman Docs sync

This integration mirrors **published Sanity blog posts** into one Superhuman Docs (Coda) document. Sanity remains the source of truth. The webhook updates a matching page on later revisions; it does not delete Docs pages when content is unpublished or deleted.

## Prerequisites

- The Astro site deployed on Vercel with its API route enabled.
- The site’s existing Supabase project, with the service-role environment variables already configured.
- A destination Superhuman Docs document and a Docs API token with write access limited to that document where possible.
- A Sanity webhook secret. Do not commit secrets or paste them into client-side code.

## 1. Create the sync-state table

Run [`supabase/sanity-docs-sync-setup.sql`](../../supabase/sanity-docs-sync-setup.sql) in the Supabase SQL editor. This is a manual database setup step; the application does not run migrations automatically.

## 2. Configure server-side environment variables

Set these in Vercel for the deployment environment you will test first:

- `SANITY_DOCS_WEBHOOK_SECRET` — same secret configured on the Sanity webhook.
- `SUPERHUMAN_DOCS_API_TOKEN` — Docs API bearer token; keep it server-only.
- `SUPERHUMAN_DOCS_DOC_ID` — destination Docs document ID.
- `SUPERHUMAN_DOCS_PARENT_PAGE_ID` — optional page ID to nest created pages under.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — the existing server-side Supabase settings.

The API token is sent to the documented Docs REST API at `https://coda.io/apis/v1`; it is never exposed to the browser.

## 3. Configure a Sanity webhook

Create a webhook for the Sanity project/dataset used by the site. Configure it to:

- **URL:** `https://ziaflow.com/api/webhooks/sanity-docs` (use the Vercel preview URL for initial testing).
- **Method:** `POST`; **content type:** JSON.
- **Triggers:** document create and update only. Do not enable delete triggers.
- **Filter:** `_type == "post" && !(_id in path("drafts.**"))`.
- **Projection:**

```groq
{
  "_id": _id,
  "_rev": _rev,
  "_type": _type,
  "_updatedAt": _updatedAt,
  "title": title,
  "slug": slug.current,
  "seoDescription": seoDescription,
  "bodyText": pt::text(body)
}
```

Set the webhook’s **secret** to the same value as `SANITY_DOCS_WEBHOOK_SECRET`. The endpoint verifies Sanity’s `sanity-webhook-signature` using the raw body, a five-minute timestamp window, and HMAC-SHA256 before processing the event.

## 4. Verify before enabling production sync

Run the local helper tests with:

```bash
npm run test:sanity-docs
```

Then test the webhook against a preview deployment and a non-production Docs document. Confirm that:

1. An invalid or expired signature is rejected.
2. A published post creates one page; a duplicate delivery does not create another page.
3. A subsequent revision updates that page’s title, subtitle, and Markdown content.
4. Drafts, non-post documents, and delete events are skipped.
5. Missing configuration, Supabase errors, and Docs API failures fail closed and are visible in server logs without logging tokens or article content.

After the Supabase table and Vercel secrets are configured and preview tests pass, enable the production Sanity webhook. This change does not configure hosted services or deploy the site by itself.

## Operational notes

- HTTP 401 means signature validation failed; 400 means the payload is malformed; 503 indicates missing configuration or sync-state availability; 502 indicates the Docs API call failed.
- A `processing` row older than five minutes can be reclaimed on a retry. Check the destination document before manually retrying a failed page-creation request if the API accepted the create but the response was lost.
- The Docs API queues page writes asynchronously. Verify the page in the destination document after the webhook reports success.
- Sanity’s Portable Text is projected to plain text using `pt::text`; rich text formatting is not retained in this initial version.

## References

- [Sanity webhook best practices](https://www.sanity.io/docs/content-lake/webhook-best-practices)
- [Superhuman Docs API](https://coda.io/developers/apis/v1)

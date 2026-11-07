# Sanity ↔ Superhuman Docs Bidirectional Editorial Sync

This integration establishes a draft-first, closed-loop editorial review workflow between **Sanity Content Lake** and **Superhuman Docs (Coda)** with **Superhuman Go** review:

1. **Create Draft in Sanity:** A writer or agent creates a draft in Sanity (`drafts.<id>`).
2. **Autocopy to Superhuman Docs:** The webhook triggers and creates or updates a matching page in Superhuman Docs under `Blog Planning & Editorial Staging` with `[Draft Review]` tagging.
3. **Superhuman Go Review:** Superhuman Go reviews the document against editorial, AEO/GEO citability, and brand guidelines, leaving suggestions or direct edits.
4. **Editorial Approval:** The human editor or reviewer sets the status in Superhuman Docs to `Approved`.
5. **Reverse Synchronization:** The approved Markdown content is parsed into Portable Text and synced back into the Sanity draft document in Sanity Content Lake.
6. **Publishing:** The editor reviews the final draft in Sanity Studio and publishes when ready.

---

## 1. Database Setup: Supabase

Execute [`supabase/sanity-docs-sync-setup.sql`](../../supabase/sanity-docs-sync-setup.sql) in your Supabase SQL Editor to track document mappings and review states:

```sql
create table if not exists public.sanity_docs_sync (
  sanity_document_id text primary key,
  coda_page_id text null,
  sanity_revision text null,
  is_draft boolean not null default false,
  review_status text not null default 'draft_in_review'
    check (review_status in ('draft_in_review', 'approved', 'published', 'error')),
  sync_status text not null default 'processing'
    check (sync_status in ('processing', 'synced', 'error')),
  last_error text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  synced_at timestamptz null
);

create index if not exists idx_sanity_docs_sync_page_id on public.sanity_docs_sync (coda_page_id);
```

---

## 2. Server Environment Variables

Configure these in Vercel / `.env`:

| Variable | Description |
| :--- | :--- |
| `SANITY_DOCS_WEBHOOK_SECRET` | Shared secret for incoming Sanity webhooks (HMAC-SHA256 signature verification). |
| `SUPERHUMAN_DOCS_API_TOKEN` | Bearer token for Superhuman Docs / Coda REST API (`https://coda.io/apis/v1`). |
| `SUPERHUMAN_DOCS_DOC_ID` | Destination Docs document ID (e.g. `_d7Yff0Q1Ld2`). |
| `SUPERHUMAN_DOCS_PARENT_PAGE_ID` | Optional page ID to nest created published pages under. |
| `SUPERHUMAN_DOCS_DRAFT_PARENT_PAGE_ID`| Optional page ID to nest draft review pages under. |
| `DOCS_TO_SANITY_WEBHOOK_SECRET` | Secret token for incoming approval webhooks from Superhuman Docs. |
| `SANITY_API_TOKEN` | Editor API token for updating Sanity Content Lake (`92p0tpps`). |
| `SANITY_PROJECT_ID` | Sanity Project ID (`92p0tpps`). |
| `SANITY_DATASET` | Sanity Dataset (`production`). |

---

## 3. Sanity Webhook Setup (Draft & Published Sync)

In [sanity.io/manage](https://www.sanity.io/manage), configure the webhook:

- **URL:** `https://ziaflow.com/api/webhooks/sanity-docs`
- **Method:** `POST`
- **Triggers:** Document create and update.
- **Filter:** `_type == "post"`
- **Projection:**
  ```groq
  {
    "_id": _id,
    "_rev": _rev,
    "_type": _type,
    "title": title,
    "slug": slug.current,
    "publishedAt": publishedAt,
    "seoDescription": seoDescription,
    "bodyText": pt::text(body)
  }
  ```
- **Secret:** Same value as `SANITY_DOCS_WEBHOOK_SECRET`.

---

## 4. Superhuman Docs $\rightarrow$ Sanity Reverse Sync

When an article is approved in Superhuman Docs:

### Automated Webhook Route:
An automation rule in Superhuman Docs sends a POST to `https://ziaflow.com/api/webhooks/docs-to-sanity` with:
```json
{
  "sanityId": "72beeec0-94d8-4b0a",
  "pageId": "canvas-page-id",
  "status": "approved",
  "content": "# Updated Title\n\nApproved markdown content..."
}
```

### CLI / Script Runner:
You can also run reverse sync on demand:
```bash
# Sync specific article by Sanity ID
node scripts/sync-docs-to-sanity.mjs --sanity-id 72beeec0-94d8-4b0a

# Sync by Superhuman Docs page ID
node scripts/sync-docs-to-sanity.mjs --page-id canvas-page-id

# Test markdown to Portable Text parser
node scripts/sync-docs-to-sanity.mjs --test
```

---

## 5. Verification Checklist

Run local automated tests:
```bash
node tests/sanity-docs-sync.test.mjs
```

Verify the 6 steps on a single test article:
1. Create a draft in Sanity (`drafts.test-pilot-sync`).
2. Verify it appears in Superhuman Docs with `[Draft Review]` title and editorial banner.
3. Have Superhuman Go review and add edits.
4. Mark the page as `Approved`.
5. Run reverse sync and confirm the Sanity draft receives the updated Portable Text body.
6. Open Sanity Studio and publish when satisfied.

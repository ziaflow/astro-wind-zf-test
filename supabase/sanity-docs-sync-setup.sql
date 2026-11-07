-- Run once in the Supabase SQL editor before enabling the Sanity webhook.
-- The table stores sync metadata, review status, and the destination Docs page ID.

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

-- Index for reverse lookup from Superhuman Docs page ID to Sanity Document ID
create index if not exists idx_sanity_docs_sync_page_id on public.sanity_docs_sync (coda_page_id);

alter table public.sanity_docs_sync enable row level security;
revoke all on table public.sanity_docs_sync from anon, authenticated;
grant all on table public.sanity_docs_sync to service_role;

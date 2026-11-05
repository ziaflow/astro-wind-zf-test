-- Run once in the Supabase SQL editor before enabling the Sanity webhook.
-- The table stores only sync metadata and the destination Docs page ID, not article content.

create table if not exists public.sanity_docs_sync (
  sanity_document_id text primary key,
  coda_page_id text null,
  sanity_revision text null,
  sync_status text not null default 'processing'
    check (sync_status in ('processing', 'synced', 'error')),
  last_error text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  synced_at timestamptz null
);

alter table public.sanity_docs_sync enable row level security;
revoke all on table public.sanity_docs_sync from anon, authenticated;
grant all on table public.sanity_docs_sync to service_role;

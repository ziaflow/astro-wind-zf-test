-- DRAFT migration: NOT applied. Review against the live schema/RLS before running.
-- Stage 1 (repair persistence): one submission -> one receipt -> one linked lead.
-- Assumes public.leads already exists (columns unverified; live schema inspection pending).

create table if not exists public.lead_submissions (
  id                  uuid primary key default gen_random_uuid(),
  dedup_key           text not null unique,
  status              text not null default 'received'
                        check (status in ('received', 'validated', 'persisted', 'rejected')),
  is_test             boolean not null default false,
  source              text not null default 'website_contact_form',
  page_submitted_from text,
  payload             jsonb not null,          -- restricted: contains personal information
  error_detail        text,
  schema_version      smallint not null default 1,
  received_at         timestamptz not null default now(),
  persisted_at        timestamptz
);

-- RLS on with no policies: only the service role (server intake) can read or write.
alter table public.lead_submissions enable row level security;

-- Link each lead to exactly one receipt. UNIQUE permits multiple NULLs, so legacy leads are unaffected.
alter table public.leads
  add column if not exists submission_id uuid unique references public.lead_submissions (id),
  add column if not exists is_test boolean not null default false;

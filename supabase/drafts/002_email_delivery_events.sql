-- Migration 002: Customer.io Email Delivery Telemetry
-- Stores delivery, open, bounce, and click receipts back into Supabase for closed-loop attribution.

create table if not exists public.email_delivery_events (
  id            uuid primary key default gen_random_uuid(),
  event_id      text not null unique,
  event_type    text not null,                     -- 'email_delivered', 'email_opened', 'email_bounced', 'email_failed', etc.
  recipient     text not null,
  delivery_id   text,
  action_id     text,
  campaign_id   text,
  subject       text,
  occurred_at   timestamptz not null default now(),
  recorded_at   timestamptz not null default now(),
  payload       jsonb not null
);

-- RLS: Service role only (ingested by serverless webhook handler)
alter table public.email_delivery_events enable row level security;

-- Index for fast lookup by recipient and delivery outcome
create index if not exists idx_email_delivery_events_recipient on public.email_delivery_events (recipient);
create index if not exists idx_email_delivery_events_type on public.email_delivery_events (event_type);
create index if not exists idx_email_delivery_events_delivery_id on public.email_delivery_events (delivery_id);

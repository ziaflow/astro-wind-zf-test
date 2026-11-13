-- Add Bing Webmaster Tools support to Supabase telemetry tables.
-- Keeps strict service_role-only RLS matching existing reporting tables.

alter table public.analytics_source_snapshots
  drop constraint if exists analytics_source_snapshots_source_check;

alter table public.analytics_source_snapshots
  add constraint analytics_source_snapshots_source_check
  check (source in ('gsc', 'ga4', 'bing'));

create table if not exists public.metrics_bing_daily (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  page_path text not null,
  query text not null default '',
  clicks integer not null default 0,
  impressions integer not null default 0,
  avg_position numeric,
  captured_at timestamptz not null default now(),
  unique (date, page_path, query)
);

alter table public.metrics_bing_daily enable row level security;
revoke all on public.metrics_bing_daily from public, anon, authenticated;
grant select, insert, update on public.metrics_bing_daily to service_role;

create policy metrics_bing_daily_service
  on public.metrics_bing_daily
  for all
  to service_role
  using (true)
  with check (true);

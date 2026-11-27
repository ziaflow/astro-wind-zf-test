-- Apply only after review; this does not alter existing metric tables.
create table public.google_metrics_receipts (
  id uuid primary key,
  source text not null check (source in ('ga4', 'gsc')),
  property text not null,
  reporting_date date not null,
  status text not null check (status in ('success', 'empty', 'failed')),
  rows_written integer check (rows_written is null or rows_written >= 0),
  created_at timestamptz not null default now(),
  check ((status = 'failed' and rows_written is null) or
         (status = 'empty' and rows_written is not null and rows_written = 0) or
         (status = 'success' and rows_written is not null and rows_written > 0))
);
create index google_metrics_receipts_latest_idx on public.google_metrics_receipts
  (source, property, reporting_date desc, created_at desc, id desc);
alter table public.google_metrics_receipts enable row level security;
revoke all on public.google_metrics_receipts from public, anon, authenticated;
grant select, insert on public.google_metrics_receipts to service_role;

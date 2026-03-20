-- Run this in your Supabase SQL Editor.
-- This file sets up:
-- 1. Public contact form submissions
-- 2. Analytics ingestion state for GSC, GA4, Clarity, etc.
-- 3. Daily normalized metrics for pages and queries
-- 4. Agent execution logs, findings, and recommendations
-- 5. Content change tracking for SEO/content optimization workflows

create extension if not exists pgcrypto;

create table if not exists public.contact_submissions (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  name text null,
  email text null,
  phone text null,
  message text null,
  metadata jsonb null,
  constraint contact_submissions_pkey primary key (id)
);

alter table public.contact_submissions enable row level security;

drop policy if exists "Enable insert for all users" on public.contact_submissions;
create policy "Enable insert for all users"
on public.contact_submissions
as permissive
for insert
to public
with check (true);

create table if not exists public.analytics_properties (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  source text not null,
  property_key text not null,
  display_name text not null,
  site_url text null,
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  constraint analytics_properties_pkey primary key (id),
  constraint analytics_properties_source_check check (
    source in ('google_search_console', 'google_analytics', 'microsoft_clarity', 'google_ads', 'microsoft_ads', 'custom')
  ),
  constraint analytics_properties_source_property_key_key unique (source, property_key)
);

create table if not exists public.analytics_sync_runs (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  source text not null,
  property_id uuid null references public.analytics_properties(id) on delete set null,
  sync_type text not null,
  status text not null default 'running',
  started_at timestamp with time zone not null default now(),
  finished_at timestamp with time zone null,
  window_start date null,
  window_end date null,
  records_processed integer not null default 0,
  error_message text null,
  metadata jsonb not null default '{}'::jsonb,
  constraint analytics_sync_runs_pkey primary key (id),
  constraint analytics_sync_runs_source_check check (
    source in ('google_search_console', 'google_analytics', 'microsoft_clarity', 'google_ads', 'microsoft_ads', 'custom')
  ),
  constraint analytics_sync_runs_status_check check (
    status in ('running', 'succeeded', 'failed', 'partial')
  )
);

create table if not exists public.analytics_pages (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  canonical_url text not null,
  url_path text null,
  page_type text null,
  title text null,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  constraint analytics_pages_pkey primary key (id),
  constraint analytics_pages_canonical_url_key unique (canonical_url)
);

create table if not exists public.analytics_queries (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  query_text text not null,
  normalized_query text not null,
  intent text null,
  metadata jsonb not null default '{}'::jsonb,
  constraint analytics_queries_pkey primary key (id),
  constraint analytics_queries_normalized_query_key unique (normalized_query)
);

create table if not exists public.search_console_page_metrics_daily (
  id uuid not null default gen_random_uuid(),
  metric_date date not null,
  property_id uuid not null references public.analytics_properties(id) on delete cascade,
  page_id uuid not null references public.analytics_pages(id) on delete cascade,
  clicks integer not null default 0,
  impressions integer not null default 0,
  ctr numeric(8,5) null,
  average_position numeric(10,4) null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  constraint search_console_page_metrics_daily_pkey primary key (id),
  constraint search_console_page_metrics_daily_unique unique (metric_date, property_id, page_id)
);

create table if not exists public.search_console_query_metrics_daily (
  id uuid not null default gen_random_uuid(),
  metric_date date not null,
  property_id uuid not null references public.analytics_properties(id) on delete cascade,
  query_id uuid not null references public.analytics_queries(id) on delete cascade,
  page_id uuid null references public.analytics_pages(id) on delete cascade,
  country text null,
  device text null,
  clicks integer not null default 0,
  impressions integer not null default 0,
  ctr numeric(8,5) null,
  average_position numeric(10,4) null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  constraint search_console_query_metrics_daily_pkey primary key (id),
  constraint search_console_query_metrics_daily_unique unique (metric_date, property_id, query_id, page_id, country, device)
);

create table if not exists public.ga4_page_metrics_daily (
  id uuid not null default gen_random_uuid(),
  metric_date date not null,
  property_id uuid not null references public.analytics_properties(id) on delete cascade,
  page_id uuid not null references public.analytics_pages(id) on delete cascade,
  sessions integer not null default 0,
  users_count integer not null default 0,
  new_users integer not null default 0,
  engaged_sessions integer not null default 0,
  engagement_rate numeric(8,5) null,
  average_engagement_time_seconds numeric(12,2) null,
  conversions integer not null default 0,
  key_event_count integer not null default 0,
  revenue numeric(14,2) null,
  bounce_rate numeric(8,5) null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  constraint ga4_page_metrics_daily_pkey primary key (id),
  constraint ga4_page_metrics_daily_unique unique (metric_date, property_id, page_id)
);

create table if not exists public.clarity_page_metrics_daily (
  id uuid not null default gen_random_uuid(),
  metric_date date not null,
  property_id uuid not null references public.analytics_properties(id) on delete cascade,
  page_id uuid not null references public.analytics_pages(id) on delete cascade,
  sessions integer not null default 0,
  rage_clicks integer not null default 0,
  dead_clicks integer not null default 0,
  excessive_scrolls integer not null default 0,
  quick_backs integer not null default 0,
  average_scroll_depth numeric(8,2) null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  constraint clarity_page_metrics_daily_pkey primary key (id),
  constraint clarity_page_metrics_daily_unique unique (metric_date, property_id, page_id)
);

create table if not exists public.content_change_log (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  page_id uuid null references public.analytics_pages(id) on delete set null,
  content_system text not null default 'sanity',
  content_key text not null,
  change_type text not null,
  initiated_by text not null,
  summary text not null,
  source_reference text null,
  metadata jsonb not null default '{}'::jsonb,
  constraint content_change_log_pkey primary key (id),
  constraint content_change_log_change_type_check check (
    change_type in ('create', 'update', 'publish', 'unpublish', 'metadata', 'internal_linking', 'refresh', 'experiment')
  ),
  constraint content_change_log_initiated_by_check check (
    initiated_by in ('human', 'agent', 'workflow')
  )
);

create table if not exists public.agent_runs (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  agent_name text not null,
  run_type text not null,
  status text not null default 'running',
  started_at timestamp with time zone not null default now(),
  finished_at timestamp with time zone null,
  trigger_source text not null default 'schedule',
  input_payload jsonb not null default '{}'::jsonb,
  output_summary text null,
  error_message text null,
  metadata jsonb not null default '{}'::jsonb,
  constraint agent_runs_pkey primary key (id),
  constraint agent_runs_status_check check (
    status in ('running', 'succeeded', 'failed', 'partial', 'skipped')
  ),
  constraint agent_runs_trigger_source_check check (
    trigger_source in ('schedule', 'manual', 'webhook', 'workflow')
  )
);

create table if not exists public.agent_findings (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  agent_run_id uuid null references public.agent_runs(id) on delete set null,
  page_id uuid null references public.analytics_pages(id) on delete set null,
  query_id uuid null references public.analytics_queries(id) on delete set null,
  finding_type text not null,
  severity text not null default 'medium',
  title text not null,
  summary text not null,
  evidence jsonb not null default '{}'::jsonb,
  status text not null default 'open',
  metadata jsonb not null default '{}'::jsonb,
  constraint agent_findings_pkey primary key (id),
  constraint agent_findings_severity_check check (
    severity in ('low', 'medium', 'high', 'critical')
  ),
  constraint agent_findings_status_check check (
    status in ('open', 'reviewed', 'accepted', 'dismissed', 'implemented')
  )
);

create table if not exists public.recommendations (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  agent_run_id uuid null references public.agent_runs(id) on delete set null,
  page_id uuid null references public.analytics_pages(id) on delete set null,
  query_id uuid null references public.analytics_queries(id) on delete set null,
  recommendation_type text not null,
  priority integer not null default 5,
  title text not null,
  summary text not null,
  proposed_change jsonb not null default '{}'::jsonb,
  expected_impact text null,
  status text not null default 'proposed',
  approved_by text null,
  approved_at timestamp with time zone null,
  implemented_at timestamp with time zone null,
  metadata jsonb not null default '{}'::jsonb,
  constraint recommendations_pkey primary key (id),
  constraint recommendations_priority_check check (priority between 1 and 10),
  constraint recommendations_status_check check (
    status in ('proposed', 'approved', 'rejected', 'implemented', 'archived')
  )
);

create table if not exists public.recommendation_evidence (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  recommendation_id uuid not null references public.recommendations(id) on delete cascade,
  evidence_type text not null,
  source text not null,
  source_record_id text null,
  summary text null,
  payload jsonb not null default '{}'::jsonb,
  constraint recommendation_evidence_pkey primary key (id)
);

create table if not exists public.recommendation_impacts (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  recommendation_id uuid not null references public.recommendations(id) on delete cascade,
  measured_at timestamp with time zone not null default now(),
  comparison_window text not null,
  metric_name text not null,
  before_value numeric(14,4) null,
  after_value numeric(14,4) null,
  delta_value numeric(14,4) null,
  delta_percent numeric(14,4) null,
  metadata jsonb not null default '{}'::jsonb,
  constraint recommendation_impacts_pkey primary key (id)
);

create index if not exists analytics_properties_source_idx on public.analytics_properties(source);
create index if not exists analytics_sync_runs_source_started_at_idx on public.analytics_sync_runs(source, started_at desc);
create index if not exists analytics_pages_url_path_idx on public.analytics_pages(url_path);
create index if not exists analytics_queries_normalized_query_idx on public.analytics_queries(normalized_query);
create index if not exists sc_page_metrics_date_idx on public.search_console_page_metrics_daily(metric_date desc);
create index if not exists sc_query_metrics_date_idx on public.search_console_query_metrics_daily(metric_date desc);
create index if not exists ga4_page_metrics_date_idx on public.ga4_page_metrics_daily(metric_date desc);
create index if not exists clarity_page_metrics_date_idx on public.clarity_page_metrics_daily(metric_date desc);
create index if not exists agent_runs_agent_name_started_at_idx on public.agent_runs(agent_name, started_at desc);
create index if not exists agent_findings_status_severity_idx on public.agent_findings(status, severity);
create index if not exists recommendations_status_priority_idx on public.recommendations(status, priority desc);
create index if not exists content_change_log_content_key_idx on public.content_change_log(content_key);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists analytics_properties_set_updated_at on public.analytics_properties;
create trigger analytics_properties_set_updated_at
before update on public.analytics_properties
for each row
execute function public.set_updated_at();

drop trigger if exists analytics_pages_set_updated_at on public.analytics_pages;
create trigger analytics_pages_set_updated_at
before update on public.analytics_pages
for each row
execute function public.set_updated_at();

drop trigger if exists analytics_queries_set_updated_at on public.analytics_queries;
create trigger analytics_queries_set_updated_at
before update on public.analytics_queries
for each row
execute function public.set_updated_at();

drop trigger if exists recommendations_set_updated_at on public.recommendations;
create trigger recommendations_set_updated_at
before update on public.recommendations
for each row
execute function public.set_updated_at();

alter table public.analytics_properties enable row level security;
alter table public.analytics_sync_runs enable row level security;
alter table public.analytics_pages enable row level security;
alter table public.analytics_queries enable row level security;
alter table public.search_console_page_metrics_daily enable row level security;
alter table public.search_console_query_metrics_daily enable row level security;
alter table public.ga4_page_metrics_daily enable row level security;
alter table public.clarity_page_metrics_daily enable row level security;
alter table public.content_change_log enable row level security;
alter table public.agent_runs enable row level security;
alter table public.agent_findings enable row level security;
alter table public.recommendations enable row level security;
alter table public.recommendation_evidence enable row level security;
alter table public.recommendation_impacts enable row level security;

-- These tables are intended for server-side access through the service role.
-- No public read/write policies are added for analytics and agent tables.

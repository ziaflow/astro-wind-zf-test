-- Run this in your Supabase SQL Editor

create table public.contact_submissions (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  name text null,
  email text null,
  phone text null,
  message text null,
  metadata jsonb null,
  constraint contact_submissions_pkey primary key (id)
);

-- Turn on Row Level Security
alter table "public"."contact_submissions" enable row level security;

-- Allow anonymous inserts (so your public form can write to it)
create policy "Enable insert for all users"
on "public"."contact_submissions"
as permissive
for insert
to public
with check (true);

-- ---------------------------------------------------------------------------
-- Leads table (used by the lead-nurturing Supabase Edge Function)
-- ---------------------------------------------------------------------------

create table public.leads (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  first_name text null,
  last_name text null,
  email text not null,
  company text null,
  phone text null,
  source text null,
  message text null,
  nurturing_sent_at timestamp with time zone null,
  constraint leads_pkey primary key (id),
  constraint leads_email_check check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- Turn on Row Level Security
alter table "public"."leads" enable row level security;

-- Allow anonymous inserts from public forms
create policy "Enable insert for all users"
on "public"."leads"
as permissive
for insert
to public
with check (true);

-- ---------------------------------------------------------------------------
-- Database Webhook: invoke the lead-nurturing Edge Function on new lead inserts
--
-- After deploying the Edge Function, create a Database Webhook in the Supabase
-- dashboard (Database → Webhooks → Create a new hook) with these settings:
--
--   Name:     lead-nurturing
--   Table:    leads
--   Events:   INSERT
--   URL:      https://<project-ref>.supabase.co/functions/v1/lead-nurturing
--   Headers:  Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
--
-- Alternatively, use pg_net to call the function directly from a trigger:
-- ---------------------------------------------------------------------------

-- Enable the pg_net extension if not already enabled
-- create extension if not exists pg_net with schema extensions;

-- create or replace function public.notify_lead_nurturing()
-- returns trigger
-- language plpgsql
-- security definer
-- as $$
-- begin
--   perform net.http_post(
--     url := current_setting('app.settings.edge_function_url') || '/lead-nurturing',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
--     ),
--     body := jsonb_build_object(
--       'type', 'INSERT',
--       'table', 'leads',
--       'schema', 'public',
--       'record', row_to_json(new),
--       'old_record', null
--     )
--   );
--   return new;
-- end;
-- $$;

-- create trigger on_lead_insert
--   after insert on public.leads
--   for each row execute procedure public.notify_lead_nurturing();


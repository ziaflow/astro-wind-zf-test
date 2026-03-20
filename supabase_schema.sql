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

-- ============================================================
-- Leads table + autonomous lead-nurture trigger
-- ============================================================

create table if not exists public.leads (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  first_name text null,
  last_name text null,
  email text not null,
  phone text null,
  company_name text null,
  source text null,
  metadata jsonb null,
  nurtured boolean not null default false,
  constraint leads_pkey primary key (id)
);

-- Turn on Row Level Security
alter table "public"."leads" enable row level security;

-- Allow anonymous inserts (so public lead-capture forms can write to it)
create policy "Enable insert for all users"
on "public"."leads"
as permissive
for insert
to public
with check (true);

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION public.trigger_lead_nurture()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    PERFORM
      net.http_post(
        url := current_setting('app.supabase_url') || '/functions/v1/lead-nurture-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
        ),
        body := jsonb_build_object('record', row_to_json(NEW))
      );
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but allow the INSERT to succeed
    RAISE WARNING 'trigger_lead_nurture: failed to call lead-nurture-email: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Bind it to the leads table
CREATE TRIGGER on_lead_created
AFTER INSERT ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.trigger_lead_nurture();

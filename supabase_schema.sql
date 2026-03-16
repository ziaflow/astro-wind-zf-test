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
-- Database Webhook: fire lead-nurture-email Edge Function on every new lead
-- ---------------------------------------------------------------------------
-- Create this webhook via the Supabase Dashboard → Database → Webhooks, or
-- run the SQL below (requires the pg_net extension which Supabase enables by default).
--
-- Replace <PROJECT_REF> with your Supabase project reference (e.g. abcdefghijklmno).
-- Replace <SUPABASE_ANON_KEY> with your project's anon/service-role key.
--
-- CREATE OR REPLACE FUNCTION public.notify_lead_nurture_email()
-- RETURNS trigger
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- AS $$
-- BEGIN
--   PERFORM net.http_post(
--     url    := 'https://<PROJECT_REF>.supabase.co/functions/v1/lead-nurture-email',
--     headers := jsonb_build_object(
--       'Content-Type',  'application/json',
--       'Authorization', 'Bearer <SUPABASE_ANON_KEY>'
--     ),
--     body   := jsonb_build_object(
--       'type',   'INSERT',
--       'table',  TG_TABLE_NAME,
--       'schema', TG_TABLE_SCHEMA,
--       'record', row_to_json(NEW)
--     )
--   );
--   RETURN NEW;
-- END;
-- $$;
--
-- CREATE TRIGGER on_contact_submission_insert
-- AFTER INSERT ON public.contact_submissions
-- FOR EACH ROW EXECUTE FUNCTION public.notify_lead_nurture_email();

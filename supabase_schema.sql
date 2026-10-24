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

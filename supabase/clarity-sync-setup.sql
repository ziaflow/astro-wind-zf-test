-- Applied setup reference. Provision Vault secrets separately; never put token values here.
create extension if not exists pg_cron;
create schema if not exists clarity_private;
revoke all on schema clarity_private from public, anon, authenticated;
grant usage on schema clarity_private to service_role;

create table public.clarity_sync_runs (
 id uuid primary key default gen_random_uuid(),
 slot bigint not null unique,
 quota_date date not null default (now() at time zone 'UTC')::date,
 started_at timestamptz not null default now(),
 finished_at timestamptz,
 status text not null default 'running' check(status in ('running','success','failed')),
 rows_written integer not null default 0,
 error_code text,
 payload jsonb
);
create index clarity_sync_runs_date_idx on public.clarity_sync_runs(quota_date);
alter table public.clarity_sync_runs enable row level security;
revoke all on public.clarity_sync_runs from public,anon,authenticated;
grant select,insert,update on public.clarity_sync_runs to service_role;

create function clarity_private.config() returns jsonb language sql security definer set search_path='' as $$
 select jsonb_object_agg(name,decrypted_secret) from vault.decrypted_secrets
 where name in ('ziaflow_clarity_token','ziaflow_clarity_sync_key');
$$;
revoke all on function clarity_private.config() from public,anon,authenticated;
grant execute on function clarity_private.config() to service_role;
create function public.clarity_sync_config() returns jsonb language sql security invoker set search_path='' as $$
 select clarity_private.config();
$$;
revoke all on function public.clarity_sync_config() from public,anon,authenticated;
grant execute on function public.clarity_sync_config() to service_role;

create function public.clarity_claim_sync() returns uuid language plpgsql security invoker set search_path='' as $$
declare run_id uuid; slot_id bigint := floor(extract(epoch from now())/8640);
begin
 perform pg_advisory_xact_lock(2711989);
 if (select count(*) from public.clarity_sync_runs where quota_date=(now() at time zone 'UTC')::date)>=10 then return null; end if;
 insert into public.clarity_sync_runs(slot) values(slot_id) on conflict(slot) do nothing returning id into run_id;
 return run_id;
end;
$$;
revoke all on function public.clarity_claim_sync() from public,anon,authenticated;
grant execute on function public.clarity_claim_sync() to service_role;

create function clarity_private.invoke_sync() returns bigint language sql security definer set search_path='' as $$
 select net.http_post(
 url:='https://ruhnueopjedaywiqhpgi.supabase.co/functions/v1/clarity-sync',
 headers:=jsonb_build_object('Content-Type','application/json','x-sync-key',
 (select decrypted_secret from vault.decrypted_secrets where name='ziaflow_clarity_sync_key')),
 body:='{}'::jsonb, timeout_milliseconds:=60000);
$$;
revoke all on function clarity_private.invoke_sync() from public,anon,authenticated,service_role;

create policy clarity_sync_service_access on public.clarity_sync_runs for all to service_role using (true) with check (true);
select cron.schedule('ziaflow-clarity-0017-1217','17 0,12 * * *','select clarity_private.invoke_sync();');
select cron.schedule('ziaflow-clarity-0241-1441','41 2,14 * * *','select clarity_private.invoke_sync();');
select cron.schedule('ziaflow-clarity-0505-1705','5 5,17 * * *','select clarity_private.invoke_sync();');
select cron.schedule('ziaflow-clarity-0729-1929','29 7,19 * * *','select clarity_private.invoke_sync();');
select cron.schedule('ziaflow-clarity-0953-2153','53 9,21 * * *','select clarity_private.invoke_sync();');

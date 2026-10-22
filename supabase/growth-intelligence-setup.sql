create table public.analytics_source_snapshots (
 id uuid primary key default gen_random_uuid(),
 source text not null check(source in ('gsc','ga4')),
 property text not null,
 period_start date not null,
 period_end date not null,
 grain text not null default 'period_aggregate' check(grain in ('period_aggregate','daily')),
 captured_at timestamptz not null default now(),
 payload jsonb not null,
 limitations jsonb not null default '[]'::jsonb,
 unique(source,property,period_start,period_end,grain),
 check(period_end>=period_start)
);
alter table public.analytics_source_snapshots enable row level security;
revoke all on public.analytics_source_snapshots from public,anon,authenticated;
grant select,insert,update on public.analytics_source_snapshots to service_role;
create policy analytics_snapshot_service on public.analytics_source_snapshots for all to service_role using(true) with check(true);

create table public.website_optimization_findings (
 id uuid primary key default gen_random_uuid(),
 fingerprint text not null unique,
 agent_role text not null check(agent_role in ('monitor','behavior_researcher','optimizer')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 status text not null default 'open' check(status in ('open','researching','ready_for_pr','draft_pr','measuring','resolved','insufficient_data')),
 title text not null,
 page_path text,
 evidence jsonb not null default '{}'::jsonb,
 hypothesis text,
 suggested_change text,
 primary_metric text,
 guardrails jsonb not null default '{}'::jsonb,
 pr_url text,
 baseline_start date,
 baseline_end date
);
alter table public.website_optimization_findings enable row level security;
revoke all on public.website_optimization_findings from public,anon,authenticated;
grant select,insert,update on public.website_optimization_findings to service_role;
create policy website_findings_service on public.website_optimization_findings for all to service_role using(true) with check(true);

create view public.website_lead_observations with(security_invoker=true) as
 select 'submission:'||s.id::text as observation_id, s.created_at as occurred_at,
 coalesce(s.metadata->>'source_page',s.metadata->>'page_url',s.metadata->>'page','/contact') as page_path,
 s.form_id,
 (coalesce(s.metadata->>'is_test','false')='true'
 or coalesce(s.payload->>'name','') ilike 'ZIAFLOW QA%'
 or coalesce(s.payload->>'email','') ilike '%@example.com') as is_test,
 'form_submission'::text as event_type,
 s.status as intake_status,
 'recorded_submission'::text as evidence_quality
 from public.contact_submissions s
 union all
 select 'lead:'||l.id::text,l.created_at,coalesce(l.page_submitted_from,'/'),'legacy_lead',
 (coalesce(l.name,'') ilike '%test%' or coalesce(l.name,'') ilike 'ZIAFLOW QA%' or l.email ilike '%@example.com'),
 'lead_record',l.status,'unverified_legacy_lead'
 from public.leads l
 where not exists (
 select 1 from public.contact_submissions s
 where lower(s.payload->>'email')=lower(l.email)
 and abs(extract(epoch from (s.created_at-l.created_at)))<600
 );
revoke all on public.website_lead_observations from public,anon,authenticated;
grant select on public.website_lead_observations to service_role;

create view public.website_confirmed_leads_daily with(security_invoker=true) as
 select (occurred_at at time zone 'America/Phoenix')::date as date,page_path,
 count(*) filter(where not is_test and evidence_quality='recorded_submission') as confirmed_form_submissions,
 count(*) filter(where is_test) as test_observations,
 count(*) filter(where not is_test and evidence_quality='unverified_legacy_lead') as unverified_legacy_leads
 from public.website_lead_observations group by 1,2;
revoke all on public.website_confirmed_leads_daily from public,anon,authenticated;
grant select on public.website_confirmed_leads_daily to service_role;

create function public.record_website_contact(p_id uuid,p_payload jsonb,p_metadata jsonb)
returns uuid language plpgsql security invoker set search_path='' as $$
declare existing_email text; lead_id uuid:=gen_random_uuid();
begin
 select payload->>'email' into existing_email from public.contact_submissions where id=p_id;
 if found then
  if lower(existing_email)<>lower(p_payload->>'email') then raise exception 'submission_conflict'; end if;
  return p_id;
 end if;
 insert into public.contact_submissions(id,form_id,payload,metadata,status)
 values(p_id,'contact-form',p_payload,p_metadata||jsonb_build_object('lead_id',lead_id),'new');
 insert into public.leads(id,name,email,phone,company_name,service_needed,comments,page_submitted_from,status,score)
 values(lead_id,nullif(p_payload->>'name',''),p_payload->>'email',nullif(p_payload->>'phone',''),nullif(p_payload->>'company',''),
 coalesce(nullif(p_payload->>'service_interest',''),'Contact Inquiry'),nullif(p_payload->>'message',''),
 coalesce(p_metadata->>'source_page','/contact'),'new',10);
 return p_id;
end;
$$;
revoke all on function public.record_website_contact(uuid,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.record_website_contact(uuid,jsonb,jsonb) to service_role;

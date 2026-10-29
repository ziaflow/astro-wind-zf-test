-- Read-only, on-demand audit for ruhnueopjedaywiqhpgi. No source payloads or lead rows.
-- This is not a collector, scheduled job, migration, or permission repair.
BEGIN READ ONLY;
SET LOCAL statement_timeout = '10s';
WITH expected(name) AS (
  VALUES ('view_unified_page_intelligence'),
         ('website_lead_observations'),
         ('website_confirmed_leads_daily')
), access AS (
  SELECT e.name, c.oid IS NOT NULL AS object_exists,
         COALESCE(c.reloptions @> ARRAY['security_invoker=true'], false) AS security_invoker,
         CASE WHEN c.oid IS NOT NULL THEN has_table_privilege('anon', c.oid, 'SELECT') END AS anon_select,
         CASE WHEN c.oid IS NOT NULL THEN has_table_privilege('authenticated', c.oid, 'SELECT') END AS authenticated_select,
         CASE WHEN c.oid IS NOT NULL THEN has_table_privilege('service_role', c.oid, 'SELECT') END AS service_select
  FROM expected e
  LEFT JOIN pg_namespace n ON n.nspname = 'public'
  LEFT JOIN pg_class c ON c.relnamespace = n.oid AND c.relname = e.name
), snapshots AS (
  SELECT source, property, grain, period_start, period_end, captured_at
  FROM public.analytics_source_snapshots
  ORDER BY captured_at DESC
  LIMIT 5
)
SELECT jsonb_build_object(
  'checked_at', now(),
  'view_access', (SELECT jsonb_agg(a ORDER BY a.name) FROM access a),
  'internal_view_access_gate', (SELECT bool_and(object_exists AND security_invoker
    AND anon_select IS FALSE AND authenticated_select IS FALSE AND service_select IS TRUE) FROM access),
  'clarity_latest_success', (SELECT max(finished_at) FROM public.clarity_sync_runs WHERE status = 'success'),
  'active_cron_entries', (SELECT count(*) FROM cron.job WHERE active),
  'source_snapshots', (SELECT jsonb_agg(s ORDER BY s.captured_at DESC) FROM snapshots s),
  'legacy_ga4', (SELECT jsonb_build_object('rows', count(*), 'latest_date', max(date)) FROM public.metrics_ga4_daily),
  'customerio_reporting', (SELECT jsonb_build_object('rows', count(*), 'latest_date', max(date)) FROM public.metrics_customerio_daily),
  'limitations', jsonb_build_array(
    'Catalog privileges are database-role evidence, not an external HTTP exploit test.',
    'Service-role grant is not proof of a working internal consumer.',
    'Cron enabled is not proof of successful execution.',
    'No provider payloads, lead rows, credentials, or cron commands selected.',
    'Legacy row counts and dates do not establish metric provenance or delivery.'
  )
) AS evidence;
ROLLBACK;

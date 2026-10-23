# Clarity sync operations

Clarity export data now syncs to Supabase automatically. This is a scheduled trailing-24-hour snapshot, not a real-time event stream.

## Schedule

Ten calls per UTC day, every 2 hours 24 minutes.
Arizona times (America/Phoenix): 12:29 a.m., 2:53 a.m., 5:17 a.m., 7:41 a.m., 10:05 a.m., 12:29 p.m., 2:53 p.m., 5:17 p.m., 7:41 p.m., 10:05 p.m.
UTC: 00:17, 02:41, 05:05, 07:29, 09:53, 12:17, 14:41, 17:05, 19:29, 21:53.

## Architecture

Supabase pg_cron → pg_net → authenticated clarity-sync Edge Function → Microsoft Clarity → Supabase.
Runtime code: supabase/functions/clarity-sync/index.js.
Applied database setup and schedule: supabase/clarity-sync-setup.sql.
The website and GitHub Actions are not required to be running for ingestion.
GitHub Actions runs parser regression tests, not scheduled Clarity calls.

## Credentials

Clarity token and internal invocation key are encrypted in Supabase Vault. Neither is stored in GitHub, this document, client JavaScript, or the cron command.
The Edge Function checks its private x-sync-key before claiming a run. Its config RPC is executable only by service_role; Vault access is isolated in a private schema. Missing/invalid request credentials return 401.
Keep the old branch workflow disabled and do not run other exporters against this project without accounting for Microsoft's project-wide quota.

## Stored data

public.clarity_sync_runs stores each attempted slot, status, row count, failure code, and successful provider payload. RLS and restricted grants keep this history server-only.
public.metrics_clarity_daily is upserted by date/page_path. created_at is refreshed when that page is observed. Use the latest successful raw snapshot for an exact point-in-time report.
The API window is trailing 24 hours, so do not sum successive snapshots or treat them as separate calendar-day totals.
URL query strings are retained to preserve Clarity's grouping; only ziaflow.com and www.ziaflow.com are included in page metrics.
URL-level session counts are not added into a fabricated site-wide unique-session total.
Provider payload also preserves scroll depth, engagement, script errors, and error clicks beyond the daily table's selected columns.

## Verification on October 22, 2026

Live API call returned HTTP 200 and wrote 11 page rows at 4:36 p.m. Arizona time (23:36 UTC).
Run ID: 89a36630-398e-4ae0-a720-24cf1358c6fe.
Duplicate invocation skipped without an additional Clarity API call. Unauthenticated invocation returned 401.
Daily-cap transaction test passed and rolled back all test records. Four parser regression tests passed.
Five active cron jobs each fire twice daily, giving ten scheduled slots.

## Monitoring and recovery

Inspect public.clarity_sync_runs for status, finished_at, rows_written and error_code; inspect cron.job_run_details and net.\_http_response for delivery failures.
Slot claims and a ten-attempt UTC daily cap prevent duplicate/manual invocations from exceeding this pipeline's budget.
Failures consume their slot; there are no automatic provider retries. HTTP 429 is recorded and the next scheduled slot can try again within the cap.
Missed intervals cannot recover Clarity history older than the export API's three-day window. Already persisted snapshots remain available.
To pause, set active=false on cron.job entries whose jobname starts ziaflow-clarity-. Reactivate the same entries to resume.
Do not paste secrets into documents or repository files. Rotate the Vault value securely when needed.

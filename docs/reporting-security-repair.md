# Reporting security repair

This PR prepares two fixes. It does not apply SQL to production, deploy the website, or send email/SMS.

## Changes and verification

- The reporting view uses `security_invoker=true`, revokes PUBLIC/anon/authenticated access, and explicitly grants service_role SELECT. Existing trusted server reporting uses the service role; signing in alone does not authorize access to internal aggregate reporting.
- The Customer.io handler returns 503 before parsing or persistence if neither signing-key alias nor the legacy shared secret is configured. A configured signing key requires a valid HMAC and a finite integer timestamp within five minutes. Legacy authentication remains available only when a shared secret is explicitly configured and no signing key exists.
- Regression tests invoke the real transpiled route with mocked persistence. An isolated PGlite Postgres database applies the actual migration twice, checks actual SELECT denial for both public roles and successful service-role SELECT, and checks the view option. CI uses no production credentials or external message providers.
- The production view definition and underlying grants cannot be inferred from the fixture. Verify the actual service-role query before completing rollout.

## Production secret configuration check

On November 5, 2026, Vercel environment-variable metadata was read for `astro-wind-zf-test` (`prj_V02hwQvBcQ94CKZlDQM2nbYiDBL8`). No entries existed for `CIO_WEBHOOK_SIGNING_KEY`, `CUSTOMER_IO_WEBHOOK_SIGNING_KEY`, or `CUSTOMER_IO_WEBHOOK_SECRET`, including production targets. `CUSTOMER_IO_WEBHOOK_URL` exists, but is an outbound destination, not inbound authentication. No values were decrypted or printed. This establishes missing project configuration; it does not prove which variables an already-built deployment contains or whether team-shared configuration is injected separately.

## Required rollout steps (not performed)

1. Configure one signing-key alias for the production deployment, matching the Customer.io reporting webhook signing key. Configure preview separately if needed. Prefer HMAC; use the legacy secret only for an existing explicitly authenticated integration. Never put secrets in PUBLIC variables, git, or PR comments. Without authentication configuration, the repaired endpoint intentionally returns 503.
2. Review and apply only `supabase/migrations/20261105091845_restrict_reporting_view_access.sql` to the intended ZiaFlow project `ruhnueopjedaywiqhpgi`, using the approved database process. This repository has existing setup/draft SQL without a migration baseline: do not blindly push all migrations or replay draft setup SQL. This migration requires Postgres 15+ and an existing view. It does not replace its definition or alter source-table policies.
3. Run `supabase/review/reporting-view-verification.sql`. Expect `security_invoker=true`, anon=false, authenticated=false, service=true. Run an actual SELECT under service_role to verify all underlying view dependencies remain readable. Stop if that fails; repair the narrowly required source permissions after review rather than reopening anonymous access.
4. After approval, deploy the reviewed website commit with authentication configured. Verify unsigned requests are rejected without writing records. Verify signed delivery through an explicitly authorized reporting test, without triggering any email/SMS. Keep this verification separate from message-send workflows.
5. If the route needs rollback, disable reporting ingress or retain the fail-closed guard; do not restore unauthenticated acceptance. Do not restore PUBLIC/anon grants as a database rollback. Investigate service-role dependencies instead.

The Supabase CLI migration generator was attempted but could not initialize its config directory in this restricted runtime. The migration filename was created with the current UTC timestamp; the SQL itself was executed successfully in isolated Postgres.

## Remaining analytics import repairs (separate work)

- GA4: obtain the numeric property and read-only reporting access, import aligned daily dimensions with property timezone/session attribution, and verify `generate_lead`. Existing daily rows have unverified provenance; do not use them to claim conversion rates.
- GSC: retain complete provider snapshots and effective reporting bounds. Period aggregates/top rows cannot become daily facts. Revalidate the documented October 27 trial/access limitation before refreshing; do not bypass restrictions.
- Customer.io: this PR secures reporting receipt ingestion only. Reconcile raw `email_delivery_events` with `metrics_customerio_daily`, with verified mapping, deduplication, timezone, and backfill provenance before treating daily metrics as complete. This PR does not establish that aggregation or repair historical rows.
- Clarity: verify successful scheduled imports and snapshot freshness independently of cron enablement; never add overlapping trailing windows or consume the external API budget during verification.
- Keep unverified legacy analytics separate from verified source snapshots and exclude QA records from business counts. Booking, qualification, agreement and payment outcomes still require verified sources.

These follow-ups reflect the repository's existing findings and data contracts; no new live analytics audit or import was performed in this PR.

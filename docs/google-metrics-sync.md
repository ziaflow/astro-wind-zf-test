# Google daily metrics repair — November 5, 2026

## Cause and evidence

The existing `scripts/sync-google-metrics.mjs` did not fetch Google APIs. It contained fixed sample values dated using the current day, and an explicit refusal prevented execution. Its configuration read only `.env`, ignoring workflow environment variables. The daily `telemetry-sync.yml` workflow checks existing snapshot freshness; it does not import GA4 or GSC. This is an absent ingestion path, rather than evidence of a Google outage. The historical provenance of the eight legacy rows per source is unverified; do not use them as verified provider measurements.

Connected Supabase read-only checks on November 5 confirmed both daily tables still have eight rows ending October 16 and existing unique keys `(date,page_path)` and `(date,page_path,query)`. The GSC snapshot captured November 4 covers October 30–November 1 at `period_aggregate` grain. It is preserved; dividing it into daily rows would invent data. Clarity's latest observed successful run began November 5 at 00:17 UTC and wrote ten rows.

## Repair and operation

The existing script now fetches actual Google API reports with OAuth refresh credentials. A separate daily workflow imports seven days ending three days ago, leaving the existing snapshot health check intact. Upserts reuse existing unique constraints. Retries/reruns merge the same keys; failed partial batches can be rerun. Source/date/status/row counts and safe HTTP failure codes appear in Actions logs; provider bodies and credentials never appear. A failed source does not block the other source, and any failure makes the job fail. No database schema or snapshot writes are involved.

Configure GitHub Actions secrets `PUBLIC_SUPABASE_URL` (https://ruhnueopjedaywiqhpgi.supabase.co), `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REFRESH_TOKEN`. Set repository variable `GA4_PROPERTY_ID` to the numeric property ID associated with measurement ID G-HE4BRSW364. OAuth must include `analytics.readonly` and `webmasters.readonly`; the Google identity needs GA4 property read access and Search Console access to `sc-domain:ziaflow.com`. Enable the Analytics Data and Search Console APIs in the OAuth client project. Use a refresh token with durable consent; short-lived/testing OAuth grants can expire. No credentials were available in this environment, and repository secret presence has not been verified.

For backfill, manually dispatch **Import Google daily metrics** with `start_date=2026-10-17`, `end_date=2026-11-02` (or a later finalized date when running later). First verify the property and credentials and inspect a small date range. Those dates are within normal provider retention, but actual availability remains unverified. Never backfill from aggregate snapshots, sample rows, or inferred zeros. Empty API results log `empty` and do not create zeros or delete existing rows. GSC only exposes available non-anonymized query rows and has source extraction limits; these rows are not complete site totals. Reruns update returned keys but do not remove keys later omitted by the provider.

GA4 uses pagePath with a production hostname filter. `conversions` stores `keyEvents`; fractional values are refused because the existing column is integer. Engagement time is userEngagementDuration / activeUsers (seconds per active user). Rates and distinct users are not additive across pages. Thresholded, sampled, or other-row-loss reports fail rather than silently writing incomplete values. GSC retains URL query strings in page_path to avoid collapsing separate keys. Any collisions from host/protocol normalization fail pending an explicit reporting decision.

## Tracking and remaining verification

`src/components/common/Analytics.astro` initializes direct GA4 (`gtag('config', gaId)`) and loads GTM-5Q2JZPVG. Both are gated to production hosts and exclude internal QA. Lead forms can push dataLayer events and call gtag. Whether GTM also configures the same GA4 destination or forwards those events requires the published container export/Tag Assistant inspection. No tracking tags were removed based merely on coexistence. Browser event delivery and duplication remain unverified.

GSC Wizard denied reads because its subscription/trial is inactive. OpenSEO reports no connected Google Analytics account and no connected Search Console account. Connect an authorized Google account there or supply the OAuth setup above. For duplicate tracking review, provide read access/export for the published GTM container, GA4 stream/enhanced measurement configuration, and a browser network/DebugView observation. Shell network access failed connecting to the configured proxy; the public GTM container could not be downloaded. No event collection request was observed.

Vercel's connected project lookup confirms the project and a latest preview in ERROR. No deployment was triggered; production readiness was not reverified in this repair.

## Checks

Run `node --test tests/google-metrics-sync.test.mjs tests/telemetry-freshness.test.mjs tests/analytics-isolation.test.mjs`. Mocked provider tests check mapping, repeatable merge writes, snapshot isolation, redacted failures, source independence, empty responses, threshold rejection, and configuration validation. Live Google imports/backfill remain blocked on the credentials/access described above.

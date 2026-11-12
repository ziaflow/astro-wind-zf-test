# ZiaFlow weekly analytics and flow review — October 25, 2026

Review window: October 19–25, America/Phoenix. October 25 is partial. Public HTTP tests completed at 2026-10-26T01:31:38.755705Z (October 25, 18:31 Phoenix). This review uses connected GSC and Supabase, GitHub source/CI, Customer.io read-only API and direct website HTTP checks.

## Findings

| Source or path | Verified result | Boundary |
| --- | --- | --- |
| Website | Home, contact, automation service and automation article return 200; robots and sitemap-index return 200; HTTP home resolves to HTTPS | HTTP availability is not browser or journey acceptance |
| Contact page | Live form action is Web3Forms; main Form.astro sends to its action URL | No confirmed link from this deployed form to the Supabase receipt RPC |
| Contact API | Empty JSON POST returns 400, Email is required; subsequent privacy-safe count remains 2 non-test and 5 test observations | No valid production inquiry was submitted and no message was sent; GET 404 does not prove POST is absent |
| Main contact handler | src/pages/api/contact.ts has conditional writes, ignores insert error return values, and may report success without a durable matching receipt | Contradicts the stronger operating documentation; PR #20 proposes replacement behavior but is unmerged |
| Customer.io | API authenticated and verified; campaign 3 draft; trigger form_submit, booking global exit appointment_booked | Site source emits contact_form_submitted; backend delivery and runtime exits remain unverified; no activation |
| GA4 | Browser instrumentation present | Reporting ingestion not connected/proven; sessions and conversion rate unknown |
| Clarity | 30 successes, 2 HTTP 429 failures; latest success 2026-10-26T00:17:03.086Z; longest successful-run gap 4.80 hours | Observations start October 22; October 19–21 unavailable. Rolling windows are not additive |
| Confirmed intake | 2 accepted non-test observations on October 22; 5 tests excluded; 0 duplicate observation IDs | Accepted inquiries are not qualified leads, bookings or paid projects; missing dates are not asserted zero |
| Reporting access | Legacy unified view has owner permissions and anon/authenticated SELECT grants; privacy-safe lead views are security_invoker and server-only | No row contents or PII were read from the legacy view; access repair requires reviewed migration |
| GitHub | Repair PR #26 removal commit 12421213a79873963e03349aea9f9a7927b053ce passes build/quality/Playwright/offline telemetry; unmerged | Main and dependent branches still contain known lint failures; no release acceptance |

Clarity run history (Phoenix dates): October 22: 4 success / 0 failure; October 23: 9 / 1; October 24: 9 / 1; October 25 partial: 8 / 0. Five cron entries remain active. Never add another exporter or call Clarity during review.

## Search evidence

The connector cannot return the requested seven-day cut. The finalized effective range is September 26–October 23 (28 days); comparison August 29–September 25. No country/device filters. Current: 4 clicks, 422 impressions, 0.95% CTR, position 11.74. Previous: 7 clicks, 287 impressions, 2.44% CTR, position 12.98. More impressions with fewer clicks is an observation; counts are too small to attribute to recent site work.

Access remains free_trial_full through 2026-10-27T06:09:33.233Z (October 26, 23:09 Phoenix). Preserve restrictions if access changes. Do not bypass or manufacture a seven-day series by subtracting overlapping snapshots. GSC has an approximately three-day finalized-data delay; snapshot capture freshness is separate.

| Existing URL | Impressions | Clicks | Average position | Next action |
| --- | ---: | ---: | ---: | --- |
| /marketing-automation-for-arizona-service-businesses-save-time-increase-bookings | 142 | 0 | 19.15 | Review unsupported ROI/booking claims; retain URL and useful content; align title/intro with practical local follow-up intent |
| /services/automation | 66 | 0 | 4.83 | Reconcile intent and internal links with the article; do not label this an exclusively non-branded rank |
| /google-local-service-ads-in-2025 | 59 | 0 | 8.54 | Review time-sensitive accuracy while preserving the established URL |
| /website-conversion-checklist-for-phoenix-businesses | 54 | 0 | 8.67 | Review snippet and strengthen contextual links to a working inquiry destination |

Query marketing automation phoenix: 14 impressions, zero clicks, position 15.86. This is a relevant low-sample opportunity, not keyword-volume or difficulty evidence. Low-CTR utility/legal pages are not automatic acquisition priorities.

## Updated execution order

1. Reconcile and review existing PRs #20 (receipt-backed intake), #24 (homepage anchor) and #26 (lint/telemetry repair and blogger removal). Preserve the separate Kairo repository, existing copy, URLs and metadata. No automatic merge, domain swap or campaign activation.
2. Prove one browser-to-API-to-database path in an isolated preview with messaging held: matching receipt, retry idempotency, rejected writes, test exclusion and explicit consent. Live #form remains a missing homepage target. Choose one event contract and map site/backend and Customer.io to it.
3. Inventory consumers and apply the reviewed reporting-view access repair; verify anon/authenticated denial and service-role access. Do not use the legacy view as analytics truth.
4. Connect numeric GA4 property and read-only reporting access; verify page_view and accepted generate_lead definitions, reporting timezone, source/medium and QA exclusion. Distinguish browser snippet from warehouse ingestion.
5. Confirm Customer.io delivery-log ingestion and booking/reply/disqualification exits using held/internal QA. Empty customerio metrics/click tables mean reporting is absent, not zero deliveries. Add outcome/qualification sources before reporting revenue or conversion.
6. Remove noindex/test URLs from sitemap only after checking intended visibility; preserve indexable routes during Kairo migration. Recheck existing sitemap warnings instead of assuming the old outage persists.
7. Refresh the four existing search pages above, one reviewed change at a time; retain URLs and factual copy. Do not bulk-publish new AI posts. Freeze a comparable 28-day baseline and assess a complete post-change period after finalization; avoid A/B tests at this volume.

Acceptance: verified collector freshness, reliable accepted inquiries, accurate privacy-safe counts, event agreement, protected reporting access, full route/content parity and reviewed release evidence. Marketing and nurture remain held. A functioning page or API credential alone does not complete the funnel.

## Exact checks and reproducibility

The companion notebook preserves reviewed aggregate inputs and the key read-only SQL below. Its calculations are reproducible offline; requerying requires the authorized Supabase connector. No credentials or personal lead fields are embedded.

Sources: docs/growth-intelligence.md; docs/seo-conversion-plan.md; src/pages/api/contact.ts; src/components/ui/Form.astro at main d49c0e388229c9400c2bf4e8a8051138cde52392; privacy-safe website_lead_observations and website_confirmed_leads_daily; clarity_sync_runs; analytics_source_snapshots; Customer.io campaign 3 read-only response; direct https://ziaflow.com route checks.

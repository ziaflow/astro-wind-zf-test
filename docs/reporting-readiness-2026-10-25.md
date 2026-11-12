# Reporting readiness — October 25 evening

Delivery task: https://app.clickup.com/t/17tnw2b8wte (urgent, no prerequisite task returned). Project: ruhnueopjedaywiqhpgi. This review extends the existing monitoring workflow with an on-demand read-only query. It creates no collector, agent, schedule or database migration.

## Verified database evidence

Read-only checks at 18:05–18:06 Phoenix (October 26 01:05–01:06 UTC) found:

| Object/source                                             | Observation                                                                                         | Meaning                                                                                                                                                            |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| view_unified_page_intelligence                            | security_invoker unset; anon/authenticated/service_role SELECT true                                 | Proposed reporting-access repair has not been applied.                                                                                                             |
| Anonymous role count                                      | 247 rows in a READ ONLY transaction, then ROLLBACK                                                  | Confirms database-role access to aggregate reporting. No row values or PII read; no external HTTP exploit test.                                                    |
| website_lead_observations / website_confirmed_leads_daily | security_invoker=true; anon/authenticated SELECT false; service_role SELECT true                    | Their catalog access settings match the intended internal-only contract. Runtime consumers still require checks.                                                   |
| Clarity                                                   | Latest successful run 2026-10-26T00:17:03.086Z (17:17 Phoenix October 25); five active cron entries | Stored successful execution exists and is within the six-hour threshold; five enabled entries alone are not proof of execution. No provider refresh was requested. |
| GSC                                                       | Latest stored capture 2026-10-24T15:21:51.840595Z, Sep 24–Oct 21 period aggregate                   | Approximately 34 hours old, below the 48-hour capture threshold at review. Preserve reporting lag/range; do not turn period totals into daily rows.                |
| GA4 legacy table                                          | Eight rows, latest date October 16                                                                  | Fresh, provenance-verified GA4 reporting remains unknown.                                                                                                          |
| Customer.io daily reporting                               | Zero rows, latest date null                                                                         | No delivery reporting evidence here; this does not establish zero deliveries.                                                                                      |

`supabase/review/reporting-readiness-audit.sql` reproduces the catalog/freshness audit without returning source payloads or lead data. Its gate must remain false while the reporting view is publicly selectable. It does not count view rows and does not change grants. The separate anonymous COUNT above was executed once and rolled back.

## Consumer inventory correction before access repair

At both current main d49c0e3 and PR #20 adafa15, `scripts/agent-ux-optimizer.mjs` reads a local `.env` file and chooses credentials in this order: SUPABASE_SERVICE_ROLE_KEY, SUPABASE_KEY, then PUBLIC_SUPABASE_ANON_KEY. It reads view_unified_page_intelligence through REST. Therefore the earlier note that this consumer uses service authorization is not independently established by source: deployment configuration must be checked privately. No environment values were read or disclosed here. Other external consumers are not inventoried.

The existing proposed repair remains in draft PR #20:

- `supabase/review/reporting-view-access.sql`
- `supabase/review/reporting-view-verification.sql`

Do not duplicate or automatically apply it. Before approval, inventory consumers, identify the authorized server execution path, verify its service-role configuration without exposing values, and establish internal access on the exact reviewed implementation. The legacy optimizer's wildcard joins, mixed source grains, test inclusion and zero-filled unknowns remain separate data-quality limitations; do not use its recommendations as validated evidence.

After an explicitly reviewed application of the existing repair, rerun this audit and require security_invoker=true, anon/authenticated SELECT false and service-role SELECT true. Independently test that the reviewed internal consumer works. Do not roll back by reopening public grants; correct the authorized consumer path instead. No auth, grant, RLS or schema change was made in this run.

## Source, validation and agent state

Read current main docs/growth-intelligence.md and docs/seo-conversion-plan.md, PR #22's Kairo migration contract, and the supplied 11-page SEO mapping in ClickUp. Current production remains READY at d49c0e3, deployment dpl_9Et1HAoWsRfttSRdy59NytmUcbFa. PR #20 is open/draft/mergeable at adafa15: build/check/contact/calculations pass, original browser job fails. PR #25's separate stacked browser repair is still unmerged at 38379f6; its success must not be transferred to PR #20's head.

The data monitor is now disabled. Its latest recorded run completed October 25 at 08:44 Phoenix; this establishes execution metadata, not a successful data refresh. Current GSC capture still dates to October 24. The optimizer is disabled after its recorded October 23 run. Researcher is enabled, with no recorded run returned. No agent was resumed, duplicated or replaced. Review the pauses before relying on unattended monitoring.

Validation: the audit query was executed read-only against the intended live project. Catalog checks, source timestamp query, legacy aggregate checks and a separate anonymous count all executed successfully and revealed the unresolved access gate. This is successful failure detection, not a passing release or integration test. No app code was changed, so no app build/browser/lead submission was run.

Current Supabase RLS documentation was reviewed at https://supabase.com/docs/guides/database/postgres/row-level-security . Its markdown/changelog fetch was unavailable through the browser tool (unsupported text/markdown); no new Supabase feature or schema change was implemented.

## Next milestone

Review the concrete consumer/access repair package before launch, verify GA4 provenance and Customer.io reporting separately, and retain the hosted lead and Kairo parity gates. The active Kairo fork remains outside this coordinator's current repository scope; the existing owner card https://trello.com/c/Bazo6h9E retains that decision. No production deployment, marketing activation, external messages or client assignments occurred.

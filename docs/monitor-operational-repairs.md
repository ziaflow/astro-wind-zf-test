# Monitoring workflow repairs

The October 24 monitor found independent failures in the main ESLint gate, a legacy telemetry exporter, and blogger authentication. PR #25 separately has a passing Playwright run on commit `38379f6fe7b16d648b61c8e400b1d01cff887505`; it remains an unmerged prerequisite for the browser fix.

## Telemetry

The GitHub telemetry workflow now checks canonical Supabase snapshots only. It does not export Clarity, synthesize Google metrics, or run the old unified-view optimizer. Existing Supabase cron remains the sole Clarity exporter; the connected data monitor remains the GSC ingestion path.

Configure the existing repository secrets `PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for the ZiaFlow project. The checker requires a successful Clarity snapshot within six hours and a GSC capture within 48 hours. Missing or invalid timestamps fail as unknown. GSC's finalized reporting delay is independent of capture freshness. Pull requests run offline tests without receiving secrets. A live scheduled/manual run is still required after merge to verify repository credential availability.

## Blogger removal

The AI blogger workflow, both executable entrypoints, provider configuration helper, tests and npm command have been removed at the owner's request. Existing articles and Sanity content are unchanged. Shared credentials are not deleted by this change.

## Validation and release

Run the telemetry offline test file, `npm run check`, and `npm run build`. Merge and production release require separate review. Do not resolve monitor findings merely because code was proposed: confirm the relevant workflow on the default-branch commit. Rollback by reverting the repair commit; do not reactivate duplicate telemetry exports or unattended publishing without review.

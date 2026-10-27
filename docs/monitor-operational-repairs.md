# Monitoring workflow repairs

The October 24 monitor found independent failures in the main ESLint gate, a legacy telemetry exporter, and blogger authentication. PR #25 separately has a passing Playwright run on commit `38379f6fe7b16d648b61c8e400b1d01cff887505`; it remains an unmerged prerequisite for the browser fix.

## Telemetry

The GitHub telemetry workflow now checks canonical Supabase snapshots only. It does not export Clarity, synthesize Google metrics, or run the old unified-view optimizer. Existing Supabase cron remains the sole Clarity exporter; the connected data monitor remains the GSC ingestion path.

Configure the existing repository secrets `PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for the ZiaFlow project. The checker requires a successful Clarity snapshot within six hours and a GSC capture within 48 hours. Missing or invalid timestamps fail as unknown. GSC's finalized reporting delay is independent of capture freshness. Pull requests run offline tests without receiving secrets. A live scheduled/manual run is still required after merge to verify repository credential availability.

## Blogger removal

The AI blogger workflow, both executable entrypoints, provider configuration helper, tests and npm command have been removed at the owner's request. Existing articles and Sanity content are unchanged. Shared credentials are not deleted by this change.

## Validation and release

Run the telemetry offline test file, `npm run check`, and `npm run build`. Merge and production release require separate review. Do not resolve monitor findings merely because code was proposed: confirm the relevant workflow on the default-branch commit. Rollback by reverting the repair commit; do not reactivate duplicate telemetry exports or unattended publishing without review.

## October 26 reconciliation with production source

Current production main is 0bf2a4ea115fa0b1707fb4de6ba3248476e2e676. Its quality job failed on five Analytics `no-var` declarations already repaired here and an additional unused PhoneLink import in services. The draft was reconciled with that main without conflicts; the unused import is removed. Current contact, webhook signature/replay and middleware behavior is retained. TypeScript syntax-tree comparisons of the three middleware/contact/webhook files match main after formatting, including literal values. No authentication, consent, pricing, public-copy, URL or database-permission behavior was changed by the reconciliation.

The full check then reached Prettier and exposed 11 newly inherited formatting failures. Those files were formatted; this was not a change to their logic. `npm run check` now passes: Astro reports 0 errors/0 warnings/35 hints, ESLint and Prettier pass. All five existing offline telemetry tests pass. `npx astro build` completes with the Vercel adapter; it was used directly to avoid the npm postbuild IndexNow submission hook. Installation used the locked dependency file with lifecycle scripts disabled. Existing build warnings include deprecated Markdown options and an unresolved optional styled-components optimization dependency; they did not fail this build.

This validates the reconciled local tree, not a production release or hosted inquiry. No valid form, provider email, booking, database migration or permission change was exercised. The blocker remains until the exact draft commit's remote checks pass and it is reviewed. No automatic merge or production deployment is authorized. Do not transfer PR #25's browser evidence to this different source snapshot. Blogger removal remains part of this existing draft and is not yet applied on main; no duplicate replacement agent or collector was created.

# ZIA-9: freshness and Google receipt rollout

The Clarity check allows 18 hours: the observed successful receipts were roughly 12 hours apart, with six hours of tolerance. The setup reference lists additional 2h24m slots; do not assume each slot succeeds. Eighteen hours detects a missed 12-hour success later than its next expected time; it is not a provider SLA. Revisit the threshold if the live operating cadence changes.

Google reporting dates end three UTC calendar days before collection by default; the freshness gate allows four days. Receipt timestamps are ingestion evidence, never substitutes for reporting dates. An empty report means the provider returned no rows for that query, not zero traffic, and does not delete previously stored rows. GSC 2026-09-18 has no daily rows and its cause is unverified; it must not be represented as zero. GA4 2026-11-20 was logged as an empty report, but historical logs are not durable database receipts. No receipts are backfilled by this change.

The optional receipts table records each completed per-source/date attempt; the UUID is its idempotency key, so replaying the same receipt is ignored and separate attempts remain separate. The checker selects the greatest reporting date and then the latest completed receipt at that date. It detects a missing receipt, a failed latest import, and a stale reporting date; it does not prove all historical dates were covered. Failed older backfills can be masked by a newer reporting date and require explicit inspection. Two collectors finishing the same date concurrently are ordered by receipt insertion, not report start; partial metric writes may exist after failure. OAuth/configuration failures before the source loop cannot produce per-date receipts. A failed receipt write fails the job and must not be interpreted as a confirmed import. Existing rows can remain after an empty response; reconcile before interpreting them.

## Review and approval

Review the final diff against `ae990b59a2529cbecba4c015671833a8f73e1ced` and compare with current target branch. Rebase or cherry-pick the reviewed commit onto a clean current target branch, resolving conflicts without overwriting other changes; run:

```sh
node --test tests/telemetry-freshness.test.mjs tests/google-metrics-sync.test.mjs tests/clarity-sync.test.mjs tests/google-metrics-receipts.test.mjs
git diff --check <target>...HEAD
```

Merge and deployment require explicit approval. Do not change schedules as part of this rollout.

## Migration and activation, only after approval

1. Confirm the intended Supabase project and take an appropriate backup. Review `supabase/google-metrics-receipts.sql`, then apply it through the project's approved SQL migration process. Verify RLS, grants, table/index, and that anonymous/authenticated roles have no access. No existing data is changed.
2. Deploy the reviewed collector/checker code with the optional flag absent. Existing behavior remains unchanged. Set `GOOGLE_METRICS_RECEIPTS_ENABLED=true` only on the authorized Google collector runtime; it already needs service-role credentials and the GA4 property. Do not print credentials. Run one explicitly approved small finalized-date import using the existing workflow or controlled runner, and verify service-role-only receipt reads for both sources.
3. After both sources have current receipts, set `GOOGLE_METRICS_RECEIPTS_ENABLED=true` and the existing numeric `GA4_PROPERTY_ID` in each authorized freshness-check runtime (including both the unified job and its standalone validation step where applicable). Use the same approved configuration mechanism already supplying their secrets. The existing GitHub workflows do not yet pass these variables: a separately reviewed workflow change or authorized runtime configuration is required. With the flag absent, these receipts are not created or checked.
4. Verify actual run status, source/date/status/count, 18-hour Clarity and four-day Google thresholds, and no secret values in logs. Do not assert historical completeness from latest receipts.

## Rollback

Remove the receipt flag from every checker first, then collector, using the same configuration mechanism. Roll back the application to the previous reviewed commit through the normal release process; do not revert unrelated work. Leave the receipt table and its contents in place so evidence is preserved. Confirm existing collector runs and the previous freshness checker behavior. Dropping the table destroys evidence and requires separate explicit approval. If migration succeeds but code deployment fails, leave the unused table intact. If receipt writes fail after activation, disable the checker flag first, disable the collector flag, and rerun the finalized date range only after investigating the error.

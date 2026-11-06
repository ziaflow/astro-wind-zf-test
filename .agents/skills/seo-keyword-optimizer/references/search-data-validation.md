# Search data validation and storage

Use for pasted Search Console tables, CSV-style exports, and provider snapshots that must be reviewed and persisted.

## 1. Resolve source and destination

1. Identify the supplied property, inclusive date range, selected search type, dimension, filters, displayed row count, and update label.
2. Classify provenance as authenticated provider read, user-supplied export, or existing database copy. Do not promote one class to another.
3. Inspect destination columns, constraints, existing period keys, and permissions before choosing a write. Reuse the existing snapshot model where it fits; do not force property totals into page/query daily tables.
4. Check for an existing idempotent import key and period record. Preserve conflicting historical snapshots rather than overwriting them silently.

## 2. Validate the supplied series

Parse each date, click count, impression count, displayed CTR, and displayed position without changing source tokens. Use a SQL VALUES CTE or a parsed staging structure so the same rows feed validation and storage.

Require:
- Parsed row count matches the supplied count.
- Dates are unique and within the stated range.
- A daily series is continuous when the source claims complete coverage: distinct-date count equals maximum date minus minimum date plus one. Treat missing dates as missing, not fabricated zeros.
- Counts are nonnegative, clicks do not exceed impressions, and rates are in range.
- Displayed CTR agrees with clicks/impressions within its stated rounding precision; preserve the original percentage alongside any calculated rate.
- Positions are valid numeric observations. Do not replace missing positions with zero.

Guard the write on successful validation. If a guard produces no inserted row, distinguish validation failure from an already-imported key before reporting an outcome.

## 3. Calculate and reconcile

- Calculate overall CTR as `100.0 * SUM(clicks) / NULLIF(SUM(impressions), 0)` when reporting percent; name percentage and fraction fields explicitly.
- Estimate period position as `SUM(position * impressions) / NULLIF(SUM(impressions), 0)` only when using the corresponding property-level daily series. Mark it approximate when source positions were rounded.
- Cross-check full-series totals through a second grouping, such as monthly totals, and reconcile any overlapping period against earlier snapshots of identical scope.
- Compare complete, equal-length, non-overlapping periods. Keep partial months explicitly labeled.
- Investigate high-impression/no-click days through query, landing page, country and device breakdowns. Aggregate position changes can reflect query mix rather than fixed-keyword ranking changes.
- Keep disclosed-query totals separate from property totals. Do not manufacture missing queries to close a privacy-related gap.

## 4. Persist the evidence and review

Store:
- Exact source date boundaries and unchanged row values.
- Calculated totals and validation results.
- Source method, property, search scope, and import time.
- A concise comparison, findings, next actions, and limitations.

Keep a relative update label as a label when no absolute export timestamp was supplied. Never invent a fetch time from that label. Import time is not source freshness.

For a snapshot table whose permitted grain is `period_aggregate` or `daily`, use one period snapshot containing the validated daily array if that matches its contract. Do not invent a new grain value or broaden constraints merely to fit one import.

Keep new audit storage private: enable RLS, remove client-role access, and verify effective grants. Scope this to newly authorized storage rather than changing permissions on unrelated tables. Record additive schema work in the repository when its authorized write path is available.

## 5. Verify and deliver

1. Read the exact inserted key or returned row ID from the database.
2. Recompute stored-array row count and totals; compare stored rows and review to the intended payload.
3. Verify any new storage's effective RLS/client grants.
4. If exporting to GitHub, publish only sanitized aggregate data and review material on a feature branch. Verify the remote artifact separately before claiming completion.
5. Report the period, validation result, totals, matched-window comparison, interpretation, and exact storage handles. State whether scheduled ingestion, repository export, or provider verification remains unfinished.

Do not infer completed forms, qualified leads, human email engagement, or bookings from search clicks or Clarity smart-event absence.

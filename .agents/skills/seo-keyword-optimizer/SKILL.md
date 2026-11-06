---
name: seo-keyword-optimizer
description: "Use when reviewing search data. Validate, store, optimize."
version: 1.1.0
author: ZiaFlow
---

# SEO Keyword Optimizer Skill

## When to Use
Use for Search Console report review, search-data imports, keyword prioritization, and evidence-backed Astro metadata or content optimization.

Use this workflow to review Search Console exports, store validated search evidence, identify commercially relevant striking-distance queries, and optimize existing Astro content.

## Evidence and storage rules

- Confirm the property, reporting dates, dimensions, filters, and provenance before interpreting a report; a saved URL or connected account alone does not establish the correct data scope.
- Recalculate counts, CTR, comparisons, and deltas with SQL or another executable calculation. Compute period CTR from total clicks divided by total impressions; never average daily CTRs. Label positions reconstructed from rounded daily values as approximate and impression-weighted.
- Keep property, page, and disclosed-query aggregates separate; query privacy omissions and aggregation rules prevent their totals from necessarily matching. A complete query-table pagination count does not establish complete search coverage.
- Compare equal, non-overlapping windows and treat tiny impression/click samples as directional evidence, not proof of copy failure, qualified demand, conversion lift, or redesign causality.
- When asked to review and store, retain the supplied rows plus a concise review, validate before writing, use an idempotent import key, preserve source values and limitations, and read back the exact destination before claiming success. Label manual imports as manual; do not imply recurring ingestion was repaired.
- Exclude customer-level records, identifiers, and secrets from analytics exports unless separately authorized. Keep database and GitHub completion statuses separate; a database import does not establish a repository artifact.
- Report verified storage handles, source period, totals, a matched-window comparison, prioritized findings, and unverified scope. Do not bury access gaps in a blanket completion claim.

For daily-table validation, reconciliation, and Supabase import mechanics, use [Search data validation and storage](references/search-data-validation.md).

## Workflow

1. **Query Search & Page Intelligence:**
   Query `public.analytics_source_snapshots`, `public.website_lead_observations`, or `public.website_optimization_findings` in Supabase (or inspect `.ziaflow-ops/handoff/optimization-findings.json` and `scripts/run-growth-intelligence.mjs`) to find:
   - Queries with high impressions and average position between 4.0 and 20.0
   - Relevant page/query cohorts with weaker CTR than their own comparable baseline; do not treat a fixed CTR threshold as a diagnosis on small samples
   - Pages with high Clarity engagement or rage/dead-click friction (`public.clarity_sync_runs`)

2. **Diagnose On-Page Relevance:**
   Resolve query-to-page attribution before choosing a file to edit; a query may rank an article rather than the expected service page. Segment by device and country when material, and prioritize supported business intent rather than high rank on irrelevant queries. Group variants under one useful canonical destination instead of generating a page per phrase or city.
   Inspect the corresponding page file in `src/pages/` or markdown file in `src/data/post/`.
   Check:
   - Does the primary keyword appear in `<title>`, `metadata.title`, or the `<h1>` heading?
   - Is there a compelling secondary benefit in `<meta name="description">` to lift CTR?
   - Are subheadings (`<h2>`, `<h3>`) addressing the search intent and linking to relevant `/services/*` and `/growth-tools/*` pages?

3. **Apply Incremental Optimization:**
   - Update frontmatter metadata (`title`, `description`, `updateDate`) while preserving the existing canonical URL slug.
   - Add useful visible answers or contextual tool links when they serve the search intent. Keep any structured data truthful and aligned with visible content; do not add FAQ markup merely to imply ranking or rich-result eligibility.

4. **Verify & Validate:**
   - Read `package.json` before selecting task-relevant checks; use the scripts actually defined by the project.
   - For local build validation, prefer the defined `npm run build:validate` script over `npm run build`, whose postbuild can submit IndexNow notifications.
   - Validate stored data with exact-target read-back and independent regrouped totals. Data-only reviews do not establish application build or end-to-end test success.
   - For content/code changes, verify the affected routes, canonical URLs, metadata, and appropriate project checks before proposing release.

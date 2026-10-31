---
name: seo-keyword-optimizer
description: Analyze Search Console impressions and rankings to optimize striking-distance keywords (rankings 5-20) and update Astro page frontmatter/headings.
---

# SEO Keyword Optimizer Skill

Use this workflow to identify underperforming or "striking-distance" keywords from Search Console and optimize on-page Astro content.

## Workflow

1. **Query Search & Page Intelligence:**
   Query `public.analytics_source_snapshots`, `public.website_lead_observations`, or `public.website_optimization_findings` in Supabase (or inspect `.ziaflow-ops/handoff/optimization-findings.json` and `scripts/run-growth-intelligence.mjs`) to find:
   - Queries with high impressions and average position between 4.0 and 20.0
   - Pages where CTR is below 4% despite ranking on page 1–2
   - Pages with high Clarity engagement or rage/dead-click friction (`public.clarity_sync_runs`)

2. **Diagnose On-Page Relevance:**
   Inspect the corresponding page file in `src/pages/` or markdown file in `src/data/post/`.
   Check:
   - Does the primary keyword appear in `<title>`, `metadata.title`, or the `<h1>` heading?
   - Is there a compelling secondary benefit in `<meta name="description">` to lift CTR?
   - Are subheadings (`<h2>`, `<h3>`) addressing the search intent and linking to relevant `/services/*` and `/growth-tools/*` pages?

3. **Apply Incremental Optimization:**
   - Update frontmatter metadata (`title`, `description`, `updateDate`) while preserving the existing canonical URL slug.
   - Add targeted FAQ schema (`FAQSchema.astro`) or interactive tool callouts that directly answer the query.

4. **Verify & Validate:**
   - Run `npm run check:astro` to verify types and frontmatter schemas.
   - Run `npx astro build` to ensure fast static page generation without errors.

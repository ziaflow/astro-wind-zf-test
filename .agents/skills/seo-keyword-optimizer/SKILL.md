---
name: seo-keyword-optimizer
description: Analyze Search Console impressions and rankings to optimize striking-distance keywords (rankings 5-20) and update Astro page frontmatter/headings.
---

# SEO Keyword Optimizer Skill

Use this workflow to identify underperforming or "striking-distance" keywords from Search Console and optimize on-page Astro content.

## Workflow

1. **Query Search Intelligence:**
   Query `public.metrics_gsc_daily` or `public.view_unified_page_intelligence` in Supabase to find:
   - Queries with impressions > 50 and position between 4.0 and 20.0
   - Pages where CTR is below 4% despite ranking on page 1-2

2. **Diagnose On-Page Relevance:**
   Inspect the corresponding page file in `src/pages/` or markdown file in `src/data/post/`.
   Check:
   - Does the primary keyword appear in `<title>`, `metadata.title`, or the `<h1>` heading?
   - Is there a compelling secondary benefit in `<meta name="description">` to lift CTR?
   - Are subheadings (`<h2>`, `<h3>`) addressing the search intent?

3. **Apply Incremental Optimization:**
   - Update frontmatter metadata (title, description).
   - Add targeted FAQ schema or content sections that directly answer the query.

4. **Verify & Validate:**
   - Run `npx astro check` to verify types and frontmatter schemas.
   - Run `npx astro build --timings` to ensure fast static page generation without errors.

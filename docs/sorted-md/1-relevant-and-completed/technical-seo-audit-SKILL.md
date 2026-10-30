---
name: technical-seo-audit
description: Run automated audits on Astro components for meta tags, canonicals, OpenGraph images, schema markup, and heading structure.
---

# Technical SEO Audit Skill

Use this workflow to audit and fix technical SEO requirements across ZiaFlow Astro pages.

## Verification Checklist

1. **Canonical & URL Structure:**
   - Every page must output a canonical link pointing to `https://ziaflow.com<pathname>`.
   - Trailing slashes should be consistent with site settings.

2. **Heading Hierarchy:**
   - Exactly one `<h1>` per page.
   - Sequential heading levels (`<h2>` followed by `<h3>`, no skips).

3. **OpenGraph & Twitter Cards:**
   - `og:title`, `og:description`, `og:image`, and `twitter:card` defined in `metadata` prop passed to `<Layout>`.

4. **Structured Data (Schema.org):**
   - Service pages must contain JSON-LD `Service` schema.
   - Blog posts must contain `Article` schema with `datePublished` and `author`.

5. **Astro Verification:**
   - Run `npx astro check` to validate HTML structure and AST props.
   - Run `node scripts/check-links.mjs` to ensure no 404 internal links.

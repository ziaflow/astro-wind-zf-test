---
name: seo-structured-data
description: >-
  Use this skill when working on SEO, structured data (JSON-LD), metadata,
  Open Graph tags, canonical URLs, sitemaps, robots.txt, llms.txt, AEO
  (Answer Engine Optimization), or any search-engine-related task.
---

# SEO & Structured Data Skill

## Architecture (Post-Remediation)

### Metadata Pipeline
```
Page (.astro) → metadata prop → Layout.astro
                                  ├── Metadata.astro  → <title>, <meta>, OG, Twitter
                                  └── Seo.astro       → JSON-LD only (Organization, WebSite)
```

**Rules:**
- `Metadata.astro` is the **sole owner** of `<title>`, `<meta>`, OG, and Twitter tags
- `Seo.astro` emits **only** global JSON-LD (`Organization` + `WebSite`)
- Page-specific schemas go in dedicated components under `src/components/seo/`
- Never add OG/Twitter tags to Seo.astro — that causes duplicates

### Canonical Business Information (Single Source of Truth)

| Field | Value |
|-------|-------|
| Name | ZiaFlow |
| Description | ZiaFlow builds conversion-focused websites and connected digital systems for Arizona service businesses, healthcare practices, and growing organizations. |
| Phone | +1-480-819-2929 |
| Email | info@ziaflow.com |
| Address | 2822 E Greenway Rd Suite 10 B, Phoenix, AZ 85032 |
| Postal Code | **85032** (not 85302) |
| LinkedIn | https://www.linkedin.com/company/ziaflow |
| Facebook | https://www.facebook.com/ZiaFlowAZ |
| Instagram | https://www.instagram.com/ziaflowaz |

**Use these exact values everywhere.** They must match across:
- `src/config.yaml`
- `src/data/site.ts`
- `src/pages/llms.txt.ts`
- `src/components/seo/LocalBusinessSchema.astro`
- `src/components/seo/ServiceSchema.astro`
- Contact page, footer, tel: links

### JSON-LD Schema Components

| Component | Location | When to Use |
|-----------|----------|-------------|
| Organization + WebSite | `Seo.astro` (global) | Every page (automatic) |
| LocalBusiness | `seo/LocalBusinessSchema.astro` | Homepage, contact, about |
| Service | `seo/ServiceSchema.astro` | Service pages only |
| FAQPage | Create as needed | Pages with visible FAQ sections |
| BlogPosting | Create as needed | Blog post template |

### Sitemap Rules
- Filter in `astro.config.ts` excludes: `/admin`, `/staging`, `/form-test`, `/ziaflow`, `/tag/*`, `/homes/*`, `/landing/*`, `/posts`
- Do NOT use `lastmod: new Date()` — use content dates
- Tag pages are `noindex` but might still appear — ensure filter catches them

### llms.txt
- Single implementation: `src/pages/llms.txt.ts`
- `public/llms.txt` was deleted — do not recreate it
- Uses `getPermalink()` for blog URLs
- Includes answer-ready facts section
- Deduplicates posts by normalized title

### robots.txt
- Source: `public/robots.txt`
- Includes `Sitemap: https://ziaflow.com/sitemap-index.xml`
- `astro-robots-txt` integration may modify output at build

## Common SEO Tasks

### Add structured data to a new page type
1. Create `src/components/seo/MySchema.astro`
2. Accept relevant props (title, description, url, image)
3. Build the JSON-LD object following schema.org spec
4. Render via `<script is:inline type="application/ld+json" set:html={JSON.stringify(schema)} />`
5. Import in the specific page — NOT in Layout.astro

### Audit a page's SEO
1. Check `<title>` length (< 60 chars)
2. Check `<meta description>` length (< 160 chars)
3. Verify canonical URL matches actual URL
4. Verify JSON-LD is valid (use Schema.org Validator)
5. Check OG image exists and has correct dimensions (1200×628)
6. Verify no duplicate meta tags in rendered HTML

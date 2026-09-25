# Web Development Rules

## URL Construction
- ALWAYS use `getPermalink(slug, type)` from `~/utils/permalinks` for generating URLs
- NEVER manually construct URLs like `/blog/${id}` or `/services/${slug}`
- Blog permalink pattern is `/%slug%` — not `/blog/%slug%`

## Metadata
- `Metadata.astro` is the ONLY component that emits OG and Twitter meta tags
- `Seo.astro` emits ONLY JSON-LD structured data — no HTML meta tags
- Do not add a second metadata component to Layout.astro

## Structured Data
- Organization and WebSite schemas are global (in Seo.astro)
- Service, FAQPage, BlogPosting, LocalBusiness schemas are page-specific
- Organization name is hardcoded as "ZiaFlow" — never derive from title strings

## Business Information
- Phone: +1-480-819-2929
- Postal code: 85032 (not 85302)
- Use these consistently — do not introduce variations

## Content
- One canonical post per topic — check for duplicates before creating
- Set `draft: true` to unpublish, not delete — preserves history
- All published posts must have: title, publishDate, excerpt, category, metadata.description

## Sitemap
- Do not use `lastmod: new Date()` — it makes every page look modified
- Test and experimental pages must be excluded from the sitemap filter
- Tag pages are noindex — ensure they stay out of the sitemap

## Security
- HTML-escape ALL user input before interpolating into HTML templates
- Contact form must validate: email format, field lengths, honeypot
- Never commit real API keys to .env.example — use placeholders

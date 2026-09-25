---
name: astro-development
description: >-
  Use this skill when working with Astro framework code, including components,
  pages, layouts, content collections, config, integrations, and build/deployment.
  Activate when the user asks about Astro-specific patterns, APIs, or debugging.
---

# Astro Development Skill

This project uses **Astro 5** with TypeScript, Tailwind CSS, MDX, and Sanity CMS.

## Project Architecture

```
src/
├── assets/          # Static assets processed by Astro (images, styles)
├── components/      # Reusable .astro components
│   ├── common/      # Metadata, Analytics, SiteVerification
│   ├── seo/         # LocalBusinessSchema, ServiceSchema
│   ├── ui/          # Buttons, forms, interactive elements
│   └── widgets/     # Page sections (Hero, Features, Content, FAQ, etc.)
├── content/         # Content collections config (astro:content)
├── data/            # Content files
│   ├── post/        # Manual blog posts (.md/.mdx)
│   └── post-generated/ # AI-generated blog posts
├── layouts/         # Layout.astro, PageLayout.astro
├── pages/           # File-based routing
│   ├── api/         # Server endpoints (contact.ts)
│   ├── services/    # Service pages
│   └── [...blog]/   # Dynamic blog routes
├── utils/           # Helpers (permalinks, images, blog)
└── lib/             # External clients (supabase)
```

## Key Patterns

### Content Collections
- Defined in `src/content/config.ts` using `astro:content`
- Blog posts use `getCollection('post')` with draft filtering
- Permalinks configured as `/%slug%` in `src/config.yaml`

### Routing
- Use `getPermalink(slug, type)` from `~/utils/permalinks` for all URL generation
- Never manually construct URLs like `/blog/${id}` — always use the helper
- Redirects configured in `astro.config.ts` under `redirects`

### Metadata & SEO
- `Metadata.astro` handles all OG/Twitter meta tags (single source of truth)
- `Seo.astro` handles only JSON-LD structured data (Organization + WebSite)
- Page-specific schemas go in `src/components/seo/` components
- Do NOT add OG/Twitter tags to Seo.astro — they already exist in Metadata.astro

### Configuration
- Site config: `src/config.yaml` (via `astrowind:config` virtual module)
- Site data: `src/data/site.ts` (business info, social links)
- Astro config: `astro.config.ts` (integrations, sitemap, redirects)

### Integrations
- `@astrojs/sitemap` — auto-generates sitemap (filter excludes test/tag pages)
- `astro-robots-txt` — generates robots.txt from `public/robots.txt`
- `@astrojs/tailwind` — Tailwind CSS
- `@astrojs/mdx` — MDX support
- `@sanity/astro` — Sanity CMS integration
- `astro-compress` — HTML/CSS/JS minification
- `@astrojs/prefetch` — link prefetching

### Build & Deploy
- `npm run build` → `astro build` → `dist/`
- `postbuild` runs link checker + IndexNow notification
- Deployed on Vercel (static output mode)
- Link checker now fails CI on broken internal links

## Common Tasks

### Add a new page
1. Create `src/pages/my-page.astro`
2. Import and use `PageLayout` or `Layout`
3. Set metadata including title, description, robots

### Add a blog post
1. Create `.mdx` file in `src/data/post/`
2. Include frontmatter: title, publishDate, excerpt, category, draft, metadata
3. Verify permalink generates correctly via `getPermalink()`

### Add structured data to a page
1. Create a schema component in `src/components/seo/`
2. Import and render it in the specific page template
3. Do NOT add it to the global `Seo.astro` — keep schemas page-specific

### Modify the sitemap
1. Edit the `filter` function in `astro.config.ts` sitemap integration
2. Do NOT use `lastmod: new Date()` — use content dates or omit

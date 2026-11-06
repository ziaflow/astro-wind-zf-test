# ZiaFlow Web Platform — Agent Handoff Manifest

> **Current Status:** Verified Live in Production  
> **Production URL:** [https://ziaflow.com](https://ziaflow.com)  
> **Repository:** `ziaflow/astro-wind-zf-test`  
> **Branch:** `main` (Latest commit: `8672d14`)  
> **Last Verified Build:** November 5, 2026 (85/85 tests passing, 0 broken internal links, 0 short meta descriptions)  
> **Hosting & Edge:** Vercel Serverless/Edge (Node 24 runtime, static prerender with on-demand edge routing)

---

## 1. Executive Summary & Architecture

ZiaFlow is a high-performance web platform built for digital transformation, local Phoenix SEO dominance, and automated lead capture/intake. The architecture prioritizes sub-second page loads, strict zero-404 link integrity, deterministic schema entity graphs for search engine understanding, and privacy-preserving, QA-isolated telemetry.

```
                              ┌────────────────────────────────────────┐
                              │            Vercel CDN Edge             │
                              │   - 301 Edge Redirects (Legacy URLs)   │
                              │   - Static Asset Pre-rendering         │
                              └──────────────────┬─────────────────────┘
                                                 │
                                 ┌───────────────┴───────────────┐
                                 │                               │
                       [Static Client Pages]             [API & Middlewares]
                    - 71 Compiled HTML routes         - /api/contact, /api/estimate
                    - Kairo CRO Design System         - /api/customerio-webhook
                    - AstroWind Foundation            - /api/google-metrics-sync
                                 │                               │
                                 ├───────────────────────────────┤
                                 ▼                               ▼
                      ┌──────────────────────┐        ┌──────────────────────┐
                      │    Sanity Studio     │        │     Supabase DB      │
                      │   - Studio v3 CMS    │        │  - Atomic Lead RPC   │
                      │   - Content lake     │        │  - telemetry schema  │
                      └──────────────────────┘        └──────────────────────┘
```

### Core Technologies
- **Framework:** Astro 5 (`output: "static"` with `@astrojs/vercel` serverless adapter).
- **Frontend Components:** Astro components + Tailwind CSS + React islands where stateful interactions are needed.
- **Headless CMS:** Sanity v3 in `studio-gemini-blog/`.
- **Database & Intake:** Supabase Postgres (`ruhnueopjedaywiqhpgi`), atomic stored procedures (`submit_lead_intake`).
- **Telemetry & CDP:** Google Analytics 4, Microsoft Clarity, Google Tag Manager, Customer.io Data Pipelines v4.15.3.

---

## 2. Production State & Zero-Defect Baseline

As of commit `8672d14` on `main`:

### A. 404 Resolution & Link Integrity
- **Crawl Audit:** 3,269 internal links across 71 static pages crawled with zero (0) broken links.
- **Centralized Redirect Engine:** All legacy URLs, dated blog slugs, and retired taxonomies are mapped in `src/config/redirects.ts`.
- **Direct Permalink Resolution:** `src/utils/permalinks.ts` automatically routes internal links (such as category tags) to canonical 200 OK targets (e.g. `/category/marketing-automation` -> `/services/automation`), avoiding intermediate 301 hops.

### B. SEO & Answer Engine Optimization (AEO)
- **Meta Descriptions:** Every indexable page conforms to the **140–160 character window**. Zero pages are under 120 characters.
  - Homepage: 153 chars (`"Custom web development and SEO for Arizona service businesses. High-speed Astro websites, local search dominance, and 60-second automated lead follow-up."`).
  - Core Services & Growth Tools: 145–155 chars each.
- **Structured Data:** Homepage mounts valid `Organization`, `WebSite`, `LocalBusiness`, and `FAQPage` JSON-LD schemas.
- **Heading Integrity:** 1:1 mapping between `<title>` and `<h1>` entities for brand clarity.

### C. Lead Intake & Anti-Bot Architecture
- Forms in `src/components/ui/Form.astro` execute idempotency keys, button-locking debounce, and invisible honeypots.
- Submissions hit Supabase atomic RPC with full attribution (UTM parameters, referring domain) without leaking PII to third-party trackers.

### D. Customer.io CDP Integration
- Embedded Customer.io CDP snippet in `src/components/common/Analytics.astro` conditioned on `window.__zfIsProdHost` and `PUBLIC_CUSTOMER_IO_WRITE_KEY`.
- Submissions trigger `analytics.identify(email, traits)` and `analytics.track("Lead Form Submitted", traits)` with graceful fallback to `_cio`.

---

## 3. Directory & File Reference

| Path | Purpose | Key Conventions |
| :--- | :--- | :--- |
| `src/config/redirects.ts` | Canonical source for all 301 redirects | Keep synchronized with `astro.config.ts` |
| `src/utils/permalinks.ts` | Resolves paths, canonicals, and menus | Always route through `definitivePermalink` |
| `src/components/common/Analytics.astro` | GA4, Clarity, Customer.io integration | Strictly enforces QA exclusion & host checks |
| `src/components/ui/Form.astro` | Primary lead capture component | Must maintain honeypot, debounce, and RPC schema |
| `src/kairo/` | Kairo design system (CRO-focused assets) | Contains customer case studies & page data models |
| `studio-gemini-blog/` | Sanity v3 Studio | Schemas for post, author, category, redirect |
| `scripts/overnight-runner.ps1` | Long-running maintenance runner | Processes `task_queue.json` in atomic increments |
| `tests/` | Automated Node test suite | Run via `npm run test:intake` + `node --test` |

---

## 4. Environment Variables

Configure these in `.env` (local) and Vercel Project Settings (production):

```bash
# Supabase Persistence
PUBLIC_SUPABASE_URL=https://ruhnueopjedaywiqhpgi.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Analytics & Verification
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
PUBLIC_CLARITY_PROJECT_ID=XXXXXXXXXX
PUBLIC_GTM_CONTAINER_ID=GTM-XXXXXXX

# Customer.io CDP (Client-side Data Pipelines)
PUBLIC_CUSTOMER_IO_WRITE_KEY=your_cdp_write_key_here

# Customer.io Webhooks (Server-side Ingestion)
CIO_WEBHOOK_SIGNING_KEY=your_webhook_signing_key_here

# IndexNow (SEO Instant Crawl)
INDEXNOW_KEY=your_indexnow_api_key
```

---

## 5. Mandatory Guardrails for Agents

> [!CAUTION]
> **Strict Operational Boundaries:**
> 1. **No Forced Git Pushes:** Never run `git push --force` or `--force-with-lease`. All commits to `main` must be clean, linear fast-forwards or explicit merge commits.
> 2. **No Destructive Database Queries:** Never execute `DROP TABLE`, `TRUNCATE`, or unscoped `DELETE` queries on Supabase.
> 3. **Draft-First for Sanity CMS:** Edits in Sanity must be performed as drafts first or validated through schemas before publishing.

### Verification Checklist Before Every Push
Any future agent modifying code MUST run this verification pipeline:

```bash
# 1. Format check
npx prettier --check "src/**/*.{ts,js,astro,md}"

# 2. Intake and Lead Pipeline Tests (35 tests)
npm run test:intake

# 3. Analytics, Redirect, and Security Tests (50 tests)
node --test tests/analytics-isolation.test.mjs tests/redirects-and-404.test.mjs tests/entity-trust.test.mjs tests/google-metrics-sync.test.mjs tests/customerio-webhook.test.mjs

# 4. Production Build & Internal Link Scan
npm run build
```

---

## 6. Known Traps & Troubleshooting

1. **Windows Sandbox File Locking:**
   - On Windows PowerShell, commands that directly modify `.git/` (like `git push`, `git commit`, `git checkout`) may trigger `EPERM` or `.git/FETCH_HEAD: Permission denied` inside standard sandbox mode. Run those specific commands with `BypassSandbox: true`.

2. **Prettier CRLF vs LF Line Endings:**
   - Windows checkouts may alter CRLF endings. If `npx prettier --check` fails on unchanged files, run `npx prettier -w <file>` on the touched files before staging.

3. **Customer.io Live Activation:**
   - The snippet in `Analytics.astro` is wrapped in `{ customerIoWriteKey && ... }`. If tracking does not appear in browser DevTools on production, confirm that `PUBLIC_CUSTOMER_IO_WRITE_KEY` is saved in the Vercel project environment variables and redeploy.

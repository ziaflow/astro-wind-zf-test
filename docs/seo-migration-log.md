# ZiaFlow SEO Migration Log & Equity Preservation Register

**Date:** October 30, 2026  
**Scope:** Design migration from AstroWind to Kairo Astro frontend architecture while preserving 100% of organic search rankings, query targets, canonical URLs, and lead-intake capabilities.

---

## 1. Migration Intent & Core Directives

In accordance with user and architectural specifications:
1. **Design System & Layouts:** Fully migrated to Kairo Astro design system (`src/kairo/*`) and native components.
2. **Search Intent & Content:** All existing headings, keyword-targeted body copy, technical guides, checklists, and service offerings are preserved without wholesale text modifications.
3. **No Overlapping Tools:** Single source of truth for metadata via `src/config/site.ts` and `@astrolib/seo`, native `@astrojs/sitemap`, `astro-robots-txt`, and verified analytics integrations (GA4 `G-HE4BRSW364`, GTM `GTM-5Q2JZPVG`, Clarity `rc0l0o7tmd`).

---

## 2. Preserved URL Structure & Canonical Mappings

All ZiaFlow primary routes maintain exact 1:1 canonical matching without trailing slashes:

| Route Path | Type | Primary Search Target / Intent | Canonical URL |
| :--- | :--- | :--- | :--- |
| `/` | Core Landing | Phoenix Web Development & Digital Marketing Agency | `https://ziaflow.com` |
| `/about` | Brand Authority | ZiaFlow Digital Transformation Partners & Local Credentials | `https://ziaflow.com/about` |
| `/contact` | Intake & Conversion | Phoenix Digital Transformation Consultation & Intake | `https://ziaflow.com/contact` |
| `/audit` | High-Intent Lead Gen | Phoenix Speed, SEO & Automation Growth Audit | `https://ziaflow.com/audit` |
| `/services` | Directory Index | ZiaFlow Business Automation & Digital Marketing Services | `https://ziaflow.com/services` |
| `/services/web-development` | Commercial Service | High-performance Astro/SSR web engineering | `https://ziaflow.com/services/web-development` |
| `/services/automation` | Commercial Service | Marketing & CRM Automation (Customer.io, Make, Supabase) | `https://ziaflow.com/services/automation` |
| `/services/seo` | Commercial Service | Technical SEO, GEO/AEO & Structured Knowledge Graphs | `https://ziaflow.com/services/seo` |
| `/services/software` | Commercial Service | Custom Internal Software & Workflow Tools | `https://ziaflow.com/services/software` |
| `/services/ecommerce` | Commercial Service | High-speed headless e-commerce engineering | `https://ziaflow.com/services/ecommerce` |
| `/services/ppc` | Commercial Service | Paid Search, Performance Ads & Local Service Ads (LSAs) | `https://ziaflow.com/services/ppc` |
| `/growth-tools` | Interactive Utilities | Growth Triage & Self-Service ROI Calculators | `https://ziaflow.com/growth-tools` |
| `/growth-tools/website-conversion-checklist` | Lead Asset | Phoenix Website Conversion Optimization Checklist | `https://ziaflow.com/growth-tools/website-conversion-checklist` |
| `/growth-tools/local-visibility-check` | Lead Asset | Google Maps & Local Pack Visibility Calculator | `https://ziaflow.com/growth-tools/local-visibility-check` |
| `/growth-tools/website-project-estimator` | Interactive Tool | Realistic Scoping & Price Estimation Utility | `https://ziaflow.com/growth-tools/website-project-estimator` |
| `/growth-tools/lead-follow-up-assessment` | Interactive Tool | Speed-to-lead & Pipeline Decay Diagnostic | `https://ziaflow.com/growth-tools/lead-follow-up-assessment` |
| `/growth-tools/software-stack-assessment` | Interactive Tool | SaaS Stack Redundancy & Cost Audit | `https://ziaflow.com/growth-tools/software-stack-assessment` |
| `/blog` | Content Hub | Technical Insights, Engineering Guides & Agency Research | `https://ziaflow.com/blog` |

---

## 3. High-Value Ranking Article Preservations

The following articles with proven GSC impressions and ranking equity are strictly preserved with matching headings and permalinks:

1. **`https://ziaflow.com/marketing-automation-for-arizona-service-businesses-save-time-increase-bookings`**
   - *Target Intent:* Arizona service business marketing automation, CRM intake routing, booking conversion.
   - *GSC Historical Metric:* 350+ impressions, proven organic click baseline.

2. **`https://ziaflow.com/website-conversion-checklist-for-phoenix-businesses`**
   - *Target Intent:* Phoenix local business conversion rate optimization, local trust signals, mobile viewport speed.
   - *GSC Historical Metric:* 89+ impressions, position 13.6, actively climbing.

3. **`https://ziaflow.com/google-local-service-ads-in-2025`**
   - *Target Intent:* Google Local Service Ads, Google Guaranteed badge setup, dispute handling, HVAC/home service ROI.
   - *GSC Historical Metric:* 116+ impressions.

4. **`https://ziaflow.com/web-development-in-2026-a-practical-guide-to-building-fast-secure-high-converting-websites`**
   - *Target Intent:* Modern web performance, Astro SSR, Core Web Vitals optimization, zero-bloat architecture.
   - *Redirect Catchment:* Legacy variations `/web-development-in-2026-a-practical-guide-to-building-fast-secure-conversion-ready-websites` and `...-highconverting-websites` permanently 301 redirected to canonical target.

5. **`https://ziaflow.com/commercial-hvac-lead-capture-crm-integration-guide`**
   - *Target Intent:* Commercial HVAC lead capture, dispatch intake automation, dual-write reliability.

---

## 4. 301 Permanent Redirect Registry (33 Verified Mappings)

All legacy and variant paths have permanent 301 redirects configured in `astro.config.ts` and compiled to Vercel route headers:

1. `/old-service-page` ➔ `/services/web-development`
2. `/kairo-preview` ➔ `/`
3. `/local-visibility-check` ➔ `/growth-tools/local-visibility-check`
4. `/website-project-estimator` ➔ `/growth-tools/website-project-estimator`
5. `/lead-follow-up-assessment` ➔ `/growth-tools/lead-follow-up-assessment`
6. `/software-stack-assessment` ➔ `/growth-tools/software-stack-assessment`
7. `/website-conversion-checklist` ➔ `/growth-tools/website-conversion-checklist`
8. `/web-development-in-2026-a-practical-guide-to-building-fast-secure-highconverting-websites` ➔ `/web-development-in-2026-a-practical-guide-to-building-fast-secure-high-converting-websites`
9. `/web-development-in-2026-a-practical-guide-to-building-fast-secure-conversion-ready-websites` ➔ `/web-development-in-2026-a-practical-guide-to-building-fast-secure-high-converting-websites`
10. `/how-to-fix-leaking-lead-funnel-service-business` ➔ `/commercial-hvac-lead-capture-crm-integration-guide`
11. `/services/web-design` ➔ `/services/web-development`
12. `/services/custom-software` ➔ `/services/software`
13. `/services/digital-marketing` ➔ `/services/seo`
14. `/services/cro` ➔ `/services/seo`
15. `/services/google-ads` ➔ `/services/ppc`
16. `/services/crm` ➔ `/services/automation`
17. `/services/ai` ➔ `/services/automation`
18. `/pricing` ➔ `/contact`
19. `/case-studies` ➔ `/services`
20. `/portfolio` ➔ `/services`
21. `/quote` ➔ `/contact`
22. `/get-started` ➔ `/contact`
23. `/estimate` ➔ `/growth-tools/website-project-estimator`
24. `/calculator` ➔ `/growth-tools/website-project-estimator`
25. `/free-audit` ➔ `/audit`
26. `/website-audit` ➔ `/audit`
27. `/seo-audit` ➔ `/audit`
28. `/speed-test` ➔ `/audit`
29. `/phoenix-web-design` ➔ `/services/web-development`
30. `/scottsdale-web-design` ➔ `/services/web-development`
31. `/tempe-web-design` ➔ `/services/web-development`
32. `/mesa-web-design` ➔ `/services/web-development`
33. `/chandler-web-design` ➔ `/services/web-development`

---

## 5. Indexing, Robots & Sitemap Policy

1. **`robots.txt` Directives:**
   - Universal search crawler access (`User-agent: *`, `Allow: /`).
   - Explicit sitemap discovery link: `Sitemap: https://ziaflow.com/sitemap-index.xml`.
2. **Sitemap Exclusions:**
   - Thin taxonomy pages (`/category/*`, `/tag/*`) excluded to prevent crawl budget waste and duplicate snippet competition.
   - Internal utility and staging paths (`/admin`, `/staging`, `/form-test`, `/kairo-preview`, `/posts`) strictly omitted.
3. **Structured Data:**
   - JSON-LD schemas intact for `Organization`, `LocalBusiness`, `FAQPage`, and `BlogPosting`.
   - Google Site Verification ID: `orcPxI47GSa-cRvY11tUe6iGg2IO_RPvnA1q95iEM3M`.

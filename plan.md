# ZiaFlow Architecture & Execution Plan

**Last Updated:** October 30, 2026 (America/Phoenix)  
**Branch:** `feature/kairo-redesign` (PR #41)  
**Production URL:** [https://ziaflow.com](https://ziaflow.com)  
**Vercel Preview URL:** [https://astro-wind-zf-test-git-feature-5cfddc-jeremys224-4312s-projects.vercel.app](https://astro-wind-zf-test-git-feature-5cfddc-jeremys224-4312s-projects.vercel.app)

---

## 1. Executive Summary & Core Positioning

ZiaFlow engineers high-performance websites and verified lead follow-up systems for Arizona service businesses.

### Primary Value Proposition

- **Headline:** Websites and lead follow-up for Arizona service businesses
- **Core Offer:** The **Lead Capture & Follow-Up Sprint**
- **Promise:** _Give every accepted inquiry an owner and a next step._
- **Scope Contract:**
  1. Capture up to three agreed inquiry sources (e.g., website contact form, Google Local Service Ads, phone routing).
  2. Record atomic, deduplicated lead receipts in a secured database ledger (`lead_submissions` & `leads`).
  3. Dispatch instantaneous staff notifications (SMS/Email) with designated ownership and triage instructions.
  4. Provide a tested, documented operator runbook for inquiry handling, exception triage, and failover recovery.

---

## 2. Completed Milestones & Current Status

### A. Kairo Design System & UI Modernization

- [x] **Dark Obsidian & Garnet Aesthetic:** Adopted charcoal `#101010` / `#1a1a1a`, crimson/garnet `#A22A36` signal accent, and turquoise `#3F9B93` operational touches.
- [x] **Typography & Token Scale:** Ported `@theme` tokens and font scales (`hero`, `display`, `title`, `subtitle`, `lead`, `label`) with `@layer` protection.
- [x] **Navigation & Header:** Modernized sticky navigation with direct phone CTA `(602) 834-4239`, Microsoft Bookings link, and streamlined mobile drawer.
- [x] **Ask AI Float Pill:** Relocated from blocking screen center to unobtrusive bottom-right (`bottom: 18px; right: 18px`) with persistent `×` dismissal.
- [x] **Interactive Growth Tools:** Ported 5 self-assessment & planning tools:
  - `/growth-tools/lead-follow-up-assessment`
  - `/growth-tools/website-project-estimator`
  - `/growth-tools/software-stack-assessment`
  - `/growth-tools/local-visibility-check`
  - `/growth-tools/website-conversion-checklist`
- [x] **Arizona Sunset & Desert Footer (`src/components/widgets/Footer.astro`):**
  - Integrated custom SVG backdrop featuring setting sun (`#fff0e6` to `#a22a36`), layered mountain silhouettes (`#7c1e29`, `#a22a36`), turquoise saguaro cacti (`#3f9b93`), and stippled grain texture.
  - Fully accessible, selectable HTML content: brand address, phone, email, and CTA.
  - 4 navigation columns: **Services**, **Blog** (recent articles), **Company** (Home, About, Contact), and **Connect** (LinkedIn, Instagram, Facebook, Google, Yelp, RSS with visible text labels).
  - Clean legal bar with dynamic copyright year and Arizona signature.
  - Connected across all layouts via `src/kairo/components/shared/layout/footer.astro`.

### B. Supabase Assets & Database Telemetry

- [x] **Storage Integration (`src/lib/supabase-assets.ts`):**
  - Connected to active Supabase storage bucket `web-img`.
  - Configured asset mappings: `ZiaFlow_Logo_solo.png`, `ziaflow_com_updated.png`, `Google_Partner.png`, `microsoft_partner.png`, `tiktok_partner.jpg`.
  - Added signed URL generation helper `getSupabaseAssetUrl` with 1-year duration.
  - Updated `src/components/seo/LocalBusinessSchema.astro` to source the live brand logo from Supabase storage.
- [x] **Intake & Receipt Persistence (`src/pages/api/contact.ts` & `src/lib/contact-intake.ts`):**
  - Deduplicated receipt ledger in `lead_submissions` with idempotency keys.
  - Atomic RPC transactions routing qualified inquiries into `leads`.
  - Server-controlled test isolation (`is_test = true`).
  - Gated telemetry: Microsoft Clarity, GA4, and Customer.io restricted strictly to production hosts (`(www.)?ziaflow.com`).

### C. Claim Discipline & Copy Alignment

- [x] **Defensible Sales Claims:** Eliminated unverified promises ("turn every inquiry into a booked job", "guaranteed leads", sub-60s SLA guarantees, rigid 48-hr video turnaround promises).
- [x] **Service Pages Grounded:**
  - `/services/automation`: Bounded Sprint scope, operator responsibilities, explicit exclusions.
  - `/services/seo`: Focused on Search Console query targeting, crawlability, and 28-day reporting cycles (no AI Overview schema myths).
  - `/services/web-development`: Focused on speed, mobile task completion, and clean code ownership.
  - `/services/cro`, `/services/ppc`, `/services/local-service-ads`: Aligned with verified inquiry generation rather than speculative booking claims.

### D. Verification & CI/CD Health

- [x] **Unit & Integration Tests:** 42 / 42 passing (`tests/growth-tools.test.mjs`, `tests/growth-welcome.test.mjs`, `tests/telemetry-freshness.test.mjs`, `tests/contact-capture.test.mjs`, `tests/clarity-sync.test.mjs`, `tests/redirects-and-404.test.mjs`).
- [x] **Type Checking:** 0 errors (`npx tsc --noEmit` and `astro check`).
- [x] **ESLint:** Clean pass across all files (`npm run check:eslint`).
- [x] **Prettier Code Style:** Clean pass across all repository files (`npm run check:prettier`).
- [x] **Static & SSR Build:** Astro build succeeds cleanly (`npm run build`), link check verifies 0 broken internal links.

### E. 404 Elimination & Link Equity Preservation

- [x] **Permanent 301 Redirects:** Configured 33 permanent redirects in `astro.config.ts` and mirrored in `src/middleware.ts` covering:
  - Growth Tools: `/lead-follow-up-assessment`, `/software-stack-assessment`, `/website-conversion-checklist` -> `/growth-tools/:slug`.
  - Legacy Blog Slugs: `/web-development-in-2026-a-practical-guide-to-building-faster-safer-conversion-ready-websites` and `/web-development-in-2026-a-practical-guide-to-building-fast-secure-conversion-ready-websites` -> canonical high-converting guide.
  - Legacy `/blog/:slug` prefix requests -> canonical root `/:slug`.
  - Legacy sub-service URLs: `/services/astro`, `/services/react`, `/services/wix` -> `/services/web-development`; `/services/shopify` -> `/services/ecommerce`.
  - Empty category archives: `/category/strategy`, `/category/tutorial` -> `/blog`.
  - Legacy case study: `/case-studies/scottsdale-dental-patient-intake-automation` -> `/case-studies`.
- [x] **High-Value 404 Recovery:** Redesigned `src/pages/404.astro` with direct recovery cards for Services, Growth Tools, Playbooks/Blog, and Free 48-Hr Audit.
- [x] **Regression Prevention:** Created `tests/redirects-and-404.test.mjs` ensuring zero redirect chains, zero self-referential loops, and active destination verification.

---

## 3. Analytics, Conversion & Traffic Audit

### Grounded Baseline Findings (90-Day GSC & GA4)

1. **GSC Organic Clicks Reality:**
   - Total GSC clicks across 90 days: **19 clicks** (July 29–31: 0; August: 5; September: 11; October 1–28: 3).
   - Clicks occurred on exactly **13 days**; the other **79 days** recorded zero clicks.
   - **Conclusion:** Organic traffic is low-volume. The data does not support either a catastrophic organic collapse or a roaring growth trend. It establishes an early-stage baseline requiring disciplined, deliberate execution.

2. **Lead Tracking Anomaly (P0 Priority):**
   - GA4 reported **55 `generate_lead` events** and **54 `ads_conversion_Contact_Us_1` events** across **53 unique users**.
   - Contact page rows demonstrate a direct 2:1 ratio:
     - `Contact ZiaFlow - Digital Transformation Experts in Phoenix` (47 views -> 94 key events).
     - Second contact page variant (7 views -> 14 key events).
   - **Diagnosis:** Every single contact page view triggered both `generate_lead` and `ads_conversion_Contact_Us_1` simultaneously on page load (via GTM page view trigger or GA4 UI auto-event). These 109 key events do not represent 109 qualified inquiries.
   - **Remediation:** Application forms (`sales-form.ts`, `lead-form.ts`) only emit analytics events upon confirmed HTTP 200 backend acceptance with unique `submission_id`. GTM / GA4 triggers must be audited to decouple page loads from conversion events.

3. **Production vs. QA / Dev Traffic Isolation (P0 Priority):**
   - GA4 recorded explicit `internal-qa / verification` sessions (3 sessions, 9 key events) in production reporting.
   - **Implemented Fix:** `src/components/common/Analytics.astro` now explicitly inspects `utm_source=internal-qa`, `utm_medium=verification`, `internal_qa=1`, or `localStorage.zf_internal_user` and terminates analytics initialization (`window.__zfIsProdHost = false`), preventing test runs from contaminating GA4 or Clarity.
   - `src/pages/api/contact.ts` and `src/lib/contact-intake.ts` automatically flag submissions with QA UTM tags, non-production environments, or test domains (`@example.com`, `.test`) as `is_test = true`.

4. **Traffic Spikes & Bot Classification (P1 Priority):**
   - October 24 GA4 anomaly (122 users, 131 views, 415 events) represents concentrated non-commercial traffic.
   - Clarity excluded 136 bot sessions in the last 7 days.
   - Direct attribution and datacenter geolocation (AWS Boardman, GCP Council Bluffs, Singapore) are operational clues, not definitive proofs. Server request logs and user agents must be cross-referenced before excluding traffic cohorts.

---

## 4. Prioritized Execution Roadmap

| Priority | Focus Area                   | Action Item                                                                                                                                        | Completion Criterion                                                                                      |    Status     |
| :------: | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | :-----------: |
|  **P0**  | **Lead Event Triggers**      | Audit GTM (`GTM-5Q2JZPVG`) container tags and GA4 Custom Events to remove page-load triggers for `generate_lead` and `ads_conversion_Contact_Us_1` | Page visit or reload produces 0 conversion events; only verified form submission generates 1 event        |  In Progress  |
|  **P0**  | **QA Traffic Isolation**     | Gate client-side analytics scripts and server intake against internal QA parameters                                                                | Internal QA visits (`utm_source=internal-qa`) produce 0 GA4/Clarity events; intake records `is_test=true` | **Completed** |
|  **P1**  | **404 Elimination**          | Map 33 legacy endpoints and variants to permanent 301 redirects and enhance recovery UI                                                            | Zero unmapped legacy URLs in GSC; build link check passes 100%                                            | **Completed** |
|  **P1**  | **GA4 & GSC Reconciliation** | Align date windows, hostnames, and property streams between GSC (19 clicks) and GA4 (51 google/organic sessions)                                   | Documented reconciliation accounting for attribution models and measurement delays                        |   Scheduled   |
|  **P1**  | **Traffic Anomaly Audit**    | Cross-reference Oct 14 and Oct 24 GA4 spikes against Clarity bot logs and edge access logs                                                         | Verified attribution classifying anomalous traffic                                                        |   Scheduled   |
|  **P2**  | **Commercial SEO Sprint**    | Optimize `/services/automation` for high-intent local queries (`marketing automation phoenix`: 52 impr, pos 12.2)                                  | Specific Phoenix client workflows, deliverables, case proof, and internal linking deployed                |   Scheduled   |

---

## 5. Verification Standards

| Priority | Focus Area                   | Action Item                                                                                                                                        | Completion Criterion                                                                                      |    Status     |
| :------: | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | :-----------: |
|  **P0**  | **Lead Event Triggers**      | Audit GTM (`GTM-5Q2JZPVG`) container tags and GA4 Custom Events to remove page-load triggers for `generate_lead` and `ads_conversion_Contact_Us_1` | Page visit or reload produces 0 conversion events; only verified form submission generates 1 event        |  In Progress  |
|  **P0**  | **QA Traffic Isolation**     | Gate client-side analytics scripts and server intake against internal QA parameters                                                                | Internal QA visits (`utm_source=internal-qa`) produce 0 GA4/Clarity events; intake records `is_test=true` | **Completed** |
|  **P1**  | **404 Elimination**          | Map 33 legacy endpoints and variants to permanent 301 redirects and enhance recovery UI                                                            | Zero unmapped legacy URLs in GSC; build link check passes 100%                                            | **Completed** |
|  **P1**  | **GA4 & GSC Reconciliation** | Align date windows, hostnames, and property streams between GSC (19 clicks) and GA4 (51 google/organic sessions)                                   | Documented reconciliation accounting for attribution models and measurement delays                        |   Scheduled   |
|  **P1**  | **Traffic Anomaly Audit**    | Cross-reference Oct 14 and Oct 24 GA4 spikes against Clarity bot logs and edge access logs                                                         | Verified attribution classifying anomalous traffic                                                        |   Scheduled   |
|  **P2**  | **Commercial SEO Sprint**    | Optimize `/services/automation` for high-intent local queries (`marketing automation phoenix`: 52 impr, pos 12.2)                                  | Specific Phoenix client workflows, deliverables, case proof, and internal linking deployed                |   Scheduled   |

---

## 5. Verification Standards

1. **No Silent Failures:** Any API failure, database rejection, or misconfigured environment variable must return an accurate HTTP status (`502 Bad Gateway` or `503 Service Unavailable`) rather than misleading 200 OK responses.
2. **Deterministic Attribution:** Inquiries must preserve UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) and source page URL.
3. **Environment Hygiene:** Development and preview environments must never contaminate production metrics in Clarity, Google Analytics 4, or Customer.io.
4. **Evidence Before Assertions:** All analytics interpretations must cite exact date bounds, matched scopes, and verifiable request-level evidence before diagnosing traffic health.

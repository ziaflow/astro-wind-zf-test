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

- [x] **Unit & Integration Tests:** 35 / 35 passing (`node --test tests/growth-tools.test.mjs tests/growth-welcome.test.mjs tests/telemetry-freshness.test.mjs tests/contact-capture.test.mjs`).
- [x] **Type Checking:** 0 errors (`npx tsc --noEmit`).
- [x] **ESLint:** Clean pass across all files (`npm run check:eslint`).
- [x] **Prettier Code Style:** Clean pass across all repository files (`npm run check:prettier`).
- [x] **Static & SSR Build:** Astro build succeeds cleanly (`npm run build`).

---

## 3. Tasks in Progress & Next Milestones

| ID      | Phase           | Task Description                                                                                                                | Acceptance Criteria                                                                          | Target |
| ------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------ |
| **T-1** | Intake QA       | Execute tagged synthetic test submission (`is_test=true`) on Vercel preview deployment                                          | Database receipt logged in `lead_submissions` and `leads`; excluded from production metrics  | Day 1  |
| **T-2** | Visual Audit    | Inspect Playwright screenshots of all service pages with new footer across mobile (375px), tablet (768px), and desktop (1280px) | Zero horizontal overflow, clean touch targets, no text clipping                              | Day 1  |
| **T-3** | PR Merging      | Convert GitHub PR #41 from Draft to Ready for Review and squash-merge to `main`                                                 | All GitHub Actions checks green, preview verified by team                                    | Day 2  |
| **T-4** | Telemetry Sync  | Verify daily scheduled cron synchronization for GSC, Clarity, and GA4 in Supabase Edge Functions                                | Snapshot rows written to `analytics_source_snapshots` and `clarity_sync_runs`                | Day 3  |
| **T-5** | Content Sprints | Deploy connected pair updates for Phoenix conversion checklist and local HVAC case study                                        | Internal anchor integrity, zero broken links, schema validated with Google Rich Results Test | Day 4  |

---

## 4. Verification Standards

1. **No Silent Failures:** Any API failure, database rejection, or misconfigured environment variable must return an accurate HTTP status (`502 Bad Gateway` or `503 Service Unavailable`) rather than misleading 200 OK responses.
2. **Deterministic Attribution:** Inquiries must preserve UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) and source page URL.
3. **Environment Hygiene:** Development and preview environments must never contaminate production metrics in Clarity, Google Analytics 4, or Customer.io.

# CRO Lead Capture, Universal Phone & Booking Architecture

**Date:** 2026-11-07  
**Status:** In Review  
**Author:** Antigravity & User  
**Target Delivery:** `feature/cro-lead-capture`

---

## 1. Intent & The "Why"

Behavioral telemetry from **Microsoft Clarity** (244 sessions, 184 users) identified a critical conversion bottleneck:
- **The 30% Scroll Cliff:** Average scroll depth on desktop is **29.65%**, and on mobile is **41.17%**.
- More than 70% of desktop visitors and 60% of mobile visitors never reach the bottom half of pages.
- Previously, key conversion actions (phone call, booking calendar, and lead forms) were either hidden on mobile (`max-xs:hidden`), buried near the footer, or relegated to external links (e.g. homepage linking out to `/contact#form`).

This design maximizes conversion rate (CRO) across every page of ZiaFlow by making phone contact (`(602) 834-4239`) and booking links (`https://calendly.com/jeremy-sanchez-ziaflow` / `/booking`) universally accessible across desktop and mobile, while deploying an embedded 4-field Short Lead Form for fast intake on non-contact pages and preserving the comprehensive 10-field diagnostic form on `/contact`.

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
1. **Universal Call Access:** A direct tap-to-call link `tel:+16028344239` displaying `(602) 834-4239` (with live emerald availability indicator) visible on all desktop and tablet viewports in the header, plus a mobile sticky action bar.
2. **Universal Booking Access:** A "Book Call" / "Book Consultation" button visible on all viewports linking directly to `/booking` / Calendly, unhiding it on small mobile viewports.
3. **High-Converting Short Lead Form:**
   - 4 required fields:
     1. **Name** (`name`, required, `autocomplete="name"`)
     2. **Company Name** (`company`, required, `autocomplete="organization"`)
     3. **Company Email** (`email`, required, `type="email"`, `autocomplete="email"`)
     4. **Service Selector** (`service_interest`, required, dropdown with default options)
   - Built to Kairo obsidian & garnet design tokens (`#101010`, `#A22A36`, `#3F9B93`).
   - Anti-spam honeypot field (`website_url` / `botcheck`).
   - Client-side validation with instant inline error messaging.
   - Idempotency key generation to prevent duplicate submissions on double-clicks or retries.
   - Direct integration with `/api/contact` (`form_type: 'short_lead'`).
   - Client analytics tracking: Pushes `form_submission` and `generate_lead` events upon confirmed HTTP 200 persistence without PII.
4. **Context-Aware Placement:**
   - **Homepage Funnel:** Replace the button redirecting to `/contact#form` with the embedded Short Lead Form directly in `#lead-review`.
   - **Service Pages:** Embed the Short Lead Form with the relevant service pre-selected.
   - **Global Layout Fallback:** Add a pre-footer intake banner on content/editorial pages in `layout.astro` (with an opt-out prop `hidePreFooterLeadForm`).
5. **Preserve `/contact` as Comprehensive Scoping Form:**
   - Retain the detailed 10-field diagnostic `SalesForm` on `/contact` (and `/pricing`) for high-intent visitors specifying current systems and handoff issues.

### Non-Goals
- Modifying `/contact`'s detailed questionnaire.
- Altering existing Customer.io webhook authentication secrets or CDP pipeline contracts.
- Altering the backend Supabase schema (`lead_submissions` and `leads` already support all necessary fields).

### Anti-Goals
- Never fire conversion events on page load or view (only on verified HTTP 200 intake).
- Never transmit PII (name, email, phone) to Google Analytics 4 or Clarity.
- Never hide phone or booking links on mobile viewports.

---

## 3. Approaches Considered & Tradeoffs

- **Approach 1: Global Pre-Footer Banner Only**  
  *Tradeoff:* 100% automated coverage, but generic copy and trapped at the bottom of pages where scroll depth is low. Dropped.
- **Approach 2: Page-by-Page Components Only**  
  *Tradeoff:* Contextual copy on high-traffic pages, but editorial or new pages risk having zero capture forms. Dropped.
- **Approach 3: Hybrid Architecture (Selected)**  
  1. Universal header tap-to-call + booking button on all screen sizes.
  2. Mobile sticky conversion bar (`[ 📞 Call (602) 834-4239 ]` and `[ 📅 Book Call ]`).
  3. High-visibility in-page Short Lead Form on Homepage and core Service pages (with pre-selected service).
  4. Global pre-footer fallback on editorial/content pages with opt-out on `/contact` and `/booking`.

---

## 4. Component & UI Architecture

### A. Navigation & Header (`src/kairo/components/shared/layout/navbar.astro`)
- Add direct phone CTA with availability indicator:
  ```html
  <a href="tel:+16028344239" class="hidden sm:inline-flex items-center gap-2 rounded-full border border-line-strong bg-ink-2/80 px-3.5 py-2 text-xs font-mono font-semibold text-bone hover:border-signal hover:text-signal transition-colors">
    <span class="size-2 rounded-full bg-emerald-400 animate-pulse"></span>
    <span>(602) 834-4239</span>
  </a>
  ```
- Change booking button from `max-xs:hidden` to always visible on all mobile widths alongside menu toggle.

### B. Mobile Sticky Action Bar (`src/kairo/components/shared/layout/mobile-action-bar.astro`)
- Fixed bottom bar on mobile (`lg:hidden`, `z-[60]`, `bottom-0 inset-x-0`):
  - Tap-to-call `(602) 834-4239` (50% width, high contrast dark card).
  - Book Scoping Call (50% width, garnet `#A22A36` accent).
  - Automatically avoids overlapping with Ask AI float pill (`bottom-16` or offset).

### C. Short Lead Form Component (`src/kairo/components/forms/short-lead-form.astro`)
- Reusable Astro component with props:
  - `title?: string` (Default: "Discuss your website and lead follow-up.")
  - `subtitle?: string` (Default: "Share your details for a fast engineering consultation.")
  - `defaultService?: string` (Default: "Lead Capture & Follow-Up Sprint")
  - `embedded?: boolean`
- Form fields:
  - `name`: Text, required.
  - `company`: Text, required.
  - `email`: Email, required.
  - `service_interest`: Select dropdown, required. Options:
    - Lead Capture & Follow-Up Sprint
    - Marketing Automation & AI Workflows
    - Custom Website & CRO Engineering
    - Local Phoenix SEO & GBP Optimization
    - Google Local Service Ads (LSA) & PPC
    - Custom Software / Full-Stack App
  - Honeypot: Invisible `website_url` field.
  - Submit Button: Full-width or inline button styled with garnet accent, locking on submit (`aria-busy`, disabled state).

### D. Homepage Funnel (`src/kairo/components/home/homepage-sales-funnel.astro`)
- In `#lead-review`, replace `<a href="/contact#form">` with the live `<ShortLeadForm />`.

### E. Service Pages (`src/pages/services/*.astro`)
- Ensure service pages include the `<ShortLeadForm />` with their corresponding service pre-selected.

### F. Global Layout Fallback (`src/kairo/layouts/layout.astro`)
- Accepts `hidePreFooterLeadForm?: boolean`.
- Automatically renders pre-footer Short Lead Form on pages where `hidePreFooterLeadForm !== true`.

---

## 5. Verification & Testing

1. **Intake & Form Tests (`tests/lead-form.test.mjs`, `tests/contact-capture.test.mjs`):**
   - Verify `ShortLeadForm` submission submits payload with `form_type: 'short_lead'`.
   - Verify all 4 fields are validated client-side and server-side.
   - Verify idempotency keys and duplicate submission prevention.
   - Verify `window.dataLayer` pushes `form_submission` and `window.gtag` pushes `generate_lead` without PII.
2. **Telemetry Isolation (`tests/analytics-isolation.test.mjs`):**
   - Ensure QA traffic (`utm_source=internal-qa`) maintains `is_test = true` and zero production analytics contamination.
3. **Build & Typecheck:**
   - `npm run check:astro`
   - `npm run check:eslint`
   - `npm run check:prettier`
   - `npm run build:validate`

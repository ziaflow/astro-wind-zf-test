# CRO Lead Capture, Universal Phone & Booking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement universal click-to-call `(602) 834-4239` and Calendly booking links across all viewports (desktop navbar, mobile sticky action bar), create a high-converting 4-field Short Lead Form connected to Customer.io and Supabase via `/api/contact`, embed it on high-intent pages, and provide a pre-footer fallback while preserving the comprehensive diagnostic form on `/contact`.

**Architecture:** A hybrid CRO conversion layer combining universal navbar/mobile bottom actions (0% scroll depth), an isolated `<ShortLeadForm />` Astro component with client-side animation/validation handlers, direct in-page embedding on the homepage funnel and service pages with pre-selected services, and a layout-level fallback on editorial pages. Submissions route to `/api/contact` with `form_type: 'short_lead'`, deduplicated with client idempotency keys, and synced to Customer.io (Webhook + CDP batch).

**Tech Stack:** Astro 5, TypeScript, Tailwind CSS with Kairo design tokens, GSAP, Supabase, Customer.io Webhooks/CDP, Node test runner.

**Spec:** [`docs/superpowers/specs/2026-11-07-cro-lead-capture-phone-booking-design.md`](file:///c:/Users/jerem/astro-wind-zf-test/docs/superpowers/specs/2026-11-07-cro-lead-capture-phone-booking-design.md)

## Global Constraints

- Never fire conversion events on page load or view; only emit `form_submission` and `generate_lead` upon confirmed HTTP 200 persistence.
- Never pass PII (name, email, phone) to Google Analytics 4 or Microsoft Clarity.
- All 4 short form fields are required: Full Name, Company Name, Work Email, Service Selector.
- Anti-spam honeypot field (`website_url`) must remain invisible to humans and trap bot submissions.
- Contact page `/contact` must retain the comprehensive 10-field diagnostic `SalesForm`.
- All brand telephone CTAs must resolve to `tel:+16028344239` with visible text `(602) 834-4239`.
- All booking CTAs must resolve to `https://calendly.com/jeremy-sanchez-ziaflow` (or `/booking`).

## Review Focus

1. **Mobile Header & Bottom Bar Collision:** Ensure the mobile sticky action bar does not obscure the floating Ask AI pill or footer legal content, and respects safe-area insets.
2. **Double-Click & Rapid Submission:** Ensure the submit button locks immediately (`aria-busy="true"`, disabled) upon first click, preventing double submission or duplicate network requests.
3. **Idempotency Key Persistence:** Ensure retries reuse the existing idempotency key and return `duplicate: true` gracefully without throwing 500 errors.
4. **Honeypot Trap Behavior:** Ensure automated bot scripts filling `website_url` receive a silent 200 OK without creating database or Customer.io records.
5. **Pre-Selected Service Defaults:** Ensure each service page loads the short form with its specific service interest pre-selected in the `<select>` dropdown.

---

### Task 1: Test Suite Extensions for Short Lead Form Intake

**Files:**
- Modify: `tests/lead-form.test.mjs`
- Test: `tests/lead-form.test.mjs`

**Interfaces:**
- Consumes: `/api/contact` intake contracts.
- Produces: Test coverage asserting that `form_type: 'short_lead'` accepts `name`, `company`, `email`, and `service_interest`, traps honeypot inputs, generates client idempotency keys, and emits GA4 `generate_lead` without PII.

- [ ] **Step 1: Write the failing test for `short_lead` form submission behavior**

Add tests to `tests/lead-form.test.mjs`:
```javascript
test('short-lead form validates all 4 required fields and passes form_type short_lead', async () => {
  // Test validation failure when company or service_interest is missing
  // Test successful submission payload construction with form_type: 'short_lead'
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/lead-form.test.mjs`  
Expected: FAIL (missing assertion for `short_lead`)

- [ ] **Step 3: Update `tests/lead-form.test.mjs` to specify the exact behavior contract**

Add unit assertions verifying:
1. Missing `company` or `service_interest` fails validation.
2. Successful submission produces `{ form_type: 'short_lead', name, company, email, service_interest, idempotency_key }`.
3. Event emission pushes `form_name: 'short_lead_form'` to `dataLayer` and `gtag('event', 'generate_lead')` without email or name.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/lead-form.test.mjs`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/lead-form.test.mjs
git commit -m "test: add test coverage for short lead form intake contract"
```

---

### Task 2: Create `<ShortLeadForm />` Component & Client Script

**Files:**
- Create: `src/kairo/components/forms/short-lead-form.astro`
- Create: `src/kairo/components/animation/init/short-lead-form.ts`
- Modify: `src/kairo/components/animation/main.ts`

**Interfaces:**
- Consumes: Kairo styles, `/api/contact` endpoint, DOM helpers in `@/utils/dom`.
- Produces: Reusable `<ShortLeadForm title={...} subtitle={...} defaultService={...} />` component with inline validation, anti-spam honeypot, button locking, and success/error states.

- [ ] **Step 1: Write the client initialization handler in `src/kairo/components/animation/init/short-lead-form.ts`**

Implement `init()` targeting `[data-short-lead-form]`:
- Generate client idempotency key with fallback.
- Validate `name`, `company`, `email`, and `service_interest`.
- Honeypot check for `website_url`.
- On submit: lock submit button (`aria-busy="true"`, disabled), display status.
- Fetch `POST /api/contact` with payload.
- On HTTP 200: push `dataLayer` event `form_submission` (`form_name: 'short_lead_form'`, `service_interest`), call `gtag('event', 'generate_lead', { event_category: 'engagement', event_label: serviceInterest, value: 1 })`, display emerald success message, reset form.
- On error: display friendly error message with phone fallback `(602) 834-4239`.

- [ ] **Step 2: Register `short-lead-form.ts` in `src/kairo/components/animation/main.ts`**

Import and call `initShortLeadForms()` alongside `initSalesForm()`.

- [ ] **Step 3: Create `src/kairo/components/forms/short-lead-form.astro`**

Markup with Kairo tokens:
- Props: `title?: string`, `subtitle?: string`, `defaultService?: string`, `id?: string`.
- 4 required fields with dark styling (`border-line-strong`, `bg-ink-2`, `text-bone`, focus state `border-signal`):
  1. Name: `input name="name" required placeholder="Your full name"`
  2. Company: `input name="company" required placeholder="Company or organization"`
  3. Email: `input name="email" type="email" required placeholder="work@company.com"`
  4. Service: `select name="service_interest" required` with default option selected based on `defaultService` prop.
- Invisible honeypot field `website_url`.
- Submit button with garnet background (`bg-signal`, hover `bg-signal-dark`), bold text, and arrow icon.
- Status message paragraph with `role="status"` and `aria-live="polite"`.

- [ ] **Step 4: Run test suite to verify no regressions**

Run: `npm run test:intake`  
Expected: PASS (all 35+ tests pass)

- [ ] **Step 5: Commit**

```bash
git add src/kairo/components/forms/short-lead-form.astro src/kairo/components/animation/init/short-lead-form.ts src/kairo/components/animation/main.ts
git commit -m "feat(cro): create ShortLeadForm component with client-side validation"
```

---

### Task 3: Universal Navbar Call & Booking CTAs + Mobile Sticky Action Bar

**Files:**
- Modify: `src/kairo/components/shared/layout/navbar.astro`
- Create: `src/kairo/components/shared/layout/mobile-action-bar.astro`
- Modify: `src/kairo/layouts/layout.astro`

**Interfaces:**
- Consumes: `site` config in `@/data/site`, `@/components/shared/ui/button.astro`.
- Produces: Sticky top navbar displaying phone number `(602) 834-4239` with pulse dot and unhidden booking button, plus fixed mobile bottom bar.

- [ ] **Step 1: Update `src/kairo/components/shared/layout/navbar.astro`**

1. Add direct phone CTA next to booking button:
   ```astro
   <a
     href="tel:+16028344239"
     class="hidden sm:inline-flex items-center gap-2 rounded-full border border-line bg-ink-2/80 px-3.5 py-2 text-xs font-mono font-bold text-bone hover:border-signal hover:text-signal transition-colors"
     aria-label="Call ZiaFlow direct line (602) 834-4239"
   >
     <span class="size-2 rounded-full bg-emerald-400 animate-pulse"></span>
     <span>(602) 834-4239</span>
   </a>
   ```
2. Unhide primary booking button on small mobile screens:
   - Change `class="h-11 max-xs:hidden"` to `class="h-10 text-xs sm:h-11 sm:text-sm px-4"` so it renders cleanly beside the mobile menu hamburger on all phones.

- [ ] **Step 2: Create `src/kairo/components/shared/layout/mobile-action-bar.astro`**

Create fixed bottom action bar for mobile viewports (`lg:hidden fixed bottom-0 inset-x-0 z-[60] bg-ink-2/95 border-t border-line-strong backdrop-blur-xl p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]`):
- Left button: `tel:+16028344239` with phone icon, `(602) 834-4239`, pulse dot.
- Right button: `https://calendly.com/jeremy-sanchez-ziaflow` / `/booking` with calendar icon, "Book Scoping Call".

- [ ] **Step 3: Integrate `mobile-action-bar.astro` into `src/kairo/layouts/layout.astro`**

Import and render `<MobileActionBar />` inside `layout.astro`.

- [ ] **Step 4: Verify rendering and build health**

Run: `npm run check:astro`  
Expected: 0 errors

- [ ] **Step 5: Commit**

```bash
git add src/kairo/components/shared/layout/navbar.astro src/kairo/components/shared/layout/mobile-action-bar.astro src/kairo/layouts/layout.astro
git commit -m "feat(cro): add universal phone CTA and mobile sticky action bar"
```

---

### Task 4: In-Page Short Form Embeds & Layout Pre-Footer Fallback

**Files:**
- Modify: `src/kairo/components/home/homepage-sales-funnel.astro`
- Modify: `src/kairo/layouts/layout.astro`
- Modify: `src/pages/services/*.astro` (e.g. `automation.astro`, `web-development.astro`, `software.astro`, `seo.astro`, `cro.astro`)

**Interfaces:**
- Consumes: `<ShortLeadForm />`.
- Produces: Direct in-page conversion capture on homepage and core service pages, plus pre-footer fallback on editorial pages.

- [ ] **Step 1: Update Homepage Funnel (`src/kairo/components/home/homepage-sales-funnel.astro`)**

In section `#lead-review`:
Replace the button `<a href="/contact#form">Open the project intake</a>` with the live embedded `<ShortLeadForm defaultService="Lead Capture & Follow-Up Sprint" />`.

- [ ] **Step 2: Embed `<ShortLeadForm />` in key service pages**

Update:
- `src/pages/services/automation.astro` -> `<ShortLeadForm defaultService="Marketing Automation & AI Workflows" />`
- `src/pages/services/web-development.astro` -> `<ShortLeadForm defaultService="Custom Website & CRO Engineering" />`
- `src/pages/services/software.astro` -> `<ShortLeadForm defaultService="Custom Software / Full-Stack App" />`
- `src/pages/services/seo.astro` -> `<ShortLeadForm defaultService="Local Phoenix SEO & GBP Optimization" />`
- `src/pages/services/cro.astro` -> `<ShortLeadForm defaultService="Custom Website & CRO Engineering" />`
- `src/pages/services/local-service-ads.astro` -> `<ShortLeadForm defaultService="Google Local Service Ads (LSA) & PPC" />`

- [ ] **Step 3: Add pre-footer fallback banner to `src/kairo/layouts/layout.astro`**

Add prop `hidePreFooterLeadForm?: boolean` (defaults to `false`).
Set `hidePreFooterLeadForm={true}` on:
- `src/pages/contact.astro`
- `src/pages/booking.astro`
- `src/pages/index.astro` (since homepage already embeds the form in `#lead-review`)
- Service pages where the form is embedded in-page.
For editorial, blog, about, and case studies pages, render the pre-footer Short Lead Form right above the desert footer.

- [ ] **Step 4: Run tests and link check**

Run: `npm run test:intake && npm run check:astro`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/kairo/components/home/homepage-sales-funnel.astro src/kairo/layouts/layout.astro src/pages/
git commit -m "feat(cro): embed short lead form across homepage, service pages, and layout fallback"
```

---

### Task 5: Full Regression Testing, Formatting & Verification

**Files:**
- All modified and created files.

- [ ] **Step 1: Run complete intake and telemetry test suite**

Run: `npm run test:intake`  
Run: `node --test tests/analytics-isolation.test.mjs tests/customerio-webhook.test.mjs tests/clarity-sync.test.mjs`  
Expected: All tests pass cleanly.

- [ ] **Step 2: Run linter, code style, and typecheck**

Run: `npm run check:astro`  
Run: `npm run check:eslint`  
Run: `npm run check:prettier`  
Run: `npm run fix` (if formatting adjustments needed)

- [ ] **Step 3: Run static build and internal link validation**

Run: `npm run build:validate`  
Expected: Astro build succeeds cleanly with 0 broken links.

- [ ] **Step 4: Final commit and verify git status**

```bash
git status
git commit -m "chore(cro): format and finalize CRO phone, booking, and lead form implementation"
```


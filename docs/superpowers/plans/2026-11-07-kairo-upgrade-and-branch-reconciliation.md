# Kairo Template Modernization & Full Branch Reconciliation Plan

> Status reconciled November 7, 2026: see [verified GitHub/Vercel status](../../implementation-status-2026-11-07.md). Historical schedules and metrics below are not current completion evidence.


> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconcile and close out active feature branches, update Astro, Node, Vercel adapter, and dependencies to the latest stable Kairo template baseline, and revise all website routes and components to ensure end-to-end functionality.

**Architecture:** Four-stage pipeline: (1) Branch consolidation & triage (integrating high-value Arizona content, Sanity editorial fixes, and PR metrics/security fixes into `main` while pruning stale branches); (2) Stack upgrades (Astro, Node runtime, Vercel adapter, package dependencies, fixing deprecation warnings); (3) Website revision (aligning navigation, layouts, homepage sales funnel, service/industry pages, and contact intake with Kairo components); (4) Rigorous end-to-end verification (`npm run check`, `npm run build:validate`, intake tests, browser tests).

**Tech Stack:** Astro 7+, Node 22/24, @astrojs/vercel, Tailwind CSS, TypeScript, ESLint 9, Prettier, Sanity Content Lake, Supabase, Playwright.

**Spec:** User directive to align all active branches, upgrade Astro/Node/Vercel/JS to the newest Kairo baseline, and revise website pages for complete functional and visual integrity.

## Global Constraints

- Never use forced git pushes (`git push --force`) or destructive database modifications.
- Preserve all existing intake, Customer.io webhook verification, Supabase integration, and SEO canonical rules.
- All code changes must satisfy `npm run check` (0 errors across `check:astro`, `check:eslint`, and `check:prettier`) and `npm run build:validate`.
- Every merged branch must be verified with test execution before merging into `main`.

## Review Focus

1. **Homepage Funnel & Navigation Cohesion:** The new sales funnel on `/` must cleanly route to `/contact#form` and the Calendly booking link without 404s or layout shifts.
2. **Arizona Expansion Routing:** Dynamic `/services/[service]`, `/industries/[industry]`, and `/locations/[location]` routes must build statically without slug collisions or missing data.
3. **Astro Config Deprecations:** Resolve `markdown.remarkPlugins` deprecation warnings and Content Collections `z` deprecations during Astro build.
4. **Vercel Node Runtime Alignment:** Align `.nvmrc`, `package.json` engines, and `vercel.json` runtime so Vercel Serverless builds smoothly without warnings.
5. **Intake & Webhook Integrity:** Ensure form submissions and webhook security signatures remain functional across updated dependencies.

---

### Task 1: Clean Up Merged Local Branches and Audit Unmerged Work

**Files:**
- Local git refs

**Interfaces:**
- Consumes: Current branch list from `git branch -a`
- Produces: Clean local workspace with only active development branches

- [ ] **Step 1: Check merged status of local branches**
Run: `git branch --merged main`
Expected: Lists 17 local branches that are already in `main`.

- [ ] **Step 2: Safely delete merged local branches**
Delete local branches that are confirmed merged: `feature/kairo-redesign`, `preview/kairo-cro`, `codex/customerio-lead-launch`, `preview/overnight-agent-fixes`, `feat/website-v2`, `backup-main-20261021`, `backup-pre-astro-upgrade-20261014`, `backup-theme-astrowind-20261015`, `feat/contact-intake-actions`, `feat/astro-7-upgrade`, `feat/kairo-zolt-redesign`, `agents/test-deployment-setup`, `feat/remediation-audit-and-skills`, `copilot/continued-cockroach`.
Command:
```bash
git branch -d feature/kairo-redesign preview/kairo-cro codex/customerio-lead-launch preview/overnight-agent-fixes feat/website-v2 feat/contact-intake-actions feat/astro-7-upgrade feat/kairo-zolt-redesign agents/test-deployment-setup feat/remediation-audit-and-skills copilot/continued-cockroach
```

- [ ] **Step 3: Verify clean local branch listing**
Run: `git branch`
Expected: Only `main` and necessary active branches remain.

---

### Task 2: Reconcile and Merge High-Value Feature & Fix Branches into `main`

All five merges are confirmed by GitHub (PRs #65, #64, #48, #66 and #54). Commands below are historical; do not repeat completed merges. Associated full-suite checks remain unverified for the deployed SHA.

**Files:**
- Merge targets:
  - `origin/content/arizona-services-industries-2026-11-04` (Arizona services/industry expansion pages)
  - `origin/fix/sanity-draft-schema-2026-11-05` (Sanity editorial schema, staging & tests)
  - `origin/seo/automation-relevance-2026-11-03` (CRM/automation content update)
  - `origin/fix/reporting-security` (`pr/65`) (Webhook security and reporting view restriction)
  - `origin/fix/google-daily-metrics-import` (`pr/64`) (Real daily Google API imports)

**Interfaces:**
- Consumes: Remote tracking branches
- Produces: Consolidated `main` with all completed November 2026 fixes and content

- [x] **Step 1: Merge `origin/fix/reporting-security` (`pr/65`)**
Run: `git merge origin/fix/reporting-security -m "Merge PR #65: restrict reporting view and fail closed on webhook auth"`
Verify: `npm run check` and `node tests/reporting-view-access.test.mjs`

- [x] **Step 2: Merge `origin/fix/google-daily-metrics-import` (`pr/64`)**
Run: `git merge origin/fix/google-daily-metrics-import -m "Merge PR #64: replace sample Google telemetry with real daily API imports"`
Verify: `npm run check` and `node tests/google-metrics-sync.test.mjs`

- [x] **Step 3: Merge `origin/seo/automation-relevance-2026-11-03`**
Run: `git merge origin/seo/automation-relevance-2026-11-03 -m "Merge branch 'seo/automation-relevance': practical CRM and follow-up guidance"`
Verify: `npm run check:eslint && npm run check:prettier`

- [x] **Step 4: Merge `origin/fix/sanity-draft-schema-2026-11-05`**
Run: `git merge origin/fix/sanity-draft-schema-2026-11-05 -m "Merge branch 'fix/sanity-draft-schema': draft-safe Sanity editorial checks and schema"`
Verify: `node tests/sanity-editorial-schema.test.mjs && node tests/sanity-editorial.test.mjs`

- [x] **Step 5: Merge `origin/content/arizona-services-industries-2026-11-04`**
Run: `git merge origin/content/arizona-services-industries-2026-11-04 -m "Merge branch 'content/arizona-services-industries': Arizona expansion pages"`
Verify: `npm run check` and `npm run test:intake`

- [ ] **Step 6: Run full test and build suite on consolidated `main`**
Run: `npm run check && npm run build:validate`
Expected: Build passes with 0 lint/type errors.

---

### Task 3: Upgrade Node Engine, Astro, Vercel Adapter, and Dependencies to Kairo Baseline

**Files:**
- Modify: `package.json`
- Modify: `.nvmrc`
- Modify: `astro.config.ts`
- Modify: `src/content.config.ts`

**Interfaces:**
- Consumes: Latest stable npm packages for Astro, @astrojs/vercel, Tailwind, ESLint
- Produces: Up-to-date dependency tree free of deprecation warnings and vulnerable packages

- [ ] **Step 1: Fix Content Collections `z` deprecations in `src/content.config.ts`**
Replace deprecated `import { z } from 'astro:content'` with `import { z } from 'astro/zod'` or `import { defineCollection, z } from 'astro:content'` according to current Astro specification.

- [ ] **Step 2: Update Astro markdown configuration in `astro.config.ts`**
Address warning: ``markdown.remarkPlugins`, `markdown.rehypePlugins`, and `markdown.remarkRehype` are deprecated. Pass them to `unified({...})` from `@astrojs/markdown-remark` directly instead.`

- [ ] **Step 3: Upgrade Astro, @astrojs/vercel, and key dependencies**
Check for latest stable patch/minor versions of:
- `astro`
- `@astrojs/vercel`
- `@astrojs/check`
- `@astrojs/tailwind`
- `@sanity/client`
- Security updates for `undici`, `nodemailer`, `lodash-es` flagged by Dependabot.

- [ ] **Step 4: Run `npm install` and update `package-lock.json`**
Run outside sandbox with `BypassSandbox: true`: `npm install`
Verify clean lockfile generation.

- [ ] **Step 5: Verify build with upgraded dependencies**
Run: `npm run check && npm run build:validate`
Expected: Clean compilation, 0 deprecation warnings on remark/rehype, 0 errors.

---

### Task 4: Revise Website Layouts, Navigation, and Core Pages for Kairo Parity

**Files:**
- Modify/Review: `src/layouts/layout.astro` & `src/layouts/PageLayout.astro`
- Modify/Review: `src/pages/index.astro` (Homepage Funnel integration)
- Modify/Review: `src/components/widgets/Header.astro` & `src/kairo/components/navigation/Header.astro`
- Modify/Review: `src/components/widgets/Footer.astro` & `src/kairo/components/navigation/Footer.astro`
- Modify/Review: `src/pages/services.astro` & `src/pages/services/[service].astro`
- Modify/Review: `src/pages/contact.astro` & `src/components/ui/Form.astro`

**Interfaces:**
- Consumes: Kairo design tokens, CSS variables in `src/kairo/styles/`, and site config in `src/kairo/data/site.ts`
- Produces: Visually unified, responsive, high-performing website pages

- [ ] **Step 1: Audit and align Header navigation links**
Ensure header links consistently point to active pages: `/`, `/services`, `/industries`, `/blog`, `/contact`, and the phone/CTA button.

- [ ] **Step 2: Check Footer links and legal pages**
Ensure privacy policy, terms, sitemap, contact links, and business hours match current Arizona entity details (`ZiaFlow`).

- [ ] **Step 3: Revise Service & Industry pages styling and schemas**
Check that `/services`, `/services/[service]`, `/industries`, and `/locations` use Kairo typography, responsive spacing, and valid JSON-LD schemas (`Service`, `LocalBusiness`, `FAQPage`).

- [ ] **Step 4: Verify Contact intake and CTA form behavior**
Verify `/contact#form` has proper field validation, Honeypot spam defense, Turnstile/reCAPTCHA (if configured), and error states.

- [ ] **Step 5: Commit website layout and navigation enhancements**
```bash
git add src/
git commit -m "feat(kairo): harmonize navigation, layouts, and page styling with Kairo baseline"
```

---

### Task 5: End-to-End Verification and Live Production Promotion

**Files:**
- Full repository test verification

**Interfaces:**
- Consumes: Fully merged and revised codebase on `main`
- Produces: Verified production release deployed to Vercel

- [ ] **Step 1: Run comprehensive lint and type checks**
Run: `npm run check`
Expected: 0 errors across Astro check, ESLint, and Prettier.

- [ ] **Step 2: Run intake and unit tests**
Run: `npm run test:intake`
Expected: All contact capture, lead form, and webhook tests PASS.

- [ ] **Step 3: Run full production build and link check**
Run: `npm run build:validate`
Expected: Build passes with 0 broken internal links.

- [ ] **Step 4: Run Playwright browser test suite**
Run: `npm run test:browser`
Expected: Critical browser journeys pass on Chromium.

- [x] **Step 5: Production deployment observed (end-to-end verification still pending)**
GitHub main and Vercel production both report `1955646`; READY is confirmed, but Steps 1–4 above are not established by this check. The original push instructions below are historical.
Run: `git push origin main`
Expected: Remote receives new commit range and triggers successful Vercel production deployment.


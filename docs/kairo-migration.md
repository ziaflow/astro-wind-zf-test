# ZiaFlow Kairo migration
Updated October 22, 2026 (America/Phoenix).

## Decision
Jeremy selected Pixels71/kairo-astro as the replacement front-end template.
Source: https://github.com/Pixels71/kairo-astro
Requested visual reference: https://kairo-astro.pixels71.workers.dev/
Inspected upstream tree: 97426fdfa1f3bd812cf0acc364273c28a89f871e.
This supersedes Astroship exploration. Template selection is settled; visual/content customization and implementation remain open.

## Verified source findings
- Upstream package: Astro ^7.3.5, Tailwind ^4.3.3 via @tailwindcss/vite, GSAP ^3.15.0, Lenis ^1.3.26, number-flow ^0.6.2; Node >=22.12.0.
- Existing ZiaFlow package uses Astro 7.4.0, Tailwind 3.4.17 and @astrojs/tailwind; do not combine both Tailwind build systems or copy upstream package.json over server dependencies.
- Upstream sets srcDir='./' with root-level pages/components/data/layouts; ZiaFlow uses src/. Adapt imports and locations deliberately; do not let a root-source configuration orphan src/pages/api.
- Upstream is a static demo with no deployment adapter. Existing ZiaFlow has server APIs and Vercel integration, so preserve server-capable output and the current tested adapter configuration.
- Vercel inspection: existing astro-wind-zf-test project is Astro, Node 22.x, latest production marked READY. Verify exact runtime patch >=22.12.0 during build. Keep existing project/domain binding. No deploy or runtime migration was performed in this decision pass.
- Upstream forms simulate success using setTimeout in components/animation/init/sales-form.ts and newsletter.ts (README). Replace with actual server-backed handlers. A timer or successful animation is never evidence of saved lead/delivered email.
- layout.astro renders a complete supplied title. pageTitle(name) appends site.name. Avoid appending a second brand suffix to the user-supplied complete titles.
- Layout uses is-loading/is-arriving and .js hidden starts. Test blocked animation bundles, JavaScript off, reduced motion and navigation failure; critical text/CTAs must remain readable and accessible.
- Source LICENSE is MIT and requires retaining its notice. Photos, fonts and dependencies have separate terms; replace demo assets with ZiaFlow-owned/licensed assets or preserve applicable terms. Demo content is not ZiaFlow evidence.
- Demo browser/rendered inspection was unavailable through the search tool. Source inspection is not visual QA. No performance/conversion claims established.

## Migration approach
Use an isolated implementation branch in this repository. Preserve git history, APIs, existing content slugs, production analytics and lead contracts, and the ongoing growth-tools PR #20. Reconcile current main and PR changes before importing components. Do not overwrite the repository with the upstream demo.

Adopt Kairo's actual visual components, spacing, typography/motion structure and data-driven customization, with ZiaFlow branding. Avoid a vague redesign merely inspired by screenshots. Move/adapt source into src/ as needed; retain @/ aliases only if mapped consistently. Migrate Tailwind 3 -> 4 as an explicit dependency/configuration change with existing-page regression checks and lockfile update. Pin newly adopted versions after compatibility verification. Do not run multiple unscoped CSS resets or duplicate animation initialization.

Brand: charcoal/black/grey with red accents, no teal; replace default Kairo orange and brand marks. Retain the chosen aesthetic but make useful content and inquiry CTAs immediately available. Disable the homepage preloader initially unless usability and performance checks justify enabling it; respect reduced motion. Replace invented customer logos, percentages, revenue, ratings, testimonials, team bios, pricing and free-trial SaaS language.

## Route and content contract
| Kairo surface | ZiaFlow implementation |
| --- | --- |
| / | ZiaFlow homepage, supplied AI automation/Phoenix metadata and supported offer |
| /about | Existing /about with verified company facts |
| /journal | Existing /blog; keep blog index URL |
| /journal/[slug] | Existing root-level article permalinks and Sanity slugs; do not move established posts under /journal |
| /customers and /customers/[slug] | Optional verified case studies only; do not publish demo client claims |
| /pricing | No unapproved rate card; adapt reusable sales sections to existing service/contact pages |
| sales form | Real /contact and relevant CTA forms using existing persisted lead APIs |
| newsletter | Real consent-aware subscription backend only if implemented; otherwise omit |
| 404 | Proper 404 status, usable navigation and indexing behavior |
| missing /services/* | Add all existing service routes with Kairo components, including routes outside the supplied 11-page map |
| missing growth tools | Retain all five verified growth-tool routes and intake from PR #20 |

Do not change canonical host away from https://ziaflow.com merely because the brief says www. Preserve existing redirects, root article slugs, category routes, sitemap/RSS and metadata. Implement the page map in ClickUp SEO task 17tnw2b8wtb; avoid keyword stuffing and unsupported founding year/team/response SLA/free-plan claims. Align title, description, OG/Twitter and visible intent.

Sanity stays the intended content source: adapt Kairo's Markdown-oriented presentation to current Sanity content/data contracts. Restore access rather than creating a duplicate CMS. Keep published slugs and fallback content explicit. GSC evidence -> existing-page refresh/brief -> Sanity draft -> brand/accuracy QA -> reviewed publish -> measurement.

## Lead and marketing contract
Preserve /api/contact, growth-tools intake and relevant webhook/collector routes. Server validates and persists accepted inquiry before any Customer.io handoff; stable submission/lead IDs, duplicate handling, explicit consent and UTM attribution. Never embed service keys in Kairo data files/client code. Prevent demo animations from registering conflicting submit listeners. Verify Customer.io form_submit vs site event naming, appointment_booked exits, reply/disqualification and unsubscribe before activation. No marketing activation or client sends in this migration.

## Acceptance and release
1. Build/type/lint/format + appropriate integration checks pass on exact implementation commit.
2. Every baseline URL has intended status/canonical/metadata, one title/description and accurate schema; no demo domains or accidental noindex.
3. Mobile/desktop navigation and keyboard forms work. Failure retains input; duplicate retry persists once. No timer-only success.
4. No-JS/reduced-motion/bundle failure doesn't hide the offer or block conversion. Check animation cleanup, page transitions, scrolling and anchors.
5. Sanity posts retain URLs; real form -> Supabase -> permitted Customer.io state is traceable. Tests excluded from business metrics.
6. GA4/Clarity loaded once under intended consent; source collection freshness monitored. Missing GA4 reporting remains unknown.
7. Capture performance before/after on representative pages. Lab checks do not establish field CWV or conversion lift.
8. Existing Vercel project previews the isolated branch. Preserve production until reviewed release; pin known-good rollback deployment.

## Delivery
Target Monday October 26. Friday baseline/design foundation; Saturday template/integrations; Sunday preview QA; Monday tested release decision.
ClickUp delivery: https://app.clickup.com/90131888554/v/l/li/1400430000006881
Design: https://app.clickup.com/t/17tnw2b8wtc
Implementation: https://app.clickup.com/t/17tnw2b8wtd
SEO map: https://app.clickup.com/t/17tnw2b8wtb
Trello owner queue: https://trello.com/b/O2sVHdDv

This document records the selected template and source-reviewed migration requirements. It does not claim that Kairo has been installed, built, visually tested or deployed.

# ZiaFlow Markdown & Plan Audit Directory (Accelerated 5-Day Schedule)

Updated: October 28, 2026

All project `.md` plans, runbooks, skills, and template files have been audited and sorted into four folders below **without deleting any files or interrupting the live Astro website or scheduled agent paths**. All timelines have been compressed from weeks/months to a **5-Day Execution Schedule (Days 1–5)**.

---

## ⚡ Accelerated 5-Day Execution Schedule (Days 1–5)

| Window | Priority | Tasks & Deliverables | Source Spec |
| :--- | :--- | :--- | :--- |
| **Day 1** | **P0** | • Repair any missing `#form` homepage CTA anchors and route cleanly to `/contact#form`.<br>• Verify GSC access post-Oct 27 trial window.<br>• Connect read-only GA4 reporting & reconcile end-to-end tagged test journey (`lead_submissions` → `leads` → Customer.io → booking). | [`seo-conversion-plan.md`](./2-needs-to-be-completed/seo-conversion-plan.md) |
| **Day 2** | **P1** | • Align homepage metadata, H1, and offer around Arizona service businesses & the **Lead Capture & Follow-Up Sprint**.<br>• Audit and remove unsubstantiated enterprise/HIPAA/numerical claims on `src/pages/index.astro`.<br>• Update `.agents/skills/` (`lead-pipeline-auditor` & `seo-keyword-optimizer`) to match current Supabase & Customer.io schemas. | [`seo-conversion-plan.md`](./2-needs-to-be-completed/seo-conversion-plan.md)<br>[`lead-pipeline-auditor-SKILL.md`](./2-needs-to-be-completed/lead-pipeline-auditor-SKILL.md) |
| **Day 3** | **P1** | • Complete full technical crawl (HTTP/www redirects, canonicals, sitemaps, schema, mobile nav).<br>• Replace stock Kairo images with the **8 Core Images (`IMG-01`–`IMG-08`)** and replace fictional Kairo stories.<br>• Finalize connected pair: `/services/automation` + Arizona Automation article. | [`kairo-content-and-image-guide.md`](./2-needs-to-be-completed/kairo-content-and-image-guide.md) |
| **Day 4** | **P2** | • Refresh `/website-conversion-checklist-for-phoenix-businesses` and connect to `/services/cro` & `/audit`.<br>• Ship Interactive ROI Calculator & Assessment widget.<br>• Upgrade `/services/seo` and `/services/web-development` with query-mapped copy and verified implementation examples. | [`interactive-lead-gen-ideas.md`](./2-needs-to-be-completed/interactive-lead-gen-ideas.md) |
| **Day 5** | **P3** | • Complete Kairo page parity checks (Home, Services, About, Contact) and cut over from `/kairo-preview` to `/`.<br>• Review delivered PRs, verified test journeys, and initial search/inquiry cohorts. | [`seo-conversion-plan.md`](./2-needs-to-be-completed/seo-conversion-plan.md)<br>[`kairo-content-and-image-guide.md`](./2-needs-to-be-completed/kairo-content-and-image-guide.md) |

---

## 📁 `1-relevant-and-completed/`
Files that are relevant to ZiaFlow and whose underlying systems/workflows are **already built, deployed, and verified**:
- **[`clarity-sync.md`](./1-relevant-and-completed/clarity-sync.md)** — Completed runbook for the Supabase `pg_cron` + Edge Function syncing Microsoft Clarity 10x/day. *(Original also kept at `docs/clarity-sync.md` for agent reference).*
- **[`customerio-webhook-automation-playbook.md`](./1-relevant-and-completed/customerio-webhook-automation-playbook.md)** — Completed playbook for `/api/contact` -> Customer.io webhook dispatch and `/api/webhooks/customerio` HMAC-verified delivery telemetry. *(Original also kept at `docs/customerio-webhook-automation-playbook.md`).*
- **[`growth-intelligence.md`](./1-relevant-and-completed/growth-intelligence.md)** — Active data contracts (`analytics_source_snapshots`, `clarity_sync_runs`, `website_lead_observations`, `website_optimization_findings`) and scheduled agent rules. *(Original kept at `docs/growth-intelligence.md` because `agents/growth-intelligence.json` explicitly reads that path).*
- **[`technical-seo-audit-SKILL.md`](./1-relevant-and-completed/technical-seo-audit-SKILL.md)** — Active agent skill for auditing Astro canonicals, headings, OpenGraph, and JSON-LD schema. *(Original kept at `.agents/skills/technical-seo-audit/SKILL.md` for skill discovery).*

---

## 📁 `2-needs-to-be-completed/`
Plans, specifications, and agent instructions that are **relevant to ZiaFlow** and scheduled across **Days 1–5**:
- **[`seo-conversion-plan.md`](./2-needs-to-be-completed/seo-conversion-plan.md)** — Master SEO & Lead Capture Sprint execution plan (updated to **Days 1–5** schedule). *(Original also kept at `docs/seo-conversion-plan.md` for scheduled agent access).*
- **[`kairo-content-and-image-guide.md`](./2-needs-to-be-completed/kairo-content-and-image-guide.md)** — Kairo copy & 8-Core-Image specification (**Days 3–5**).
- **[`interactive-lead-gen-ideas.md`](./2-needs-to-be-completed/interactive-lead-gen-ideas.md)** — Moved from `.agent/interactive-lead-gen-ideas.md` and updated to **Days 1–5** implementation schedule.
- **[`lead-pipeline-auditor-SKILL.md`](./2-needs-to-be-completed/lead-pipeline-auditor-SKILL.md)** — Agent skill for testing lead intake (**Day 2** update).
- **[`seo-keyword-optimizer-SKILL.md`](./2-needs-to-be-completed/seo-keyword-optimizer-SKILL.md)** — Agent skill for striking-distance keywords (**Day 2** update).
- **[`AGENTS.md`](./2-needs-to-be-completed/AGENTS.md)** — Workspace agent rules (**Day 2** expansion).

---

## 📁 `3-unrelated-or-old-templates/`
Files that **do not belong to ZiaFlow's business** (fictional Kairo template stories/posts and upstream AstroWind/Sanity starter readmes).
*(Note: Originals in `src/kairo/data/` remain in place temporarily so `src/content.config.ts` and `/kairo-preview` compile without errors until replaced on **Day 3**).*
- **[`kairo-customers/`](./3-unrelated-or-old-templates/kairo-customers/)** — 6 fictional Kairo SaaS case studies (`aerowin.md`, `corvid-cloud.md`, `halden-freight.md`, `ledgerly.md`, `mirelab.md`, `solvane-energy.md`).
- **[`kairo-journal/`](./3-unrelated-or-old-templates/kairo-journal/)** — 6 fictional Kairo blog posts (`evidence-under-every-claim.md`, `monday-without-dashboards.md`, `the-cost-of-finding-out-late.md`, `what-normal-looks-like.md`, `why-we-chose-quiet.md`, `writing-briefs-people-read.md`).
- **[`astrowind-template-README.md`](./3-unrelated-or-old-templates/astrowind-template-README.md)** — Stock AstroWind starter template README.
- **[`sanity-template-README.md`](./3-unrelated-or-old-templates/sanity-template-README.md)** — Stock Sanity Studio starter README from `gemini-blog/README.md`.
- **[`vendor-astrowind-README.md`](./3-unrelated-or-old-templates/vendor-astrowind-README.md)** — Upstream AstroWind vendor note from `vendor/README.md`.

---

## 📁 `4-needs-to-be-deleted/`
Obsolete, superseded, or broken files that have been **moved out of the active workspace and `src/pages/`** into this quarantine folder (nothing deleted):
- **[`EMAIL_SETUP.md`](./4-needs-to-be-deleted/EMAIL_SETUP.md)** — *Moved from `/EMAIL_SETUP.md`.* Outdated Web3Forms setup guide; superseded by Supabase + Customer.io + SMTP in `/api/contact`.
- **[`ziaflow.md`](./4-needs-to-be-deleted/ziaflow.md)** — *Moved from `src/pages/ziaflow.md`.* Draft GitHub profile README with broken placeholder URLs (`YOUR_ZIAFLOW_LOGO_URL`) that was unintentionally creating a broken public `/ziaflow` route.
- **[`seo-monitoring.md`](./4-needs-to-be-deleted/seo-monitoring.md)** — *Moved from `.agent/workflows/seo-monitoring.md`.* Legacy workflow superseded by `.agents/skills/technical-seo-audit/SKILL.md`.
- **[`SECURITY.md`](./4-needs-to-be-deleted/SECURITY.md)** — *Moved from `/SECURITY.md`.* Unfilled GitHub boilerplate template.

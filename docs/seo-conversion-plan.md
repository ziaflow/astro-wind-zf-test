# ZiaFlow SEO and conversion execution plan

Updated October 22, 2026 (America/Phoenix).

## Business objective and boundaries

Generate qualified inquiries from Arizona service businesses, move them into booked meetings, scoped statements of work, and paying projects. Prioritize the website/lead-follow-up offer because the existing search evidence supports it. This is a working positioning choice, not proof that other services have no demand.

Keep the existing Astro/Tailwind website, Supabase evidence store, GitHub reviews, and Vercel previews. Extend the three registered ChatGPT agents before paying for or maintaining another agent runtime. They are scheduled tool workflows, not autonomous Vercel processes. Nothing in this plan activates customer email campaigns.

## Verified starting point

- Latest authorized GSC read: sc-domain:ziaflow.com, September 23–October 20; comparison August 26–September 22. No country/device filters. Current 4 clicks, 339 impressions, 1.18% CTR, average position 13.16; comparison 9 clicks, 324 impressions, 2.78% CTR. These are tiny samples, not evidence that recent website changes caused a decline.
- Three of four property clicks appear in the returned branded query ziaflow. Query rows are partial, so do not calculate a complete branded/non-branded split from them.
- Automation article: 114 page impressions, zero clicks, position 22.97. Query marketing automation phoenix: 14 impressions, zero clicks, position 16.43; marketing automation for smbs arizona: 5 impressions, position 12.8; crm automation for small business arizona: 6 impressions, position 20.17.
- Conversion checklist article: 29 page impressions, zero clicks, position 12.38. Automation service page: 46 impressions, zero clicks, position 5.37. Its strong average includes branded results, so do not call it a top-five non-branded ranking.
- HTTP homepage still appears in GSC: 71 impressions, zero clicks. Historical appearance is a reason to verify redirects/canonicals, not proof that redirects are currently broken.
- Clarity sync succeeds and stores rolling 24-hour URL aggregates. Do not sum URL sessions into unique site sessions or sum successive snapshots.
- Current lead view reported zero confirmed inquiries on October 22, excluding five test observations at the last check. Accepted forms are not qualified leads.
- GA4 reporting ingestion, verified booking outcomes, qualification, signed agreements, payments, and production Customer.io delivery are not yet established as a complete measured funnel.
- Current Vercel production deployment is READY at b22f9a3ef806179b0e3b1e8b99d059be83c51d75.
- Source and direct HTML verification: homepage hero links to #form while rendered homepage has no id=form. This is a reproducible functional defect independent of traffic volume.
- Current main source mixes web/marketing metadata with AI/enterprise hero content; it includes numerical performance and compliance claims requiring substantiation. A cached search-rendered version differs from current main/direct HTML: always verify the deployed version rather than trusting cached text.
- GSC provider access is trial_full through October 27. The monitor must flag access restrictions before they silently stop refreshes.

## Ordered work

| Priority / window | Work                                                                                                                                                                                                                                                           | Acceptance evidence                                                                                                                                                                    | Owner                                       |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| P0 / first 2 days | Repair missing homepage CTA destination. Route the existing automation CTA to the real contact page with a clear service cue, or introduce a real accessible form section in a separate scoped change.                                                         | Live link reaches a real inquiry path on mobile and desktop; no missing fragment; QA submission saved once and excluded from business counts.                                          | Improvement agent, draft PR                 |
| P0 / first week   | Finish measurement and follow-up verification. Connect read-only GA4 reporting; reconcile a tagged test journey; verify contact receipt, Customer.io identity/event, permitted welcome delivery, booking confirmation.                                         | Each stage has a timestamp and stable event ID; success means persisted acceptance, not button click. Test journeys stay separate. Activation remains under existing internal review.  | Jeremy + monitor                            |
| P1 / week 1       | Align homepage title, description, H1, offer and next step around websites and lead follow-up for Arizona service businesses. Proposed primary CTA: Discuss your website and follow-up. Secondary: Explore the assessment, only if that tool is actually live. | One clear audience/outcome, accurate deliverable description, functional CTA, accessible mobile form. No invented response-time or budget promises.                                    | Researcher briefs; improvement agent drafts |
| P1 / week 1       | Audit numerical claims, testimonials, client counts and compliance language against original evidence. Replace unsupported marketing claims with specific process/deliverable explanations through human review.                                               | Claim-to-source register; permission for client examples; no fabricated case studies, ratings, certifications or outcomes.                                                             | Jeremy, editorial review                    |
| P1 / weeks 1–2    | Technical crawl of production: HTTP/www redirects, self canonicals, sitemap, robots, indexability, duplicate article slugs, broken internal links, schema accuracy, mobile navigation and form errors.                                                         | Record actual status/redirect chains, canonical tags and sitemap entries. Inspect duplicates before consolidating; preserve useful URLs with redirects if consolidation is warranted.  | Monitor + researcher                        |
| P1 / weeks 2–3    | Refresh the Arizona automation article and related service page as a connected pair. Article answers workflow questions; service page explains the implementation offer.                                                                                       | Preserve existing URLs; demonstrate inquiry → CRM → follow-up → booking with exceptions, ownership and human review. Add relevant contextual internal links and a working inquiry CTA. | Researcher + improvement agent              |
| P2 / weeks 3–4    | Refresh the Phoenix conversion checklist with practical messaging, trust, form and CTA checks. Connect it to the separate conversion checklist tool only after production QA.                                                                                  | Useful examples and actionable checks; service link; server-confirmed inquiry event; no forced meeting before delivering advertised value.                                             | Researcher + improvement agent              |
| P2 / days 31–60   | Improve SEO service and web-development service pages based on actual query intent; add one verified implementation example with scope, method and limitations.                                                                                                | Query-to-page mapping, unique useful copy, accurate structured data and clear next step. Avoid near-identical city pages and bulk articles.                                            | Researcher                                  |
| P3 / days 61–90   | Review matured search and funnel cohorts, keep supported improvements, and extend the best-performing offer/tool.                                                                                                                                              | Compare complete non-overlapping periods; include absolute counts, lead quality and changes shipped. No lift claim when sample is inconclusive.                                        | Jeremy + agents                             |

## First content briefs

1. Arizona automation article, existing URL /marketing-automation-for-arizona-service-businesses-save-time-increase-bookings.
   Intent: owners deciding how to connect inquiries, CRM and follow-up. Cover common handoff failures, a realistic example workflow, tool selection, consent/ownership, failure recovery, implementation steps, and scope factors. Link naturally to /services/automation. Use the observed Phoenix and Arizona queries without repeating them mechanically. Do not create a separate Phoenix article that merely duplicates this one.
2. /services/automation.
   Intent: evaluate ZiaFlow for implementation. Explain inputs, outputs, discovery, implementation, testing, monitoring and handover. Show an illustrative workflow clearly labeled as such until a client-approved example is available. Connect to the lead follow-up assessment when verified live.
3. /website-conversion-checklist-for-phoenix-businesses.
   Intent: diagnose a website before hiring help. Provide an immediate usable checklist, examples of clear calls to action and form failure states, and an optional contextual consultation. Link to /services/cro.

Google's people-first content guidance supports prioritizing original useful explanations and evidence. Canonical guidance supports consistent redirect/canonical/sitemap signals; branded pages appearing together are not automatically harmful cannibalization.
References:

- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls

## KPI contract

Use three business outcomes; operational diagnostics explain them.

| KPI                           | Definition and source                                                                                                                                                                                       | Decision / limitation                                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Qualified website inquiries   | Unique accepted, non-test inquiries manually confirmed as a service fit with a real need and agreed next step. Supabase receipt + qualification record; deduplicate repeat inquiries about one opportunity. | Weekly absolute count; do not use raw form count as quality. Qualification workflow still needed.                |
| Inquiry-to-held-meeting rate  | Qualified inquiry cohort with a held meeting within 30 days / qualified inquiry cohort. Use booking and attendance outcomes, not calendar-link clicks.                                                      | Review matured cohorts monthly; zero denominator = unavailable. Meeting source still needed.                     |
| Website-sourced paid projects | Unique website-sourced opportunities with signed scope and first cleared payment; show count and collected revenue separately.                                                                              | Ultimate commercial outcome. Do not attribute revenue from a form alone. Agreement/payment sources still needed. |

Drivers: GSC relevant-query clicks and page CTR; confirmed non-test forms by source page; form starts/errors/accepted completions once instrumentation is verified. Session-to-lead rate requires aligned GA4 eligible sessions and accepted lead events in the same scope/timezone; until then show unavailable.

Guardrails: qualified share of inquiries, persistence errors, spam/duplicate share, accessibility/mobile task completion, and unsubscribe/complaint signals when nurture is approved. Phone and booking clicks remain intent signals, not completed leads.

Targets: week 1 aims for reliable test-path evidence and a prioritized baseline, not an invented conversion benchmark. By day 30 review the first complete comparable 28-day cohort and set numerical acquisition/qualification goals using capacity and observed counts. Revenue targets require offer value and close-rate evidence. No promise of a specific ranking or percentage lift.

## Agent operating loop

Keep existing schedules in America/Phoenix:

- Monitor daily around 8 a.m.: freshness, GSC refresh/access, Clarity failures, confirmed intake and build health. Log actionable issues with exact source ranges.
- Researcher Monday/Thursday around 10 a.m.: maintain query-to-page map, inspect behavior and page journeys, select one highest-priority hypothesis. Read this plan as well as docs/growth-intelligence.md.
- Improvement agent Tuesday/Friday around 11 a.m.: revalidate one ready finding, branch, implement, test, open draft PR and attach preview/evidence. Read this plan. Never merge or deploy automatically.

Supabase website_optimization_findings is the shared queue. Each finding needs fingerprint, page, dated source evidence, hypothesis, primary metric, baseline and measurement windows, acceptance criteria, guardrails, rollback and PR URL. States: open → researching → ready_for_pr → draft_pr → measuring → resolved; insufficient_data is valid. Functional defects can be repaired without a traffic experiment.

GitHub stores source and reviews; Vercel provides isolated deployment previews for mobile/desktop checks and functional verification. Supabase stores evidence and outcomes. GSC supplies finalized search data; Clarity supplies aggregate behavior. Existing agent schedules are ChatGPT automations. Do not add duplicate exporters or schedules. A separately hosted Vercel agent runtime is a later option only if scheduled runs prove unreliable or need durable event execution.

## Change and measurement rules

One small change per PR. Record commit/deployment date and which URL changed. Bug fixes need reproducible before/after checks. Copy/content changes use a frozen 28-day pre-change baseline and a complete 28-day post-change period after allowing search data to finalize; longer if traffic remains sparse. Avoid causal claims from uncontrolled before/after comparisons or overlapping windows. Do not split today's tiny traffic into A/B variants.

Required checks: repository build/check, relevant form/handler tests, desktop/mobile CTA and keyboard path, accepted/rejected form behavior, QA exclusion, no secret/PII in client scripts or findings. Roll back the isolated change if it breaks intake or navigation. Legal/compliance, pricing, consent, campaign activation and client claims remain human-reviewed.

## Immediate handoff

1. Queue missing #form destination as a functional repair.
2. Complete GA4 and production nurture/booking measurement without treating those gaps as zero outcomes.
3. Draft positioning and automation-page changes with evidence, not a wholesale redesign.
4. Use the first weekly review to inspect delivered PRs and real inquiries, not agent activity counts.

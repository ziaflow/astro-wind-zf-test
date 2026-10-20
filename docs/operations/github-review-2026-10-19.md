# GitHub review and release checks — October 19, 2026

Reviewed repository discussion and review comments before the requested production push. No comments or replies were posted.

## Findings checked

- [Contact mail abuse controls](https://github.com/ziaflow/astro-wind-zf-test/pull/18#discussion_r4253537292): both contact and audit endpoints now invoke the existing per-IP limiter before reading the body or calling providers. Rejected requests return 429 with Retry-After. This in-memory limiter is per serverless instance, not a distributed abuse limit.
- [Check Apps Script acknowledgment](https://github.com/ziaflow/astro-wind-zf-test/pull/17#discussion_r4253450697): the contact endpoint now requires HTTP success and `ok: true` before treating the sheet as a successful storage destination. A rejected sheet response alone cannot acknowledge an inquiry. A confirmed database save or accepted team notification remains a fallback.
- [Missing leads table](https://github.com/ziaflow/astro-wind-zf-test/pull/17#discussion_r4253450694): the current repository contains the matching table in `tools/agents/migrations/01_lead_to_delivery_schema.sql`. The old assertion that no matching migration exists is superseded. This review does not verify that the production database has applied it.
- [On-demand contact endpoint](https://github.com/ziaflow/astro-wind-zf-test/pull/17#discussion_r4253450688): the current route already exports `prerender = false`.
- [Apps Script recipient documentation](https://github.com/ziaflow/astro-wind-zf-test/pull/16#discussion_r4253220034): deployment instructions now match setup's `info@ziaflow.com` default.
- [Formatting PR 13](https://github.com/ziaflow/astro-wind-zf-test/pull/13): GitHub reports conflicting. Its core formatting-scope issue is handled in the release working tree, and the full check command passes locally. The old branch was not merged or closed.
- [Scheduled ingestion failure](https://github.com/ziaflow/astro-wind-zf-test/actions/runs/39367394693): the job fails because required Supabase secrets are absent. The release includes the previously prepared explicit opt-in guard; no credentials are installed and ingestion is not activated.

## Local validation before push

- 26 isolated workflow regression tests pass, including denied-rate-limit requests and rejected Sheets acknowledgments.
- `npm run check` passes: 153 Astro files, zero errors/warnings/hints; ESLint and repository Prettier checks pass.
- Six Chromium tests pass: home/contact submission recovery and success, campaign attribution, mobile/desktop overflow and local page smoke checks. Submissions use fake responses.
- Production Astro build succeeds using Node's system certificate store for this machine's trusted TLS certificates. Certificate verification stays enabled. Local output uses Vercel's Node 22 runtime.
- Existing formatter drift was cleaned up; the generated Sanity types and private/reference artifact directories are excluded from the appropriate lint/format checks.

## Remaining work

Older reviews of legacy `contact_submissions` upgrades/RLS, duplicate notification ownership, and native no-JavaScript intake require their own verified integration work. The current homepage/contact form offers an email alternative when JavaScript is unavailable. The audit route still needs migration onto durable intake. Contact idempotency and one-inquiry-to-one-Linear-follow-up remain pending. No production database migration, live submission, client message or operations-gate acceptance is claimed by these local checks.

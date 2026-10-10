1. Who You Are Working For and What You Are Building

ZiaFlow is an Arizona technology, web development, automation, and digital marketing business (ziaflow.com). The repository is ziaflow/astro-wind-zf-test, built on Astro 5 (AstroWind template), deployed on Vercel.

There are two parallel goals:

1. Contact form pipeline — Reusable Astro form components that validate on both the client and server, submit through Astro Actions, and log leads to Google Sheets via Apps Script.
2. Unified communication hub — A single operational dashboard that surfaces company-page conversations (Facebook, Instagram, LinkedIn), business email, website inquiries, ownership, and follow-up status in one view.

Why both matter together: The form pipeline is the immediate, shippable deliverable. The communication hub is the strategic destination. Every form submission should eventually flow into the hub’s inbox — so design the form backend with that data model in mind from the start.

---

2. What You Must Do Before Writing Any Code

Inspect first, write second. This is the most important rule.

1. Obtain complete repository files through authorized access — do not reconstruct source from search excerpts.
2. Verify the actual hosting/deployment relationship: confirm Vercel project, branch, adapter (@astrojs/vercel), runtime, environment variables, and domain mapping. Do not assume they are configured.
3. Inventory target communication channels and the exact operations required (DMs, comments, replies, email, forms).
4. Verify channel support, licensing, hosting cost, permissions, and API constraints for each channel.
5. Return a findings report distinguishing verified facts from assumptions before proposing architecture.

Why: No code from prior discussions has been committed or deployed. Proposed implementations are untested. Full file retrieval previously returned only download-success messages without source bodies. Acting on incomplete information risks overwriting working code with broken assumptions.

---

3. The Form Pipeline — What to Build and Why Each Decision Was Made

3a. Single source of truth: src/lib/forms/definitions.ts

Define every form’s fields, validation rules, labels, and Google Sheets tab in one file. This file drives the page layout, browser validation, server validation, and spreadsheet columns.

Why: Keeping schema in one place prevents drift between the client error messages and the server rejection reasons. When you add a field, you add it once.

3b. Reusable component: src/components/forms/ContactIntakeForm.astro

Accept id, formId, title, description, and service as props. Every instance must have a unique id so its labels point to the correct inputs and its custom element initializes independently.

Why: Astro bundles a component’s script once even when the component appears multiple times on a page. A custom element (<ziaflow-contact-form>) scopes all DOM queries to its own shadow, avoiding the fixed-ID/global-selector collision that exists in the current audit booking form.

3c. Required contact fields

name, email, company, phone, inquiry_type, message — all required. Do not relax these without explicit approval.

Why: The original Web3Forms setup did not set required: true on inputs, which is why blank submissions were received. The server must also independently validate all fields — browser validation is a convenience, not a security gate.

3d. Inquiry categories (server-allowlisted)

new_project, existing_client, partnership, general

Why: Categories drive routing. A server-side routing map determines which team member is notified — never accept a recipient address from the browser.

3e. Form identity: form_type + form_id

Every form posts hidden fields form_type and form_id. The server validates both against a hardcoded allowlist (FORM_DEFINITIONS).

Why: Hidden fields are browser-supplied and untrustworthy. The allowlist is the only thing that determines email recipients, spreadsheet destinations, and routing behavior. A missing or unknown form_id must return a 400 — not silently succeed.

3f. Astro Actions (src/actions/forms.ts)

Use defineAction with accept: 'form' for native multi-part payload parsing. Each action: checks the allowlist, enforces anti-spam (honeypot + minimum submission time), applies per-IP rate limiting, attaches UTM attribution, and forwards the payload server-to-server to Google Apps Script.

Why: Astro Actions keep secrets server-side. The GOOGLE_SCRIPT_URL and GOOGLE_SCRIPT_SECRET must never appear in public environment variables or frontend bundles.

3g. Progressive enhancement

The form must work without JavaScript: native HTML POST to /api/contact-log with errors shown on page reload.

Why: If a browser extension blocks scripts or a CDN serves a stale bundle, the form must still submit. Never leave users with a broken contact path.

3h. Anti-spam stack

- Honeypot field (hp_token): hidden, tabindex -1, must be empty on submission.
- Minimum time check: reject submissions faster than ~3 seconds (bots fill forms instantly).
- Per-IP rate limiting: 5 submissions per 60 seconds in-memory. On Vercel serverless, this resets on cold starts — rely primarily on honeypot and time-check; add Redis/Upstash if spam persists.

Why: Origin checks do not stop bots. CAPTCHA is a separate, recommended next step — not included yet.

3i. UTM attribution

Capture utm_source, utm_medium, utm_campaign, gclid, fbclid, referrer, and page URL from the first landing page visit via sessionStorage. A visitor who lands with ?utm_source=google and converts on /quote is still credited to Google.

Why: ZiaFlow runs paid and organic campaigns. Without attribution, you cannot tell which channel generated a lead.

---

4. Google Apps Script (Code.gs) — What It Does and Why

The Apps Script web app is the bridge between Vercel serverless functions and Google Sheets. It runs under your Google account and writes to the shared doc spreadsheet.

Column 1 Column 2
Behavior Why
Checks SHARED_SECRET before writing anything Prevents unauthorized external POST requests from writing to your sheet
Uses a client-generated UUID (submissionId) for idempotency Network timeouts can trigger client retries — the UUID prevents duplicate rows
Creates tabs and columns automatically New form types or fields do not require manual sheet setup
Prefixes values starting with =, +, -, @ with a single quote Prevents formula injection attacks inside Google Sheets
Sends email notification with reply-to set to the lead’s address Lets you reply directly to the lead without copying their address manually
Uploads file attachments to a dedicated Google Drive folder via DriveApp Google Sheets cannot embed binary files; Drive generates a shareable link inserted as =HYPERLINK(...)

Deployment steps (do not skip any):

1. Open the target Google Sheet → Extensions → Apps Script → paste Code.gs.
2. Project Settings → Script Properties → add SHARED_SECRET (generate a strong random string).
3. Run the setup function once manually to authorize Sheets and Gmail permissions.
4. Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone → copy the /exec URL.
5. Add GOOGLE_SCRIPT_URL and GOOGLE_SCRIPT_SECRET to Vercel Project Settings for both Production and Preview environments.

Why these steps matter: The agent previously tested against a local mock server (mock-gas.mjs), not a live Apps Script endpoint. Live endpoints require OAuth authorization and handle Google’s 302 redirect on POST requests differently from a local mock.

---

5. Critical Production Blockers — What the Agent Got Wrong and Why It Matters

These are documented failures from a prior agent run. Do not repeat them.

❌ checkOrigin: false — Never do this

A prior agent hit Cross-site POST form submissions are forbidden during local testing and “fixed” it by injecting security: { checkOrigin: false } into astro.config.ts. This disables Astro’s built-in CSRF protection.

Why it happened: The headless test loaded the page from localhost:4321 while fetch requests used 127.0.0.1. Astro detected a host mismatch. This is a local test environment issue, not a production problem.

The correct fix: Keep checkOrigin: true (the default). In production on ziaflow.com, browser submissions are strictly same-origin. Fix the test environment, not the security setting.

❌ Swapping @astrojs/vercel for @astrojs/node — Never do this

The same agent swapped the Vercel adapter for a Node standalone adapter to make local tests pass. git status showed astro.config.ts as modified. If pushed, Vercel would attempt to run Node standalone mode and break the deployment.

The correct config:

import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
adapter: vercel(),
security: { checkOrigin: true },
});

❌ Pushing directly to main — Never do this

main is connected to Vercel and deploys to ziaflow.com immediately on push.

The correct flow: Create a feature branch (e.g. feat/forms-google-sheets) → open a Pull Request → let Vercel generate a Preview Deployment → test end-to-end on the preview URL → merge to main only after validation passes.

❌ Deploying without environment variables configured

Every Astro Action requires GOOGLE_SCRIPT_URL and GOOGLE_SCRIPT_SECRET. Deploying before these are added to Vercel will cause every production form submission to fail with a 500 error.

---

6. The Communication Hub — Architecture and Evaluation

The hub is the longer-term goal: one operational view for all inbound conversations across channels.

Recommended evaluation order

1. Chatwoot (evaluate first) — Complete open-source shared-inbox application. Self-hosted Community Edition is described as free. Covers email, website chat, Facebook Messenger, and Instagram messaging with assignments and internal collaboration. Do not assume native LinkedIn Company Page messaging or public-comment coverage — verify capabilities, authentication, permissions, and Meta app review requirements before claiming coverage.
2. Unipile — SDK/API foundation, not a turnkey dashboard. Useful if Chatwoot cannot cover a required channel. Verify actual account/channel support, pricing, and policies. A LinkedIn account messaging integration does not establish Company Page inbox support.
3. Hootsuite — Managed social inbox comparison point. Reviewed docs describe Facebook, Instagram, and LinkedIn Page inbox capabilities with restrictions. Confirm plan eligibility and exact interaction types.

Architecture principle

Website forms → server validation/abuse checks → persisted inquiry → inbox integration
Social/email channels → verified integration → conversation records → assignments/follow-ups

Use a structured database as the long-term system of record. Google Sheets is an initial review log and export — not a durable job queue. Inspect the existing Supabase integration in src/pages/api/contact.ts before adding another datastore.

What the dashboard must show

- Attention queue: New, unassigned, replies due, overdue, failed delivery/sync.
- Conversation list: Channel, contact, category, latest message, owner, status, received timestamp, follow-up due. Filterable by channel, category, status, owner, date, overdue.
- Detail panel: Full history, source account, timestamps, internal notes, owner, next action, source link. Enable replies only where verified and approved.
- Channel health: Connection status, last sync, supported actions, latest error, account owner.
- Metrics: Unassigned conversations, median first-human-response time, overdue follow-ups, delivery/sync failures. AI urgency/sentiment is a suggestion, not a fact.

Coverage honesty rule

Never imply all channels are covered when one is missing or stale. For unsupported channels, show a labeled source-system link and a coverage limitation notice — do not report them as empty or healthy.

---

7. Data Model

Design the backend with these entities from the start so the form pipeline and the hub share the same records.

Column 1 Column 2
Entity Key fields
Contacts ID, name, verified identifiers, company, source relationships
Conversations ID, channel, source account, provider thread ID, category, status, owner, timestamps, follow-up deadline
Messages ID, provider message ID, conversation ID, direction, text/attachments, provider timestamps, delivery state
Form submissions ID, form type/placement, category, submitted fields, server timestamp, page path, linked conversation
Delivery jobs ID, submission/conversation reference, destination, state, attempts, next attempt, last error
Audit events Actor, action, target, timestamp (avoid storing unnecessary message content)

Key rules:

- Unique provider/event keys are required for webhook deduplication.
- Do not automatically merge people solely by display name or unverified social profiles.
- Save the record before sending notifications — distinguish “accepted lead” from “email sent successfully.”
- A failed notification must not lose the inquiry. Add a persisted delivery state/outbox if needed.

---

8. Workflow — Submission to Resolution

Every inbound message or form submission follows this path:

1. Receive message or form event.
2. Validate schema, form/account identity, authorization, and abuse controls.
3. Deduplicate and persist the original record with server timestamp and source identifiers.
4. Categorize. Treat AI urgency/sentiment as suggestions, not facts.
5. Assign an accountable owner and a follow-up deadline.
6. Notify internally and record delivery state.
7. Human reviews and replies through the supported channel only.
8. Link or create a project/task only with explicit approval.
9. Resolve or schedule a follow-up.

Routing by inquiry category:

Column 1 Column 2
Category Path
New project Qualify → discovery → proposal
Existing client Identify client/project → triage → assign technical owner
Partnership Business owner review
General Inbox owner
Suspected spam Quarantine/review — never silent deletion

One-business-day internal review is a proposed operating target, not a public or contractual promise.

---

9. Security Gates — Non-Negotiable

- Internal dashboard requires authentication and least-privilege access.
- Keep SMTP, API keys, service-role credentials, and shared secrets server-side only — never in PUBLIC\_ variables or frontend bundles.
- Authenticate provider webhooks. Protect replay and deduplication paths.
- Preserve server-side validation and formula/HTML safety on all inputs.
- Set retention and access policies for contact information and transcripts.
- Remove raw personal information from analytics events (do not include email in dataLayer pushes).
- Do not scrape restricted inboxes or use unapproved account automation.
- Do not deploy merely because a GitHub branch exists — verify Vercel project, domain, branch, runtime, environment, and build settings first.
- Do not send test inquiries to real clients or publish test comments without approval.

---

10. Phased Implementation Plan

Phase A — Inspect and report (no writes)

1. Obtain complete repository files and relevant configuration.
2. Verify actual hosting/deployment relationship and server runtime.
3. Inventory target accounts and exact required operations.
4. Verify channel support, licensing, hosting cost, permissions, and API constraints.
5. Compare Chatwoot vs managed social inbox vs custom API layer.
6. Return a recommendation and evidence-backed coverage matrix.

Phase B — Approved local/staging prototype

1. Use synthetic data to demonstrate the attention queue, detail panel, assignments, and health panel.
2. Validate contact/audit schemas and logging separately.
3. Integrate one test mailbox and one approved social channel.
4. Demonstrate a form inquiry entering the log/inbox without duplication.
5. Add delivery status, retries, and integration failure visibility.

Phase C — Approval and rollout

Provide exact files/diffs, migration plan, cost, deployment target, secret names (not values), tests, rollback plan, and unresolved channel gaps. Obtain approval before each external write or deployment.

11. Acceptance Criteria

Before any merge to main, verify all of the following:

[ ] Every supported channel is explicitly listed with verified read/reply/comment capabilities.
[ ] Unsupported or disconnected channels are visible, not reported as empty or healthy.
[ ] A valid form submission creates a durable timestamped record; blank or whitespace-only fields are rejected server-side.
[ ] Duplicate provider events and request retries do not create duplicate leads.
[ ] A failed notification does not lose the inquiry and has a retry path.
[ ] Multiple forms on one page initialize independently and submit once each.
[ ] Conversation ownership, next action, and deadline are visible.
[ ] Replies preserve the correct source thread and are approval-controlled initially.
[ ] No credentials or raw personal information leak to the frontend, analytics, or logs.
[ ] astro.config.ts uses @astrojs/vercel and checkOrigin: true.
[ ] GOOGLE_SCRIPT_URL and GOOGLE_SCRIPT_SECRET are set in Vercel for Production and Preview.
[ ] Changes are on a feature branch with a Vercel Preview Deployment validated before merge.
[ ] Staging checks pass before production; rollback is documented.

# ZiaFlow supervised operations

Owner: Jeremy. Created October 18, 2026 (America/Phoenix). Dates are forecasts; gates authorize progression. Human-led sales continues throughout. This kit adds no subscriptions and does not send messages, publish, deploy, or connect to live providers.

## Current state

- Local SQLite pilot controls and synthetic tests are implemented. All four production gates remain **not accepted**.
- The live website, Linear follow-up integration, Docs publication, Customer.io, provider webhooks, costs and partner entitlements require account verification. Synthetic tests do not prove these live systems.
- Existing uncommitted website work is preserved. No production database migration is applied.
- The old weekly-report command is draft-only. Agent publication no longer accepts hardcoded reviewer/fact-check claims. The scheduled ingestion workflow now requires explicit repository-variable opt-in **once this change is merged**. Existing cloud jobs are not changed by a local edit.

## Start and use

The October 19 supervised website delivery implementation adds `npm run delivery:check -- tools/operations/fixtures/delivery.json` and `npm run test:workflows`. See [supervised-delivery.md](./supervised-delivery.md) for the brief format, evidence boundaries and GitHub checks. Successful local checks request review; they do not accept any production gate.

`master-plan-revision.md` is the exact additive revision prepared for the existing Superhuman master document. It prioritizes Superhuman Docs and Go, replaces conflicting ClickUp ownership/content commitments, and links the four verified Linear projects. It has not been saved into the cloud document yet. `npm run ops:prepare` regenerates the portable handoff and seventeen detailed issue descriptions.

Use Node **22.16+** (or the installed Node 26). Node's bundled SQLite is used; no npm dependency installation or credentials are needed. Run from the repository root:

```powershell
npm run ops -- init
npm run ops -- status
npm run test:ops
npm run ops -- report tools/operations/fixtures/report.json ziaflow
```

State, drafts and backups belong under ignored `.ziaflow-ops/`, outside any frontend/public directory. Restrict Windows directory access to Jeremy and keep the disk encrypted. Node file modes do not replace Windows ACLs. Store may contain business evidence: do not publish or attach the internal directory to a client document.

`ingest <file.json>` imports **references only** from an approved intake export, not contact details. It atomically records a local inquiry and local follow-up task. The local task is staging evidence, **not a Linear issue**. Do not call the live intake gate complete until a real test inquiry reaches durable storage and a deduplicated Linear issue. Keep raw contact data in its current authoritative system.

`claim <job-id> <agent-id>` returns a claim token; `handoff <job-id> <token> <evidence>` closes execution ownership into review. A second owner is rejected. Human review is not agent completion.

`gate <1-4> <evidence>`, `resume <reconciliation-evidence>` and `approve <exact-action.json> <expiry-ISO>` require interactive human review. **Agents must not enter APPROVE or claim to be Jeremy.** The local OS account is the trust boundary, not the reviewer label or TTY prompt; these are not enterprise identity controls. Before adding unattended/cloud execution, implement authenticated human approval separately from agent credentials.

No live provider adapter or send command is installed. The execution library supports a test adapter to prove reservations/approval checks; adding a live adapter requires a reviewed integration issue and provider eligibility checks. Provider acceptance is not delivery. A pending/unknown outcome must be reconciled with provider records before any new action.

## Sources of truth

| Information                               | Authority                                                | Presentation                              |
| ----------------------------------------- | -------------------------------------------------------- | ----------------------------------------- |
| Work, decisions, ownership and acceptance | Linear ZIA team                                          | Internal Docs summaries with issue links  |
| Intake and contacts                       | Existing durable intake record, verified per entry point | References and client-scoped summaries    |
| Content/code version and release evidence | GitHub commit, PR and deployment                         | Linear evidence links                     |
| Lead lifecycle/messages                   | Customer.io profile, campaign and provider event IDs     | Reviewed report                           |
| Files                                     | Google Drive by default; existing Dropbox where needed   | Links, not duplicated uploads             |
| Costs and partner coverage                | Vendor billing/partner evidence                          | Private cost register                     |
| Metrics                                   | Named, period-aligned source records                     | Same snapshot for internal/client reports |

Existing master plan: https://docs.superhuman.com/d/ZiaFlow-Master-Plan-Growth-Delivery-Retention-90-Day-Operating-P_dJANrQ6KpM_

Existing client launch template: https://docs.superhuman.com/d/ZiaFlow-Client-Website-Growth-Launch-Template-300-Task-Master-Ch_dKD3wDj68EK

Append a clearly identified revised-roadmap section to the master rather than deleting historical work. Use the client template as a reference; create separate private client documents before any actual client data is entered. Never hide internal notes within the client doc as a privacy mechanism.

## Roadmap and issue template

1. **Reliable operating foundation — forecast weeks 1–2.** Prove intake/deduplication/failure handling, source ownership, actual costs, manual brief, isolated restore and emergency stop. Select one existing opportunity for a scoped pilot. Gate: live inquiry → one durable record → one Linear follow-up; costs and ownership verified; recovery and stop demonstrated.
2. **Supervised AI delivery — forecast weeks 3–4.** One bounded task through requirements, one agent owner, implementation, checks, preview, Jeremy's release approval, and verified production outcome. Specialists optional. Gate: evidence for the full supervised loop.
3. **Reconciled reporting — forecast weeks 5–6.** Internal and client-safe summary/document/email/CSV from the same snapshot. Gate: reconciliation and isolation pass; Jeremy approves one exact update and sends it through Customer.io, recording acceptance/delivery separately. Manual supervised sending can prove this gate before any live adapter is enabled. ClickUp mirror deferred unless the pilot client needs it.
4. **Scoped offer pilot — forecast weeks 7–12.** One offer, measured effort/cost/review burden, documented exceptions. Gate: agreed acceptance met and Jeremy records repeat/revise/stop decision before expansion. Portal requirements follow pilot evidence.

Issue fields: outcome; scope/exclusions; accountable human Jeremy; one executing agent (or unassigned); permitted data and systems; blocked-by; acceptance criteria; evidence links; next action. Workflow: Backlog → Todo → In Progress → In Review → Done. Use `blocked` and `approval-needed` labels without equating agent completion to acceptance. Begin with one active engineering issue and, only if helpful, one independent reporting/research task.

## Budget and pilot selection

Maintain `costs.csv` privately with vendor, plan, gross recurring cost, partner credit, out-of-pocket cost, renewal/expiry, verified-at and evidence link. Blank costs are **unknown**, not zero. Include hosting, mailbox, models, storage, metered usage and partner expirations. Target $90 total, strictly below $100 including recurring commitments and usage. Pause optional paid work before exhausting the allowance. No upgrades, cancellations or subscriptions are authorized by this kit.

Choose an actual opportunity, record the client's permission, one deliverable, exclusions, baseline, maximum delivery effort, acceptance and commercial terms. No existing opportunity has been selected by the agent. Do not fabricate one. Continue ordinary discovery/proposals while automation is disabled. Content/page improvements are capacity dependent; reuse one verified implementation as evidence for both.

## Completion evidence still required

Use `evidence-register.csv` as an index, not proof. Attach provider IDs, timestamped test results and links. Never paste credentials or unredacted lead content into issues. A failed gate produces remediation in the same project. Local tests do not accept production gates.

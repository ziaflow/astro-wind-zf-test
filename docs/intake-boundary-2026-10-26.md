# Intake boundary — October 26 release review

Task: https://app.clickup.com/t/17tnw2b8wte . This is the unblocked urgent data-flow task; the release task remains dependent on full QA. Existing implementation and lead tasks retain their open acceptance criteria.

## Fresh production evidence

Vercel's current production deployment is READY at 0bf2a4ea115fa0b1707fb4de6ba3248476e2e676, dpl_NhzL2HbCbAAowiMTk4kdimNKQzoL. This differs from the earlier d49c0e3 baseline. Main now includes Customer.io webhook signature/replay verification, audit/booking changes and contact-handler changes made outside this coordinator run. They were read, not merged, deployed or altered here. Current main checks: build and browser job passed; quality check failed. READY is not release approval.

At 08:03 Phoenix on October 26, a fresh GET /contact returned 200 with exactly one server-rendered form targeting /api/contact and no external form action. This supersedes the October 25 Web3Forms routing observation, not its historical evidence. The main handler returns an invalid-email 400 before reaching persistence for an empty input body. After this source review, exactly one empty JSON POST was sent; it returned that expected 400. No valid inquiry, email address, name, message or other contact data was submitted. No browser, durable receipt, idempotency or provider-delivery assertion follows from this result.

The complete safe result is stored in docs/evidence/2026-10-26-intake-negative-check.json. Only statuses/counts/booleans are stored; no response body, HTML, headers or contact data are captured.

## Reusable negative check

The on-demand command below has no schedule and is not an analytics collector or agent. Its transport accepts only GET /contact and POST /api/contact with literal `{}` on https://ziaflow.com. It cannot accept a user-provided URL or valid contact payload. It disables redirects, bounds response sizes, does not retry and does not POST if the rendered contact form is missing, duplicated or points elsewhere. `--run` explicitly enables the diagnostic network requests.

```bash
python scripts/check-intake-boundary.py --run \
  --output docs/evidence/intake-negative-check.json
```

The check passes only for the one expected form route and the explicit invalid-email HTTP 400 response. A 200, redirect, unrelated 400, transport failure or missing form fails it. `release_ready` remains false even when the negative check passes. Use a separately controlled, message-suppressed QA preview for valid persistence, matching receipt IDs, attribution, test exclusion, retries and provider failures. That positive journey was not run here because its hosted suppression/configuration is not established.

Validation: five fixture tests passed; Python compilation passed; the exact command ran against production and reported negative_boundary_passed=true, release_ready=false. No application code was changed. No app build, valid lead, consent, webhook-auth, delivery or booking test was run. This tool must not be added to a cron/collector or treated as funnel acceptance.

## Source and agent freshness

PR #20 remains open/draft at adafa15, with its separate older source and browser failure; current production changes are absent from that tested snapshot. PR #25 at 38379f6 still holds the separate stacked browser repair; neither implies validation of today's production path. Before integration, compare the latest main against the growth-tools branch and preserve newer webhook/signature and intake behavior. No automatic merge is authorized.

Read docs/growth-intelligence.md and docs/seo-conversion-plan.md at current main, PR #22's migration contract, and the ClickUp page-preservation requirements/11-page map. Keep existing copy, canonical host, URLs and backend contracts. No Kairo fork, CMS, content, claims, pricing, consent, auth or payment files were modified.

At 08:03:56 Phoenix, live metadata queries found latest GSC snapshot captured October 25 at 18:37:56 Phoenix and latest successful Clarity run October 26 at 07:41:04 Phoenix. These establish stored freshness, not the identity or successful execution of a particular agent. Monitor remains disabled after its recorded October 25 run; optimizer is disabled; researcher enabled with no recorded run returned. No tasks, agents or schedules were created or resumed.

## Remaining release gates

Keep today's cutover unapproved until current-source intake/persistence, reporting access review, delivery/exit evidence and Kairo full content/58-URL parity pass. The active Kairo fork scope mismatch remains on the existing owner-decision card https://trello.com/c/Bazo6h9E . Preserve production pending review. The reporting access repair in PR #20 and read-only audit in PR #27 remain separate reviewed work; this check does not fix permissions.

No production merge/deployment, schema/grant change, marketing activation, client assignment or messages were performed by this run. Rollback this diagnostic by reverting its isolated commit; it changes no application behavior or database state.

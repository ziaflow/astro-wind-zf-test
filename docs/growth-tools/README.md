# ZiaFlow business tools

Five independent Astro routes:

- /growth-tools/website-project-estimator/
- /growth-tools/lead-follow-up-assessment/
- /growth-tools/software-stack-assessment/
- /growth-tools/local-visibility-check/
- /growth-tools/website-conversion-checklist/

## Features

A separate assessment and result for each service, shared accessible UI, session-scoped assessment state, JSON download, print/PDF, and an optional review request.
The website estimator uses editable illustrative planning assumptions, not an approved rate card or quote.
The other tools use 36 self-reported checks. Unknown and not-applicable responses do not reduce readiness; coverage and missing evidence remain visible.
Local visibility provides a guided review and a personalized Maps search link. It does not measure rankings or independently inspect profiles.
The inventory identifies software purpose overlap for review and totals entered costs. It does not guarantee savings.

## Integration

The dedicated intake route saves review requests with recalculated results and separate marketing preferences. Server-side runtime configuration and the matching intake schema are prerequisites. A server-only welcome acknowledgement adapter is included but disabled by default. It requires a separately approved and published Customer.io transactional message and configured App API credential. It does not enroll marketing campaigns.
Review the configured storage, retention, access controls, and spam protection before exposing forms publicly.
All follow-up remains an internal workflow proposal until separately configured and reviewed.

## Validation status

Fifteen pure-engine checks passed in the orchestration JavaScript runtime.
The execution environment was unavailable: Node test runner, Astro build/type checks, browser QA, and live intake persistence were not run.
Before release, run:

- node --test tests/growth-tools.test.mjs
- npm run check:astro
- npm run build

Use a test environment to verify all five routes, mobile/keyboard operation, unknown/NA scoring, inventory, reset, stale-result handling, JSON/print, successful persistence, duplicate retries, invalid requests, and storage failures. Confirm no emails are sent.

## Sources

- https://support.google.com/business/answer/7091
- https://web.dev/learn/forms/accessibility/
- https://supabase.com/docs/guides/database/secure-data

No new packages or third-party template code are included.

## Connection QA update

The tool routes and browser tests now match the site's no-trailing-slash convention. An invalid dropdown fragment and TypeScript/lint errors were fixed. Results cannot submit before their JavaScript handlers are installed.

Validation completed locally: 26 calculation/delivery-boundary tests, 11 Chromium browser scenarios, and an explicitly enabled live browser-to-database submission with a duplicate retry. One request persisted, with an inbound communication and a held email status. The application build passed. The opt-in live test is skipped in normal CI and uses the approved internal email from GROWTH_QA_EMAIL.

A separate Customer.io welcome-template test was accepted, but actual email delivery was not confirmed. Creating the persistent App API credential and publishing the dedicated welcome asset require approval. No marketing campaign was activated.

The welcome adapter records accepted, failed, held, or unknown provider state. Accepted is not delivered. Ambiguous sends are not automatically retried. Preview sends require an internal recipient allowlist.

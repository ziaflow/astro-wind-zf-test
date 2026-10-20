# Supervised website delivery

Implemented October 19, 2026. This is the first local implementation slice of the supervised AI delivery project. Linear remains the work queue; Superhuman Docs remains the operating hub. The handoff does not create a second queue or accept a production gate.

## Prepare one bounded assignment

Use one issue and one executing owner. Write a JSON brief with `issueRef`, `owner`, `outcome`, `scope`, `preview`, `acceptanceCriteria` and `limitations`. The last two fields must be nonempty arrays of strings. Use actual source references; do not invent a Linear issue or preview. The example at `tools/operations/fixtures/delivery.json` explicitly identifies this local implementation and its pending browser review.

Keep private client content out of the brief. Use references to authoritative records. The command preserves existing changes and includes their bytes in the workspace fingerprint without attributing their authorship to the executing agent.

## Generate review evidence

From the repository root, after making and reviewing the scoped changes:

```powershell
npm run delivery:check -- tools/operations/fixtures/delivery.json
```

The command runs the operations, contact endpoint and delivery regression tests with isolated fake providers, then `astro check`. Commands are fixed in code; a brief cannot supply executable commands. It does not run the site's build command, whose existing postbuild hook submits IndexNow URLs.

Each run writes a new `handoff.json` under ignored `.ziaflow-ops/deliveries/`. It records the validated brief and its hash, source commit, workspace file hashes, check commands, real exit codes, timestamps and output hashes. Raw command output stays in the terminal. No source file contents are included. `.env*`, `.aws`, local operations state, dependency directories, Git-ignored files and reference artifacts under `outputs/` are excluded from fingerprinting. Exclusions are listed in the handoff. Consequently this evidence does not validate deployment secrets, runtime configuration or changes in reference repositories.

Both staged and unstaged file bytes, untracked files and tracked deletions affect the fingerprint. A failing/timed-out check or workspace drift during checks produces `blocked` and a nonzero exit. Success produces `in-review`, with human acceptance pending, release unauthorized and production verification false. Preview and acceptance statements are supplied by the brief; the command does not treat them as independently verified results.

Review the brief, diff, check output, browser preview, limitations and source evidence before release. Any later file change requires a fresh run. Fingerprints identify file contents, not author identity or approval; the local OS account can edit the evidence. This command does not bypass the existing operations stop, claim or gate controls and does not dispatch an agent or call a release adapter.

## GitHub coverage

The operations workflow now runs `npm run test:workflows` for website source, dependency, operations and regression-test changes. It installs locked dependencies with `npm ci`, uses Node 22.16 and read-only repository permissions, and needs no provider secrets. Existing build, lint and browser workflows remain separate checks. These workflow edits take effect after they reach GitHub.

## Remaining foundation work

The live contact endpoint still needs durable idempotency, downstream retry/reconciliation and a verified one-inquiry-to-one-Linear-follow-up path. The local SQLite tests do not prove those integrations. Verify the Supabase schema and current deployment before implementing that migration. Docs publication, live provider checks, browser acceptance and Jeremy's exact release approval remain outstanding.

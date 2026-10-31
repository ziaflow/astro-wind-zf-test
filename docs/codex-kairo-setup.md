# Kairo development environment

Use only `ziaflow/astro-wind-zf-test`, with the saved environment named
**ZiaFlow Website — Kairo** and base branch `feature/kairo-redesign`.
Create task branches from that branch, and target Kairo when proposing setup fixes.
PR #41 remains the redesign review against `main`.

## Reproducible setup

Select Node **22.22.0**, npm **10.9.4**, then run `bash .codex/setup.sh`.
`.nvmrc`, the root package engine and lockfile agree on Node 22; Vercel's existing
project runtime setting is `22.x`. No dependency versions were changed.
A clean image needs `npx playwright install --with-deps chromium`; the current
image cannot elevate to install OS packages, but its existing libraries launch
Chromium successfully.

Start command: `npm run dev -- --host 0.0.0.0 --port 4321`.
Verify with `curl --fail http://127.0.0.1:4321/`, not the startup message alone.
Astro 7 can keep a background server alive: use `npx astro dev status` and
`npx astro dev stop` to inspect/stop this repository's server.
Playwright waits for HTTP readiness and reuses the server locally. CI rejects
an existing server. The managed Playwright server uses `--ignore-lock` to keep
Astro in the foreground under agent detection, so Playwright owns its lifetime.
`npm run test:browser` selects installed Chromium; Firefox
and WebKit remain optional projects requiring their own browser installation.

## Baseline commands

```sh
npm ci
npm run check
npm run test:intake
npx astro build
npm run check:links
npm run test:browser
```

`npm run build:validate` combines the safe build and link check. Avoid
`npm run build` during initial validation: npm invokes `postbuild`, including
IndexNow. The existing link checker reports failures without failing its process;
review its output and `broken-links.log` before claiming link health.

## Network and credentials

The current task reports an enforced unrestricted HTTP policy and no configured
secrets. This does not establish the saved environment's editable settings.
For a restricted saved configuration allow package-manager destinations
(`registry.npmjs.org`), Node downloads (`nodejs.org`), Playwright downloads
(`cdn.playwright.dev`, `playwright.download.prss.microsoft.com`), and the
specific GitHub, Vercel preview, and public Sanity API destinations used by the
task (`github.com`, `api.github.com`, `vercel.com`, `api.vercel.com`,
`92p0tpps.api.sanity.io`). Verify redirected download hosts against diagnostics.
System browser-library installation also needs the image's configured OS package
mirrors. Configure permissions in Settings → Codex Cloud → Environments;
editing files in this repository cannot change network policy.

Local intake tests use fake dependencies and need no service secrets. Add only
preview/test credentials when testing hosted persistence. Do not import all
production variables. Hosted preview protection may need a scoped test credential.
Do not allow `api.indexnow.org` for initial validation.

## Verified baseline and limits

Source: `f56d1b813e054cc8b32b2b2a607b72efba621fc5`, PR #41.

- GitHub PR/branch access and Vercel project/build-log access work through the
  connected tools. The current checkout was fetched from that exact branch.
- Node 22.22.0 / npm 10.9.4: `npm ci` passed.
- Original `npm run check`: passed (0 Astro errors, 66 hints; lint/format passed).
- Isolated intake/form/growth tests: 35 passed, 0 failed.
- `npx astro build`: passed; no IndexNow invocation.
- HTTP GET on port 4321: 200. Chromium loaded the ZiaFlow homepage and title.
- Existing GitHub Playwright success covered only playwright.dev example tests.
  This change replaces those examples with ZiaFlow checks: both desktop navigation
  and mobile menu open/Escape-close passed (2 Chromium tests), including a
  fresh server with `CI=1` (2 passed in 9.9 seconds).
- Link checker: 16 external status-0 failures, exit 0. External link health is
  unresolved; this is not evidence that the destinations return HTTP 404.

Saved configuration listing/renaming is unavailable in this session (the tool
returns “No handler registered”). The previous three-duplicate finding cannot
be reverified. Current runtime source configuration ID:
`bd20d11d-3fa3-4af4-b330-ad067223906f~cecfg_6ad9605ce32c8197a8d6189b68415a0d`.
The runtime started on production with Node 24; the setup above was applied in
this task workspace. Saved configuration publication is not verified.

## Next product work

Reconcile form/service-copy branches with current Kairo, verify navigation,
buttons/forms and saved leads on the exact hosted preview, compare SEO/redirects
and blog content against production, then resolve analytics and consent checks.
The `.site` DNS repair is separate and needs access to its external provider.

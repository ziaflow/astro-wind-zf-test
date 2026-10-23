# SEO baseline capture and release blocker — October 23, 2026

## Current controlling direction
The implementation task now requires preserving existing ZiaFlow pages, copy and SEO while giving them a Kairo look. This supersedes the earlier Sprint-only homepage rewrite. This run did not modify that copy or change production.
The task names ziaflow/kairo-astro as the implementation fork; this automation's mutation scope remains ziaflow/astro-wind-zf-test. No fork changes were made.

## Verified public availability
At approximately 08:03–08:06 America/Phoenix, read-only direct GETs returned HTTP 404 for:
- https://ziaflow.com/
- https://ziaflow.com/contact
- https://ziaflow.com/services/automation
- https://ziaflow.com/website-analysis-tasks
- https://ziaflow.com/robots.txt
- https://ziaflow.com/sitemap.xml
- https://ziaflow.com/sitemap-index.xml
- https://ziaflow.com/sitemap-0.xml

The homepage response had x-vercel-error: NOT_FOUND. Authenticated Vercel fetch of the current deployment's homepage also returned 404/NOT_FOUND, as did the sampled preceding production deployment. Search's cached contact page (three days old) is not current availability evidence.
Full four-route status capture: docs/evidence/2026-10-23-public-route-check.json.
These observations are regional/request-time evidence, not proof of availability from every location. No customer forms were submitted.

## Build state is not site acceptance
Vercel deployment dpl_52Fs2hvFYiVMuGJTNDASXoHeHWLL, commit 90c74b6244c894e32f8ee5a411656371d18a988e, was READY and aliased to ziaflow.com.
Inspector: https://vercel.com/jeremys224-4312s-projects/astro-wind-zf-test/52Fs2hvFYiVMuGJTNDASXoHeHWLL
Build logs show generated service HTML, 59 compressed HTML files, Node standalone adapter, and a completed build. They also show a non-failing broken-link warning and IndexNow skipping because no sitemap URLs were found.
Current main astro.config.ts uses @astrojs/node standalone; package.json on main lacks @astrojs/vercel. PR #20's configuration already uses @astrojs/vercel. This is a plausible adapter/output-routing mismatch, not a confirmed root cause or verified fix. The deployment file-tree endpoint returned 404, so deployed artifacts could not be independently inspected.
Build selected Node 24 because package.json's open-ended engines constraint overrode the project's Node 22 setting. This is a separate version-control risk, not proven to cause the 404.

## Other checked signals
- PR #20 remains open/draft, head bc7184aceff8a951e391d6c94069148b0fa3e171, mergeable=false. Its Vercel status is success; that does not resolve merge conflicts or demonstrate working routes.
- Latest production commit's GitHub workflow query returned no workflow runs; do not call that a passing test suite.
- Supabase checked 2026-10-23T15:02:48Z: Clarity success 2026-10-23T14:41:03Z; GSC captured 2026-10-23T00:16:32Z. Neither crosses the existing >6h Clarity / >48h GSC captured-snapshot alert threshold. This is storage freshness, not proof every reporting source is connected.
- Source route inventory is pinned to commit 90c74b6244c894e32f8ee5a411656371d18a988e. Sanity publication counts were not checked in this run.

## Reviewable work
scripts/capture-seo-baseline.py uses Python standard library only and issues GETs to ziaflow.com/www.ziaflow.com. It excludes API routes and query strings, rejects redirects outside scope, discovers sitemap pages, and records status, final URL, titles, descriptions, canonical, robots, H1, OG, schema types, image alt data, internal paths, same-page missing fragments and normalized main-text hash. It submits no forms and requires no credentials.
Run from repo root:
```sh
python tests/test-capture-seo-baseline.py
python scripts/capture-seo-baseline.py --output /tmp/ziaflow-baseline.json
# If sitemap discovery fails, check named existing routes explicitly:
python scripts/capture-seo-baseline.py --output /tmp/ziaflow-baseline.json --url https://ziaflow.com/ --url https://ziaflow.com/contact
```
Validation performed: six fixture tests passed; both Python files compiled; four live route GETs completed and correctly returned nonzero exit due to four 404s. That is successful failure detection, not a successful SEO baseline.
No Astro build/browser test was run for this Python-only change. No app source, dependency, auth, consent, campaign, database schema or production setting changed.

## Required next actions
1. Investigate adapter/output-directory routing on an isolated preview and confirm real 200 HTML for homepage/contact/services/article and real API behavior without sending messages. Reuse/reconcile PR #20's Vercel integration where appropriate. Do not select rollback solely from READY status: a sampled earlier deployment also returned 404.
2. Once public availability is restored, rerun sitemap capture and preserve exact old copy/metadata. Complete dynamic/Sanity article inventory, redirects and route parity. A hash is not a copy backup.
3. Compare the new Kairo preview against that baseline; review any copy/claim/metadata differences explicitly. Retain canonical host https://ziaflow.com and root article slugs.
4. Release only after functional, SEO parity and delivery evidence exists. Production rollout remains outside this run's authority.

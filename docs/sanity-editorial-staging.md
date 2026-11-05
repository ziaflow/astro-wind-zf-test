# Sanity editorial checklist v1 — staging/internal

Implementation under review in [PR #66](https://github.com/ziaflow/astro-wind-zf-test/pull/66). Not publication approval. No documents, production settings or deployed schemas were changed. The existing [Blog Planning & Editorial Staging page](https://docs.superhuman.com/d/_d7Yff0Q1Ld2/Blog-Planning-Editorial-Staging-November-5-2026_suSX1l_4) contains the editor checklist and measurement plan.

## Confirmed baseline

PR #66 was open/draft at `13c96730dae618a4578533f84f3ee098cad4186e`, based on main `0e427af49932fbe992d9753be6f81fa4e3a3d4f5`. Work extends its branch `fix/sanity-draft-schema-2026-11-05`. The active Studio's `sanity.config.ts` uses shared `schemaTypes` in `studio-gemini-blog`, project `92p0tpps`, dataset `production`. A legacy `gemini-blog` Studio and a second `.tsx` config exist; neither is changed or deployed here.

A read-only raw-perspective audit returned 16 articles (four published IDs, twelve draft IDs), one unrelated dashboard document using the post type, and one author named Jeremy. Four article drafts lacked publication dates. No article body H1 or stored mainImage.alt was returned. Draft IDs and editorial status remain separate from publication dates. The deployed schema still has older required-date validation; this PR does not deploy it.

## Data flow

| Source field | Rendered output |
| --- | --- |
| `authors[]` references | GROQ dereferences every author; same normalized author data supplies visible byline and Article Person entities. Missing/dangling references are omitted; no authors uses visible ZiaFlow and an Organization author. |
| `author.name`, `image` | Real name and portrait; no invented surname or author route. Portrait is decorative beside the name. |
| optional `author.bio`, `role` | Visible profile text; Person description and jobTitle. |
| optional `author.credentials` | Visible qualifications; Person hasCredential entries. Optional and human-verified, never fabricated. |
| optional `author.profileUrl`, `socialUrls` | Existing visible profile links; Person url/sameAs. Only HTTP(S) URLs render. |
| optional `mainImage.alt` | Hero alt attribute; missing/decorative renders empty. Article title is no longer used as an image description. Image remains optional. |
| optional `seoTitle` | HTML title and existing social metadata pipeline; falls back to title. Visible H1 and Article headline keep title. |
| existing `seoDescription` | HTML/social description and Article description. No replacement description field. |
| existing `publishedAt` | Visible Published and Article datePublished; undated drafts get no fabricated date. Required only when approved, preserving PR #66. |
| optional `lastReviewedAt` | Visible Updated and Article dateModified following substantive review; invalid/future/pre-publication values are rejected/ignored. Absent review means no Updated label and publication fallback for dateModified. `_updatedAt` is not editorial evidence. |
| `body` | Existing Portable Text renderer retains content, marks and lists. H1 is removed from the editor menu and objective validation rejects body H1. No automatic content rewrite or inline-image addition. |
| existing `editorNotes` | Internal checklist guidance and evidence/N/A notes, not public content or mandatory checkboxes. |

The route remains `/posts/[slug]` and canonical generation is unchanged. Both queries explicitly request the published perspective and retain the existing publication-date eligibility. A status change does not publish/unpublish a record. Article JSON-LD is generated in code and inserted once into the head via the forwarded head slot. Escaping `<` prevents a CMS string from terminating its script. No editor-entered canonical, arbitrary JSON-LD, default FAQ, ratings or invented claims are added.

## Editorial review

1. Identify the reader's problem and distinct article intent; compare existing URLs and avoid overlap.
2. Distinguish real experience and observations from hypothetical examples and vendor claims. State limitations. Not every article needs first-hand project work.
3. Verify material claims with appropriate evidence and primary sources, including dates and methods. Remove unsupported guarantees. No fixed external-link count or domain-rating score.
4. Confirm real authors, optional qualifications and public profile information.
5. Review hero-image meaning and alt in context; intentional decorative empty alt is valid. No mandatory image or original-visual requirement.
6. Check title, optional SEO title, description and generated canonical against the rendered page. Length warnings are guidance; Google may truncate or rewrite.
7. Check one title H1, body H2/H3 hierarchy, lists, quotations and existing Portable Text rendering.
8. Follow useful internal/external links; record broken destinations separately from redirects, denied checks or timeouts.
9. Confirm publication approval/date and use review dates only for completed substantive reviews. Compare visible dates with Article JSON-LD.
10. Record fixes, evidence, unresolved concerns and N/A decisions in Editor Notes. A human decides approval; not every checklist item applies to every article.

## Compatibility and release gates

No bulk migration is needed or performed. All added content/profile fields are optional. Existing references, slugs, image assets, date values and Portable Text are retained. Existing profiles and meaningful-image alt can be enriched manually in a separately authorized draft-editing pass. Empty alt preserves rendering but may be inadequate for an informative image until reviewed. Legacy H1 blocks, if found later, still render unchanged but require manual correction before an edited post can pass validation; the current audit found none. Existing posts no longer claim an editorial update from technical saves.

Root-level MDX articles remain a separate content path. This PR does not consolidate duplicate intent between them and Sanity `/posts/` pages, change sitemap exclusions, or change public URL ownership. No credential/profile backfill, dates, approval statuses, published documents or releases are changed. Studio and frontend releases need separate review after the PR; no deployment is performed here.

## Pilot measurement

Record URL, review start/end, issue category/severity, fixes and N/A reasons for a small reviewed batch, with a comparable prior batch when available. Before publishing, track issues caught per reviewed article, median review time, broken links per tested link, missing/incorrect metadata and meaningful-image alt problems. Record false positives so the checklist can be simplified.

After a separately approved release, log post-publication corrections at 7 and 28 days and time to fix. Check HTML/JSON-LD at launch, day 28 and every 14 days thereafter using the separately reviewed ZiaFlow monitor; syntax checks are not full vocabulary or rich-result validation.

Only after enough indexed exposure and inquiry volume, examine complete Search Console windows (for example matched 28-day periods), accounting for page/query intent, device/country, indexing, seasonality and other changes. Track saved accepted and qualified inquiries, excluding tests, bots and duplicates; page visits are not leads. State sample sizes and uncertainty. Small/noisy before-after samples do not establish that the checklist caused rankings or inquiry gains.

## Local verification

- `node --experimental-strip-types tests/sanity-editorial.test.mjs`
- After Studio dependency installation: `node --experimental-strip-types tests/sanity-editorial-schema.test.mjs`
- `ASTRO_TELEMETRY_DISABLED=1 npm run check:astro`
- `ASTRO_TELEMETRY_DISABLED=1 npx astro build` (no postbuild submission or deployment)

The focused CI workflow installs Studio dependencies with `--legacy-peer-deps`, consistent with the repository's dependency conventions. Plain Studio `npm ci` fails its pre-existing peer-resolution/lock check; package and lock files are unchanged. The changed post/author definitions compile through the installed Sanity schema compiler and pass a focused TypeScript check. Full Studio schema extraction cannot load the unchanged config because the locked legacy install omits the existing @sanity/assist peer @sanity/mutator; dependency repair and full Studio release verification remain separate follow-up work. Schema callback tests exercise real custom validation functions, but do not prove editorial judgement or deployed-schema enforcement.

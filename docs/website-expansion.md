# ZiaFlow service, industry, and Arizona expansion

Updated November 4, 2026. Implementation is staged in a pull request; this document does not claim production publication or search results.

## What exists and what this adds

The established URLs for PPC, SEO, automation, web development, ecommerce, social media, Local Services Ads, CRO, software, and performance tracking remain authoritative. Existing root-level article URLs are preserved.

This batch adds 10 distinct service pages, three industry hubs, and an Arizona service-area hub. Industries and locations have browsable directory pages. The existing services directory links the new service pages and the two directories. Three original supporting articles are saved with `draft: true`; the existing content loader excludes them from the public blog.

The 51-topic registry in `content-expansion-plan.json` maps every requested channel, service family, vertical, city, and initial ZIP topic to an existing hub, a preview page, a planned section, a guide, or an evidence requirement. A planned record does not generate a route. There is no service × channel × industry × city × ZIP Cartesian product.

New pages use the existing Kairo layout and brand tokens. The page-specific business inquiry form uses the existing `/api/contact` contract and shared browser handler. It passes the actual source path and service interest, preserves retry keys, and does not add promotional enrollment or a new data store. Tests mock the API; verification does not send messages or create real lead records.

## URL ownership

| Intent                                                | Primary destination                                                                                            |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Google Search / PPC                                   | Existing `/services/ppc`                                                                                       |
| Local Services Ads                                    | Existing `/services/local-service-ads`                                                                         |
| Microsoft / Bing Ads                                  | `/services/microsoft-ads`                                                                                      |
| LinkedIn Ads                                          | `/services/linkedin-ads`                                                                                       |
| Meta, Facebook, Instagram, TikTok                     | Existing `/services/social-media` initially; specific briefs remain planned                                    |
| Reddit, Yelp, Nextdoor advertising                    | Existing PPC hub plus planned channel-fit guides; do not claim active specialist delivery without scope review |
| Data analysis                                         | Existing `/services/performance-tracking`                                                                      |
| AI tools                                              | Existing `/services/software`                                                                                  |
| Workflow automation                                   | Existing `/services/automation`                                                                                |
| WordPress / Wix                                       | Existing web-development hub, with platform sections to review                                                 |
| Shopify                                               | Existing ecommerce hub, with a platform section to review                                                      |
| Law / lawyer / legal / attorney marketing             | One `/industries/legal` hub                                                                                    |
| Doctors, clinics, IV clinics, HIPAA-related questions | `/industries/healthcare`; sensitive workflows require a separate specialist assessment                         |
| HVAC, plumbing, roofing, contractors                  | `/industries/home-services` plus operationally distinct guide briefs                                           |
| Cities and ZIPs                                       | `/locations/arizona` until distinct local content and coverage are verified                                    |

Keep Tucson spelled correctly. Do not create an additional typo URL or add “United States Scottsdale marketing” as a repeated phrase. Country and service area are factual context, not a keyword list. Do not invent office locations, local client proof, ZIP boundaries, platform partnerships, credentials, prices, or benchmarks.

## Evidence and search-data limits

GSC SEO & Content Planner returned finalized data only for October 30–November 1, 2026 under `free_recent_three_days`: 26 property impressions and zero clicks, no comparison. This partial view cannot validate demand for the full proposed topic list. The requested topics are business hypotheses, not demonstrated keyword-volume opportunities. Do not bypass provider limits or reuse older aggregates as current daily data.

The separately reconciled October 5–November 1 baseline from GSC Wizard was 567 impressions and three clicks. Supabase's reporting view counted two recorded non-test form submissions, seven test observations, and seven unverified legacy leads in that window. Those are property-level history, not a per-new-page conversion baseline or proof of qualified sales. GA4 conversion triggers remain under investigation.

## Corrected editorial guidance

| Pasted claim                                                          | Verified policy or implementation                                                                                                                                                                                                                                                             |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Every article must contain firsthand proprietary statistics           | Original useful work matters; a statistic is optional and requires real evidence. A worked synthetic example must be labelled synthetic.                                                                                                                                                      |
| E-E-A-T is a direct ranking score or certification                    | Google says E-E-A-T itself is not a specific ranking factor. Use accurate authorship, sources, and evidence; no guarantee of top positions.                                                                                                                                                   |
| A local angle + a data nugget + a tool guarantees a top-three ranking | These can help readers; there is no guaranteed ranking formula. Add only what the specific decision needs.                                                                                                                                                                                    |
| Using a platform establishes a partnership                            | Describe actual implementation in plain text. Verify each platform's badge or logo permission separately before presenting partner status.                                                                                                                                                    |
| Supabase + Vercel makes a HIPAA-compliant pipeline                    | Vendor names do not establish compliance. Required agreements, supported services, configuration, data flows, and operating controls require review.                                                                                                                                          |
| Sanity defaults posts to ready_for_human_review                       | Deployed `post` schema currently defaults `editorialStatus` to `ai_drafted`. Valid values are ai_drafted, in_editor_review, ready_for_human_review, approved.                                                                                                                                 |
| Switching editorialStatus to published publishes the site             | `published` is not an allowed editorialStatus. Editorial approval, Sanity publication, and a successful Astro deployment are separate actions.                                                                                                                                                |
| Schema already enforces approval for every publication                | Not established. The deployed field's validation allows the four statuses; the repository schema is missing the editorial fields. Existing Sanity route queries do not check editorialStatus.                                                                                                 |
| IndexNow instantly publishes to Google and Bing                       | IndexNow notifies participating engines; Google is not in the participating list. It does not guarantee crawling or indexing. The repo's script runs during postbuild, requires INDEXNOW_KEY, and reads dist/sitemap files. No verified publish-webhook-to-deploy chain was established here. |
| Three-minute review guarantees 100% compliance                        | Review effort depends on the claims and subject. Technical, legal/privacy, platform, and result claims need appropriate evidence and review.                                                                                                                                                  |
| Directory depth is a doorway penalty or PageRank shortcut             | URL simplicity helps usability. Directory depth does not establish click depth or guarantee ranking safety.                                                                                                                                                                                   |

### Schema drift to resolve before a Sanity publishing rollout

The deployed Sanity `post` schema includes editorialStatus, editorNotes, and targetKeywords. `studio-gemini-blog/schemaTypes/postType.ts` on main does not. Do not redeploy that older repository schema over the deployed version. First reconcile the deployed field definitions into Studio source, decide which publisher enforces approval, and test a non-approved draft remaining unavailable. The new website pages in this batch are repository-owned; they do not silently depend on absent Sanity service-page records. The three blog drafts use the existing repository draft mechanism.

## Measurement and consolidation

1. Record each final URL, intended audience, owner, primary intent, deployment SHA, and the actual publication timestamp. The observation window begins after production publication, not when a draft was created.
2. Before measuring demand, verify HTTP 200, self-canonical, intended indexability, sitemap inclusion, internal links, mobile usability, and the actual inquiry path. Exclude preview, QA, duplicate, spam, and unverified legacy records.
3. Compare GSC query/page metrics over equal settled windows. Preserve the provider, property, timezone, device/country filters, and date range. Do not sum query rows to reconstruct property totals.
4. Track accepted non-test inquiries by receipt source page. The embedded form supplies a source path, not verified first-touch acquisition. A click through to another form or a phone call requires a separately verified attribution path. Qualification, bookings, and revenue stay separate.
5. Inspect at roughly 30 and 60 days after publication, but do not automatically remove low-traffic pages. Missing indexing, seasonality, technical faults, limited data access, and small samples can all make a test inconclusive.
6. Consolidate only after checking shared query intent, content overlap, useful information, internal links, inbound links, and business fit. Pick a relevant destination, preserve useful content, add a one-hop 301 in the shared redirect map, update links and sitemap, and verify the release. An indexed page with no clicks is not automatically a failure.

Do not calculate a reliable lead-conversion rate from the current mixed GA4 events or join GSC period aggregates to daily leads. Do not activate nurture, ads, or recurring jobs as a side effect of creating pages. Scheduled evaluation can be configured once the reviewed pages have a publication date and trusted data sources.

## Source references checked November 4, 2026

- Google people-first content and E-E-A-T: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google scaled-content and doorway policies: https://developers.google.com/search/docs/essentials/spam-policies
- Google AI-content guidance: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- Google AI features: https://developers.google.com/search/docs/appearance/ai-features
- Google partner branding: https://about.google/brand-resource-center/guidance/partnerships/
- IndexNow FAQ and participating engines: https://www.indexnow.org/faq
- HHS online tracking guidance (including its court-order notice): https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/hipaa-online-tracking/index.html
- Supabase HIPAA projects: https://supabase.com/docs/guides/platform/hipaa-projects
- Deployed Sanity post schema read via get_schema; GitHub Studio schema, blog loader, and IndexNow script inspected separately.

## Existing Local Services Ads page correction

The existing `/services/local-service-ads` page is retained and refreshed rather than duplicated. Its previous copy promised Google Guaranteed onboarding, credit disputes for wrong-trade/out-of-area inquiries, and universal category eligibility. The revised page uses current Google Verified terminology, conditional eligibility, and billing/lead-quality review without a credit or ranking guarantee.

Primary references:

- Badge: https://support.google.com/localservices/answer/16498018
- Screening: https://support.google.com/localservices/answer/6226575
- Automated lead credits and exclusions: https://support.google.com/localservices/answer/15100654

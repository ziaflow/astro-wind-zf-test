# Monitoring workflow repairs

The October 24 monitor found independent failures in the main ESLint gate, a legacy telemetry exporter, and blogger authentication. PR #25 separately has a passing Playwright run on commit `38379f6fe7b16d648b61c8e400b1d01cff887505`; it remains an unmerged prerequisite for the browser fix.

## Telemetry

The GitHub telemetry workflow now checks canonical Supabase snapshots only. It does not export Clarity, synthesize Google metrics, or run the old unified-view optimizer. Existing Supabase cron remains the sole Clarity exporter; the connected data monitor remains the GSC ingestion path.

Configure the existing repository secrets `PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for the ZiaFlow project. The checker requires a successful Clarity snapshot within six hours and a GSC capture within 48 hours. Missing or invalid timestamps fail as unknown. GSC's finalized reporting delay is independent of capture freshness. Pull requests run offline tests without receiving secrets. A live scheduled/manual run is still required after merge to verify repository credential availability.

## Blogger

The blogger is manual-only and creates a Sanity `drafts.*` document. It no longer publishes, sends IndexNow notifications, or removes queue items. Review and publish separately after content QA. Repeated manual runs can create repeated drafts, so review existing drafts first.

Before running it, configure:

| Setting                                | Value                                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------------ |
| Repository variable `BLOGGER_PROVIDER` | `openai` or `azure`, explicitly selected                                             |
| Repository variable `BLOGGER_MODEL`    | OpenAI model or Azure deployment name                                                |
| Secret `OPENAI_API_KEY`                | Active credential for the selected provider                                          |
| Secret `OPENAI_API_BASE`               | Optional OpenAI-compatible base URL; required Azure resource root URL for Azure mode |
| Variable `AZURE_OPENAI_API_VERSION`    | Required in Azure mode; version supported by the resource                            |
| Secret `SANITY_API_TOKEN`              | Authorized write access to the configured ZiaFlow Sanity project                     |

OpenAI mode uses bearer authentication without Azure-specific headers/query parameters. Azure mode uses the SDK's Azure client with an explicit endpoint, deployment and API version. Malformed or ambiguous configuration fails before content generation. Retries are disabled and requests time out after 60 seconds. Failure logs omit raw SDK request details.

The previous HTTP 401 cannot be considered fixed until an authorized manual draft run succeeds with verified credentials. No credentials were inspected, changed, or tested during this repair. Existing basic Markdown-to-Portable-Text conversion still requires editorial review.

## Validation and release

Run the two offline test files, `npm run check`, and `npm run build`. Merge and production release require separate review. Do not resolve monitor findings merely because code was proposed: confirm the relevant workflow on the deployed/default-branch commit. Rollback by reverting the repair commit; do not reactivate duplicate telemetry exports or unattended publishing without review.

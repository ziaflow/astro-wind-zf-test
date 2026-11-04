# Internal Sanity Context chat

`POST /api/sanity-chat` answers internal reviewers using the configured, read-only
Sanity Context endpoint. It uses the existing OpenAI `gpt-5.2` model and discovers
MCP tools on every request. No chat UI or content publishing is added.

## Credentials

Set these server-only environment variables in each deployment you intend to test:

- `SANITY_ORGANIZATION_TOKEN`: organization token with Context Viewer permissions.
  Create it at https://www.sanity.io/organizations/ofTbUkOHg/api/tokens.
  Project Viewer/Editor tokens cannot substitute for Context Viewer.
- `OPENAI_API_KEY`: existing OpenAI account's application key.
- `SANITY_CHAT_ACCESS_TOKEN`: a separate random access secret of at least 32 characters.

Keep these in deployment secrets or ignored `.env.local`. Never commit them, put them
in browser code, or use a `PUBLIC_` prefix. The access token grants internal content
access; do not give it to public website visitors. Rotate it if disclosed.

The endpoint is fixed to:
`https://api.sanity.io/v2026-11-03/context/organizations/ofTbUkOHg/mcp/sanity-gemini-blog-mcp`.
The MCP client sends the organization Bearer token on every MCP request.

## Test

Store `SANITY_CHAT_ACCESS_TOKEN` in the shell environment or ignored `.env.local`,
then run:

```sh
node scripts/test-sanity-chat.mjs https://YOUR-DEPLOYMENT/api/sanity-chat
```

An optional second argument supplies your question. Use a question whose answer you
can independently check in Sanity. For protected Vercel previews, authenticate to the
preview separately; this script does not disable deployment protection. A temporary
authorized preview cookie can be supplied as server-only `VERCEL_PREVIEW_COOKIE`.

The request must carry `Authorization: Bearer <SANITY_CHAT_ACCESS_TOKEN>` and JSON:

```json
{"messages":[{"role":"user","content":"Find an article and give its exact title, document ID and a supported summary."}]}
```

The response streams Server-Sent Events (`start`, `tool`, `text`, `error`, `finish`).
`tool` reports the runtime tool name and success flag, without raw tool results.
`text` contains `{ "delta": "..." }`. A successful `finish` requires at least one
successful tool execution. Inspect the cited documents as well: tool execution alone
does not guarantee that every model statement is accurate.

Missing access configuration returns 503; absent/wrong access credentials return 401.
Invalid messages return 400, oversized requests 413 and rate limits 429. Context
connection failures return 502. An underlying Context 401 means an invalid/missing
organization token; 403 usually means the wrong token type or missing permissions.
Streaming errors are sanitized and include upstream HTTP statuses when available.
An OpenAI 429 may mean insufficient credits or quota, not a Sanity connection problem.

Limits: 10 text messages, 4,000 characters per message, 16 KB request body, 10 model
steps, 2,000 output tokens per step and 150 seconds overall. The six-requests/minute
limiter is per warm server instance; it is supplementary, not a distributed quota.
The MCP client closes on completion, cancellation, timeout and failures. Requests,
credentials and raw tool results are not logged by this integration. Source access
and provider retention still follow the Sanity/OpenAI account settings.

Compatibility: this endpoint uses the MCP initialization handshake. The client sets
`protocolVersionDiscovery: false` to avoid the newer SDK's stateless discovery probe.

## Verification

```sh
node --test tests/sanity-chat.test.mjs
```

The automated tests cover access controls, input bounds, dynamic discovery, streaming,
cleanup and sanitized failures. They mock upstream services. The test script above
performs the separate real end-to-end retrieval/model check and fails on incomplete
or ungrounded (no successful tool call) responses.

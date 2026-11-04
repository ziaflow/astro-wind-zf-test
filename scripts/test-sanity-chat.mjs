import { readFileSync } from 'node:fs';
import { parse } from 'dotenv';

// Keep credentials in a server-only, ignored env file or the invoking shell.
let local = {};
try {
  local = parse(readFileSync(new URL('../.env.local', import.meta.url)));
} catch {
  /* optional */
}
const token = process.env.SANITY_CHAT_ACCESS_TOKEN || local.SANITY_CHAT_ACCESS_TOKEN;
const previewCookie = process.env.VERCEL_PREVIEW_COOKIE || local.VERCEL_PREVIEW_COOKIE;
const endpoint = process.argv[2];
const question =
  process.argv[3] ||
  'Find one article in Sanity. Give its exact title, document ID, publication status if available, and a short summary supported by its content.';
if (!token || !endpoint) throw Error('Set SANITY_CHAT_ACCESS_TOKEN and pass the full /api/sanity-chat URL.');
const url = new URL(endpoint);
if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname))
  throw Error('Use HTTPS outside localhost.');
if (!url.pathname.endsWith('/api/sanity-chat')) throw Error('Expected the Sanity chat API path.');
const response = await fetch(url, {
  method: 'POST',
  headers: {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
    ...(previewCookie ? { cookie: previewCookie } : {}),
  },
  body: JSON.stringify({ messages: [{ role: 'user', content: question }] }),
  redirect: 'error',
});
if (!response.ok) throw Error(`Chat returned HTTP ${response.status}.`);
if (!response.headers.get('content-type')?.startsWith('text/event-stream'))
  throw Error('Expected a streamed event response.');
let buffer = '';
let complete = false;
let toolCalls = 0;
let chunks = 0;
for await (const chunk of response.body.pipeThrough(new TextDecoderStream())) {
  chunks++;
  buffer += chunk;
  let index;
  while ((index = buffer.indexOf('\n\n')) !== -1) {
    const event = buffer.slice(0, index);
    buffer = buffer.slice(index + 2);
    const name = event.match(/^event: (.+)$/m)?.[1];
    const data = JSON.parse(event.match(/^data: (.+)$/m)?.[1] || '{}');
    if (name === 'text') process.stdout.write(data.delta);
    if (name === 'tool') console.log(`\n[Sanity tool: ${data.name}; success: ${data.success}]`);
    if (name === 'error')
      throw Error(
        `${data.message} (Sanity HTTP: ${data.sanityStatus ?? 'unknown'}; model HTTP: ${data.modelStatus ?? 'unknown'}; request: ${data.requestId})`
      );
    if (name === 'finish') {
      complete = data.complete;
      toolCalls = data.successfulToolCalls;
    }
  }
}
if (!complete || !toolCalls) throw Error('No complete, tool-backed answer received.');
console.log(`\nPASS: ${toolCalls} successful Sanity tool calls; ${chunks} streamed chunks.`);

import type { APIRoute } from 'astro';
import { supabase } from '~/lib/supabase';
import { sendReviewWelcome } from '~/lib/growth-tools/welcome.mjs';
import { checkRateLimit } from '~/lib/growth-tools/rate-limit';
import { getTool, assess, estimate, stackSummary, VERSION } from '~/lib/growth-tools/engine.mjs';

export const prerender = false;
const json = (body: unknown, status = 200) => {
  if (status >= 400) console.warn(JSON.stringify({ scope: 'growth_intake', status, error: (body as { error?: string }).error }));
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
};
export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Do not reuse /api/contact: that endpoint can send emails and campaign events.
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) return json({ ok: false, error: 'origin' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    return json({ ok: false, error: 'content_type' }, 415);
  if (Number(request.headers.get('content-length') || 0) > 32768) return json({ ok: false, error: 'too_large' }, 413);
  const rate = checkRateLimit('growth:' + clientAddress);
  if (!rate.allowed)
    return Response.json(
      { ok: false, error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  try {
    // Bound the stream, including when Content-Length is absent or false.
    const reader = request.body?.getReader();
    if (!reader) return json({ ok: false, error: 'empty' }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > 32768) {
        await reader.cancel();
        return json({ ok: false, error: 'too_large' }, 413);
      }
      chunks.push(next.value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return json({ ok: false, error: 'invalid_json' }, 400);
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
      return json({ ok: false, error: 'invalid' }, 400);
    const body = parsed as {
      id: string;
      tool: string;
      name: string;
      email: string;
      company?: string;
      url?: string;
      goal?: string;
      fax?: string;
      marketingConsent: boolean;
      input: Record<string, unknown>;
    };
    for (const [key, max] of Object.entries({
      id: 36,
      tool: 80,
      name: 120,
      email: 254,
      company: 200,
      url: 500,
      goal: 1500,
      fax: 100,
    })) {
      if (body[key] !== undefined && (typeof body[key] !== 'string' || body[key].length > max))
        return json({ ok: false, error: 'invalid_fields' }, 400);
    }
    if (body.fax?.trim()) return json({ ok: false, error: 'invalid' }, 400);
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.id || ''))
      return json({ ok: false, error: 'id' }, 400);
    const tool = getTool(body.tool);
    const name = body.name?.trim(),
      email = body.email?.trim().toLowerCase();
    if (
      !tool ||
      !name ||
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof body.marketingConsent !== 'boolean'
    )
      return json({ ok: false, error: 'invalid' }, 400);
    if (body.url) {
      try {
        const url = new URL(body.url);
        if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw Error();
      } catch {
        return json({ ok: false, error: 'url' }, 400);
      }
    }
    const input = body.input;
    if (!input || typeof input !== 'object' || Array.isArray(input)) return json({ ok: false, error: 'input' }, 400);
    let result: unknown;
    if (tool.kind === 'estimate') {
      result = estimate(input);
    } else {
      if (!input.answers || typeof input.answers !== 'object' || Array.isArray(input.answers))
        return json({ ok: false, error: 'answers' }, 400);
      const known = new Set(tool.questions.map((q) => q[0]));
      if (Object.keys(input.answers).some((k) => !known.has(k))) return json({ ok: false, error: 'answers' }, 400);
      result = assess(tool.slug, input.answers as Record<string, string>);
      if (tool.kind === 'stack')
        result = {
          ...(result as object),
          inventory: stackSummary(input.rows as { name: string; function: string; cost: number; hours: number }[]),
        };
    }
    if (!supabase) return json({ ok: false, error: 'intake_unavailable' }, 503);
    const consentText = 'Also send me occasional ZiaFlow advice and service updates. I can unsubscribe.';
    const { error } = await supabase.from('contact_submissions').insert({
      id: body.id,
      form_id: 'growth_tool:' + tool.slug,
      status: 'pending_internal_review',
      payload: {
        name,
        email,
        company: body.company?.trim() || '',
        website: body.url || '',
        goal: body.goal || '',
        tool: tool.slug,
        input,
        result,
        marketing_consent: body.marketingConsent,
        consent_text: consentText,
        consent_version: VERSION,
        consent_recorded_at: new Date().toISOString(),
      },
      metadata: {
        version: VERSION,
        source_page: '/growth-tools/' + tool.slug + '/',
        service: tool.service,
        workflow_state: 'pending_internal_review',
        customerio_dispatch: 'held',
        reviewed: false,
      },
    });
    // Only a newly persisted request may send a receipt. Replays never resend.
    if (error?.code === '23505') return json({ ok: true, status: 'pending_internal_review', duplicate: true });
    if (error) {
      console.warn(JSON.stringify({ scope: 'growth_intake', event: 'database_rejected', code: error.code }));
      return json({ ok: false, error: 'intake_unavailable' }, 503);
    }
    const formId = 'growth_tool:' + tool.slug;
    const pagePath = '/growth-tools/' + tool.slug;
    const { error: logError } = await supabase.from('communications_log').upsert(
      {
        id: body.id,
        channel: 'form',
        direction: 'inbound',
        status: 'received',
        subject: 'Growth tool review request',
        sender: email,
        recipient: 'ZiaFlow',
        content: 'Review requested: ' + tool.title,
        page_path: pagePath,
        form_id: formId,
        metadata: { submissionId: body.id, tool: tool.slug, is_test: name.startsWith('ZIAFLOW QA') },
      },
      { onConflict: 'id' }
    );
    if (logError) console.warn(JSON.stringify({ scope: 'growth_intake', event: 'log_failed', submissionId: body.id }));
    const welcome = await sendReviewWelcome({ email, name, tool: tool.title, submissionId: body.id });
    const metadata = {
      version: VERSION,
      source_page: pagePath,
      service: tool.service,
      workflow_state: 'pending_internal_review',
      reviewed: false,
      customerio_dispatch: welcome.state,
      welcome,
      communication_logged: !logError,
      is_test: name.startsWith('ZIAFLOW QA'),
    };
    const { error: updateError } = await supabase.from('contact_submissions').update({ metadata }).eq('id', body.id);
    if (updateError)
      console.warn(
        JSON.stringify({ scope: 'growth_intake', event: 'receipt_status_log_failed', submissionId: body.id })
      );
    const { error: receiptLogError } = await supabase.from('communications_log').insert({
      channel: 'email',
      direction: 'outbound',
      status: welcome.state === 'accepted' ? 'sent' : welcome.state === 'failed' ? 'failed' : 'pending',
      subject: 'Growth tool welcome acknowledgement',
      sender: 'Customer.io',
      recipient: email,
      page_path: pagePath,
      form_id: formId,
      metadata: {
        submissionId: body.id,
        provider: 'customerio',
        provider_state: welcome.state,
        delivery_id: welcome.deliveryId || null,
        reason: welcome.reason || null,
        is_test: name.startsWith('ZIAFLOW QA'),
      },
    });
    if (receiptLogError)
      console.warn(JSON.stringify({ scope: 'growth_intake', event: 'receipt_log_failed', submissionId: body.id }));
    return json({ ok: true, status: 'pending_internal_review', welcome: welcome.state });
  } catch {
    return json({ ok: false, error: 'invalid_request' }, 400);
  }
};

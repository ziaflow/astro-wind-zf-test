import type { APIRoute } from 'astro';
import crypto, { createHash } from 'node:crypto';
import { supabaseAdmin } from '~/lib/supabase-admin';

export const prerender = false;

interface CustomerIoWebhookEvent {
  event_id?: string;
  id?: string;
  event_type?: string;
  metric?: string;
  type?: string;
  timestamp?: number | string;
  data?: {
    recipient?: string;
    email?: string;
    delivery_id?: string | number;
    action_id?: string | number;
    campaign_id?: string | number;
    subject?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export const POST: APIRoute = async ({ request }) => {
  // 1. Read raw request body as text BEFORE any JSON parsing (preserves exact bytes for HMAC)
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to read request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 2. Customer.io Cryptographic Signature Verification
  const signingKey = import.meta.env.CIO_WEBHOOK_SIGNING_KEY || import.meta.env.CUSTOMER_IO_WEBHOOK_SIGNING_KEY;
  const timestamp = request.headers.get('x-cio-timestamp') ?? '';
  const signature = request.headers.get('x-cio-signature') ?? '';

  if (signingKey) {
    if (!timestamp || !signature) {
      console.warn('[customerio-webhook] rejected: missing x-cio-timestamp or x-cio-signature header');
      return new Response(JSON.stringify({ error: 'Missing signature headers' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Replay defense: verify timestamp is within a 5-minute (300 seconds) tolerance window
    const parsedTimestamp = Number(timestamp);
    if (!isNaN(parsedTimestamp)) {
      const currentSeconds = Math.floor(Date.now() / 1000);
      if (Math.abs(currentSeconds - parsedTimestamp) > 300) {
        console.warn(`[customerio-webhook] rejected: timestamp out of tolerance (${timestamp} vs ${currentSeconds})`);
        return new Response(JSON.stringify({ error: 'Timestamp expired' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Recompute signature: v0:<timestamp>:<raw body>
    const expected = crypto
      .createHmac('sha256', signingKey)
      .update(`v0:${timestamp}:${rawBody}`)
      .digest('hex');

    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signature);

    if (
      expectedBuffer.length !== signatureBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
    ) {
      console.warn('[customerio-webhook] rejected: signature mismatch');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } else {
    // Fallback: Optional legacy bearer token check if signing key is not yet configured
    const legacySecret = import.meta.env.CUSTOMER_IO_WEBHOOK_SECRET;
    if (legacySecret) {
      const authHeader = request.headers.get('authorization') || '';
      const secretHeader = request.headers.get('x-cio-webhook-secret') || '';
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();

      if (token !== legacySecret && secretHeader !== legacySecret) {
        console.warn('[customerio-webhook] unauthorized access attempt (legacy check)');
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
  }

  // 3. Parse JSON from verified raw body
  let parsedPayload: unknown;
  try {
    parsedPayload = JSON.parse(rawBody || '{}');
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const events: CustomerIoWebhookEvent[] = Array.isArray(parsedPayload)
    ? parsedPayload
    : typeof parsedPayload === 'object' && parsedPayload !== null
      ? [parsedPayload as CustomerIoWebhookEvent]
      : [];

  if (events.length === 0) {
    return new Response(JSON.stringify({ status: 'ok', ingested: 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!supabaseAdmin) {
    console.error('[customerio-webhook] Supabase service role client unavailable');
    return new Response(JSON.stringify({ error: 'Persistence service unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 4. Normalize records for idempotent upsert
  const records = events.map((event) => {
    const data = event.data || {};
    const recipient = String(data.recipient || data.email || event.recipient || 'unknown').toLowerCase();
    const eventType = String(event.event_type || event.metric || event.type || 'unknown');
    const deliveryId = data.delivery_id ? String(data.delivery_id) : null;
    const actionId = data.action_id ? String(data.action_id) : null;
    const campaignId = data.campaign_id ? String(data.campaign_id) : null;
    const subject = data.subject ? String(data.subject) : null;

    // Standardize event_id or compute deterministic hash if omitted
    const eventId =
      event.event_id ||
      event.id ||
      createHash('sha256')
        .update(`${recipient}:${eventType}:${deliveryId || ''}:${event.timestamp || ''}`)
        .digest('hex');

    // Parse timestamp
    let occurredAt = new Date().toISOString();
    if (event.timestamp) {
      const num = Number(event.timestamp);
      if (!isNaN(num)) {
        // Unix seconds vs milliseconds
        occurredAt = new Date(num > 1e11 ? num : num * 1000).toISOString();
      } else {
        occurredAt = new Date(String(event.timestamp)).toISOString();
      }
    }

    return {
      event_id: eventId,
      event_type: eventType,
      recipient,
      delivery_id: deliveryId,
      action_id: actionId,
      campaign_id: campaignId,
      subject,
      occurred_at: occurredAt,
      recorded_at: new Date().toISOString(),
      payload: event,
    };
  });

  // 5. Ingest into Supabase (idempotent: ignoreDuplicates on conflict with event_id)
  const { error: insertError } = await supabaseAdmin
    .from('email_delivery_events')
    .upsert(records, { onConflict: 'event_id', ignoreDuplicates: true });

  if (insertError) {
    console.error('[customerio-webhook] Supabase insert failed:', insertError.message);
    return new Response(JSON.stringify({ error: 'Failed to record events', detail: insertError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  console.log(`[customerio-webhook] successfully ingested ${records.length} event(s)`);
  return new Response(JSON.stringify({ status: 'ok', ingested: records.length }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

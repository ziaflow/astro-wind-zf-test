import type { APIRoute } from 'astro';
import { createHash } from 'crypto';
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
  // 1. Optional Secret Verification (if configured in env)
  const expectedSecret = import.meta.env.CUSTOMER_IO_WEBHOOK_SECRET;
  if (expectedSecret) {
    const authHeader = request.headers.get('authorization') || '';
    const secretHeader = request.headers.get('x-cio-webhook-secret') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (token !== expectedSecret && secretHeader !== expectedSecret) {
      console.warn('[customerio-webhook] unauthorized access attempt');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // 2. Parse Payload (supports single object or batch array)
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const events: CustomerIoWebhookEvent[] = Array.isArray(rawBody)
    ? rawBody
    : typeof rawBody === 'object' && rawBody !== null
      ? [rawBody as CustomerIoWebhookEvent]
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

  // 3. Normalize records for idempotent upsert
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

  // 4. Ingest into Supabase (idempotent: ignoreDuplicates on conflict with event_id)
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

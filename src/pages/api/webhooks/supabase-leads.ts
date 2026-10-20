import type { APIRoute } from 'astro';
import crypto from 'node:crypto';
import { identifyUser, trackEvent } from '~/lib/customerio';

export const prerender = false;

interface SupabaseCdcPayload {
  type?: 'INSERT' | 'UPDATE' | 'DELETE';
  table?: string;
  schema?: string;
  record?: {
    id?: string | number;
    email?: string;
    name?: string;
    company_name?: string;
    phone?: string;
    service_needed?: string;
    comments?: string;
    status?: string;
    created_at?: string;
    [key: string]: unknown;
  };
  old_record?: Record<string, unknown> | null;
}

/**
 * Supabase CDC Lead Webhook Endpoint
 * Ingests database webhook triggers and orchestrates Customer.io track and lead lifecycle events
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const rawBody = await request.text();
    const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET || import.meta.env.SUPABASE_WEBHOOK_SECRET;

    // Optional HMAC signature verification if secret is provided
    if (webhookSecret) {
      const signature = request.headers.get('x-supabase-signature') || request.headers.get('x-webhook-signature');

      if (!signature) {
        return new Response(JSON.stringify({ ok: false, error: 'missing_signature' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const hmac = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
      if (signature !== hmac && signature !== `sha256=${hmac}`) {
        return new Response(JSON.stringify({ ok: false, error: 'invalid_signature' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    let payload: SupabaseCdcPayload = {};
    if (rawBody) {
      try {
        payload = JSON.parse(rawBody) as SupabaseCdcPayload;
      } catch {
        return new Response(JSON.stringify({ ok: false, error: 'invalid_json' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const { type, record, table } = payload;

    // Process lead insertions
    if (record && (type === 'INSERT' || !type)) {
      const leadId = record.id ? `lead_${record.id}` : record.email || 'unknown';
      const email = record.email;

      if (email) {
        await identifyUser(leadId, {
          email,
          created_at: record.created_at
            ? Math.floor(new Date(record.created_at).getTime() / 1000)
            : Math.floor(Date.now() / 1000),
          company_name: record.company_name || undefined,
          phone: record.phone || undefined,
          service_needed: record.service_needed || undefined,
          lead_tier: 'tier_1_diagnostic',
          pipeline_status: record.status || 'inbox',
        });

        await trackEvent(leadId, 'lead_intake_submitted', {
          source: 'supabase_cdc',
          table: table || 'leads',
          company_name: record.company_name || '',
          service_needed: record.service_needed || '',
        });
      }
    }

    return new Response(JSON.stringify({ ok: true, processed: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Supabase CDC Webhook Error:', errorMsg);
    return new Response(JSON.stringify({ ok: false, error: 'server_error', details: errorMsg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

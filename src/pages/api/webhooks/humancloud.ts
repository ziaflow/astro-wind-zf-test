import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import nodemailer from 'nodemailer';
import { supabaseAdmin } from '~/lib/supabase-admin';

export const prerender = false;

interface HumanCloudPayload {
  event?: string;
  event_type?: string;
  type?: string;
  timestamp?: number | string;
  id?: string;
  data?: {
    id?: string;
    brief_id?: string;
    title?: string;
    description?: string;
    buyer_name?: string;
    buyer_email?: string;
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    company_name?: string;
    organization?: string;
    budget?: string | number;
    timeline?: string;
    category?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

const json = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request, url }) => {
  try {
    // 1. Optional Secret Verification
    const configuredSecret = import.meta.env.HUMANCLOUD_WEBHOOK_SECRET;
    if (configuredSecret) {
      const headerSecret =
        request.headers.get('x-webhook-secret') ||
        request.headers.get('x-humancloud-secret') ||
        request.headers
          .get('authorization')
          ?.replace(/^Bearer\s+/i, '')
          .trim();
      const querySecret = url.searchParams.get('token') || url.searchParams.get('secret');

      if (headerSecret !== configuredSecret && querySecret !== configuredSecret) {
        console.warn('[humancloud-webhook] Unauthorized: secret mismatch');
        return json({ error: 'Unauthorized' }, 401);
      }
    }

    // 2. Read and Parse Body
    let rawBody: string;
    try {
      rawBody = await request.text();
    } catch {
      return json({ error: 'Failed to read request body' }, 400);
    }

    let payload: HumanCloudPayload;
    try {
      payload = JSON.parse(rawBody || '{}');
    } catch {
      return json({ error: 'Invalid JSON payload' }, 400);
    }

    // 3. Normalize Event & Lead Data
    const rawData = payload.data || {};
    const eventName = String(
      payload.event || payload.event_type || payload.type || rawData.event || 'brief_received'
    ).trim();

    const name = String(rawData.buyer_name || rawData.name || payload.name || 'Human Cloud Inbound Buyer').trim();

    const email = String(rawData.buyer_email || rawData.email || payload.email || 'info+humancloud@ziaflow.com')
      .trim()
      .toLowerCase();

    const phone = String(rawData.phone || payload.phone || '').trim();
    const company = String(
      rawData.company_name || rawData.company || rawData.organization || payload.company || 'Human Cloud Marketplace'
    ).trim();

    const briefTitle = rawData.title ? `Title: ${rawData.title}\n` : '';
    const briefBudget = rawData.budget ? `Budget: ${rawData.budget}\n` : '';
    const briefTimeline = rawData.timeline ? `Timeline: ${rawData.timeline}\n` : '';
    const description = String(rawData.description || rawData.message || payload.message || '').trim();

    const combinedComments = [`[Human Cloud Event: ${eventName}]`, briefTitle, briefBudget, briefTimeline, description]
      .filter(Boolean)
      .join('\n')
      .trim();

    const isTest = Boolean(payload.is_test || rawData.is_test);

    // 4. Idempotency Key (Prevents duplicate database records on webhook retries)
    const eventId = String(payload.id || rawData.id || rawData.brief_id || '');
    const dedupSource = eventId
      ? `hc-${eventId}`
      : `hc-${eventName}-${email}-${createHash('sha256').update(rawBody).digest('hex').slice(0, 16)}`;
    const dedupKey = createHash('sha256').update(dedupSource).digest('hex');

    let submissionId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `hc-${Date.now()}`;
    let alreadyPersisted = false;

    // 5. Persist to Supabase
    if (supabaseAdmin) {
      // 5a. Insert Raw Receipt into lead_submissions
      const { data: inserted, error: receiptError } = await supabaseAdmin
        .from('lead_submissions')
        .insert({
          dedup_key: dedupKey,
          status: 'validated',
          is_test: isTest,
          page_submitted_from: 'humancloud',
          payload: {
            event: eventName,
            name,
            email,
            phone,
            company,
            comments: combinedComments,
            raw: payload,
          },
        })
        .select('id')
        .single();

      if (inserted) {
        submissionId = inserted.id;
      } else if (receiptError?.code === '23505') {
        // Duplicate webhook retry: reuse existing record
        const { data: existing } = await supabaseAdmin
          .from('lead_submissions')
          .select('id, status')
          .eq('dedup_key', dedupKey)
          .single();

        if (existing) {
          submissionId = existing.id;
          alreadyPersisted = existing.status === 'persisted';
        }
      } else {
        console.warn('[humancloud-webhook] receipt insert note:', receiptError?.message);
      }

      // 5b. Upsert into CRM Leads Table
      if (!alreadyPersisted) {
        const { error: leadError } = await supabaseAdmin.from('leads').upsert(
          {
            submission_id: submissionId,
            name,
            email,
            phone: phone || null,
            company_name: company,
            service_needed: `Human Cloud: ${eventName}`,
            comments: combinedComments,
            page_submitted_from: 'humancloud',
            status: 'new',
            score: 15, // Higher lead score for verified marketplace buyers
            is_test: isTest,
          },
          { onConflict: 'submission_id', ignoreDuplicates: true }
        );

        if (!leadError) {
          await supabaseAdmin
            .from('lead_submissions')
            .update({ status: 'persisted', persisted_at: new Date().toISOString() })
            .eq('id', submissionId);
        } else {
          console.error('[humancloud-webhook] leads upsert error:', leadError.message);
        }
      }
    } else {
      console.warn('[humancloud-webhook] supabaseAdmin client not initialized; skipping DB write');
    }

    // 6. Customer.io Inbound Dispatch
    const cioWebhookUrl = import.meta.env.CUSTOMER_IO_WEBHOOK_URL;
    if (!alreadyPersisted && !isTest && cioWebhookUrl) {
      try {
        const cioPayload = {
          name,
          email,
          phone,
          company,
          service: `Human Cloud - ${eventName}`,
          message: combinedComments,
          inquiry: combinedComments,
          source_page: 'https://ziaflow.com/humancloud',
          submission_id: submissionId,
          lead_id: submissionId,
          form_type: 'humancloud_event',
          event_type: eventName,
          is_test: false,
          idempotency_key: submissionId,
        };

        const cioRes = await fetch(cioWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cioPayload),
        });

        if (!cioRes.ok) {
          console.warn('[humancloud-webhook] Customer.io returned status:', cioRes.status);
        } else {
          console.log('[humancloud-webhook] Customer.io triggered successfully for', submissionId);
        }
      } catch (cioErr) {
        console.warn('[humancloud-webhook] Customer.io dispatch note:', cioErr);
      }
    }

    // 7. Internal SMTP Email Alert Fallback
    if (!alreadyPersisted && !isTest && import.meta.env.SMTP_HOST && import.meta.env.SMTP_USER) {
      try {
        const transporter = nodemailer.createTransport({
          host: import.meta.env.SMTP_HOST,
          port: Number(import.meta.env.SMTP_PORT || 587),
          secure: import.meta.env.SMTP_SECURE === 'true',
          auth: {
            user: import.meta.env.SMTP_USER,
            pass: import.meta.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: import.meta.env.SMTP_FROM || import.meta.env.SMTP_USER || 'no-reply@ziaflow.com',
          to: import.meta.env.SMTP_TO || 'info@ziaflow.com',
          replyTo: email,
          subject: `⚡ New Human Cloud Opportunity: ${eventName} from ${company}`,
          text: `
A new event occurred on Human Cloud:

Event: ${eventName}
Company: ${company}
Contact: ${name} (${email})
Phone: ${phone || 'N/A'}
Submission ID: ${submissionId}

Details:
${combinedComments}
          `.trim(),
        });
      } catch (smtpErr) {
        console.warn('[humancloud-webhook] SMTP alert note:', smtpErr);
      }
    }

    return json(
      {
        success: true,
        event: eventName,
        submission_id: submissionId,
        timestamp: new Date().toISOString(),
      },
      200
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('[humancloud-webhook] unhandled exception:', message);
    return json({ error: message }, 500);
  }
};

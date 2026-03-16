/**
 * Supabase Edge Function: lead-nurture-email
 *
 * Ops Agent: Triggers an Azure Communication Services (ACS) email whenever a
 * new row is inserted into `public.contact_submissions`.
 *
 * Deploy:
 *   supabase functions deploy lead-nurture-email --no-verify-jwt
 *
 * Set secrets (once per project):
 *   supabase secrets set ACS_ENDPOINT=https://<resource>.communication.azure.com
 *   supabase secrets set ACS_ACCESS_KEY=<your-acs-access-key>
 *   supabase secrets set ACS_SENDER_ADDRESS=DoNotReply@<domain>.azurecomm.net
 *   supabase secrets set NURTURE_RECIPIENT=info@ziaflow.com
 *
 * Wire up as a Postgres webhook in the Supabase dashboard:
 *   Table: public.contact_submissions  Event: INSERT
 *   HTTP URL: https://<project-ref>.supabase.co/functions/v1/lead-nurture-email
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ContactSubmission {
  id: string;
  created_at: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  metadata: Record<string, unknown> | null;
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: ContactSubmission;
  old_record: ContactSubmission | null;
}

// ---------------------------------------------------------------------------
// Azure Communication Services — send email via REST API
// See: https://learn.microsoft.com/azure/communication-services/quickstarts/email/send-email-smtp/send-email-using-smtp
// ---------------------------------------------------------------------------

async function sendAcsEmail(opts: {
  endpoint: string;
  accessKey: string;
  senderAddress: string;
  recipientAddress: string;
  subject: string;
  htmlContent: string;
  plainTextContent: string;
}): Promise<void> {
  const { endpoint, accessKey, senderAddress, recipientAddress, subject, htmlContent, plainTextContent } = opts;

  const url = `${endpoint}/emails:send?api-version=2023-03-31`;

  const body = JSON.stringify({
    senderAddress,
    content: {
      subject,
      html: htmlContent,
      plainText: plainTextContent,
    },
    recipients: {
      to: [{ address: recipientAddress }],
    },
  });

  // ACS REST API uses HMAC-SHA256 request signing.
  const date = new Date().toUTCString();
  const contentHash = await sha256Base64(body);
  const pathAndQuery = new URL(url).pathname + new URL(url).search;

  const stringToSign = `POST\n${pathAndQuery}\n${date};${new URL(endpoint).host};${contentHash}`;
  const signature = await hmacSha256Base64(accessKey, stringToSign);
  const authHeader = `HMAC-SHA256 SignedHeaders=x-ms-date;host;x-ms-content-sha256&Signature=${signature}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
      'x-ms-date': date,
      'x-ms-content-sha256': contentHash,
      host: new URL(endpoint).host,
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ACS email send failed (${response.status}): ${errorText}`);
  }
}

// ---------------------------------------------------------------------------
// Crypto helpers (Deno built-ins)
// ---------------------------------------------------------------------------

async function sha256Base64(data: string): Promise<string> {
  const encoded = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
}

async function hmacSha256Base64(secret: string, message: string): Promise<string> {
  const keyData = Uint8Array.from(atob(secret), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

// ---------------------------------------------------------------------------
// Email template
// ---------------------------------------------------------------------------

function buildEmailContent(record: ContactSubmission): { html: string; text: string; subject: string } {
  const { name, email, phone, message, created_at, metadata } = record;
  const displayName = name || 'New Lead';
  const subject = `🤝 New Lead: ${displayName} — ZiaFlow`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1e3a5f; border-bottom: 2px solid #0ea5e9; padding-bottom: 8px;">
        New Lead — Nurture Sequence Triggered
      </h2>
      <table style="width:100%; border-collapse:collapse; margin-top:16px;">
        <tr>
          <td style="padding:8px; font-weight:bold; color:#374151; width:140px;">Name</td>
          <td style="padding:8px; color:#1f2937;">${escapeHtml(name || '—')}</td>
        </tr>
        <tr style="background:#f9fafb;">
          <td style="padding:8px; font-weight:bold; color:#374151;">Email</td>
          <td style="padding:8px;">
            <a href="mailto:${escapeHtml(email || '')}" style="color:#0ea5e9;">${escapeHtml(email || '—')}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:8px; font-weight:bold; color:#374151;">Phone</td>
          <td style="padding:8px; color:#1f2937;">${escapeHtml(phone || '—')}</td>
        </tr>
        <tr style="background:#f9fafb;">
          <td style="padding:8px; font-weight:bold; color:#374151;">Submitted</td>
          <td style="padding:8px; color:#1f2937;">${formatMst(created_at)}</td>
        </tr>
      </table>

      <h3 style="color:#1e3a5f; margin-top:24px;">Message</h3>
      <p style="background:#f0f9ff; border-left:4px solid #0ea5e9; padding:12px; border-radius:4px; color:#1f2937; white-space:pre-wrap;">${escapeHtml(message || '—')}</p>

      ${
        metadata && Object.keys(metadata).length
          ? `<h3 style="color:#1e3a5f; margin-top:24px;">Additional Info</h3>
             <pre style="background:#f9fafb; padding:12px; border-radius:4px; font-size:12px; overflow:auto;">${escapeHtml(JSON.stringify(metadata, null, 2))}</pre>`
          : ''
      }

      <hr style="margin-top:32px; border:none; border-top:1px solid #e5e7eb;" />
      <p style="font-size:12px; color:#9ca3af;">
        This notification was sent by the ZiaFlow lead-nurture-email Supabase Edge Function.
        <br/>Lead ID: ${escapeHtml(record.id)}
      </p>
    </div>
  `;

  const text = [
    `New Lead — Nurture Sequence Triggered`,
    ``,
    `Name:      ${name || '—'}`,
    `Email:     ${email || '—'}`,
    `Phone:     ${phone || '—'}`,
    `Submitted: ${formatMst(created_at)}`,
    ``,
    `Message:`,
    message || '—',
    ``,
    metadata && Object.keys(metadata).length ? `Additional Info:\n${JSON.stringify(metadata, null, 2)}` : '',
    ``,
    `Lead ID: ${record.id}`,
  ]
    .join('\n')
    .trim();

  return { html, text, subject };
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatMst(isoDate: string): string {
  return `${new Date(isoDate).toLocaleString('en-US', { timeZone: 'America/Phoenix' })} MST`;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Only handle INSERTs on the contact_submissions table.
  if (payload.type !== 'INSERT' || payload.table !== 'contact_submissions') {
    return new Response(JSON.stringify({ skipped: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const record = payload.record;

  const acsEndpoint = Deno.env.get('ACS_ENDPOINT');
  const acsAccessKey = Deno.env.get('ACS_ACCESS_KEY');
  const acsSenderAddress = Deno.env.get('ACS_SENDER_ADDRESS');
  const nurtureRecipient = Deno.env.get('NURTURE_RECIPIENT') || 'info@ziaflow.com';

  if (!acsEndpoint || !acsAccessKey || !acsSenderAddress) {
    console.error('Missing ACS environment variables: ACS_ENDPOINT, ACS_ACCESS_KEY, ACS_SENDER_ADDRESS');
    return new Response(JSON.stringify({ error: 'ACS not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { html, text, subject } = buildEmailContent(record);

    await sendAcsEmail({
      endpoint: acsEndpoint,
      accessKey: acsAccessKey,
      senderAddress: acsSenderAddress,
      recipientAddress: nurtureRecipient,
      subject,
      htmlContent: html,
      plainTextContent: text,
    });

    console.log(`Lead nurture email sent for submission ${record.id} (${record.email})`);

    return new Response(JSON.stringify({ success: true, id: record.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('lead-nurture-email error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

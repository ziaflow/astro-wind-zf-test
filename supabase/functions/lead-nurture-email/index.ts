/**
 * Supabase Edge Function: lead-nurture-email
 *
 * Triggered via Supabase Database Webhook when a new row is inserted into
 * the `contact_submissions` table, or called directly from the API route.
 *
 * Sends a lead-nurture email to the prospect using Azure Email
 * Communication Services and a notification to the internal team.
 *
 * Deploy:
 *   supabase functions deploy lead-nurture-email
 *
 * Required environment variables (set in Supabase project secrets):
 *   AZURE_COMMUNICATION_CONNECTION_STRING
 *   AZURE_EMAIL_SENDER   – e.g. DoNotReply@<domain>.azurecomm.net
 *   INTERNAL_NOTIFY_EMAIL – team inbox to receive lead alerts
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LeadPayload {
  name?: string;
  email: string;
  phone?: string;
  message?: string;
  company_name?: string;
  [key: string]: unknown;
}

/** Shape of the JSON body sent by a Supabase Database Webhook (INSERT event). */
interface DatabaseWebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: LeadPayload;
  old_record: LeadPayload | null;
}

// ---------------------------------------------------------------------------
// Azure Email Communication Services helper
// ---------------------------------------------------------------------------

/**
 * Sends an email via the Azure Communication Services REST API.
 * Docs: https://learn.microsoft.com/en-us/rest/api/communication/email/send
 */
async function sendAzureEmail(options: {
  connectionString: string;
  senderAddress: string;
  recipientAddress: string;
  subject: string;
  htmlContent: string;
  plainTextContent: string;
}): Promise<{ messageId: string }> {
  const { connectionString, senderAddress, recipientAddress, subject, htmlContent, plainTextContent } = options;

  // Parse the connection string to extract endpoint and access key.
  // Format: endpoint=https://<resource>.communication.azure.com/;accesskey=<key>
  const endpointMatch = connectionString.match(/endpoint=([^;]+)/i);
  const accessKeyMatch = connectionString.match(/accesskey=([^;]+)/i);

  if (!endpointMatch || !accessKeyMatch) {
    throw new Error('Invalid AZURE_COMMUNICATION_CONNECTION_STRING format');
  }

  const endpoint = endpointMatch[1].replace(/\/$/, '');
  const accessKey = accessKeyMatch[1];
  const apiVersion = '2023-03-31';
  const url = `${endpoint}/emails:send?api-version=${apiVersion}`;

  // Build HMAC-SHA256 signature required by Azure Communication Services.
  const requestBody = JSON.stringify({
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

  const now = new Date().toUTCString();
  const contentHash = await sha256Base64(requestBody);
  const urlObj = new URL(url);
  const pathAndQuery = urlObj.pathname + urlObj.search;
  const stringToSign = `POST\n${pathAndQuery}\n${now};${urlObj.host};${contentHash}`;
  const signature = await hmacSHA256Base64(accessKey, stringToSign);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Date: now,
      'x-ms-content-sha256': contentHash,
      Authorization: `HMAC-SHA256 SignedHeaders=date;host;x-ms-content-sha256&Signature=${signature}`,
    },
    body: requestBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Azure Email API error ${response.status}: ${errorText}`);
  }

  const operationId = response.headers.get('x-ms-request-id') ?? 'unknown';
  return { messageId: operationId };
}

// ---------------------------------------------------------------------------
// Crypto helpers (Deno built-ins)
// ---------------------------------------------------------------------------

async function sha256Base64(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

async function hmacSHA256Base64(base64Key: string, message: string): Promise<string> {
  const keyBytes = Uint8Array.from(atob(base64Key), (c) => c.charCodeAt(0));
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

// ---------------------------------------------------------------------------
// Email templates
// ---------------------------------------------------------------------------

function buildNurtureEmailHtml(lead: LeadPayload): string {
  const firstName = (lead.name || 'there').split(' ')[0];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to ZiaFlow</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f6f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#1d4ed8;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">ZiaFlow</h1>
              <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">AI-Powered Growth for Arizona Businesses</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#1e293b;font-size:20px;">Hi ${firstName} 👋</h2>
              <p style="margin:0 0 16px;color:#475569;line-height:1.6;">
                Thanks for reaching out to <strong>ZiaFlow</strong>! We've received your inquiry and one of our
                growth specialists will be in touch within <strong>1 business day</strong>.
              </p>
              <p style="margin:0 0 24px;color:#475569;line-height:1.6;">
                While you wait, here's a quick look at how we help home-service businesses in Arizona
                generate predictable, qualified leads:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#eff6ff;border-left:4px solid #1d4ed8;padding:16px 20px;border-radius:4px;">
                    <ul style="margin:0;padding-left:20px;color:#1e40af;line-height:1.8;">
                      <li>Local SEO &amp; Google Business Profile optimization</li>
                      <li>AI-powered lead nurturing &amp; follow-up automation</li>
                      <li>PPC campaigns with transparent ROI dashboards</li>
                      <li>Custom software &amp; CRM integrations</li>
                    </ul>
                  </td>
                </tr>
              </table>
              <p style="margin:32px 0 0;text-align:center;">
                <a href="https://outlook.office.com/book/ZiaFlowIntake@ziaflow.com/?ismsaljsauthenabled"
                   style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:600;font-size:15px;">
                  Book a Free Growth Audit →
                </a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                ZiaFlow · Phoenix, AZ · <a href="https://ziaflow.com" style="color:#1d4ed8;">ziaflow.com</a>
              </p>
              <p style="margin:8px 0 0;color:#94a3b8;font-size:11px;">
                You're receiving this because you submitted a form on our website.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildNurtureEmailPlainText(lead: LeadPayload): string {
  const firstName = (lead.name || 'there').split(' ')[0];
  return `Hi ${firstName},

Thanks for reaching out to ZiaFlow! We've received your inquiry and one of our growth specialists will be in touch within 1 business day.

While you wait, here's how we help Arizona businesses:
- Local SEO & Google Business Profile optimization
- AI-powered lead nurturing & follow-up automation
- PPC campaigns with transparent ROI dashboards
- Custom software & CRM integrations

Book a Free Growth Audit: https://outlook.office.com/book/ZiaFlowIntake@ziaflow.com/?ismsaljsauthenabled

--
ZiaFlow · Phoenix, AZ · https://ziaflow.com
`;
}

function buildInternalNotificationHtml(lead: LeadPayload): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>New Lead</title></head>
<body style="font-family:Arial,sans-serif;padding:24px;color:#1e293b;">
  <h2 style="color:#1d4ed8;">🚀 New Lead Submitted</h2>
  <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:480px;">
    <tr style="background:#f1f5f9;">
      <td style="font-weight:600;width:140px;">Name</td>
      <td>${lead.name || 'N/A'}</td>
    </tr>
    <tr>
      <td style="font-weight:600;">Email</td>
      <td><a href="mailto:${lead.email}">${lead.email}</a></td>
    </tr>
    <tr style="background:#f1f5f9;">
      <td style="font-weight:600;">Phone</td>
      <td>${lead.phone || 'N/A'}</td>
    </tr>
    <tr>
      <td style="font-weight:600;">Company</td>
      <td>${lead.company_name || 'N/A'}</td>
    </tr>
    <tr style="background:#f1f5f9;">
      <td style="font-weight:600;">Message</td>
      <td>${(lead.message || '').replace(/\n/g, '<br/>') || 'N/A'}</td>
    </tr>
  </table>
  <p style="margin-top:24px;font-size:12px;color:#64748b;">Sent by the ZiaFlow lead-nurture-email Edge Function</p>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

// Restrict CORS to our own domain; DB webhooks and the server-side API route
// don't use CORS, so this only affects direct browser calls (e.g. local dev).
const ALLOWED_ORIGIN = Deno.env.get('SITE_URL') || 'https://ziaflow.com';

serve(async (req: Request) => {
  // Handle CORS pre-flight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const connectionString = Deno.env.get('AZURE_COMMUNICATION_CONNECTION_STRING');
    const senderAddress = Deno.env.get('AZURE_EMAIL_SENDER');
    const internalNotifyEmail = Deno.env.get('INTERNAL_NOTIFY_EMAIL') || 'info@ziaflow.com';

    if (!connectionString || !senderAddress) {
      console.error('Missing required Azure env vars: AZURE_COMMUNICATION_CONNECTION_STRING, AZURE_EMAIL_SENDER');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();

    // Support both direct API calls and Supabase Database Webhook payloads.
    let lead: LeadPayload;
    if (body.type === 'INSERT' && body.record) {
      // Database Webhook format
      const webhookPayload = body as DatabaseWebhookPayload;
      lead = webhookPayload.record;
    } else {
      // Direct invocation format
      lead = body as LeadPayload;
    }

    if (!lead.email) {
      return new Response(JSON.stringify({ error: 'Lead email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Send nurture email to the lead
    const { messageId: nurtureMessageId } = await sendAzureEmail({
      connectionString,
      senderAddress,
      recipientAddress: lead.email,
      subject: "We've received your inquiry — ZiaFlow",
      htmlContent: buildNurtureEmailHtml(lead),
      plainTextContent: buildNurtureEmailPlainText(lead),
    });

    console.log(`Nurture email sent to ${lead.email}, Azure message ID: ${nurtureMessageId}`);

    // 2. Send internal notification
    const { messageId: notifyMessageId } = await sendAzureEmail({
      connectionString,
      senderAddress,
      recipientAddress: internalNotifyEmail,
      subject: `New lead: ${lead.name || lead.email}`,
      htmlContent: buildInternalNotificationHtml(lead),
      plainTextContent: `New lead submitted:\n${JSON.stringify(lead, null, 2)}`,
    });

    console.log(`Internal notification sent to ${internalNotifyEmail}, Azure message ID: ${notifyMessageId}`);

    return new Response(
      JSON.stringify({
        success: true,
        nurtureMessageId,
        notifyMessageId,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('lead-nurture-email error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

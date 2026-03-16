/**
 * Supabase Edge Function: lead-nurturing
 *
 * Triggered by a Supabase Database Webhook (or pg_net HTTP call) whenever a new
 * row is inserted into the `leads` table.  It sends a transactional nurturing
 * email via the Azure Communication Services Email REST API.
 *
 * Required environment variables (set via `supabase secrets set`):
 *   ACS_ENDPOINT        – e.g. https://<resource>.communication.azure.com
 *   ACS_ACCESS_KEY      – Base64-encoded Azure Communication Services access key
 *   ACS_SENDER_ADDRESS  – Verified sender address, e.g. DoNotReply@<domain>.azurecomm.net
 *   ACS_REPLY_TO        – Optional reply-to address, defaults to info@ziaflow.com
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LeadRecord {
  id: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  email: string;
  company?: string;
  phone?: string;
  source?: string;
  message?: string;
}

interface DatabaseWebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: LeadRecord;
  schema: string;
  old_record: LeadRecord | null;
}

interface AcsEmailRequest {
  senderAddress: string;
  recipients: { to: { address: string; displayName?: string }[] };
  replyTo?: { address: string; displayName?: string }[];
  content: {
    subject: string;
    plainText?: string;
    html?: string;
  };
}

// ---------------------------------------------------------------------------
// Azure Communication Services helpers
// ---------------------------------------------------------------------------

const ACS_API_VERSION = '2023-03-31';

/**
 * Builds the HMAC-SHA256 Authorization header required by Azure Communication
 * Services when using access-key authentication.
 */
async function buildAcsAuthHeader(
  method: string,
  url: URL,
  body: string,
  accessKey: string
): Promise<Record<string, string>> {
  const utcNow = new Date().toUTCString();
  const contentHash = await sha256Base64(body);

  const signedHeaders = 'x-ms-date;host;x-ms-content-sha256';
  const stringToSign = [method.toUpperCase(), url.pathname + url.search, `${utcNow};${url.host};${contentHash}`].join(
    '\n'
  );

  const keyBytes = Uint8Array.from(atob(accessKey), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signatureBytes = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(stringToSign));
  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));

  return {
    'x-ms-date': utcNow,
    'x-ms-content-sha256': contentHash,
    Authorization: `HMAC-SHA256 SignedHeaders=${signedHeaders}&Signature=${signature}`,
  };
}

async function sha256Base64(data: string): Promise<string> {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

/**
 * Sends an email via the Azure Communication Services Email API.
 */
async function sendAcsEmail(payload: AcsEmailRequest): Promise<{ success: boolean; operationId?: string; error?: string }> {
  const endpoint = Deno.env.get('ACS_ENDPOINT');
  const accessKey = Deno.env.get('ACS_ACCESS_KEY');

  if (!endpoint || !accessKey) {
    return { success: false, error: 'ACS_ENDPOINT or ACS_ACCESS_KEY is not configured.' };
  }

  const url = new URL(`${endpoint}/emails:send?api-version=${ACS_API_VERSION}`);
  const body = JSON.stringify(payload);
  const authHeaders = await buildAcsAuthHeader('POST', url, body, accessKey);

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { success: false, error: `ACS API error ${response.status}: ${errorText}` };
  }

  const operationId = response.headers.get('Operation-Id') ?? undefined;
  return { success: true, operationId };
}

// ---------------------------------------------------------------------------
// Email templates
// ---------------------------------------------------------------------------

function buildNurturingEmail(lead: LeadRecord): { subject: string; html: string; plainText: string } {
  const firstName = lead.first_name ?? 'there';
  const companyLine = lead.company ? ` at ${lead.company}` : '';

  const subject = `Welcome to ZiaFlow${companyLine ? `, ${lead.company}` : ''}! Your next steps inside 🚀`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color: #2563eb; padding: 32px 40px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">ZiaFlow</h1>
              <p style="color: #bfdbfe; margin: 4px 0 0; font-size: 14px;">Digital Transformation Experts · Phoenix, AZ</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1e293b; font-size: 20px; margin-top: 0;">Hi ${firstName}! 👋</h2>
              <p style="color: #475569; line-height: 1.6;">
                Thanks for reaching out to ZiaFlow${companyLine}. We're excited to learn more about your goals
                and explore how we can help you achieve measurable growth.
              </p>
              <p style="color: #475569; line-height: 1.6;">Here's what happens next:</p>
              <table cellpadding="0" cellspacing="0" style="width: 100%; margin: 24px 0;">
                <tr>
                  <td style="padding: 12px 16px; background-color: #eff6ff; border-radius: 8px; margin-bottom: 12px;">
                    <strong style="color: #1d4ed8;">1. Discovery Call (within 24 hrs)</strong>
                    <p style="color: #475569; margin: 4px 0 0; font-size: 14px;">
                      A member of our team will reach out to schedule a 30-minute conversation about your business needs.
                    </p>
                  </td>
                </tr>
                <tr><td style="height: 12px;"></td></tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f0fdf4; border-radius: 8px;">
                    <strong style="color: #15803d;">2. Custom Proposal</strong>
                    <p style="color: #475569; margin: 4px 0 0; font-size: 14px;">
                      We'll prepare a tailored proposal with clear scope, timeline, and investment details.
                    </p>
                  </td>
                </tr>
              </table>
              <p style="color: #475569; line-height: 1.6;">
                In the meantime, feel free to explore our
                <a href="https://ziaflow.com/services" style="color: #2563eb; text-decoration: none;">services</a> or
                <a href="https://ziaflow.com/posts" style="color: #2563eb; text-decoration: none;">read our blog</a>
                for tips on growing your business online.
              </p>
              <div style="text-align: center; margin-top: 32px;">
                <a href="https://outlook.office.com/book/ZiaFlowIntake@ziaflow.com/?ismsaljsauthenabled"
                   style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 700; font-size: 16px;">
                  Book Your Free Consultation
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
                ZiaFlow · 4809 E Thistle Landing Dr, Phoenix, AZ 85044 ·
                <a href="mailto:info@ziaflow.com" style="color: #94a3b8;">info@ziaflow.com</a><br />
                You received this because you submitted a form on ziaflow.com.
                <a href="https://ziaflow.com/privacy" style="color: #94a3b8;">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const plainText = `Hi ${firstName},

Thanks for reaching out to ZiaFlow${companyLine}! We're excited to connect.

Here's what happens next:

1. Discovery Call (within 24 hrs) – A member of our team will reach out to schedule a 30-minute conversation.
2. Custom Proposal – We'll prepare a tailored proposal with clear scope, timeline, and investment details.

Book your free consultation: https://outlook.office.com/book/ZiaFlowIntake@ziaflow.com/

Questions? Reply to this email or reach us at info@ziaflow.com.

— The ZiaFlow Team
Phoenix, AZ | ziaflow.com`;

  return { subject, html, plainText };
}

// ---------------------------------------------------------------------------
// Edge Function handler
// ---------------------------------------------------------------------------

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload: DatabaseWebhookPayload = await req.json();

    // Only process INSERT events on the leads table
    if (payload.type !== 'INSERT' || payload.table !== 'leads') {
      return new Response(JSON.stringify({ message: 'Skipped: not a leads INSERT event.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const lead = payload.record;

    if (!lead?.email) {
      return new Response(JSON.stringify({ error: 'Lead record is missing an email address.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const senderAddress = Deno.env.get('ACS_SENDER_ADDRESS');
    const replyTo = Deno.env.get('ACS_REPLY_TO') ?? 'info@ziaflow.com';

    if (!senderAddress) {
      return new Response(JSON.stringify({ error: 'ACS_SENDER_ADDRESS is not configured.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { subject, html, plainText } = buildNurturingEmail(lead);

    const emailPayload: AcsEmailRequest = {
      senderAddress,
      recipients: {
        to: [
          {
            address: lead.email,
            displayName: [lead.first_name, lead.last_name].filter(Boolean).join(' ') || undefined,
          },
        ],
      },
      replyTo: [{ address: replyTo, displayName: 'ZiaFlow Team' }],
      content: {
        subject,
        html,
        plainText,
      },
    };

    const result = await sendAcsEmail(emailPayload);

    if (!result.success) {
      console.error('[lead-nurturing] Failed to send email:', result.error);
      return new Response(JSON.stringify({ error: result.error }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`[lead-nurturing] Nurturing email sent to ${lead.email} (ACS operation: ${result.operationId})`);
    return new Response(
      JSON.stringify({ success: true, operationId: result.operationId }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[lead-nurturing] Unhandled error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

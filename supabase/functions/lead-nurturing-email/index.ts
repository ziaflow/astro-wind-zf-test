// Supabase Edge Function: lead-nurturing-email
// Triggered by a Supabase Database Webhook on INSERT to public.contact_submissions
// Sends a lead nurturing email via Azure Communication Services (ACS) Email.
//
// Required environment variables (set in Supabase Dashboard → Edge Functions → Secrets):
//   ACS_ENDPOINT          - Azure Communication Services resource endpoint
//                           e.g. https://<resource>.communication.azure.com
//   ACS_ACCESS_KEY        - ACS access key (primary or secondary)
//   ACS_SENDER_ADDRESS    - Verified sender address, e.g. DoNotReply@<subdomain>.azurecomm.net
//   NURTURE_FROM_DISPLAY  - Display name shown in the From field, e.g. "ZiaFlow Team"
//   NURTURE_REPLY_TO      - Reply-to address, e.g. hello@ziaflow.com

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
  record: ContactSubmission;
  schema: string;
  old_record: ContactSubmission | null;
}

// ---------------------------------------------------------------------------
// ACS REST helpers
// ---------------------------------------------------------------------------

interface AcsSigningData {
  headers: Record<string, string>;
  stringToSign: string;
  keyBytes: Uint8Array;
}

/**
 * Prepares the canonical string-to-sign and key bytes required for
 * HMAC-SHA256 authentication against the ACS REST API.
 * https://learn.microsoft.com/azure/communication-services/concepts/authentication
 */
function prepareAcsSigning(
  method: string,
  url: URL,
  body: string,
  accessKey: string
): AcsSigningData {
  const utcNow = new Date().toUTCString();
  const contentHash = btoa(
    String.fromCharCode(...new Uint8Array(
      new TextEncoder().encode(body).buffer
    ))
  );

  const pathAndQuery = url.pathname + (url.search ?? '');
  const stringToSign = `${method}\n${pathAndQuery}\n${utcNow};${url.host};${contentHash}`;
  const keyBytes = Uint8Array.from(atob(accessKey), (c) => c.charCodeAt(0));

  const headers: Record<string, string> = {
    Date: utcNow,
    'x-ms-content-sha256': contentHash,
    'x-ms-date': utcNow,
    'Content-Type': 'application/json',
  };

  return { headers, stringToSign, keyBytes };
}

async function signAcsRequest(
  method: string,
  url: URL,
  body: string,
  accessKey: string
): Promise<Record<string, string>> {
  const { headers, stringToSign, keyBytes } = prepareAcsSigning(method, url, body, accessKey);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    new TextEncoder().encode(stringToSign)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)));

  headers['Authorization'] =
    `HMAC-SHA256 SignedHeaders=date;host;x-ms-content-sha256&Signature=${signatureB64}`;

  return headers;
}

// ---------------------------------------------------------------------------
// Email content builder
// ---------------------------------------------------------------------------

function buildNurtureEmail(lead: ContactSubmission): {
  subject: string;
  htmlBody: string;
  plainText: string;
} {
  const firstName = (lead.name ?? 'there').split(' ')[0];

  const subject = `Thanks for reaching out, ${firstName} — here's what's next`;

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: #fff; margin: 0; font-size: 28px;">ZiaFlow</h1>
    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0;">Digital Transformation Partners</p>
  </div>

  <div style="background: #fff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <h2 style="color: #1f2937; margin-top: 0;">Hi ${firstName},</h2>
    <p>Thanks for getting in touch! We received your message and one of our specialists will reach out within <strong>1 business day</strong>.</p>

    <p>In the meantime, here are a few resources that might be helpful:</p>

    <ul style="padding-left: 20px;">
      <li><a href="https://ziaflow.com/services" style="color: #667eea;">Explore our services</a></li>
      <li><a href="https://ziaflow.com/posts" style="color: #667eea;">Read our latest insights</a></li>
      <li><a href="https://ziaflow.com/partners" style="color: #667eea;">Partnership opportunities</a></li>
    </ul>

    <div style="background: #f9fafb; border-left: 4px solid #667eea; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <strong>Need something faster?</strong><br />
      Book a free consultation directly on our calendar:
      <br /><br />
      <a href="https://outlook.office.com/book/ZiaFlowIntake@ziaflow.com/" style="display: inline-block; background: #667eea; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Book a Meeting
      </a>
    </div>

    <p style="margin-bottom: 0;">Looking forward to speaking with you,</p>
    <p style="margin-top: 4px;"><strong>The ZiaFlow Team</strong></p>
  </div>

  <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">
    © ${new Date().getFullYear()} ZiaFlow · <a href="https://ziaflow.com/privacy" style="color: #9ca3af;">Privacy Policy</a>
  </p>
</body>
</html>`;

  const plainText = `Hi ${firstName},

Thanks for getting in touch! We received your message and one of our specialists will reach out within 1 business day.

In the meantime, here are a few resources:
- Services: https://ziaflow.com/services
- Blog: https://ziaflow.com/posts
- Partnerships: https://ziaflow.com/partners

Need something faster? Book a free consultation:
https://outlook.office.com/book/ZiaFlowIntake@ziaflow.com/

Looking forward to speaking with you,
The ZiaFlow Team`;

  return { subject, htmlBody, plainText };
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  // Only process POST requests from the Supabase webhook
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Validate required secrets
  const acsEndpoint = Deno.env.get('ACS_ENDPOINT');
  const acsAccessKey = Deno.env.get('ACS_ACCESS_KEY');
  const acsSenderAddress = Deno.env.get('ACS_SENDER_ADDRESS');
  const fromDisplayName = Deno.env.get('NURTURE_FROM_DISPLAY') ?? 'ZiaFlow Team';
  const replyToAddress = Deno.env.get('NURTURE_REPLY_TO') ?? '';

  if (!acsEndpoint || !acsAccessKey || !acsSenderAddress) {
    console.error('Missing required ACS environment variables');
    return new Response(JSON.stringify({ error: 'Server misconfiguration' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Parse the Supabase webhook payload
  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Only handle INSERT events on the contact_submissions table
  if (payload.type !== 'INSERT' || payload.table !== 'contact_submissions') {
    return new Response(JSON.stringify({ skipped: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const lead = payload.record;

  // Skip if no recipient email
  if (!lead.email) {
    console.warn(`Lead ${lead.id} has no email address; skipping nurture email`);
    return new Response(JSON.stringify({ skipped: true, reason: 'no_email' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { subject, htmlBody, plainText } = buildNurtureEmail(lead);

  // Build ACS Send Email request
  // https://learn.microsoft.com/rest/api/communication/email/send
  const acsUrl = new URL('/emails:send?api-version=2023-03-31', acsEndpoint);

  const emailPayload = JSON.stringify({
    senderAddress: acsSenderAddress,
    recipients: {
      to: [
        {
          address: lead.email,
          displayName: lead.name ?? lead.email,
        },
      ],
    },
    replyTo: replyToAddress ? [{ address: replyToAddress, displayName: fromDisplayName }] : undefined,
    content: {
      subject,
      html: htmlBody,
      plainText,
    },
    userEngagementTrackingDisabled: false,
  });

  let signedHeaders: Record<string, string>;
  try {
    signedHeaders = await signAcsRequest('POST', acsUrl, emailPayload, acsAccessKey);
  } catch (err) {
    console.error('Failed to sign ACS request:', err);
    return new Response(JSON.stringify({ error: 'Failed to sign request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Send the email via ACS REST API
  const acsResponse = await fetch(acsUrl.toString(), {
    method: 'POST',
    headers: signedHeaders,
    body: emailPayload,
  });

  if (!acsResponse.ok) {
    const errBody = await acsResponse.text();
    console.error(`ACS email send failed [${acsResponse.status}]: ${errBody}`);
    return new Response(
      JSON.stringify({ error: 'Email delivery failed', status: acsResponse.status }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // ACS returns 202 Accepted with an operation-location header for async tracking
  const operationLocation = acsResponse.headers.get('operation-location') ?? null;
  console.info(`Nurture email queued for ${lead.email} | operation: ${operationLocation}`);

  return new Response(
    JSON.stringify({ success: true, recipient: lead.email, operationLocation }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
});

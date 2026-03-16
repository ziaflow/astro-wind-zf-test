/**
 * Supabase Edge Function: lead-nurture-email
 *
 * Triggered automatically by the `on_lead_created` Postgres trigger whenever
 * a new row is inserted into `public.leads`.  It sends a personalised nurture
 * email to the lead using the SMTP credentials stored in Supabase secrets.
 *
 * Required Supabase secrets (set via `supabase secrets set KEY=value`):
 *   SMTP_HOST      – SMTP server hostname
 *   SMTP_PORT      – SMTP port (default 587)
 *   SMTP_SECURE    – "true" for TLS, "false" for STARTTLS
 *   SMTP_USER      – SMTP username / sender address
 *   SMTP_PASS      – SMTP password
 *   SMTP_FROM      – From address shown to the recipient (e.g. hello@ziaflow.com)
 *   MAIL_TO        – Internal notification address (e.g. sales@ziaflow.com)
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts';

interface LeadRecord {
  id: string;
  created_at: string;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  phone?: string | null;
  company_name?: string | null;
  source?: string | null;
  metadata?: Record<string, unknown> | null;
}

interface RequestBody {
  record: LeadRecord;
}

serve(async (req: Request) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const lead = body?.record;
  if (!lead?.email) {
    return new Response(JSON.stringify({ error: 'Missing lead record or email' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const smtpHost = Deno.env.get('SMTP_HOST') ?? '';
  const smtpPort = Number(Deno.env.get('SMTP_PORT') ?? 587);
  const smtpSecure = Deno.env.get('SMTP_SECURE') === 'true';
  const smtpUser = Deno.env.get('SMTP_USER') ?? '';
  const smtpPass = Deno.env.get('SMTP_PASS') ?? '';
  const smtpFrom = Deno.env.get('SMTP_FROM') ?? smtpUser;
  const mailTo = Deno.env.get('MAIL_TO') ?? '';

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.error('lead-nurture-email: SMTP environment variables are not configured.');
    return new Response(JSON.stringify({ error: 'SMTP not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const firstName = lead.first_name ?? '';
  const lastName = lead.last_name ?? '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || lead.email;
  const company = lead.company_name ? ` from ${lead.company_name}` : '';

  const leadNurtureHtml = `
    <h2>Hi ${firstName || 'there'},</h2>
    <p>Thanks for reaching out to <strong>ZiaFlow</strong>! We received your information and a member of our team will be in touch shortly.</p>
    <p>In the meantime, here are a few resources that might be helpful:</p>
    <ul>
      <li><a href="https://ziaflow.com/services">Our Services</a></li>
      <li><a href="https://ziaflow.com/blog">Latest Insights</a></li>
      <li><a href="https://outlook.office.com/book/ZiaFlowIntake@ziaflow.com/">Book a Free Consultation</a></li>
    </ul>
    <p>We look forward to connecting with you!</p>
    <p>— The ZiaFlow Team</p>
  `;

  const internalNotificationHtml = `
    <h3>New Lead: ${fullName}${company}</h3>
    <p><strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a></p>
    <p><strong>Phone:</strong> ${lead.phone ?? 'N/A'}</p>
    <p><strong>Company:</strong> ${lead.company_name ?? 'N/A'}</p>
    <p><strong>Source:</strong> ${lead.source ?? 'N/A'}</p>
    <p><strong>Lead ID:</strong> ${lead.id}</p>
    <p><strong>Created:</strong> ${lead.created_at}</p>
    ${lead.metadata ? `<p><strong>Metadata:</strong><br/><pre>${JSON.stringify(lead.metadata, null, 2)}</pre></p>` : ''}
  `;

  const client = new SmtpClient();

  try {
    const connectConfig = { hostname: smtpHost, port: smtpPort, username: smtpUser, password: smtpPass };

    if (smtpSecure) {
      await client.connectTLS(connectConfig);
    } else {
      await client.connect(connectConfig);
    }

    // 1. Send nurture email to the lead
    await client.send({
      from: smtpFrom,
      to: lead.email,
      subject: "We've received your information — ZiaFlow",
      html: leadNurtureHtml,
      content: `Hi ${firstName || 'there'},\n\nThanks for reaching out to ZiaFlow! A member of our team will be in touch shortly.\n\nBook a free consultation: https://outlook.office.com/book/ZiaFlowIntake@ziaflow.com/\n\n— The ZiaFlow Team`,
    });

    // 2. Send internal notification to sales team (if configured)
    if (mailTo) {
      await client.send({
        from: smtpFrom,
        to: mailTo,
        subject: `New Lead: ${fullName}${company}`,
        html: internalNotificationHtml,
        content: `New lead received:\nName: ${fullName}\nEmail: ${lead.email}\nPhone: ${lead.phone ?? 'N/A'}\nCompany: ${lead.company_name ?? 'N/A'}\nSource: ${lead.source ?? 'N/A'}`,
      });
    }

    await client.close();

    console.log(`lead-nurture-email: sent nurture email to ${lead.email} (lead ${lead.id})`);

    return new Response(JSON.stringify({ success: true, leadId: lead.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('lead-nurture-email: failed to send email', err);
    try {
      await client.close();
    } catch (closeErr) {
      console.warn('lead-nurture-email: error closing SMTP connection', closeErr);
    }
    return new Response(JSON.stringify({ error: 'Failed to send email', detail: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

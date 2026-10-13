import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { getLeadNotificationHtml, getCustomerReceiptHtml } from '~/lib/forms/emailTemplates';

export const prerender = false;

interface ContactPayload {
  form_type?: string;
  name?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  service_needed?: string;
  comments?: string;
  page_submitted_from?: string;
}

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ ok: true, status: 'healthy', timestamp: new Date().toISOString() }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    let data: ContactPayload = {};
    const rawBody = await request.text();
    if (rawBody) {
      try {
        data = JSON.parse(rawBody) as ContactPayload;
      } catch {
        return new Response(JSON.stringify({ ok: false, error: 'invalid_json' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    const { form_type, name, email, phone, company_name, service_needed, comments, page_submitted_from } = data;

    if (!name || !email || typeof name !== 'string' || typeof email !== 'string') {
      return new Response(JSON.stringify({ ok: false, error: 'bad_request' }), { status: 400 });
    }

    // 1. Initialize Supabase Client
    const supabaseUrl =
      import.meta.env.SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseKey =
      import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      import.meta.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SECRET_KEY ||
      import.meta.env.SUPABASE_KEY ||
      process.env.SUPABASE_KEY ||
      import.meta.env.SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        // 2. Insert record into Supabase leads table
        const { error: dbError } = await supabase.from('leads').insert([
          {
            name,
            email,
            phone: phone || null,
            company_name: company_name || null,
            service_needed: service_needed || null,
            comments: comments || null,
            page_submitted_from: page_submitted_from || 'Unknown',
            status: 'new',
          },
        ]);

        if (dbError) {
          console.error('Supabase Insert Error:', dbError);
        }
      } catch (dbEx) {
        console.error('Supabase Client Error:', dbEx);
      }
    }

    // 2.5 Forward to Google Apps Script / Google Sheets
    const gasUrl = import.meta.env.GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL;
    const gasSecret = import.meta.env.GOOGLE_SCRIPT_SECRET || process.env.GOOGLE_SCRIPT_SECRET;
    if (gasUrl && gasSecret) {
      try {
        await fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: gasSecret,
            submissionId: crypto.randomUUID(),
            tab: form_type === 'contact_us' ? 'Contact Page' : 'Home Page',
            columns: [
              { header: 'Full Name', value: name },
              { header: 'Email', value: email },
              { header: 'Phone', value: phone || '' },
              { header: 'Company', value: company_name || '' },
              {
                header: 'Inquiry Type',
                value: service_needed || (form_type === 'contact_us' ? 'Detailed Inquiry' : 'Quick Lead'),
              },
              { header: 'Message', value: comments || '' },
              { header: 'Page', value: page_submitted_from || '/' },
            ],
          }),
        });
      } catch (gasErr) {
        console.error('Google Apps Script forward error:', gasErr);
      }
    }

    // 3. Email Notification via Resend (Primary) or SMTP (Fallback)
    const resendApiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
    const toEmail = import.meta.env.SMTP_TO || process.env.SMTP_TO || 'info@ziaflow.com';
    const fallbackFromEmail = import.meta.env.SMTP_FROM || process.env.SMTP_FROM || 'info@ziaflow.com';
    const subjectPrefix = form_type === 'contact_us' ? 'Detailed Inquiry (Contact Us)' : 'Quick Lead';
    const subjectTitle = `${subjectPrefix}: ${company_name ? company_name + ' (' + name + ')' : name}`;

    const leadData = {
      form_type,
      name: name || 'Valued Contact',
      email: email || '',
      phone: phone || '',
      company_name: company_name || '',
      service_needed: service_needed || '',
      page_submitted_from: page_submitted_from || '/contact',
      comments: comments || '',
    };

    let emailSentViaResend = false;

    if (resendApiKey) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(resendApiKey);

        // Send team lead alert
        await resend.emails.send({
          from: 'ZiaFlow Leads <onboarding@resend.dev>',
          to: toEmail,
          replyTo: email || undefined,
          subject: subjectTitle,
          html: getLeadNotificationHtml(leadData),
        });

        // Send user confirmation receipt if valid email
        if (email && email.includes('@')) {
          await resend.emails.send({
            from: 'ZiaFlow <onboarding@resend.dev>',
            to: email,
            subject: 'We have received your project details — ZiaFlow',
            html: getCustomerReceiptHtml(leadData),
          });
        }
        emailSentViaResend = true;
      } catch (resendErr) {
        console.error('Resend API Email Error:', resendErr);
      }
    }

    // Fallback to SMTP if Resend is not configured or failed
    if (!emailSentViaResend) {
      const smtpUser = import.meta.env.SMTP_USER || process.env.SMTP_USER;
      const smtpPass = import.meta.env.SMTP_PASS || process.env.SMTP_PASS;
      if (smtpUser && smtpPass) {
        try {
          const transporter = nodemailer.createTransport({
            host: import.meta.env.SMTP_HOST || process.env.SMTP_HOST || 'smtp-mail.outlook.com',
            port: Number(import.meta.env.SMTP_PORT || process.env.SMTP_PORT || 587),
            secure: (import.meta.env.SMTP_SECURE || process.env.SMTP_SECURE) === 'true',
            auth: { user: smtpUser, pass: smtpPass },
          });

          await transporter.sendMail({
            from: `"ZiaFlow System" <${fallbackFromEmail}>`,
            to: toEmail,
            replyTo: email,
            subject: subjectTitle,
            html: getLeadNotificationHtml(leadData),
          });

          if (email && email.includes('@')) {
            await transporter.sendMail({
              from: `"ZiaFlow" <${fallbackFromEmail}>`,
              to: email,
              subject: 'We have received your project details — ZiaFlow',
              html: getCustomerReceiptHtml(leadData),
            });
          }
        } catch (smtpErr) {
          console.error('SMTP Email Error:', smtpErr);
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Contact Form Endpoint Error:', error);
    return new Response(JSON.stringify({ ok: false, error: 'server_error', details: errorMsg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

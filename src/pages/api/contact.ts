import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

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
    const supabaseUrl = import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey =
      import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      import.meta.env.SUPABASE_KEY ||
      process.env.SUPABASE_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        // 2. Insert record into Supabase leads table
        const { error: dbError } = await supabase.from('leads').insert([
          {
            form_type: form_type || 'quick',
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

    // 3. Configure Outlook / SMTP Transporter
    const smtpUser = import.meta.env.SMTP_USER || process.env.SMTP_USER;
    const smtpPass = import.meta.env.SMTP_PASS || process.env.SMTP_PASS;
    if (smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: import.meta.env.SMTP_HOST || process.env.SMTP_HOST || 'smtp-mail.outlook.com',
          port: Number(import.meta.env.SMTP_PORT || process.env.SMTP_PORT || 587),
          secure: (import.meta.env.SMTP_SECURE || process.env.SMTP_SECURE) === 'true',
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        // 4. Send Rich Notification to Team
        const subjectPrefix = form_type === 'contact_us' ? 'Detailed Inquiry (Contact Us)' : 'Quick Lead';
        const fromEmail = import.meta.env.SMTP_FROM || process.env.SMTP_FROM || 'info@ziaflow.com';
        const toEmail = import.meta.env.SMTP_TO || process.env.SMTP_TO || 'info@ziaflow.com';

        await transporter.sendMail({
          from: `"ZiaFlow System" <${fromEmail}>`,
          to: toEmail,
          replyTo: email,
          subject: `${subjectPrefix}: ${company_name ? company_name + ' (' + name + ')' : name}`,
          text:
            `New submission from page: ${page_submitted_from}\n\n` +
            `• Form Type: ${form_type}\n` +
            `• Name: ${name}\n` +
            `• Email: ${email}\n` +
            `• Phone: ${phone || 'Not provided'}\n` +
            `• Company: ${company_name || 'Not provided'}\n` +
            `• Service Needed: ${service_needed || 'N/A (Quick Form)'}\n` +
            `• Comments: ${comments || 'None'}\n`,
        });

        // 5. Send Confirmation Receipt to User
        await transporter.sendMail({
          from: `"ZiaFlow" <${fromEmail}>`,
          to: email,
          subject: 'We have received your project details — ZiaFlow',
          text: `Hi ${name},\n\nThank you for reaching out to ZiaFlow. We have successfully received your details and our technical team will review them shortly.\n\nBest regards,\nThe ZiaFlow Team`,
        });
      } catch (smtpErr) {
        console.error('SMTP Email Error:', smtpErr);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Contact Form Endpoint Error:', error);
    return new Response(JSON.stringify({ ok: false, error: 'server_error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

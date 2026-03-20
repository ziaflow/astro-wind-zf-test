import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { supabase } from '~/lib/supabase';

// Read once at module load time so the values are cached across requests.
const SUPABASE_URL = import.meta.env.SUPABASE_URL as string | undefined;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;

/**
 * Invokes the `lead-nurture-email` Supabase Edge Function so Azure sends the
 * prospect a nurture email and the internal team an alert.
 * Failures are logged but do not block the HTTP response.
 */
async function triggerLeadNurtureEmail(lead: {
  name?: string;
  email: string;
  phone?: string;
  message?: string;
  company_name?: string;
  [key: string]: unknown;
}): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('triggerLeadNurtureEmail: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — skipping.');
    return;
  }

  const url = `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1/lead-nurture-email`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(lead),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`lead-nurture-email function responded ${res.status}: ${text}`);
    } else {
      const json = await res.json();
      console.log('lead-nurture-email triggered:', json);
    }
  } catch (err) {
    console.error('Failed to invoke lead-nurture-email Edge Function:', err);
  }
}

export const POST: APIRoute = async ({ request }) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405 });
  }

  try {
    const data = await request.json();
    const { name, email, message, phone, ...otherData } = data;

    // Validate required fields
    if (!email) {
      return new Response(JSON.stringify({ message: 'Email is required' }), { status: 400 });
    }

    // Save to Supabase if configured
    if (supabase) {
      const { error: dbError } = await supabase.from('contact_submissions').insert([
        {
          name,
          email,
          phone,
          message,
          metadata: otherData,
        },
      ]);

      if (dbError) {
        console.error('Supabase DB Error:', dbError);
        // We don't stop execution here so email can still attempt to send
      }

      // Trigger lead-nurture-email Edge Function (Azure Email)
      await triggerLeadNurtureEmail({ name, email, phone, message, ...otherData });
    }

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
      subject: `Contact Form Submission from ${name || email}`,
      text: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone || 'N/A'}
        
        Message:
        ${message}
        
        --
        Additional Info:
        ${JSON.stringify(otherData, null, 2)}
      `,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <br/>
        <p><strong>Message:</strong></p>
        <p>${(message || '').replace(/\n/g, '<br/>')}</p>
        <hr/>
        <p><small>Additional Info:<br/>${JSON.stringify(otherData, null, 2)}</small></p>
      `,
    });

    return new Response(JSON.stringify({ message: 'Message sent successfully' }), { status: 200 });
  } catch (error) {
    console.error('Contact Form Error:', error);
    return new Response(
      JSON.stringify({
        message: 'Failed to send message',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 }
    );
  }
};

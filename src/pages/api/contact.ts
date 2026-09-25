import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { supabase } from '~/lib/supabase';

/** HTML-escape user-controlled strings before interpolating into email markup. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Basic email format check. */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const MAX_NAME_LENGTH = 200;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 30;
const MAX_MESSAGE_LENGTH = 5000;

export const POST: APIRoute = async ({ request }) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405 });
  }

  try {
    const data = await request.json();
    const { name, email, message, phone, ...otherData } = data;

    // Honeypot — if a hidden field is filled, silently accept but do nothing
    if (data._hp_company) {
      return new Response(JSON.stringify({ message: 'Message sent successfully' }), { status: 200 });
    }

    // Validate required fields
    if (!email) {
      return new Response(JSON.stringify({ message: 'Email is required' }), { status: 400 });
    }

    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ message: 'Invalid email format' }), { status: 400 });
    }

    // Enforce maximum field lengths
    if (name && name.length > MAX_NAME_LENGTH) {
      return new Response(JSON.stringify({ message: 'Name is too long' }), { status: 400 });
    }
    if (email.length > MAX_EMAIL_LENGTH) {
      return new Response(JSON.stringify({ message: 'Email is too long' }), { status: 400 });
    }
    if (phone && phone.length > MAX_PHONE_LENGTH) {
      return new Response(JSON.stringify({ message: 'Phone number is too long' }), { status: 400 });
    }
    if (message && message.length > MAX_MESSAGE_LENGTH) {
      return new Response(JSON.stringify({ message: 'Message is too long' }), { status: 400 });
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

    // Escape all user-controlled values before inserting into HTML
    const safeName = escapeHtml(name || '');
    const safeEmail = escapeHtml(email || '');
    const safePhone = escapeHtml(phone || 'N/A');
    const safeMessage = escapeHtml(message || '').replace(/\n/g, '<br/>');

    await transporter.sendMail({
      from: import.meta.env.SMTP_FROM || import.meta.env.SMTP_USER || 'no-reply@ziaflow.com',
      to: import.meta.env.SMTP_TO || 'info@ziaflow.com',
      replyTo: email,
      subject: `Contact Form Submission from ${safeName || safeEmail}`,
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
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
        <p><strong>Phone:</strong> ${safePhone}</p>
        <br/>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
        <hr/>
        <p><small>Additional Info:<br/>${escapeHtml(JSON.stringify(otherData, null, 2))}</small></p>
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


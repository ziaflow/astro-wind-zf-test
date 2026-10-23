import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { supabase } from '~/lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405 });
  }

  try {
    let data: Record<string, unknown> = {};
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const text = await request.text();
      data = text ? JSON.parse(text) : {};
    } else if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
    } else {
      const text = await request.text();
      data = text ? JSON.parse(text) : {};
    }

    const name = typeof data.name === 'string' ? data.name : undefined;
    const email = typeof data.email === 'string' ? data.email : '';
    const message = typeof data.message === 'string' ? data.message : '';
    const phone = typeof data.phone === 'string' ? data.phone : undefined;
    const company = typeof data.company === 'string' ? data.company : undefined;
    const serviceInterest =
      typeof data.service_interest === 'string'
        ? data.service_interest
        : typeof data.service_needed === 'string'
          ? data.service_needed
          : undefined;
    const otherData = { ...data };
    delete otherData.name;
    delete otherData.email;
    delete otherData.message;
    delete otherData.phone;
    delete otherData.company;
    delete otherData.service_interest;

    // Validate required fields
    if (!email) {
      return new Response(JSON.stringify({ message: 'Email is required' }), { status: 400 });
    }

    // Save to Supabase leads and contact_submissions if configured
    if (supabase) {
      // 1. Write to leads table
      try {
        await supabase.from('leads').insert([
          {
            name: name || null,
            email,
            phone: phone || null,
            company_name: company || otherData.company_name || null,
            service_needed: serviceInterest || otherData.service_needed || 'Contact Inquiry',
            comments: message || null,
            page_submitted_from: otherData.page || '/contact',
            status: 'new',
            score: 10,
          },
        ]);
      } catch (leadErr) {
        console.warn('Supabase leads insert note:', leadErr);
      }

      // 2. Write to contact_submissions table
      try {
        await supabase.from('contact_submissions').insert([
          {
            form_id: 'contact-form',
            payload: { name, email, phone, company, message },
            metadata: otherData,
            status: 'new',
          },
        ]);
      } catch (subErr) {
        console.warn('Supabase contact_submissions insert note:', subErr);
      }
    }

    if (import.meta.env.SMTP_HOST && import.meta.env.SMTP_USER) {
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
      } catch (mailErr) {
        console.warn('SMTP Notification note (lead saved to database):', mailErr);
      }
    }

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

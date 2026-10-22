import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

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

    const supabaseUrl = process.env.SUPABASE_URL || import.meta.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ message: 'Contact intake is temporarily unavailable. Please call us.' }, { status: 503 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || message.length > 10000) {
      return Response.json({ message: 'Please check your email and message.' }, { status: 400 });
    }
    const submittedId = data.submission_id;
    const submissionId =
      typeof submittedId === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(submittedId)
        ? submittedId
        : crypto.randomUUID();
    let sourcePage = '/contact';
    try {
      const sourceUrl = new URL(String(data.page_url || data.page || '/contact'), 'https://ziaflow.com');
      if (['ziaflow.com', 'www.ziaflow.com'].includes(sourceUrl.hostname)) sourcePage = sourceUrl.pathname;
    } catch {
      // Keep the known contact route when an invalid source is supplied.
    }
    const isTest = Boolean(name?.startsWith('ZIAFLOW QA')) || process.env.VERCEL_ENV === 'preview';
    const saved = await fetch(supabaseUrl.replace(/\/$/, '') + '/rest/v1/rpc/record_website_contact', {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: 'Bearer ' + supabaseKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_id: submissionId,
        p_payload: { name, email, phone, company, message, service_interest: serviceInterest },
        p_metadata: {
          source_page: sourcePage,
          is_test: isTest,
          utm_source: typeof data.utm_source === 'string' ? data.utm_source.slice(0, 200) : null,
          utm_medium: typeof data.utm_medium === 'string' ? data.utm_medium.slice(0, 200) : null,
          utm_campaign: typeof data.utm_campaign === 'string' ? data.utm_campaign.slice(0, 200) : null,
        },
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!saved.ok) {
      console.error('Contact persistence failed', { status: saved.status });
      return Response.json(
        { message: 'We could not save your inquiry. Please try again or call us.' },
        { status: 502 }
      );
    }

    if (!isTest && import.meta.env.SMTP_HOST && import.meta.env.SMTP_USER) {
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

    return new Response(JSON.stringify({ message: 'Message sent successfully', submission_id: submissionId }), {
      status: 200,
    });
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

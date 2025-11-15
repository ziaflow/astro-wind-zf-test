/**
 * API Route: POST /_api/forms/audit
 * Handles audit booking form submissions
 * Sends confirmation email and fires conversion event
 */

import type { APIRoute } from 'astro';

interface AuditBookingPayload {
  form_type: string;
  from_email: string;
  first_name: string;
  last_name: string;
  company_name: string;
  email: string;
  phone: string;
  message?: string;
}

export const POST: APIRoute = async ({ request }) => {
  // Verify POST method
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload: AuditBookingPayload = await request.json();

    // Basic validation
    if (!payload.first_name || !payload.last_name || !payload.email || !payload.phone || !payload.company_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // TODO: Implement email sending (SendGrid, Mailgun, AWS SES, or similar)
    // For now, log the submission and return success
    console.log('Audit booking submission:', {
      timestamp: new Date().toISOString(),
      ...payload,
    });

    // TODO: Send confirmation email to user
    // await sendEmail({
    //   to: payload.email,
    //   from: payload.from_email,
    //   subject: 'Hello from ZiaFlow! Your Free Growth Audit',
    //   html: generateAuditConfirmationEmail(payload),
    // });

    // TODO: Send notification to admin/sales team
    // await sendEmail({
    //   to: 'sales@ziaflow.com',
    //   from: payload.from_email,
    //   subject: `New Audit Booking: ${payload.company_name}`,
    //   html: generateAdminNotificationEmail(payload),
    // });

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Audit booking received. Check your email for next steps.',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Form submission error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

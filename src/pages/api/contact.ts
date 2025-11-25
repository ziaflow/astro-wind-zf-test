import type { APIRoute } from 'astro';
import { sendEmail, formatContactFormEmail } from '../../utils/mailer';

// Enable server-side rendering for this endpoint
export const prerender = false;

/**
 * API endpoint for handling contact form submissions via Nodemailer
 * 
 * POST /api/contact
 * Body: JSON with form fields (name, email, message, etc.)
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse the JSON body
    const contentType = request.headers.get('content-type');
    let data;
    
    if (contentType?.includes('application/json')) {
      data = await request.json();
    } else {
      // Handle form-encoded data
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
    }

    // Basic validation
    if (!data.email || !data.name) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Name and email are required fields.' 
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check for bot submissions
    if (data.botcheck) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bot detected.' 
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Format the email
    const htmlContent = formatContactFormEmail(data);
    const subject = data.subject || import.meta.env.CONTACT_FORM_SUBJECT || 'New Contact Form Submission';
    const to = import.meta.env.SMTP_TO || import.meta.env.SMTP_FROM;

    // Send the email
    await sendEmail({
      to,
      subject,
      html: htmlContent,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Thank you for your message. We will get back to you soon!' 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Contact form submission error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Something went wrong. Please try again later or contact us directly.' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

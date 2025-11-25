import nodemailer from 'nodemailer';

/**
 * Email sending utility using Nodemailer
 * Configured via environment variables
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

/**
 * Create and return a configured Nodemailer transporter
 */
function createTransporter() {
  const config = {
    host: import.meta.env.SMTP_HOST,
    port: Number(import.meta.env.SMTP_PORT || 587),
    secure: import.meta.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: import.meta.env.SMTP_USER,
      pass: import.meta.env.SMTP_PASS,
    },
    // Explicit TLS configuration for Outlook/Office 365
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false,
    },
    // Enable debug logging
    debug: true,
    logger: true,
  };

  // Validate configuration
  if (!config.host || !config.auth.user || !config.auth.pass) {
    throw new Error('SMTP configuration is incomplete. Check your environment variables.');
  }

  console.log('Creating SMTP transporter with config:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user,
  });

  return nodemailer.createTransport(config);
}

/**
 * Send an email using the configured SMTP server
 * 
 * @param options Email options (to, subject, html, etc.)
 * @returns Promise with the send result
 */
export async function sendEmail(options: EmailOptions) {
  const transporter = createTransporter();
  
  // Use SMTP_USER (authenticated account) as the from address to avoid Outlook rejection
  const fromAddress = options.from || import.meta.env.SMTP_USER;
  
  const mailOptions = {
    from: fromAddress,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    // Add reply-to if different from sender
    replyTo: import.meta.env.SMTP_FROM || fromAddress,
  };

  console.log('Sending email with options:', {
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
  });

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send failed:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
}

/**
 * Format contact form data as HTML email
 */
export function formatContactFormEmail(data: Record<string, string>): string {
  const fields = Object.entries(data)
    .filter(([key]) => key !== 'access_key' && key !== 'botcheck' && key !== 'subject' && key !== 'from_name')
    .map(([key, value]) => {
      const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
      return `<p><strong>${label}:</strong> ${value}</p>`;
    })
    .join('\n');

  return `
    <h2>New Contact Form Submission</h2>
    ${fields}
    <hr>
    <p style="color: #666; font-size: 12px;">Sent from ZiaFlow contact form</p>
  `;
}

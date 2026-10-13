/**
 * Responsive HTML Email Templates for ZiaFlow
 */

export interface LeadEmailData {
  form_type?: string;
  name: string;
  email: string;
  phone?: string;
  company_name?: string;
  service_needed?: string;
  page_submitted_from?: string;
  comments?: string;
  submission_id?: string;
}

/**
 * Lead Notification Template (Sent to team)
 */
export function getLeadNotificationHtml(data: LeadEmailData): string {
  const formType = data.form_type || 'Contact Inquiry';
  const name = data.name || 'Not provided';
  const email = data.email || 'Not provided';
  const phone = data.phone || 'Not provided';
  const company = data.company_name || 'Not provided';
  const service = data.service_needed || 'General Inquiry';
  const page = data.page_submitted_from || '/contact';
  const comments = data.comments || 'None';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Form Submission</title>
</head>
<body style="margin: 0; padding: 24px 10px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <center style="width: 100%; table-layout: fixed;">
    <div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <table align="center" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; border-spacing: 0;" role="presentation">
        <tr>
          <td style="background-color: #0f172a; padding: 24px 32px; border-bottom: 3px solid #6366f1;">
            <table style="width: 100%; border-spacing: 0;" role="presentation">
              <tr>
                <td>
                  <span style="font-size: 18px; font-weight: 700; color: #ffffff;">⚡ New Form Submission</span>
                </td>
                <td style="text-align: right;">
                  <span style="background-color: #312e81; color: #a5b4fc; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 8px; border-radius: 4px; letter-spacing: 0.5px;">
                    ${escapeHtml(formType)}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding: 32px;">
            <table style="width: 100%; font-size: 14px; border-collapse: collapse; border-spacing: 0;" role="presentation">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 600; width: 35%;">Name:</td>
                <td style="padding: 10px 0; color: #0f172a; font-weight: 700;">${escapeHtml(name)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Email:</td>
                <td style="padding: 10px 0;">
                  <a href="mailto:${encodeURIComponent(email)}" style="color: #4f46e5; text-decoration: none; font-weight: 600;">${escapeHtml(email)}</a>
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Phone:</td>
                <td style="padding: 10px 0; color: #0f172a;">${escapeHtml(phone)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Company:</td>
                <td style="padding: 10px 0; color: #0f172a;">${escapeHtml(company)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Service Needed:</td>
                <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${escapeHtml(service)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Source Page:</td>
                <td style="padding: 10px 0; color: #64748b; font-family: monospace; font-size: 13px;">${escapeHtml(page)}</td>
              </tr>
            </table>

            <div style="margin-top: 24px; padding: 16px; background-color: #f8fafc; border-left: 4px solid #6366f1; border-radius: 4px;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Message / Comments:</p>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">${escapeHtml(comments)}</p>
            </div>

            <div style="margin-top: 28px; text-align: center;">
              <a href="mailto:${encodeURIComponent(email)}?subject=Re:%20ZiaFlow%20Inquiry" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 10px 22px; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 6px;">
                Reply directly to ${escapeHtml(name)} &rarr;
              </a>
            </div>
          </td>
        </tr>
      </table>
    </div>
  </center>
</body>
</html>`;
}

/**
 * Customer Confirmation Template (Sent to submitter)
 */
export function getCustomerReceiptHtml(data: LeadEmailData): string {
  const name = data.name || 'there';
  const company = data.company_name || 'Not provided';
  const service = data.service_needed || 'Enterprise Solutions';
  const email = data.email || '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank you for contacting ZiaFlow</title>
</head>
<body style="margin: 0; padding: 24px 10px; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <center style="width: 100%; table-layout: fixed;">
    <div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <table align="center" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.25); border-spacing: 0;" role="presentation">
        <tr>
          <td style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 32px 36px; text-align: left;">
            <table style="width: 100%; border-spacing: 0;" role="presentation">
              <tr>
                <td>
                  <span style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                    Zia<span style="color: #6366f1;">Flow</span>
                  </span>
                </td>
                <td style="text-align: right;">
                  <span style="display: inline-block; background-color: rgba(99, 102, 241, 0.2); border: 1px solid rgba(99, 102, 241, 0.4); color: #c7d2fe; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 9999px;">
                    Inquiry Received
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding: 36px 36px 28px 36px;">
            <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3;">
              We've received your request
            </h1>
            <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #475569;">
              Hello ${escapeHtml(name)},
            </p>
            <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
              Thank you for reaching out to <strong>ZiaFlow</strong>. Our team has received your project details and is currently reviewing your inquiry. We typically respond within 1 business day.
            </p>

            <table style="width: 100%; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px; border-spacing: 0;" role="presentation">
              <tr>
                <td style="padding: 18px 20px;">
                  <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">
                    Inquiry Summary
                  </p>
                  <table style="width: 100%; font-size: 14px; line-height: 1.6; border-spacing: 0;" role="presentation">
                    <tr>
                      <td style="width: 35%; color: #64748b; padding-bottom: 6px;">Service:</td>
                      <td style="color: #0f172a; font-weight: 600; padding-bottom: 6px;">${escapeHtml(service)}</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; padding-bottom: 6px;">Email:</td>
                      <td style="color: #0f172a; padding-bottom: 6px;">${escapeHtml(email)}</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b;">Company:</td>
                      <td style="color: #0f172a;">${escapeHtml(company)}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #64748b;">
              Have an urgent request? Reply directly to this email or contact us at <a href="mailto:info@ziaflow.com" style="color: #4f46e5; text-decoration: none; font-weight: 500;">info@ziaflow.com</a>.
            </p>

            <table role="presentation" style="border-spacing: 0;">
              <tr>
                <td style="border-radius: 6px; background-color: #4f46e5;">
                  <a href="https://ziaflow.com" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px;">
                    Visit ZiaFlow.com &rarr;
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="background-color: #f1f5f9; padding: 20px 36px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0 0 4px 0; font-size: 13px; color: #64748b;">
              &copy; 2026 ZiaFlow, LLC. All rights reserved.
            </p>
            <p style="margin: 0; font-size: 12px; color: #94a3b8;">
              Enterprise Workflow Automation & AI Systems
            </p>
          </td>
        </tr>
      </table>
    </div>
  </center>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

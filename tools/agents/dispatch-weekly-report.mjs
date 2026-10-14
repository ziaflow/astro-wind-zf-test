import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const supabaseUrl = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

const toEmail = process.env.MAIL_TO || process.env.CONTACT_NOTIFICATION_EMAIL || 'admin@ziaflow.com';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function generateAndSendWeeklyReport() {
  console.log('📊 Gathering telemetry for Weekly Performance Report...');

  const { data: unified, error: errUnified } = await supabase
    .from('view_unified_page_intelligence')
    .select('*')
    .order('date', { ascending: false })
    .limit(20);

  const { data: leads, error: errLeads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  const { data: clarity, error: errClarity } = await supabase
    .from('metrics_clarity_daily')
    .select('*')
    .order('date', { ascending: false })
    .limit(10);

  const totalLeads = leads?.length || 0;
  const totalClicks = unified?.reduce((acc, r) => acc + (r.google_clicks || 0), 0) || 0;
  const totalSessions = unified?.reduce((acc, r) => acc + (r.ga_sessions || 0), 0) || 0;
  const deadClicks = clarity?.reduce((acc, r) => acc + (r.dead_clicks || 0), 0) || 0;

  const emailHtml = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; color: #1e293b;">
    <div style="border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px;">
      <h1 style="color: #0f172a; margin: 0; font-size: 24px;">ZiaFlow Weekly Performance Report</h1>
      <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Automated Intelligence Digest & Telemetry Summary</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr>
        <td style="padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">New Leads</div>
          <div style="font-size: 28px; font-weight: bold; color: #0f172a;">${totalLeads}</div>
        </td>
        <td style="width: 12px;"></td>
        <td style="padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Google Clicks</div>
          <div style="font-size: 28px; font-weight: bold; color: #0f172a;">${totalClicks}</div>
        </td>
        <td style="width: 12px;"></td>
        <td style="padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">GA4 Sessions</div>
          <div style="font-size: 28px; font-weight: bold; color: #0f172a;">${totalSessions}</div>
        </td>
        <td style="width: 12px;"></td>
        <td style="padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Friction (Dead Clicks)</div>
          <div style="font-size: 28px; font-weight: bold; color: ${deadClicks > 5 ? '#e11d48' : '#059669'};">${deadClicks}</div>
        </td>
      </tr>
    </table>

    <h3 style="font-size: 16px; color: #0f172a; margin-bottom: 8px;">Top Active Landing Pages</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
      <thead>
        <tr style="background: #f1f5f9; text-align: left;">
          <th style="padding: 8px; border: 1px solid #cbd5e1;">Path</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1;">GSC Clicks</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1;">GA4 Sessions</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1;">Signal</th>
        </tr>
      </thead>
      <tbody>
        ${(unified || []).slice(0, 6).map(row => `
          <tr>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${row.page_path}</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${row.google_clicks ?? 0}</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${row.ga_sessions ?? 0}</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${row.agent_health_signal || 'Healthy'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; font-size: 13px; color: #1e40af;">
      <strong>Agent Recommendations:</strong>
      <ul style="margin: 4px 0 0 0; padding-left: 20px;">
        <li>Review dead clicks recorded in Clarity to optimize click targets on mobile.</li>
        <li>Syndicate striking-distance keywords identified in Google Search Console via Sanity.</li>
        <li>View full real-time interactive dashboard at <a href="https://ziaflow.com/admin/analytics" style="color: #0284c7;">ziaflow.com/admin/analytics</a>.</li>
      </ul>
    </div>
  </div>
  `;

  console.log(`📧 Preparing to send report to: ${toEmail}`);

  // 1. Try Resend
  let sent = false;
  if (resend) {
    try {
      const res = await resend.emails.send({
        from: 'ZiaFlow Intelligence <onboarding@resend.dev>',
        to: toEmail,
        subject: `Weekly Performance Report — ZiaFlow [${new Date().toISOString().split('T')[0]}]`,
        html: emailHtml,
      });
      if (res?.data?.id) {
        console.log(`✅ Weekly report successfully sent via Resend! ID: ${res.data.id}`);
        sent = true;
      }
    } catch (e) {
      console.warn('Resend send notice:', e.message);
    }
  }

  // 2. Fallback to Nodemailer / SMTP
  if (!sent && process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"ZiaFlow Intelligence" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: `Weekly Performance Report — ZiaFlow [${new Date().toISOString().split('T')[0]}]`,
        html: emailHtml,
      });
      console.log(`✅ Weekly report sent successfully via SMTP to ${toEmail}`);
      sent = true;
    } catch (smtpErr) {
      console.warn('SMTP fallback notice:', smtpErr.message);
    }
  }

  if (!sent) {
    console.log('ℹ️ Email report generated locally (dry run): Ready to deliver when sending credentials are authenticated.');
  }

  return { success: true, leads: totalLeads, clicks: totalClicks, sessions: totalSessions };
}

if (process.argv[1] && process.argv[1].endsWith('dispatch-weekly-report.mjs')) {
  generateAndSendWeeklyReport().then(() => process.exit(0)).catch(console.error);
}

/**
 * Server-only submission pipeline:
 *   Receive → Rate-limit → Validate (allowlist + honeypot + timing + schema)
 *   → Persist (Supabase, then Google Sheet; both idempotent on submissionId)
 *   → Notify internally (failure here never loses the lead).
 *
 * Secrets are read at runtime through `astro:env/server` and never reach the client bundle.
 * Logs contain submission IDs and error codes only — no names, emails, phone numbers or messages.
 */

import { GOOGLE_SCRIPT_SECRET, GOOGLE_SCRIPT_URL, getSecret } from 'astro:env/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

import { INQUIRY_TYPE_LABELS, type InquiryType } from './definitions';
import { checkRateLimit } from './rate-limit';
import { validateSubmission, type ValidatedSubmission } from './validation';

export interface RequestMeta {
  clientIp: string;
  userAgent: string;
}

export type SubmissionResult =
  | { ok: true; submissionId: string; message: string; duplicate: boolean }
  | {
      ok: false;
      status: 400 | 429 | 500;
      code: 'unknown_form' | 'invalid' | 'rate_limited' | 'not_configured' | 'persist_failed';
      message: string;
      fieldErrors?: Record<string, string>;
      retryAfterSeconds?: number;
    };

const GENERIC_SUCCESS = 'Thanks! We received your message.';

function log(level: 'info' | 'warn' | 'error', event: string, data: Record<string, unknown> = {}) {
  console[level](JSON.stringify({ scope: 'forms', event, ...data }));
}

function errorCode(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as { code?: unknown; name?: unknown };
    if (typeof e.code === 'string') return e.code;
    if (typeof e.name === 'string') return e.name;
  }
  return 'unknown';
}

/* ---------------------------------------------------------------- Supabase */

let supabaseClient: SupabaseClient | null | undefined;

function parseIp(ip: string | undefined): string | null {
  if (!ip || ip === 'unknown') return null;
  return /^([0-9]{1,3}\.){3}[0-9]{1,3}$|^[a-fA-F0-9:]+$/.test(ip) ? ip : null;
}

function getSupabase(): SupabaseClient | null {
  if (supabaseClient !== undefined) return supabaseClient;
  const url = getSecret('SUPABASE_URL');
  const key = getSecret('SUPABASE_SERVICE_ROLE_KEY') || getSecret('SUPABASE_KEY');
  supabaseClient = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return supabaseClient;
}

type PersistOutcome = 'saved' | 'duplicate' | 'skipped' | 'failed';

async function saveToSupabase(
  sub: ValidatedSubmission,
  receivedAt: string,
  meta: RequestMeta
): Promise<PersistOutcome> {
  const supabase = getSupabase();
  if (!supabase) return 'skipped';

  try {
    // Database-level idempotency on PK `id` (client-generated UUID)
    const { data: existing, error: lookupError } = await supabase
      .from('contact_submissions')
      .select('id')
      .eq('id', sub.submissionId)
      .limit(1);
    if (!lookupError && existing && existing.length > 0) return 'duplicate';

    const { error } = await supabase.from('contact_submissions').insert([
      {
        id: sub.submissionId,
        form_id: sub.formId,
        payload: sub.values,
        metadata: {
          utm: sub.attribution,
          page_path: sub.pagePath,
          attachment_name: sub.attachment?.name ?? null,
          client_timed: sub.clientTimed,
          processed_at_edge: receivedAt,
        },
        ip_address: parseIp(meta.clientIp),
        user_agent: meta.userAgent || null,
        status: 'pending',
      },
    ]);

    if (error) {
      // Postgres error 23505 = unique_violation on PK `id`
      if (error.code === '23505') return 'duplicate';
      log('error', 'supabase_insert_failed', { submissionId: sub.submissionId, code: errorCode(error) });
      return 'failed';
    }
    return 'saved';
  } catch (err) {
    log('error', 'supabase_exception', { submissionId: sub.submissionId, code: errorCode(err) });
    return 'failed';
  }
}

async function updateSupabaseStatus(
  submissionId: string,
  status: 'processed' | 'failed',
  errorLog?: string
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    await supabase
      .from('contact_submissions')
      .update({
        status,
        error_log: errorLog ?? null,
      })
      .eq('id', submissionId);
  } catch {
    // Non-blocking status update
  }
}

/* ----------------------------------------------------------- Google Sheets */

interface SheetColumn {
  header: string;
  value: string;
}

function buildSheetColumns(sub: ValidatedSubmission, receivedAt: string, supabase: PersistOutcome): SheetColumn[] {
  const fieldColumns = sub.definition.fields
    .filter((f) => f.type !== 'file')
    .map((f) => {
      const raw = sub.values[f.name] ?? '';
      const value = f.name === 'inquiry_type' ? (INQUIRY_TYPE_LABELS[raw as InquiryType] ?? raw) : raw;
      return { header: f.label, value };
    });

  return [
    { header: 'Submission ID', value: sub.submissionId },
    { header: 'Received At', value: receivedAt },
    { header: 'Form ID', value: sub.formId },
    { header: 'Form Type', value: sub.definition.formType },
    ...fieldColumns,
    { header: 'Page', value: sub.pagePath },
    { header: 'UTM Source', value: sub.attribution.utm_source ?? '' },
    { header: 'UTM Medium', value: sub.attribution.utm_medium ?? '' },
    { header: 'UTM Campaign', value: sub.attribution.utm_campaign ?? '' },
    { header: 'GCLID', value: sub.attribution.gclid ?? '' },
    { header: 'Saved to Database', value: supabase },
    { header: 'Status', value: 'New' },
  ];
}

async function saveToSheet(
  sub: ValidatedSubmission,
  receivedAt: string,
  supabase: PersistOutcome
): Promise<'saved' | 'duplicate' | 'failed'> {
  const url = GOOGLE_SCRIPT_URL;
  const secret = GOOGLE_SCRIPT_SECRET;
  if (!url || !secret) return 'failed';

  let attachment: { name: string; mimeType: string; base64: string } | null = null;
  if (sub.attachment) {
    const buffer = Buffer.from(await sub.attachment.file.arrayBuffer());
    attachment = { name: sub.attachment.name, mimeType: sub.attachment.mimeType, base64: buffer.toString('base64') };
  }

  const body = JSON.stringify({
    secret,
    submissionId: sub.submissionId,
    tab: sub.definition.sheetTab,
    columns: buildSheetColumns(sub, receivedAt, supabase),
    attachment,
  });

  // One retry on network/5xx failure. Safe because the script is idempotent on submissionId.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        redirect: 'follow',
        signal: AbortSignal.timeout(20_000),
      });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; duplicate?: boolean; error?: string } | null;
      if (res.ok && json?.ok) return json.duplicate ? 'duplicate' : 'saved';
      log('error', 'sheet_write_rejected', {
        submissionId: sub.submissionId,
        attempt,
        status: res.status,
        code: json?.error ?? 'bad_response',
      });
      if (json?.error === 'unauthorized' || json?.error === 'bad_request') break; // not retryable
    } catch (err) {
      log('error', 'sheet_write_exception', { submissionId: sub.submissionId, attempt, code: errorCode(err) });
    }
  }
  return 'failed';
}

/* ------------------------------------------------------------ Notification */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function notifyTeam(sub: ValidatedSubmission, receivedAt: string): Promise<void> {
  const host = getSecret('SMTP_HOST');
  const user = getSecret('SMTP_USER');
  const pass = getSecret('SMTP_PASS');
  if (!host || !user || !pass) {
    log('warn', 'notify_skipped_not_configured', { submissionId: sub.submissionId });
    return;
  }

  const port = Number(getSecret('SMTP_PORT') || 587);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: getSecret('SMTP_SECURE') === 'true' || port === 465,
    auth: { user, pass },
  });

  const rows = sub.definition.fields
    .filter((f) => f.type !== 'file')
    .map((f) => {
      const raw = sub.values[f.name] ?? '';
      const value = f.name === 'inquiry_type' ? (INQUIRY_TYPE_LABELS[raw as InquiryType] ?? raw) : raw;
      return { label: f.label, value };
    });

  const inquiry = INQUIRY_TYPE_LABELS[sub.values.inquiry_type as InquiryType] ?? 'Inquiry';

  try {
    await transporter.sendMail({
      from: getSecret('SMTP_FROM') || user,
      to: getSecret('SMTP_TO') || getSecret('MAIL_TO') || 'info@ziaflow.com',
      replyTo: sub.values.email,
      subject: `[ZiaFlow] ${inquiry} — ${sub.definition.sheetTab}`,
      text: [
        ...rows.map((r) => `${r.label}: ${r.value}`),
        sub.attachment ? `Attachment: ${sub.attachment.name} (see Google Sheet / Drive)` : '',
        '',
        `Submission ID: ${sub.submissionId}`,
        `Received: ${receivedAt}`,
      ].join('\n'),
      html: `
        <h3>New ${escapeHtml(inquiry)} (${escapeHtml(sub.definition.sheetTab)})</h3>
        <table cellpadding="4">${rows
          .map(
            (r) =>
              `<tr><th align="left" valign="top">${escapeHtml(r.label)}</th><td>${escapeHtml(r.value).replace(/\n/g, '<br/>')}</td></tr>`
          )
          .join('')}</table>
        ${sub.attachment ? `<p>Attachment: ${escapeHtml(sub.attachment.name)} (linked in the Google Sheet)</p>` : ''}
        <p><small>Submission ID: ${escapeHtml(sub.submissionId)} · ${escapeHtml(receivedAt)}</small></p>`,
    });
  } catch (err) {
    // The lead is already persisted — a failed email must not fail the submission.
    log('error', 'notify_failed', { submissionId: sub.submissionId, code: errorCode(err) });
  }
}

/* --------------------------------------------------------------- Pipeline */

export async function processSubmission(formData: FormData, meta: RequestMeta): Promise<SubmissionResult> {
  const rate = checkRateLimit(meta.clientIp || 'unknown');
  if (!rate.allowed) {
    log('warn', 'rate_limited', {});
    return {
      ok: false,
      status: 429,
      code: 'rate_limited',
      message: 'Too many submissions. Please wait a minute and try again.',
      retryAfterSeconds: rate.retryAfterSeconds,
    };
  }

  const result = validateSubmission(formData);

  if (!result.ok) {
    const { failure } = result;
    if (failure.kind === 'unknown_form') {
      log('warn', 'unknown_form', {});
      return { ok: false, status: 400, code: 'unknown_form', message: 'This form is not recognized.' };
    }
    if (failure.kind === 'spam') {
      // Pretend success so bots get no signal; nothing is stored or sent.
      log('warn', 'spam_dropped', { reason: failure.reason });
      if (failure.reason === 'honeypot') {
        return { ok: true, submissionId: crypto.randomUUID(), message: GENERIC_SUCCESS, duplicate: false };
      }
      return {
        ok: false,
        status: 400,
        code: 'invalid',
        message: 'That was fast! Please take a moment to review your message and submit again.',
      };
    }
    return {
      ok: false,
      status: 400,
      code: 'invalid',
      message: 'Please correct the highlighted fields.',
      fieldErrors: failure.fieldErrors,
    };
  }

  const sub = result.data;

  if (!GOOGLE_SCRIPT_URL || !GOOGLE_SCRIPT_SECRET) {
    log('error', 'not_configured', { submissionId: sub.submissionId, missing: 'GOOGLE_SCRIPT_URL/SECRET' });
    return {
      ok: false,
      status: 500,
      code: 'not_configured',
      message: 'Our form is temporarily unavailable. Please email info@ziaflow.com.',
    };
  }

  const receivedAt = new Date().toISOString();

  // Persist BEFORE notifying. Database first (durable record), then the review sheet.
  const dbOutcome = await saveToSupabase(sub, receivedAt, meta);
  const sheetOutcome = await saveToSheet(sub, receivedAt, dbOutcome);

  if (dbOutcome === 'saved') {
    if (sheetOutcome === 'saved' || sheetOutcome === 'duplicate') {
      await updateSupabaseStatus(sub.submissionId, 'processed');
    } else {
      await updateSupabaseStatus(sub.submissionId, 'failed', 'Downstream Google Sheet sync failed');
    }
  }

  const persisted = ['saved', 'duplicate'].includes(dbOutcome) || ['saved', 'duplicate'].includes(sheetOutcome);
  if (!persisted) {
    log('error', 'persist_failed', { submissionId: sub.submissionId, dbOutcome, sheetOutcome });
    return {
      ok: false,
      status: 500,
      code: 'persist_failed',
      message: 'We could not save your message. Please try again, or email info@ziaflow.com.',
    };
  }

  const duplicate = dbOutcome !== 'saved' && sheetOutcome !== 'saved';
  if (!duplicate) await notifyTeam(sub, receivedAt);

  log('info', 'submission_accepted', { submissionId: sub.submissionId, formId: sub.formId, dbOutcome, sheetOutcome });

  return { ok: true, submissionId: sub.submissionId, message: sub.definition.successMessage, duplicate };
}

/** Extract request metadata in a way that works in Astro Actions and on-demand pages. */
export function requestMeta(request: Request, clientAddress?: string): RequestMeta {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return {
    clientIp: clientAddress || forwarded || request.headers.get('x-real-ip') || 'unknown',
    userAgent: request.headers.get('user-agent') ?? '',
  };
}

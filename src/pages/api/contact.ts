import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { createHash } from 'node:crypto';
import { supabaseAdmin } from '~/lib/supabase-admin';
import { deliverWithReceipt, pipelineBatch, sourcePath, type ReceiptPayload } from '~/lib/intake-delivery';

export const prerender = false;

const json = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const asString = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : undefined);

export const POST: APIRoute = async ({ request }) => {
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

    const name =
      asString(data.name, 200) ||
      asString([data.first_name, data.last_name].filter((part) => typeof part === 'string').join(' '), 200);
    const email = asString(data.email, 320)?.toLowerCase() ?? '';
    const message = asString(data.message, 5000) ?? asString(data.comments, 5000) ?? '';
    const phone = asString(data.phone, 50);
    const company = asString(data.company, 200) ?? asString(data.company_name, 200);
    const serviceInterest = asString(data.service_interest, 200) ?? asString(data.service_needed, 200);
    const idempotencyKey = asString(data.idempotency_key, 100);
    const websiteUrlHoneypot = asString(data.website_url, 500);

    const otherData = { ...data };
    delete otherData.name;
    delete otherData.email;
    delete otherData.message;
    delete otherData.phone;
    delete otherData.company;
    delete otherData.service_interest;
    delete otherData.idempotency_key;
    delete otherData.access_key;
    delete otherData.website_url;
    delete otherData.botcheck;

    // 1. Rate Limiting: max 50 submissions per minute per IP (defense-in-depth)
    const { checkRateLimit, getClientIp } = await import('~/lib/rate-limiter');
    const clientIp = getClientIp(request);
    const { allowed, resetInSeconds } = checkRateLimit(clientIp, { maxRequests: 50, windowMs: 60_000 });
    if (!allowed) {
      console.warn(`[contact] rate limit exceeded for IP: ${clientIp}`);
      return new Response(JSON.stringify({ message: 'Too many requests. Please wait before submitting again.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': String(resetInSeconds) },
      });
    }

    // 2. Honeypot check: if filled, silently drop the database insert and return 200 OK so bots are deceived
    if (websiteUrlHoneypot || data.botcheck) {
      console.warn('[contact] honeypot triggered (website_url or botcheck filled); silently dropping insert');
      return json({ message: 'Thanks! We received your message.' }, 200);
    }

    // 3. Content Filtering: Cyrillic characters check (ZiaFlow serves US / Arizona clients)
    const CYRILLIC_REGEX = /[\u0400-\u04FF]/;
    const combinedContent = [name, email, message, company, serviceInterest].filter(Boolean).join(' ');
    if (CYRILLIC_REGEX.test(combinedContent)) {
      console.warn('[contact] rejected: Cyrillic characters detected');
      return json({ message: 'Submissions containing unsupported characters are not allowed.' }, 400);
    }

    // 4. Content Filtering: Heavy HTML markup, links, or suspicious Russian TLDs
    const HTML_TAG_REGEX = /<[^>]+>|href\s*=|\[url/i;
    const URL_REGEX = /(https?:\/\/|www\.)[^\s]+/gi;
    const urlMatches = message.match(URL_REGEX) || [];
    const SUSPICIOUS_TLD_REGEX = /\b[\w.-]+\.(ru|su|рф)\b/i;

    if (HTML_TAG_REGEX.test(message) || urlMatches.length >= 2 || SUSPICIOUS_TLD_REGEX.test(combinedContent)) {
      console.warn('[contact] rejected: excessive URLs, HTML markup, or blocked TLD detected in message');
      return json(
        { message: 'Messages containing promotional links, HTML tags, or blocked domains are not accepted.' },
        400
      );
    }

    if (!email || !EMAIL_PATTERN.test(email)) {
      console.warn('[contact] rejected: missing or invalid email');
      return json({ message: 'A valid email is required' }, 400);
    }

    if (!supabaseAdmin) {
      console.error('[contact] persistence unavailable: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set');
      return json({ message: 'We could not save your message. Please try again later.' }, 503);
    }

    const database = supabaseAdmin;

    // Server-controlled test flag: only a request carrying the secret token is marked as a test.
    const testToken = import.meta.env.TEST_SUBMISSION_TOKEN;
    const isTest = Boolean(testToken) && request.headers.get('x-test-token') === testToken;

    let pageSubmittedFrom = sourcePath(data, request.headers.get('referer'));

    // Deduplication key: client idempotency key, else a hash of the content within a 10-minute window.
    const dedupKey = idempotencyKey
      ? `client:${idempotencyKey}`
      : `hash:${createHash('sha256')
          .update([email, message, pageSubmittedFrom, Math.floor(Date.now() / 600000)].join('|'))
          .digest('hex')}`;

    otherData.page = pageSubmittedFrom;
    otherData.page_url = `https://ziaflow.com${pageSubmittedFrom}`;
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      otherData[key] = asString(data[key], 500) || '';
    }
    const initialPayload: ReceiptPayload = {
      name,
      email,
      phone,
      company,
      message,
      service_interest: serviceInterest,
      extra: otherData,
      deliveries: { webhook: { status: 'pending' }, pipeline: { status: 'pending' } },
    };
    let receiptPayload = initialPayload;
    let receiptIsTest = isTest;

    // 1. Receipt (restricted table; holds the raw payload). A unique dedup_key makes retries idempotent.
    let submissionId: string;
    let alreadyPersisted = false;

    const { data: inserted, error: receiptError } = await supabaseAdmin
      .from('lead_submissions')
      .insert({
        dedup_key: dedupKey,
        status: 'validated',
        is_test: isTest,
        page_submitted_from: pageSubmittedFrom,
        payload: initialPayload,
      })
      .select('id')
      .single();

    if (inserted) {
      submissionId = inserted.id;
    } else if (receiptError?.code === '23505') {
      // Retry or simultaneous duplicate: reuse the existing receipt instead of creating another.
      const { data: existing, error: lookupError } = await supabaseAdmin
        .from('lead_submissions')
        .select('id, status, payload, is_test, page_submitted_from')
        .eq('dedup_key', dedupKey)
        .single();
      if (lookupError || !existing) {
        console.error('[contact] duplicate receipt lookup failed:', lookupError?.message);
        return json({ message: 'We could not save your message. Please try again.' }, 500);
      }
      if (existing.payload.email !== email || existing.payload.message !== message) {
        return json({ message: 'This submission identifier was already used. Please reload the form.' }, 409);
      }
      receiptPayload = existing.payload;
      receiptIsTest = existing.is_test;
      pageSubmittedFrom = existing.page_submitted_from || pageSubmittedFrom;
      submissionId = existing.id;
      alreadyPersisted = existing.status === 'persisted';
    } else {
      console.error('[contact] receipt insert failed:', receiptError?.message);
      return json({ message: 'We could not save your message. Please try again.' }, 500);
    }

    const savedExtra = (receiptPayload.extra || {}) as Record<string, unknown>;

    // 2. Lead linked to the receipt. Unique submission_id means a retry can never create a second lead.
    if (!alreadyPersisted) {
      const { error: leadError } = await supabaseAdmin.from('leads').upsert(
        {
          submission_id: submissionId,
          name: receiptPayload.name || null,
          email: receiptPayload.email,
          phone: receiptPayload.phone || null,
          company_name: receiptPayload.company || savedExtra.company_name || null,
          service_needed: receiptPayload.service_interest || savedExtra.service_needed || 'Contact Inquiry',
          comments: receiptPayload.message || null,
          page_submitted_from: pageSubmittedFrom,
          status: 'new',
          score: 10,
          is_test: receiptIsTest,
        },
        { onConflict: 'submission_id', ignoreDuplicates: true }
      );

      if (leadError) {
        console.error('[contact] lead insert failed for submission', submissionId, leadError.message);
        await supabaseAdmin
          .from('lead_submissions')
          .update({ error_detail: leadError.message.slice(0, 500) })
          .eq('id', submissionId);
        return json({ message: 'We could not save your message. Please try again.' }, 500);
      }

      const { error: statusError } = await supabaseAdmin
        .from('lead_submissions')
        .update({ status: 'persisted', persisted_at: new Date().toISOString(), error_detail: null })
        .eq('id', submissionId);

      if (statusError) {
        console.error('[contact] receipt status update failed for submission', submissionId, statusError.message);
        return json({ message: 'We could not save your message. Please try again.' }, 500);
      }
    }

    // Independent persistence and delivery state: a saved lead can safely retry a rejected dispatch.
    const receiptStore = {
      async read(): Promise<ReceiptPayload> {
        const { data: receipt, error } = await database
          .from('lead_submissions')
          .select('payload')
          .eq('id', submissionId)
          .single();
        if (error || !receipt) throw new Error('Delivery receipt unavailable');
        return receipt.payload;
      },
      async replace(previous: ReceiptPayload, next: ReceiptPayload) {
        const { data: changed, error } = await database
          .from('lead_submissions')
          .update({ payload: next })
          .eq('id', submissionId)
          .eq('payload', JSON.stringify(previous))
          .select('id');
        if (error) throw new Error('Delivery receipt could not be updated');
        return changed?.length === 1;
      },
    };
    const delivery: Record<string, string> = {};
    if (!receiptIsTest) {
      try {
        const cioWebhookUrl = import.meta.env.CUSTOMER_IO_WEBHOOK_URL;
        if (cioWebhookUrl) {
          const storedExtra = (receiptPayload.extra || {}) as Record<string, unknown>;
          const cioPayload = {
            name: receiptPayload.name || '',
            email: receiptPayload.email,
            phone: receiptPayload.phone || '',
            company: receiptPayload.company || '',
            service: receiptPayload.service_interest || 'General Inquiry',
            message: receiptPayload.message || '',
            inquiry: receiptPayload.message || '',
            source_page: storedExtra.page || pageSubmittedFrom,
            submission_id: submissionId,
            lead_id: submissionId,
            form_type: storedExtra.form_type || 'contact_us',
            is_test: false,
            idempotency_key: submissionId,
          };
          delivery.webhook = await deliverWithReceipt(receiptStore, 'webhook', () =>
            fetch(cioWebhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(cioPayload),
              redirect: 'error',
              signal: AbortSignal.timeout(10_000),
            })
          );
        } else delivery.webhook = 'not_configured';

        // The existing server-intake Pipelines source identifies the person before the canonical event.
        // The welcome/nurture campaign remains draft until separately reviewed and activated.
        const writeKey = import.meta.env.CIO_CDP_WRITE_KEY;
        if (writeKey && delivery.webhook !== 'in_progress') {
          const endpoint =
            import.meta.env.CUSTOMER_IO_CDP_REGION === 'eu'
              ? 'https://cdp-eu.customer.io/v1/batch'
              : 'https://cdp.customer.io/v1/batch';
          delivery.pipeline = await deliverWithReceipt(receiptStore, 'pipeline', () =>
            fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Strict-Mode': '1',
                Authorization: `Basic ${Buffer.from(`${writeKey}:`).toString('base64')}`,
              },
              body: JSON.stringify(pipelineBatch(submissionId, receiptPayload, new Date().toISOString())),
              redirect: 'error',
              signal: AbortSignal.timeout(10_000),
            })
          );
        } else delivery.pipeline = writeKey ? 'in_progress' : 'not_configured';
      } catch {
        // Preserve the successful intake, and surface recoverable dispatch status without exposing secrets.
        delivery.status = 'needs_review';
        console.warn('[contact] delivery journal requires review for submission', submissionId);
      }
    }

    // Best-effort SMTP internal notification as fallback, only for the first persisted copy
    if (!alreadyPersisted && !receiptIsTest && import.meta.env.SMTP_HOST && import.meta.env.SMTP_USER) {
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
          subject: `${isTest ? '[TEST] ' : ''}Contact Form Submission from ${(name || email).replace(/[\r\n]/g, ' ')}`,
          text: `
            Name: ${name}
            Email: ${email}
            Phone: ${phone || 'N/A'}
            Submission ID: ${submissionId}
            
            Message:
            ${message}
            
            --
            Additional Info:
            ${JSON.stringify(otherData, null, 2)}
          `,
          html: `
            <h3>New Contact Form Submission</h3>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
            <p><strong>Phone:</strong> ${escapeHtml(phone || 'N/A')}</p>
            <p><strong>Submission ID:</strong> ${escapeHtml(submissionId)}</p>
            <br/>
            <p><strong>Message:</strong></p>
            <p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
            <hr/>
            <p><small>Additional Info:<br/>${escapeHtml(JSON.stringify(otherData, null, 2))}</small></p>
          `,
        });
      } catch (mailErr) {
        console.warn('SMTP Notification note (lead saved to database):', mailErr);
      }
    }

    return json(
      {
        message: 'Thanks! We received your message.',
        submission_id: submissionId,
        duplicate: alreadyPersisted,
        delivery,
      },
      200
    );
  } catch (error) {
    console.error('Contact Form Error:', error);
    return json({ message: 'Failed to send message' }, 500);
  }
};

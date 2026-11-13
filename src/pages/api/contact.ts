import type { APIRoute } from 'astro';
import * as Sentry from '@sentry/astro';
import nodemailer from 'nodemailer';
import { createHash } from 'node:crypto';
import { supabaseAdmin } from '~/lib/supabase-admin';
import { deliverWithReceipt, pipelineBatch, sourcePath, type ReceiptPayload } from '~/lib/intake-delivery';
import { logger } from '~/utils/sentry-logger';

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

    // 1. Honeypot check: if filled, silently drop the database insert and return 200 OK so bots are deceived
    if (websiteUrlHoneypot || data.botcheck) {
      logger.warn('Contact submission dropped by honeypot', {
        domain: 'contact',
        action: 'honeypot_rejected',
        endpoint: '/api/contact',
      });
      return json({ message: 'Thanks! We received your message.' }, 200);
    }

    // 3. Content Filtering: Cyrillic characters check (ZiaFlow serves US / Arizona clients)
    const CYRILLIC_REGEX = /[\u0400-\u04FF]/;
    const combinedContent = [name, email, message, company, serviceInterest].filter(Boolean).join(' ');
    if (CYRILLIC_REGEX.test(combinedContent)) {
      logger.warn('Contact submission rejected due to unsupported script', {
        domain: 'contact',
        action: 'content_rejected',
        reason: 'cyrillic_detected',
        endpoint: '/api/contact',
      });
      return json({ message: 'Submissions containing unsupported characters are not allowed.' }, 400);
    }

    // 4. Content Filtering: Heavy HTML markup, links, or suspicious Russian TLDs
    const HTML_TAG_REGEX = /<[^>]+>|href\s*=|\[url/i;
    const URL_REGEX = /(https?:\/\/|www\.)[^\s]+/gi;
    const urlMatches = message.match(URL_REGEX) || [];
    const SUSPICIOUS_TLD_REGEX = /\b[\w.-]+\.(ru|su|рф)\b/i;

    if (HTML_TAG_REGEX.test(message) || urlMatches.length >= 2 || SUSPICIOUS_TLD_REGEX.test(combinedContent)) {
      logger.warn('Contact submission rejected by spam filter', {
        domain: 'contact',
        action: 'content_rejected',
        reason: 'spam_pattern',
        urlCount: urlMatches.length,
        endpoint: '/api/contact',
      });
      return json(
        { message: 'Messages containing promotional links, HTML tags, or blocked domains are not accepted.' },
        400
      );
    }

    if (!email || !EMAIL_PATTERN.test(email)) {
      logger.warn('Contact submission rejected due to invalid email', {
        domain: 'contact',
        action: 'validation_failed',
        reason: 'invalid_email',
        endpoint: '/api/contact',
      });
      return json({ message: 'A valid email is required' }, 400);
    }

    if (!supabaseAdmin) {
      logger.error('Contact persistence unavailable: Supabase admin client not configured', {
        domain: 'contact',
        action: 'persistence_check',
        endpoint: '/api/contact',
        statusCode: 503,
      });
      return json({ message: 'We could not save your message. Please try again later.' }, 503);
    }

    const database = supabaseAdmin;

    // Server-controlled test flag: automatically mark as test if not production, or if matching test tokens/QA traffic
    const testToken = import.meta.env.TEST_SUBMISSION_TOKEN;
    const isTest =
      import.meta.env.VERCEL_ENV !== 'production' ||
      (Boolean(testToken) && request.headers.get('x-test-token') === testToken) ||
      asString(data.utm_source, 100) === 'internal-qa' ||
      asString(data.utm_medium, 100) === 'verification' ||
      email.endsWith('@example.com') ||
      email.endsWith('.test');

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
        logger.error(
          'Contact duplicate receipt lookup failed',
          {
            domain: 'contact',
            action: 'receipt_lookup',
            endpoint: '/api/contact',
            statusCode: 500,
          },
          lookupError
        );
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
      logger.error(
        'Contact receipt insert failed',
        {
          domain: 'contact',
          action: 'receipt_insert',
          endpoint: '/api/contact',
          statusCode: 500,
        },
        receiptError
      );
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
        logger.error(
          'Contact lead upsert failed',
          {
            domain: 'contact',
            action: 'lead_upsert',
            submissionId,
            endpoint: '/api/contact',
            statusCode: 500,
          },
          leadError
        );
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
        logger.error(
          'Contact receipt status update failed',
          {
            domain: 'contact',
            action: 'receipt_status_update',
            submissionId,
            endpoint: '/api/contact',
            statusCode: 500,
          },
          statusError
        );
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
      } catch (deliveryErr) {
        // Preserve the successful intake, and surface recoverable dispatch status without exposing secrets.
        delivery.status = 'needs_review';
        logger.warn('Contact delivery journal requires review', {
          domain: 'contact',
          action: 'delivery_dispatch',
          submissionId,
          errorName: deliveryErr instanceof Error ? deliveryErr.name : 'UnknownError',
        });
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
        logger.warn('SMTP fallback notification failed after lead persistence', {
          domain: 'contact',
          action: 'smtp_fallback',
          submissionId,
          errorName: mailErr instanceof Error ? mailErr.name : 'UnknownError',
        });
      }
    }

    logger.info('Contact submission processed', {
      domain: 'contact',
      action: 'submission_completed',
      submissionId,
      duplicate: alreadyPersisted,
      isTest: receiptIsTest,
      sourcePath: pageSubmittedFrom,
      deliveryWebhook: delivery.webhook,
      deliveryPipeline: delivery.pipeline,
    });

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
    logger.error(
      'Unhandled contact form error',
      {
        domain: 'contact',
        action: 'unhandled_exception',
        endpoint: '/api/contact',
        statusCode: 500,
      },
      error
    );
    Sentry.captureException(error);
    return json({ message: 'Failed to send message' }, 500);
  }
};

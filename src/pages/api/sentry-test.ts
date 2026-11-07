import type { APIRoute } from 'astro';
import * as Sentry from '@sentry/astro';
import { logger } from '~/utils/sentry-logger';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'info';

  if (type === 'warn') {
    logger.warn('Server warning: Rate limit threshold reached', {
      domain: 'test',
      action: 'rate_limit_check',
      endpoint: '/api/sentry-test',
      thresholdPercent: 85,
    });
    return new Response(JSON.stringify({ status: 'warning_logged' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (type === 'error') {
    const fakeError = new Error('Simulated upstream service outage');
    logger.error(
      'Server error: External webhook failed',
      {
        domain: 'test',
        action: 'upstream_call',
        service: 'CustomerIO',
        statusCode: 502,
      },
      fakeError
    );

    // Also capture exception in Sentry for issue tracking
    Sentry.captureException(fakeError);

    return new Response(JSON.stringify({ status: 'error_logged' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Default: Info log
  logger.info('Server info: Verification check executed successfully', {
    domain: 'test',
    action: 'health_check',
    endpoint: '/api/sentry-test',
    clientIp: request.headers.get('x-forwarded-for') || '127.0.0.1',
  });

  return new Response(JSON.stringify({ status: 'info_logged' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

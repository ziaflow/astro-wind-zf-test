import type { APIRoute } from 'astro';

/**
 * Diagnostic endpoint to check email configuration
 * GET /api/test-email
 */
export const GET: APIRoute = async () => {
  const config = {
    EMAIL_BACKEND: import.meta.env.EMAIL_BACKEND,
    SMTP_HOST: import.meta.env.SMTP_HOST ? '✓ Set' : '✗ Missing',
    SMTP_PORT: import.meta.env.SMTP_PORT ? '✓ Set' : '✗ Missing',
    SMTP_USER: import.meta.env.SMTP_USER ? '✓ Set' : '✗ Missing',
    SMTP_PASS: import.meta.env.SMTP_PASS ? '✓ Set' : '✗ Missing',
    SMTP_FROM: import.meta.env.SMTP_FROM ? '✓ Set' : '✗ Missing',
    SMTP_TO: import.meta.env.SMTP_TO ? '✓ Set' : '✗ Missing',
  };

  return new Response(
    JSON.stringify(config, null, 2),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};

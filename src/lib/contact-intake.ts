// Server-only intake. No messaging or browser identity dispatch occurs here.
export interface IntakeEnv {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  WEBSITE_INTAKE_ENABLED?: string;
  VERCEL_ENV?: string;
  WEBSITE_INTAKE_TEST_ONLY?: string;
}
const reply = (status: number, message: string, extra = {}) =>
  Response.json({ message, ...extra }, { status, headers: { 'Cache-Control': 'no-store' } });
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function captureContact(request: Request, env: IntakeEnv, send: typeof fetch = fetch) {
  if (env.WEBSITE_INTAKE_ENABLED !== 'true' || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY)
    return reply(503, 'Online intake is unavailable. Please call (602) 834-4239.');
  if (request.method !== 'POST') return reply(405, 'Method not allowed.');
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  if (origin && origin !== url.origin) return reply(403, 'Please use the form on this website.');
  // JSON-only requests prevent cross-origin HTML form posts; reject before any database call.
  if (!request.headers.get('content-type')?.includes('application/json')) return reply(415, 'JSON required.');
  let data: Record<string, unknown>;
  try {
    if (Number(request.headers.get('content-length') || 0) > 16384) return reply(413, 'Request too large.');
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 16384) return reply(413, 'Request too large.');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return reply(400, 'Invalid request.');
    data = parsed;
  } catch {
    return reply(400, 'Invalid request.');
  }
  if (data.website) return reply(400, 'Invalid request.');
  const value = (key: string) => (typeof data[key] === 'string' ? (data[key] as string).trim() : '');
  const email = value('email').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return reply(400, 'A valid email is required.');
  const id = value('submission_id');
  if (!uuid.test(id)) return reply(400, 'A submission ID is required.');
  const isTest = env.VERCEL_ENV !== 'production' || env.WEBSITE_INTAKE_TEST_ONLY !== 'false';
  let pageUrl: URL;
  try {
    pageUrl = new URL(value('page_url') || '/contact', url.origin);
  } catch {
    return reply(400, 'Invalid source page.');
  }
  const sourcePage = pageUrl.pathname;
  const payload = Object.fromEntries(
    ['name', 'phone', 'company', 'service_interest', 'message'].map((key) => [key, value(key)])
  );
  if (Object.values(payload).some((text) => text.length > 5000)) return reply(400, 'Field too long.');
  const attribution = Object.fromEntries(
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].map((key) => [
      key,
      pageUrl.searchParams.get(key)?.slice(0, 256) || null,
    ])
  );
  const metadata = {
    source_page: sourcePage,
    is_test: isTest,
    attribution,
    event_name: 'form_submit',
    event_version: 1,
    follow_up_state: 'held',
    marketing_consent: false,
    form_name: value('form_name') || 'contact',
    // Inquiry handling is distinct from consent to marketing or newsletter enrollment.
    consent_basis: 'inquiry_only',
    captured_by: 'website_server_v1',
  };
  try {
    const response = await send(new URL('/rest/v1/rpc/record_website_contact', env.SUPABASE_URL), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ p_id: id, p_payload: { ...payload, email }, p_metadata: metadata }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok)
      return reply(response.status === 409 ? 409 : 502, 'We could not confirm your request. Please retry or call us.');
    // Verify the receipt, not just a 2xx provider response.
    if ((await response.json()) !== id)
      return reply(502, 'We could not confirm your request. Please retry or call us.');
    return reply(200, 'Your request has been recorded.', {
      submission_id: id,
      follow_up_state: 'held',
      is_test: isTest,
    });
  } catch {
    return reply(502, 'We could not confirm your request. Please retry or call us.');
  }
}

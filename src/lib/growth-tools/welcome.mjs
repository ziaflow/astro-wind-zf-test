/** Single attempt after durable intake. No campaign enrollment and no automatic resend. */
export async function sendReviewWelcome({ email, name, tool, submissionId }, options = {}) {
  const env = options.env || process.env;
  if (env.GROWTH_WELCOME_ENABLED !== 'true') return { state: 'held', reason: 'disabled' };
  const allowed = (env.GROWTH_WELCOME_TEST_RECIPIENTS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  // During preview QA only approved internal recipients may receive messages.
  if (env.VERCEL_ENV !== 'production' && (!allowed.length || !allowed.includes(email.toLowerCase())))
    return { state: 'held', reason: 'test_recipient_required' };
  if (!env.CIO_APP_API_KEY || !env.CIO_GROWTH_WELCOME_MESSAGE_ID) return { state: 'held', reason: 'not_configured' };
  const host = env.CUSTOMERIO_REGION === 'eu' ? 'https://api-eu.customer.io' : 'https://api.customer.io';
  try {
    const response = await (options.fetch || fetch)(host + '/v1/send/email', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + env.CIO_APP_API_KEY, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        transactional_message_id: env.CIO_GROWTH_WELCOME_MESSAGE_ID,
        to: email,
        identifiers: { email },
        send_to_unsubscribed: false,
        tracked: false,
        message_data: { first_name: name.split(/\s+/)[0], tool_name: tool, submission_id: submissionId },
      }),
    });
    if (!response.ok) return { state: 'failed', reason: 'provider_' + response.status };
    const data = await response.json();
    if (!data?.delivery_id) return { state: 'unknown', reason: 'missing_delivery_id' };
    return { state: 'accepted', deliveryId: String(data.delivery_id) };
  } catch {
    return { state: 'unknown', reason: 'transport_unconfirmed' };
  }
}

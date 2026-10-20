/**
 * Customer.io Track API & Behavioral Journeys Adapter
 * Supports Track API event dispatch and user attribute identification
 */

export interface CustomerIoUserAttributes {
  email: string;
  created_at?: number;
  company_name?: string;
  lead_tier?: string;
  pipeline_status?: string;
  phone?: string;
  service_needed?: string;
  [key: string]: unknown;
}

export interface CustomerIoEventPayload {
  name: string;
  data?: Record<string, unknown>;
  timestamp?: number;
}

const siteId =
  import.meta.env.CUSTOMERIO_SITE_ID || process.env.CUSTOMERIO_SITE_ID || process.env.PUBLIC_CUSTOMERIO_SITE_ID;

const apiKey =
  import.meta.env.CUSTOMERIO_API_KEY ||
  process.env.CUSTOMERIO_API_KEY ||
  import.meta.env.CUSTOMERIO_TRACK_KEY ||
  process.env.CUSTOMERIO_TRACK_KEY;

const region = import.meta.env.CUSTOMERIO_REGION || process.env.CUSTOMERIO_REGION || 'us';

const getBaseUrl = () => {
  return region === 'eu' ? 'https://track-eu.customer.io/api/v1' : 'https://track.customer.io/api/v1';
};

const getAuthHeader = () => {
  if (!siteId || !apiKey) return null;
  const credentials = Buffer.from(`${siteId}:${apiKey}`).toString('base64');
  return `Basic ${credentials}`;
};

/**
 * Identify a user profile and upsert behavioral attributes in Customer.io
 */
export async function identifyUser(
  userId: string,
  attributes: CustomerIoUserAttributes
): Promise<{ success: boolean; error?: string }> {
  const auth = getAuthHeader();
  if (!auth) {
    console.warn('[Customer.io] Missing CUSTOMERIO_SITE_ID or CUSTOMERIO_API_KEY. Skipping identifyUser.');
    return { success: false, error: 'missing_credentials' };
  }

  const endpoint = `${getBaseUrl()}/customers/${encodeURIComponent(userId)}`;

  try {
    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attributes),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Customer.io] identifyUser failed (${res.status}):`, errText);
      return { success: false, error: errText };
    }

    return { success: true };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[Customer.io] identifyUser network error:', errMsg);
    return { success: false, error: errMsg };
  }
}

/**
 * Track an event for a specific user in Customer.io
 */
export async function trackEvent(
  userId: string,
  eventName: string,
  eventData: Record<string, unknown> = {}
): Promise<{ success: boolean; error?: string }> {
  const auth = getAuthHeader();
  if (!auth) {
    console.warn('[Customer.io] Missing CUSTOMERIO_SITE_ID or CUSTOMERIO_API_KEY. Skipping trackEvent.');
    return { success: false, error: 'missing_credentials' };
  }

  const endpoint = `${getBaseUrl()}/customers/${encodeURIComponent(userId)}/events`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: eventName,
        data: eventData,
        timestamp: Math.floor(Date.now() / 1000),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Customer.io] trackEvent failed (${res.status}):`, errText);
      return { success: false, error: errText };
    }

    return { success: true };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[Customer.io] trackEvent network error:', errMsg);
    return { success: false, error: errMsg };
  }
}

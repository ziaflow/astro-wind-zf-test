// Astro Client Event Logger
// Usage: import { logEvent } from '~/utils/event-logger';
// logEvent('cta_click', { page: '/pricing' })
//
// TODO: Set EVENT_LOG_ENDPOINT in your .env file to your Supabase Edge Function or API endpoint

const endpoint = import.meta.env.PUBLIC_EVENT_LOG_ENDPOINT || '/api/events';

export async function logEvent(event: string, data: Record<string, any> = {}) {
  if (typeof window === 'undefined') return; // Only run in browser
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, ...data, ts: new Date().toISOString() })
    });
  } catch (err) {
    // Optionally log error to console or monitoring
    // console.error('Event log failed', err);
  }
}

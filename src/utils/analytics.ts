// Client-side analytics & event tracking helper
// Safely dispatches events to window.dataLayer (GTM) and gtag (GA4)

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

export interface FormSubmissionEventParams {
  form_id?: string;
  form_name: string;
  service_needed?: string;
  page_path?: string;
  [key: string]: unknown;
}

export interface EmailSentEventParams {
  email_type: 'lead_notification' | 'customer_receipt' | 'audit_booking' | string;
  recipient_domain?: string;
  status: 'sent' | 'queued' | 'failed';
  form_name?: string;
  [key: string]: unknown;
}

/**
 * Push an event to GTM dataLayer and trigger GA4 gtag event
 */
export function trackEvent(eventName: string, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;

  const enrichedParams = {
    ...params,
    page_location: window.location.href,
    page_path: window.location.pathname,
  };

  // 1. Google Tag Manager dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...enrichedParams,
  });

  // 2. Google Analytics 4 gtag directly if initialized
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, {
      ...enrichedParams,
      transport_type: 'beacon',
    });
  }
}

/**
 * Standardized tracking for successful form submissions
 */
export function trackFormSubmission(params: FormSubmissionEventParams): void {
  trackEvent('form_submission', {
    event_category: 'Lead',
    ...params,
  });
}

/**
 * Standardized tracking for when emails/notifications are triggered
 */
export function trackEmailSent(params: EmailSentEventParams): void {
  trackEvent('email_sent', {
    event_category: 'Email',
    ...params,
  });
}

export interface CustomerIoIdentifyParams {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  service_interest?: string;
  intake_source?: string;
  [key: string]: unknown;
}

/**
 * Identifies the person in Customer.io CDP and sets lead attributes
 */
export function identifyCustomerIo(params: CustomerIoIdentifyParams): void {
  if (typeof window === 'undefined') return;
  const w = window as any;
  if (w.cioanalytics && typeof w.cioanalytics.identify === 'function') {
    const { email, ...attributes } = params;
    if (email) {
      w.cioanalytics.identify(email, {
        email,
        ...attributes,
      });
    }
  }
}

/**
 * Dispatches contact_form_submitted event to Customer.io CDP with event payload
 */
export function trackCustomerIoEvent(eventName: string, eventData: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;
  const w = window as any;
  if (w.cioanalytics && typeof w.cioanalytics.track === 'function') {
    w.cioanalytics.track(eventName, {
      ...eventData,
      page_url: window.location.href,
      page_path: window.location.pathname,
    });
  }
}


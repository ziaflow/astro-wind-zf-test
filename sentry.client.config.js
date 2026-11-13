import * as Sentry from '@sentry/astro';

const SENSITIVE_LOG_KEY = /(?:password|secret|token|auth|key|cookie|credit|ssn)/i;

Sentry.init({
  dsn: 'https://8a006f2b35c7a9d7b94273826e7f563c@o4512386585591808.ingest.us.sentry.io/4512386802515968',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.browserProfilingIntegration(),
    Sentry.replayIntegration(),
    Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
  ],
  // Define how likely traces are sampled. Adjust this value in production,
  // or use tracesSampler for greater control.
  tracesSampleRate: 1.0,
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ['localhost', /^https:\/\/ziaflow\.com\/api/],
  // Set profileSessionSampleRate to 1.0 to profile during every session.
  // The decision, whether to profile or not, is made once per session (when the SDK is initialized).
  profileSessionSampleRate: 1.0,
  profileLifecycle: 'trace',
  // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysSessionSampleRate: 0.1,
  // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  replaysOnErrorSampleRate: 1.0,
  // Enable Sentry Structured Logging
  enableLogs: true,
  beforeSendLog(log) {
    // Drop high-volume diagnostic logs in production
    if (import.meta.env?.PROD && (log.level === 'trace' || log.level === 'debug')) {
      return null;
    }
    if (log.attributes) {
      for (const attrKey of Object.keys(log.attributes)) {
        if (SENSITIVE_LOG_KEY.test(attrKey)) {
          log.attributes[attrKey] = '[REDACTED]';
        }
      }
    }
    return log;
  },
});

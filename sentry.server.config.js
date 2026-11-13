import * as Sentry from '@sentry/astro';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

const SENSITIVE_LOG_KEY = /(?:password|secret|token|auth|key|cookie|credit|ssn)/i;

Sentry.init({
  dsn: 'https://8a006f2b35c7a9d7b94273826e7f563c@o4512386585591808.ingest.us.sentry.io/4512386802515968',
  integrations: [nodeProfilingIntegration(), Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] })],
  // Define how likely traces are sampled. Adjust this value in production,
  // or use tracesSampler for greater control.
  tracesSampleRate: 1.0,
  // Set sampling rate for profiling - this is evaluated only once per SDK.init call
  profileSessionSampleRate: 1.0,
  // Trace lifecycle automatically enables profiling during active traces
  profileLifecycle: 'trace',
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

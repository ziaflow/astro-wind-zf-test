import * as Sentry from '@sentry/astro';

Sentry.init({
  dsn: 'https://8a006f2b35c7a9d7b94273826e7f563c@o4512386585591808.ingest.us.sentry.io/4512386802515968',
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  // Define how likely traces are sampled. Adjust this value in production,
  // or use tracesSampler for greater control.
  tracesSampleRate: 1.0,
  // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysSessionSampleRate: 0.1,
  // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  replaysOnErrorSampleRate: 1.0,
  // Enable Sentry Structured Logging
  enableLogs: true,
});

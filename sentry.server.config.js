import * as Sentry from '@sentry/astro';

Sentry.init({
  dsn: 'https://8a006f2b35c7a9d7b94273826e7f563c@o4512386585591808.ingest.us.sentry.io/4512386802515968',
  // Define how likely traces are sampled. Adjust this value in production,
  // or use tracesSampler for greater control.
  tracesSampleRate: 1.0,
  // Enable Sentry Structured Logging
  enableLogs: true,
});

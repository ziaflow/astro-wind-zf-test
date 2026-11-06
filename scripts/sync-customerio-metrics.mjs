import { pathToFileURL } from 'node:url';

/**
 * Sync daily campaign reporting metrics from Customer.io App API to Supabase metrics_customerio_daily.
 * Deliberately server-only: requires service role key, validates non-negative counts, and performs merge upsert.
 */
export async function run(env = process.env, fetcher = fetch, log = console.log) {
  async function request(url, options, stage) {
    const response = await fetcher(url, {
      ...options,
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`${stage}: HTTP ${response.status}`);
    return response.status === 204 ? null : response.json();
  }

  const cioKey = env.CUSTOMERIO_APP_API_KEY || env.CIO_APP_API_KEY;
  if (!env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  if (!cioKey) throw new Error('Missing CUSTOMERIO_APP_API_KEY or CIO_APP_API_KEY');

  const base = env.SUPABASE_URL || env.PUBLIC_SUPABASE_URL;
  if (base !== 'https://ruhnueopjedaywiqhpgi.supabase.co') {
    throw new Error('Unexpected Supabase project URL');
  }

  const campaignId = env.CUSTOMERIO_CAMPAIGN_ID || '4';
  if (!/^\d+$/.test(campaignId)) {
    throw new Error('Invalid numeric CUSTOMERIO_CAMPAIGN_ID');
  }

  const campaignName = env.CUSTOMERIO_CAMPAIGN_NAME || 'Client Intake Webhook';

  const end = env.SYNC_END_DATE || new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const start = env.SYNC_START_DATE || new Date(Date.parse(end) - 6 * 86400000).toISOString().slice(0, 10);

  for (const date of [start, end]) {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(Date.parse(date)) ||
      new Date(date).toISOString().slice(0, 10) !== date
    ) {
      throw new Error('Invalid sync date');
    }
  }

  if (start > end) {
    throw new Error('Invalid date range');
  }

  const startTimestamp = Math.floor(new Date(`${start}T00:00:00Z`).getTime() / 1000);
  const endTimestamp = Math.floor(new Date(`${end}T23:59:59Z`).getTime() / 1000);

  // Fetch campaign metrics from Customer.io App API
  const metricsUrl = `https://api.customer.io/v1/campaigns/${campaignId}/metrics?period=day&start=${startTimestamp}&end=${endTimestamp}`;
  const responseData = await request(
    metricsUrl,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cioKey}`,
        'Content-Type': 'application/json',
      },
    },
    'Customer.io Campaign Metrics'
  );

  const metricSeries = responseData?.metric || responseData?.metrics || [];
  const rows = [];

  for (const item of metricSeries) {
    const dateStr = item.date
      ? typeof item.date === 'number'
        ? new Date(item.date * 1000).toISOString().slice(0, 10)
        : String(item.date).slice(0, 10)
      : null;

    if (!dateStr || dateStr < start || dateStr > end) continue;

    const parseCount = (v) => {
      const n = Number(v ?? 0);
      if (!Number.isSafeInteger(n) || n < 0) throw new Error('Customer.io metrics: negative or invalid count');
      return n;
    };

    rows.push({
      date: dateStr,
      campaign_id: campaignId,
      campaign_name: campaignName,
      sent: parseCount(item.sent),
      delivered: parseCount(item.delivered),
      opened: parseCount(item.opened ?? item.unique_opens),
      clicked: parseCount(item.clicked ?? item.unique_clicks),
      unsubscribed: parseCount(item.unsubscribed),
      spammed: parseCount(item.spammed),
    });
  }

  if (rows.length > 0) {
    await request(
      `${base}/rest/v1/metrics_customerio_daily?on_conflict=date,campaign_id`,
      {
        method: 'POST',
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify(rows),
      },
      'Customer.io metrics upsert'
    );
  }

  log(JSON.stringify({ source: 'customerio', status: rows.length ? 'success' : 'empty', rows_written: rows.length }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch((error) => {
    console.error(
      /^(Missing |Unexpected |Invalid |Customer\.io )/.test(error.message)
        ? error.message
        : 'Customer.io metrics sync failed; check configuration and connectivity'
    );
    process.exitCode = 1;
  });
}

import { pathToFileURL } from 'node:url';

// Deliberately server-only: no anon-key fallback and no fabricated/aggregate input.
export async function run(env = process.env, fetcher = fetch, log = console.log) {
  async function request(url, body, headers, stage) {
    const response = await fetcher(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000),
    });
    if (!response.ok) throw new Error(`${stage}: HTTP ${response.status}`);
    return response.status === 204 ? null : response.json();
  }
  const required = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REFRESH_TOKEN',
    'GA4_PROPERTY_ID',
  ];
  for (const key of required) if (!env[key]) throw new Error(`Missing ${key}`);
  const base = env.SUPABASE_URL || env.PUBLIC_SUPABASE_URL;
  if (base !== 'https://ruhnueopjedaywiqhpgi.supabase.co') throw new Error('Unexpected Supabase project URL');
  if (!/^\d+$/.test(env.GA4_PROPERTY_ID)) throw new Error('Invalid numeric GA4_PROPERTY_ID');
  const end = env.SYNC_END_DATE || new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
  const start = env.SYNC_START_DATE || new Date(Date.parse(end) - 6 * 86400000).toISOString().slice(0, 10);
  for (const date of [start, end]) {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(Date.parse(date)) ||
      new Date(date).toISOString().slice(0, 10) !== date
    )
      throw new Error('Invalid sync date');
  }
  if (start > end || end > new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10))
    throw new Error('Invalid or unfinalized date range');
  const tokenResponse = await fetcher('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!tokenResponse.ok) throw new Error(`Google OAuth: HTTP ${tokenResponse.status}`);
  const { access_token: token } = await tokenResponse.json();
  if (!token) throw new Error('Google OAuth: missing access token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  let failed = false;
  for (const source of ['ga4', 'gsc']) {
    let date;
    try {
      for (let time = Date.parse(start); time <= Date.parse(end); time += 86400000) {
        date = new Date(time).toISOString().slice(0, 10);
        const rows = [];
        for (let offset = 0; ; offset += 25000) {
          const data =
            source === 'ga4'
              ? await request(
                  `https://analyticsdata.googleapis.com/v1beta/properties/${env.GA4_PROPERTY_ID}:runReport`,
                  {
                    dateRanges: [{ startDate: date, endDate: date }],
                    dimensions: [{ name: 'pagePath' }],
                    metrics: ['activeUsers', 'sessions', 'keyEvents', 'bounceRate', 'userEngagementDuration'].map(
                      (name) => ({ name })
                    ),
                    dimensionFilter: {
                      filter: { fieldName: 'hostName', inListFilter: { values: ['ziaflow.com', 'www.ziaflow.com'] } },
                    },
                    orderBys: [{ dimension: { dimensionName: 'pagePath' } }],
                    limit: 25000,
                    offset,
                  },
                  headers,
                  'GA4 report'
                )
              : await request(
                  'https://www.googleapis.com/webmasters/v3/sites/sc-domain%3Aziaflow.com/searchAnalytics/query',
                  {
                    startDate: date,
                    endDate: date,
                    dimensions: ['page', 'query'],
                    dataState: 'final',
                    type: 'web',
                    rowLimit: 25000,
                    startRow: offset,
                  },
                  headers,
                  'GSC report'
                );
          if (
            source === 'ga4' &&
            (data.metadata?.subjectToThresholding ||
              data.metadata?.dataLossFromOtherRow ||
              data.metadata?.samplingMetadatas?.length)
          )
            throw new Error('GA4 report: incomplete data');
          const batch = data.rows || [];
          for (const row of batch) {
            if (source === 'ga4') {
              const values = row.metricValues.map((v) => Number(v.value));
              if (values.some((v) => !Number.isFinite(v)) || !Number.isInteger(values[2]))
                throw new Error('GA4 report: invalid or fractional metrics');
              rows.push({
                date,
                page_path: row.dimensionValues[0].value,
                active_users: values[0],
                sessions: values[1],
                conversions: values[2],
                bounce_rate: values[3],
                avg_engagement_time_sec: values[0] ? values[4] / values[0] : 0,
              });
            } else {
              const page = new URL(row.keys[0]);
              if (!['ziaflow.com', 'www.ziaflow.com'].includes(page.hostname))
                throw new Error('GSC report: unexpected hostname');
              // Keep URL query strings: stripping them would merge distinct GSC keys.
              rows.push({
                date,
                page_path: page.pathname + page.search,
                query: row.keys[1],
                clicks: row.clicks,
                impressions: row.impressions,
                ctr: row.ctr,
                position: row.position,
              });
            }
          }
          if (source === 'ga4' ? offset + batch.length >= (data.rowCount || 0) : batch.length < 25000) break;
          if (!batch.length) throw new Error('Report pagination stalled');
        }
        const keys = rows.map((row) => JSON.stringify([row.page_path, row.query]));
        if (new Set(keys).size !== keys.length)
          throw new Error('Report contains colliding page keys; refusing lossy import');
        for (let offset = 0; offset < rows.length; offset += 500) {
          await request(
            `${base}/rest/v1/metrics_${source}_daily?on_conflict=${source === 'ga4' ? 'date,page_path' : 'date,page_path,query'}`,
            rows.slice(offset, offset + 500),
            {
              apikey: env.SUPABASE_SERVICE_ROLE_KEY,
              Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'resolution=merge-duplicates,return=minimal',
            },
            `${source} upsert`
          );
        }
        log(JSON.stringify({ source, date, status: rows.length ? 'success' : 'empty', rows_written: rows.length }));
      }
    } catch (error) {
      failed = true;
      // Only messages constructed here are safe. Never log provider bodies or network errors.
      const safe = /^(GA4 report:|GSC report:|ga4 upsert:|gsc upsert:|Report )/.test(error.message)
        ? error.message
        : 'Request or response processing failed';
      log(JSON.stringify({ source, date, status: 'failed', error: safe }));
    }
  }
  if (failed) throw new Error('Google metrics sync failed; see per-source logs');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch((error) => {
    console.error(
      /^(Missing |Unexpected |Invalid |Google OAuth:|Google metrics sync failed)/.test(error.message)
        ? error.message
        : 'Google metrics sync failed; check configuration and connectivity'
    );
    process.exitCode = 1;
  });
}

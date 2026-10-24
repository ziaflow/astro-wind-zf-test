import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

const env = {};
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts
        .slice(1)
        .join('=')
        .trim()
        .replace(/^["']|["']$/g, '');
      if (key && !key.startsWith('#')) {
        env[key] = val;
      }
    }
  }
}

const SUPABASE_URL = env.PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_KEY || env.PUBLIC_SUPABASE_ANON_KEY;
const SANITY_API_TOKEN = env.SANITY_API_TOKEN || env.SANITY_AUTH_TOKEN;
const SANITY_PROJECT_ID = env.PUBLIC_SANITY_PROJECT_ID || '92p0tpps';
const SANITY_DATASET = env.PUBLIC_SANITY_DATASET || 'production';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

/**
 * Push Keyword Opportunities to Sanity HTTP Mutations API
 * Uses deterministic ID + createIfNotExists + patch to preserve editorial assignments.
 */
export async function pushKeywordOpportunitiesToSanity(opportunities) {
  if (!SANITY_API_TOKEN) {
    throw new Error('SANITY_API_TOKEN not configured in .env');
  }

  const mutations = [];

  for (const item of opportunities) {
    const slug = slugify(item.query);
    const dateStart = (item.reportDateRange || new Date().toISOString().split('T')[0]).split(' to ')[0].trim();
    const docId = `kw.${slug}.${dateStart}`;

    const initialDoc = {
      _id: docId,
      _type: 'keywordOpportunity',
      query: item.query,
      sourcePlatform: item.sourcePlatform || 'gsc',
      landingPage: item.landingPage || `https://ziaflow.com${item.page_path || ''}`,
      impressions: Number(item.impressions) || 0,
      clicks: Number(item.clicks) || 0,
      averagePosition: item.averagePosition
        ? Number(item.averagePosition)
        : item.position
          ? Number(item.position)
          : null,
      ctr: item.ctr !== undefined ? Number(item.ctr) : null,
      reportDateRange: item.reportDateRange || dateStart,
      recommendedAction: item.recommendedAction || 'publish_guide',
    };

    const patchDoc = {
      impressions: initialDoc.impressions,
      clicks: initialDoc.clicks,
      averagePosition: initialDoc.averagePosition,
      ctr: initialDoc.ctr,
    };

    mutations.push({ createIfNotExists: initialDoc });
    mutations.push({
      patch: {
        id: docId,
        set: patchDoc,
      },
    });
  }

  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2025-02-19/data/mutate/${SANITY_DATASET}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SANITY_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mutations }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sanity mutation failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const json = await res.json();
  return json;
}

/**
 * Fetch top GSC opportunities from Supabase metrics_gsc_daily and sync them to Sanity
 */
export async function syncGscFromSupabaseToSanity(options = { minImpressions: 50, limit: 20 }) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase configuration missing');
  }

  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/metrics_gsc_daily?impressions=gte.${options.minImpressions}&order=impressions.desc&limit=${options.limit}`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch from Supabase: ${res.status} ${text}`);
  }

  const rows = await res.json();
  console.log(`Fetched ${rows.length} qualified GSC rows from Supabase.`);

  const mapped = rows.map((r) => ({
    query: r.query,
    landingPage: r.page_path ? `https://ziaflow.com${r.page_path}` : 'https://ziaflow.com',
    impressions: r.impressions,
    clicks: r.clicks,
    averagePosition: r.position,
    ctr: r.ctr ? Number((r.ctr * 100).toFixed(2)) : 0,
    reportDateRange: r.date,
    sourcePlatform: 'supabase',
    recommendedAction: r.position <= 10 ? 'optimize_existing' : 'publish_guide',
  }));

  const sanityRes = await pushKeywordOpportunitiesToSanity(mapped);
  console.log(`Successfully synced ${mapped.length} keyword opportunities to Sanity Content Lake!`);
  return sanityRes;
}

// CLI runner if executed directly
async function run() {
  console.log('--- Syncing GSC Keyword Opportunities to Sanity ---');

  if (process.argv.includes('--from-supabase')) {
    await syncGscFromSupabaseToSanity({ minImpressions: 0, limit: 10 });
  } else {
    // Example seed batch
    const seedOpportunities = [
      {
        query: 'ai workflow automation',
        sourcePlatform: 'gsc',
        landingPage: 'https://ziaflow.com/services/automation',
        impressions: 1240,
        clicks: 18,
        averagePosition: 12.4,
        ctr: 1.45,
        reportDateRange: '2026-07-12 to 2026-10-11',
        recommendedAction: 'hold_investigate',
      },
      {
        query: 'web development phoenix',
        sourcePlatform: 'gsc',
        landingPage: 'https://ziaflow.com/services/web-development',
        impressions: 890,
        clicks: 42,
        averagePosition: 4.2,
        ctr: 4.72,
        reportDateRange: '2026-07-12 to 2026-10-11',
        recommendedAction: 'optimize_existing',
      },
      {
        query: 'marketing automation for contractor arizona',
        sourcePlatform: 'gsc',
        landingPage:
          'https://ziaflow.com/marketing-automation-for-arizona-service-businesses-save-time-increase-bookings',
        impressions: 640,
        clicks: 29,
        averagePosition: 3.1,
        ctr: 4.53,
        reportDateRange: '2026-07-12 to 2026-10-11',
        recommendedAction: 'publish_guide',
      },
      {
        query: 'google local service ads contractor phoenix',
        sourcePlatform: 'gsc',
        landingPage: 'https://ziaflow.com/services/local-service-ads',
        impressions: 510,
        clicks: 34,
        averagePosition: 2.1,
        ctr: 6.67,
        reportDateRange: '2026-07-12 to 2026-10-11',
        recommendedAction: 'target_ads',
      },
    ];

    console.log(`Writing ${seedOpportunities.length} keyword opportunity records to Sanity...`);
    await pushKeywordOpportunitiesToSanity(seedOpportunities);
    console.log('Successfully populated initial Keyword Opportunities in Sanity!');
  }
}

if (process.argv[1] && process.argv[1].endsWith('sync-gsc-to-sanity.mjs')) {
  run().catch((err) => {
    console.error('Error running sync-gsc-to-sanity:', err);
    process.exit(1);
  });
}

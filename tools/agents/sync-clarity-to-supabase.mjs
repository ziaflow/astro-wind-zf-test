import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 1. Load environment variables
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8').split('\n');
  envConfig.forEach((line) => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      if (key && !key.startsWith('#')) {
        process.env[key] = value;
      }
    }
  });
}

/**
 * Fetch and extract metrics from Microsoft Clarity Export API
 * and sync directly to Supabase public.metrics_clarity_daily
 */
export async function syncClarityToSupabase(days = 1) {
  // Resolve credentials when called; importing an Astro route must never exit Node.
  const token = process.env.CLARITY_API_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!token || !supabaseUrl || !supabaseKey) {
    return {
      success: false,
      code: 'SYNC_NOT_CONFIGURED',
      error: 'Clarity export or Supabase server credentials are missing.',
    };
  }
  if (![1, 2, 3].includes(days)) {
    return { success: false, code: 'INVALID_WINDOW', error: 'Clarity export supports 1, 2, or 3 days.' };
  }
  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
  console.log(`🔄 Fetching real-time insights from Microsoft Clarity (last ${days} day(s))...`);
  const url = `https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=${days}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Clarity API responded with ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Unexpected response format from Clarity API: expected array.');
    }

    const metricsMap = new Map();
    for (const item of data) {
      if (item.metricName && Array.isArray(item.information)) {
        metricsMap.set(item.metricName, item.information);
      }
    }

    // Extract core behavior signals
    const trafficInfo = metricsMap.get('Traffic')?.[0] || {};
    const deadClickInfo = metricsMap.get('DeadClickCount')?.[0] || {};
    const rageClickInfo = metricsMap.get('RageClickCount')?.[0] || {};
    const quickBackInfo = metricsMap.get('QuickbackClick')?.[0] || {};
    const excessiveScrollInfo = metricsMap.get('ExcessiveScroll')?.[0] || {};

    const totalSessions = trafficInfo.totalSessionCount ?? (deadClickInfo.sessionsCount || 0);
    const deadClicks = deadClickInfo.subTotal || 0;
    const rageClicks = rageClickInfo.subTotal || 0;
    const quickBacks = quickBackInfo.subTotal || 0;
    const excessiveScrolling = excessiveScrollInfo.subTotal || 0;

    const todayDate = new Date().toISOString().split('T')[0];

    // Global summary record
    const summaryRecord = {
      date: todayDate,
      page_path: '*',
      total_sessions: Number(totalSessions),
      rage_clicks: Number(rageClicks),
      dead_clicks: Number(deadClicks),
      quick_backs: Number(quickBacks),
      excessive_scrolling: Number(excessiveScrolling),
      created_at: new Date().toISOString(),
    };

    const pageMap = new Map();
    pageMap.set('*', summaryRecord);

    // Extract popular pages if present
    const popularPages = metricsMap.get('PopularPages') || [];
    for (const p of popularPages) {
      if (p.url) {
        try {
          const parsed = new URL(p.url);
          const path = parsed.pathname || '/';
          if (path !== '*') {
            const existing = pageMap.get(path);
            const visits = Number(p.visitsCount || 0);
            if (existing) {
              existing.total_sessions += visits;
            } else {
              pageMap.set(path, {
                date: todayDate,
                page_path: path,
                total_sessions: visits,
                rage_clicks: 0,
                dead_clicks: 0,
                quick_backs: 0,
                excessive_scrolling: 0,
                created_at: new Date().toISOString(),
              });
            }
          }
        } catch {
          // ignore malformed URLs
        }
      }
    }

    const recordsToUpsert = Array.from(pageMap.values());

    console.log(`📊 Upserting ${recordsToUpsert.length} unique record(s) into metrics_clarity_daily...`);
    const { error } = await supabase
      .from('metrics_clarity_daily')
      .upsert(recordsToUpsert, { onConflict: 'date,page_path' })
      .select();

    if (error) {
      console.error('❌ Supabase upsert error:', error.message);
      return { success: false, error: error.message };
    }

    console.log(`✅ Successfully synced ${recordsToUpsert.length} Clarity metrics row(s) to Supabase.`);
    console.log('Sample synced data:', summaryRecord);
    return { success: true, count: recordsToUpsert.length, data: recordsToUpsert };
  } catch (err) {
    console.error('❌ Clarity sync failed:', err.message);
    return { success: false, error: err.message };
  }
}

// Execute standalone if called directly
if (process.argv[1] && process.argv[1].endsWith('sync-clarity-to-supabase.mjs')) {
  syncClarityToSupabase(1).then((res) => {
    if (!res.success) process.exit(1);
  });
}

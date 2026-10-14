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

const CLARITY_TOKEN = process.env.CLARITY_API_TOKEN;
const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!CLARITY_TOKEN) {
  console.error('Error: CLARITY_API_TOKEN not found in .env');
  process.exit(1);
}

const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

/**
 * Fetch daily metrics from Microsoft Clarity Export API
 * and UPSERT into public.metrics_clarity_daily
 */
async function syncClarityMetrics() {
  console.log('🔄 Fetching Microsoft Clarity metrics...');
  const url = 'https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=1&dimension1=URL';

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CLARITY_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Clarity API responded with ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Clarity API response received. Processing items...`);

    const todayDate = new Date().toISOString().split('T')[0];

    // Aggregate summary row
    let totalSessions = 0;
    let totalRageClicks = 0;
    let totalDeadClicks = 0;
    let totalQuickBacks = 0;

    if (Array.isArray(data)) {
      data.forEach((item) => {
        totalSessions += Number(item.sessionCount || item.sessions || 0);
        totalRageClicks += Number(item.rageClickCount || item.rageClicks || 0);
        totalDeadClicks += Number(item.deadClickCount || item.deadClicks || 0);
        totalQuickBacks += Number(item.quickBackCount || item.quickBacks || 0);
      });
    }

    const summaryPayload = {
      date: todayDate,
      page_path: '*',
      total_sessions: totalSessions,
      rage_clicks: totalRageClicks,
      dead_clicks: totalDeadClicks,
      quick_backs: totalQuickBacks,
      created_at: new Date().toISOString(),
    };

    if (supabase) {
      const { error } = await supabase
        .from('metrics_clarity_daily')
        .upsert(summaryPayload, { onConflict: 'date,page_path' });

      if (error) {
        console.warn('⚠️ Notice inserting to metrics_clarity_daily (table may need migration):', error.message);
      } else {
        console.log(`📊 Successfully upserted Clarity daily metrics into Supabase for ${todayDate}:`, summaryPayload);
      }
    } else {
      console.log('Dry run (Supabase client not configured):', summaryPayload);
    }
  } catch (error) {
    console.error('❌ Failed to sync Clarity insights:', error.message);
  }
}

syncClarityMetrics();

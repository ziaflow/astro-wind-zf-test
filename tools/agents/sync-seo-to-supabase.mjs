import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing from environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

/**
 * 1. Seed or Upsert Google Search Console Data into Supabase
 */
export async function syncGscToSupabase(queriesData = []) {
  if (!queriesData || queriesData.length === 0) {
    console.log('ℹ️ No GSC queries provided for sync.');
    return { count: 0 };
  }

  const today = new Date().toISOString().split('T')[0];

  const rows = queriesData.map((q) => {
    // Calculate 1-10 opportunity score based on "striking distance"
    // Pos 4-20 with high impressions gets highest priority
    let priority = 5;
    if (q.position >= 4 && q.position <= 15) {
      priority = Math.min(10, Math.max(7, Math.ceil(q.impressions / 10)));
    } else if (q.position < 4) {
      priority = 4; // Already ranking top 3
    } else {
      priority = Math.min(6, Math.ceil(q.impressions / 20));
    }

    let cluster = 'General';
    const lower = (q.query || '').toLowerCase();
    if (lower.includes('automation') || lower.includes('crm') || lower.includes('lead')) {
      cluster = 'Marketing Automation';
    } else if (lower.includes('cro') || lower.includes('bounce') || lower.includes('conversion')) {
      cluster = 'CRO & Performance';
    } else if (lower.includes('ai') || lower.includes('native') || lower.includes('assistant')) {
      cluster = 'AI & Web Engineering';
    } else if (lower.includes('phoenix') || lower.includes('arizona') || lower.includes('tucson')) {
      cluster = 'Local Arizona Business';
    }

    return {
      query: q.query,
      impressions: q.impressions || 0,
      clicks: q.clicks || 0,
      position: Number(q.position || 0),
      ctr: Number(q.ctr || 0),
      date_recorded: today,
      opportunity_priority: priority,
      target_cluster: cluster,
    };
  });

  const { data, error } = await supabase
    .from('gsc_search_queries')
    .upsert(rows, { onConflict: 'query,date_recorded' })
    .select('id');

  if (error) {
    console.warn('⚠️ Error syncing GSC to Supabase (Ensure table exists in Supabase):', error.message);
    await logSyncHeartbeat('GSC', 'failed', 0, 0, error.message);
    return { count: 0, error };
  }

  console.log(`✅ Synced ${data?.length || rows.length} GSC queries into Supabase table: gsc_search_queries`);
  await logSyncHeartbeat(
    'GSC',
    'success',
    data?.length || rows.length,
    rows.filter((r) => r.opportunity_priority >= 7).length
  );
  return { count: data?.length || rows.length };
}

/**
 * 2. Ingest Microsoft Clarity Live Insights into Supabase
 */
export async function syncClarityToSupabase() {
  const clarityToken = process.env.CLARITY_API_TOKEN;
  if (!clarityToken) {
    console.warn('⚠️ CLARITY_API_TOKEN missing. Skipping Clarity sync.');
    return { count: 0 };
  }

  console.log('📡 Calling Microsoft Clarity Live Insights API...');
  try {
    const res = await fetch('https://www.clarity.ms/export-data/api/v1/project-live-insights', {
      headers: {
        Authorization: `Bearer ${clarityToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Clarity HTTP status ${res.status}: ${res.statusText}`);
    }

    const json = await res.json().catch(() => ({}));
    const today = new Date().toISOString().split('T')[0];

    // Format Clarity response rows or record global project friction snapshot
    const metricsRow = {
      page_url: 'https://ziaflow.com/',
      total_sessions: json?.totalSessions || json?.sessionsCount || 1,
      rage_click_count: json?.rageClicksCount || 0,
      dead_click_count: json?.deadClicksCount || 0,
      excessive_scroll_count: json?.excessiveScrollCount || 0,
      quick_back_count: json?.quickBacksCount || 0,
      scroll_depth_percent: Number(json?.avgScrollDepth || 55.0),
      date_recorded: today,
      ux_friction_score: Math.min(100, (json?.rageClicksCount || 0) * 5 + (json?.deadClicksCount || 0) * 2),
    };

    const { error } = await supabase
      .from('clarity_ux_metrics')
      .upsert([metricsRow], { onConflict: 'page_url,date_recorded' });

    if (error) {
      console.warn('⚠️ Supabase clarity_ux_metrics upsert warning:', error.message);
      await logSyncHeartbeat('CLARITY', 'warning', 0, 0, error.message);
      return { count: 0, error };
    }

    console.log('✅ Ingested Microsoft Clarity metrics into Supabase table: clarity_ux_metrics');
    await logSyncHeartbeat('CLARITY', 'success', 1, metricsRow.ux_friction_score > 30 ? 1 : 0);
    return { count: 1 };
  } catch (err) {
    console.warn('⚠️ Clarity ingestion error:', err.message);
    await logSyncHeartbeat('CLARITY', 'failed', 0, 0, err.message);
    return { count: 0, error: err };
  }
}

/**
 * 3. Log agent execution heartbeat to Supabase
 */
export async function logSyncHeartbeat(source, status, recordsIngested, opportunityCount, message = null) {
  try {
    await supabase.from('seo_agent_sync_logs').insert([
      {
        source,
        status,
        records_ingested: recordsIngested,
        opportunity_count: opportunityCount,
        message,
        metadata: { timestamp: new Date().toISOString() },
      },
    ]);
  } catch {
    // Non-blocking log
  }
}

/**
 * 4. Fetch Active "Striking Distance" Content Opportunities for Agents
 */
export async function getStrikingDistanceOpportunities(limit = 10) {
  const { data, error } = await supabase
    .from('gsc_search_queries')
    .select('*')
    .gte('opportunity_priority', 7)
    .order('opportunity_priority', { ascending: false })
    .order('impressions', { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data;
}

// Sample GSC dataset from your latest 3-month performance export
export const LATEST_GSC_DATASET = [
  { query: 'marketing automation phoenix', impressions: 62, clicks: 0, position: 11.5, ctr: 0 },
  {
    query: 'i run a small business in phoenix and need a website and internal tool built with ai',
    impressions: 22,
    clicks: 0,
    position: 2.4,
    ctr: 0,
  },
  { query: 'marketing automation for smbs arizona', impressions: 12, clicks: 0, position: 8.4, ctr: 0 },
  { query: 'marketing automation tucson', impressions: 11, clicks: 0, position: 21.9, ctr: 0 },
  { query: 'generate leads in arizona', impressions: 11, clicks: 0, position: 63.8, ctr: 0 },
  { query: 'seo workflow tool', impressions: 9, clicks: 0, position: 1.0, ctr: 0 },
  { query: 'crm automation for small business arizona', impressions: 9, clicks: 0, position: 17.1, ctr: 0 },
  {
    query: 'reduce bounce rates with better product recommendations',
    impressions: 8,
    clicks: 0,
    position: 75.5,
    ctr: 0,
  },
  { query: 'top phoenix cro agencies', impressions: 7, clicks: 0, position: 55.1, ctr: 0 },
  { query: 'business automation for local service pros', impressions: 7, clicks: 0, position: 62.0, ctr: 0 },
  { query: 'how to reduce bounce rate using ai?', impressions: 5, clicks: 0, position: 6.4, ctr: 0 },
  { query: 'marketing automation agency phoenix', impressions: 5, clicks: 0, position: 24.8, ctr: 0 },
  { query: 'ways to reduce bounce rates with ai', impressions: 2, clicks: 0, position: 2.0, ctr: 0 },
  { query: 'phoenix conversion rate optimization agency', impressions: 2, clicks: 0, position: 15.0, ctr: 0 },
  { query: 'website conversion checklist', impressions: 2, clicks: 0, position: 16.0, ctr: 0 },
  { query: 'phoenix conversion rate optimization services', impressions: 2, clicks: 0, position: 19.0, ctr: 0 },
];

/**
 * 5. Compile Daily Cross-Platform Executive Overview (The "Single Pane of Glass")
 */
export async function compileDailyExecutiveOverview() {
  const today = new Date().toISOString().split('T')[0];
  console.log(`📊 Compiling Daily Cross-Platform Rollup for ${today}...`);

  try {
    // 1. Inbound Leads & Submissions
    const [submissionsRes, leadsRes] = await Promise.all([
      supabase.from('contact_submissions').select('count', { count: 'exact', head: true }),
      supabase.from('lead_contacts').select('count', { count: 'exact', head: true }),
    ]);

    // 2. GSC Totals
    const { data: gscRows } = await supabase
      .from('gsc_search_queries')
      .select('impressions, clicks, position, query')
      .eq('date_recorded', today);

    let gscImpressions = 0;
    let gscClicks = 0;
    let weightedPositionSum = 0;
    let topQuery = 'None';
    let maxImp = -1;

    if (gscRows && gscRows.length > 0) {
      for (const row of gscRows) {
        gscImpressions += row.impressions;
        gscClicks += row.clicks;
        weightedPositionSum += row.position * row.impressions;
        if (row.impressions > maxImp) {
          maxImp = row.impressions;
          topQuery = row.query;
        }
      }
    }

    const gscAvgPosition = gscImpressions > 0 ? Number((weightedPositionSum / gscImpressions).toFixed(1)) : 0;

    // 3. Clarity UX Totals
    const { data: clarityRows } = await supabase.from('clarity_ux_metrics').select('*').eq('date_recorded', today);

    let claritySessions = 0;
    let clarityRageClicks = 0;
    let clarityDeadClicks = 0;
    let clarityFrictionScore = 0;

    if (clarityRows && clarityRows.length > 0) {
      claritySessions = clarityRows.reduce((acc, r) => acc + (r.total_sessions || 0), 0);
      clarityRageClicks = clarityRows.reduce((acc, r) => acc + (r.rage_click_count || 0), 0);
      clarityDeadClicks = clarityRows.reduce((acc, r) => acc + (r.dead_click_count || 0), 0);
      clarityFrictionScore = Math.round(
        clarityRows.reduce((acc, r) => acc + (r.ux_friction_score || 0), 0) / clarityRows.length
      );
    }

    // 4. GA4 Traffic Totals (from table or fallback defaults)
    const { data: ga4Rows } = await supabase.from('ga4_page_metrics').select('*').eq('date_recorded', today);

    let ga4Sessions = 0;
    let ga4BounceRate = 45.0;
    let topPage = '/';

    if (ga4Rows && ga4Rows.length > 0) {
      ga4Sessions = ga4Rows.reduce((acc, r) => acc + (r.sessions || 0), 0);
      ga4BounceRate = Number((ga4Rows.reduce((acc, r) => acc + (r.bounce_rate || 0), 0) / ga4Rows.length).toFixed(1));
      topPage = ga4Rows[0]?.page_path || '/';
    }

    // Calculate Composite Website Health Score (0-100)
    // High impressions + low friction + healthy bounce rate = high score
    let healthScore = 80;
    if (clarityFrictionScore > 40) healthScore -= 15;
    if (ga4BounceRate > 70) healthScore -= 10;
    if (gscImpressions > 50) healthScore += 10;
    healthScore = Math.max(10, Math.min(100, healthScore));

    const strategicSummary = `Website Health Score ${healthScore}/100. GSC logged ${gscImpressions} impressions across Valley commercial queries (Top query: "${topQuery}"). Clarity friction score: ${clarityFrictionScore}.`;

    const overviewRow = {
      date_recorded: today,
      gsc_total_impressions: gscImpressions,
      gsc_total_clicks: gscClicks,
      gsc_avg_position: gscAvgPosition,
      gsc_top_query: topQuery,
      ga4_total_sessions: ga4Sessions,
      ga4_active_users: Math.round(ga4Sessions * 0.85),
      ga4_avg_bounce_rate: ga4BounceRate,
      ga4_top_landing_page: topPage,
      clarity_total_sessions: claritySessions,
      clarity_total_rage_clicks: clarityRageClicks,
      clarity_total_dead_clicks: clarityDeadClicks,
      clarity_avg_ux_friction_score: clarityFrictionScore,
      form_submissions_count: submissionsRes?.count || 0,
      new_unique_leads_count: leadsRes?.count || 0,
      website_health_score: healthScore,
      agent_strategic_summary: strategicSummary,
    };

    const { error: upsertErr } = await supabase
      .from('daily_cross_platform_overview')
      .upsert([overviewRow], { onConflict: 'date_recorded' });

    if (upsertErr) {
      console.warn('⚠️ Supabase daily_cross_platform_overview warning:', upsertErr.message);
    } else {
      console.log('✅ Updated daily_cross_platform_overview in Supabase!');
      console.log(`   💡 Health Score: ${healthScore}/100 | Summary: ${strategicSummary}`);
    }

    return overviewRow;
  } catch (err) {
    console.warn('⚠️ Error compiling executive overview:', err.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Running SEO & Analytics Ingestion to Supabase...');
  await syncGscToSupabase(LATEST_GSC_DATASET);
  await syncClarityToSupabase();
  await compileDailyExecutiveOverview();
  console.log('🏁 Ingestion complete.');
}

if (process.argv[1]?.endsWith('sync-seo-to-supabase.mjs')) {
  main().catch(console.error);
}

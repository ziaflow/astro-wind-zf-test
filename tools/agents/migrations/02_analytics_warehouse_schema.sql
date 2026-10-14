-- ==============================================================================
-- ZiaFlow: Analytics Data Warehouse & Unified Intelligence Schema
-- Purpose:
--   1. Individual tables for each telemetry source:
--      • metrics_gsc_daily       (Google Search Console: Search impressions, clicks, rank)
--      • metrics_ga4_daily       (Google Analytics 4: Sessions, active users, bounce rate)
--      • metrics_clarity_daily   (Microsoft Clarity: Session counts, rage clicks, dead clicks)
--      • metrics_customerio_daily (Customer.io: Delivery, opens, clicks, unsubscribes)
--   2. Unified View (view_unified_page_intelligence):
--      • Combines Acquisition (GSC) + On-Site Behavior (GA4) + Friction (Clarity) + Leads (Supabase)
--      • Pre-aggregated so Antigravity AI agents can instantly audit performance without huge joins
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Google Search Console Daily Metrics (Search Demand & Visibility)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.metrics_gsc_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  page_path TEXT NOT NULL,
  query TEXT DEFAULT '',
  clicks INT DEFAULT 0,
  impressions INT DEFAULT 0,
  ctr NUMERIC(6, 4) DEFAULT 0,
  position NUMERIC(6, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(date, page_path, query)
);

CREATE INDEX IF NOT EXISTS idx_gsc_date_page ON public.metrics_gsc_daily (date DESC, page_path);
CREATE INDEX IF NOT EXISTS idx_gsc_query ON public.metrics_gsc_daily (query);

-- ------------------------------------------------------------------------------
-- 2. Google Analytics 4 Daily Metrics (Traffic, Sessions & On-Page Engagement)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.metrics_ga4_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  page_path TEXT NOT NULL,
  active_users INT DEFAULT 0,
  sessions INT DEFAULT 0,
  conversions INT DEFAULT 0,
  bounce_rate NUMERIC(6, 4) DEFAULT 0,
  avg_engagement_time_sec NUMERIC(8, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(date, page_path)
);

CREATE INDEX IF NOT EXISTS idx_ga4_date_page ON public.metrics_ga4_daily (date DESC, page_path);

-- ------------------------------------------------------------------------------
-- 3. Microsoft Clarity Daily Metrics (UX Friction & Struggle Signals)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.metrics_clarity_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  page_path TEXT NOT NULL DEFAULT '*',
  total_sessions INT DEFAULT 0,
  rage_clicks INT DEFAULT 0,
  dead_clicks INT DEFAULT 0,
  quick_backs INT DEFAULT 0,
  excessive_scrolling INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(date, page_path)
);

CREATE INDEX IF NOT EXISTS idx_clarity_date ON public.metrics_clarity_daily (date DESC);

-- ------------------------------------------------------------------------------
-- 4. Customer.io Daily Metrics (Messaging Health & Nurture Engagement)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.metrics_customerio_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  campaign_id TEXT NOT NULL DEFAULT 'all',
  campaign_name TEXT DEFAULT 'Global',
  sent INT DEFAULT 0,
  delivered INT DEFAULT 0,
  opened INT DEFAULT 0,
  clicked INT DEFAULT 0,
  unsubscribed INT DEFAULT 0,
  spammed INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(date, campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_cio_date ON public.metrics_customerio_daily (date DESC);

-- ==============================================================================
-- 5. Unified Intelligence View: The Single Pane of Glass for AI Agents
-- ==============================================================================
CREATE OR REPLACE VIEW public.view_unified_page_intelligence AS
WITH gsc_agg AS (
  SELECT 
    date,
    page_path,
    SUM(clicks) AS total_google_clicks,
    SUM(impressions) AS total_google_impressions,
    ROUND(AVG(position), 1) AS avg_google_position
  FROM public.metrics_gsc_daily
  GROUP BY date, page_path
),
leads_agg AS (
  SELECT 
    DATE(created_at) AS date,
    COALESCE(page_submitted_from, '/') AS page_path,
    COUNT(*) AS leads_generated
  FROM public.leads
  GROUP BY DATE(created_at), page_submitted_from
)
SELECT 
  COALESCE(ga.date, gsc.date, leads.date) AS date,
  COALESCE(ga.page_path, gsc.page_path, leads.page_path) AS page_path,
  
  -- Acquisition (Search Console)
  COALESCE(gsc.total_google_clicks, 0) AS google_clicks,
  COALESCE(gsc.total_google_impressions, 0) AS google_impressions,
  gsc.avg_google_position,
  
  -- Engagement (GA4)
  COALESCE(ga.sessions, 0) AS ga_sessions,
  COALESCE(ga.active_users, 0) AS ga_active_users,
  COALESCE(ga.bounce_rate, 0) AS bounce_rate,
  COALESCE(ga.avg_engagement_time_sec, 0) AS avg_engagement_time_sec,
  
  -- Friction Signals (Clarity)
  COALESCE(cl.rage_clicks, 0) AS clarity_rage_clicks,
  COALESCE(cl.dead_clicks, 0) AS clarity_dead_clicks,
  COALESCE(cl.quick_backs, 0) AS clarity_quick_backs,
  
  -- Business Outcome (Supabase Leads)
  COALESCE(leads.leads_generated, 0) AS leads_generated,

  -- Computed Conversion Rate (Leads / Sessions)
  CASE 
    WHEN COALESCE(ga.sessions, 0) > 0 
    THEN ROUND((COALESCE(leads.leads_generated, 0)::NUMERIC / ga.sessions) * 100, 2)
    ELSE 0 
  END AS conversion_rate_percent,

  -- Agent Diagnostic Signal
  CASE
    WHEN COALESCE(cl.rage_clicks, 0) > 5 OR COALESCE(cl.dead_clicks, 0) > 10 THEN '⚠️ High UX Friction'
    WHEN COALESCE(gsc.total_google_impressions, 0) > 200 AND COALESCE(ga.sessions, 0) < 10 THEN '🔍 Low CTR / Snippet Optimization Needed'
    WHEN COALESCE(ga.sessions, 0) > 50 AND COALESCE(leads.leads_generated, 0) = 0 THEN '📉 Traffic Without Conversion'
    WHEN COALESCE(leads.leads_generated, 0) > 0 THEN '✅ Performing Lead Driver'
    ELSE 'ℹ️ Normal Traffic'
  END AS agent_health_signal

FROM public.metrics_ga4_daily ga
FULL OUTER JOIN gsc_agg gsc 
  ON ga.date = gsc.date AND ga.page_path = gsc.page_path
FULL OUTER JOIN public.metrics_clarity_daily cl 
  ON COALESCE(ga.date, gsc.date) = cl.date 
  AND (cl.page_path = '*' OR cl.page_path = COALESCE(ga.page_path, gsc.page_path))
FULL OUTER JOIN leads_agg leads 
  ON COALESCE(ga.date, gsc.date) = leads.date 
  AND COALESCE(ga.page_path, gsc.page_path) = leads.page_path;

-- ==============================================================================
-- 6. Row Level Security Policies
-- ==============================================================================
ALTER TABLE public.metrics_gsc_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics_ga4_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics_clarity_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics_customerio_daily ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role full access on gsc" ON public.metrics_gsc_daily FOR ALL TO service_role USING (true) WITH CHECK (true);
  CREATE POLICY "Service role full access on ga4" ON public.metrics_ga4_daily FOR ALL TO service_role USING (true) WITH CHECK (true);
  CREATE POLICY "Service role full access on clarity" ON public.metrics_clarity_daily FOR ALL TO service_role USING (true) WITH CHECK (true);
  CREATE POLICY "Service role full access on customerio" ON public.metrics_customerio_daily FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

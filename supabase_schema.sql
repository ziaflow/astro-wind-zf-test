-- ==============================================================================
-- ZiaFlow: contact_submissions Table Schema, Indexes, & RLS Configuration
-- Run this in your Supabase SQL Editor
-- ==============================================================================

-- 1. Create enum for form processing lifecycle stages
DO $$ BEGIN
  CREATE TYPE form_pipeline_status AS ENUM ('pending', 'processed', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create the primary fallback submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  -- Unique tracking ID generated on the client to ensure retry idempotency
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identifies which form context sent the payload (e.g., 'contact-page', 'audit-booking')
  form_id VARCHAR(50) NOT NULL,

  -- The complete form payload stored cleanly as structured data (name, email, company, etc.)
  payload JSONB NOT NULL,

  -- Captured routing and tracking data (UTMs, page path, timing, attachments)
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Pipeline management metrics
  status form_pipeline_status NOT NULL DEFAULT 'pending',
  error_log TEXT,

  -- Client networking details for auditing and abuse mitigation
  ip_address INET,
  user_agent TEXT,

  -- Audit timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Automatic updated_at trigger mechanism
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_contact_submissions_modtime ON public.contact_submissions;
CREATE TRIGGER update_contact_submissions_modtime
  BEFORE UPDATE ON public.contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- ==============================================================================
-- Performance & Deduplication Indexes
-- ==============================================================================

-- Speeds up internal administrative audit lookups by specific form sources
CREATE INDEX IF NOT EXISTS idx_contact_submissions_form_id 
  ON public.contact_submissions (form_id);

-- GIN index to speed up structural deep queries into custom fields inside the JSONB payload
CREATE INDEX IF NOT EXISTS idx_contact_submissions_payload_jsonb 
  ON public.contact_submissions USING gin (payload);

-- Speeds up chronological inbox feed and dashboard sorting
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at 
  ON public.contact_submissions (created_at DESC);

-- Speeds up background worker retries for any payloads that failed downstream sync
CREATE INDEX IF NOT EXISTS idx_contact_submissions_retry_status 
  ON public.contact_submissions (status) 
  WHERE status = 'failed';

-- ==============================================================================
-- Strict Row-Level Security (RLS) Policies
-- ==============================================================================
-- Because the form pipeline runs server-side in Astro Actions via serverless endpoints,
-- browser clients should never read or write to this table directly.
-- The Astro server connects via the Supabase SERVICE_ROLE secret key,
-- which bypasses RLS while keeping the public Data API locked down.

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Deny all public read actions (prevents malicious listing of data and PII harvesting)
DROP POLICY IF EXISTS "Deny public select access" ON public.contact_submissions;
CREATE POLICY "Deny public select access" 
  ON public.contact_submissions 
  FOR SELECT 
  TO public 
  USING (false);

-- Deny all public insert actions (forces submission traffic through the Astro Action pipeline)
DROP POLICY IF EXISTS "Deny public insertion access" ON public.contact_submissions;
CREATE POLICY "Deny public insertion access" 
  ON public.contact_submissions 
  FOR INSERT 
  TO public 
  WITH CHECK (false);

-- ==============================================================================
-- 4. Central Communications & Activity Log Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.communications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel VARCHAR(30) NOT NULL, -- 'form', 'email', 'chat', 'booking', 'system'
  direction VARCHAR(10) NOT NULL, -- 'inbound', 'outbound'
  status VARCHAR(20) NOT NULL DEFAULT 'received', -- 'received', 'sent', 'delivered', 'failed'
  subject TEXT,
  sender TEXT,
  recipient TEXT,
  content TEXT,
  page_path TEXT,
  form_id VARCHAR(50),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_communications_log_created_at 
  ON public.communications_log (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_communications_log_channel 
  ON public.communications_log (channel);

CREATE INDEX IF NOT EXISTS idx_communications_log_page_path 
  ON public.communications_log (page_path);

ALTER TABLE public.communications_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deny public select communications_log" ON public.communications_log;
CREATE POLICY "Deny public select communications_log" 
  ON public.communications_log 
  FOR SELECT 
  TO public 
  USING (false);

-- ==============================================================================
-- 5. Central Blog & Omni-Channel Social Hub
-- ==============================================================================

-- Core content posts & blog drafts
CREATE TABLE IF NOT EXISTS public.content_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT,
  body_markdown TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'scheduled', 'published'
  category VARCHAR(50),
  target_audience TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_content_posts_status ON public.content_posts (status);
CREATE INDEX IF NOT EXISTS idx_content_posts_created_at ON public.content_posts (created_at DESC);

-- Channel variations & social distributions
CREATE TABLE IF NOT EXISTS public.channel_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.content_posts(id) ON DELETE CASCADE,
  platform VARCHAR(30) NOT NULL, -- 'blog', 'linkedin', 'twitter', 'facebook', 'instagram'
  content_variant TEXT NOT NULL,
  media_urls JSONB DEFAULT '[]'::jsonb,
  external_post_id TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'queued', 'published', 'failed'
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  -- Tracked performance KPIs
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  engagements INT DEFAULT 0,
  conversions INT DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_channel_distributions_post_id ON public.channel_distributions (post_id);
CREATE INDEX IF NOT EXISTS idx_channel_distributions_platform ON public.channel_distributions (platform);
CREATE INDEX IF NOT EXISTS idx_channel_distributions_status ON public.channel_distributions (status);

ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_distributions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deny public select content_posts" ON public.content_posts;
CREATE POLICY "Deny public select content_posts" 
  ON public.content_posts FOR SELECT TO public USING (false);

DROP POLICY IF EXISTS "Deny public select channel_distributions" ON public.channel_distributions;
CREATE POLICY "Deny public select channel_distributions" 
  ON public.channel_distributions FOR SELECT TO public USING (false);

-- ==============================================================================
-- 6. Autonomous Search, Analytics, & UX Feedback Intelligence Engine
-- ==============================================================================

-- 6.1 Google Search Console Query & Position Trajectory
CREATE TABLE IF NOT EXISTS public.gsc_search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  impressions INT NOT NULL DEFAULT 0,
  clicks INT NOT NULL DEFAULT 0,
  position NUMERIC(5, 2) NOT NULL,
  ctr NUMERIC(5, 2) NOT NULL DEFAULT 0,
  date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
  opportunity_priority INT NOT NULL DEFAULT 5, -- 1-10 striking distance score
  target_cluster TEXT,                         -- e.g. 'Marketing Automation', 'Phoenix CRO'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_gsc_query_date UNIQUE (query, date_recorded)
);

CREATE INDEX IF NOT EXISTS idx_gsc_query ON public.gsc_search_queries (query);
CREATE INDEX IF NOT EXISTS idx_gsc_date ON public.gsc_search_queries (date_recorded DESC);
CREATE INDEX IF NOT EXISTS idx_gsc_priority ON public.gsc_search_queries (opportunity_priority DESC);

-- 6.2 Google Analytics 4 Page Engagement & Conversions
CREATE TABLE IF NOT EXISTS public.ga4_page_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  sessions INT NOT NULL DEFAULT 0,
  active_users INT NOT NULL DEFAULT 0,
  bounce_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
  avg_engagement_seconds INT NOT NULL DEFAULT 0,
  conversions INT NOT NULL DEFAULT 0,
  date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
  needs_cro_audit BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_ga4_page_date UNIQUE (page_path, date_recorded)
);

CREATE INDEX IF NOT EXISTS idx_ga4_path ON public.ga4_page_metrics (page_path);
CREATE INDEX IF NOT EXISTS idx_ga4_date ON public.ga4_page_metrics (date_recorded DESC);
CREATE INDEX IF NOT EXISTS idx_ga4_audit ON public.ga4_page_metrics (needs_cro_audit) WHERE needs_cro_audit = true;

-- 6.3 Microsoft Clarity UX Friction & User Behavior Telemetry
CREATE TABLE IF NOT EXISTS public.clarity_ux_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL,
  total_sessions INT NOT NULL DEFAULT 0,
  rage_click_count INT NOT NULL DEFAULT 0,
  dead_click_count INT NOT NULL DEFAULT 0,
  excessive_scroll_count INT NOT NULL DEFAULT 0,
  quick_back_count INT NOT NULL DEFAULT 0,
  scroll_depth_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
  ux_friction_score INT NOT NULL DEFAULT 0, -- 0-100 rating
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_clarity_page_date UNIQUE (page_url, date_recorded)
);

CREATE INDEX IF NOT EXISTS idx_clarity_url ON public.clarity_ux_metrics (page_url);
CREATE INDEX IF NOT EXISTS idx_clarity_date ON public.clarity_ux_metrics (date_recorded DESC);
CREATE INDEX IF NOT EXISTS idx_clarity_friction ON public.clarity_ux_metrics (ux_friction_score DESC);

-- 6.4 Autonomous Agent Sync & Execution Heartbeat Log
CREATE TABLE IF NOT EXISTS public.seo_agent_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(50) NOT NULL, -- 'GSC', 'GA4', 'CLARITY', 'ALL'
  status VARCHAR(20) NOT NULL DEFAULT 'success', -- 'success', 'warning', 'failed'
  records_ingested INT NOT NULL DEFAULT 0,
  opportunity_count INT NOT NULL DEFAULT 0,
  message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_source ON public.seo_agent_sync_logs (source);
CREATE INDEX IF NOT EXISTS idx_sync_logs_date ON public.seo_agent_sync_logs (executed_at DESC);

-- Row Level Security (Service Role authenticated access for AI agents)
ALTER TABLE public.gsc_search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ga4_page_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clarity_ux_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_agent_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on gsc_search_queries" 
  ON public.gsc_search_queries FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access on ga4_page_metrics" 
  ON public.ga4_page_metrics FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access on clarity_ux_metrics" 
  ON public.clarity_ux_metrics FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access on seo_agent_sync_logs" 
  ON public.seo_agent_sync_logs FOR ALL TO service_role USING (true);

-- ==============================================================================
-- 7. Unified Multi-Database & Cross-Platform Executive Overview Model
-- ==============================================================================

-- 7.1 Dedicated Leads & Contact Identity Table (Normalized with Page Context)
CREATE TABLE IF NOT EXISTS public.lead_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  company_name TEXT,
  first_seen_page_path TEXT NOT NULL,
  last_seen_page_path TEXT NOT NULL,
  initial_referral_source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  total_inquiries INT NOT NULL DEFAULT 1,
  lifecycle_stage VARCHAR(30) NOT NULL DEFAULT 'lead', -- 'lead', 'qualified', 'customer', 'unresponsive'
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_lead_email UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON public.lead_contacts (email);
CREATE INDEX IF NOT EXISTS idx_leads_created ON public.lead_contacts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_lifecycle ON public.lead_contacts (lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_leads_first_page ON public.lead_contacts (first_seen_page_path);

ALTER TABLE public.lead_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on lead_contacts" 
  ON public.lead_contacts FOR ALL TO service_role USING (true);

-- 7.2 Central Cross-Platform Performance Rollup (The Executive "Single Pane of Glass")
CREATE TABLE IF NOT EXISTS public.daily_cross_platform_overview (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Organic Search Visibility (Google Search Console)
  gsc_total_impressions INT NOT NULL DEFAULT 0,
  gsc_total_clicks INT NOT NULL DEFAULT 0,
  gsc_avg_position NUMERIC(5, 2) NOT NULL DEFAULT 0,
  gsc_top_query TEXT,

  -- Traffic & Engagement (Google Analytics 4)
  ga4_total_sessions INT NOT NULL DEFAULT 0,
  ga4_active_users INT NOT NULL DEFAULT 0,
  ga4_avg_bounce_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
  ga4_top_landing_page TEXT,

  -- UX Friction & Behavior (Microsoft Clarity)
  clarity_total_sessions INT NOT NULL DEFAULT 0,
  clarity_total_rage_clicks INT NOT NULL DEFAULT 0,
  clarity_total_dead_clicks INT NOT NULL DEFAULT 0,
  clarity_avg_ux_friction_score INT NOT NULL DEFAULT 0,

  -- Inbound Conversions & Pipeline (Lead Capture)
  form_submissions_count INT NOT NULL DEFAULT 0,
  new_unique_leads_count INT NOT NULL DEFAULT 0,
  consultation_bookings_count INT NOT NULL DEFAULT 0,

  -- Overall Website Health Score (Composite 0-100 index evaluated by Agent)
  website_health_score INT NOT NULL DEFAULT 85,
  agent_strategic_summary TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_platform_overview_date UNIQUE (date_recorded)
);

CREATE INDEX IF NOT EXISTS idx_overview_date ON public.daily_cross_platform_overview (date_recorded DESC);

ALTER TABLE public.daily_cross_platform_overview ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on daily_cross_platform_overview" 
  ON public.daily_cross_platform_overview FOR ALL TO service_role USING (true);

-- 7.3 Instant Real-Time Cross-Platform Executive View
CREATE OR REPLACE VIEW public.v_cross_platform_dashboard_snapshot AS
SELECT
  CURRENT_DATE AS snapshot_date,
  (SELECT COUNT(*) FROM public.lead_contacts) AS total_leads,
  (SELECT COUNT(*) FROM public.contact_submissions WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') AS submissions_last_30d,
  (SELECT COALESCE(SUM(impressions), 0) FROM public.gsc_search_queries WHERE date_recorded = CURRENT_DATE) AS gsc_impressions_today,
  (SELECT COALESCE(SUM(clicks), 0) FROM public.gsc_search_queries WHERE date_recorded = CURRENT_DATE) AS gsc_clicks_today,
  (SELECT COALESCE(SUM(sessions), 0) FROM public.ga4_page_metrics WHERE date_recorded = CURRENT_DATE) AS ga4_sessions_today,
  (SELECT COALESCE(AVG(bounce_rate), 0) FROM public.ga4_page_metrics WHERE date_recorded = CURRENT_DATE) AS ga4_avg_bounce_today,
  (SELECT COALESCE(SUM(rage_click_count), 0) FROM public.clarity_ux_metrics WHERE date_recorded = CURRENT_DATE) AS clarity_rage_clicks_today,
  (SELECT COALESCE(AVG(ux_friction_score), 0) FROM public.clarity_ux_metrics WHERE date_recorded = CURRENT_DATE) AS clarity_friction_score_today;



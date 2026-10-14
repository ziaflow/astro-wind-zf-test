-- ==============================================================================
-- ZiaFlow: Hardened Production Schema Migration
-- Purpose: Supervised Lead-to-Delivery Operations
-- Security Model:
--   • anon (Public Web): INSERT-only on leads with strict WITH CHECK guards
--   • service_role (Astro API / Admin / Agents): Full administrative access
--   • Zero read access for anonymous visitors across all tables
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Ensure `leads` table exists with proper constraints
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  service_needed TEXT,
  comments TEXT,
  page_submitted_from TEXT DEFAULT 'Unknown',
  status VARCHAR(30) NOT NULL DEFAULT 'new'
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads (status);

-- ------------------------------------------------------------------------------
-- 2. Communications Log Table (Powers /admin/communications feed)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.communications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  channel VARCHAR(30) NOT NULL, -- 'form', 'email', 'chat', 'booking', 'system'
  direction VARCHAR(20) NOT NULL, -- 'inbound', 'outbound'
  status VARCHAR(30) NOT NULL DEFAULT 'received', -- 'received', 'sent', 'delivered', 'failed', 'pending'
  subject TEXT,
  sender TEXT,
  recipient TEXT,
  content TEXT,
  page_path TEXT,
  form_id VARCHAR(50),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_comms_log_created_at ON public.communications_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comms_log_channel ON public.communications_log (channel);

-- ------------------------------------------------------------------------------
-- 3. Opportunities Table (5-Dimensional State Machine & Start Gate)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  
  -- State Dimension: Stage
  stage VARCHAR(40) NOT NULL DEFAULT 'new_inquiry',
  -- 'new_inquiry', 'acknowledged', 'qualification_drafted', 'human_approved',
  -- 'discovery_scheduled', 'scope_approved', 'start_gate_cleared', 'active_project',
  -- 'milestones_delivered', 'payment_reconciled', 'evidence_candidate', 'closed_won', 'closed_lost'
  
  qualification_fit VARCHAR(30) DEFAULT 'unscreened', -- 'high_fit', 'moderate_fit', 'out_of_scope', 'unscreened'
  qualification_notes TEXT,
  
  -- Commercials & Scope (Agency SOW Model)
  offer_package VARCHAR(50), -- 'website_conversion', 'lead_automation', 'growth_maintenance'
  quoted_amount_cents BIGINT,
  scope_deliverables JSONB DEFAULT '[]'::jsonb,
  scope_exclusions JSONB DEFAULT '[]'::jsonb,
  
  -- Controlled Start Gate (Hard checklist before work begins)
  start_gate_signed_agreement BOOLEAN DEFAULT FALSE,
  start_gate_deposit_received BOOLEAN DEFAULT FALSE,
  start_gate_access_verified BOOLEAN DEFAULT FALSE,
  start_gate_cleared_at TIMESTAMPTZ,
  
  -- Human Governance
  owner VARCHAR(50) DEFAULT 'Jeremy Sanchez',
  next_action_due TIMESTAMPTZ,
  next_action_description TEXT
);

CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON public.opportunities (stage);

-- ------------------------------------------------------------------------------
-- 4. Blog SEO & Citation Tracking (Sync target from Sanity Webhook)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_seo_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sanity_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  meta_description TEXT,
  editorial_status TEXT DEFAULT 'approved',
  target_keywords TEXT[] DEFAULT '{}'::text[],
  published_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blog_seo_slug ON public.blog_seo_tracking (slug);

-- ------------------------------------------------------------------------------
-- 5. Client Projects & Milestones
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.client_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'onboarding', -- 'onboarding', 'in_progress', 'qa', 'client_accepted', 'completed'
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMPTZ,
  milestones JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- ------------------------------------------------------------------------------
-- 6. Evidence Candidates (Feeds back into Sanity Claims Register)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.evidence_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.client_projects(id) ON DELETE CASCADE,
  baseline_metric TEXT,
  outcome_metric TEXT,
  client_quote TEXT,
  client_permission_granted BOOLEAN DEFAULT FALSE,
  synced_to_sanity BOOLEAN DEFAULT FALSE,
  sanity_claim_id TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 7. Hardened Row Level Security (RLS) Configuration
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_seo_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_candidates ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- LEADS TABLE POLICIES:
-- 1. Public (anon) can ONLY insert new records.
--    WITH CHECK enforces that visitors cannot alter status to bypass review.
-- 2. Public can NEVER read, update, or delete existing leads.
-- 3. Service role has full access.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public anonymous lead submission" ON public.leads;
CREATE POLICY "Public anonymous lead submission"
  ON public.leads
  FOR INSERT
  TO anon
  WITH CHECK (
    status = 'new'
    AND length(trim(name)) > 0
    AND length(trim(email)) > 3
    AND email LIKE '%@%'
  );

-- ------------------------------------------------------------------------------
-- SERVICE ROLE POLICIES: Full Administrative Access
-- ------------------------------------------------------------------------------
DO $$ BEGIN
  -- Leads
  DROP POLICY IF EXISTS "Service role full access on leads" ON public.leads;
  CREATE POLICY "Service role full access on leads" ON public.leads FOR ALL TO service_role USING (true) WITH CHECK (true);

  -- Communications Log
  DROP POLICY IF EXISTS "Service role full access on comms" ON public.communications_log;
  CREATE POLICY "Service role full access on comms" ON public.communications_log FOR ALL TO service_role USING (true) WITH CHECK (true);

  -- Opportunities
  DROP POLICY IF EXISTS "Service role full access on opportunities" ON public.opportunities;
  CREATE POLICY "Service role full access on opportunities" ON public.opportunities FOR ALL TO service_role USING (true) WITH CHECK (true);

  -- Blog SEO Tracking
  DROP POLICY IF EXISTS "Service role full access on blog seo" ON public.blog_seo_tracking;
  CREATE POLICY "Service role full access on blog seo" ON public.blog_seo_tracking FOR ALL TO service_role USING (true) WITH CHECK (true);

  -- Client Projects
  DROP POLICY IF EXISTS "Service role full access on projects" ON public.client_projects;
  CREATE POLICY "Service role full access on projects" ON public.client_projects FOR ALL TO service_role USING (true) WITH CHECK (true);

  -- Evidence Candidates
  DROP POLICY IF EXISTS "Service role full access on evidence" ON public.evidence_candidates;
  CREATE POLICY "Service role full access on evidence" ON public.evidence_candidates FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

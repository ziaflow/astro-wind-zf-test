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

-- Migration: 20261106154500_create_agent_handoffs_and_heartbeats.sql
-- Description: Creates tables for cross-agent task handoff auditing and distributed heartbeat tracking across Hermes, Antigravity, and Orca runtimes.

-- 1. Agent Handoffs Audit Table
CREATE TABLE IF NOT EXISTS public.agent_handoffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id TEXT NOT NULL,                                       -- Linear ticket, GitHub issue, or internal job ID
    source_agent TEXT NOT NULL,                                  -- 'hermes', 'antigravity', 'orca', 'system'
    target_agent TEXT NOT NULL,                                  -- 'hermes', 'antigravity', 'orca', 'human'
    handoff_type TEXT NOT NULL,                                  -- 'task_creation', 'gui_verification', 'code_refactor', 'triage'
    state TEXT NOT NULL DEFAULT 'pending',                       -- 'pending', 'running', 'completed', 'failed', 'circuit_tripped'
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 2,
    timeout_seconds INTEGER NOT NULL DEFAULT 90,
    payload JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indexes for rapid handoff queries and state transitions
CREATE INDEX IF NOT EXISTS idx_agent_handoffs_source_target ON public.agent_handoffs (source_agent, target_agent);
CREATE INDEX IF NOT EXISTS idx_agent_handoffs_task_id ON public.agent_handoffs (task_id);
CREATE INDEX IF NOT EXISTS idx_agent_handoffs_state ON public.agent_handoffs (state);

-- 2. Agent Heartbeats & Health Monitoring Table
CREATE TABLE IF NOT EXISTS public.agent_heartbeats (
    runtime_name TEXT NOT NULL,                                  -- 'hermes-daemon', 'antigravity-worker', 'orca-sandbox'
    profile_name TEXT NOT NULL,                                  -- 'triage', 'web-engineer', 'sales-leads', etc.
    pid INTEGER,
    host_id TEXT NOT NULL DEFAULT 'hpwdzia',
    status TEXT NOT NULL DEFAULT 'healthy',                      -- 'healthy', 'stalled', 'dead', 'recovering'
    current_task_id TEXT,
    turn_count INTEGER NOT NULL DEFAULT 0,
    max_allowed_turns INTEGER NOT NULL DEFAULT 3,
    last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    PRIMARY KEY (runtime_name, profile_name, host_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_heartbeats_last_active ON public.agent_heartbeats (last_heartbeat);

-- RLS Security: Restrict direct client updates to service role and authenticated agents
ALTER TABLE public.agent_handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_heartbeats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access to agent_handoffs"
    ON public.agent_handoffs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow service role full access to agent_heartbeats"
    ON public.agent_heartbeats
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

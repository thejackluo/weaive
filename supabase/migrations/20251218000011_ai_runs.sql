-- Migration 011: ai_runs (HIGH PRIORITY FOR AI COST CONTROL)
-- Purpose: Track AI generation runs for caching, cost tracking, and debugging
-- Story: 0.2b - Database Schema Refinement + Critical Tables
-- Why Required: Meets AI-C1-C4 cost control requirements. Without this, $2,500/month budget at risk.

-- Enum types for AI tracking
CREATE TYPE ai_module AS ENUM (
  'onboarding',      -- Goal breakdown during onboarding
  'triad',           -- Daily Triad generation
  'recap',           -- Daily recap/insights after reflection
  'dream_self',      -- Dream Self chat conversations
  'weekly_insights', -- Weekly pattern analysis
  'goal_breakdown',  -- New goal → binds decomposition
  'chat'             -- General AI chat responses
);

CREATE TYPE ai_run_status AS ENUM ('queued', 'running', 'success', 'failed', 'fallback');

-- AI runs table
CREATE TABLE ai_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  module ai_module NOT NULL,
  input_hash TEXT NOT NULL,  -- SHA256 hash of input params for deduplication/caching
  prompt_version TEXT NOT NULL,  -- Prompt template version (e.g., "triad-v1.2")
  model TEXT NOT NULL,  -- 'gpt-4o-mini', 'claude-3.7-sonnet', or 'deterministic'
  params_json JSONB,  -- Full input parameters for debugging
  status ai_run_status DEFAULT 'queued',
  cost_estimate NUMERIC(10, 6),  -- USD cost (e.g., 0.002500 = $0.0025)
  tokens_input INT,  -- Input token count
  tokens_output INT,  -- Output token count
  execution_time_ms INT,  -- How long AI took to respond
  error_message TEXT,  -- If status = 'failed', what went wrong
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes - CRITICAL for caching and cost analysis
CREATE INDEX idx_ai_runs_user_module ON ai_runs(user_id, module, created_at DESC);
CREATE INDEX idx_ai_runs_input_hash ON ai_runs(input_hash) WHERE status = 'success';  -- Cache lookup
CREATE INDEX idx_ai_runs_cost_tracking ON ai_runs(created_at, status) WHERE cost_estimate IS NOT NULL;
CREATE INDEX idx_ai_runs_status ON ai_runs(status, created_at) WHERE status IN ('queued', 'running');

-- Comments for documentation
COMMENT ON TABLE ai_runs IS 'AI generation tracking for caching, cost control, and debugging. Enables $0.10/user/month cost target.';
COMMENT ON COLUMN ai_runs.input_hash IS 'SHA256 hash of normalized input. Used for caching - if same hash exists with success, reuse output.';
COMMENT ON COLUMN ai_runs.prompt_version IS 'Version of prompt template. Enables A/B testing and prompt improvements without losing history.';
COMMENT ON COLUMN ai_runs.model IS 'Which AI model: gpt-4o-mini (90%), claude-3.7-sonnet (10% complex), deterministic (fallback).';
COMMENT ON COLUMN ai_runs.cost_estimate IS 'USD cost. Sum daily to enforce budget: Alert at 50%, throttle at 80%, cache-only at 100%.';
COMMENT ON INDEX idx_ai_runs_input_hash ON ai_runs IS 'CACHE LOOKUP: Check if we already generated output for this input. Reduces cost by 80%+.';

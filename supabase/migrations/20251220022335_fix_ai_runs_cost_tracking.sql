-- Migration: Fix AI Runs Cost Tracking
-- Purpose: Add provider column and fix token column names to match application code
-- Story: 0.6 - Cost tracking security fix
-- Issue: Cost tracking verification failing - users can bypass rate limits
--
-- Changes:
-- 1. Add ai_provider ENUM type
-- 2. Add provider column to ai_runs
-- 3. Rename tokens_input → input_tokens
-- 4. Rename tokens_output → output_tokens
-- 5. Create get_daily_cost_by_provider() RPC function for cost queries

-- 1. Create ai_provider ENUM type (if not exists)
DO $$ BEGIN
  CREATE TYPE ai_provider AS ENUM (
    'openai',       -- OpenAI GPT models (fallback #1)
    'anthropic',    -- Anthropic Claude models (fallback #2)
    'bedrock',      -- AWS Bedrock (primary)
    'deterministic', -- Deterministic fallback (ultimate)
    'cache'         -- Cache hit (no cost)
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE ai_provider IS 'AI provider types for cost tracking and fallback chain analysis';

-- 2. Add provider column (if not exists)
DO $$ BEGIN
  ALTER TABLE ai_runs ADD COLUMN provider ai_provider;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

COMMENT ON COLUMN ai_runs.provider IS 'Which AI provider was used: bedrock (primary), openai (fallback #1), anthropic (fallback #2), deterministic (ultimate fallback), cache (no cost)';

-- 3. Rename token columns to match application code (if not already renamed)
DO $$ BEGIN
  ALTER TABLE ai_runs RENAME COLUMN tokens_input TO input_tokens;
EXCEPTION
  WHEN undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE ai_runs RENAME COLUMN tokens_output TO output_tokens;
EXCEPTION
  WHEN undefined_column THEN NULL;
END $$;

-- 4. Create index on provider for cost analysis queries (if not exists)
CREATE INDEX IF NOT EXISTS idx_ai_runs_provider_cost ON ai_runs(provider, created_at, cost_estimate)
  WHERE cost_estimate IS NOT NULL AND status = 'success';

COMMENT ON INDEX idx_ai_runs_provider_cost IS 'Fast provider-level cost aggregation and analytics';

-- 5. Create RPC function for daily cost by provider
CREATE OR REPLACE FUNCTION get_daily_cost_by_provider(target_date DATE)
RETURNS TABLE (
  provider ai_provider,
  total_cost NUMERIC,
  call_count BIGINT,
  avg_cost NUMERIC,
  total_input_tokens BIGINT,
  total_output_tokens BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ai_runs.provider,
    COALESCE(SUM(ai_runs.cost_estimate), 0) AS total_cost,
    COUNT(*) AS call_count,
    COALESCE(AVG(ai_runs.cost_estimate), 0) AS avg_cost,
    COALESCE(SUM(ai_runs.input_tokens), 0) AS total_input_tokens,
    COALESCE(SUM(ai_runs.output_tokens), 0) AS total_output_tokens
  FROM ai_runs
  WHERE
    DATE(ai_runs.created_at) = target_date
    AND ai_runs.status = 'success'
    AND ai_runs.cost_estimate IS NOT NULL
  GROUP BY ai_runs.provider
  ORDER BY total_cost DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_daily_cost_by_provider IS 'Get daily cost breakdown by AI provider. Used for budget monitoring and provider health analysis. Query: SELECT * FROM get_daily_cost_by_provider(CURRENT_DATE)';

-- 6. Backfill provider for existing rows (if any exist without provider)
-- Set to 'bedrock' if model contains bedrock, 'openai' if gpt, 'anthropic' if claude, else deterministic
UPDATE ai_runs
SET provider = CASE
  WHEN model LIKE '%bedrock%' OR model LIKE '%us.anthropic%' THEN 'bedrock'::ai_provider
  WHEN model LIKE '%gpt%' OR model LIKE '%openai%' THEN 'openai'::ai_provider
  WHEN model LIKE '%claude%' OR model LIKE '%anthropic%' THEN 'anthropic'::ai_provider
  WHEN model = 'deterministic' THEN 'deterministic'::ai_provider
  ELSE 'deterministic'::ai_provider
END
WHERE provider IS NULL;

-- 7. Make provider column NOT NULL after backfill (if not already set)
DO $$ BEGIN
  ALTER TABLE ai_runs ALTER COLUMN provider SET NOT NULL;
EXCEPTION
  WHEN others THEN NULL;  -- Column already NOT NULL or doesn't exist
END $$;

-- Verification queries (run these after migration):
--
-- 1. Check schema:
--    SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'ai_runs' ORDER BY ordinal_position;
--
-- 2. Check today's costs by provider:
--    SELECT * FROM get_daily_cost_by_provider(CURRENT_DATE);
--
-- 3. Check recent runs:
--    SELECT id, provider, model, input_tokens, output_tokens, cost_estimate, status, created_at
--    FROM ai_runs
--    ORDER BY created_at DESC
--    LIMIT 10;

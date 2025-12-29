-- Story 6.2: Contextual AI Responses - Context Tracking Schema
--
-- Adds columns to ai_runs and user_profiles for tracking context usage,
-- response quality, and personality preferences.
--
-- Performance indexes added to meet <500ms context assembly target.

-- ============================================================================
-- AI RUNS TABLE - Context Usage Tracking
-- ============================================================================

-- Add context_used column (tracks if user context was injected)
ALTER TABLE ai_runs ADD COLUMN IF NOT EXISTS context_used BOOLEAN DEFAULT false;

-- Add context_assembly_time_ms column (performance monitoring)
ALTER TABLE ai_runs ADD COLUMN IF NOT EXISTS context_assembly_time_ms INT;

-- Add quality_flag column (response quality tracking)
ALTER TABLE ai_runs ADD COLUMN IF NOT EXISTS quality_flag TEXT
  CHECK (quality_flag IN ('generic', 'specific', 'excellent'));

-- Column documentation
COMMENT ON COLUMN ai_runs.context_used IS 'Whether user context was injected into AI prompt (Story 6.2)';
COMMENT ON COLUMN ai_runs.context_assembly_time_ms IS 'Time to assemble user context snapshot (target: <500ms)';
COMMENT ON COLUMN ai_runs.quality_flag IS 'AI response quality: generic (retry triggered), specific (good), excellent (cites data)';


-- ============================================================================
-- USER PROFILES TABLE - Dual Personality System
-- ============================================================================

-- Add active_personality column (Dream Self vs Weave AI toggle)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS active_personality TEXT
  CHECK (active_personality IN ('dream_self', 'weave_ai'))
  DEFAULT 'weave_ai';

COMMENT ON COLUMN user_profiles.active_personality IS 'Active AI personality: dream_self (personalized) or weave_ai (general coach)';

-- Add weave_ai_preset column (Story 6.1 personality styles)
-- Only used when active_personality='weave_ai'
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS weave_ai_preset TEXT
  CHECK (weave_ai_preset IN ('gen_z_default', 'supportive_coach', 'concise_mentor'))
  DEFAULT 'gen_z_default';

COMMENT ON COLUMN user_profiles.weave_ai_preset IS 'Weave AI personality preset (Story 6.1): gen_z_default (short, warm), supportive_coach (encouraging), concise_mentor (ultra-brief)';


-- ============================================================================
-- PERFORMANCE INDEXES - Context Assembly Optimization
-- ============================================================================

-- Index for recent completions query (used in _fetch_recent_activity)
-- Critical for <500ms context assembly target
CREATE INDEX IF NOT EXISTS idx_subtask_completions_user_recent
  ON subtask_completions(user_id, completed_at DESC);

-- Index for recent journal entries query (used in _fetch_journal_entries)
-- Critical for <500ms context assembly target
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_recent
  ON journal_entries(user_id, local_date DESC);

-- Index for active goals query (used in _fetch_goals)
CREATE INDEX IF NOT EXISTS idx_goals_user_status_recent
  ON goals(user_id, status, created_at DESC);

-- Note: identity_docs already has idx_identity_docs_user_version index
-- from migration 20251218000002_identity_docs.sql
-- No additional index needed for _fetch_identity query


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify columns were added
DO $$
BEGIN
    -- Check ai_runs columns
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'ai_runs' AND column_name = 'context_used') THEN
        RAISE NOTICE '[OK] ai_runs.context_used column created';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'ai_runs' AND column_name = 'context_assembly_time_ms') THEN
        RAISE NOTICE '[OK] ai_runs.context_assembly_time_ms column created';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'ai_runs' AND column_name = 'quality_flag') THEN
        RAISE NOTICE '[OK] ai_runs.quality_flag column created';
    END IF;

    -- Check user_profiles columns
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'user_profiles' AND column_name = 'active_personality') THEN
        RAISE NOTICE '[OK] user_profiles.active_personality column created';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'user_profiles' AND column_name = 'weave_ai_preset') THEN
        RAISE NOTICE '[OK] user_profiles.weave_ai_preset column created';
    END IF;

    -- Check indexes
    IF EXISTS (SELECT 1 FROM pg_indexes
               WHERE indexname = 'idx_subtask_completions_user_recent') THEN
        RAISE NOTICE '[OK] idx_subtask_completions_user_recent index created';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_indexes
               WHERE indexname = 'idx_journal_entries_user_recent') THEN
        RAISE NOTICE '[OK] idx_journal_entries_user_recent index created';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_indexes
               WHERE indexname = 'idx_goals_user_status_recent') THEN
        RAISE NOTICE '[OK] idx_goals_user_status_recent index created';
    END IF;
END $$;

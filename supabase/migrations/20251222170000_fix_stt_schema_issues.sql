-- Migration: Fix STT Schema Issues
-- Purpose: Fix route conflicts and database schema mismatches for STT functionality
-- Date: 2025-12-22
-- Issues Fixed:
--   1. Add missing created_at column to daily_aggregates table
--   2. Add STT providers to ai_provider enum (assemblyai, whisper)

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. ADD MISSING CREATED_AT COLUMN TO DAILY_AGGREGATES
-- ═══════════════════════════════════════════════════════════════════════════════
-- Issue: Rate limiting code expects created_at but table only has updated_at
-- Solution: Add created_at column with default value

ALTER TABLE daily_aggregates 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Set created_at to updated_at for existing rows (best approximation)
UPDATE daily_aggregates 
SET created_at = updated_at 
WHERE created_at IS NULL;

-- Make created_at NOT NULL after backfill
ALTER TABLE daily_aggregates 
ALTER COLUMN created_at SET NOT NULL;

COMMENT ON COLUMN daily_aggregates.created_at IS 'When this daily aggregate record was first created. Used for rate limiting queries.';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. ADD STT PROVIDERS TO AI_PROVIDER ENUM
-- ═══════════════════════════════════════════════════════════════════════════════
-- Issue: ai_provider enum missing STT providers (assemblyai, whisper)
-- Solution: Add new enum values for STT services

-- Add assemblyai to ai_provider enum
DO $$ 
BEGIN
    ALTER TYPE ai_provider ADD VALUE IF NOT EXISTS 'assemblyai';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Add whisper to ai_provider enum  
DO $$ 
BEGIN
    ALTER TYPE ai_provider ADD VALUE IF NOT EXISTS 'whisper';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Update comments to reflect new enum values
COMMENT ON TYPE ai_provider IS 'AI provider types: openai, anthropic, bedrock, deterministic, cache, assemblyai (STT), whisper (STT)';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. VERIFICATION QUERIES
-- ═══════════════════════════════════════════════════════════════════════════════
-- Run these after migration to verify fixes:

-- Check daily_aggregates schema has created_at
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'daily_aggregates' 
-- ORDER BY ordinal_position;

-- Check ai_provider enum values include STT providers
-- SELECT enumlabel 
-- FROM pg_enum 
-- WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ai_provider')
-- ORDER BY enumlabel;
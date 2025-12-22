-- Migration: Add AI Vision Analysis Columns
-- Story: 0.9 - AI-Powered Image Service (8 pts expansion)
-- Purpose: Add AI vision analysis to existing captures table
-- Date: 2025-12-21

-- ═══════════════════════════════════════════════════════════════════════
-- AI VISION COLUMNS
-- ═══════════════════════════════════════════════════════════════════════

-- Add AI analysis columns to captures table
ALTER TABLE captures ADD COLUMN IF NOT EXISTS ai_analysis JSONB;
ALTER TABLE captures ADD COLUMN IF NOT EXISTS ai_verified BOOLEAN DEFAULT false;
ALTER TABLE captures ADD COLUMN IF NOT EXISTS ai_quality_score INT;

-- ═══════════════════════════════════════════════════════════════════════
-- CONSTRAINTS
-- ═══════════════════════════════════════════════════════════════════════

-- Add quality score constraint (1-5 rating, null if analysis failed)
ALTER TABLE captures ADD CONSTRAINT check_ai_quality_score
  CHECK (ai_quality_score IS NULL OR (ai_quality_score BETWEEN 1 AND 5));

-- ═══════════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════════

-- Add index for verified proofs (partial index for performance)
CREATE INDEX IF NOT EXISTS idx_captures_ai_verified
  ON captures(ai_verified) WHERE ai_verified = true;

-- Add index for quality scores (for filtering high-quality images)
CREATE INDEX IF NOT EXISTS idx_captures_ai_quality_score
  ON captures(ai_quality_score) WHERE ai_quality_score IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════
-- COMMENTS (Documentation)
-- ═══════════════════════════════════════════════════════════════════════

COMMENT ON COLUMN captures.ai_analysis IS 'JSONB: Gemini 3.0 Flash vision analysis. Schema: {provider: string, validation_score: number, is_verified: boolean, ocr_text: string, categories: [{label: string, confidence: number}], quality_score: number, timestamp: ISO8601}';
COMMENT ON COLUMN captures.ai_verified IS 'True if validation_score >= 80 (AI-verified badge). False if score < 80 or analysis failed.';
COMMENT ON COLUMN captures.ai_quality_score IS '1-5 rating of image quality (lighting, focus, relevance). Null if AI analysis unavailable.';

-- ═══════════════════════════════════════════════════════════════════════
-- RATE LIMITING COLUMNS (daily_aggregates)
-- ═══════════════════════════════════════════════════════════════════════

-- Add upload tracking columns for rate limiting (5 images/day, 5MB/day, 5 AI analyses/day)
ALTER TABLE daily_aggregates ADD COLUMN IF NOT EXISTS upload_count INT DEFAULT 0;
ALTER TABLE daily_aggregates ADD COLUMN IF NOT EXISTS upload_size_mb DECIMAL DEFAULT 0;
ALTER TABLE daily_aggregates ADD COLUMN IF NOT EXISTS ai_vision_count INT DEFAULT 0;

-- Add comments for rate limiting columns
COMMENT ON COLUMN daily_aggregates.upload_count IS 'Number of images uploaded today (max 5/day free tier)';
COMMENT ON COLUMN daily_aggregates.upload_size_mb IS 'Total MB uploaded today (max 5MB/day free tier)';
COMMENT ON COLUMN daily_aggregates.ai_vision_count IS 'Number of AI vision analyses today (max 5/day free tier)';

-- ═══════════════════════════════════════════════════════════════════════
-- MIGRATION NOTES
-- ═══════════════════════════════════════════════════════════════════════
--
-- AI Analysis JSONB Structure:
-- {
--   "provider": "gemini-3-flash-preview",
--   "validation_score": 85,
--   "is_verified": true,
--   "ocr_text": "Bench press 135 lbs x 10 reps",
--   "categories": [
--     {"label": "gym", "confidence": 0.92},
--     {"label": "workspace", "confidence": 0.15}
--   ],
--   "quality_score": 4,
--   "timestamp": "2025-12-21T10:30:00Z"
-- }
--
-- Cost Impact:
-- - Gemini 3.0 Flash: FREE during preview, then ~$0.02/image
-- - Rate limit: 5 AI analyses/day per user (free tier)
-- - Budget: $3/month per user at full utilization
--
-- Performance:
-- - Indexed queries for verified proofs: O(log n)
-- - Quality score filtering: O(log n) with partial index

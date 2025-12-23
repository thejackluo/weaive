-- Migration 20251221000003: STT Rate Limiting Columns
-- Purpose: Add STT usage tracking to daily_aggregates for rate limiting
-- Story: 0.11 - Voice/Speech-to-Text Infrastructure
-- Date: 2025-12-21

-- ═══════════════════════════════════════════════════════════════════════════════
-- DAILY_AGGREGATES TABLE ENHANCEMENTS
-- ═══════════════════════════════════════════════════════════════════════════════
-- Track STT usage per user per day for rate limiting
-- Limits: 50 transcriptions/day, 300 minutes total audio/day (5 min max per request)

ALTER TABLE daily_aggregates
ADD COLUMN IF NOT EXISTS stt_request_count INT DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS stt_duration_minutes DECIMAL(10, 2) DEFAULT 0 NOT NULL;

COMMENT ON COLUMN daily_aggregates.stt_request_count IS 'Number of STT transcription requests made today. Limit: 50/day.';
COMMENT ON COLUMN daily_aggregates.stt_duration_minutes IS 'Total audio duration transcribed today (minutes). Limit: 300 min/day (5 hrs total).';

-- ═══════════════════════════════════════════════════════════════════════════════
-- AI_RUNS TABLE ENHANCEMENTS
-- ═══════════════════════════════════════════════════════════════════════════════
-- Track STT-specific metadata for cost tracking and provider fallback analysis

ALTER TABLE ai_runs
ADD COLUMN IF NOT EXISTS audio_duration_sec INT,
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3, 2);

COMMENT ON COLUMN ai_runs.audio_duration_sec IS 'Duration of audio file transcribed (seconds). Used for cost calculation.';
COMMENT ON COLUMN ai_runs.confidence_score IS 'STT confidence score (0-1.0). Higher = more accurate transcript.';

-- Note: provider column already exists in ai_runs table
-- Values for STT: 'assemblyai', 'whisper', 'manual' (no transcription)

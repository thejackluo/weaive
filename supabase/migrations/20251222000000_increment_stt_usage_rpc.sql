-- Migration: Atomic STT Usage Increment RPC Function
-- Created: 2025-12-22
-- Purpose: Prevent race conditions when incrementing daily_aggregates counters
--
-- Story 0.11: Voice/Speech-to-Text API - Code Review Issue #1
-- Problem: Multiple concurrent transcription requests can cause lost updates
--          when incrementing stt_request_count and stt_duration_minutes
-- Solution: PostgreSQL RPC function with atomic INSERT ... ON CONFLICT ... UPDATE

-- ═══════════════════════════════════════════════════════════════════════
-- FUNCTION: increment_stt_usage
-- ═══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION increment_stt_usage(
    p_user_id TEXT,
    p_local_date DATE,
    p_duration_minutes NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Run with function creator's privileges
AS $$
BEGIN
    -- Atomic upsert using INSERT ... ON CONFLICT
    -- This is safe from race conditions because PostgreSQL locks the row
    INSERT INTO daily_aggregates (
        user_id,
        local_date,
        stt_request_count,
        stt_duration_minutes,
        created_at,
        updated_at
    )
    VALUES (
        p_user_id::uuid,  -- Cast TEXT to UUID
        p_local_date,
        1,  -- First request
        p_duration_minutes,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id, local_date)
    DO UPDATE SET
        stt_request_count = daily_aggregates.stt_request_count + 1,
        stt_duration_minutes = daily_aggregates.stt_duration_minutes + p_duration_minutes,
        updated_at = NOW();
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════
-- GRANT PERMISSIONS
-- ═══════════════════════════════════════════════════════════════════════

-- Grant execute to authenticated users (service_role can call from backend)
GRANT EXECUTE ON FUNCTION increment_stt_usage(TEXT, DATE, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_stt_usage(TEXT, DATE, NUMERIC) TO service_role;

-- ═══════════════════════════════════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════════════════════════════════

COMMENT ON FUNCTION increment_stt_usage IS
'Atomically increment STT usage counters in daily_aggregates table.
Safe from race conditions using INSERT ... ON CONFLICT ... UPDATE pattern.
Used by /api/transcribe endpoint after successful transcription.';

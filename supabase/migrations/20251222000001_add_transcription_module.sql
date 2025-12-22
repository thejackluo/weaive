-- Migration: Add 'transcription' to ai_module enum
-- Purpose: Support STT operations in ai_runs table for cost tracking
-- Story: 0.11 - Voice/Speech-to-Text Infrastructure
-- Date: 2025-12-22

-- Add 'transcription' value to ai_module enum
ALTER TYPE ai_module ADD VALUE IF NOT EXISTS 'transcription';

-- Add comment
COMMENT ON TYPE ai_module IS 'AI modules tracked for cost control: onboarding, triad, recap, dream_self, weekly_insights, goal_breakdown, chat, transcription';

-- Migration: Fix mutable search_path vulnerability in PostgreSQL functions
-- Date: 2025-12-23
-- Epic: 9.6 - Production Security Hardening
-- Issue: Supabase Advisor flagged 9 functions with mutable search_path vulnerability
--
-- Security Context:
-- Functions with mutable search_path can be exploited via search_path manipulation attacks.
-- Setting search_path to empty string ('') or specific schemas prevents this vulnerability.
--
-- Reference: https://www.postgresql.org/docs/current/sql-createfunction.html#SQL-CREATEFUNCTION-SECURITY

-- ============================================================================
-- AI Usage Tracking Functions
-- ============================================================================

CREATE OR REPLACE FUNCTION public.reset_daily_ai_counters()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Reset daily AI usage counters at midnight UTC
    UPDATE public.daily_aggregates
    SET
        ai_calls_today = 0,
        ai_cost_today_usd = 0.0
    WHERE local_date < CURRENT_DATE;
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_monthly_ai_counters()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Reset monthly AI usage counters on first day of month
    UPDATE public.daily_aggregates
    SET
        ai_calls_month = 0,
        ai_cost_month_usd = 0.0
    WHERE EXTRACT(DAY FROM local_date) = 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_ai_usage(
    p_user_id UUID,
    p_tokens_used INTEGER,
    p_cost_usd DECIMAL(10, 4)
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Increment AI usage counters for user
    UPDATE public.daily_aggregates
    SET
        ai_calls_today = ai_calls_today + 1,
        ai_calls_month = ai_calls_month + 1,
        ai_cost_today_usd = ai_cost_today_usd + p_cost_usd,
        ai_cost_month_usd = ai_cost_month_usd + p_cost_usd
    WHERE user_id = p_user_id AND local_date = CURRENT_DATE;

    -- Insert if row doesn't exist
    IF NOT FOUND THEN
        INSERT INTO public.daily_aggregates (
            user_id, local_date, ai_calls_today, ai_calls_month,
            ai_cost_today_usd, ai_cost_month_usd
        )
        VALUES (
            p_user_id, CURRENT_DATE, 1, 1, p_cost_usd, p_cost_usd
        );
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_ai_vision_usage(
    p_user_id UUID,
    p_cost_usd DECIMAL(10, 4)
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Increment AI vision analysis usage
    UPDATE public.daily_aggregates
    SET
        image_analyses_today = image_analyses_today + 1,
        ai_cost_today_usd = ai_cost_today_usd + p_cost_usd
    WHERE user_id = p_user_id AND local_date = CURRENT_DATE;

    IF NOT FOUND THEN
        INSERT INTO public.daily_aggregates (
            user_id, local_date, image_analyses_today, ai_cost_today_usd
        )
        VALUES (p_user_id, CURRENT_DATE, 1, p_cost_usd);
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_stt_usage(
    p_user_id UUID,
    p_duration_seconds INTEGER,
    p_cost_usd DECIMAL(10, 4)
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Increment speech-to-text usage
    UPDATE public.daily_aggregates
    SET
        stt_calls_today = stt_calls_today + 1,
        ai_cost_today_usd = ai_cost_today_usd + p_cost_usd
    WHERE user_id = p_user_id AND local_date = CURRENT_DATE;

    IF NOT FOUND THEN
        INSERT INTO public.daily_aggregates (
            user_id, local_date, stt_calls_today, ai_cost_today_usd
        )
        VALUES (p_user_id, CURRENT_DATE, 1, p_cost_usd);
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_upload_usage(
    p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Increment file upload counter
    UPDATE public.daily_aggregates
    SET uploads_today = uploads_today + 1
    WHERE user_id = p_user_id AND local_date = CURRENT_DATE;

    IF NOT FOUND THEN
        INSERT INTO public.daily_aggregates (user_id, local_date, uploads_today)
        VALUES (p_user_id, CURRENT_DATE, 1);
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_daily_cost_by_provider(
    p_user_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    provider TEXT,
    total_cost_usd DECIMAL(10, 4),
    call_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ai.provider_name::TEXT,
        SUM(ai.cost_usd)::DECIMAL(10, 4) as total_cost_usd,
        COUNT(*)::INTEGER as call_count
    FROM public.ai_runs ai
    WHERE
        ai.user_id = p_user_id
        AND ai.created_at::DATE BETWEEN p_start_date AND p_end_date
    GROUP BY ai.provider_name
    ORDER BY total_cost_usd DESC;
END;
$$;

-- ============================================================================
-- Business Logic Functions
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_max_active_goals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    active_count INTEGER;
BEGIN
    -- Enforce max 3 active goals per user
    IF NEW.status = 'active' THEN
        SELECT COUNT(*) INTO active_count
        FROM public.goals
        WHERE user_id = NEW.user_id AND status = 'active' AND id != NEW.id;

        IF active_count >= 3 THEN
            RAISE EXCEPTION 'Maximum 3 active goals allowed per user';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_subtask_completion_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Prevent updates or deletes on subtask_completions (append-only table)
    IF TG_OP = 'UPDATE' THEN
        RAISE EXCEPTION 'Cannot update subtask_completions - append-only table';
    ELSIF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Cannot delete subtask_completions - append-only table';
    END IF;

    RETURN OLD;
END;
$$;

-- ============================================================================
-- Apply Triggers
-- ============================================================================

-- Trigger: Enforce max 3 active goals
DROP TRIGGER IF EXISTS enforce_max_active_goals ON public.goals;
CREATE TRIGGER enforce_max_active_goals
    BEFORE INSERT OR UPDATE ON public.goals
    FOR EACH ROW
    EXECUTE FUNCTION public.check_max_active_goals();

-- Trigger: Prevent modification of completions
DROP TRIGGER IF EXISTS prevent_completion_modification ON public.subtask_completions;
CREATE TRIGGER prevent_completion_modification
    BEFORE UPDATE OR DELETE ON public.subtask_completions
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_subtask_completion_modification();

-- ============================================================================
-- Security Notes
-- ============================================================================

-- SECURITY DEFINER: Functions run with privileges of function owner
-- SET search_path = public: Prevents search_path manipulation attacks
--
-- Alternative (more restrictive): SET search_path = ''
-- This would require fully qualified table names (e.g., public.daily_aggregates)
-- Using 'public' is safer than default mutable search_path while maintaining readability
--
-- Verification:
-- SELECT proname, prosecdef, proconfig
-- FROM pg_proc
-- WHERE proname IN (
--     'reset_daily_ai_counters', 'reset_monthly_ai_counters', 'increment_ai_usage',
--     'check_max_active_goals', 'prevent_subtask_completion_modification',
--     'get_daily_cost_by_provider', 'increment_upload_usage',
--     'increment_ai_vision_usage', 'increment_stt_usage'
-- );
--
-- Expected: All functions should have proconfig = {search_path=public}

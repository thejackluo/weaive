"""
Goals API Router - Story 2.1: Needles List View

Endpoints:
- GET /api/goals - List active goals with stats

Implements AC1 and AC4 from Story 2.1
"""

import logging
from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client

from app.core.deps import get_current_user, get_supabase_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/goals")


@router.get("")
async def list_goals(
    status_filter: str = Query("active", alias="status", description="Filter by goal status"),
    include_stats: bool = Query(False, description="Include consistency and bind stats"),
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    List user's goals with optional stats.

    Query Parameters:
    - status: Filter by goal status (default: 'active')
    - include_stats: Include consistency_7d and active_binds_count (default: false)

    Returns:
    - data: Array of goals with stats
    - meta: Metadata including total count and active_goal_limit

    Acceptance Criteria:
    - AC1: Display up to 3 active goals
    - AC4: Calculate consistency from daily_aggregates (7-day rolling average)
    """
    if not supabase:
        logger.error("❌ Supabase client not configured")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database not configured",
        )

    # Extract user ID from JWT (auth.uid() is in the 'sub' claim)
    auth_user_id = user.get("sub")
    if not auth_user_id:
        logger.error("❌ JWT payload missing 'sub' field (user ID)")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    logger.info(f"[GOALS_API] Request from auth_user_id: {auth_user_id}")

    try:
        # First, get the user_profile.id from auth_user_id
        # RLS pattern: auth.uid() -> user_profiles.auth_user_id -> user_profiles.id
        user_profile_response = (
            supabase.table("user_profiles")
            .select("id")
            .eq("auth_user_id", auth_user_id)
            .single()
            .execute()
        )

        if not user_profile_response.data:
            logger.error(f"❌ No user profile found for auth_user_id: {auth_user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )

        user_id = user_profile_response.data["id"]
        logger.info(f"[GOALS_API] Found user_profile.id: {user_id}")
        logger.debug(f"✅ Resolved user_id: {user_id} for auth_user_id: {auth_user_id}")

        # Build the goals query
        query = supabase.table("goals").select(
            "id, title, description, status, created_at, updated_at, user_id"
        )

        # Filter by user_id (RLS enforced)
        query = query.eq("user_id", user_id)

        # Filter by status
        if status_filter:
            query = query.eq("status", status_filter)

        # Order by updated_at DESC (most recent first)
        query = query.order("updated_at", desc=True)

        # Limit to 3 active goals (AC1)
        query = query.limit(3)

        # Execute query
        response = query.execute()
        goals = response.data

        logger.info(f"[GOALS_API] Query returned {len(goals)} goals for user_id: {user_id}")

        # If include_stats is true, fetch consistency and bind data for each goal
        if include_stats:
            goals = await _enrich_goals_with_stats(supabase, goals, user_id)

        # Return standard response format
        return {
            "data": goals,
            "meta": {
                "total": len(goals),
                "active_goal_limit": 3,
            },
        }

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching goals: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch goals",
        )


async def _enrich_goals_with_stats(
    supabase: Client, goals: list[dict], user_id: str
) -> list[dict]:
    """
    Enrich goals with consistency_7d and active_binds_count.

    AC4: Consistency Data Accuracy
    - Calculate consistency_7d from daily_aggregates (7-day rolling average)
    - Count active subtask_templates (is_active=true)
    - Return null for consistency_7d if less than 7 days of data

    Args:
        supabase: Supabase client
        goals: List of goal dictionaries
        user_id: User ID for RLS enforcement

    Returns:
        List of goals with additional fields:
        - consistency_7d: float | null (7-day average consistency score)
        - active_binds_count: int (count of active subtask templates)
    """
    # Calculate date 7 days ago for consistency calculation
    seven_days_ago = (date.today() - timedelta(days=7)).isoformat()

    for goal in goals:
        goal_id = goal["id"]

        # Fetch daily_aggregates for last 7 days
        try:
            aggregates_response = (
                supabase.table("daily_aggregates")
                .select("consistency_score")
                .eq("user_id", user_id)
                .eq("goal_id", goal_id)
                .gte("local_date", seven_days_ago)
                .execute()
            )

            aggregates = aggregates_response.data
            logger.debug(
                f"📊 Goal {goal_id}: Found {len(aggregates)} daily aggregates"
            )

            # Calculate consistency_7d (average of consistency_score)
            if len(aggregates) >= 7:
                # Goal has at least 7 days of data
                total_consistency = sum(
                    agg["consistency_score"] for agg in aggregates
                )
                consistency_7d = round(total_consistency / len(aggregates), 2)
            else:
                # New goal (less than 7 days of data) -> null
                consistency_7d = None

            goal["consistency_7d"] = consistency_7d

        except Exception as e:
            logger.error(f"❌ Error fetching aggregates for goal {goal_id}: {str(e)}")
            goal["consistency_7d"] = None

        # Count active subtask_templates (binds)
        try:
            binds_response = (
                supabase.table("subtask_templates")
                .select("id", count="exact")
                .eq("goal_id", goal_id)
                .eq("is_active", True)
                .execute()
            )

            active_binds_count = binds_response.count or 0
            logger.debug(f"📊 Goal {goal_id}: {active_binds_count} active binds")

            goal["active_binds_count"] = active_binds_count

        except Exception as e:
            logger.error(f"❌ Error counting binds for goal {goal_id}: {str(e)}")
            goal["active_binds_count"] = 0

    return goals

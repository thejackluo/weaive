"""
Goals API Router - Story 2.1 & 2.2: Needles List and Detail View

Endpoints:
- GET /api/goals - List active goals with stats
- GET /api/goals/{goal_id} - Get single goal with full details

Implements AC1 and AC4 from Story 2.1, US-2.2 detail view
"""

import logging
from datetime import date, timedelta

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


@router.get("/{goal_id}")
async def get_goal_by_id(
    goal_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Get single goal by ID with full details (US-2.2: View Goal Details).

    Path Parameters:
    - goal_id: UUID of the goal

    Returns:
    - data: Goal object with stats, qgoals (milestones), and binds
    - meta: Metadata with timestamp

    RLS: User can only access their own goals
    """
    if not supabase:
        logger.error("❌ Supabase client not configured")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database not configured",
        )

    # Extract user ID from JWT
    auth_user_id = user.get("sub")
    if not auth_user_id:
        logger.error("❌ JWT payload missing 'sub' field (user ID)")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    logger.info(f"[GOALS_API] Get goal {goal_id} for auth_user_id: {auth_user_id}")

    try:
        # Get user_profile.id from auth_user_id (RLS pattern)
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
        logger.debug(f"✅ Resolved user_id: {user_id} for auth_user_id: {auth_user_id}")

        # Fetch the goal (RLS enforced - user can only see their own goals)
        goal_response = (
            supabase.table("goals")
            .select("id, title, description, status, priority, start_date, target_date, created_at, updated_at, user_id")
            .eq("id", goal_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )

        if not goal_response.data:
            logger.warning(f"⚠️ Goal {goal_id} not found for user {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Goal not found",
            )

        goal = goal_response.data
        logger.info(f"✅ Found goal {goal_id}: {goal.get('title')}")

        # Enrich with stats (consistency_7d, active_binds_count)
        goals_with_stats = await _enrich_goals_with_stats(supabase, [goal], user_id)
        enriched_goal = goals_with_stats[0]

        # Fetch qgoals (milestones) for this goal
        try:
            qgoals_response = (
                supabase.table("qgoals")
                .select("id, goal_id, title, metric_name, target_value, current_value, unit, created_at, updated_at")
                .eq("goal_id", goal_id)
                .order("created_at", desc=False)
                .execute()
            )
            enriched_goal["qgoals"] = qgoals_response.data or []
            logger.debug(f"📊 Goal {goal_id}: Found {len(enriched_goal['qgoals'])} qgoals")
        except Exception as e:
            logger.error(f"❌ Error fetching qgoals for goal {goal_id}: {str(e)}")
            enriched_goal["qgoals"] = []

        # Fetch subtask_templates (binds) for this goal
        try:
            binds_response = (
                supabase.table("subtask_templates")
                .select("id, goal_id, title, description, frequency_type, frequency_value, is_archived, created_at, updated_at")
                .eq("goal_id", goal_id)
                .eq("is_archived", False)  # Only active binds
                .order("created_at", desc=False)
                .execute()
            )
            enriched_goal["binds"] = binds_response.data or []
            logger.debug(f"📊 Goal {goal_id}: Found {len(enriched_goal['binds'])} active binds")
        except Exception as e:
            logger.error(f"❌ Error fetching binds for goal {goal_id}: {str(e)}")
            enriched_goal["binds"] = []

        # Return standard response format
        return {
            "data": enriched_goal,
            "meta": {
                "timestamp": date.today().isoformat(),
            },
        }

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching goal {goal_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch goal",
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
                .select("active_day_with_proof, completed_count")
                .eq("user_id", user_id)
                .gte("local_date", seven_days_ago)
                .execute()
            )

            aggregates = aggregates_response.data
            logger.debug(
                f"📊 Goal {goal_id}: Found {len(aggregates)} daily aggregates"
            )

            # Calculate consistency_7d (% of active days with proof)
            if len(aggregates) >= 7:
                # Goal has at least 7 days of data
                # Consistency = % of days that were active (had completions and proof)
                active_days = sum(1 for agg in aggregates if agg.get("active_day_with_proof"))
                consistency_7d = round((active_days / len(aggregates)) * 100, 2)
            else:
                # New goal (less than 7 days of data) -> null
                consistency_7d = None

            goal["consistency_7d"] = consistency_7d

        except Exception as e:
            logger.error(f"❌ Error fetching aggregates for goal {goal_id}: {str(e)}")
            goal["consistency_7d"] = None

        # Count active subtask_templates (binds)
        # Note: Schema uses is_archived, not is_active (inverted logic)
        try:
            binds_response = (
                supabase.table("subtask_templates")
                .select("id", count="exact")
                .eq("goal_id", goal_id)
                .eq("is_archived", False)  # Not archived = active
                .execute()
            )

            active_binds_count = binds_response.count or 0
            logger.debug(f"📊 Goal {goal_id}: {active_binds_count} active binds")

            goal["active_binds_count"] = active_binds_count

        except Exception as e:
            logger.error(f"❌ Error counting binds for goal {goal_id}: {str(e)}")
            goal["active_binds_count"] = 0

    return goals

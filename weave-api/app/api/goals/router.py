"""
Goals API Router - Story 2.1, 2.2, 2.3: Needles List, Detail View, and Creation

Endpoints:
- GET /api/goals - List active goals with stats
- GET /api/goals/{goal_id} - Get single goal with full details
- POST /api/goals - Create new goal (AI-assisted)
- PUT /api/goals/{goal_id} - Update existing goal
- DELETE /api/goals/{goal_id} - Archive goal (soft delete)

Implements AC1 and AC4 from Story 2.1, US-2.2 detail view, US-2.3 goal creation
"""

import logging
from datetime import date, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from supabase import Client

from app.core.deps import get_current_user, get_supabase_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/goals")


# Request/Response Models

class QGoalCreate(BaseModel):
    """Q-Goal (Milestone) creation model"""
    title: str = Field(..., min_length=1, max_length=200)
    metric_name: Optional[str] = None
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    unit: Optional[str] = None


class BindCreate(BaseModel):
    """Bind (Subtask Template) creation model"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    frequency_type: str = Field(..., pattern="^(daily|weekly|custom)$")
    frequency_value: int = Field(..., ge=1, le=7)


class GoalCreate(BaseModel):
    """Goal creation request model"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None  # "Why it matters"
    qgoals: Optional[List[QGoalCreate]] = []
    binds: Optional[List[BindCreate]] = []


class GoalUpdate(BaseModel):
    """Goal update request model"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(active|archived)$")


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
            .select("id, title, description, status, start_date, target_date, created_at, updated_at, user_id")
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


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal_data: GoalCreate,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Create a new goal with optional Q-goals and binds (US-2.3: Create New Goal).

    Request Body:
    - title: Goal title (required)
    - description: Why it matters (optional)
    - qgoals: Array of milestone objects (optional)
    - binds: Array of bind/subtask templates (optional)

    Returns:
    - data: Created goal with ID
    - meta: Metadata with timestamp

    Acceptance Criteria:
    - AC5: Enforce max 3 active goals (show error if limit reached)
    - AC6: Create goal and associated Q-goals/binds in a transaction
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

    logger.info(f"[CREATE_GOAL] Request from auth_user_id: {auth_user_id}")

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
        logger.info(f"[CREATE_GOAL] Resolved user_id: {user_id}")

        # Check active goal count (AC5: max 3 active goals)
        active_goals_response = (
            supabase.table("goals")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .eq("status", "active")
            .execute()
        )

        active_goal_count = active_goals_response.count or 0
        if active_goal_count >= 3:
            logger.warning(f"⚠️ User {user_id} already has {active_goal_count} active goals")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum 3 active goals allowed. Archive an existing goal first.",
            )

        # Create the goal
        goal_insert = {
            "user_id": user_id,
            "title": goal_data.title,
            "description": goal_data.description,
            "status": "active",
        }

        goal_response = supabase.table("goals").insert(goal_insert).execute()

        if not goal_response.data:
            logger.error("❌ Failed to create goal")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create goal",
            )

        created_goal = goal_response.data[0]
        goal_id = created_goal["id"]
        logger.info(f"✅ Created goal {goal_id}: {created_goal['title']}")

        # Create Q-goals (milestones) if provided
        # TODO: qgoals table doesn't exist yet - will be added in future migration
        # For now, skip Q-goals creation
        if goal_data.qgoals:
            logger.info(f"⚠️ Skipping Q-goals creation (table not yet implemented) - {len(goal_data.qgoals)} qgoals provided")

        # Create binds (subtask templates) if provided
        if goal_data.binds:
            binds_inserts = []
            for bind in goal_data.binds:
                # Convert frequency_type/frequency_value to recurrence_rule (iCal RRULE format)
                if bind.frequency_type == 'daily':
                    recurrence_rule = "FREQ=DAILY;INTERVAL=1"
                elif bind.frequency_type == 'weekly':
                    recurrence_rule = f"FREQ=WEEKLY;INTERVAL=1;COUNT={bind.frequency_value}"
                else:  # custom
                    recurrence_rule = f"FREQ=DAILY;INTERVAL={bind.frequency_value}"

                binds_inserts.append({
                    "user_id": user_id,  # Required field
                    "goal_id": goal_id,
                    "title": bind.title,
                    "default_estimated_minutes": 30,  # Default to 30 minutes
                    "recurrence_rule": recurrence_rule,
                    "is_archived": False,
                })

            binds_response = supabase.table("subtask_templates").insert(binds_inserts).execute()
            logger.info(f"✅ Created {len(binds_response.data)} binds for goal {goal_id}")

        # Return created goal
        return {
            "data": created_goal,
            "meta": {
                "timestamp": date.today().isoformat(),
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error creating goal: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create goal",
        )


@router.put("/{goal_id}")
async def update_goal(
    goal_id: str,
    goal_data: GoalUpdate,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Update an existing goal (US-2.4: Edit Needle).

    Path Parameters:
    - goal_id: UUID of the goal

    Request Body:
    - title: Updated goal title (optional)
    - description: Updated description/why (optional)
    - status: Updated status (optional)

    Returns:
    - data: Updated goal object
    - meta: Metadata with timestamp

    RLS: User can only update their own goals
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

    logger.info(f"[UPDATE_GOAL] Request from auth_user_id: {auth_user_id}")

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

        # Build update payload (only include fields that are set)
        update_payload = {}
        if goal_data.title is not None:
            update_payload["title"] = goal_data.title
        if goal_data.description is not None:
            update_payload["description"] = goal_data.description
        if goal_data.status is not None:
            update_payload["status"] = goal_data.status

        if not update_payload:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update",
            )

        # Update the goal (RLS enforced)
        update_response = (
            supabase.table("goals")
            .update(update_payload)
            .eq("id", goal_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not update_response.data:
            logger.warning(f"⚠️ Goal {goal_id} not found for user {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Goal not found",
            )

        updated_goal = update_response.data[0]
        logger.info(f"✅ Updated goal {goal_id}")

        return {
            "data": updated_goal,
            "meta": {
                "timestamp": date.today().isoformat(),
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating goal {goal_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update goal",
        )


@router.delete("/{goal_id}")
async def archive_goal(
    goal_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Archive a goal (US-2.5: Archive Goal).

    Path Parameters:
    - goal_id: UUID of the goal

    Returns:
    - data: Archived goal object
    - meta: Metadata with timestamp

    Note: This is a soft delete - sets status to 'archived'
    RLS: User can only archive their own goals
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

    logger.info(f"[ARCHIVE_GOAL] Request from auth_user_id: {auth_user_id}")

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

        # Archive the goal (set status to 'archived')
        archive_response = (
            supabase.table("goals")
            .update({"status": "archived"})
            .eq("id", goal_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not archive_response.data:
            logger.warning(f"⚠️ Goal {goal_id} not found for user {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Goal not found",
            )

        archived_goal = archive_response.data[0]
        logger.info(f"✅ Archived goal {goal_id}")

        return {
            "data": archived_goal,
            "meta": {
                "timestamp": date.today().isoformat(),
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error archiving goal {goal_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to archive goal",
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

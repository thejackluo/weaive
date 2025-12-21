"""
Binds API Router - Chunk 1: View Today's Binds (US-3.1)

Endpoints:
- GET /api/binds/today - List today's binds with needle context and completion status

Implements Thread Home Screen data requirements
"""

import logging
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.core.deps import get_current_user, get_supabase_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/binds")


@router.get("/today")
async def get_today_binds(
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Get today's binds (subtask instances) for the authenticated user.

    Returns binds with:
    - Needle (goal) context
    - Completion status
    - Proof indicators
    - Estimated time

    Query Pattern:
    - Query subtask_instances WHERE scheduled_for_date = today
    - LEFT JOIN goals (for needle context)
    - LEFT JOIN subtask_completions (for completion status)
    - LEFT JOIN captures (for proof indicators)

    Returns:
    - data: Array of binds with needle and completion info
    - meta: Metadata including local_date, total_binds, completed_count

    Acceptance Criteria (US-3.1):
    - Thread (Home) shows today's binds grouped by needle
    - Binds show: title, estimated time, completion status
    - Incomplete binds show empty checkbox
    - Completed binds show checkmark with optional proof indicator
    - Answer "What should I do today?" in <10 seconds
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

    logger.info(f"[BINDS_API] Request from auth_user_id: {auth_user_id}")

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
        logger.info(f"[BINDS_API] Found user_profile.id: {user_id}")

        # Get today's date (user's local date)
        # TODO: In future, get user's timezone from user_profiles and use that
        today = date.today().isoformat()

        # Query subtask_instances for today's binds
        # Join with goals to get needle context
        query = supabase.table("subtask_instances").select(
            """
            id,
            goal_id,
            scheduled_for_date,
            status,
            estimated_minutes,
            title_override,
            notes,
            goals!subtask_instances_goal_id_fkey(id, title, status),
            subtask_templates!subtask_instances_template_id_fkey(title, recurrence_pattern)
            """
        )

        # Filter by user_id and today's date (RLS enforced)
        query = query.eq("user_id", user_id)
        query = query.eq("scheduled_for_date", today)

        # Order by sort_order, then by creation
        query = query.order("sort_order", desc=False)
        query = query.order("created_at", desc=False)

        # Execute query
        response = query.execute()
        instances = response.data

        logger.info(f"[BINDS_API] Found {len(instances)} binds for {today}")

        # For each instance, check completion status and proof
        binds = []
        completed_count = 0

        for instance in instances:
            # Check if completed (subtask_completions table)
            completion_response = (
                supabase.table("subtask_completions")
                .select("id, completed_at, duration_minutes")
                .eq("subtask_instance_id", instance["id"])
                .eq("user_id", user_id)
                .limit(1)
                .execute()
            )

            completed = len(completion_response.data) > 0
            if completed:
                completed_count += 1

            # Check if has proof (captures table)
            proof_response = (
                supabase.table("captures")
                .select("id, type")
                .eq("subtask_instance_id", instance["id"])
                .eq("user_id", user_id)
                .limit(1)
                .execute()
            )

            has_proof = len(proof_response.data) > 0

            # Get needle info
            goal = instance.get("goals") or {}
            goal_id = goal.get("id") if goal else None
            goal_title = goal.get("title", "Untitled Goal") if goal else "Untitled Goal"

            # Get template info for recurrence display
            template = instance.get("subtask_templates") or {}
            recurrence = template.get("recurrence_pattern", "One-time")

            # Build bind title (use override if exists, otherwise template title)
            bind_title = instance.get("title_override") or template.get("title", "Untitled Task")

            # Build subtitle with frequency context
            subtitle = f"{recurrence}. Today's one of them." if recurrence != "One-time" else "One-time task."

            # Construct bind object
            bind = {
                "id": instance["id"],
                "title": bind_title,
                "subtitle": subtitle,
                "needle_id": goal_id,
                "needle_title": goal_title,
                "needle_color": "blue",  # TODO: Add color to goals table
                "estimated_minutes": instance["estimated_minutes"],
                "completed": completed,
                "has_proof": has_proof,
                "frequency": recurrence,
                "scheduled_for_date": instance["scheduled_for_date"],
                "status": instance["status"],
                "notes": instance.get("notes"),
            }

            binds.append(bind)

        # Return standard response format
        return {
            "data": binds,
            "meta": {
                "local_date": today,
                "total_binds": len(binds),
                "completed_count": completed_count,
            },
        }

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching today's binds: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch today's binds",
        )

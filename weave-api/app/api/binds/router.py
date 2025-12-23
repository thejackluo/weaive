"""
Binds API Router - Chunk 1: View Today's Binds (US-3.1)

Endpoints:
- GET /api/binds/today - List today's binds with needle context and completion status

Implements Thread Home Screen data requirements
"""

import logging
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from supabase import Client

from app.core.deps import get_current_user, get_supabase_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/binds")


class CompleteBindRequest(BaseModel):
    """Request body for completing a bind"""

    timer_duration: int | None = Field(None, description="Timer duration in minutes")
    photo_used: bool | None = Field(None, description="Whether photo accountability was used")
    notes: str | None = Field(None, max_length=500, description="Optional completion notes (e.g., 'Ran 5k in 30min')")


class UpdateBindRequest(BaseModel):
    """Request body for updating a bind template"""

    title: str | None = Field(None, min_length=1, max_length=200, description="Bind title")
    recurrence_rule: str | None = Field(None, description="iCal RRULE format (e.g., FREQ=DAILY;INTERVAL=1)")
    default_estimated_minutes: int | None = Field(None, ge=0, description="Default estimated time in minutes")


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
        try:
            user_profile_response = (
                supabase.table("user_profiles")
                .select("id")
                .eq("auth_user_id", auth_user_id)
                .single()
                .execute()
            )
            user_id = user_profile_response.data["id"]
            logger.info(f"[BINDS_API] Found user_profile.id: {user_id}")
        except Exception:
            # User profile doesn't exist yet - auto-create it
            logger.warning(f"⚠️  No user profile found for auth_user_id: {auth_user_id}, creating one...")

            try:
                # Create user_profile with default values
                new_profile = supabase.table("user_profiles").insert({
                    "auth_user_id": auth_user_id,
                    "display_name": "User",
                    "timezone": "America/Los_Angeles",
                    "locale": "en-US"
                }).execute()

                user_id = new_profile.data[0]["id"]
                logger.info(f"✅ Auto-created user_profile.id: {user_id}")
            except Exception as create_error:
                logger.error(f"❌ Failed to auto-create user profile: {create_error}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to initialize user profile",
                )

        # Get today's date (user's local date)
        # TODO: In future, get user's timezone from user_profiles and use that
        today = date.today().isoformat()

        # Query subtask_instances for today's binds
        # Join with goals to get needle context
        try:
            query = supabase.table("subtask_instances").select(
                """
                id,
                goal_id,
                template_id,
                scheduled_for_date,
                status,
                estimated_minutes,
                title_override,
                notes,
                sort_order,
                created_at,
                goals!subtask_instances_goal_id_fkey(id, title, status),
                subtask_templates!subtask_instances_template_id_fkey(title, recurrence_rule)
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
        except Exception as query_error:
            logger.error(f"❌ Database query error: {str(query_error)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database query failed: {str(query_error)}",
            )

        # For each instance, check completion status and proof
        binds = []
        completed_count = 0

        for instance in instances:
            # Get needle info first and skip archived goals
            goal = instance.get("goals") or {}
            goal_status = goal.get("status") if goal else None

            # Skip binds for archived goals
            if goal_status == "archived":
                logger.debug(f"[BINDS_API] Skipping bind {instance['id']} - goal is archived")
                continue

            # Check if completed (subtask_completions table)
            completion_response = (
                supabase.table("subtask_completions")
                .select("id, completed_at, duration_minutes, notes")
                .eq("subtask_instance_id", instance["id"])
                .eq("user_id", user_id)
                .limit(1)
                .execute()
            )

            completed = len(completion_response.data) > 0
            completion_details = None
            if completed:
                completed_count += 1
                completion_details = completion_response.data[0]

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
            goal_id = goal.get("id") if goal else None
            goal_title = goal.get("title", "Untitled Goal") if goal else "Untitled Goal"

            # Get template info for recurrence display
            template = instance.get("subtask_templates") or {}
            recurrence_rule = template.get("recurrence_rule", "")

            # Convert RRULE to human-readable frequency (simplified for now)
            # TODO: Parse full RRULE format properly
            if recurrence_rule and "DAILY" in recurrence_rule:
                frequency = "Daily"
            elif recurrence_rule and "WEEKLY" in recurrence_rule:
                frequency = "Weekly"
            else:
                frequency = "One-time"

            # Build bind title (use override if exists, otherwise template title)
            bind_title = instance.get("title_override") or template.get("title", "Untitled Task")

            # Build subtitle with frequency context
            subtitle = f"{frequency}. Today's one of them." if frequency != "One-time" else "One-time task."

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
                "frequency": frequency,
                "scheduled_for_date": instance["scheduled_for_date"],
                "status": instance["status"],
                "notes": instance.get("notes"),
                "completion_details": {
                    "completed_at": completion_details.get("completed_at"),
                    "duration_minutes": completion_details.get("duration_minutes"),
                    "notes": completion_details.get("notes"),
                } if completion_details else None,
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


@router.post("/{bind_id}/complete")
async def complete_bind(
    bind_id: str,
    request: CompleteBindRequest,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Mark a bind (subtask instance) as complete.

    Creates a completion record in subtask_completions table.
    This is an append-only immutable event log.

    Args:
    - bind_id: UUID of the subtask_instance
    - timer_duration: Optional timer duration in minutes
    - notes: Optional completion notes (500 char max)

    Returns:
    - success: True if completion recorded
    - data: Completion details (id, bind_id, completed_at)

    Acceptance Criteria (US-3.3):
    - Mark Bind as complete
    - Append-only completion event (no UPDATE allowed)
    - Timer duration attached as proof if provided
    - Total completion time: <30 seconds from open to done
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

    logger.info(f"[BINDS_API] Complete bind request from auth_user_id: {auth_user_id}")

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
        logger.info(f"[BINDS_API] Found user_profile.id: {user_id}")

        # Verify bind exists and belongs to user (include goal for affirmation)
        bind_response = (
            supabase.table("subtask_instances")
            .select("id, user_id, goal_id, goals!subtask_instances_goal_id_fkey(id, title)")
            .eq("id", bind_id)
            .single()
            .execute()
        )

        if not bind_response.data:
            logger.error(f"❌ Bind not found: {bind_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bind not found",
            )

        if bind_response.data["user_id"] != user_id:
            logger.error(f"❌ Bind {bind_id} does not belong to user {user_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized access to bind",
            )

        # Check if already completed
        existing_completion = (
            supabase.table("subtask_completions")
            .select("id")
            .eq("subtask_instance_id", bind_id)
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )

        if existing_completion.data:
            logger.warning(f"⚠️ Bind {bind_id} already completed")
            return {
                "success": True,
                "data": {
                    "completion_id": existing_completion.data[0]["id"],
                    "bind_id": bind_id,
                    "completed_at": existing_completion.data[0].get("completed_at"),
                    "message": "Bind already completed",
                },
            }

        # Create completion record (append-only, immutable)
        # Schema requires: user_id, subtask_instance_id, completed_at, local_date, duration_minutes
        from datetime import datetime

        completion_data = {
            "user_id": user_id,
            "subtask_instance_id": bind_id,
            "completed_at": datetime.utcnow().isoformat(),  # UTC timestamp (required by schema)
            "local_date": date.today().isoformat(),  # User's local date (required by schema)
            "duration_minutes": request.timer_duration,
            "notes": request.notes[:500] if request.notes else None,  # Enforce 500 char limit
        }

        completion_response = supabase.table("subtask_completions").insert(completion_data).execute()

        if not completion_response.data:
            logger.error(f"❌ Failed to create completion for bind {bind_id}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to record completion",
            )

        completion = completion_response.data[0]
        logger.info(f"✅ Bind {bind_id} completed successfully")

        # Create capture record if photo accountability was used
        if request.photo_used:
            try:
                # Use 'text' type with content_text to indicate photo accountability was used
                # Since no actual photo is captured yet (mock implementation), we store a placeholder
                # When real photo capture is implemented, this should be 'photo' type with storage_key
                capture_data = {
                    "user_id": user_id,
                    "subtask_instance_id": bind_id,
                    "type": "text",  # Using text type for mock photo accountability
                    "content_text": "Photo accountability used (placeholder)",
                    "local_date": date.today().isoformat(),
                }
                capture_response = supabase.table("captures").insert(capture_data).execute()

                if capture_response.data:
                    logger.info(f"✅ Created capture record for bind {bind_id} (photo accountability)")
                else:
                    logger.warning(f"⚠️ Failed to create capture record for bind {bind_id}")
            except Exception as capture_error:
                # Don't fail the entire completion if capture creation fails
                logger.error(f"❌ Error creating capture record: {str(capture_error)}")

        # Calculate level and progress
        # Simple level system: 10 completions per level
        try:
            total_completions_response = (
                supabase.table("subtask_completions")
                .select("id", count="exact")
                .eq("user_id", user_id)
                .execute()
            )

            total_completions = total_completions_response.count or 0
            level = (total_completions // 10) + 1  # Level 1 starts at 0-9 completions
            completions_in_level = total_completions % 10
            level_progress = (completions_in_level / 10) * 100  # Percentage to next level

            logger.info(f"[BINDS_API] Level calculation: total={total_completions}, level={level}, progress={level_progress}")
        except Exception as level_error:
            logger.error(f"❌ Error calculating level: {str(level_error)}")
            # Default to level 1 if calculation fails
            level = 1
            level_progress = 0.0

        # Get needle (goal) name for affirmation
        try:
            goal_data = bind_response.data.get("goals")
            if goal_data and isinstance(goal_data, dict):
                goal_name = goal_data.get("title", "your goal")
            else:
                goal_name = "your goal"
            logger.info(f"[BINDS_API] Goal name for affirmation: {goal_name}")
        except Exception as goal_error:
            logger.error(f"❌ Error getting goal name: {str(goal_error)}")
            goal_name = "your goal"

        return {
            "success": True,
            "data": {
                "completion_id": completion["id"],
                "bind_id": bind_id,
                "completed_at": completion["completed_at"],
                "level": level,
                "level_progress": round(level_progress, 1),
                "affirmation": f"You're getting closer to {goal_name}!",
            },
        }

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"❌ Error completing bind: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete bind: {str(e)}",
        )


@router.put("/{bind_id}")
async def update_bind(
    bind_id: str,
    request: UpdateBindRequest,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Update a bind template (subtask_template).

    Args:
    - bind_id: UUID of the subtask_template
    - title: Updated bind title (optional)
    - recurrence_rule: Updated recurrence rule (optional)
    - default_estimated_minutes: Updated estimated time (optional)

    Returns:
    - success: True if update succeeded
    - data: Updated bind template

    Note: This updates the template, not individual instances.
    Future instances will use the updated values.
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

    logger.info(f"[BINDS_API] Update bind request from auth_user_id: {auth_user_id}")

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
        logger.info(f"[BINDS_API] Found user_profile.id: {user_id}")

        # Build update payload (only include fields that are set)
        update_payload = {}
        if request.title is not None:
            update_payload["title"] = request.title
        if request.recurrence_rule is not None:
            update_payload["recurrence_rule"] = request.recurrence_rule
        if request.default_estimated_minutes is not None:
            update_payload["default_estimated_minutes"] = request.default_estimated_minutes

        if not update_payload:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update",
            )

        # Update the bind template (RLS enforced)
        update_response = (
            supabase.table("subtask_templates")
            .update(update_payload)
            .eq("id", bind_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not update_response.data:
            logger.warning(f"⚠️ Bind {bind_id} not found for user {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bind not found",
            )

        updated_bind = update_response.data[0]
        logger.info(f"✅ Updated bind {bind_id}")

        return {
            "success": True,
            "data": updated_bind,
            "meta": {
                "timestamp": date.today().isoformat(),
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating bind {bind_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update bind: {str(e)}",
        )

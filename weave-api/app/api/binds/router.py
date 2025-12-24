"""
Binds API Router - Chunk 1: View Today's Binds (US-3.1)

Endpoints:
- GET /api/binds/today - List today's binds with needle context and completion status

Implements Thread Home Screen data requirements
"""

import logging
from datetime import date, datetime

from fastapi import APIRouter, Depends, status
from supabase import Client

from app.core.deps import get_current_user, get_supabase_client
from app.core.errors import NotFoundException, ValidationException
from app.schemas.bind import CompleteBindRequest, CreateBindRequest, UpdateBindRequest

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
        from app.core.errors import ServiceUnavailableException
        raise ServiceUnavailableException(service_name="Database")

    # Extract user ID from JWT (auth.uid() is in the 'sub' claim)
    auth_user_id = user.get("sub")
    if not auth_user_id:
        logger.error("❌ JWT payload missing 'sub' field (user ID)")
        from app.core.errors import UnauthorizedException
        raise UnauthorizedException(message="Invalid token payload")

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
            logger.warning(
                f"⚠️  No user profile found for auth_user_id: {auth_user_id}, creating one..."
            )

            try:
                # Create user_profile with default values
                new_profile = (
                    supabase.table("user_profiles")
                    .insert(
                        {
                            "auth_user_id": auth_user_id,
                            "display_name": "User",
                            "timezone": "America/Los_Angeles",
                            "locale": "en-US",
                        }
                    )
                    .execute()
                )

                user_id = new_profile.data[0]["id"]
                logger.info(f"✅ Auto-created user_profile.id: {user_id}")
            except Exception as create_error:
                logger.error(f"❌ Failed to auto-create user profile: {create_error}")
                from app.core.errors import ServiceUnavailableException
                raise ServiceUnavailableException(
                    service_name="Database",
                    message="Failed to initialize user profile"
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
                subtask_templates!subtask_instances_template_id_fkey(title, recurrence_rule, is_archived)
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
            from app.core.errors import ServiceUnavailableException
            raise ServiceUnavailableException(
                service_name="Database",
                message=f"Database query failed: {str(query_error)}"
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

            # Skip binds from archived templates (deleted binds)
            template = instance.get("subtask_templates") or {}
            is_archived = template.get("is_archived", False)
            if is_archived:
                logger.debug(f"[BINDS_API] Skipping bind {instance['id']} - template is archived (deleted)")
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

            # Get template info for recurrence display (already fetched above)
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
            subtitle = (
                f"{frequency}. Today's one of them."
                if frequency != "One-time"
                else "One-time task."
            )

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
                }
                if completion_details
                else None,
            }

            binds.append(bind)

        # Return standard response format
        return {
            "data": binds,
            "meta": {
                "local_date": today,
                "total_binds": len(binds),
                "completed_count": completed_count,
                "timestamp": datetime.utcnow().isoformat() + "Z",
            },
        }

    except (NotFoundException, ValidationException):
        # Re-raise custom exceptions as-is
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching today's binds: {str(e)}")
        from app.core.errors import ServiceUnavailableException
        raise ServiceUnavailableException(
            service_name="Database",
            message=f"Failed to fetch today's binds: {str(e)}"
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
        from app.core.errors import ServiceUnavailableException
        raise ServiceUnavailableException(service_name="Database")

    # Extract user ID from JWT
    auth_user_id = user.get("sub")
    if not auth_user_id:
        logger.error("❌ JWT payload missing 'sub' field (user ID)")
        from app.core.errors import UnauthorizedException
        raise UnauthorizedException(message="Invalid token payload")

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
            raise NotFoundException(resource="User Profile", resource_id=auth_user_id)

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
            raise NotFoundException(resource="Bind", resource_id=bind_id)

        if bind_response.data["user_id"] != user_id:
            logger.error(f"❌ Bind {bind_id} does not belong to user {user_id}")
            from app.core.errors import ForbiddenException
            raise ForbiddenException(message="Unauthorized access to bind")

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

        completion_response = (
            supabase.table("subtask_completions").insert(completion_data).execute()
        )

        if not completion_response.data:
            logger.error(f"❌ Failed to create completion for bind {bind_id}")
            from app.core.errors import ServiceUnavailableException
            raise ServiceUnavailableException(
                service_name="Database",
                message="Failed to record completion"
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
                    logger.info(
                        f"✅ Created capture record for bind {bind_id} (photo accountability)"
                    )
                else:
                    logger.warning(f"⚠️ Failed to create capture record for bind {bind_id}")
            except Exception as capture_error:
                # Don't fail the entire completion if capture creation fails
                logger.error(f"❌ Error creating capture record: {str(capture_error)}")

        # Update daily_aggregates (CRITICAL: Dashboard data source)
        try:
            local_date = date.today().isoformat()

            # Fetch current daily_aggregates for this date
            current_agg_response = (
                supabase.table("daily_aggregates")
                .select("completed_count, has_journal, has_proof")
                .eq("user_id", user_id)
                .eq("local_date", local_date)
                .single()
                .execute()
            )

            # Calculate new values
            current_completed = current_agg_response.data.get("completed_count", 0) if current_agg_response.data else 0
            current_has_journal = current_agg_response.data.get("has_journal", False) if current_agg_response.data else False
            current_has_proof = current_agg_response.data.get("has_proof", False) if current_agg_response.data else False

            new_completed_count = current_completed + 1
            new_has_proof = current_has_proof or request.photo_used or False

            # North star metric: active_day_with_proof = ≥1 completion + (has_proof OR has_journal)
            active_day_with_proof = new_completed_count >= 1 and (new_has_proof or current_has_journal)

            # Upsert daily_aggregates
            supabase.table("daily_aggregates").upsert({
                "user_id": user_id,
                "local_date": local_date,
                "completed_count": new_completed_count,
                "has_proof": new_has_proof,
                "active_day_with_proof": active_day_with_proof,
            }, on_conflict="user_id,local_date").execute()

            logger.info(f"✅ Updated daily_aggregates: completed_count={new_completed_count}, has_proof={new_has_proof}, active_day_with_proof={active_day_with_proof}")
        except Exception as agg_error:
            # Log error but don't fail the completion
            logger.error(f"❌ Error updating daily_aggregates: {str(agg_error)}")

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

            logger.info(
                f"[BINDS_API] Level calculation: total={total_completions}, level={level}, progress={level_progress}"
            )
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

    except (NotFoundException, ValidationException):
        # Re-raise custom exceptions as-is
        raise
    except Exception as e:
        logger.error(f"❌ Error completing bind: {str(e)}")
        logger.exception("Full traceback:")
        from app.core.errors import ServiceUnavailableException
        raise ServiceUnavailableException(
            service_name="Database",
            message=f"Failed to complete bind: {str(e)}"
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
        from app.core.errors import ServiceUnavailableException
        raise ServiceUnavailableException(service_name="Database")

    # Extract user ID from JWT
    auth_user_id = user.get("sub")
    if not auth_user_id:
        logger.error("❌ JWT payload missing 'sub' field (user ID)")
        from app.core.errors import UnauthorizedException
        raise UnauthorizedException(message="Invalid token payload")

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
            raise NotFoundException(resource="User Profile", resource_id=auth_user_id)

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
            raise ValidationException(message="No fields to update")

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
            raise NotFoundException(resource="Bind", resource_id=bind_id)

        updated_bind = update_response.data[0]
        logger.info(f"✅ Updated bind {bind_id}")

        return {
            "success": True,
            "data": updated_bind,
            "meta": {
                "timestamp": datetime.utcnow().isoformat() + "Z",
            },
        }

    except (NotFoundException, ValidationException):
        raise
    except Exception as e:
        logger.error(f"❌ Error updating bind {bind_id}: {str(e)}")
        from app.core.errors import ServiceUnavailableException
        raise ServiceUnavailableException(
            service_name="Database",
            message=f"Failed to update bind: {str(e)}"
        )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_bind(
    request: CreateBindRequest,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Create a new bind for a goal.

    Request Body:
    - goal_id: Goal ID this bind belongs to (required)
    - title: Bind title (required)
    - description: Bind description (optional)
    - frequency_type: 'daily' or 'weekly' (required)
    - frequency_value: Days per week (1-7, only for weekly)

    Returns:
    - data: Created bind object
    - meta: Metadata with timestamp

    Validation:
    - Max 3 active binds per goal
    - User must own the goal
    """
    if not supabase:
        logger.error("❌ Supabase client not configured")
        from app.core.errors import ServiceUnavailableException
        raise ServiceUnavailableException(service_name="Database")

    # Extract user ID from JWT
    auth_user_id = user.get("sub")
    if not auth_user_id:
        logger.error("❌ JWT payload missing 'sub' field (user ID)")
        from app.core.errors import UnauthorizedException
        raise UnauthorizedException(message="Invalid token payload")

    logger.info(
        f"[CREATE_BIND] Request from auth_user_id: {auth_user_id} for goal {request.goal_id}"
    )

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
            raise NotFoundException(resource="User Profile", resource_id=auth_user_id)

        user_id = user_profile_response.data["id"]
        logger.info(f"[CREATE_BIND] Resolved user_id: {user_id}")

        # Verify the goal exists and belongs to the user
        goal_response = (
            supabase.table("goals")
            .select("id, status")
            .eq("id", request.goal_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )

        if not goal_response.data:
            logger.warning(f"⚠️ Goal {request.goal_id} not found for user {user_id}")
            raise NotFoundException(resource="Goal", resource_id=request.goal_id)

        # Check if goal is active (can't add binds to archived goals)
        if goal_response.data["status"] != "active":
            raise ValidationException(
                message="Cannot add binds to archived goals",
                details={"goal_id": request.goal_id, "status": goal_response.data["status"]}
            )

        # Check active binds count (max 3 per goal)
        active_binds_response = (
            supabase.table("subtask_templates")
            .select("id", count="exact")
            .eq("goal_id", request.goal_id)
            .eq("is_archived", False)
            .execute()
        )

        active_binds_count = active_binds_response.count or 0
        if active_binds_count >= 3:
            logger.warning(
                f"⚠️ Goal {request.goal_id} already has {active_binds_count} active binds"
            )
            raise ValidationException(
                message="Maximum 3 binds allowed per goal",
                details={"goal_id": request.goal_id, "current_count": active_binds_count, "max_allowed": 3}
            )

        # Convert frequency_type to recurrence_rule (iCal RRULE format)
        if request.frequency_type == "daily":
            recurrence_rule = "FREQ=DAILY;INTERVAL=1"
        elif request.frequency_type == "weekly":
            # For weekly, use frequency_value (default to 1 if not provided)
            freq_value = request.frequency_value or 1
            recurrence_rule = f"FREQ=WEEKLY;INTERVAL=1;COUNT={freq_value}"
        else:
            recurrence_rule = "FREQ=DAILY;INTERVAL=1"  # Default fallback

        # Create the bind
        bind_insert = {
            "user_id": user_id,
            "goal_id": request.goal_id,
            "title": request.title,
            "default_estimated_minutes": 30,  # Default to 30 minutes
            "recurrence_rule": recurrence_rule,
            "is_archived": False,
        }

        bind_response = supabase.table("subtask_templates").insert(bind_insert).execute()

        if not bind_response.data:
            logger.error("❌ Failed to create bind")
            from app.core.errors import ServiceUnavailableException
            raise ServiceUnavailableException(
                service_name="Database",
                message="Failed to create bind"
            )

        created_bind = bind_response.data[0]
        bind_id = created_bind["id"]
        logger.info(f"✅ Created bind {bind_id}: {created_bind['title']}")

        # Auto-create subtask instance for TODAY
        today_date = date.today().isoformat()
        instance_insert = {
            "user_id": user_id,
            "goal_id": request.goal_id,
            "template_id": bind_id,
            "scheduled_for_date": today_date,
            "status": "planned",
            "estimated_minutes": created_bind.get("default_estimated_minutes", 30),
        }

        try:
            supabase.table("subtask_instances").insert(instance_insert).execute()
            logger.info(f"✅ Created instance for bind {bind_id} on {today_date}")
        except Exception as instance_error:
            logger.error(f"❌ Error creating instance: {str(instance_error)}")
            # Don't fail bind creation if instance generation fails

        return {
            "success": True,
            "data": created_bind,
            "meta": {
                "timestamp": datetime.utcnow().isoformat() + "Z",
            },
        }

    except (NotFoundException, ValidationException):
        raise
    except Exception as e:
        logger.error(f"❌ Error creating bind: {str(e)}")
        from app.core.errors import ServiceUnavailableException
        raise ServiceUnavailableException(
            service_name="Database",
            message=f"Failed to create bind: {str(e)}"
        )


@router.delete("/{bind_id}")
async def delete_bind(
    bind_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Delete a bind (soft delete by setting is_archived=true).

    Path Parameters:
    - bind_id: UUID of the bind

    Returns:
    - data: Archived bind object
    - meta: Metadata with timestamp

    Note: This is a soft delete - sets is_archived to true
    RLS: User can only delete their own binds
    """
    if not supabase:
        logger.error("❌ Supabase client not configured")
        from app.core.errors import ServiceUnavailableException
        raise ServiceUnavailableException(service_name="Database")

    # Extract user ID from JWT
    auth_user_id = user.get("sub")
    if not auth_user_id:
        logger.error("❌ JWT payload missing 'sub' field (user ID)")
        from app.core.errors import UnauthorizedException
        raise UnauthorizedException(message="Invalid token payload")

    logger.info(f"[DELETE_BIND] Request from auth_user_id: {auth_user_id}")

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
            raise NotFoundException(resource="User Profile", resource_id=auth_user_id)

        user_id = user_profile_response.data["id"]

        # Archive the bind (set is_archived to true)
        archive_response = (
            supabase.table("subtask_templates")
            .update({"is_archived": True})
            .eq("id", bind_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not archive_response.data:
            logger.warning(f"⚠️ Bind {bind_id} not found for user {user_id}")
            raise NotFoundException(resource="Bind", resource_id=bind_id)

        archived_bind = archive_response.data[0]
        logger.info(f"✅ Archived bind {bind_id}")

        return {
            "success": True,
            "data": archived_bind,
            "meta": {
                "timestamp": datetime.utcnow().isoformat() + "Z",
            },
        }

    except (NotFoundException, ValidationException):
        raise
    except Exception as e:
        logger.error(f"❌ Error deleting bind {bind_id}: {str(e)}")
        from app.core.errors import ServiceUnavailableException
        raise ServiceUnavailableException(
            service_name="Database",
            message=f"Failed to delete bind: {str(e)}"
        )

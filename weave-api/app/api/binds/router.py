"""
Binds API Router - Chunk 1: View Today's Binds (US-3.1)

Endpoints:
- GET /api/binds/today - List today's binds with needle context and completion status

Implements Thread Home Screen data requirements
"""

import logging
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, status
from supabase import Client

from app.core.deps import get_current_user, get_supabase_client
from app.core.errors import NotFoundException, ValidationException
from app.schemas.bind import CompleteBindRequest, CreateBindRequest, UpdateBindRequest
from app.services.progress_service import update_user_progress

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/binds")


def get_times_per_week_safe(template: dict) -> int:
    """
    Safely extract times_per_week from template, with fallback to recurrence_rule parsing.

    This function is backwards compatible - works both before and after migration.

    Args:
        template: Subtask template dict (may or may not have times_per_week column)

    Returns:
        Number of times per week (1-7), defaults to 7 if cannot parse
    """
    # Try new field first (after migration)
    if "times_per_week" in template and template["times_per_week"] is not None:
        return template["times_per_week"]

    # Fallback: parse recurrence_rule (before migration)
    recurrence_rule = template.get("recurrence_rule", "")
    if "DAILY" in recurrence_rule.upper():
        return 7  # Daily = 7 times per week
    elif "WEEKLY" in recurrence_rule.upper():
        return 1  # Weekly = 1 time per week
    else:
        # Default to daily if cannot parse
        return 7


def calculate_rolling_week_boundaries(template_created_at: datetime, target_date: date) -> tuple[date, date]:
    """
    Calculate the rolling 7-day week boundaries for a given date.

    Args:
        template_created_at: When the bind template was created (anchor date)
        target_date: The date to calculate week boundaries for

    Returns:
        Tuple of (week_start_date, week_end_date)

    Example:
        Template created: 2025-01-15 (Wednesday)
        Target date: 2025-01-22 (Wednesday)
        Week 1: 2025-01-15 to 2025-01-21 (Wed-Tue)
        Week 2: 2025-01-22 to 2025-01-28 (Wed-Tue)
    """
    # Get the anchor date (when template was created)
    anchor_date = template_created_at.date() if isinstance(template_created_at, datetime) else template_created_at

    # Calculate days since creation
    days_since_creation = (target_date - anchor_date).days

    # Calculate which week we're in (0-indexed)
    week_num = days_since_creation // 7

    # Calculate week boundaries
    week_start_date = anchor_date + timedelta(days=week_num * 7)
    week_end_date = week_start_date + timedelta(days=6)

    return week_start_date, week_end_date


def is_miss_day(
    times_per_week: int,
    completions_this_week: int,
    target_date: date,
    week_end_date: date
) -> bool:
    """
    Determine if a day is a "miss" (impossible to achieve perfect week).

    Miss Logic:
    - For Nx/week bind: Grace period = 7 - N days
    - Miss occurs when: completions_needed > days_remaining

    Args:
        times_per_week: Required completions per week (1-7)
        completions_this_week: Completions so far this week
        target_date: The date to check
        week_end_date: End of the rolling week

    Returns:
        True if this day is a miss, False otherwise

    Examples:
        2x/week bind, Day 6, 0 completions:
        - completions_needed = 2 - 0 = 2
        - days_remaining = 2 (day 6 + day 7)
        - 2 > 2? No → NOT a miss ✓

        2x/week bind, Day 7, 0 completions:
        - completions_needed = 2 - 0 = 2
        - days_remaining = 1 (day 7)
        - 2 > 1? Yes → MISS ✓
    """
    # Calculate days remaining (including today)
    days_remaining = (week_end_date - target_date).days + 1

    # Calculate completions still needed
    completions_needed = times_per_week - completions_this_week

    # If impossible to complete required number in remaining days, it's a miss
    return completions_needed > days_remaining


async def generate_missing_bind_instances(
    supabase: Client,
    user_id: str,
    target_date: str,
) -> int:
    """
    Generate missing bind instances for a target date.

    This function ensures that all active daily bind templates have
    corresponding instances for the specified date. It prevents duplicates
    by checking existing instances first.

    Args:
        supabase: Supabase client
        user_id: User profile ID
        target_date: Date in ISO format (YYYY-MM-DD)

    Returns:
        Number of instances created

    Algorithm:
        1. Fetch all active bind templates (is_archived=false)
        2. Fetch existing instances for target_date
        3. For each template without an instance:
           - Check if recurrence rule matches target date
           - Create instance if needed
    """
    try:
        # Get all active bind templates for user
        templates_response = (
            supabase.table("subtask_templates")
            .select("id, goal_id, title, default_estimated_minutes, times_per_week, recurrence_rule, created_at, goals!subtask_templates_goal_id_fkey(status)")
            .eq("user_id", user_id)
            .eq("is_archived", False)
            .execute()
        )

        if not templates_response.data:
            logger.debug(f"[BIND_GENERATION] No active templates found for user {user_id}")
            return 0

        # Get existing instances for target_date
        existing_instances_response = (
            supabase.table("subtask_instances")
            .select("template_id")
            .eq("user_id", user_id)
            .eq("scheduled_for_date", target_date)
            .execute()
        )

        existing_template_ids = {inst["template_id"] for inst in existing_instances_response.data}
        logger.debug(f"[BIND_GENERATION] Found {len(existing_template_ids)} existing instances for {target_date}")

        # Build list of instances to create
        instances_to_create = []

        for template in templates_response.data:
            template_id = template["id"]

            # Skip if instance already exists
            if template_id in existing_template_ids:
                continue

            # Skip if goal is archived
            goal = template.get("goals")
            if goal and goal.get("status") == "archived":
                logger.debug(f"[BIND_GENERATION] Skipping template {template_id} - goal is archived")
                continue

            # All binds (regardless of times_per_week) get daily instances
            # Weekly tracking is handled at completion/display time
            # Create instance
            instances_to_create.append({
                "user_id": user_id,
                "goal_id": template["goal_id"],
                "template_id": template_id,
                "scheduled_for_date": target_date,
                "status": "planned",
                "estimated_minutes": template.get("default_estimated_minutes", 30),
            })

        # Bulk insert instances
        if instances_to_create:
            insert_response = (
                supabase.table("subtask_instances")
                .insert(instances_to_create)
                .execute()
            )
            created_count = len(insert_response.data)
            logger.info(f"✅ Created {created_count} missing bind instances for {target_date}")
            return created_count
        else:
            logger.debug(f"[BIND_GENERATION] No missing instances to create for {target_date}")
            return 0

    except Exception as e:
        logger.error(f"❌ Error generating missing bind instances: {str(e)}")
        # Don't fail the entire request if instance generation fails
        return 0


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

        # Generate missing bind instances for today (ensures daily binds appear)
        # This runs on every GET /api/binds/today to keep instances in sync
        created_count = await generate_missing_bind_instances(supabase, user_id, today)
        if created_count > 0:
            logger.info(f"[BINDS_API] Auto-generated {created_count} missing instances for {today}")

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
                subtask_templates!subtask_instances_template_id_fkey(title, times_per_week, recurrence_rule, is_archived, created_at)
                """
            )

            # Filter by user_id and today's date (RLS enforced)
            query = query.eq("user_id", user_id)
            query = query.eq("scheduled_for_date", today)

            # Filter out instances with NULL goal_id (from corrupted data)
            query = query.not_.is_("goal_id", "null")

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

        # PERFORMANCE OPTIMIZATION: Batch-fetch weekly data for all templates BEFORE the loop
        # This eliminates N+1 query problem (was O(N) queries, now O(1) queries)

        # Step 1: Collect unique template_ids and calculate their week boundaries
        template_week_data = {}  # template_id -> {week_start, week_end, times_per_week}
        today_date = date.fromisoformat(today)

        for instance in instances:
            template = instance.get("subtask_templates") or {}
            template_id = instance["template_id"]

            if template_id not in template_week_data:
                times_per_week = get_times_per_week_safe(template)
                template_created_at_str = template.get("created_at")

                # Parse template created_at timestamp
                if template_created_at_str:
                    if isinstance(template_created_at_str, str):
                        template_created_at = datetime.fromisoformat(template_created_at_str.replace('Z', '+00:00'))
                    else:
                        template_created_at = template_created_at_str
                else:
                    template_created_at = datetime.combine(date.today(), datetime.min.time())

                week_start, week_end = calculate_rolling_week_boundaries(template_created_at, today_date)
                template_week_data[template_id] = {
                    "week_start": week_start,
                    "week_end": week_end,
                    "times_per_week": times_per_week
                }

        # Step 2: Batch-fetch all weekly instances for all templates in ONE query
        weekly_instances_by_template = {}  # template_id -> [instance_ids]

        if template_week_data:
            # Fetch all instances for all templates within their respective weeks
            all_weekly_instances = []
            for template_id, week_info in template_week_data.items():
                instances_response = (
                    supabase.table("subtask_instances")
                    .select("id, template_id")
                    .eq("user_id", user_id)
                    .eq("template_id", template_id)
                    .gte("scheduled_for_date", week_info["week_start"].isoformat())
                    .lte("scheduled_for_date", week_info["week_end"].isoformat())
                    .execute()
                )

                instance_ids = [inst["id"] for inst in instances_response.data]
                weekly_instances_by_template[template_id] = instance_ids
                all_weekly_instances.extend(instance_ids)

            # Step 3: Batch-fetch all completions for all weekly instances in ONE query
            completions_by_instance = {}  # instance_id -> completion_count

            if all_weekly_instances:
                completions_response = (
                    supabase.table("subtask_completions")
                    .select("subtask_instance_id")
                    .eq("user_id", user_id)
                    .in_("subtask_instance_id", all_weekly_instances)
                    .execute()
                )

                # Count completions per instance
                for comp in completions_response.data:
                    inst_id = comp["subtask_instance_id"]
                    completions_by_instance[inst_id] = completions_by_instance.get(inst_id, 0) + 1

        # Step 4: Batch-fetch completions and proofs for today's instances
        instance_ids = [inst["id"] for inst in instances]

        # Fetch all completions for today's instances in one query
        today_completions = {}
        if instance_ids:
            completions_response = (
                supabase.table("subtask_completions")
                .select("id, subtask_instance_id, completed_at, duration_minutes, notes")
                .eq("user_id", user_id)
                .in_("subtask_instance_id", instance_ids)
                .execute()
            )
            for comp in completions_response.data:
                today_completions[comp["subtask_instance_id"]] = comp

        # Fetch all proofs for today's instances in one query
        today_proofs = {}
        if instance_ids:
            proofs_response = (
                supabase.table("captures")
                .select("id, subtask_instance_id, type")
                .eq("user_id", user_id)
                .in_("subtask_instance_id", instance_ids)
                .execute()
            )
            for proof in proofs_response.data:
                today_proofs[proof["subtask_instance_id"]] = proof

        # Now process instances using pre-fetched data (O(1) lookups, no more queries in loop!)
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

            # Use pre-fetched completion data (O(1) lookup, no query!)
            instance_id = instance["id"]
            completion_details = today_completions.get(instance_id)
            completed = completion_details is not None
            if completed:
                completed_count += 1

            # Use pre-fetched proof data (O(1) lookup, no query!)
            has_proof = instance_id in today_proofs

            # Get needle info
            goal_id = goal.get("id") if goal else None
            goal_title = goal.get("title", "Untitled Goal") if goal else "Untitled Goal"

            # Use pre-fetched weekly data (O(1) lookup, no queries!)
            template_id = instance["template_id"]
            week_data = template_week_data.get(template_id, {})
            times_per_week = week_data.get("times_per_week", 7)
            week_start = week_data.get("week_start", today_date)
            week_end = week_data.get("week_end", today_date + timedelta(days=6))

            # Count completions this week using pre-fetched data
            weekly_instance_ids = weekly_instances_by_template.get(template_id, [])
            completions_this_week = sum(
                completions_by_instance.get(inst_id, 0)
                for inst_id in weekly_instance_ids
            )

            # Determine if completed for week
            is_completed_for_week = completions_this_week >= times_per_week

            # Determine if today is a miss day
            is_miss = is_miss_day(times_per_week, completions_this_week, today_date, week_end)

            # Build frequency display string
            if times_per_week == 7:
                frequency_display = "Daily"
            elif times_per_week == 1:
                frequency_display = "Once a week"
            else:
                frequency_display = f"{times_per_week}x per week"

            # Build bind title (use override if exists, otherwise template title)
            bind_title = instance.get("title_override") or template.get("title", "Untitled Task")

            # Build subtitle with progress
            subtitle = f"{frequency_display} • {completions_this_week}/{times_per_week} this week"

            # Construct bind object
            bind = {
                "id": instance["id"],
                "template_id": template_id,  # For grid optimistic updates
                "title": bind_title,
                "subtitle": subtitle,
                "needle_id": goal_id,
                "needle_title": goal_title,
                "needle_color": "blue",  # TODO: Add color to goals table
                "estimated_minutes": instance["estimated_minutes"],
                "completed": completed,
                "has_proof": has_proof,
                "times_per_week": times_per_week,
                "completions_this_week": completions_this_week,
                "is_completed_for_week": is_completed_for_week,
                "is_miss": is_miss,
                "week_start": week_start.isoformat(),
                "week_end": week_end.isoformat(),
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

        # Verify bind exists and belongs to user (include goal for affirmation + template for weekly limits)
        bind_response = (
            supabase.table("subtask_instances")
            .select("id, user_id, goal_id, template_id, scheduled_for_date, goals!subtask_instances_goal_id_fkey(id, title), subtask_templates!subtask_instances_template_id_fkey(times_per_week, recurrence_rule, created_at)")
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

        # Get template info for weekly limit check (backwards compatible)
        template = bind_response.data.get("subtask_templates") or {}
        times_per_week = get_times_per_week_safe(template)
        template_created_at_str = template.get("created_at")

        # Parse template created_at
        if template_created_at_str:
            if isinstance(template_created_at_str, str):
                template_created_at = datetime.fromisoformat(template_created_at_str.replace('Z', '+00:00'))
            else:
                template_created_at = template_created_at_str
        else:
            template_created_at = datetime.combine(date.today(), datetime.min.time())

        # Calculate rolling week boundaries
        today_date = date.today()
        week_start, week_end = calculate_rolling_week_boundaries(template_created_at, today_date)

        # Count completions this week (including all instances for this template)
        # Optimized: Only 2 queries for single bind completion check (acceptable)
        template_id = bind_response.data["template_id"]
        instances_this_week_response = (
            supabase.table("subtask_instances")
            .select("id")
            .eq("user_id", user_id)
            .eq("template_id", template_id)
            .gte("scheduled_for_date", week_start.isoformat())
            .lte("scheduled_for_date", week_end.isoformat())
            .execute()
        )

        instance_ids_this_week = [inst["id"] for inst in instances_this_week_response.data]

        if instance_ids_this_week:
            completions_this_week_response = (
                supabase.table("subtask_completions")
                .select("id", count="exact")
                .eq("user_id", user_id)
                .in_("subtask_instance_id", instance_ids_this_week)
                .execute()
            )
            completions_this_week = completions_this_week_response.count or 0
        else:
            completions_this_week = 0

        # Check if weekly limit reached
        if completions_this_week >= times_per_week:
            logger.warning(f"⚠️ Weekly limit reached for bind {bind_id}: {completions_this_week}/{times_per_week}")
            raise ValidationException(
                message=f"Weekly goal already completed ({completions_this_week}/{times_per_week})",
                details={
                    "bind_id": bind_id,
                    "completions_this_week": completions_this_week,
                    "times_per_week": times_per_week,
                    "week_start": week_start.isoformat(),
                    "week_end": week_end.isoformat(),
                }
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

        # NOTE: Photo captures are now handled separately via /api/captures/upload endpoint
        # The ProofCaptureSheet uploads photos before bind completion is called
        # No need to create placeholder capture records here

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

        # Update user progress (level, XP, streak)
        # Pass local_date for timezone-accurate streak calculation
        try:
            local_date_str = date.today().isoformat()  # Use completion date
            progress_update = update_user_progress(supabase, user_id, xp_gained=1, local_date=local_date_str)
            logger.info(
                f"[BINDS_API] Progress update: Level {progress_update['level_after']}, "
                f"XP {progress_update['total_xp']}, Streak {progress_update['streak_after']}"
            )
        except Exception as progress_error:
            logger.error(f"❌ Error updating progress: {str(progress_error)}")
            # Return minimal progress data if update fails
            progress_update = {
                "level_before": 1,
                "level_after": 1,
                "level_up": False,
                "xp_gained": 1,
                "total_xp": 0,
                "xp_to_next_level": 4,
                "streak_before": 0,
                "streak_after": 0,
                "streak_status": "active",
                "streak_milestone_reached": None,
                "grace_period_saved": False,
            }

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
                "affirmation": f"You're getting closer to {goal_name}!",
                "progress_update": progress_update,
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
        if request.times_per_week is not None:
            update_payload["times_per_week"] = request.times_per_week
            # Also update recurrence_rule for backwards compatibility
            if request.times_per_week == 7:
                update_payload["recurrence_rule"] = "FREQ=DAILY;INTERVAL=1"
            elif request.times_per_week == 1:
                update_payload["recurrence_rule"] = "FREQ=WEEKLY;INTERVAL=1"
            else:
                update_payload["recurrence_rule"] = f"FREQ=WEEKLY;COUNT={request.times_per_week}"
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
    - times_per_week: Number of times per week (1-7, default: 3)

    Returns:
    - data: Created bind object
    - meta: Metadata with timestamp

    Validation:
    - Max 3 active binds per goal
    - User must own the goal
    - times_per_week must be between 1-7
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

        # Convert times_per_week to recurrence_rule for backwards compatibility
        # 7x/week = daily, 1x/week = weekly, else = custom
        if request.times_per_week == 7:
            recurrence_rule = "FREQ=DAILY;INTERVAL=1"
        elif request.times_per_week == 1:
            recurrence_rule = "FREQ=WEEKLY;INTERVAL=1"
        else:
            # Custom frequency (2-6x per week)
            recurrence_rule = f"FREQ=WEEKLY;COUNT={request.times_per_week}"

        # Create the bind with times_per_week (migration applied)
        bind_insert = {
            "user_id": user_id,
            "goal_id": request.goal_id,
            "title": request.title,
            "default_estimated_minutes": 30,  # Default to 30 minutes
            "times_per_week": request.times_per_week,
            "recurrence_rule": recurrence_rule,  # Kept for backwards compatibility with old queries
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

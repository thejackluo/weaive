"""
Stats API Router - Epic 5: Progress Visualization

Endpoints:
- GET /api/stats/consistency - Consistency heat map data
- GET /api/stats/fulfillment - Fulfillment trend chart data
- GET /api/stats/streaks - Streak tracking metrics

Implements US-5.2, US-5.3, US-5.5
"""

import logging
from datetime import date, datetime, timedelta
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client

from app.core.deps import get_current_user, get_supabase_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/stats")


@router.get("/consistency")
async def get_consistency_data(
    timeframe: Literal["7d", "2w", "1m", "90d"] = Query("7d", description="Timeframe for data"),
    filter_type: Literal["overall", "needle", "bind", "thread"] = Query(
        "overall", description="Filter type"
    ),
    filter_id: Optional[str] = Query(None, description="Specific needle/bind ID if filtered"),
    start_date: Optional[str] = Query(None, description="Optional start date (YYYY-MM-DD) for dynamic navigation"),
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Get consistency heat map data (US-5.2: Consistency Heat Map).

    Query Parameters:
    - timeframe: 7d, 2w, 1m, 90d (default: 7d)
    - filter_type: overall, needle, bind, thread
    - filter_id: Goal/bind ID if filter_type is needle or bind
    - start_date: Optional start date (YYYY-MM-DD) for dynamic navigation

    Returns:
    - data: Array of daily consistency objects
    - meta: Metadata with consistency percentage and timeframe

    Data format:
    {
      "date": "2025-12-20",
      "completion_percentage": 75,  // 0-100
      "completed_count": 3,
      "total_count": 4
    }
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

    logger.info(f"[STATS_API] Consistency request from auth_user_id: {auth_user_id}")

    try:
        # Get user_profile.id
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

        # Calculate date range
        timeframe_days = {"7d": 7, "2w": 14, "1m": 30, "90d": 90}
        days = timeframe_days.get(timeframe, 7)

        # Find user's first completion date (using scheduled_for_date, not completed_at)
        # This ensures consistency between date range and completions grouping
        first_completion_response = (
            supabase.table("subtask_completions")
            .select(
                """
                subtask_instances!subtask_completions_subtask_instance_id_fkey(
                    scheduled_for_date
                )
                """
            )
            .eq("user_id", user_id)
            .order("completed_at", desc=False)
            .limit(1)
            .execute()
        )

        # Find user's first journal entry date (rolling consistency includes journals)
        first_journal_response = (
            supabase.table("journal_entries")
            .select("local_date")
            .eq("user_id", user_id)
            .order("local_date", desc=False)
            .limit(1)
            .execute()
        )

        # Calculate date range: Use provided start_date, or default to first activity (completion OR journal)
        first_completion_date = None
        first_journal_date = None

        if start_date:
            # Use provided start date (for dynamic navigation)
            start_date_obj = date.fromisoformat(start_date)
        else:
            # Get first completion date
            if first_completion_response.data and len(first_completion_response.data) > 0:
                instance = first_completion_response.data[0].get("subtask_instances")
                if instance and instance.get("scheduled_for_date"):
                    first_completion_date = date.fromisoformat(instance["scheduled_for_date"])

            # Get first journal date
            if first_journal_response.data and len(first_journal_response.data) > 0:
                first_journal_date = date.fromisoformat(first_journal_response.data[0]["local_date"])

            # Use the EARLIER of first completion or first journal (rolling from first activity)
            if first_completion_date and first_journal_date:
                start_date_obj = min(first_completion_date, first_journal_date)
            elif first_completion_date:
                start_date_obj = first_completion_date
            elif first_journal_date:
                start_date_obj = first_journal_date
            else:
                # No activity yet - use default timeframe (today - N days)
                start_date_obj = date.today() - timedelta(days=days - 1)

        start_date = start_date_obj.isoformat()
        # End date: N-1 days after start (to show N total days)
        end_date_obj = start_date_obj + timedelta(days=days - 1)

        # TASK-BASED CONSISTENCY: Count scheduled tasks vs completed tasks
        # Use subtask_completions as source of truth (append-only, never loses historical data)

        print(f"\n{'='*80}")

        # Step 1: Fetch all completions in date range with instance details
        completions_response = (
            supabase.table("subtask_completions")
            .select(
                """
                id,
                subtask_instance_id,
                completed_at,
                subtask_instances!subtask_completions_subtask_instance_id_fkey(
                    id,
                    scheduled_for_date
                )
                """
            )
            .eq("user_id", user_id)
            .gte("completed_at", start_date)
            .lte("completed_at", end_date_obj.isoformat() + "T23:59:59")
            .execute()
        )

        completions = completions_response.data or []

        print(f"📊 [CONSISTENCY] Found {len(completions)} completions in range")

        # Step 2: Fetch all instances in date range (these are the scheduled tasks)
        instances_response = (
            supabase.table("subtask_instances")
            .select("id, scheduled_for_date")
            .eq("user_id", user_id)
            .gte("scheduled_for_date", start_date)
            .lte("scheduled_for_date", end_date_obj.isoformat())
            .execute()
        )

        instances = instances_response.data or []

        print(f"📊 [CONSISTENCY] Found {len(instances)} scheduled instances")

        # Step 3: Fetch journal entries in date range (daily reflection counts as a bind)
        journal_response = (
            supabase.table("journal_entries")
            .select("id, local_date")
            .eq("user_id", user_id)
            .gte("local_date", start_date)
            .lte("local_date", end_date_obj.isoformat())
            .execute()
        )

        journal_entries = journal_response.data or []

        print(f"📊 [CONSISTENCY] Found {len(journal_entries)} journal reflections")

        # Group scheduled and completed tasks by date
        from collections import defaultdict
        scheduled_by_date = defaultdict(int)
        completed_by_date = defaultdict(int)

        # Count scheduled tasks (binds only - reflections added separately)
        for instance in instances:
            scheduled_date = instance.get("scheduled_for_date")
            if scheduled_date:
                scheduled_by_date[scheduled_date] += 1

        print(f"📊 [CONSISTENCY] Scheduled binds by date (past only): {dict(scheduled_by_date)}")

        # Count completed tasks (using scheduled_for_date from the instance, not completed_at)
        for completion in completions:
            instance = completion.get("subtask_instances")
            if instance and instance.get("scheduled_for_date"):
                scheduled_date = instance["scheduled_for_date"]
                completed_by_date[scheduled_date] += 1
                # Also ensure this date is counted as scheduled (in case instance was deleted)
                if scheduled_date not in scheduled_by_date:
                    scheduled_by_date[scheduled_date] = 0
                if scheduled_by_date[scheduled_date] == 0:
                    scheduled_by_date[scheduled_date] = completed_by_date[scheduled_date]

        # Step 4: Add journal reflections to consistency calculation
        # IMPORTANT: Only schedule reflections for days UP TO TODAY (not future days)
        # Each day that has occurred has 1 scheduled "daily reflection" task
        # Each day with a journal entry counts as 1 completed task
        current_date = start_date_obj
        today = date.today()
        while current_date <= min(end_date_obj, today):  # Only up to today
            date_str = current_date.isoformat()
            # Add 1 scheduled reflection for each day that has occurred
            scheduled_by_date[date_str] += 1
            current_date += timedelta(days=1)

        # Add journal entries as completions
        for journal_entry in journal_entries:
            local_date = journal_entry.get("local_date")
            if local_date:
                completed_by_date[local_date] += 1

        print(f"📊 [CONSISTENCY] Scheduled by date (with reflections): {dict(scheduled_by_date)}")
        print(f"📊 [CONSISTENCY] Completed by date (with reflections): {dict(completed_by_date)}")
        print(f"{'='*80}\n")

        # Build consistency data for all days in range
        consistency_data = []
        current_date = start_date_obj
        end_date = end_date_obj
        today_str = date.today().isoformat()

        # Check if user has completed ANY tasks today (binds OR reflection)
        today_has_completions = completed_by_date.get(today_str, 0) > 0
        print(f"📊 [CONSISTENCY] Today has completions: {today_has_completions}")

        total_scheduled = 0
        total_completed = 0

        while current_date <= end_date:
            date_str = current_date.isoformat()
            scheduled_count = scheduled_by_date.get(date_str, 0)
            completed_count = completed_by_date.get(date_str, 0)

            # Calculate percentage for this day
            percentage = round((completed_count / scheduled_count) * 100, 1) if scheduled_count > 0 else 0.0

            consistency_data.append(
                {
                    "date": date_str,
                    "completion_percentage": percentage,
                    "completed_count": completed_count,
                    "total_count": scheduled_count,
                }
            )

            # Include this day in overall calculation if:
            # 1. It's a past day (< today), OR
            # 2. It's today AND user has completed at least one task today
            # This ensures:
            # - Day 1 shows 100% if tasks complete
            # - Day 2+ doesn't drop at midnight (stays at yesterday's %)
            # - Updates in real-time as you complete today's tasks
            include_day = date_str < today_str or (date_str == today_str and today_has_completions)

            if include_day:
                total_scheduled += scheduled_count
                total_completed += completed_count
                print(f"   ✓ Including {date_str}: {completed_count}/{scheduled_count}")
            else:
                print(f"   ✗ Excluding {date_str}: {completed_count}/{scheduled_count} (today, no completions yet)")

            current_date += timedelta(days=1)

        # Calculate overall consistency percentage
        # Formula: (total completed tasks / total scheduled tasks) × 100
        # "Count Today If You've Started" strategy:
        # - Includes past days (always)
        # - Includes today IF user has completed at least one task today
        # - Excludes today IF user hasn't completed anything yet (prevents midnight drop)
        overall_consistency = (
            round((total_completed / total_scheduled) * 100, 1)
            if total_scheduled > 0
            else 0.0
        )

        print(f"📊 [CONSISTENCY] Today: {today_str}")
        print(f"📊 [CONSISTENCY] First completion: {first_completion_date.isoformat() if first_completion_date else 'None'}")
        print(f"📊 [CONSISTENCY] First journal: {first_journal_date.isoformat() if first_journal_date else 'None'}")
        print(f"📊 [CONSISTENCY] Rolling start date: {start_date} (earlier of first activity)")
        print(f"📊 [CONSISTENCY] Date range: {start_date} to {end_date_obj.isoformat()}")
        print(f"📊 [CONSISTENCY] Total consistency_data items: {len(consistency_data)}")
        print(f"📊 [CONSISTENCY] Total scheduled: {total_scheduled} (past days + today if started)")
        print(f"📊 [CONSISTENCY] Total completed: {total_completed} (past days + today if started)")
        print(f"📊 [CONSISTENCY] Overall consistency: {overall_consistency}%")

        logger.info("📊 Consistency calculation details:")
        logger.info(f"  - Timeframe: {timeframe} (requested {days} days)")
        logger.info(f"  - Start date: {start_date}")
        logger.info(f"  - End date: {end_date_obj.isoformat()}")
        logger.info(f"  - First completion: {first_completion_date.isoformat() if first_completion_date else 'None'}")
        logger.info(f"  - First journal: {first_journal_date.isoformat() if first_journal_date else 'None'}")
        logger.info(f"  - Total days in response: {len(consistency_data)} (includes today + future)")
        logger.info(f"  - Today has completions: {today_has_completions}")
        logger.info(f"  - Total scheduled tasks: {total_scheduled} (past + today if started)")
        logger.info(f"  - Total completed tasks: {total_completed} (past + today if started)")
        logger.info(f"  - Overall consistency: {overall_consistency}%")

        # Calculate consistency delta (percentage point difference)
        # Compare current period vs previous period (both task-based, both excluding most recent day)
        # Example for 7d: Current = Dec 21-27, Previous = Dec 14-20

        # Skip delta calculation if user doesn't have enough data
        can_calculate_delta = total_scheduled > 0 and len(consistency_data) >= days

        if not can_calculate_delta:
            # Not enough data for meaningful delta comparison
            consistency_delta = 0.0
            logger.info("  - Skipping delta calculation (insufficient data)")
        else:
            # Previous period: Same number of days, shifted back
            previous_start_date = start_date_obj - timedelta(days=days)
            previous_end_date = start_date_obj - timedelta(days=1)

            # Fetch scheduled instances for previous period
            previous_instances_response = (
                supabase.table("subtask_instances")
                .select(
                    """
                    id,
                    scheduled_for_date,
                    goals!subtask_instances_goal_id_fkey(id, status),
                    subtask_templates!subtask_instances_template_id_fkey(id, is_archived)
                    """
                )
                .eq("user_id", user_id)
                .gte("scheduled_for_date", previous_start_date.isoformat())
                .lte("scheduled_for_date", previous_end_date.isoformat())
                .execute()
            )

            previous_instances = previous_instances_response.data or []
            # Count all instances (even archived) for historical accuracy
            previous_active_instances = [
                inst for inst in previous_instances
                if inst.get("goals") and inst.get("subtask_templates")
            ]

            # Fetch completions for previous period
            previous_completions_response = (
                supabase.table("subtask_completions")
                .select("id, subtask_instance_id, completed_at")
                .eq("user_id", user_id)
                .gte("completed_at", previous_start_date.isoformat())
                .lte("completed_at", previous_end_date.isoformat() + "T23:59:59")
                .execute()
            )

            previous_completions = previous_completions_response.data or []
            previous_completed_ids = {c["subtask_instance_id"] for c in previous_completions}

            # Fetch journal entries for previous period
            previous_journal_response = (
                supabase.table("journal_entries")
                .select("id, local_date")
                .eq("user_id", user_id)
                .gte("local_date", previous_start_date.isoformat())
                .lte("local_date", previous_end_date.isoformat())
                .execute()
            )

            previous_journal_entries = previous_journal_response.data or []

            # Count scheduled and completed tasks in previous period
            # Include daily reflection as scheduled (1 per day)
            previous_scheduled = len(previous_active_instances) + days  # binds + daily reflections
            previous_completed = sum(1 for inst in previous_active_instances if inst["id"] in previous_completed_ids) + len(previous_journal_entries)  # bind completions + journal reflections

            previous_consistency = (
                round((previous_completed / previous_scheduled) * 100, 1)
                if previous_scheduled > 0
                else 0
            )

            # Calculate delta (percentage point difference)
            consistency_delta = round(overall_consistency - previous_consistency, 1)

            logger.info(f"  - Previous period: {previous_start_date.isoformat()} to {previous_end_date.isoformat()}")
            logger.info(f"  - Previous scheduled: {previous_scheduled}, completed: {previous_completed}")
            logger.info(f"  - Previous period consistency: {previous_consistency}%")
            logger.info(f"  - Consistency delta: {consistency_delta:+.1f}%")

        # Calculate historical counts (excluding today)
        historical_days_count = len([d for d in consistency_data if d["date"] != today_str])

        return {
            "data": consistency_data,  # Includes today + future for heatmap visualization
            "meta": {
                "timeframe": timeframe,
                "filter_type": filter_type,
                "consistency_percentage": overall_consistency,  # (completed/scheduled) × 100, includes today if started
                "consistency_delta": consistency_delta,  # Percentage point difference vs previous period
                "total_days": len(consistency_data),  # Includes today + future
                "historical_days": historical_days_count,  # Past days only
                "total_scheduled": total_scheduled,  # Past + today if started
                "total_completed": total_completed,  # Past + today if started
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching consistency data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch consistency data",
        )


@router.get("/binds-grid")
async def get_binds_grid_data(
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format. If not provided, uses first instance date."),
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Get bind-level consistency data for 7d grid view.

    Query Parameters:
    - start_date: Optional start date in YYYY-MM-DD format. If not provided, defaults to first instance date.

    Returns binds grouped by needles with completion status for 7 days starting from start_date.

    Returns:
    - data: Object with needles array and daily_reflection
    - meta: Date range and summary stats

    Data format:
    {
      "needles": [
        {
          "id": "goal-uuid",
          "title": "Goal Title",
          "description": "Goal description",
          "binds": [
            {
              "id": "template-uuid",
              "name": "Bind Name",
              "completions": [false, true, false, true, true, false, true]  # Last 7 days
            }
          ]
        }
      ],
      "daily_reflection": {
        "completions": [true, false, true, true, false, false, true]  # Last 7 days
      }
    }
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

    logger.info(f"[BINDS_GRID_API] Request from auth_user_id: {auth_user_id}")

    try:
        # Get user_profile.id
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

        # Find user's first scheduled instance to avoid showing empty days before they started
        first_instance_response = (
            supabase.table("subtask_instances")
            .select("scheduled_for_date")
            .eq("user_id", user_id)
            .order("scheduled_for_date", desc=False)
            .limit(1)
            .execute()
        )

        # Determine start date: use provided start_date, or default to first instance
        if start_date:
            # Use provided start date
            try:
                start_date_obj = date.fromisoformat(start_date)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid start_date format. Use YYYY-MM-DD.",
                )
        else:
            # Default to first instance date
            first_instance_date = None
            if first_instance_response.data and len(first_instance_response.data) > 0:
                first_instance_str = first_instance_response.data[0]["scheduled_for_date"]
                first_instance_date = date.fromisoformat(first_instance_str)
                start_date_obj = first_instance_date
            else:
                # No instances yet - use default 7d window (today - 6 days)
                start_date_obj = date.today() - timedelta(days=6)

        # End date: 6 days after start (to show 7 total days)
        end_date = start_date_obj + timedelta(days=6)
        # Calculate number of days from start to end
        num_days = 7  # Always 7 days
        date_range = [
            (start_date_obj + timedelta(days=i)).isoformat() for i in range(num_days)
        ]

        print(f"\n{'='*80}")
        print(f"📊 [BINDS-GRID] Start date (provided or first instance): {start_date_obj.isoformat()}")
        print(f"📊 [BINDS-GRID] End date (+6 days): {end_date.isoformat()}")
        print(f"📊 [BINDS-GRID] Number of days: {num_days}")
        print(f"📊 [BINDS-GRID] Date range: {date_range}")
        print(f"{'='*80}\n")

        # Get all ACTIVE goals with their NON-ARCHIVED templates
        goals_response = supabase.table("goals").select(
            "id, title, description, subtask_templates!subtask_templates_goal_id_fkey(id, title, is_archived)"
        ).eq("user_id", user_id).eq("status", "active").execute()

        goals = goals_response.data or []
        logger.info(f"📊 Found {len(goals)} active goals")

        # OPTIMIZATION: Batch fetch all instances and completions for the date range
        # Extract all template IDs from all goals (excluding archived templates)
        all_template_ids = []
        for goal in goals:
            templates = goal.get("subtask_templates", [])
            # Filter out archived (deleted) templates
            active_templates = [t for t in templates if not t.get("is_archived", False)]
            all_template_ids.extend([t["id"] for t in active_templates])
            # Update goal with filtered templates
            goal["subtask_templates"] = active_templates

        if not all_template_ids:
            # No templates found, return empty structure
            return {
                "data": {
                    "needles": [],
                    "daily_reflection": {
                        "completions": [False] * 7,
                    },
                },
                "meta": {
                    "start_date": start_date_obj.isoformat(),
                    "end_date": end_date.isoformat(),
                    "total_needles": 0,
                    "total_binds": 0,
                },
            }

        # Batch query: Get ALL subtask_instances for ALL templates in date range (1 query instead of N×7)
        instances_response = supabase.table("subtask_instances").select(
            "id, template_id, scheduled_for_date"
        ).eq("user_id", user_id).in_("template_id", all_template_ids).gte(
            "scheduled_for_date", start_date_obj.isoformat()
        ).lte("scheduled_for_date", end_date.isoformat()).execute()

        instances = instances_response.data or []
        logger.info(f"📊 Fetched {len(instances)} instances in batch")

        # Build instance lookup: {template_id: {date: instance_id}}
        instance_lookup = {}
        instance_ids = []
        for instance in instances:
            template_id = instance["template_id"]
            scheduled_date = instance["scheduled_for_date"]
            instance_id = instance["id"]

            if template_id not in instance_lookup:
                instance_lookup[template_id] = {}
            instance_lookup[template_id][scheduled_date] = instance_id
            instance_ids.append(instance_id)

        # Batch query: Get ALL completions for these instances (1 query instead of N×7)
        completed_instance_ids = set()
        if instance_ids:
            completions_response = supabase.table("subtask_completions").select(
                "subtask_instance_id"
            ).eq("user_id", user_id).in_("subtask_instance_id", instance_ids).execute()

            completed_instance_ids = {c["subtask_instance_id"] for c in completions_response.data or []}
            logger.info(f"📊 Found {len(completed_instance_ids)} completions")

        # Build needles structure using lookup tables
        needles = []

        for goal in goals:
            templates = goal.get("subtask_templates", [])
            if not templates:
                continue

            # Build binds for this needle
            binds = []

            for template in templates:
                template_id = template["id"]
                template_title = template["title"]

                # Check completion status for each day using lookup
                completions = []
                for check_date in date_range:
                    # Check if instance exists for this date
                    if template_id in instance_lookup and check_date in instance_lookup[template_id]:
                        instance_id = instance_lookup[template_id][check_date]
                        # Check if this instance was completed
                        completions.append(instance_id in completed_instance_ids)
                    else:
                        # No instance scheduled for this date
                        completions.append(False)

                binds.append({
                    "id": template_id,
                    "name": template_title,
                    "completions": completions,
                })

            needles.append({
                "id": goal["id"],
                "title": goal["title"],
                "description": goal.get("description") or "Focus on your goals",
                "binds": binds,
            })

        # Batch query: Get ALL journal entries for date range (1 query instead of 7)
        journal_response = supabase.table("journal_entries").select(
            "local_date"
        ).eq("user_id", user_id).gte(
            "local_date", start_date_obj.isoformat()
        ).lte("local_date", end_date.isoformat()).execute()

        journal_dates = {j["local_date"] for j in journal_response.data or []}
        reflection_completions = [check_date in journal_dates for check_date in date_range]

        logger.info(f"✅ Built binds grid for {len(needles)} needles")

        # Debug: Log completions array lengths
        logger.info(f"📊 [BINDS-GRID] Daily reflection completions length: {len(reflection_completions)}")
        logger.info(f"📊 [BINDS-GRID] Daily reflection completions: {reflection_completions}")
        for needle in needles:
            for bind in needle["binds"]:
                logger.info(f"📊 [BINDS-GRID] Bind '{bind['name']}' completions length: {len(bind['completions'])}")
                logger.info(f"📊 [BINDS-GRID] Bind '{bind['name']}' completions: {bind['completions']}")

        return {
            "data": {
                "needles": needles,
                "daily_reflection": {
                    "completions": reflection_completions,
                },
            },
            "meta": {
                "start_date": start_date_obj.isoformat(),
                "end_date": end_date.isoformat(),
                "total_needles": len(needles),
                "total_binds": sum(len(needle["binds"]) for needle in needles),
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching binds grid data: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch binds grid data: {str(e)}",
        )


@router.get("/fulfillment")
async def get_fulfillment_data(
    timeframe: Literal["7d", "2w", "1m", "90d"] = Query("7d", description="Timeframe for data"),
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Get fulfillment trend chart data (US-5.3: Fulfillment Trend Chart).

    Query Parameters:
    - timeframe: 7d, 2w, 1m, 90d (default: 7d)

    Returns:
    - data: Array of daily fulfillment scores
    - meta: Metadata with average fulfillment and 7-day rolling average

    Data format:
    {
      "date": "2025-12-20",
      "fulfillment_score": 8.5,  // 0-10
      "rolling_average_7d": 7.8
    }
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

    logger.info(f"[STATS_API] Fulfillment request from auth_user_id: {auth_user_id}")

    try:
        # Get user_profile.id
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

        # Calculate date range
        timeframe_days = {"7d": 7, "2w": 14, "1m": 30, "90d": 90}
        days = timeframe_days.get(timeframe, 7)
        start_date = (date.today() - timedelta(days=days - 1)).isoformat()

        # Fetch journal_entries for the timeframe
        journal_response = (
            supabase.table("journal_entries")
            .select("local_date, fulfillment_score")
            .eq("user_id", user_id)
            .gte("local_date", start_date)
            .order("local_date", desc=False)
            .execute()
        )

        journal_entries = journal_response.data or []
        logger.info(f"📊 Found {len(journal_entries)} journal entries for fulfillment")

        # Calculate fulfillment data with 7-day rolling average
        fulfillment_data = []
        scores = []

        for entry in journal_entries:
            score = entry.get("fulfillment_score", 0)
            scores.append(score)

            # Calculate 7-day rolling average
            rolling_window = scores[-7:] if len(scores) >= 7 else scores
            rolling_avg = round(sum(rolling_window) / len(rolling_window), 1)

            fulfillment_data.append(
                {
                    "date": entry["local_date"],
                    "fulfillment_score": score,
                    "rolling_average_7d": rolling_avg,
                }
            )

        # Calculate overall average
        overall_average = round(sum(scores) / len(scores), 1) if scores else 0

        return {
            "data": fulfillment_data,
            "meta": {
                "timeframe": timeframe,
                "average_fulfillment": overall_average,
                "total_entries": len(fulfillment_data),
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching fulfillment data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch fulfillment data",
        )


@router.get("/streaks")
async def get_streak_data(
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Get streak tracking metrics (US-5.5: Streak Tracking).

    Returns:
    - data: Streak metrics object
    - meta: Metadata with timestamp

    Data format:
    {
      "current_streak": 12,      // Days
      "longest_streak": 45,      // Days
      "streak_resilience": 0.85  // 0-1 (recovery rate after misses)
    }
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

    logger.info(f"[STATS_API] Streak request from auth_user_id: {auth_user_id}")

    try:
        # Get user_profile.id
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

        # Fetch all daily_aggregates to calculate streaks
        aggregates_response = (
            supabase.table("daily_aggregates")
            .select("local_date, active_day_with_proof")
            .eq("user_id", user_id)
            .order("local_date", desc=False)
            .execute()
        )

        aggregates = aggregates_response.data or []
        logger.info(f"📊 Found {len(aggregates)} days of data for streak calculation")

        # Calculate current streak (working backwards from today)
        current_streak = 0
        longest_streak = 0
        temp_streak = 0

        # Reverse to start from most recent
        for agg in reversed(aggregates):
            if agg.get("active_day_with_proof"):
                if temp_streak == 0 or agg["local_date"] == str(
                    date.today() - timedelta(days=current_streak)
                ):
                    current_streak += 1
                temp_streak += 1
            else:
                if temp_streak > longest_streak:
                    longest_streak = temp_streak
                temp_streak = 0

        # Check if temp_streak is the longest
        if temp_streak > longest_streak:
            longest_streak = temp_streak

        # Calculate streak resilience (recovery rate after misses)
        # TODO: Implement proper resilience calculation
        streak_resilience = 0.85  # Placeholder

        return {
            "data": {
                "current_streak": current_streak,
                "longest_streak": longest_streak,
                "streak_resilience": streak_resilience,
            },
            "meta": {
                "timestamp": date.today().isoformat(),
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching streak data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch streak data",
        )


@router.get("/history")
async def get_history(
    limit: int = Query(20, ge=1, le=100, description="Number of items to return"),
    timeframe: Optional[Literal["days", "weeks", "months"]] = Query(
        None, description="Filter by timeframe: days (7d), weeks (4w), months (3m)"
    ),
    type: Optional[Literal["threads", "binds", "weave_chats"]] = Query(
        None,
        description="Filter by type: threads (journals/goals), binds (completions), weave_chats",
    ),
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Get recent activity history (US-5.5: History Section).

    Query Parameters:
    - limit: Number of items to return (default: 20, max: 100)
    - timeframe: days (7d), weeks (4w), months (3m) - filter by time period
    - type: threads (journals), binds (completions), weave_chats - filter by activity type

    Returns:
    - data: Array of activity items
    - meta: Metadata with total count

    Activity item format:
    {
      "id": "uuid",
      "type": "completion" | "journal",
      "timestamp": "2025-12-20T10:30:00Z",
      "description": "Completed 'Morning meditation'" | "Reflected on 2025-12-23 (fulfillment: 8/10)",
      "related_goal_id": "uuid" (optional, for completions only),
      "related_goal_title": "Be present" (optional, for completions only)
    }
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

    logger.info(f"[HISTORY_API] Request from auth_user_id: {auth_user_id}")

    try:
        # Get user_profile.id
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

        # Calculate date range based on timeframe
        start_date = None
        if timeframe:
            timeframe_days = {"days": 7, "weeks": 28, "months": 90}  # 7 days, 4 weeks, ~3 months
            days = timeframe_days.get(timeframe, 7)
            start_date = (date.today() - timedelta(days=days)).isoformat()

        history_items = []

        # Determine which types to fetch based on type filter
        fetch_binds = type is None or type == "binds"
        fetch_threads = type is None or type == "threads"
        # weave_chats not implemented yet, so skip

        # Fetch recent subtask completions (binds)
        if fetch_binds:
            query = (
                supabase.table("subtask_completions")
                .select("id, completed_at, subtask_instance_id")
                .eq("user_id", user_id)
            )
            if start_date:
                query = query.gte("completed_at", start_date)
            completions_response = (
                query.order("completed_at", desc=True).limit(limit // 2).execute()
            )

            completions = completions_response.data or []
        else:
            completions = []

        # OPTIMIZATION: Batch fetch all related data for completions (3 queries instead of N×3)
        if completions:
            # Extract all instance IDs
            instance_ids = [c["subtask_instance_id"] for c in completions]

            # Batch query 1: Fetch ALL instances with their template IDs
            instances_response = supabase.table("subtask_instances").select(
                "id, template_id"
            ).in_("id", instance_ids).execute()

            instances = instances_response.data or []
            instance_to_template = {i["id"]: i["template_id"] for i in instances}

            # Extract all template IDs
            template_ids = list(set(instance_to_template.values()))

            if template_ids:
                # Batch query 2: Fetch ALL templates with their titles and goal IDs
                templates_response = supabase.table("subtask_templates").select(
                    "id, title, goal_id"
                ).in_("id", template_ids).execute()

                templates = templates_response.data or []
                template_lookup = {t["id"]: t for t in templates}

                # Extract all goal IDs
                goal_ids = list(set(t.get("goal_id") for t in templates if t.get("goal_id")))

                # Batch query 3: Fetch ALL goals with their titles
                goal_lookup = {}
                if goal_ids:
                    goals_response = supabase.table("goals").select(
                        "id, title"
                    ).in_("id", goal_ids).execute()

                    goals = goals_response.data or []
                    goal_lookup = {g["id"]: g["title"] for g in goals}

                # Build history items using lookup tables
                for completion in completions:
                    instance_id = completion["subtask_instance_id"]
                    template_id = instance_to_template.get(instance_id)

                    if template_id and template_id in template_lookup:
                        template = template_lookup[template_id]
                        subtask_title = template.get("title", "Unknown task")
                        goal_id = template.get("goal_id")
                        goal_title = goal_lookup.get(goal_id) if goal_id else None

                        history_items.append({
                            "id": completion["id"],
                            "type": "completion",
                            "timestamp": completion["completed_at"],
                            "description": f"Completed '{subtask_title}'",
                            "related_goal_id": goal_id,
                            "related_goal_title": goal_title,
                        })
                    else:
                        logger.warning(f"⚠️ Could not find template for completion {completion['id']}")
            else:
                logger.warning("⚠️ No templates found for completions")

        # Fetch recent journal entries (threads)
        if fetch_threads:
            query = (
                supabase.table("journal_entries")
                .select("id, created_at, fulfillment_score, local_date")
                .eq("user_id", user_id)
            )
            if start_date:
                query = query.gte("created_at", start_date)
            journal_response = query.order("created_at", desc=True).limit(limit // 4).execute()

            journals = journal_response.data or []
        else:
            journals = []

        for journal in journals:
            history_items.append(
                {
                    "id": journal["id"],
                    "type": "journal",
                    "timestamp": journal["created_at"],
                    "description": f"Reflected on {journal['local_date']} (fulfillment: {journal.get('fulfillment_score', 0)}/10)",
                    "related_goal_id": None,
                    "related_goal_title": None,
                }
            )

        # Note: Goal creation/archival NOT tracked in history (user preference)
        # History only shows: completions (binds), journal entries (threads), weave chats
        # Fetch recent goal activities (created/archived) - also threads
        if fetch_threads:
            query = (
                supabase.table("goals")
                .select("id, title, status, created_at, updated_at")
                .eq("user_id", user_id)
            )
            if start_date:
                query = query.gte("updated_at", start_date)
            goals_response = query.order("updated_at", desc=True).limit(limit // 4).execute()

            goals = goals_response.data or []
        else:
            goals = []

        for goal in goals:
            # If goal was recently created (within last 30 days)
            created_date = date.fromisoformat(goal["created_at"].split("T")[0])
            if (date.today() - created_date).days <= 30:
                history_items.append(
                    {
                        "id": goal["id"],
                        "type": "goal_created",
                        "timestamp": goal["created_at"],
                        "description": f"Created goal '{goal['title']}'",
                        "related_goal_id": goal["id"],
                        "related_goal_title": goal["title"],
                    }
                )

            # If goal was archived
            if goal["status"] == "archived":
                history_items.append(
                    {
                        "id": goal["id"],
                        "type": "goal_archived",
                        "timestamp": goal["updated_at"],
                        "description": f"Archived goal '{goal['title']}'",
                        "related_goal_id": goal["id"],
                        "related_goal_title": goal["title"],
                    }
                )

        # Sort all items by timestamp (most recent first)
        history_items.sort(key=lambda x: x["timestamp"], reverse=True)

        # Limit to requested number
        history_items = history_items[:limit]

        logger.info(f"📊 Found {len(history_items)} history items")

        return {
            "data": history_items,
            "meta": {
                "total": len(history_items),
                "limit": limit,
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch history",
        )


@router.get("/day/{date}")
async def get_day_details(
    date: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Get detailed activity for a specific day (Dashboard day details modal).

    Path Parameters:
    - date: Date in YYYY-MM-DD format

    Returns:
    - data: Day activity object with binds and journal
    - meta: Metadata with timestamp

    Data format:
    {
      "date": "2025-12-20",
      "binds": [
        {
          "id": "uuid",
          "title": "Morning meditation",
          "notes": "Felt calm and focused",
          "has_proof": true,
          "completed_at": "2025-12-20T09:00:00Z",
          "duration_minutes": 10,
          "needle_title": "Be present"
        }
      ],
      "journal": {
        "id": "uuid",
        "fulfillment_score": 8,
        "default_responses": {
          "today_reflection": "Great day, made progress on goals",
          "tomorrow_focus": "Continue momentum"
        },
        "custom_responses": {},
        "created_at": "2025-12-20T22:00:00Z"
      },
      "total_completions": 3
    }
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

    logger.info(f"[DAY_DETAILS_API] Request for date {date} from auth_user_id: {auth_user_id}")

    try:
        # Get user_profile.id
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

        # Fetch all completions for this date
        completions_response = (
            supabase.table("subtask_completions")
            .select("id, subtask_instance_id, completed_at, duration_minutes, notes")
            .eq("user_id", user_id)
            .eq("local_date", date)
            .order("completed_at", desc=False)
            .execute()
        )

        completions = completions_response.data or []
        logger.info(f"📊 Found {len(completions)} completions for {date}")

        # For each completion, fetch bind details
        binds = []
        for completion in completions:
            try:
                # Fetch subtask instance to get title and goal
                instance_response = (
                    supabase.table("subtask_instances")
                    .select("id, title_override, subtask_template_id, goal_id")
                    .eq("id", completion["subtask_instance_id"])
                    .single()
                    .execute()
                )

                if not instance_response.data:
                    continue

                instance = instance_response.data

                # Get template title
                template_response = (
                    supabase.table("subtask_templates")
                    .select("title, goal_id")
                    .eq("id", instance["subtask_template_id"])
                    .single()
                    .execute()
                )

                bind_title = instance.get("title_override") or (
                    template_response.data.get("title") if template_response.data else "Untitled"
                )

                # Get goal title (needle)
                goal_title = None
                goal_id = instance.get("goal_id") or (
                    template_response.data.get("goal_id") if template_response.data else None
                )

                if goal_id:
                    goal_response = (
                        supabase.table("goals")
                        .select("title")
                        .eq("id", goal_id)
                        .single()
                        .execute()
                    )
                    if goal_response.data:
                        goal_title = goal_response.data.get("title")

                # Check if has proof
                proof_response = (
                    supabase.table("captures")
                    .select("id")
                    .eq("subtask_instance_id", completion["subtask_instance_id"])
                    .eq("user_id", user_id)
                    .limit(1)
                    .execute()
                )

                has_proof = len(proof_response.data) > 0

                binds.append({
                    "id": completion["id"],
                    "title": bind_title,
                    "notes": completion.get("notes"),
                    "has_proof": has_proof,
                    "completed_at": completion["completed_at"],
                    "duration_minutes": completion.get("duration_minutes"),
                    "needle_title": goal_title,
                })

            except Exception as bind_error:
                logger.warning(f"⚠️ Could not fetch bind details: {str(bind_error)}")
                continue

        # Fetch journal entry for this date
        journal = None
        try:
            journal_response = (
                supabase.table("journal_entries")
                .select("id, fulfillment_score, default_responses, custom_responses, created_at")
                .eq("user_id", user_id)
                .eq("local_date", date)
                .single()
                .execute()
            )

            if journal_response.data:
                journal = journal_response.data
                logger.info(f"📖 Found journal entry for {date}")
        except Exception:
            # No journal for this date (404 is expected)
            logger.info(f"📖 No journal entry for {date}")

        return {
            "data": {
                "date": date,
                "binds": binds,
                "journal": journal,
                "total_completions": len(binds),
            },
            "meta": {
                "timestamp": datetime.utcnow().isoformat(),
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching day details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch day details",
        )

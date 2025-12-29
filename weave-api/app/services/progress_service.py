"""
Progress Service - Gamification System
Calculates user level, XP, and streak based on completion data

Formula: 2x leveling system (levels 1-15)
- Level 1 → 2: 4 XP
- Level 2 → 3: 6 XP (4 + 2)
- Level 3 → 4: 8 XP (6 + 2)
- Pattern: Each level requires 2 more XP than the previous
"""

import logging
from datetime import date, timedelta
from typing import Literal

from supabase import Client

logger = logging.getLogger(__name__)


def get_xp_for_level(target_level: int) -> int:
    """
    Get cumulative XP required to reach a specific level

    Args:
        target_level: The level to calculate XP for (1-15)

    Returns:
        Total XP needed to reach this level from level 1

    Examples:
        Level 1: 0 XP (starting level)
        Level 2: 4 XP
        Level 3: 10 XP (4 + 6)
        Level 4: 18 XP (4 + 6 + 8)
    """
    if target_level <= 1:
        return 0
    if target_level > 15:
        return get_xp_for_level(15)  # Cap at level 15

    # Formula: n * (n + 3) where n = target_level - 1
    n = target_level - 1
    return n * (n + 3)


def get_level_from_xp(total_xp: int) -> int:
    """
    Calculate current level from total XP

    Args:
        total_xp: User's total accumulated XP

    Returns:
        Current level (1-15)
    """
    if total_xp <= 0:
        return 1

    # Find the highest level where total_xp >= threshold
    for level in range(15, 0, -1):
        if total_xp >= get_xp_for_level(level):
            return level

    return 1


def get_xp_to_next_level(total_xp: int, current_level: int) -> int:
    """
    Calculate XP needed to reach next level

    Args:
        total_xp: User's total accumulated XP
        current_level: User's current level

    Returns:
        XP remaining to next level
    """
    next_level_xp = get_xp_for_level(current_level + 1)
    return max(0, next_level_xp - total_xp)


def calculate_streak(
    aggregates: list[dict],
    today: date,
) -> tuple[int, int, Literal["active", "at_risk", "broken"], bool]:
    """
    Calculate current streak, longest streak, status, and grace period

    Streak rules:
    - Active: Completed bind today or yesterday
    - At Risk: Missed yesterday but have 24-hour grace period (no miss 2 days ago)
    - Broken: Missed yesterday and grace period expired (missed 2+ days ago)

    Grace period:
    - One 24-hour grace period per streak
    - If you miss a day but completed the day before, streak continues with grace
    - Grace period only saves streak once - second miss breaks it

    Args:
        aggregates: Daily aggregates sorted by local_date (ascending)
        today: Current date

    Returns:
        Tuple of (current_streak, longest_streak, status, grace_period_active)
    """
    if not aggregates:
        return 0, 0, "broken", False

    # Build completion map (date -> has_completion)
    completion_map = {}
    for agg in aggregates:
        agg_date = date.fromisoformat(agg["local_date"])
        has_completion = agg.get("completed_count", 0) > 0
        completion_map[agg_date] = has_completion

    # Calculate current streak (walk backwards from today)
    current_streak = 0
    grace_used = False
    grace_period_active = False
    check_date = today

    while True:
        has_completion = completion_map.get(check_date, False)

        if has_completion:
            current_streak += 1
            check_date -= timedelta(days=1)
        elif not grace_used and current_streak > 0:
            # Use grace period once
            grace_used = True
            grace_period_active = (check_date == today - timedelta(days=1))
            check_date -= timedelta(days=1)
        else:
            # Streak broken
            break

    # Calculate longest streak (scan all historical data)
    longest_streak = 0
    temp_streak = 0
    temp_grace_used = False

    # Get sorted dates
    sorted_dates = sorted(completion_map.keys())
    if not sorted_dates:
        longest_streak = current_streak
    else:
        # Walk through all dates checking for streaks
        for i, check_date in enumerate(sorted_dates):
            has_completion = completion_map[check_date]

            if has_completion:
                temp_streak += 1
                longest_streak = max(longest_streak, temp_streak)
            elif not temp_grace_used and temp_streak > 0:
                # Use grace period
                temp_grace_used = True
            else:
                # Reset streak
                temp_streak = 0
                temp_grace_used = False

    # Determine status
    yesterday = today - timedelta(days=1)
    completed_today = completion_map.get(today, False)
    completed_yesterday = completion_map.get(yesterday, False)

    if completed_today or completed_yesterday:
        status: Literal["active", "at_risk", "broken"] = "active"
    elif grace_period_active:
        status = "at_risk"
    else:
        status = "broken"

    return current_streak, longest_streak, status, grace_period_active


def get_user_progress_stats(supabase: Client, user_id: str) -> dict:
    """
    Get comprehensive user progress statistics

    Returns:
        Dictionary with level, XP, streak, and aggregate stats
    """
    # Fetch user profile with XP columns
    user_response = (
        supabase.table("user_profiles")
        .select("total_xp, level, current_streak, longest_streak")
        .eq("id", user_id)
        .single()
        .execute()
    )

    if not user_response.data:
        logger.error(f"❌ User profile not found: {user_id}")
        raise ValueError(f"User profile not found: {user_id}")

    user_profile = user_response.data
    total_xp = user_profile.get("total_xp", 0)
    stored_level = user_profile.get("level", 1)
    longest_streak = user_profile.get("longest_streak", 0)

    # Calculate level from XP (should match stored level)
    calculated_level = get_level_from_xp(total_xp)
    if calculated_level != stored_level:
        logger.warning(
            f"⚠️ Level mismatch for user {user_id}: calculated={calculated_level}, stored={stored_level}"
        )

    # Get XP to next level
    xp_to_next = get_xp_to_next_level(total_xp, calculated_level)

    # Fetch daily aggregates for streak calculation
    aggregates_response = (
        supabase.table("daily_aggregates")
        .select("local_date, completed_count")
        .eq("user_id", user_id)
        .order("local_date", desc=False)
        .execute()
    )

    aggregates = aggregates_response.data or []

    # Calculate streak
    current_streak, longest_streak_calculated, streak_status, grace_active = calculate_streak(
        aggregates, date.today()
    )

    # Use max of stored and calculated longest streak
    final_longest_streak = max(longest_streak, longest_streak_calculated)

    # Determine character state based on level
    if calculated_level >= 8:
        character_state = "weave"
    elif calculated_level >= 4:
        character_state = "thread"
    else:
        character_state = "strand"

    # Get total completion counts
    total_completions = sum(agg.get("completed_count", 0) for agg in aggregates)
    total_active_days = len([agg for agg in aggregates if agg.get("completed_count", 0) > 0])

    return {
        "level": calculated_level,
        "total_xp": total_xp,
        "xp_to_next_level": xp_to_next,
        "current_streak": current_streak,
        "longest_streak": final_longest_streak,
        "streak_status": streak_status,
        "grace_period_active": grace_active,
        "weave_character_state": character_state,
        "total_completions": total_completions,
        "total_active_days": total_active_days,
    }


def update_user_progress(supabase: Client, user_id: str, xp_gained: int, local_date: str) -> dict:
    """
    Update user progress when a bind is completed

    Args:
        supabase: Supabase client
        user_id: User profile ID
        xp_gained: XP to add (typically 1 per completion)
        local_date: Date of completion (YYYY-MM-DD)

    Returns:
        Dictionary with progress update details including level_up flag
    """
    # Get current user profile
    user_response = (
        supabase.table("user_profiles")
        .select("total_xp, level, current_streak, longest_streak")
        .eq("id", user_id)
        .single()
        .execute()
    )

    if not user_response.data:
        logger.error(f"❌ User profile not found: {user_id}")
        raise ValueError(f"User profile not found: {user_id}")

    user_profile = user_response.data
    old_xp = user_profile.get("total_xp", 0)
    old_level = user_profile.get("level", 1)
    old_streak = user_profile.get("current_streak", 0)
    old_longest = user_profile.get("longest_streak", 0)

    # Calculate new XP and level
    new_xp = old_xp + xp_gained
    new_level = get_level_from_xp(new_xp)
    level_up = new_level > old_level
    xp_to_next = get_xp_to_next_level(new_xp, new_level)

    # Fetch daily aggregates for streak recalculation
    aggregates_response = (
        supabase.table("daily_aggregates")
        .select("local_date, completed_count")
        .eq("user_id", user_id)
        .order("local_date", desc=False)
        .execute()
    )

    aggregates = aggregates_response.data or []

    # Calculate new streak
    today = date.today()
    new_streak, new_longest, streak_status, grace_active = calculate_streak(aggregates, today)

    # Update longest streak if new record
    final_longest = max(old_longest, new_longest)

    # Check for streak milestone (every 7 days)
    streak_milestone = None
    if new_streak > 0 and new_streak % 7 == 0 and new_streak > old_streak:
        streak_milestone = {
            "day": new_streak,
            "message": f"🔥 {new_streak}-day streak! You're on fire!"
        }

    # Determine if grace period saved the streak
    grace_saved = grace_active and new_streak > 0 and streak_status == "at_risk"

    # Update user profile with new values
    update_data = {
        "total_xp": new_xp,
        "level": new_level,
        "current_streak": new_streak,
        "longest_streak": final_longest,
    }

    supabase.table("user_profiles").update(update_data).eq("id", user_id).execute()

    logger.info(
        f"[PROGRESS] Updated user {user_id}: "
        f"Level {old_level}→{new_level}, XP {old_xp}→{new_xp}, Streak {old_streak}→{new_streak}"
    )

    return {
        "level_before": old_level,
        "level_after": new_level,
        "level_up": level_up,
        "xp_gained": xp_gained,
        "total_xp": new_xp,
        "xp_to_next_level": xp_to_next,
        "streak_before": old_streak,
        "streak_after": new_streak,
        "streak_status": streak_status,
        "streak_milestone_reached": streak_milestone,
        "grace_period_saved": grace_saved,
    }

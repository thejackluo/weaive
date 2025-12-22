"""
Stats API Router - Epic 5: Progress Visualization

Endpoints:
- GET /api/stats/consistency - Consistency heat map data
- GET /api/stats/fulfillment - Fulfillment trend chart data
- GET /api/stats/streaks - Streak tracking metrics

Implements US-5.2, US-5.3, US-5.5
"""

import logging
from datetime import date, timedelta
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
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Get consistency heat map data (US-5.2: Consistency Heat Map).

    Query Parameters:
    - timeframe: 7d, 2w, 1m, 90d (default: 7d)
    - filter_type: overall, needle, bind, thread
    - filter_id: Goal/bind ID if filter_type is needle or bind

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
        start_date = (date.today() - timedelta(days=days - 1)).isoformat()

        # Fetch daily_aggregates for the timeframe
        aggregates_response = (
            supabase.table("daily_aggregates")
            .select("local_date, completed_count, scheduled_count, active_day_with_proof")
            .eq("user_id", user_id)
            .gte("local_date", start_date)
            .order("local_date", desc=False)
            .execute()
        )

        aggregates = aggregates_response.data or []
        logger.info(f"📊 Found {len(aggregates)} days of data for consistency")

        # Calculate consistency data
        consistency_data = []
        total_completed = 0
        total_scheduled = 0

        for agg in aggregates:
            completed = agg.get("completed_count", 0)
            scheduled = agg.get("scheduled_count", 1)  # Avoid division by zero
            percentage = round((completed / scheduled) * 100, 1) if scheduled > 0 else 0

            consistency_data.append({
                "date": agg["local_date"],
                "completion_percentage": percentage,
                "completed_count": completed,
                "total_count": scheduled,
            })

            total_completed += completed
            total_scheduled += scheduled

        # Calculate overall consistency percentage
        overall_consistency = (
            round((total_completed / total_scheduled) * 100, 1) if total_scheduled > 0 else 0
        )

        return {
            "data": consistency_data,
            "meta": {
                "timeframe": timeframe,
                "filter_type": filter_type,
                "consistency_percentage": overall_consistency,
                "total_days": len(consistency_data),
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

            fulfillment_data.append({
                "date": entry["local_date"],
                "fulfillment_score": score,
                "rolling_average_7d": rolling_avg,
            })

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
                if temp_streak == 0 or agg["local_date"] == str(date.today() - timedelta(days=current_streak)):
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

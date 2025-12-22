"""
Rate Limiting Middleware - Free tier upload limits

Story: 0.9 - AI-Powered Image Service
Free Tier Limits:
- 5 images per day
- 5MB total upload per day
- 5 AI vision analyses per day

Resets at midnight in user's local timezone.
"""

import logging
from datetime import datetime, time, timedelta
from typing import Optional
from uuid import UUID

import pytz
from fastapi import HTTPException, status
from supabase import Client

logger = logging.getLogger(__name__)


class RateLimitExceeded(HTTPException):
    """Rate limit exceeded error"""

    def __init__(
        self,
        limit_type: str,
        current_usage: float,
        limit: float,
        retry_after_seconds: int,
        message: Optional[str] = None,
    ):
        self.limit_type = limit_type
        self.current_usage = current_usage
        self.limit = limit
        self.retry_after_seconds = retry_after_seconds

        if not message:
            message = (
                f"Daily {limit_type} limit reached ({current_usage}/{limit}). "
                f"Upgrade to Pro for unlimited."
            )

        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": {
                    "code": "RATE_LIMIT_EXCEEDED",
                    "message": message,
                    "retryable": False,
                    "retry_after": retry_after_seconds,
                }
            },
            headers={"Retry-After": str(retry_after_seconds)},
        )


def calculate_seconds_until_midnight(user_timezone: str) -> int:
    """
    Calculate seconds until midnight in user's timezone

    Args:
        user_timezone: IANA timezone string (e.g., 'America/New_York')

    Returns:
        Seconds until midnight (00:00:00 next day)
    """
    try:
        tz = pytz.timezone(user_timezone)
        now = datetime.now(tz)

        # Calculate next midnight
        next_midnight = datetime.combine(
            now.date() + timedelta(days=1),
            time(0, 0, 0),
            tzinfo=tz,
        )

        seconds = int((next_midnight - now).total_seconds())
        return max(seconds, 0)  # Ensure non-negative

    except Exception as e:
        logger.error(f"Error calculating midnight for timezone {user_timezone}: {e}")
        # Fallback: assume UTC, return seconds until UTC midnight
        now_utc = datetime.now(pytz.UTC)
        next_midnight_utc = datetime.combine(
            now_utc.date() + timedelta(days=1),
            time(0, 0, 0),
            tzinfo=pytz.UTC,
        )
        return int((next_midnight_utc - now_utc).total_seconds())


def get_user_local_date(user_timezone: str) -> str:
    """
    Get current date in user's local timezone

    Args:
        user_timezone: IANA timezone string

    Returns:
        Date string in YYYY-MM-DD format
    """
    try:
        tz = pytz.timezone(user_timezone)
        return datetime.now(tz).date().isoformat()
    except Exception as e:
        logger.error(f"Error getting local date for timezone {user_timezone}: {e}")
        # Fallback to UTC
        return datetime.now(pytz.UTC).date().isoformat()


async def get_or_create_daily_aggregate(
    supabase: Client,
    user_id: UUID,
    local_date: str,
) -> dict:
    """
    Get or create daily aggregate record

    Args:
        supabase: Supabase client
        user_id: User's UUID
        local_date: Date string (YYYY-MM-DD)

    Returns:
        Daily aggregate record
    """
    # Try to fetch existing record
    response = (
        supabase.table("daily_aggregates")
        .select("*")
        .eq("user_id", str(user_id))
        .eq("local_date", local_date)
        .execute()
    )

    if response.data and len(response.data) > 0:
        return response.data[0]

    # Create new record if doesn't exist
    new_record = {
        "user_id": str(user_id),
        "local_date": local_date,
        "upload_count": 0,
        "upload_size_mb": 0.0,
        "ai_vision_count": 0,
    }

    response = (
        supabase.table("daily_aggregates")
        .insert(new_record)
        .execute()
    )

    if not response.data:
        raise RuntimeError(f"Failed to create daily_aggregate for {user_id} on {local_date}")

    return response.data[0]


async def check_upload_rate_limit(
    supabase: Client,
    user_id: UUID,
    file_size_bytes: int,
    user_timezone: str,
) -> None:
    """
    Check if user has exceeded upload rate limits

    Free Tier Limits:
    - 5 images per day
    - 5MB total upload per day

    Args:
        supabase: Supabase client
        user_id: User's UUID
        file_size_bytes: Size of file being uploaded (bytes)
        user_timezone: User's IANA timezone

    Raises:
        RateLimitExceeded: If limit exceeded
    """
    local_date = get_user_local_date(user_timezone)
    file_size_mb = file_size_bytes / (1024 * 1024)  # Convert bytes to MB

    # Get or create daily aggregate
    agg = await get_or_create_daily_aggregate(supabase, user_id, local_date)

    # Check upload count limit (5 images/day)
    if agg.get("upload_count", 0) >= 5:
        seconds_until_midnight = calculate_seconds_until_midnight(user_timezone)
        raise RateLimitExceeded(
            limit_type="upload",
            current_usage=agg.get("upload_count", 0),
            limit=5,
            retry_after_seconds=seconds_until_midnight,
            message=f"Daily upload limit reached ({agg.get('upload_count', 0)}/5 images). Resets at midnight.",
        )

    # Check storage size limit (5MB/day)
    current_size_mb = float(agg.get("upload_size_mb", 0))
    new_total_mb = current_size_mb + file_size_mb

    if new_total_mb > 5.0:
        seconds_until_midnight = calculate_seconds_until_midnight(user_timezone)
        raise RateLimitExceeded(
            limit_type="storage",
            current_usage=round(current_size_mb, 2),
            limit=5.0,
            retry_after_seconds=seconds_until_midnight,
            message=f"Daily storage limit reached ({current_size_mb:.2f}MB/5MB). Resets at midnight.",
        )


async def check_ai_vision_rate_limit(
    supabase: Client,
    user_id: UUID,
    user_timezone: str,
) -> None:
    """
    Check if user has exceeded AI vision analysis rate limit

    Free Tier Limit: 5 AI analyses per day

    Args:
        supabase: Supabase client
        user_id: User's UUID
        user_timezone: User's IANA timezone

    Raises:
        RateLimitExceeded: If limit exceeded
    """
    local_date = get_user_local_date(user_timezone)

    # Get or create daily aggregate
    agg = await get_or_create_daily_aggregate(supabase, user_id, local_date)

    # Check AI vision count limit (5 analyses/day)
    if agg.get("ai_vision_count", 0) >= 5:
        seconds_until_midnight = calculate_seconds_until_midnight(user_timezone)
        raise RateLimitExceeded(
            limit_type="AI analysis",
            current_usage=agg.get("ai_vision_count", 0),
            limit=5,
            retry_after_seconds=seconds_until_midnight,
            message=f"Daily AI analysis limit reached ({agg.get('ai_vision_count', 0)}/5 images). Resets at midnight.",
        )


async def increment_upload_usage(
    supabase: Client,
    user_id: UUID,
    local_date: str,
    file_size_mb: float,
) -> None:
    """
    Increment upload usage counters atomically

    Args:
        supabase: Supabase client
        user_id: User's UUID
        local_date: Date string (YYYY-MM-DD)
        file_size_mb: File size in MB
    """
    # Use PostgreSQL's UPDATE with atomic increment
    # This prevents race conditions from concurrent uploads
    try:
        supabase.rpc(
            "increment_upload_usage",
            {
                "p_user_id": str(user_id),
                "p_local_date": local_date,
                "p_size_mb": file_size_mb,
            },
        ).execute()
    except Exception as e:
        logger.error(f"Failed to increment upload usage: {e}")
        # Fallback: direct update (less atomic but still works)
        agg = await get_or_create_daily_aggregate(supabase, user_id, local_date)

        new_count = agg.get("upload_count", 0) + 1
        new_size_mb = float(agg.get("upload_size_mb", 0)) + file_size_mb

        supabase.table("daily_aggregates").update(
            {
                "upload_count": new_count,
                "upload_size_mb": new_size_mb,
            }
        ).eq("user_id", str(user_id)).eq("local_date", local_date).execute()


async def increment_ai_vision_usage(
    supabase: Client,
    user_id: UUID,
    local_date: str,
) -> None:
    """
    Increment AI vision usage counter atomically

    Args:
        supabase: Supabase client
        user_id: User's UUID
        local_date: Date string (YYYY-MM-DD)
    """
    try:
        supabase.rpc(
            "increment_ai_vision_usage",
            {
                "p_user_id": str(user_id),
                "p_local_date": local_date,
            },
        ).execute()
    except Exception as e:
        logger.error(f"Failed to increment AI vision usage: {e}")
        # Fallback: direct update
        agg = await get_or_create_daily_aggregate(supabase, user_id, local_date)

        new_count = agg.get("ai_vision_count", 0) + 1

        supabase.table("daily_aggregates").update(
            {"ai_vision_count": new_count}
        ).eq("user_id", str(user_id)).eq("local_date", local_date).execute()


async def get_upload_usage(
    supabase: Client,
    user_id: UUID,
    user_timezone: str,
) -> dict:
    """
    Get current upload usage for user

    Returns:
        {
            "upload_count": int,
            "upload_size_mb": float,
            "ai_vision_count": int,
            "local_date": str
        }
    """
    local_date = get_user_local_date(user_timezone)
    agg = await get_or_create_daily_aggregate(supabase, user_id, local_date)

    return {
        "upload_count": agg.get("upload_count", 0),
        "upload_size_mb": float(agg.get("upload_size_mb", 0)),
        "ai_vision_count": agg.get("ai_vision_count", 0),
        "local_date": local_date,
    }

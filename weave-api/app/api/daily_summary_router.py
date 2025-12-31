"""
Daily Summary API Router

Provides consolidated daily data (binds, completions, captures, journal) for a specific date.

Endpoints:
- GET /api/daily-summary/{date} - Get complete daily summary for a specific date

Story: Daily Detail Page (Epic 2 + 5)
Tech-Spec: tech-spec-daily-detail-page.md
"""

import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from supabase import Client

from app.api.binds.router import generate_missing_bind_instances
from app.core.deps import get_current_user, get_supabase_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/daily-summary", tags=["daily-summary"])

# Constants
DEFAULT_GOAL_COLOR = "blue"  # Until color column is added to goals table
SIGNED_URL_EXPIRY_SECONDS = 3600  # 1 hour


# Helper function to get user profile ID
async def get_user_profile_id(supabase: Client, auth_user_id: str) -> str:
    """
    Get user_profile.id from auth_user_id.

    Args:
        supabase: Supabase client
        auth_user_id: Auth user ID from JWT token

    Returns:
        user_profile.id (UUID as string)

    Raises:
        HTTPException if profile not found
    """
    try:
        profile_response = (
            supabase.table("user_profiles")
            .select("id")
            .eq("auth_user_id", auth_user_id)
            .single()
            .execute()
        )

        if not profile_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found. Please complete onboarding first."
            )

        return profile_response.data["id"]
    except Exception as e:
        if "404" in str(e) or "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found. Please complete onboarding first."
            )
        raise


# Pydantic Models
class CaptureData(BaseModel):
    """Capture (proof) data"""
    id: str
    capture_type: str  # 'image', 'audio', 'text'
    storage_path: Optional[str] = None
    signed_url: Optional[str] = None
    content_text: Optional[str] = None  # For text captures
    created_at: str


class BindData(BaseModel):
    """Bind completion data"""
    id: str
    title: str
    goal_name: str
    goal_color: str
    completed: bool
    completed_at: Optional[str] = None
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None
    captures: list[CaptureData] = Field(default_factory=list)


class JournalEntryData(BaseModel):
    """Journal entry data"""
    id: str
    fulfillment_score: int
    default_responses: Optional[dict] = None
    custom_responses: Optional[dict] = None
    submitted_at: str


class DailyAggregates(BaseModel):
    """Daily aggregates metadata"""
    completed_count: int
    total_binds: int
    has_proof: bool
    has_journal: bool


class DailySummaryData(BaseModel):
    """Complete daily summary"""
    date: str
    aggregates: DailyAggregates
    binds: list[BindData]
    journal_entry: Optional[JournalEntryData] = None


class DailySummaryResponse(BaseModel):
    """API response wrapper"""
    data: DailySummaryData
    meta: dict = Field(default_factory=lambda: {"timestamp": datetime.utcnow().isoformat()})


@router.get("/{date}", response_model=DailySummaryResponse)
async def get_daily_summary(
    date: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Get complete daily summary for a specific date.

    Returns consolidated data including:
    - Daily aggregates (completion counts, proof status)
    - Binds with completion details and proof captures
    - Journal entry with fulfillment score and responses

    Args:
        date: Date in YYYY-MM-DD format
        user: Authenticated user from JWT
        supabase: Supabase client (injected)

    Returns:
        DailySummaryResponse with complete daily data

    Raises:
        400: Invalid date format or future date
        404: User profile not found
        500: Database query error
    """
    auth_user_id = user["sub"]

    # Validate date format
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )

    # Block future dates (use UTC for consistency)
    today = datetime.now(timezone.utc).date()
    if target_date > today:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot access future dates"
        )

    # Get user profile ID
    user_id = await get_user_profile_id(supabase, auth_user_id)

    logger.info(f"[DAILY_SUMMARY] Fetching data for user {user_id}, date {date}")

    # Generate missing bind instances for this date (ensures bind instances exist)
    # This mirrors the logic in /api/binds/today endpoint
    try:
        created_count = await generate_missing_bind_instances(supabase, user_id, date)
        if created_count > 0:
            logger.info(f"[DAILY_SUMMARY] Auto-generated {created_count} missing instances for {date}")
    except Exception as gen_error:
        logger.warning(f"⚠️ Failed to generate missing bind instances: {gen_error}")
        # Don't fail the entire request if generation fails

    # Query 1: Get daily aggregates
    try:
        agg_response = (
            supabase.table("daily_aggregates")
            .select("completed_count, has_proof, has_journal")
            .eq("user_id", user_id)
            .eq("local_date", date)
            .execute()
        )

        if agg_response.data and len(agg_response.data) > 0:
            agg_data = agg_response.data[0]
            completed_count = agg_data.get("completed_count", 0)
            has_proof = agg_data.get("has_proof", False)
            has_journal = agg_data.get("has_journal", False)
        else:
            completed_count = 0
            has_proof = False
            has_journal = False
    except Exception as e:
        logger.error(f"❌ Error fetching daily_aggregates: {str(e)}", exc_info=True)
        completed_count = 0
        has_proof = False
        has_journal = False

    # Query 2: Get binds with completions
    # Strategy: Query ALL instances scheduled for this date FIRST (like /api/binds/today)
    # Then match completions to them (not the other way around)
    # This ensures we show ALL binds (completed + incomplete)
    try:
        # STEP 1: Get ALL instances scheduled for this date
        instances_response = (
            supabase.table("subtask_instances")
            .select("""
                id,
                template_id,
                goal_id,
                title_override,
                estimated_minutes,
                created_at,
                goals!subtask_instances_goal_id_fkey(id, title, status),
                subtask_templates!subtask_instances_template_id_fkey(title, times_per_week)
            """)
            .eq("user_id", user_id)
            .eq("scheduled_for_date", date)
            .execute()
        )

        logger.info(f"[DAILY_SUMMARY] Found {len(instances_response.data or [])} instances scheduled for {date}")

        # STEP 2: Get completions that happened on this date
        completions_response = (
            supabase.table("subtask_completions")
            .select("subtask_instance_id, completed_at, duration_minutes, notes, local_date")
            .eq("user_id", user_id)
            .eq("local_date", date)
            .execute()
        )

        logger.info(f"[DAILY_SUMMARY] Found {len(completions_response.data or [])} completions on date {date}")

        # Build map of completions by instance ID
        completions_by_instance = {
            comp["subtask_instance_id"]: comp
            for comp in completions_response.data
        } if completions_response.data else {}

        # STEP 3: Get captures for completed instances
        # Captures link to subtask_instance_id + local_date (NOT completion_id)
        instance_ids_with_completions = list(completions_by_instance.keys())

        captures_response = (
            supabase.table("captures")
            .select("id, subtask_instance_id, type, storage_key, content_text, created_at")
            .in_("subtask_instance_id", instance_ids_with_completions)
            .eq("local_date", date)
            .execute()
        ) if instance_ids_with_completions else None

        captures_by_instance = {}
        if captures_response and captures_response.data:
            for cap in captures_response.data:
                inst_id = cap["subtask_instance_id"]
                if inst_id not in captures_by_instance:
                    captures_by_instance[inst_id] = []

                # Generate signed URL for image/audio captures
                signed_url = None
                storage_key = cap.get("storage_key")
                if storage_key:
                    try:
                        signed_url_response = supabase.storage.from_("captures").create_signed_url(
                            storage_key,
                            SIGNED_URL_EXPIRY_SECONDS
                        )
                        signed_url = signed_url_response.get("signedURL")
                    except Exception as url_error:
                        logger.warning(f"⚠️ Failed to generate signed URL for {storage_key}: {url_error}")

                captures_by_instance[inst_id].append(CaptureData(
                    id=cap["id"],
                    capture_type=cap["type"],  # DB column is 'type', model expects 'capture_type'
                    storage_path=storage_key,
                    signed_url=signed_url,
                    content_text=cap.get("content_text"),  # Text content for text captures
                    created_at=cap["created_at"]
                ))

        # Build binds list
        binds = []
        for instance in (instances_response.data or []):
            # Extract nested data (Supabase returns joined data as nested objects or arrays)
            template_data = instance.get("subtask_templates")
            goal_data = instance.get("goals")

            # Handle case where Supabase returns array for join (take first element)
            if isinstance(template_data, list):
                template_data = template_data[0] if template_data else {}
            if isinstance(goal_data, list):
                goal_data = goal_data[0] if goal_data else {}

            template = template_data or {}
            goal = goal_data or {}

            instance_id = instance["id"]
            completion = completions_by_instance.get(instance_id)

            # Get captures for this instance (if any)
            captures = captures_by_instance.get(instance_id, [])

            # Use title_override if set, otherwise template title
            bind_title = instance.get("title_override") or template.get("title", "Unnamed bind")

            binds.append(BindData(
                id=instance_id,
                title=bind_title,
                goal_name=goal.get("title", "No goal"),
                goal_color=DEFAULT_GOAL_COLOR,
                completed=completion is not None,
                completed_at=completion["completed_at"] if completion else None,
                duration_minutes=completion["duration_minutes"] if completion else None,
                notes=completion["notes"] if completion else None,
                captures=captures
            ))

        total_binds = len(binds)
        # Recalculate completed_count from actual binds data (more accurate than daily_aggregates)
        completed_count = sum(1 for bind in binds if bind.completed)

    except Exception as e:
        logger.error(f"❌ Error fetching binds: {str(e)}")
        logger.error(f"Traceback: {e}", exc_info=True)
        binds = []
        total_binds = 0
        completed_count = 0

    # Query 3: Get journal entry
    try:
        journal_response = (
            supabase.table("journal_entries")
            .select("id, fulfillment_score, default_responses, custom_responses, created_at")
            .eq("user_id", user_id)
            .eq("local_date", date)
            .execute()
        )

        if journal_response.data and len(journal_response.data) > 0:
            journal_data = journal_response.data[0]
            journal_entry = JournalEntryData(
                id=journal_data["id"],
                fulfillment_score=journal_data["fulfillment_score"],
                default_responses=journal_data.get("default_responses"),
                custom_responses=journal_data.get("custom_responses"),
                submitted_at=journal_data["created_at"]
            )
        else:
            journal_entry = None
    except Exception as e:
        logger.error(f"❌ Error fetching journal: {str(e)}", exc_info=True)
        journal_entry = None

    # Build response
    summary = DailySummaryData(
        date=date,
        aggregates=DailyAggregates(
            completed_count=completed_count,
            total_binds=total_binds,
            has_proof=has_proof,
            has_journal=has_journal
        ),
        binds=binds,
        journal_entry=journal_entry
    )

    logger.info(f"✅ Daily summary complete: {total_binds} binds, journal={journal_entry is not None}")

    return DailySummaryResponse(data=summary)

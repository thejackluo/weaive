"""
Story 4.1a: Journal Entry API Endpoints

FastAPI router for journal entry operations:
- POST /api/journal-entries: Create new journal entry
- GET /api/journal-entries: Retrieve journal entries (with optional date range filters)
- GET /api/journal-entries/today: Retrieve today's journal entry
- PATCH /api/journal-entries/{journal_id}: Update existing journal entry
"""

import asyncio
import logging
import traceback
from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.core.deps import get_ai_service, get_current_user, get_supabase_client
from app.services.ai.ai_service import AIService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/journal-entries", tags=["journal"])


# Helper function to get or create user profile
async def get_or_create_user_profile(supabase, auth_user_id: str) -> str:
    """
    Get user_profile.id from auth_user_id, creating profile if it doesn't exist.

    Args:
        supabase: Supabase client
        auth_user_id: Auth user ID from JWT token

    Returns:
        user_profile.id (UUID as string)

    Raises:
        HTTPException if profile creation fails
    """
    try:
        # Try to get existing profile
        profile_response = (
            supabase.table("user_profiles")
            .select("id")
            .eq("auth_user_id", auth_user_id)
            .single()
            .execute()
        )
        user_id = profile_response.data["id"]
        logger.info(f"[JOURNAL_API] Found user_profile.id: {user_id}")
        return user_id
    except Exception:
        # Profile doesn't exist - auto-create it
        logger.warning(f"⚠️  No user profile found for auth_user_id: {auth_user_id}, creating one...")

        try:
            new_profile = supabase.table("user_profiles").insert({
                "auth_user_id": auth_user_id,
                "display_name": "User",
                "timezone": "America/Los_Angeles",
                "locale": "en-US"
            }).execute()

            user_id = new_profile.data[0]["id"]
            logger.info(f"✅ Auto-created user_profile.id: {user_id}")
            return user_id
        except Exception as create_error:
            logger.error(f"❌ Failed to auto-create user profile: {create_error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to initialize user profile",
            )


# Pydantic Models
class DefaultResponses(BaseModel):
    """Default reflection questions responses"""

    today_reflection: Optional[str] = Field(None, max_length=500)
    tomorrow_focus: Optional[str] = Field(None, max_length=100)


class JournalEntryCreate(BaseModel):
    """Create journal entry request"""

    local_date: str = Field(..., description="Local date in YYYY-MM-DD format")
    fulfillment_score: int = Field(..., ge=1, le=10, description="Daily fulfillment rating 1-10")
    default_responses: Optional[DefaultResponses] = None
    custom_responses: Optional[dict] = None


class JournalEntryUpdate(BaseModel):
    """Update journal entry request (partial update)"""

    fulfillment_score: Optional[int] = Field(None, ge=1, le=10)
    default_responses: Optional[DefaultResponses] = None
    custom_responses: Optional[dict] = None


class JournalEntryResponse(BaseModel):
    """Journal entry response"""

    id: str
    user_id: str
    local_date: str
    fulfillment_score: int
    default_responses: Optional[dict] = None
    custom_responses: Optional[dict] = None
    created_at: str
    updated_at: str


class ApiResponse(BaseModel):
    """Standard API response wrapper"""

    data: JournalEntryResponse
    meta: dict = Field(default_factory=lambda: {"timestamp": datetime.utcnow().isoformat()})


async def trigger_ai_feedback_generation(
    ai_service: Optional[AIService], user_id: str, journal_id: str, journal_data: dict
):
    """
    Trigger AI feedback generation asynchronously (Story 4.1, AC #15)

    This function:
    - Generates daily recap from journal entry
    - Includes custom question responses for pattern detection
    - Runs async (non-blocking)

    Args:
        ai_service: AI service instance
        user_id: User profile ID
        journal_id: Journal entry ID
        journal_data: Journal entry data including custom_responses
    """
    if not ai_service:
        logger.warning(
            f"⚠️  AI service not available - skipping feedback generation for journal {journal_id}"
        )
        return

    try:
        # Extract data for AI prompt
        fulfillment_score = journal_data.get("fulfillment_score", 5)
        default_responses = journal_data.get("default_responses", {})
        custom_responses = journal_data.get("custom_responses", {})

        # Build context for AI (Story 4.1, AC #15: Pass custom responses to AI)
        context_parts = [
            f"Fulfillment Score: {fulfillment_score}/10",
        ]

        if default_responses:
            today_reflection = default_responses.get("today_reflection", "")
            tomorrow_focus = default_responses.get("tomorrow_focus", "")
            if today_reflection:
                context_parts.append(f"Today's Reflection: {today_reflection}")
            if tomorrow_focus:
                context_parts.append(f"Tomorrow's Focus: {tomorrow_focus}")

        # AC #15: Include custom question responses for pattern detection
        if custom_responses:
            context_parts.append("\nCustom Tracking:")
            for question_id, response_data in custom_responses.items():
                question_text = response_data.get("question_text", "Unknown")
                response = response_data.get("response", "N/A")
                context_parts.append(f"  • {question_text}: {response}")

        prompt = "\n".join(context_parts)

        # Generate AI feedback using 'recap' module (Story 4.3 workflow)
        logger.info(f"🤖 Generating AI feedback for journal {journal_id}")
        response = ai_service.generate(
            user_id=user_id,
            user_role="user",  # TODO: Get from user_profiles
            user_tier="free",  # TODO: Get from user_profiles
            module="recap",
            prompt=prompt,
        )

        logger.info(
            f"✅ AI feedback generated for journal {journal_id}: {response.content[:100]}..."
        )

    except Exception as e:
        # Don't fail the request if AI generation fails
        logger.error(f"❌ AI feedback generation failed for journal {journal_id}: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")


@router.post("", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
async def create_journal_entry(
    entry: JournalEntryCreate,
    user: dict = Depends(get_current_user),
    ai_service: Optional[AIService] = Depends(get_ai_service),
):
    """
    Create new journal entry for today

    AC #7: Write to journal_entries table
    - Store default_responses as JSONB
    - Store custom_responses as JSONB
    - Enforce UNIQUE(user_id, local_date) constraint
    """
    user_id = user["sub"]  # Extract user ID from JWT payload
    supabase = get_supabase_client()

    if not supabase:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection not configured. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in .env",
        )

    # Get user's profile ID (convert auth_user_id → user_profiles.id)
    profile_id = await get_or_create_user_profile(supabase, user_id)

    # Prepare journal entry data
    journal_data = {
        "user_id": profile_id,
        "local_date": entry.local_date,
        "fulfillment_score": entry.fulfillment_score,
        "default_responses": entry.default_responses.dict() if entry.default_responses else None,
        "custom_responses": entry.custom_responses,
    }

    # Insert journal entry
    try:
        logger.info(
            f"📝 Attempting to insert journal entry: user_id={profile_id}, local_date={entry.local_date}"
        )
        logger.debug(f"Journal data: {journal_data}")

        response = supabase.table("journal_entries").insert(journal_data).execute()

        logger.info(f"✅ Supabase insert response received: {response}")
    except Exception as e:
        logger.error(f"❌ EXCEPTION during journal insert: {type(e).__name__}: {str(e)}")
        logger.error(f"Full traceback:\n{traceback.format_exc()}")

        # Handle duplicate entry error (409)
        if "duplicate key value violates unique constraint" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Journal entry already exists for this date. Use PATCH to update.",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create journal entry: {str(e)}",
        )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create journal entry",
        )

    created_journal = response.data[0]

    # Update daily_aggregates.has_journal = true and recalculate active_day_with_proof
    try:
        # Fetch current daily_aggregates
        current_agg_response = (
            supabase.table("daily_aggregates")
            .select("completed_count, has_proof")
            .eq("user_id", profile_id)
            .eq("local_date", entry.local_date)
            .single()
            .execute()
        )

        # Get current values
        current_completed = current_agg_response.data.get("completed_count", 0) if current_agg_response.data else 0
        current_has_proof = current_agg_response.data.get("has_proof", False) if current_agg_response.data else False

        # North star metric: active_day_with_proof = (≥1 completion + has_proof) OR has_journal
        # A day counts as "active" if EITHER:
        # 1. User completed at least one bind AND provided proof (capture or journal), OR
        # 2. User submitted a journal entry (even without bind completions)
        has_bind_with_proof = current_completed >= 1 and current_has_proof
        has_journal = True  # We're creating a journal entry
        active_day_with_proof = has_bind_with_proof or has_journal

        supabase.table("daily_aggregates").upsert({
            "user_id": profile_id,
            "local_date": entry.local_date,
            "has_journal": True,
            "active_day_with_proof": active_day_with_proof,
        }, on_conflict="user_id,local_date").execute()

        logger.info(f"✅ Updated daily_aggregates: has_journal=True, active_day_with_proof={active_day_with_proof}")
    except Exception as e:
        # Log error but don't fail the request
        logger.error(f"❌ Failed to update daily_aggregates: {str(e)}")

    # Calculate level and progress (same system as bind completion)
    # Simple level system: 10 journal entries per level
    try:
        total_journals_response = (
            supabase.table("journal_entries")
            .select("id", count="exact")
            .eq("user_id", profile_id)
            .execute()
        )

        total_journals = total_journals_response.count or 0
        level = (total_journals // 10) + 1  # Level 1 starts at 0-9 journals
        journals_in_level = total_journals % 10
        level_progress = (journals_in_level / 10) * 100  # Percentage to next level

        logger.info(f"[JOURNAL_API] Level calculation: total={total_journals}, level={level}, progress={level_progress}")
    except Exception as level_error:
        logger.error(f"❌ Error calculating level: {str(level_error)}")
        # Default to level 1 if calculation fails
        level = 1
        level_progress = 0.0

    # AC #15, Subtask 2.8: Trigger AI batch job asynchronously (Story 4.1/4.3)
    asyncio.create_task(
        trigger_ai_feedback_generation(
            ai_service=ai_service,
            user_id=profile_id,
            journal_id=created_journal["id"],
            journal_data=created_journal,
        )
    )

    # Return with level data for celebration modal
    return {
        "data": JournalEntryResponse(**created_journal),
        "meta": {
            "timestamp": datetime.utcnow().isoformat(),
            "level": level,
            "level_progress": round(level_progress, 1),
        }
    }


@router.get("", response_model=dict)
async def get_journal_entries(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user: dict = Depends(get_current_user),
):
    """
    Retrieve journal entries for authenticated user

    Query Parameters:
    - start_date: Filter entries >= this date (YYYY-MM-DD format)
    - end_date: Filter entries <= this date (YYYY-MM-DD format)

    Returns:
    - List of journal entries in {data: [...], meta: {...}} format
    """
    user_id = user["sub"]  # Extract user ID from JWT payload
    supabase = get_supabase_client()

    # Get user's profile ID
    profile_id = await get_or_create_user_profile(supabase, user_id)

    # Build query
    query = supabase.table("journal_entries").select("*").eq("user_id", profile_id)

    # Apply date filters if provided
    if start_date:
        query = query.gte("local_date", start_date)
    if end_date:
        query = query.lte("local_date", end_date)

    # Order by date descending
    query = query.order("local_date", desc=True)

    # Execute query
    response = query.execute()

    # Return in standard format
    return {
        "data": [JournalEntryResponse(**journal).dict() for journal in response.data],
        "meta": {
            "timestamp": datetime.utcnow().isoformat(),
            "count": len(response.data),
        }
    }


@router.get("/today", response_model=ApiResponse)
async def get_today_journal_entry(
    user: dict = Depends(get_current_user),
):
    """
    Retrieve today's journal entry for authenticated user

    AC #17: Support edit mode by fetching existing journal
    - Returns 404 if no entry exists for today
    - Returns full journal data if exists
    """
    user_id = user["sub"]  # Extract user ID from JWT payload
    supabase = get_supabase_client()

    # Get user's profile ID
    profile_id = await get_or_create_user_profile(supabase, user_id)

    # Calculate today's local_date (use user's timezone)
    # For now, use server's date - TODO: Use user's timezone from profile
    today_date = date.today().isoformat()

    # Query journal entry for today
    logger.info(f"[GET /today] 🔍 Querying with user_id={profile_id}, local_date={today_date}")
    response = (
        supabase.table("journal_entries")
        .select("*")
        .eq("user_id", profile_id)
        .eq("local_date", today_date)
        .execute()
    )
    logger.info(f"[GET /today] 📊 Query result: found {len(response.data) if response.data else 0} entries")

    if not response.data or len(response.data) == 0:
        logger.info("[GET /today] ❌ No journal found - returning 404")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No journal entry found for today"
        )

    journal = response.data[0]
    logger.info(f"[GET /today] ✅ Journal found: id={journal.get('id')}")

    return ApiResponse(data=JournalEntryResponse(**journal))


class JournalEntriesListResponse(BaseModel):
    """List of journal entries response"""
    data: list
    meta: dict


@router.get("", response_model=JournalEntriesListResponse)
async def get_journal_entries(
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    user: dict = Depends(get_current_user),
):
    """
    Retrieve journal entries for authenticated user within a date range

    Query Parameters:
    - start_date: Optional start date (YYYY-MM-DD)
    - end_date: Optional end date (YYYY-MM-DD)

    Returns:
    - List of journal entries ordered by date (most recent first)
    - If no date range specified, returns all entries
    """
    user_id = user["sub"]  # Extract user ID from JWT payload
    supabase = get_supabase_client()

    if not supabase:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection not configured"
        )

    # Get user's profile ID
    profile_id = await get_or_create_user_profile(supabase, user_id)

    # Build query
    query = supabase.table("journal_entries").select("*").eq("user_id", profile_id)

    if start_date:
        query = query.gte("local_date", start_date)
    if end_date:
        query = query.lte("local_date", end_date)

    # Order by date (most recent first)
    query = query.order("local_date", desc=False)

    # Execute query
    try:
        response = query.execute()
        logger.info(f"[GET /journal-entries] 📊 Found {len(response.data)} entries for user {profile_id}")

        return {
            "data": response.data,
            "meta": {
                "timestamp": datetime.utcnow().isoformat(),
                "total": len(response.data),
                "start_date": start_date,
                "end_date": end_date,
            }
        }
    except Exception as e:
        logger.error(f"❌ Error fetching journal entries: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch journal entries: {str(e)}"
        )


@router.patch("/{journal_id}", response_model=ApiResponse)
async def update_journal_entry(
    journal_id: str,
    update: JournalEntryUpdate,
    user: dict = Depends(get_current_user),
    ai_service: Optional[AIService] = Depends(get_ai_service),
):
    """
    Update existing journal entry (partial update)

    AC #17: Edit existing journal entry
    - Update only provided fields
    - Auto-update updated_at timestamp
    - Verify user owns the journal entry (authorization)
    """
    user_id = user["sub"]  # Extract user ID from JWT payload
    supabase = get_supabase_client()

    # Get user's profile ID
    profile_id = await get_or_create_user_profile(supabase, user_id)

    # Verify journal entry exists and belongs to user
    journal_response = (
        supabase.table("journal_entries")
        .select("*")
        .eq("id", journal_id)
        .eq("user_id", profile_id)
        .execute()
    )

    if not journal_response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Journal entry not found or access denied"
        )

    # Prepare update data (only include provided fields)
    update_data = {}
    if update.fulfillment_score is not None:
        update_data["fulfillment_score"] = update.fulfillment_score
    if update.default_responses is not None:
        update_data["default_responses"] = update.default_responses.dict()
    if update.custom_responses is not None:
        update_data["custom_responses"] = update.custom_responses

    # Always update updated_at
    update_data["updated_at"] = datetime.utcnow().isoformat()

    # Update journal entry
    try:
        response = (
            supabase.table("journal_entries").update(update_data).eq("id", journal_id).execute()
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update journal entry: {str(e)}",
        )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update journal entry",
        )

    updated_journal = response.data[0]

    # Update daily_aggregates.has_journal = true and recalculate active_day_with_proof (idempotent)
    try:
 # Fetch current daily_aggregates
          current_agg_response = (
              supabase.table("daily_aggregates")
              .select("completed_count, has_proof")
              .eq("user_id", profile_id)
              .eq("local_date", updated_journal["local_date"])
              .single()
              .execute()
          )

          # Get current values
          current_completed = current_agg_response.data.get("completed_count", 0) if current_agg_response.data else 0
          current_has_proof = current_agg_response.data.get("has_proof", False) if current_agg_response.data else False

          # North star metric: active_day_with_proof = (≥1 completion + has_proof) OR has_journal
          # A day counts as "active" if EITHER:
          # 1. User completed at least one bind AND provided proof (capture or journal), OR
          # 2. User submitted a journal entry (even without bind completions)
          has_bind_with_proof = current_completed >= 1 and current_has_proof
          has_journal = True  # We're updating a journal entry
          active_day_with_proof = has_bind_with_proof or has_journal

          supabase.table("daily_aggregates").upsert(
              {
                  "user_id": profile_id,
                  "local_date": updated_journal["local_date"],
                  "has_journal": True,
                  "active_day_with_proof": active_day_with_proof,
              },
              on_conflict="user_id,local_date",
          ).execute()

          logger.info(f"✅ Updated daily_aggregates: has_journal=True, active_day_with_proof={active_day_with_proof}")
    except Exception as e:
        logger.error(f"❌ Failed to update daily_aggregates: {str(e)}")

    # Calculate level and progress (same system as bind completion)
    try:
        total_journals_response = (
            supabase.table("journal_entries")
            .select("id", count="exact")
            .eq("user_id", profile_id)
            .execute()
        )

        total_journals = total_journals_response.count or 0
        level = (total_journals // 10) + 1
        journals_in_level = total_journals % 10
        level_progress = (journals_in_level / 10) * 100

        logger.info(f"[JOURNAL_API] Level calculation: total={total_journals}, level={level}, progress={level_progress}")
    except Exception as level_error:
        logger.error(f"❌ Error calculating level: {str(level_error)}")
        level = 1
        level_progress = 0.0

    # AC #15, Subtask 2.8: Trigger AI batch job asynchronously (Story 4.1/4.3)
    asyncio.create_task(
        trigger_ai_feedback_generation(
            ai_service=ai_service,
            user_id=profile_id,
            journal_id=journal_id,
            journal_data=updated_journal,
        )
    )

    # Return with level data for celebration modal
    return {
        "data": JournalEntryResponse(**updated_journal),
        "meta": {
            "timestamp": datetime.utcnow().isoformat(),
            "level": level,
            "level_progress": round(level_progress, 1),
        }
    }

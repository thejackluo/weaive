"""
Story 4.1a: Journal Entry API Endpoints

FastAPI router for journal entry operations:
- POST /api/journal-entries: Create new journal entry
- GET /api/journal-entries/today: Retrieve today's journal entry
- PATCH /api/journal-entries/{journal_id}: Update existing journal entry
"""

import asyncio
import logging
import traceback
from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.deps import get_ai_service, get_current_user, get_supabase_client
from app.services.ai.ai_service import AIService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/journal-entries", tags=["journal"])


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
    ai_service: Optional[AIService],
    user_id: str,
    journal_id: str,
    journal_data: dict
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
        logger.warning(f"⚠️  AI service not available - skipping feedback generation for journal {journal_id}")
        return

    try:
        # Extract data for AI prompt
        fulfillment_score = journal_data.get('fulfillment_score', 5)
        default_responses = journal_data.get('default_responses', {})
        custom_responses = journal_data.get('custom_responses', {})

        # Build context for AI (Story 4.1, AC #15: Pass custom responses to AI)
        context_parts = [
            f"Fulfillment Score: {fulfillment_score}/10",
        ]

        if default_responses:
            today_reflection = default_responses.get('today_reflection', '')
            tomorrow_focus = default_responses.get('tomorrow_focus', '')
            if today_reflection:
                context_parts.append(f"Today's Reflection: {today_reflection}")
            if tomorrow_focus:
                context_parts.append(f"Tomorrow's Focus: {tomorrow_focus}")

        # AC #15: Include custom question responses for pattern detection
        if custom_responses:
            context_parts.append("\nCustom Tracking:")
            for question_id, response_data in custom_responses.items():
                question_text = response_data.get('question_text', 'Unknown')
                response = response_data.get('response', 'N/A')
                context_parts.append(f"  • {question_text}: {response}")

        prompt = "\n".join(context_parts)

        # Generate AI feedback using 'recap' module (Story 4.3 workflow)
        logger.info(f"🤖 Generating AI feedback for journal {journal_id}")
        response = ai_service.generate(
            user_id=user_id,
            user_role='user',  # TODO: Get from user_profiles
            user_tier='free',  # TODO: Get from user_profiles
            module='recap',
            prompt=prompt
        )

        logger.info(f"✅ AI feedback generated for journal {journal_id}: {response.text[:100]}...")

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
            detail="Database connection not configured. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in .env"
        )

    # Get user's profile ID (convert auth_user_id → user_profiles.id)
    profile_response = supabase.table("user_profiles").select("id").eq("auth_user_id", user_id).single().execute()

    if not profile_response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )

    profile_id = profile_response.data["id"]

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
        logger.info(f"📝 Attempting to insert journal entry: user_id={profile_id}, local_date={entry.local_date}")
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
                detail="Journal entry already exists for this date. Use PATCH to update."
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create journal entry: {str(e)}"
        )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create journal entry"
        )

    created_journal = response.data[0]

    # Update daily_aggregates.has_journal = true
    try:
        supabase.table("daily_aggregates").upsert({
            "user_id": profile_id,
            "local_date": entry.local_date,
            "has_journal": True,
        }, on_conflict="user_id,local_date").execute()
    except Exception as e:
        # Log error but don't fail the request
        print(f"Failed to update daily_aggregates: {str(e)}")

    # AC #15, Subtask 2.8: Trigger AI batch job asynchronously (Story 4.1/4.3)
    asyncio.create_task(
        trigger_ai_feedback_generation(
            ai_service=ai_service,
            user_id=profile_id,
            journal_id=created_journal["id"],
            journal_data=created_journal
        )
    )

    return ApiResponse(data=JournalEntryResponse(**created_journal))


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
    profile_response = supabase.table("user_profiles").select("id").eq("auth_user_id", user_id).single().execute()

    if not profile_response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )

    profile_id = profile_response.data["id"]

    # Calculate today's local_date (use user's timezone)
    # For now, use server's date - TODO: Use user's timezone from profile
    today_date = date.today().isoformat()

    # Query journal entry for today
    response = supabase.table("journal_entries").select("*").eq("user_id", profile_id).eq("local_date", today_date).execute()

    if not response.data or len(response.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No journal entry found for today"
        )

    journal = response.data[0]

    return ApiResponse(data=JournalEntryResponse(**journal))


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
    profile_response = supabase.table("user_profiles").select("id").eq("auth_user_id", user_id).single().execute()

    if not profile_response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )

    profile_id = profile_response.data["id"]

    # Verify journal entry exists and belongs to user
    journal_response = supabase.table("journal_entries").select("*").eq("id", journal_id).eq("user_id", profile_id).execute()

    if not journal_response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal entry not found or access denied"
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
        response = supabase.table("journal_entries").update(update_data).eq("id", journal_id).execute()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update journal entry: {str(e)}"
        )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update journal entry"
        )

    updated_journal = response.data[0]

    # Update daily_aggregates.has_journal = true (idempotent)
    try:
        supabase.table("daily_aggregates").upsert({
            "user_id": profile_id,
            "local_date": updated_journal["local_date"],
            "has_journal": True,
        }, on_conflict="user_id,local_date").execute()
    except Exception as e:
        print(f"Failed to update daily_aggregates: {str(e)}")

    # AC #15, Subtask 2.8: Trigger AI batch job asynchronously (Story 4.1/4.3)
    asyncio.create_task(
        trigger_ai_feedback_generation(
            ai_service=ai_service,
            user_id=profile_id,
            journal_id=journal_id,
            journal_data=updated_journal
        )
    )

    return ApiResponse(data=JournalEntryResponse(**updated_journal))

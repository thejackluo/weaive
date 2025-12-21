"""
Story 4.1a: Journal Entry API Endpoints

FastAPI router for journal entry operations:
- POST /api/journal-entries: Create new journal entry
- GET /api/journal-entries/today: Retrieve today's journal entry
- PATCH /api/journal-entries/{journal_id}: Update existing journal entry
"""

import logging
import traceback

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from uuid import UUID

from app.core.deps import get_current_user, get_supabase_client

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


@router.post("", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
async def create_journal_entry(
    entry: JournalEntryCreate,
    user: dict = Depends(get_current_user),
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

    # TODO: Trigger AI batch job (Story 4.3)
    # await trigger_ai_feedback_generation(profile_id, created_journal["id"])

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

    # TODO: Trigger AI batch job (Story 4.3)
    # await trigger_ai_feedback_generation(profile_id, journal_id)

    return ApiResponse(data=JournalEntryResponse(**updated_journal))

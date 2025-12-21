"""Journal entries API endpoints (Story 1.9: First Daily Reflection)"""

import logging
from datetime import date
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.core.deps import get_current_user, get_supabase_client
from app.models.journal import JournalEntryCreate, JournalEntryResponse
from app.services import journal

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/journal-entries", tags=["journal"])


@router.post("", response_model=JournalEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_journal_entry(
    journal_entry: JournalEntryCreate,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Create a daily journal entry (Story 1.9).

    This endpoint creates a new journal entry for the authenticated user.
    Only one journal entry per day is allowed (UNIQUE constraint on user_id + local_date).

    **Authentication Required:**
    - Include JWT token in Authorization header: `Bearer <token>`

    **Request Body:**
    - local_date: User's local date (YYYY-MM-DD)
    - fulfillment_score: Daily fulfillment rating (1-10, required)
    - entry_text: Optional reflection text (50-500 chars if provided, null if empty)
    - is_onboarding: True if this is the Day 0 onboarding reflection

    **Returns:**
    - Created journal entry with id, timestamps, etc.

    **Status Codes:**
    - 201: Journal entry created successfully
    - 400: Validation error or duplicate date
    - 401: Unauthorized (missing/invalid token)
    - 500: Server error

    **Example Request:**
    ```json
    {
      "local_date": "2025-12-21",
      "fulfillment_score": 7,
      "entry_text": "Feeling good about starting this journey. Excited to build better habits.",
      "is_onboarding": true
    }
    ```

    **Example Response:**
    ```json
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "660e8400-e29b-41d4-a716-446655440111",
      "local_date": "2025-12-21",
      "fulfillment_score": 7,
      "entry_text": "Feeling good about starting this journey. Excited to build better habits.",
      "is_onboarding": true,
      "created_at": "2025-12-21T18:30:00Z",
      "updated_at": "2025-12-21T18:30:00Z"
    }
    ```
    """
    try:
        # Extract user_id from JWT token
        auth_user_id = user.get("sub")
        if not auth_user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User ID not found in token",
            )

        # Get user profile to get the internal user_id
        # TODO (Performance): Cache user_id mapping in middleware or dependency injection
        # Current: N+1 query pattern - every request queries user_profiles then journal_entries
        # Proposed: Create `get_user_id_from_token()` dependency that caches lookup
        # Impact: Reduces DB queries by 50% on all authenticated endpoints
        # Tracked in: CODE_REVIEW_ISSUE_#6_#7 (Story 1.9)
        user_profile_result = (
            supabase.table("user_profiles")
            .select("id")
            .eq("auth_user_id", auth_user_id)
            .execute()
        )

        if not user_profile_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found. Please create a profile first.",
            )

        user_id = UUID(user_profile_result.data[0]["id"])

        # Create journal entry
        journal_entry_data = await journal.create_journal_entry(
            supabase=supabase,
            user_id=user_id,
            local_date=journal_entry.local_date,
            fulfillment_score=journal_entry.fulfillment_score,
            entry_text=journal_entry.entry_text,
            is_onboarding=journal_entry.is_onboarding,
        )

        return JournalEntryResponse(**journal_entry_data)

    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)

        # Check for duplicate date error
        if "already exists" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg,
            )

        logger.error(f"❌ Failed to create journal entry: {error_msg}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create journal entry",
        )


@router.get("/{local_date}", response_model=JournalEntryResponse)
async def get_journal_entry_by_date(
    local_date: date,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Get a journal entry for a specific date.

    **Authentication Required:**
    - Include JWT token in Authorization header: `Bearer <token>`

    **Path Parameters:**
    - local_date: Date in YYYY-MM-DD format

    **Returns:**
    - Journal entry for the specified date

    **Status Codes:**
    - 200: Journal entry found
    - 401: Unauthorized
    - 404: Journal entry not found for this date
    """
    try:
        # Extract user_id from JWT token
        auth_user_id = user.get("sub")
        if not auth_user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User ID not found in token",
            )

        # Get user profile ID
        user_profile_result = (
            supabase.table("user_profiles")
            .select("id")
            .eq("auth_user_id", auth_user_id)
            .execute()
        )

        if not user_profile_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )

        user_id = UUID(user_profile_result.data[0]["id"])

        # Get journal entry
        journal_entry_data = await journal.get_journal_entry(
            supabase=supabase,
            user_id=user_id,
            local_date=local_date,
        )

        if not journal_entry_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No journal entry found for date {local_date}",
            )

        return JournalEntryResponse(**journal_entry_data)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to get journal entry: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get journal entry",
        )


@router.get("", response_model=list[JournalEntryResponse])
async def list_journal_entries(
    limit: int = 30,
    offset: int = 0,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    List journal entries for the authenticated user (most recent first).

    **Authentication Required:**
    - Include JWT token in Authorization header: `Bearer <token>`

    **Query Parameters:**
    - limit: Maximum number of entries to return (default: 30, max: 100)
    - offset: Number of entries to skip (for pagination, default: 0)

    **Returns:**
    - List of journal entries ordered by date (most recent first)

    **Status Codes:**
    - 200: Success (may return empty list if no entries)
    - 401: Unauthorized
    - 500: Server error
    """
    try:
        # Enforce max limit
        if limit > 100:
            limit = 100

        # Extract user_id from JWT token
        auth_user_id = user.get("sub")
        if not auth_user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User ID not found in token",
            )

        # Get user profile ID
        user_profile_result = (
            supabase.table("user_profiles")
            .select("id")
            .eq("auth_user_id", auth_user_id)
            .execute()
        )

        if not user_profile_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )

        user_id = UUID(user_profile_result.data[0]["id"])

        # List journal entries
        journal_entries = await journal.list_journal_entries(
            supabase=supabase,
            user_id=user_id,
            limit=limit,
            offset=offset,
        )

        return [JournalEntryResponse(**entry) for entry in journal_entries]

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to list journal entries: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list journal entries",
        )

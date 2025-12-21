"""Journal entry service for managing daily reflections (Story 1.9)"""

import logging
from datetime import date
from typing import Optional
from uuid import UUID

from supabase import Client

logger = logging.getLogger(__name__)


async def create_journal_entry(
    supabase: Client,
    user_id: UUID,
    local_date: date,
    fulfillment_score: int,
    entry_text: Optional[str] = None,
    is_onboarding: bool = False,
) -> dict:
    """
    Create a daily journal entry (Story 1.9).

    This function creates a journal_entries record for the user's daily reflection.
    The database enforces UNIQUE(user_id, local_date) - only one journal per day.

    If a journal already exists for this date, we'll handle it by returning an error
    (use UPDATE endpoint for editing existing journals, not INSERT).

    Args:
        supabase: Supabase client instance
        user_id: User profile UUID
        local_date: User's local date for this journal entry (YYYY-MM-DD)
        fulfillment_score: Daily fulfillment rating (1-10)
        entry_text: Optional reflection text (None if user skipped text input)
        is_onboarding: True if this is the Day 0 onboarding reflection

    Returns:
        dict: Created journal entry record

    Raises:
        Exception: If journal creation fails (including duplicate date errors)
    """
    try:
        # Prepare journal entry data
        journal_data = {
            "user_id": str(user_id),
            "local_date": local_date.isoformat(),  # Convert date to ISO string (YYYY-MM-DD)
            "fulfillment_score": fulfillment_score,
            "entry_text": entry_text,  # Can be None (optional)
            "is_onboarding": is_onboarding,
        }

        # Insert journal entry
        result = (
            supabase.table("journal_entries")
            .insert(journal_data)
            .execute()
        )

        if not result.data:
            raise Exception("Failed to create journal entry - no data returned")

        journal = result.data[0]
        logger.info(
            f"✅ Journal entry created: user_id={user_id}, date={local_date}, "
            f"fulfillment={fulfillment_score}, has_text={entry_text is not None}"
        )

        return journal

    except Exception as e:
        error_msg = str(e).lower()

        # Check if error is due to unique constraint violation (duplicate date)
        # This means user already has a journal for this date
        if "duplicate key" in error_msg or "unique constraint" in error_msg:
            logger.warning(
                f"⚠️  Journal already exists for user {user_id} on date {local_date}"
            )
            raise Exception(
                f"Journal entry already exists for {local_date}. "
                "Use PUT /journal-entries/{id} to update existing entries."
            )

        # For other errors, log and re-raise
        logger.error(
            f"❌ Failed to create journal entry for user {user_id} on {local_date}: {str(e)}"
        )
        raise


async def get_journal_entry(
    supabase: Client,
    user_id: UUID,
    local_date: date,
) -> Optional[dict]:
    """
    Get a journal entry for a specific date.

    Args:
        supabase: Supabase client instance
        user_id: User profile UUID
        local_date: User's local date (YYYY-MM-DD)

    Returns:
        dict: Journal entry record if found, None otherwise
    """
    try:
        result = (
            supabase.table("journal_entries")
            .select("*")
            .eq("user_id", str(user_id))
            .eq("local_date", local_date.isoformat())
            .execute()
        )

        if result.data:
            return result.data[0]

        return None

    except Exception as e:
        logger.error(
            f"❌ Failed to get journal entry for user {user_id} on {local_date}: {str(e)}"
        )
        raise


async def list_journal_entries(
    supabase: Client,
    user_id: UUID,
    limit: int = 30,
    offset: int = 0,
) -> list[dict]:
    """
    List journal entries for a user (most recent first).

    Args:
        supabase: Supabase client instance
        user_id: User profile UUID
        limit: Maximum number of entries to return (default: 30)
        offset: Number of entries to skip (for pagination)

    Returns:
        list[dict]: List of journal entry records
    """
    try:
        result = (
            supabase.table("journal_entries")
            .select("*")
            .eq("user_id", str(user_id))
            .order("local_date", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )

        return result.data or []

    except Exception as e:
        logger.error(
            f"❌ Failed to list journal entries for user {user_id}: {str(e)}"
        )
        raise

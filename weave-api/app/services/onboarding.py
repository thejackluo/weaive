"""Onboarding service for storing user onboarding data (Stories 1.2, 1.3)"""

import logging
from typing import List, Optional
from uuid import UUID

from supabase import Client

logger = logging.getLogger(__name__)


async def store_painpoint_selection(
    supabase: Client,
    painpoints: List[str],
    user_id: Optional[UUID] = None,
    session_id: Optional[str] = None,
) -> dict:
    """
    Store selected painpoints for a user.

    For pre-auth users, stores in a temporary onboarding_sessions table.
    For authenticated users, updates user_profiles.json field.

    Args:
        supabase: Supabase client instance
        painpoints: List of painpoint IDs (1-2 items)
        user_id: Optional user ID (None for pre-auth)
        session_id: Optional session identifier

    Returns:
        dict: Confirmation with painpoints and user_id

    Raises:
        Exception: If database operation fails
    """
    try:
        # Validate painpoints
        valid_painpoints = {"clarity", "action", "consistency", "alignment"}
        for p in painpoints:
            if p not in valid_painpoints:
                raise ValueError(f"Invalid painpoint: {p}")

        if len(painpoints) < 1 or len(painpoints) > 2:
            raise ValueError("Must select 1-2 painpoints")

        # For now, store in analytics_events as a temporary solution
        # TODO: Create onboarding_sessions table for pre-auth data
        # TODO: Update user_profiles.json field for authenticated users
        event_record = {
            "event_name": "painpoint_selected",
            "event_data": {
                "painpoints": painpoints,
                "selection_count": len(painpoints),
            },
            "user_id": str(user_id) if user_id else None,
            "session_id": session_id,
        }

        result = (
            supabase.table("analytics_events")
            .insert(event_record)
            .execute()
        )

        if not result.data:
            raise Exception("Failed to store painpoint selection")

        logger.info(
            f"✅ Painpoint selection stored: {painpoints} "
            f"(user_id: {user_id or 'anonymous'}, session: {session_id or 'none'})"
        )

        return {
            "success": True,
            "painpoints": painpoints,
            "user_id": user_id,
        }

    except Exception as e:
        logger.error(
            f"❌ Failed to store painpoint selection: {str(e)}"
        )
        raise

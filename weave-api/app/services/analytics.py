"""Analytics service for tracking user events (Story 1.1)"""

import logging
from datetime import datetime
from typing import Optional
from uuid import UUID

from supabase import Client

logger = logging.getLogger(__name__)


async def track_event(
    supabase: Client,
    event_name: str,
    event_data: dict,
    user_id: Optional[UUID] = None,
    session_id: Optional[str] = None,
    timestamp: Optional[datetime] = None,
) -> dict:
    """
    Track an analytics event in the database.

    Args:
        supabase: Supabase client instance
        event_name: Event identifier (e.g., 'onboarding_started')
        event_data: Event metadata dictionary
        user_id: Optional user ID (None for pre-auth events)
        session_id: Optional session identifier
        timestamp: Optional event timestamp (defaults to server time)

    Returns:
        dict: Created event record with id, event_name, user_id, timestamp

    Raises:
        Exception: If database insert fails
    """
    try:
        # Prepare event record
        event_record = {
            "event_name": event_name,
            "event_data": event_data,
            "user_id": str(user_id) if user_id else None,
            "session_id": session_id,
            "timestamp": timestamp.isoformat() if timestamp else None,
        }

        # Insert into database
        result = (
            supabase.table("analytics_events")
            .insert(event_record)
            .execute()
        )

        if not result.data:
            raise Exception("Failed to insert analytics event - no data returned")

        event = result.data[0]
        logger.info(
            f"✅ Analytics event tracked: {event_name} "
            f"(user_id: {user_id or 'anonymous'})"
        )

        return event

    except Exception as e:
        logger.error(
            f"❌ Failed to track analytics event '{event_name}': {str(e)}"
        )
        raise

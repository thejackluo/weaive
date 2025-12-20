"""Onboarding service for storing user onboarding data (Stories 1.2, 1.3, 1.6)"""

import logging
from datetime import datetime, timezone
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


async def store_identity_bootup(
    supabase: Client,
    auth_user_id: str,
    preferred_name: str,
    core_personality: str,
    identity_traits: List[str],
) -> dict:
    """
    Store identity bootup data for authenticated user (Story 1.6).

    Updates user_profiles table with:
    - preferred_name: User's chosen name/nickname
    - core_personality: Selected Weave personality type
    - personality_selected_at: Timestamp of selection
    - identity_traits: Array of 3-5 selected traits

    Args:
        supabase: Supabase client instance
        auth_user_id: Supabase auth user ID (from JWT)
        preferred_name: User's preferred name (1-50 chars)
        core_personality: Either "supportive_direct" or "tough_warm"
        identity_traits: List of 3-5 selected traits

    Returns:
        dict: Updated user profile data with confirmation

    Raises:
        ValueError: If user profile not found or validation fails
        Exception: If database operation fails
    """
    try:
        # Get current timestamp
        now = datetime.now(timezone.utc)

        # DEBUG: Log the auth_user_id being used
        logger.info(f"🔍 Looking up user_profile for auth_user_id: {auth_user_id}")

        # First check if user profile exists
        check_result = (
            supabase.table("user_profiles")
            .select("id, auth_user_id")
            .eq("auth_user_id", auth_user_id)
            .execute()
        )

        logger.info(f"🔍 User profile query result: {check_result.data}")

        if not check_result.data or len(check_result.data) == 0:
            logger.error(f"❌ No user_profile found for auth_user_id: {auth_user_id}")
            raise ValueError(
                f"User profile not found for auth_user_id: {auth_user_id}"
            )

        # Prepare update data
        update_data = {
            "preferred_name": preferred_name,
            "core_personality": core_personality,
            "personality_selected_at": now.isoformat(),
            "identity_traits": identity_traits,
            "updated_at": now.isoformat(),
        }

        # Update user_profiles table
        result = (
            supabase.table("user_profiles")
            .update(update_data)
            .eq("auth_user_id", auth_user_id)
            .execute()
        )

        # Double-check update succeeded
        if not result.data or len(result.data) == 0:
            raise ValueError(
                f"User profile update failed for auth_user_id: {auth_user_id}"
            )

        profile = result.data[0]

        logger.info(
            f"✅ Identity bootup data stored for user {auth_user_id}: "
            f"name='{preferred_name}', personality='{core_personality}', "
            f"traits={identity_traits}"
        )

        return {
            "success": True,
            "user_id": profile["id"],
            "preferred_name": profile["preferred_name"],
            "core_personality": profile["core_personality"],
            "identity_traits": profile["identity_traits"],
            "personality_selected_at": profile["personality_selected_at"],
        }

    except ValueError:
        # Re-raise validation errors
        raise
    except Exception as e:
        logger.error(
            f"❌ Failed to store identity bootup data: {str(e)}"
        )
        raise

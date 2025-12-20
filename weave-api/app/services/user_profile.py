"""User profile service for managing user profiles (Story 1.5)"""

import logging
from typing import Optional
from uuid import UUID

from supabase import Client

logger = logging.getLogger(__name__)


async def create_user_profile(
    supabase: Client,
    auth_user_id: str,
    display_name: Optional[str] = None,
    timezone: str = "UTC",
    locale: str = "en-US",
) -> dict:
    """
    Create a user profile after successful authentication (Story 1.5).

    This function creates a row in the user_profiles table linked to the
    authenticated user from Supabase Auth.

    Race condition handling: If two concurrent requests try to create the same
    profile, one will succeed and the other will get a unique constraint error.
    We catch this error and return the existing profile.

    Args:
        supabase: Supabase client instance
        auth_user_id: Supabase auth user ID (from JWT 'sub' field)
        display_name: Optional display name
        timezone: IANA timezone (default: UTC)
        locale: User locale (default: en-US)

    Returns:
        dict: Created or existing user profile record

    Raises:
        Exception: If profile creation fails (non-duplicate errors)
    """
    try:
        # Try to insert directly (optimistic approach)
        # If profile already exists, we'll catch the unique constraint error
        profile_data = {
            "auth_user_id": auth_user_id,
            "display_name": display_name,
            "timezone": timezone,
            "locale": locale,
        }

        result = (
            supabase.table("user_profiles")
            .insert(profile_data)
            .execute()
        )

        if not result.data:
            raise Exception("Failed to create user profile - no data returned")

        profile = result.data[0]
        logger.info(f"✅ User profile created: {auth_user_id} (id: {profile['id']})")

        return profile

    except Exception as e:
        error_msg = str(e).lower()

        # Check if error is due to unique constraint violation (duplicate auth_user_id)
        # Supabase/PostgREST returns "duplicate key value violates unique constraint"
        if "duplicate key" in error_msg or "unique constraint" in error_msg:
            logger.info(
                f"⚠️  Profile already exists (race condition handled): {auth_user_id}"
            )

            # Fetch and return the existing profile
            existing = (
                supabase.table("user_profiles")
                .select("*")
                .eq("auth_user_id", auth_user_id)
                .execute()
            )

            if existing.data:
                return existing.data[0]

            # If we still can't find it, something is wrong
            logger.error(
                f"❌ Profile should exist but not found: {auth_user_id}"
            )
            raise Exception(
                "Race condition: profile creation failed but profile not found"
            )

        # For non-duplicate errors, re-raise
        logger.error(
            f"❌ Failed to create user profile for {auth_user_id}: {str(e)}"
        )
        raise


async def get_user_profile(
    supabase: Client,
    auth_user_id: str,
) -> Optional[dict]:
    """
    Get user profile by auth_user_id.

    Args:
        supabase: Supabase client instance
        auth_user_id: Supabase auth user ID

    Returns:
        dict | None: User profile or None if not found
    """
    try:
        result = (
            supabase.table("user_profiles")
            .select("*")
            .eq("auth_user_id", auth_user_id)
            .execute()
        )

        if result.data:
            return result.data[0]
        return None

    except Exception as e:
        logger.error(f"❌ Failed to get user profile: {str(e)}")
        raise


async def update_user_profile(
    supabase: Client,
    user_id: UUID,
    **updates,
) -> dict:
    """
    Update user profile fields.

    Args:
        supabase: Supabase client instance
        user_id: User profile ID (UUID)
        **updates: Fields to update

    Returns:
        dict: Updated user profile

    Raises:
        Exception: If update fails
    """
    try:
        result = (
            supabase.table("user_profiles")
            .update(updates)
            .eq("id", str(user_id))
            .execute()
        )

        if not result.data:
            raise Exception("Failed to update user profile")

        logger.info(f"✅ User profile updated: {user_id}")
        return result.data[0]

    except Exception as e:
        logger.error(f"❌ Failed to update user profile {user_id}: {str(e)}")
        raise

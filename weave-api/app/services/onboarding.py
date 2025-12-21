"""Onboarding service for storing user onboarding data (Stories 1.2, 1.3, 1.6, 1.7)"""

import base64
import logging
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID, uuid4

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


async def create_origin_story(
    supabase: Client,
    auth_user_id: str,
    photo_base64: str,
    audio_base64: str,
    audio_duration_seconds: int,
    from_text: str,
    to_text: str,
) -> dict:
    """
    Create origin story for authenticated user (Story 1.7).

    Uploads photo and audio to Supabase Storage, creates origin_stories record,
    and updates user_profiles with first_bind_completed_at and user_level = 1.

    Args:
        supabase: Supabase client instance
        auth_user_id: Supabase auth user ID (from JWT)
        photo_base64: Base64-encoded photo with data URI prefix
        audio_base64: Base64-encoded audio with data URI prefix
        audio_duration_seconds: Duration of voice recording (1-60 seconds)
        from_text: Current struggle narrative
        to_text: Aspirational identity traits

    Returns:
        dict: Origin story data with URLs and confirmation

    Raises:
        ValueError: If user profile not found or validation fails
        Exception: If upload or database operation fails
    """
    try:
        now = datetime.now(timezone.utc)

        # Look up user profile
        logger.info(f"🔍 Looking up user_profile for auth_user_id: {auth_user_id}")
        profile_result = (
            supabase.table("user_profiles")
            .select("id, auth_user_id, first_bind_completed_at")
            .eq("auth_user_id", auth_user_id)
            .execute()
        )

        if not profile_result.data or len(profile_result.data) == 0:
            logger.error(f"❌ No user_profile found for auth_user_id: {auth_user_id}")
            raise ValueError(
                f"User profile not found for auth_user_id: {auth_user_id}"
            )

        profile = profile_result.data[0]
        user_id = profile["id"]

        # Check if origin story already exists (one per user)
        existing_check = (
            supabase.table("origin_stories")
            .select("id")
            .eq("user_id", user_id)
            .execute()
        )

        if existing_check.data and len(existing_check.data) > 0:
            logger.warning(f"⚠️  Origin story already exists for user {user_id}")
            raise ValueError(
                "Origin story already exists for this user. Only one origin story allowed."
            )

        # Decode base64 files
        logger.info("📦 Decoding base64 photo and audio")

        # Remove data URI prefix if present (e.g., "data:image/jpeg;base64,")
        if "," in photo_base64:
            photo_base64 = photo_base64.split(",", 1)[1]
        if "," in audio_base64:
            audio_base64 = audio_base64.split(",", 1)[1]

        photo_bytes = base64.b64decode(photo_base64)
        audio_bytes = base64.b64decode(audio_base64)

        logger.info(
            f"📦 Decoded photo: {len(photo_bytes)} bytes, audio: {len(audio_bytes)} bytes"
        )

        # Generate unique filenames with timestamp
        timestamp = int(now.timestamp() * 1000)
        photo_filename = f"{user_id}/photo_{timestamp}.jpg"
        audio_filename = f"{user_id}/audio_{timestamp}.aac"

        # Upload photo to Supabase Storage
        logger.info(f"📤 Uploading photo to: origin-stories/{photo_filename}")
        photo_upload = supabase.storage.from_("origin-stories").upload(
            path=photo_filename,
            file=photo_bytes,
            file_options={"content-type": "image/jpeg"},
        )

        if not photo_upload:
            raise Exception("Photo upload failed")

        # Upload audio to Supabase Storage
        logger.info(f"📤 Uploading audio to: origin-stories/{audio_filename}")
        audio_upload = supabase.storage.from_("origin-stories").upload(
            path=audio_filename,
            file=audio_bytes,
            file_options={"content-type": "audio/aac"},
        )

        if not audio_upload:
            raise Exception("Audio upload failed")

        # Get public URLs (signed URLs for private bucket)
        photo_url = supabase.storage.from_("origin-stories").get_public_url(photo_filename)
        audio_url = supabase.storage.from_("origin-stories").get_public_url(audio_filename)

        logger.info("✅ Files uploaded successfully")
        logger.info(f"📷 Photo URL: {photo_url}")
        logger.info(f"🎤 Audio URL: {audio_url}")

        # Create origin_stories record
        origin_story_data = {
            "id": str(uuid4()),
            "user_id": user_id,
            "photo_storage_key": photo_filename,
            "audio_storage_key": audio_filename,
            "audio_duration_seconds": audio_duration_seconds,
            "from_text": from_text,
            "to_text": to_text,
            "created_at": now.isoformat(),
        }

        origin_story_result = (
            supabase.table("origin_stories")
            .insert(origin_story_data)
            .execute()
        )

        if not origin_story_result.data or len(origin_story_result.data) == 0:
            raise Exception("Failed to create origin_stories record")

        origin_story = origin_story_result.data[0]
        logger.info(
            f"✅ Origin story record created: {origin_story['id']}"
        )

        # Update user_profiles with first_bind completion
        is_first_bind = profile["first_bind_completed_at"] is None

        if is_first_bind:
            logger.info(f"🎉 This is user {user_id}'s first bind! Updating user_level to 1")
            profile_update = (
                supabase.table("user_profiles")
                .update({
                    "first_bind_completed_at": now.isoformat(),
                    "user_level": 1,
                    "updated_at": now.isoformat(),
                })
                .eq("id", user_id)
                .execute()
            )

            if not profile_update.data or len(profile_update.data) == 0:
                logger.warning(
                    f"⚠️  Failed to update user_profiles for first bind (non-fatal)"
                )

        logger.info(
            f"✅ Origin story created successfully for user {user_id}: "
            f"photo={photo_filename}, audio={audio_filename}, "
            f"duration={audio_duration_seconds}s, first_bind={is_first_bind}"
        )

        return {
            "success": True,
            "origin_story_id": origin_story["id"],
            "user_id": user_id,
            "photo_url": photo_url,
            "audio_url": audio_url,
            "first_bind_completed": is_first_bind,
            "user_level": 1 if is_first_bind else profile.get("user_level", 0),
            "created_at": origin_story["created_at"],
        }

    except ValueError:
        # Re-raise validation errors
        raise
    except Exception as e:
        logger.error(f"❌ Failed to create origin story: {str(e)}")
        raise

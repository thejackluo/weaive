"""Onboarding API endpoints (Stories 1.2, 1.3, 1.6)"""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.core.deps import get_current_user, get_supabase_client
from app.models.onboarding import (
    IdentityBootupData,
    IdentityBootupResponse,
    PainpointSelection,
    PainpointSelectionResponse,
)
from app.services import onboarding

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/onboarding")


@router.get("/debug/current-user")
async def debug_current_user(
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Debug endpoint to show current user's auth_user_id and profile status.

    Returns:
    - JWT payload (auth_user_id from 'sub' claim)
    - Whether user_profile exists in database
    - User profile data if exists
    """
    auth_user_id = user["sub"]

    # Check if user_profile exists
    profile_result = (
        supabase.table("user_profiles")
        .select("*")
        .eq("auth_user_id", auth_user_id)
        .execute()
    )

    return {
        "jwt_payload": user,
        "auth_user_id": auth_user_id,
        "profile_exists": bool(profile_result.data),
        "profile_data": profile_result.data[0] if profile_result.data else None,
    }


@router.post(
    "/painpoints",
    response_model=PainpointSelectionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def store_painpoints(
    selection: PainpointSelection,
    supabase: Client = Depends(get_supabase_client),
):
    """
    Store selected painpoints from emotional state selection (Story 1.2).

    This endpoint stores the user's selected painpoints during onboarding.
    Works for both pre-auth (anonymous) and authenticated users.

    **Authentication:** Optional (pre-auth onboarding supported)

    **Request Body:**
    - painpoints: Array of 1-2 painpoint IDs from: clarity, action, consistency, alignment
    - user_id: User UUID (optional, None for pre-auth)
    - session_id: Session identifier (optional, for tracking)

    **Validation:**
    - Must provide 1-2 painpoints (no more, no less)
    - Painpoints must be valid IDs from the allowed set

    **Status Codes:**
    - 201: Painpoints stored successfully
    - 400: Validation error (invalid painpoints or count)
    - 422: Request body validation error
    - 500: Server error (database failure)

    **Example Request:**
    ```json
    {
      "painpoints": ["clarity", "action"],
      "session_id": "session-abc123"
    }
    ```

    **Example Response:**
    ```json
    {
      "success": true,
      "painpoints": ["clarity", "action"],
      "user_id": null
    }
    ```
    """
    try:
        result = await onboarding.store_painpoint_selection(
            supabase=supabase,
            painpoints=selection.painpoints,
            user_id=selection.user_id,
            session_id=selection.session_id,
        )

        return PainpointSelectionResponse(**result)

    except ValueError as e:
        # Validation errors (invalid painpoints, wrong count)
        logger.warning(f"⚠️  Validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        # Database or unexpected errors
        logger.error(f"❌ Error storing painpoints: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to store painpoint selection: {str(e)}",
        )


@router.post(
    "/identity-bootup",
    response_model=IdentityBootupResponse,
    status_code=status.HTTP_200_OK,
)
async def store_identity_bootup(
    data: IdentityBootupData,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Store identity bootup data from onboarding Steps 1-3 (Story 1.6).

    This endpoint stores the user's:
    - Preferred name/nickname (Step 1)
    - Selected Weave personality type (Step 2)
    - 3-5 identity traits they want to grow into (Step 3)

    **Authentication:** Required (user must be logged in)

    **Request Body:**
    - preferred_name: User's chosen name (1-50 chars, letters/numbers/spaces/hyphens/apostrophes only)
    - core_personality: Either "supportive_direct" or "tough_warm"
    - identity_traits: Array of 3-5 traits from predefined list

    **Validation:**
    - Name: 1-50 characters, no special characters except hyphens and apostrophes
    - Personality: Must be one of the two predefined types
    - Traits: Must select 3-5 traits from the allowed list (no duplicates)

    **Status Codes:**
    - 200: Identity data stored successfully
    - 400: Validation error (invalid name format, invalid traits, wrong count)
    - 401: Unauthorized (no valid JWT token)
    - 404: User profile not found
    - 422: Request body validation error
    - 500: Server error (database failure)

    **Example Request:**
    ```json
    {
      "preferred_name": "Alex",
      "core_personality": "supportive_direct",
      "identity_traits": ["Disciplined", "Focused", "Resilient"]
    }
    ```

    **Example Response:**
    ```json
    {
      "success": true,
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "preferred_name": "Alex",
      "core_personality": "supportive_direct",
      "identity_traits": ["Disciplined", "Focused", "Resilient"],
      "personality_selected_at": "2025-12-20T10:00:00Z"
    }
    ```
    """
    try:
        # Extract auth_user_id from JWT payload
        auth_user_id = user["sub"]

        # Store identity bootup data
        result = await onboarding.store_identity_bootup(
            supabase=supabase,
            auth_user_id=auth_user_id,
            preferred_name=data.preferred_name,
            core_personality=data.core_personality,
            identity_traits=data.identity_traits,
        )

        return IdentityBootupResponse(**result)

    except ValueError as e:
        # Validation errors (user not found, invalid data)
        error_msg = str(e)
        logger.warning(f"⚠️  Validation error: {error_msg}")

        # User profile not found
        if "not found" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error_msg,
            )

        # Other validation errors
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg,
        )
    except Exception as e:
        # Database or unexpected errors
        logger.error(f"❌ Error storing identity bootup data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to store identity bootup data: {str(e)}",
        )

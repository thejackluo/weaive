"""Onboarding API endpoints (Stories 1.2, 1.3)"""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.core.deps import get_supabase_client
from app.models.onboarding import (
    PainpointSelection,
    PainpointSelectionResponse,
)
from app.services import onboarding

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/onboarding")


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

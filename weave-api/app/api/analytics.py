"""Analytics API endpoints (Story 1.1: Welcome & Vision Hook)"""

import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.core.deps import get_supabase_client
from app.models.analytics import AnalyticsEventCreate, AnalyticsEventResponse
from app.services import analytics

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analytics")


@router.post(
    "/events",
    response_model=AnalyticsEventResponse,
    status_code=status.HTTP_201_CREATED,
)
async def track_event(
    event: AnalyticsEventCreate,
    supabase: Client = Depends(get_supabase_client),
):
    """
    Track an analytics event.

    This endpoint allows tracking user events for product insights and funnel analysis.
    It works for both authenticated and anonymous (pre-auth) users.

    **Authentication:** Optional (works without auth for pre-auth events)

    **Request Body:**
    - event_name: Event identifier (required, 1-100 chars)
    - user_id: User UUID (optional, None for pre-auth events)
    - event_data: Event metadata dictionary (optional)
    - session_id: Session identifier (optional)
    - timestamp: Event timestamp (optional, defaults to server time)

    **Status Codes:**
    - 201: Event tracked successfully
    - 422: Validation error (invalid request body)
    - 500: Server error (database failure)

    **Example Request:**
    ```json
    {
      "event_name": "onboarding_started",
      "event_data": {
        "device_type": "iPhone 14",
        "os_version": "iOS 17.2",
        "app_version": "1.0.0"
      }
    }
    ```

    **Example Response:**
    ```json
    {
      "event_id": "550e8400-e29b-41d4-a716-446655440000",
      "event_name": "onboarding_started",
      "user_id": null,
      "timestamp": "2025-12-19T19:00:00Z"
    }
    ```
    """
    try:
        result = await analytics.track_event(
            supabase=supabase,
            event_name=event.event_name,
            event_data=event.event_data,
            user_id=event.user_id,
            session_id=event.session_id,
            timestamp=event.timestamp,
        )

        return AnalyticsEventResponse(
            event_id=UUID(result["id"]),
            event_name=result["event_name"],
            user_id=UUID(result["user_id"]) if result.get("user_id") else None,
            timestamp=result["timestamp"],
        )

    except Exception as e:
        logger.error(f"❌ Error tracking event '{event.event_name}': {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to track event: {str(e)}",
        )

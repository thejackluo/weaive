"""Analytics event models (Story 1.1)"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class AnalyticsEventCreate(BaseModel):
    """Request model for creating an analytics event."""

    event_name: str = Field(
        ...,
        description="Event identifier (e.g., onboarding_started, auth_completed)",
        min_length=1,
        max_length=100,
    )
    user_id: Optional[UUID] = Field(
        None,
        description="User ID (optional for pre-auth events)",
    )
    event_data: dict = Field(
        default_factory=dict,
        description="Event metadata (device_type, os_version, app_version, etc.)",
    )
    session_id: Optional[str] = Field(
        None,
        description="Session identifier for grouping related events",
        max_length=255,
    )
    timestamp: Optional[datetime] = Field(
        None,
        description="Event timestamp (defaults to server time if not provided)",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "event_name": "onboarding_started",
                    "event_data": {
                        "device_type": "iPhone 14",
                        "os_version": "iOS 17.2",
                        "app_version": "1.0.0",
                    },
                }
            ]
        }
    }


class AnalyticsEventResponse(BaseModel):
    """Response model for analytics event creation."""

    event_id: UUID = Field(..., description="Unique event ID")
    event_name: str = Field(..., description="Event identifier")
    user_id: Optional[UUID] = Field(None, description="User ID if provided")
    timestamp: datetime = Field(..., description="Event timestamp")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "event_id": "550e8400-e29b-41d4-a716-446655440000",
                    "event_name": "onboarding_started",
                    "user_id": None,
                    "timestamp": "2025-12-19T19:00:00Z",
                }
            ]
        }
    }

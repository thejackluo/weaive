"""User profile models (Story 1.5)"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class UserProfileCreate(BaseModel):
    """Request model for creating a user profile after authentication."""

    auth_user_id: str = Field(
        ...,
        description="Supabase auth user ID (from JWT 'sub' field)",
        min_length=1,
    )
    display_name: Optional[str] = Field(
        None,
        description="User display name",
        max_length=255,
    )
    timezone: str = Field(
        default="UTC",
        description="IANA timezone (e.g., America/Los_Angeles)",
        max_length=100,
    )
    locale: str = Field(
        default="en-US",
        description="User locale (e.g., en-US, es-ES)",
        max_length=10,
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "auth_user_id": "550e8400-e29b-41d4-a716-446655440000",
                    "display_name": "John Doe",
                    "timezone": "America/Los_Angeles",
                    "locale": "en-US",
                }
            ]
        }
    }


class UserProfileResponse(BaseModel):
    """Response model for user profile operations."""

    id: UUID = Field(..., description="User profile UUID")
    auth_user_id: str = Field(..., description="Supabase auth user ID")
    display_name: Optional[str] = Field(None, description="User display name")
    timezone: str = Field(..., description="IANA timezone")
    locale: str = Field(..., description="User locale")
    created_at: datetime = Field(..., description="Profile creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "auth_user_id": "auth-user-123",
                    "display_name": "John Doe",
                    "timezone": "America/Los_Angeles",
                    "locale": "en-US",
                    "created_at": "2025-12-19T19:00:00Z",
                    "updated_at": "2025-12-19T19:00:00Z",
                }
            ]
        }
    }

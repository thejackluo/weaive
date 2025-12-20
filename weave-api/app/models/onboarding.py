"""Onboarding models (Stories 1.2, 1.3)"""

from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class PainpointSelection(BaseModel):
    """Request model for storing selected painpoints (Story 1.2)."""

    painpoints: List[str] = Field(
        ...,
        description="Selected painpoint IDs (1-2 items from: clarity, action, consistency, alignment)",
        min_length=1,
        max_length=2,
    )
    user_id: Optional[UUID] = Field(
        None,
        description="User ID (optional for pre-auth, required for authenticated users)",
    )
    session_id: Optional[str] = Field(
        None,
        description="Session identifier for tracking onboarding flow",
        max_length=255,
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "painpoints": ["clarity", "action"],
                    "user_id": None,
                    "session_id": "session-abc123",
                }
            ]
        }
    }


class PainpointSelectionResponse(BaseModel):
    """Response model for painpoint selection."""

    success: bool = Field(..., description="Whether the operation succeeded")
    painpoints: List[str] = Field(..., description="Confirmed painpoints stored")
    user_id: Optional[UUID] = Field(
        None, description="User ID if authenticated"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "success": True,
                    "painpoints": ["clarity", "action"],
                    "user_id": None,
                }
            ]
        }
    }

"""Journal entry models (Story 1.9)"""

from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class JournalEntryCreate(BaseModel):
    """Request model for creating a daily journal entry.

    Note: user_id is extracted from JWT token, not from request body.
    This ensures users can only create journal entries for themselves.
    """

    local_date: date = Field(
        ...,
        description="User's local date for this journal entry (YYYY-MM-DD)",
    )
    fulfillment_score: int = Field(
        ...,
        ge=1,
        le=10,
        description="Daily fulfillment rating 1-10",
    )
    entry_text: Optional[str] = Field(
        None,
        description="Optional reflection text (50-500 characters if provided)",
        min_length=50,
        max_length=500,
    )
    is_onboarding: bool = Field(
        default=False,
        description="True if this is the Day 0 onboarding reflection",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "local_date": "2025-12-21",
                    "fulfillment_score": 7,
                    "entry_text": "Feeling good about starting this journey. Excited to build better habits and see progress over time.",
                    "is_onboarding": True,
                },
                {
                    "local_date": "2025-12-21",
                    "fulfillment_score": 5,
                    "entry_text": None,
                    "is_onboarding": False,
                },
            ]
        }
    }


class JournalEntryResponse(BaseModel):
    """Response model for journal entry operations."""

    id: UUID = Field(..., description="Journal entry UUID")
    user_id: UUID = Field(..., description="User profile UUID")
    local_date: date = Field(..., description="User's local date (YYYY-MM-DD)")
    fulfillment_score: int = Field(..., description="Fulfillment rating 1-10")
    entry_text: Optional[str] = Field(None, description="Reflection text (optional)")
    is_onboarding: bool = Field(..., description="True if Day 0 onboarding reflection")
    created_at: datetime = Field(..., description="Entry creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "user_id": "660e8400-e29b-41d4-a716-446655440111",
                    "local_date": "2025-12-21",
                    "fulfillment_score": 7,
                    "entry_text": "Feeling good about starting this journey. Excited to build better habits and see progress over time.",
                    "is_onboarding": True,
                    "created_at": "2025-12-21T18:30:00Z",
                    "updated_at": "2025-12-21T18:30:00Z",
                }
            ]
        }
    }

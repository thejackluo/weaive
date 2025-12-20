"""Onboarding models (Stories 1.2, 1.3, 1.6)"""

from datetime import datetime
from typing import List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


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


class IdentityBootupData(BaseModel):
    """Request model for storing identity bootup data (Story 1.6)."""

    preferred_name: str = Field(
        ...,
        description="User's preferred name or nickname (1-50 characters)",
        min_length=1,
        max_length=50,
    )
    core_personality: Literal["supportive_direct", "tough_warm"] = Field(
        ...,
        description="Selected Weave personality type",
    )
    identity_traits: List[str] = Field(
        ...,
        description="Selected identity traits (exactly 3 items from the predefined list)",
        min_length=3,
        max_length=3,
    )

    @field_validator("preferred_name")
    @classmethod
    def validate_preferred_name(cls, v: str) -> str:
        """Validate name contains only allowed characters."""
        import re
        # Allow letters, numbers, spaces, hyphens, apostrophes
        if not re.match(r"^[a-zA-Z0-9\s\-']+$", v):
            raise ValueError(
                "Name must contain only letters, numbers, spaces, hyphens, and apostrophes"
            )
        return v.strip()

    @field_validator("identity_traits")
    @classmethod
    def validate_identity_traits(cls, v: List[str]) -> List[str]:
        """Validate all traits are from the allowed list."""
        allowed_traits = {
            "Clear Direction",
            "Intentional Time",
            "Decisive Action",
            "Consistent Effort",
            "High Standards",
            "Continuous Growth",
            "Self Aware",
            "Emotionally Grounded",
        }
        for trait in v:
            if trait not in allowed_traits:
                raise ValueError(f"Invalid trait: {trait}. Must be from predefined list.")

        # Check for duplicates
        if len(v) != len(set(v)):
            raise ValueError("Cannot select duplicate traits")

        return v

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "preferred_name": "Alex",
                    "core_personality": "supportive_direct",
                    "identity_traits": ["Clear Direction", "High Standards", "Self Aware"],
                }
            ]
        }
    }


class IdentityBootupResponse(BaseModel):
    """Response model for identity bootup data submission."""

    success: bool = Field(..., description="Whether the operation succeeded")
    user_id: UUID = Field(..., description="User profile UUID")
    preferred_name: str = Field(..., description="Confirmed preferred name")
    core_personality: str = Field(..., description="Confirmed personality type")
    identity_traits: List[str] = Field(..., description="Confirmed identity traits")
    personality_selected_at: datetime = Field(
        ..., description="Timestamp when personality was selected"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "success": True,
                    "user_id": "550e8400-e29b-41d4-a716-446655440000",
                    "preferred_name": "Alex",
                    "core_personality": "supportive_direct",
                    "identity_traits": ["Clear Direction", "High Standards", "Self Aware"],
                    "personality_selected_at": "2025-12-20T10:00:00Z",
                }
            ]
        }
    }

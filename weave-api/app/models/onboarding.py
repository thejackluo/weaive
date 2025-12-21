"""Onboarding models (Stories 1.2, 1.3, 1.6, 1.7)"""

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


class OriginStoryData(BaseModel):
    """Request model for creating origin story (Story 1.7)."""

    photo_base64: str = Field(
        ...,
        description="Base64-encoded photo (JPEG/PNG, max 10MB after encoding)",
    )
    audio_base64: str = Field(
        ...,
        description="Base64-encoded audio (AAC/MP4/M4A, max 10MB after encoding)",
    )
    audio_duration_seconds: int = Field(
        ...,
        description="Duration of voice recording in seconds (max 60)",
        ge=1,
        le=60,
    )
    from_text: str = Field(
        ...,
        description="Current struggle narrative from painpoint selection",
        min_length=10,
        max_length=500,
    )
    to_text: str = Field(
        ...,
        description="Aspirational identity traits text",
        min_length=10,
        max_length=500,
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "photo_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
                    "audio_base64": "data:audio/aac;base64,AAAAGGZ0eXBp...",
                    "audio_duration_seconds": 42,
                    "from_text": "You've been feeling scattered — like there's too much to do, but no clear direction.",
                    "to_text": "You want to become someone with Clear Direction, High Standards, and Self Aware — someone who acts with purpose.",
                }
            ]
        }
    }


class OriginStoryResponse(BaseModel):
    """Response model for origin story creation."""

    success: bool = Field(..., description="Whether the operation succeeded")
    origin_story_id: UUID = Field(..., description="UUID of created origin story record")
    user_id: UUID = Field(..., description="User profile UUID")
    photo_url: str = Field(..., description="Public URL of uploaded photo")
    audio_url: str = Field(..., description="Public URL of uploaded audio")
    first_bind_completed: bool = Field(
        ..., description="Whether this was the user's first bind"
    )
    user_level: int = Field(..., description="User's current level (should be 1)")
    created_at: datetime = Field(
        ..., description="Timestamp when origin story was created"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "success": True,
                    "origin_story_id": "660e8400-e29b-41d4-a716-446655440000",
                    "user_id": "550e8400-e29b-41d4-a716-446655440000",
                    "photo_url": "https://supabase.co/storage/v1/object/public/origin-stories/550e8400.../photo.jpg",
                    "audio_url": "https://supabase.co/storage/v1/object/public/origin-stories/550e8400.../audio.aac",
                    "first_bind_completed": True,
                    "user_level": 1,
                    "created_at": "2025-12-20T10:30:00Z",
                }
            ]
        }
    }

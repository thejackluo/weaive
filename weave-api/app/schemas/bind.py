"""
Pydantic schemas for Bind (Subtask) resource
Epic 3: Thread - Daily Action Loop
Story 1.5.2: Backend API/Model Standardization
"""

from typing import Optional

from pydantic import Field

from app.models.base import BaseCreateModel, BaseUpdateModel

# ============================================================================
# BIND COMPLETION SCHEMAS
# ============================================================================


class CompleteBindRequest(BaseCreateModel):
    """Request body for completing a bind"""

    timer_duration: Optional[int] = Field(
        None,
        ge=0,
        description="Timer duration in minutes"
    )
    photo_used: Optional[bool] = Field(
        None,
        description="Whether photo accountability was used"
    )
    notes: Optional[str] = Field(
        None,
        max_length=500,
        description="Optional completion notes (e.g., 'Ran 5k in 30min')"
    )

    class Config:
        json_schema_extra = {
            "examples": [
                {
                    "timer_duration": 25,
                    "photo_used": True,
                    "notes": "Felt great! Ran 5k in 30 minutes"
                }
            ]
        }


# ============================================================================
# BIND TEMPLATE SCHEMAS
# ============================================================================


class UpdateBindRequest(BaseUpdateModel):
    """Request body for updating a bind template"""

    title: Optional[str] = Field(
        None,
        min_length=1,
        max_length=200,
        description="Bind title"
    )
    times_per_week: Optional[int] = Field(
        None,
        ge=1,
        le=7,
        description="Number of times per week this bind should be completed (1-7)"
    )
    recurrence_rule: Optional[str] = Field(
        None,
        description="iCal RRULE format (DEPRECATED - use times_per_week instead)"
    )
    default_estimated_minutes: Optional[int] = Field(
        None,
        ge=0,
        description="Default estimated time in minutes"
    )

    class Config:
        json_schema_extra = {
            "examples": [
                {
                    "title": "Evening run",
                    "times_per_week": 3,
                    "default_estimated_minutes": 45
                }
            ]
        }


class CreateBindRequest(BaseCreateModel):
    """Request body for creating a new bind"""

    goal_id: str = Field(..., description="Goal ID this bind belongs to")
    title: str = Field(..., min_length=1, max_length=200, description="Bind title")
    description: Optional[str] = Field(
        None,
        max_length=1000,
        description="Bind description"
    )
    times_per_week: int = Field(
        3,
        ge=1,
        le=7,
        description="Number of times per week this bind should be completed (1-7). Default: 3"
    )

    class Config:
        json_schema_extra = {
            "examples": [
                {
                    "goal_id": "550e8400-e29b-41d4-a716-446655440000",
                    "title": "Morning meditation",
                    "description": "10 minutes of mindfulness",
                    "times_per_week": 3
                }
            ]
        }

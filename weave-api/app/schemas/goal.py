"""
Pydantic schemas for Goal resource
Epic 2: Goal Management
Story 1.5.2: Backend API/Model Standardization
"""

from typing import List, Optional

from pydantic import Field

from app.models.base import BaseCreateModel, BaseUpdateModel

# ============================================================================
# Q-GOAL (MILESTONE) SCHEMAS
# ============================================================================


class QGoalCreate(BaseCreateModel):
    """Q-Goal (Milestone) creation model"""

    title: str = Field(..., min_length=1, max_length=200, description="Milestone title")
    metric_name: Optional[str] = Field(None, max_length=100, description="Metric name (e.g., 'Weight', 'Distance')")
    target_value: Optional[float] = Field(None, ge=0, description="Target value for quantifiable goals")
    current_value: Optional[float] = Field(None, ge=0, description="Current value")
    unit: Optional[str] = Field(None, max_length=20, description="Unit of measurement (e.g., 'kg', 'miles')")

    class Config:
        json_schema_extra = {
            "examples": [
                {
                    "title": "Reach 70kg weight",
                    "metric_name": "Weight",
                    "target_value": 70.0,
                    "current_value": 75.0,
                    "unit": "kg"
                }
            ]
        }


# ============================================================================
# BIND (SUBTASK TEMPLATE) SCHEMAS
# ============================================================================


class BindCreate(BaseCreateModel):
    """Bind (Subtask Template) creation model"""

    title: str = Field(..., min_length=1, max_length=200, description="Bind title")
    description: Optional[str] = Field(None, max_length=1000, description="Bind description")
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
                    "title": "Morning run",
                    "description": "30 minute jog around the park",
                    "times_per_week": 7
                }
            ]
        }


# ============================================================================
# GOAL SCHEMAS
# ============================================================================


class GoalCreate(BaseCreateModel):
    """Goal creation request model"""

    title: str = Field(..., min_length=1, max_length=200, description="Goal title")
    description: Optional[str] = Field(None, max_length=1000, description="Goal description (why it matters)")
    qgoals: Optional[List[QGoalCreate]] = Field(
        default_factory=list,
        description="Q-goals (milestones) for this goal"
    )
    binds: Optional[List[BindCreate]] = Field(
        default_factory=list,
        description="Binds (subtask templates) for this goal"
    )

    class Config:
        json_schema_extra = {
            "examples": [
                {
                    "title": "Run 5K Marathon",
                    "description": "Complete a 5K run to improve fitness and health",
                    "qgoals": [
                        {
                            "title": "Run 5km without stopping",
                            "metric_name": "Distance",
                            "target_value": 5.0,
                            "current_value": 0.0,
                            "unit": "km"
                        }
                    ],
                    "binds": [
                        {
                            "title": "Morning run",
                            "description": "30 minute jog",
                            "frequency_type": "daily",
                            "frequency_value": 1
                        }
                    ]
                }
            ]
        }


class GoalUpdate(BaseUpdateModel):
    """Goal update request model (partial updates allowed)"""

    title: Optional[str] = Field(None, min_length=1, max_length=200, description="Updated goal title")
    description: Optional[str] = Field(None, max_length=1000, description="Updated description")
    status: Optional[str] = Field(
        None,
        pattern="^(active|archived)$",
        description="Goal status (active or archived)"
    )

    class Config:
        json_schema_extra = {
            "examples": [
                {
                    "title": "Run 10K Marathon",
                    "description": "Upgraded goal to 10K distance"
                }
            ]
        }

"""
Pydantic Schema Template for Weave Backend
Story 1.5.2: Backend API/Model Standardization

This template provides standardized patterns for creating Pydantic request/response models.
Replace {Resource}, {resource}, {resources} placeholders with your resource name.

Example:
- {Resource} = Goal
- {resource} = goal
- {resources} = goals

Usage:
1. Copy this template to app/schemas/{resource}.py
2. Replace all {placeholders} with your resource name
3. Add resource-specific fields and validation
4. Import in router: from app.schemas.{resource} import {Resource}Create, {Resource}Update, {Resource}Response
"""

from datetime import datetime, date
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field, field_validator, ConfigDict

# Import base models for consistent patterns
from app.models.base import BaseCreateModel, BaseUpdateModel, BaseResponseModel


# ============================================================================
# CREATE SCHEMA - POST /api/{resources}
# ============================================================================

class {Resource}Create(BaseCreateModel):
    """
    Request schema for creating a new {resource}

    Epic X, Story X.X: [Story Name]

    All required fields must be provided.
    Optional fields can be omitted.
    """

    # Required fields
    title: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="{Resource} title"
    )

    # Optional fields
    description: Optional[str] = Field(
        None,
        max_length=1000,
        description="{Resource} description"
    )

    # Enum fields (status, category, etc.)
    status: str = Field(
        default="active",
        description="Status: active, completed, archived",
        pattern="^(active|completed|archived)$"
    )

    # Boolean fields
    is_public: bool = Field(
        default=False,
        description="Whether {resource} is publicly visible"
    )

    # Numeric fields
    priority: int = Field(
        default=1,
        ge=1,
        le=5,
        description="Priority level (1-5)"
    )

    # Date fields
    due_date: Optional[date] = Field(
        None,
        description="Due date for {resource}"
    )

    # List fields (for related items)
    tags: List[str] = Field(
        default_factory=list,
        max_length=10,
        description="Tags for categorization"
    )

    # Emoji/icon fields
    emoji: str = Field(
        default="📝",
        min_length=1,
        max_length=10,
        description="Emoji icon"
    )

    # ========================================================================
    # FIELD VALIDATORS
    # ========================================================================

    @field_validator('title')
    @classmethod
    def validate_title(cls, v: str) -> str:
        """Validate title field"""
        # Strip whitespace
        v = v.strip()

        # Check not empty after stripping
        if not v:
            raise ValueError("Title cannot be empty")

        # Custom validation logic
        if len(v) < 3:
            raise ValueError("Title must be at least 3 characters")

        return v

    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v: List[str]) -> List[str]:
        """Validate tags list"""
        # Remove duplicates
        v = list(set(v))

        # Validate each tag
        for tag in v:
            if not tag.strip():
                raise ValueError("Tags cannot be empty")
            if len(tag) > 50:
                raise ValueError("Each tag must be at most 50 characters")

        return v

    @field_validator('due_date')
    @classmethod
    def validate_due_date(cls, v: Optional[date]) -> Optional[date]:
        """Validate due date is not in the past"""
        if v is not None and v < date.today():
            raise ValueError("Due date cannot be in the past")
        return v

    # ========================================================================
    # CONFIGURATION & EXAMPLES
    # ========================================================================

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "title": "Learn Spanish",
                    "description": "Become conversational in 10 days",
                    "status": "active",
                    "is_public": False,
                    "priority": 3,
                    "due_date": "2025-12-31",
                    "tags": ["language", "personal-growth"],
                    "emoji": "🇪🇸"
                },
                {
                    "title": "Build MVP",
                    "description": None,
                    "status": "active",
                    "is_public": True,
                    "priority": 5,
                    "due_date": None,
                    "tags": ["work", "startup"],
                    "emoji": "🚀"
                }
            ]
        }
    )


# ============================================================================
# UPDATE SCHEMA - PUT /api/{resources}/{id}
# ============================================================================

class {Resource}Update(BaseUpdateModel):
    """
    Request schema for updating an existing {resource}

    Epic X, Story X.X: [Story Name]

    All fields are OPTIONAL to support partial updates.
    Only fields with non-None values will be updated.
    """

    # All fields optional (for partial updates)
    title: Optional[str] = Field(
        None,
        min_length=1,
        max_length=255,
        description="{Resource} title"
    )

    description: Optional[str] = Field(
        None,
        max_length=1000,
        description="{Resource} description"
    )

    status: Optional[str] = Field(
        None,
        description="Status: active, completed, archived",
        pattern="^(active|completed|archived)$"
    )

    is_public: Optional[bool] = Field(
        None,
        description="Whether {resource} is publicly visible"
    )

    priority: Optional[int] = Field(
        None,
        ge=1,
        le=5,
        description="Priority level (1-5)"
    )

    due_date: Optional[date] = Field(
        None,
        description="Due date for {resource}"
    )

    tags: Optional[List[str]] = Field(
        None,
        max_length=10,
        description="Tags for categorization"
    )

    emoji: Optional[str] = Field(
        None,
        min_length=1,
        max_length=10,
        description="Emoji icon"
    )

    # Additional update-only fields
    is_archived: Optional[bool] = Field(
        None,
        description="Archive status"
    )

    # ========================================================================
    # FIELD VALIDATORS (same as Create, but handle None)
    # ========================================================================

    @field_validator('title')
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        """Validate title field"""
        if v is None:
            return v

        v = v.strip()
        if not v:
            raise ValueError("Title cannot be empty")
        if len(v) < 3:
            raise ValueError("Title must be at least 3 characters")

        return v

    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        """Validate tags list"""
        if v is None:
            return v

        v = list(set(v))  # Remove duplicates
        for tag in v:
            if not tag.strip():
                raise ValueError("Tags cannot be empty")
            if len(tag) > 50:
                raise ValueError("Each tag must be at most 50 characters")

        return v

    # ========================================================================
    # CONFIGURATION & EXAMPLES
    # ========================================================================

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "title": "Learn Spanish (Updated)",
                    "status": "completed"
                },
                {
                    "is_archived": True
                },
                {
                    "priority": 5,
                    "due_date": "2025-12-31",
                    "tags": ["language", "personal-growth", "urgent"]
                }
            ]
        }
    )


# ============================================================================
# RESPONSE SCHEMA - Returned by ALL endpoints
# ============================================================================

class {Resource}Response(BaseResponseModel):
    """
    Response schema for {resource} operations

    Epic X, Story X.X: [Story Name]

    Includes all database fields plus computed properties.
    Returned by GET, POST, PUT endpoints.
    """

    # Foreign keys
    user_id: UUID = Field(..., description="Owner user ID")

    # Resource fields (from database)
    title: str = Field(..., description="{Resource} title")
    description: Optional[str] = Field(None, description="{Resource} description")
    status: str = Field(..., description="Status: active, completed, archived")
    is_public: bool = Field(..., description="Public visibility flag")
    priority: int = Field(..., description="Priority level (1-5)")
    due_date: Optional[date] = Field(None, description="Due date")
    tags: List[str] = Field(default_factory=list, description="Tags")
    emoji: str = Field(..., description="Emoji icon")
    is_archived: bool = Field(default=False, description="Archive status")

    # Computed/aggregated fields (not in database)
    progress_percentage: float = Field(
        default=0.0,
        ge=0,
        le=100,
        description="Completion progress (0-100)"
    )

    subtask_count: int = Field(
        default=0,
        ge=0,
        description="Number of subtasks"
    )

    completed_subtask_count: int = Field(
        default=0,
        ge=0,
        description="Number of completed subtasks"
    )

    # Related data (nested objects - if needed)
    # subtasks: List[SubtaskResponse] = Field(
    #     default_factory=list,
    #     description="List of subtasks"
    # )

    # Inherited from BaseResponseModel:
    # - id: UUID
    # - created_at: datetime
    # - updated_at: datetime
    # - deleted_at: Optional[datetime]
    # - is_deleted property

    # ========================================================================
    # COMPUTED PROPERTIES
    # ========================================================================

    @property
    def is_complete(self) -> bool:
        """Check if {resource} is marked as completed"""
        return self.status == "completed"

    @property
    def is_overdue(self) -> bool:
        """Check if {resource} is past due date"""
        if self.due_date is None:
            return False
        return date.today() > self.due_date and self.status != "completed"

    @property
    def days_until_due(self) -> Optional[int]:
        """Calculate days until due date"""
        if self.due_date is None:
            return None
        delta = self.due_date - date.today()
        return delta.days

    # ========================================================================
    # CONFIGURATION & EXAMPLES
    # ========================================================================

    model_config = ConfigDict(
        from_attributes=True,  # Allow ORM mode
        json_schema_extra={
            "examples": [
                {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "user_id": "660e8400-e29b-41d4-a716-446655440000",
                    "title": "Learn Spanish",
                    "description": "Become conversational in 10 days",
                    "status": "active",
                    "is_public": False,
                    "priority": 3,
                    "due_date": "2025-12-31",
                    "tags": ["language", "personal-growth"],
                    "emoji": "🇪🇸",
                    "is_archived": False,
                    "progress_percentage": 45.5,
                    "subtask_count": 10,
                    "completed_subtask_count": 4,
                    "created_at": "2025-12-23T10:00:00Z",
                    "updated_at": "2025-12-23T12:30:00Z",
                    "deleted_at": None
                }
            ]
        }
    )


# ============================================================================
# NESTED/RELATED SCHEMAS (if needed)
# ============================================================================

class {Resource}ListItem(BaseModel):
    """
    Simplified {resource} schema for list views

    Use this for GET /api/{resources} (list endpoint) when full details not needed.
    Reduces payload size for better performance.
    """

    id: UUID
    title: str
    emoji: str
    status: str
    priority: int
    progress_percentage: float
    due_date: Optional[date]
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class {Resource}Summary(BaseModel):
    """
    Aggregated {resource} statistics

    Use for dashboard/analytics endpoints.
    """

    total_count: int = Field(..., description="Total {resources}")
    active_count: int = Field(..., description="Active {resources}")
    completed_count: int = Field(..., description="Completed {resources}")
    archived_count: int = Field(..., description="Archived {resources}")
    average_progress: float = Field(..., description="Average completion %")

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "total_count": 15,
                    "active_count": 8,
                    "completed_count": 5,
                    "archived_count": 2,
                    "average_progress": 62.5
                }
            ]
        }
    )


# ============================================================================
# USAGE IN ROUTER
# ============================================================================

"""
Example usage in FastAPI router:

from fastapi import APIRouter, Depends
from app.schemas.{resource} import {Resource}Create, {Resource}Update, {Resource}Response
from app.core.auth import get_current_user

router = APIRouter(prefix="/api/{resources}", tags=["{resources}"])

@router.post("/", status_code=201, response_model=dict)
async def create_{resource}(
    data: {Resource}Create,  # Request validation
    user: dict = Depends(get_current_user)
):
    auth_user_id = user["sub"]

    # Create {resource} in database
    new_{resource} = await create_{resource}_for_user(auth_user_id, data)

    # Return standardized response
    return {
        "data": {Resource}Response.model_validate(new_{resource}).model_dump(),
        "meta": {
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    }

@router.get("/{{{resource}_id}}", response_model=dict)
async def get_{resource}(
    {resource}_id: str,
    user: dict = Depends(get_current_user)
):
    {resource} = await get_{resource}_by_id({resource}_id, user["sub"])

    return {
        "data": {Resource}Response.model_validate({resource}).model_dump(),
        "meta": {
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    }

@router.put("/{{{resource}_id}}", response_model=dict)
async def update_{resource}(
    {resource}_id: str,
    data: {Resource}Update,  # Partial update validation
    user: dict = Depends(get_current_user)
):
    # Only update fields that were provided (exclude_unset=True)
    update_data = data.model_dump(exclude_unset=True)

    updated_{resource} = await update_{resource}_fields({resource}_id, user["sub"], update_data)

    return {
        "data": {Resource}Response.model_validate(updated_{resource}).model_dump(),
        "meta": {
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    }
"""


# ============================================================================
# VALIDATION PATTERNS REFERENCE
# ============================================================================

"""
Common Field Validations:

1. String Length:
   - min_length=1 (not empty)
   - max_length=255 (standard text field)
   - max_length=1000 (long text)

2. Numeric Range:
   - ge=0 (greater than or equal)
   - le=100 (less than or equal)
   - gt=0 (greater than, exclusive)

3. Pattern Matching:
   - pattern="^[a-zA-Z0-9_]+$" (alphanumeric + underscore)
   - pattern="^\\d{4}-\\d{2}-\\d{2}$" (date format YYYY-MM-DD)
   - Email: from pydantic import EmailStr

4. Custom Validators:
   - @field_validator('field_name')
   - Can access other fields: @field_validator('field2', mode='after')
   - Can validate multiple fields: @model_validator(mode='after')

5. Optional vs Required:
   - Required: field: str = Field(...)
   - Optional: field: Optional[str] = Field(None)
   - With default: field: str = Field(default="default_value")

6. Lists/Arrays:
   - Bounded: tags: List[str] = Field(max_length=10)
   - Empty list default: Field(default_factory=list)

7. Nested Models:
   - Use other Pydantic models as field types
   - Example: subtasks: List[SubtaskResponse]
"""

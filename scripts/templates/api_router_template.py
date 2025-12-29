"""
API Router Template for Weave Backend
Story 1.5.2: Backend API/Model Standardization

This template provides standardized patterns for creating new FastAPI routers.
Replace {resource}, {resources}, {Resource} placeholders with your resource name.

Example:
- {resource} = goal
- {resources} = goals
- {Resource} = Goal

Usage:
1. Copy this template to app/api/{resources}/router.py
2. Replace all {placeholders} with your resource name
3. Update Epic/Story references in docstrings
4. Implement TODO sections with actual logic
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime
import logging

# Import auth middleware (Story 0.3)
from app.core.deps import get_current_user

# Import Pydantic schemas (create these in app/schemas/{resource}.py)
# from app.schemas.{resource} import {Resource}Create, {Resource}Update, {Resource}Response

# Import database models (if using SQLAlchemy)
# from app.models.{resource} import {Resource}

# Import error utilities
# from app.core.errors import format_error_response, AppException

logger = logging.getLogger(__name__)

# Router configuration
router = APIRouter(
    prefix="/api/{resources}",
    tags=["{resources}"]
)


# ============================================================================
# LIST ENDPOINT - GET /api/{resources}
# ============================================================================

@router.get("/", response_model=dict)
async def list_{resources}(
    user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    # Add additional query params for filtering
    # status: Optional[str] = Query(None, description="Filter by status")
):
    """
    List user's {resources} with pagination and optional filtering

    Epic X, Story X.X: [Story Name]

    Returns:
        {
            "data": [{...}],
            "meta": {
                "total": 100,
                "page": 1,
                "per_page": 20,
                "timestamp": "2025-12-23T10:00:00Z"
            }
        }
    """
    try:
        # Extract user ID from JWT token
        auth_user_id = user["sub"]

        # TODO: Implement list logic
        # 1. Query database with pagination
        # 2. Apply filters if provided
        # 3. Format response with data + meta

        # Placeholder implementation - returns 501 until implemented
        raise HTTPException(
            status_code=501,
            detail={
                "error": "NOT_IMPLEMENTED",
                "message": "This endpoint has not been developed",
                "epic": "Epic X: [Epic Name]",
                "story": "Story X.X: [Story Name]"
            }
        )

        # Example implementation:
        # {resources} = await get_{resources}_for_user(
        #     user_id=auth_user_id,
        #     page=page,
        #     per_page=per_page,
        #     status=status
        # )
        #
        # return {
        #     "data": [{resource}.dict() for {resource} in {resources}],
        #     "meta": {
        #         "total": total_count,
        #         "page": page,
        #         "per_page": per_page,
        #         "timestamp": datetime.utcnow().isoformat() + "Z"
        #     }
        # }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing {resources} for user {auth_user_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "retryable": True
            }
        )


# ============================================================================
# GET BY ID ENDPOINT - GET /api/{resources}/{id}
# ============================================================================

@router.get("/{{{resource}_id}}", response_model=dict)
async def get_{resource}(
    {resource}_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Get {resource} details by ID

    Epic X, Story X.X: [Story Name]

    Returns:
        {
            "data": {...},
            "meta": {
                "timestamp": "2025-12-23T10:00:00Z"
            }
        }
    """
    try:
        auth_user_id = user["sub"]

        # TODO: Implement get by ID logic
        # 1. Query database for {resource} by ID
        # 2. Verify ownership (user_id matches auth_user_id)
        # 3. Return 404 if not found
        # 4. Format response with data + meta

        # Placeholder implementation
        raise HTTPException(
            status_code=501,
            detail={
                "error": "NOT_IMPLEMENTED",
                "message": "This endpoint has not been developed",
                "epic": "Epic X: [Epic Name]",
                "story": "Story X.X: [Story Name]"
            }
        )

        # Example implementation:
        # {resource} = await get_{resource}_by_id({resource}_id, auth_user_id)
        #
        # if not {resource}:
        #     raise HTTPException(
        #         status_code=404,
        #         detail={
        #             "error": "NOT_FOUND",
        #             "message": f"{Resource} with ID {{resource}_id}} not found",
        #             "retryable": False
        #         }
        #     )
        #
        # return {
        #     "data": {resource}.dict(),
        #     "meta": {
        #         "timestamp": datetime.utcnow().isoformat() + "Z"
        #     }
        # }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting {resource} {{{resource}_id}} for user {auth_user_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "retryable": True
            }
        )


# ============================================================================
# CREATE ENDPOINT - POST /api/{resources}
# ============================================================================

@router.post("/", status_code=201, response_model=dict)
async def create_{resource}(
    # data: {Resource}Create,  # Uncomment when schema created
    user: dict = Depends(get_current_user)
):
    """
    Create new {resource}

    Epic X, Story X.X: [Story Name]

    Request Body:
        {
            "field1": "value1",
            "field2": "value2"
        }

    Returns:
        {
            "data": {...},
            "meta": {
                "timestamp": "2025-12-23T10:00:00Z"
            }
        }
    """
    try:
        auth_user_id = user["sub"]

        # TODO: Implement create logic
        # 1. Validate request data (Pydantic handles this)
        # 2. Check business rules (e.g., max active goals limit)
        # 3. Create database record
        # 4. Return created resource with 201 status

        # Placeholder implementation
        raise HTTPException(
            status_code=501,
            detail={
                "error": "NOT_IMPLEMENTED",
                "message": "This endpoint has not been developed",
                "epic": "Epic X: [Epic Name]",
                "story": "Story X.X: [Story Name]"
            }
        )

        # Example implementation:
        # new_{resource} = await create_{resource}_for_user(
        #     user_id=auth_user_id,
        #     data=data
        # )
        #
        # return {
        #     "data": new_{resource}.dict(),
        #     "meta": {
        #         "timestamp": datetime.utcnow().isoformat() + "Z"
        #     }
        # }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating {resource} for user {auth_user_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "retryable": True
            }
        )


# ============================================================================
# UPDATE ENDPOINT - PUT /api/{resources}/{id}
# ============================================================================

@router.put("/{{{resource}_id}}", response_model=dict)
async def update_{resource}(
    {resource}_id: str,
    # data: {Resource}Update,  # Uncomment when schema created
    user: dict = Depends(get_current_user)
):
    """
    Update existing {resource} (partial updates supported)

    Epic X, Story X.X: [Story Name]

    Request Body (all fields optional):
        {
            "field1": "new_value1",
            "field2": "new_value2"
        }

    Returns:
        {
            "data": {...},
            "meta": {
                "timestamp": "2025-12-23T10:00:00Z"
            }
        }
    """
    try:
        auth_user_id = user["sub"]

        # TODO: Implement update logic
        # 1. Verify {resource} exists and user owns it
        # 2. Apply partial updates (only provided fields)
        # 3. Save changes to database
        # 4. Return updated resource

        # Placeholder implementation
        raise HTTPException(
            status_code=501,
            detail={
                "error": "NOT_IMPLEMENTED",
                "message": "This endpoint has not been developed",
                "epic": "Epic X: [Epic Name]",
                "story": "Story X.X: [Story Name]"
            }
        )

        # Example implementation:
        # {resource} = await get_{resource}_by_id({resource}_id, auth_user_id)
        #
        # if not {resource}:
        #     raise HTTPException(
        #         status_code=404,
        #         detail={
        #             "error": "NOT_FOUND",
        #             "message": f"{Resource} with ID {{resource}_id}} not found",
        #             "retryable": False
        #         }
        #     )
        #
        # updated_{resource} = await update_{resource}_fields(
        #     {resource},
        #     data.dict(exclude_unset=True)  # Only update provided fields
        # )
        #
        # return {
        #     "data": updated_{resource}.dict(),
        #     "meta": {
        #         "timestamp": datetime.utcnow().isoformat() + "Z"
        #     }
        # }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating {resource} {{{resource}_id}} for user {auth_user_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "retryable": True
            }
        )


# ============================================================================
# SOFT DELETE ENDPOINT - DELETE /api/{resources}/{id}
# ============================================================================

@router.delete("/{{{resource}_id}}", response_model=dict)
async def delete_{resource}(
    {resource}_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Soft delete {resource} (sets deleted_at timestamp)

    Epic X, Story X.X: [Story Name]

    Returns:
        {
            "data": {"deleted": true, "id": "..."},
            "meta": {
                "timestamp": "2025-12-23T10:00:00Z"
            }
        }
    """
    try:
        auth_user_id = user["sub"]

        # TODO: Implement soft delete logic
        # 1. Verify {resource} exists and user owns it
        # 2. Set deleted_at timestamp (soft delete)
        # 3. Return success confirmation

        # Placeholder implementation
        raise HTTPException(
            status_code=501,
            detail={
                "error": "NOT_IMPLEMENTED",
                "message": "This endpoint has not been developed",
                "epic": "Epic X: [Epic Name]",
                "story": "Story X.X: [Story Name]"
            }
        )

        # Example implementation:
        # {resource} = await get_{resource}_by_id({resource}_id, auth_user_id)
        #
        # if not {resource}:
        #     raise HTTPException(
        #         status_code=404,
        #         detail={
        #             "error": "NOT_FOUND",
        #             "message": f"{Resource} with ID {{resource}_id}} not found",
        #             "retryable": False
        #         }
        #     )
        #
        # await soft_delete_{resource}({resource})
        #
        # return {
        #     "data": {
        #         "deleted": True,
        #         "id": {resource}_id
        #     },
        #     "meta": {
        #         "timestamp": datetime.utcnow().isoformat() + "Z"
        #     }
        # }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting {resource} {{{resource}_id}} for user {auth_user_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "retryable": True
            }
        )


# ============================================================================
# ADDITIONAL ENDPOINTS (EXAMPLES)
# ============================================================================

# Example: Archive endpoint (common pattern)
# @router.put("/{{{resource}_id}}/archive", response_model=dict)
# async def archive_{resource}(
#     {resource}_id: str,
#     user: dict = Depends(get_current_user)
# ):
#     """Archive {resource} (set is_archived=True)"""
#     pass


# Example: Custom action endpoint
# @router.post("/{{{resource}_id}}/action", response_model=dict)
# async def perform_action(
#     {resource}_id: str,
#     user: dict = Depends(get_current_user)
# ):
#     """Perform custom action on {resource}"""
#     pass


# ============================================================================
# STANDARD RESPONSE FORMATS (REFERENCE)
# ============================================================================

"""
Success Response (single item):
{
    "data": {
        "id": "uuid",
        "field1": "value1",
        "created_at": "2025-12-23T10:00:00Z"
    },
    "meta": {
        "timestamp": "2025-12-23T10:00:00Z"
    }
}

Success Response (list):
{
    "data": [
        {"id": "uuid1", ...},
        {"id": "uuid2", ...}
    ],
    "meta": {
        "total": 100,
        "page": 1,
        "per_page": 20,
        "timestamp": "2025-12-23T10:00:00Z"
    }
}

Error Response:
{
    "error": "ERROR_CODE",
    "message": "Human-readable error message",
    "retryable": false
}

Standard Error Codes:
- VALIDATION_ERROR (400): Invalid input data
- NOT_FOUND (404): Resource not found
- UNAUTHORIZED (401): Missing/invalid auth
- FORBIDDEN (403): Insufficient permissions
- RATE_LIMIT_EXCEEDED (429): Too many requests
- INTERNAL_ERROR (500): Server error
- NOT_IMPLEMENTED (501): Endpoint stub
"""


# ============================================================================
# HTTP STATUS CODE REFERENCE
# ============================================================================

"""
200 OK - Successful GET/PUT/DELETE
201 Created - Successful POST (resource created)
400 Bad Request - Validation error
401 Unauthorized - Missing/invalid JWT token
403 Forbidden - User doesn't own resource
404 Not Found - Resource doesn't exist
429 Too Many Requests - Rate limit exceeded
500 Internal Server Error - Unexpected error
501 Not Implemented - Endpoint stub (placeholder)
"""

"""
Goal Memories API Router

Handles CRUD operations for goal memories (photos associated with goals)
"""

from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import Client

from app.core.deps import get_current_user, get_supabase_client

router = APIRouter()


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================


class MemoryCreate(BaseModel):
    """Request model for creating a memory"""

    image_url: str
    storage_path: str


class MemoryResponse(BaseModel):
    """Response model for a single memory"""

    id: str
    goal_id: str
    user_id: str
    image_url: str
    storage_path: str
    created_at: datetime


class MemoriesListResponse(BaseModel):
    """Response model for list of memories"""

    data: List[MemoryResponse]
    meta: dict


class MemoryDetailResponse(BaseModel):
    """Response model for single memory detail"""

    data: MemoryResponse
    meta: dict


# ============================================================================
# API ENDPOINTS
# ============================================================================


@router.get("/goals/{goal_id}/memories", response_model=MemoriesListResponse)
async def get_goal_memories(
    goal_id: str,
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Fetch all memories for a specific goal

    **Auth:** Required (JWT)

    **Returns:**
    - 200: List of memories
    - 401: Unauthorized
    - 404: Goal not found
    """

    # Get user profile ID
    auth_user_id = user.get("sub")
    if not auth_user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user_profile = (
        supabase.table("user_profiles")
        .select("id")
        .eq("auth_user_id", auth_user_id)
        .single()
        .execute()
    )

    if not user_profile.data:
        raise HTTPException(status_code=404, detail="User profile not found")

    user_profile_id = user_profile.data["id"]

    # Verify goal belongs to user
    goal = (
        supabase.table("goals")
        .select("id")
        .eq("id", goal_id)
        .eq("user_id", user_profile_id)
        .single()
        .execute()
    )

    if not goal.data:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Fetch memories
    memories = (
        supabase.table("goal_memories")
        .select("*")
        .eq("goal_id", goal_id)
        .order("created_at", desc=True)
        .execute()
    )

    return {
        "data": memories.data or [],
        "meta": {"timestamp": datetime.utcnow().isoformat(), "total": len(memories.data or [])},
    }


@router.post("/goals/{goal_id}/memories", response_model=MemoryDetailResponse)
async def create_memory(
    goal_id: str,
    memory_data: MemoryCreate,
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Create a new memory for a goal

    **Auth:** Required (JWT)

    **Request Body:**
    - image_url: Public URL to the uploaded image
    - storage_path: Storage path in format `{goal_id}/{filename}`

    **Returns:**
    - 201: Memory created successfully
    - 400: Invalid request (max 10 memories per goal)
    - 401: Unauthorized
    - 404: Goal not found
    """

    # Get user profile ID
    auth_user_id = user.get("sub")
    if not auth_user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user_profile = (
        supabase.table("user_profiles")
        .select("id")
        .eq("auth_user_id", auth_user_id)
        .single()
        .execute()
    )

    if not user_profile.data:
        raise HTTPException(status_code=404, detail="User profile not found")

    user_profile_id = user_profile.data["id"]

    # Verify goal belongs to user
    goal = (
        supabase.table("goals")
        .select("id")
        .eq("id", goal_id)
        .eq("user_id", user_profile_id)
        .single()
        .execute()
    )

    if not goal.data:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Check memory limit (max 10 per goal)
    existing_memories = (
        supabase.table("goal_memories").select("id", count="exact").eq("goal_id", goal_id).execute()
    )

    if existing_memories.count >= 10:
        raise HTTPException(
            status_code=400, detail="Maximum 10 memories per goal. Delete some to add more."
        )

    # Create memory record
    memory = (
        supabase.table("goal_memories")
        .insert(
            {
                "goal_id": goal_id,
                "user_id": user_profile_id,
                "image_url": memory_data.image_url,
                "storage_path": memory_data.storage_path,
            }
        )
        .execute()
    )

    if not memory.data:
        raise HTTPException(status_code=500, detail="Failed to create memory")

    return {
        "data": memory.data[0],
        "meta": {"timestamp": datetime.utcnow().isoformat()},
    }


@router.delete("/goals/{goal_id}/memories/{memory_id}")
async def delete_memory(
    goal_id: str,
    memory_id: str,
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Delete a memory

    **Auth:** Required (JWT)

    **Returns:**
    - 200: Memory deleted successfully
    - 401: Unauthorized
    - 404: Memory not found
    """

    # Get user profile ID
    auth_user_id = user.get("sub")
    if not auth_user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user_profile = (
        supabase.table("user_profiles")
        .select("id")
        .eq("auth_user_id", auth_user_id)
        .single()
        .execute()
    )

    if not user_profile.data:
        raise HTTPException(status_code=404, detail="User profile not found")

    user_profile_id = user_profile.data["id"]

    # Get memory to verify ownership and get storage path
    memory = (
        supabase.table("goal_memories")
        .select("*")
        .eq("id", memory_id)
        .eq("goal_id", goal_id)
        .eq("user_id", user_profile_id)
        .single()
        .execute()
    )

    if not memory.data:
        raise HTTPException(status_code=404, detail="Memory not found")

    # Delete from storage
    try:
        supabase.storage.from_("goal-memories").remove([memory.data["storage_path"]])
    except Exception as e:
        # Log error but don't fail if storage delete fails
        print(f"Warning: Failed to delete storage file: {e}")

    # Delete from database
    supabase.table("goal_memories").delete().eq("id", memory_id).execute()

    return {
        "data": {"success": True},
        "meta": {"timestamp": datetime.utcnow().isoformat()},
    }

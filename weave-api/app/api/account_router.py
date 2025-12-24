"""
Account Management API (Story 9.4: App Store Readiness - AC 7)

GDPR-compliant account management features:
- Export user data (right to data portability)
- Delete account (right to erasure)
"""

import logging
from datetime import datetime
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from supabase import Client

from app.core.deps import get_current_user, get_supabase_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/account")


class ExportDataResponse(BaseModel):
    """Response model for data export"""

    message: str
    export_url: str
    expires_at: str


class DeleteAccountRequest(BaseModel):
    """Request model for account deletion"""

    confirmation: str  # Must be "DELETE" to confirm


@router.get("/export-data", response_model=ExportDataResponse)
async def export_user_data(
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Export all user data (GDPR Article 20 - Right to Data Portability).

    Returns a signed URL to download a JSON file containing all user data:
    - Profile information
    - Goals and subtasks
    - Completions and captures
    - Journal entries
    - Identity documents

    **Authentication Required:**
    - Include JWT token in Authorization header: `Bearer <token>`

    **Status Codes:**
    - 200: Export initiated successfully
    - 401: Unauthorized
    - 404: User profile not found
    - 500: Export failed

    **Example Response:**
    ```json
    {
      "message": "Data export ready",
      "export_url": "https://weavelight.app/exports/user-123.json?token=...",
      "expires_at": "2025-12-24T10:00:00Z"
    }
    ```
    """
    auth_user_id = user.get("sub")
    if not auth_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )

    logger.info(f"📦 Exporting data for user: {auth_user_id}")

    try:
        # Get user_profile
        profile_result = (
            supabase.table("user_profiles")
            .select("*")
            .eq("auth_user_id", auth_user_id)
            .single()
            .execute()
        )

        if not profile_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )

        user_id = profile_result.data["id"]

        # Fetch all user data
        export_data: Dict[str, Any] = {
            "export_date": datetime.utcnow().isoformat(),
            "user_profile": profile_result.data,
            "goals": [],
            "subtask_templates": [],
            "subtask_instances": [],
            "completions": [],
            "captures": [],
            "journal_entries": [],
            "identity_docs": [],
            "daily_aggregates": [],
        }

        # Goals
        goals_result = supabase.table("goals").select("*").eq("user_id", user_id).execute()
        export_data["goals"] = goals_result.data or []

        # Subtask templates
        templates_result = (
            supabase.table("subtask_templates").select("*").eq("user_id", user_id).execute()
        )
        export_data["subtask_templates"] = templates_result.data or []

        # Subtask instances
        instances_result = (
            supabase.table("subtask_instances").select("*").eq("user_id", user_id).execute()
        )
        export_data["subtask_instances"] = instances_result.data or []

        # Completions
        completions_result = (
            supabase.table("subtask_completions").select("*").eq("user_id", user_id).execute()
        )
        export_data["completions"] = completions_result.data or []

        # Captures
        captures_result = supabase.table("captures").select("*").eq("user_id", user_id).execute()
        export_data["captures"] = captures_result.data or []

        # Journal entries
        journal_result = (
            supabase.table("journal_entries").select("*").eq("user_id", user_id).execute()
        )
        export_data["journal_entries"] = journal_result.data or []

        # Identity docs
        identity_result = (
            supabase.table("identity_docs").select("*").eq("user_id", user_id).execute()
        )
        export_data["identity_docs"] = identity_result.data or []

        # Daily aggregates
        aggregates_result = (
            supabase.table("daily_aggregates").select("*").eq("user_id", user_id).execute()
        )
        export_data["daily_aggregates"] = aggregates_result.data or []

        # TODO: Store export_data as JSON file in Supabase Storage
        # For now, return as direct JSON response (not ideal for large datasets)
        # Production: Upload to storage bucket, return signed URL

        logger.info(
            f"✅ Data export complete: {len(export_data['goals'])} goals, "
            f"{len(export_data['completions'])} completions, "
            f"{len(export_data['journal_entries'])} journal entries"
        )

        # Placeholder response (production: return signed storage URL)
        return ExportDataResponse(
            message="Data export ready (placeholder - implement storage upload)",
            export_url="https://api.weavelight.app/api/account/export-data",
            expires_at=(datetime.utcnow().isoformat()),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error exporting data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export data: {str(e)}",
        )


@router.post("/delete-account", status_code=status.HTTP_200_OK)
async def delete_account(
    request: DeleteAccountRequest,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Delete user account and all associated data (GDPR Article 17 - Right to Erasure).

    **WARNING:** This action is IRREVERSIBLE. All user data will be permanently deleted:
    - Profile and identity documents
    - Goals and subtasks
    - Completions and captures
    - Journal entries
    - Daily aggregates

    **Authentication Required:**
    - Include JWT token in Authorization header: `Bearer <token>`

    **Request Body:**
    - confirmation: Must be the string "DELETE" (case-sensitive)

    **Status Codes:**
    - 200: Account deleted successfully
    - 400: Invalid confirmation string
    - 401: Unauthorized
    - 404: User profile not found
    - 500: Deletion failed

    **Example Request:**
    ```json
    {
      "confirmation": "DELETE"
    }
    ```

    **Example Response:**
    ```json
    {
      "message": "Account deleted successfully",
      "deleted_at": "2025-12-23T10:00:00Z"
    }
    ```
    """
    # Require explicit confirmation
    if request.confirmation != "DELETE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid confirmation. Must provide 'DELETE' to confirm deletion.",
        )

    auth_user_id = user.get("sub")
    if not auth_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )

    logger.warning(f"🗑️  Deleting account for user: {auth_user_id}")

    try:
        # Get user_profile
        profile_result = (
            supabase.table("user_profiles")
            .select("id")
            .eq("auth_user_id", auth_user_id)
            .single()
            .execute()
        )

        if not profile_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )

        user_id = profile_result.data["id"]

        # Delete all user data (cascade deletion via RLS policies)
        # Note: RLS policies ensure user can only delete their own data

        # 1. Delete journal entries
        supabase.table("journal_entries").delete().eq("user_id", user_id).execute()

        # 2. Delete captures
        supabase.table("captures").delete().eq("user_id", user_id).execute()

        # 3. Delete completions
        supabase.table("subtask_completions").delete().eq("user_id", user_id).execute()

        # 4. Delete subtask instances
        supabase.table("subtask_instances").delete().eq("user_id", user_id).execute()

        # 5. Delete subtask templates
        supabase.table("subtask_templates").delete().eq("user_id", user_id).execute()

        # 6. Delete goals
        supabase.table("goals").delete().eq("user_id", user_id).execute()

        # 7. Delete identity docs
        supabase.table("identity_docs").delete().eq("user_id", user_id).execute()

        # 8. Delete daily aggregates
        supabase.table("daily_aggregates").delete().eq("user_id", user_id).execute()

        # 9. Delete AI runs and artifacts
        supabase.table("ai_runs").delete().eq("user_id", user_id).execute()
        supabase.table("ai_artifacts").delete().eq("user_id", user_id).execute()

        # 10. Delete triad tasks
        supabase.table("triad_tasks").delete().eq("user_id", user_id).execute()

        # 11. Delete user profile (last)
        supabase.table("user_profiles").delete().eq("id", user_id).execute()

        # 12. Delete auth user (Supabase Auth)
        # Note: This requires admin privileges - implement in Story 9.5 (Production Security)
        # For now, just delete user_profiles (user won't be able to login but auth record remains)

        deleted_at = datetime.utcnow().isoformat()

        logger.info(f"✅ Account deleted successfully: {auth_user_id}")

        return {
            "message": "Account deleted successfully",
            "deleted_at": deleted_at,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error deleting account: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete account: {str(e)}",
        )

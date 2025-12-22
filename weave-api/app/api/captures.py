"""
Captures API - Image upload, retrieval, deletion, and AI analysis

Story: 0.9 - AI-Powered Image Service

Endpoints:
- POST /api/captures/upload - Upload image with optional AI analysis
- GET /api/captures/images - List user's images with filters
- GET /api/captures/images/{image_id} - Get single image details
- DELETE /api/captures/images/{image_id} - Delete image (Storage + DB)
- POST /api/captures/analyze/{image_id} - Retry AI analysis
- GET /api/captures/usage - Get current upload usage
"""

import io
import logging
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from PIL import Image
from supabase import Client

from app.core.config import settings
from app.core.deps import get_current_user, get_supabase_client
from app.middleware.rate_limit import (
    RateLimitExceeded,
    check_ai_vision_rate_limit,
    check_upload_rate_limit,
    get_upload_usage,
    increment_ai_vision_usage,
    increment_upload_usage,
)
from app.services.images import (
    GeminiVisionProvider,
    OpenAIVisionProvider,
    VisionService,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/captures", tags=["captures"])


# Initialize vision service
_vision_service = None


def get_vision_service() -> VisionService:
    """Get or create vision service singleton"""
    global _vision_service
    if _vision_service is None:
        gemini = GeminiVisionProvider(api_key=settings.GOOGLE_AI_API_KEY or None)
        openai = OpenAIVisionProvider(api_key=settings.OPENAI_API_KEY or None)
        _vision_service = VisionService(gemini, openai)
    return _vision_service


def get_user_profile(user: dict, supabase: Client) -> tuple[UUID, str]:
    """
    Get user profile ID and timezone from JWT payload.

    Converts auth_user_id (from JWT "sub" field) to user_profiles.id
    following the RLS pattern: auth.uid() → user_profiles.id lookup

    Args:
        user: JWT payload from get_current_user dependency
        supabase: Supabase client

    Returns:
        tuple: (profile_id, timezone)

    Raises:
        HTTPException: 404 if user profile not found
    """
    auth_user_id = user["sub"]  # Extract auth_user_id from JWT

    # Look up user_profiles.id from auth_user_id
    profile_response = (
        supabase.table("user_profiles")
        .select("id, timezone")
        .eq("auth_user_id", auth_user_id)
        .single()
        .execute()
    )

    if not profile_response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found. Please complete onboarding first.",
        )

    profile_id = UUID(profile_response.data["id"])
    timezone = profile_response.data.get("timezone", "UTC")

    return profile_id, timezone


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    subtask_instance_id: Optional[str] = Form(None),
    goal_id: Optional[str] = Form(None),
    local_date: str = Form(...),
    note: Optional[str] = Form(None),
    bind_description: Optional[str] = Form(None),
    run_ai_analysis: bool = Form(True),
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Upload image to Supabase Storage and create capture record

    Args:
        file: Image file (JPEG/PNG, max 10MB)
        subtask_instance_id: Optional bind ID for proof linkage
        goal_id: Optional goal ID for context
        local_date: User's local date (YYYY-MM-DD)
        note: Optional caption/note
        bind_description: Optional expected content for AI validation
        run_ai_analysis: Whether to run AI vision analysis (default: True)
        user: Authenticated user from JWT
        supabase: Supabase client

    Returns:
        {
            "data": {
                "id": UUID,
                "storage_key": str,
                "signed_url": str,
                "ai_analysis": dict | null
            },
            "meta": {"timestamp": ISO8601}
        }
    """
    try:
        # Get user profile ID and timezone (auth.uid() → user_profiles.id)
        user_id, user_timezone = get_user_profile(user, supabase)

        # Read file content
        file_content = await file.read()
        file_size_bytes = len(file_content)

        # Validate file size (10MB max, enforced at bucket level too)
        if file_size_bytes > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail={
                    "error": {
                        "code": "FILE_TOO_LARGE",
                        "message": "Image too large (max 10MB). Try compressing.",
                    }
                },
            )

        # Validate image format using Pillow
        try:
            img = Image.open(io.BytesIO(file_content))
            img.verify()

            # Check minimum dimensions (100x100px)
            if img.size[0] < 100 or img.size[1] < 100:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        "error": {
                            "code": "IMAGE_TOO_SMALL",
                            "message": "Image too small (min 100x100px).",
                        }
                    },
                )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": {
                        "code": "INVALID_IMAGE",
                        "message": f"Invalid image format: {str(e)}",
                    }
                },
            )

        # Check rate limits BEFORE upload
        await check_upload_rate_limit(
            supabase,
            user_id,
            file_size_bytes,
            user_timezone,
        )

        # Generate unique filename
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        filename = f"{user_id}/proof_{timestamp}.jpg"

        # Upload to Supabase Storage
        logger.info(f"📤 [UPLOAD START] filename={filename}, size={file_size_bytes}bytes, content_type={file.content_type}")

        try:
            # Supabase Python SDK expects raw bytes, NOT base64 string
            logger.info(f"☁️  [STORAGE] Uploading {file_size_bytes} bytes to captures/{filename}...")

            upload_response = supabase.storage.from_("captures").upload(
                path=filename,
                file=file_content,  # Pass raw bytes directly
                file_options={"content-type": file.content_type or "image/jpeg"},
            )
            logger.info(f"✅ [STORAGE] Upload successful: {upload_response}")
        except Exception as storage_err:
            logger.error(f"❌ [STORAGE FAIL] Error during upload: {storage_err}", exc_info=True)
            logger.error(f"❌ [STORAGE FAIL] Error type: {type(storage_err).__name__}")
            logger.error(f"❌ [STORAGE FAIL] Filename attempted: {filename}")
            logger.error(f"❌ [STORAGE FAIL] File size: {file_size_bytes} bytes")
            logger.error(f"❌ [STORAGE FAIL] Content type: {file.content_type}")
            raise

        if not upload_response:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "error": {
                        "code": "UPLOAD_FAILED",
                        "message": "Failed to upload image to storage",
                    }
                },
            )

        # Generate signed URL (1-hour expiration)
        signed_url = supabase.storage.from_("captures").create_signed_url(
            filename,
            expires_in=3600,  # 1 hour
        )["signedURL"]

        # Run AI vision analysis if requested and not rate limited
        ai_analysis = None
        if run_ai_analysis:
            try:
                await check_ai_vision_rate_limit(supabase, user_id, user_timezone)

                vision_service = get_vision_service()
                result, success = await vision_service.analyze_image(
                    file_content,
                    bind_description,
                    context={"goal_id": goal_id},
                )

                if success and result:
                    ai_analysis = result.to_dict()

                    # Log AI run for cost tracking
                    ai_run_log = result.to_ai_run_log(user_id, local_date)
                    supabase.table("ai_runs").insert(ai_run_log).execute()

                    # Increment AI vision usage
                    await increment_ai_vision_usage(supabase, user_id, local_date)

                    logger.info(f"✅ AI analysis complete: validation={result.validation_score}")
                else:
                    logger.warning("AI analysis failed, continuing without analysis")

            except RateLimitExceeded:
                logger.warning("AI vision rate limit exceeded, skipping analysis")
                # Continue without AI analysis
            except Exception as e:
                logger.error(f"AI analysis error: {e}", exc_info=True)
                # Continue without AI analysis - graceful degradation

        # Create capture record in database
        capture_record = {
            "user_id": str(user_id),
            "type": "photo",
            "storage_key": filename,
            "content_text": note,
            "goal_id": goal_id,
            "subtask_instance_id": subtask_instance_id,
            "local_date": local_date,
            "ai_analysis": ai_analysis,
            "ai_verified": ai_analysis["is_verified"] if ai_analysis else False,
            "ai_quality_score": ai_analysis["quality_score"] if ai_analysis else None,
        }

        db_response = supabase.table("captures").insert(capture_record).execute()

        if not db_response.data:
            # Cleanup: delete uploaded file if DB insert fails
            supabase.storage.from_("captures").remove([filename])
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "error": {
                        "code": "DB_INSERT_FAILED",
                        "message": "Failed to create capture record",
                    }
                },
            )

        # Increment upload usage (atomically)
        file_size_mb = file_size_bytes / (1024 * 1024)
        await increment_upload_usage(supabase, user_id, local_date, file_size_mb)

        capture = db_response.data[0]

        return {
            "data": {
                "id": capture["id"],
                "storage_key": filename,
                "signed_url": signed_url,
                "ai_analysis": ai_analysis,
                "ai_verified": capture["ai_verified"],
            },
            "meta": {"timestamp": datetime.now(timezone.utc).isoformat()},
        }

    except RateLimitExceeded:
        raise  # Re-raise rate limit errors as-is
    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        logger.error(f"Upload error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": {
                    "code": "UPLOAD_ERROR",
                    "message": f"Upload failed: {str(e)}",
                }
            },
        )


@router.get("/images")
async def list_images(
    goal_id: Optional[str] = Query(None),
    subtask_instance_id: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    List user's images with optional filters

    Query params:
        goal_id: Filter by goal
        subtask_instance_id: Filter by bind
        start_date: Filter from date (YYYY-MM-DD)
        end_date: Filter to date (YYYY-MM-DD)
        page: Page number (default: 1)
        per_page: Items per page (default: 20, max: 100)

    Returns:
        {
            "data": [
                {
                    "id": UUID,
                    "storage_key": str,
                    "signed_url": str,
                    "local_date": str,
                    "ai_verified": bool,
                    "ai_quality_score": int | null,
                    ...
                }
            ],
            "meta": {
                "total": int,
                "page": int,
                "per_page": int,
                "has_next": bool
            }
        }
    """
    try:
        # Get user profile ID (auth.uid() → user_profiles.id)
        user_id, _ = get_user_profile(user, supabase)

        # Build query
        query = (
            supabase.table("captures")
            .select("*", count="exact")
            .eq("user_id", str(user_id))
            .eq("type", "photo")
            .order("created_at", desc=True)
        )

        # Apply filters
        if goal_id:
            query = query.eq("goal_id", goal_id)
        if subtask_instance_id:
            query = query.eq("subtask_instance_id", subtask_instance_id)
        if start_date:
            query = query.gte("local_date", start_date)
        if end_date:
            query = query.lte("local_date", end_date)

        # Apply pagination
        offset = (page - 1) * per_page
        query = query.range(offset, offset + per_page - 1)

        response = query.execute()

        # Generate signed URLs for each image
        images = []
        for capture in response.data:
            signed_url = supabase.storage.from_("captures").create_signed_url(
                capture["storage_key"],
                expires_in=3600,
            )["signedURL"]

            images.append({
                **capture,
                "signed_url": signed_url,
            })

        total = response.count if response.count is not None else len(images)
        has_next = (page * per_page) < total

        return {
            "data": images,
            "meta": {
                "total": total,
                "page": page,
                "per_page": per_page,
                "has_next": has_next,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        }

    except Exception as e:
        logger.error(f"List images error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": {
                    "code": "LIST_ERROR",
                    "message": f"Failed to list images: {str(e)}",
                }
            },
        )


@router.delete("/images/{image_id}")
async def delete_image(
    image_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Delete image from Storage and Database

    Cascading cleanup:
    1. Verify user owns image
    2. Delete from Storage
    3. Delete from Database

    Returns:
        {"data": {"success": True}, "meta": {...}}
    """
    try:
        # Get user profile ID (auth.uid() → user_profiles.id)
        user_id, _ = get_user_profile(user, supabase)

        # Fetch capture record and verify ownership
        response = (
            supabase.table("captures")
            .select("*")
            .eq("id", image_id)
            .eq("user_id", str(user_id))
            .execute()
        )

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": {
                        "code": "IMAGE_NOT_FOUND",
                        "message": "Image not found or unauthorized",
                    }
                },
            )

        capture = response.data[0]
        storage_key = capture["storage_key"]

        # Delete from Storage
        logger.info(f"Deleting image from Storage: {storage_key}")
        supabase.storage.from_("captures").remove([storage_key])

        # Delete from Database
        supabase.table("captures").delete().eq("id", image_id).execute()

        return {
            "data": {"success": True},
            "meta": {"timestamp": datetime.now(timezone.utc).isoformat()},
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete image error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": {
                    "code": "DELETE_ERROR",
                    "message": f"Failed to delete image: {str(e)}",
                }
            },
        )


@router.get("/usage")
async def get_usage(
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Get current upload usage for user

    Returns:
        {
            "data": {
                "upload_count": int (0-5),
                "upload_size_mb": float (0-5.0),
                "ai_vision_count": int (0-5),
                "local_date": str
            },
            "meta": {...}
        }
    """
    try:
        # Get user profile ID and timezone (auth.uid() → user_profiles.id)
        user_id, user_timezone = get_user_profile(user, supabase)

        usage = await get_upload_usage(supabase, user_id, user_timezone)

        return {
            "data": usage,
            "meta": {"timestamp": datetime.now(timezone.utc).isoformat()},
        }

    except Exception as e:
        logger.error(f"Get usage error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": {
                    "code": "USAGE_ERROR",
                    "message": f"Failed to get usage: {str(e)}",
                }
            },
        )

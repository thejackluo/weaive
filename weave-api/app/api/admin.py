"""
Admin API - System monitoring and maintenance endpoints

Story: 0.9 - AI-Powered Image Service
"""

import logging
import time
from datetime import date, datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from supabase import Client

from app.core.deps import get_supabase_client
from app.services.context_builder import ContextBuilderService  # Story 6.2
from app.services.cost_monitor import check_daily_cost_threshold, get_daily_ai_cost

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/check-cost-threshold")
async def check_cost_threshold(
    target_date: Optional[str] = Query(
        None, description="Date to check (YYYY-MM-DD), defaults to today"
    ),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Check daily AI cost against thresholds and send alerts if exceeded

    Usage:
    - Cron job: `0 * * * * curl -X POST http://localhost:8000/api/admin/check-cost-threshold`
    - Manual: POST /api/admin/check-cost-threshold?target_date=2025-12-21

    Returns:
        {
            "data": {
                "alert_level": "WARNING" | "CRITICAL" | null,
                "cost_details": {...}
            }
        }
    """
    # Parse target date
    target_date_obj = date.fromisoformat(target_date) if target_date else None

    # Get cost details
    cost_details = await get_daily_ai_cost(supabase, target_date_obj)

    # Check thresholds and send alerts
    alert_level = await check_daily_cost_threshold(supabase, target_date_obj)

    return {
        "data": {
            "alert_level": alert_level,
            "cost_details": cost_details,
        }
    }


@router.get("/daily-cost")
async def get_daily_cost(
    target_date: Optional[str] = Query(
        None, description="Date to check (YYYY-MM-DD), defaults to today"
    ),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Get daily AI cost breakdown (read-only, no alerts)

    Returns:
        {
            "data": {
                "total_cost": 4.23,
                "gemini_cost": 2.10,
                "openai_cost": 2.13,
                "image_analyses": 150,
                "text_analyses": 0,
            }
        }
    """
    target_date_obj = date.fromisoformat(target_date) if target_date else None
    cost_details = await get_daily_ai_cost(supabase, target_date_obj)

    return {"data": cost_details}


@router.post("/reset-rate-limit/{user_id}")
async def reset_rate_limit(
    user_id: str,
    x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key"),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Reset rate limits for a user by clearing their daily_aggregates

    **Admin only** - requires X-Admin-Key header

    Usage:
        curl -X POST -H "X-Admin-Key: dev_admin_key" http://localhost:8000/api/admin/reset-rate-limit/user_123
    """
    # Verify admin key
    import os
    expected_admin_key = os.getenv('ADMIN_API_KEY', 'dev_admin_key')

    if not x_admin_key or x_admin_key != expected_admin_key:
        logger.warning(f"Unauthorized admin reset-rate-limit attempt for user {user_id}")
        raise HTTPException(status_code=401, detail="Unauthorized - invalid or missing X-Admin-Key header")

    logger.info(f"🔧 Admin resetting rate limits for user {user_id}")

    try:
        # Get today's date
        today = date.today().isoformat()

        # Delete today's daily_aggregates for this user
        result = supabase.table("daily_aggregates").delete().eq("user_id", user_id).eq("local_date", today).execute()

        logger.info(f"✅ Rate limits reset for user {user_id} (deleted {len(result.data)} records)")

        return {
            "data": {
                "user_id": user_id,
                "records_deleted": len(result.data),
                "date": today,
            },
            "meta": {
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        }

    except Exception as e:
        logger.error(f"Failed to reset rate limits for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Rate limit reset failed: {str(e)}")


@router.post("/upgrade-to-admin/{user_id}")
async def upgrade_to_admin(
    user_id: str,
    x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key"),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Upgrade a user account to admin tier (unlimited rate limits)

    **Admin only** - requires X-Admin-Key header

    Usage:
        curl -X POST -H "X-Admin-Key: dev_admin_key" http://localhost:8000/api/admin/upgrade-to-admin/user_123
    """
    # Verify admin key
    import os
    expected_admin_key = os.getenv('ADMIN_API_KEY', 'dev_admin_key')

    if not x_admin_key or x_admin_key != expected_admin_key:
        logger.warning(f"Unauthorized admin upgrade attempt for user {user_id}")
        raise HTTPException(status_code=401, detail="Unauthorized - invalid or missing X-Admin-Key header")

    logger.info(f"🔧 Admin upgrading user {user_id} to admin tier")

    try:
        # Update user_profiles subscription_tier to 'admin'
        result = supabase.table("user_profiles").update({"subscription_tier": "admin"}).eq("id", user_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")

        logger.info(f"✅ User {user_id} upgraded to admin tier")

        return {
            "data": {
                "user_id": user_id,
                "subscription_tier": "admin",
                "updated_at": result.data[0].get("updated_at"),
            },
            "meta": {
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to upgrade user {user_id} to admin: {e}")
        raise HTTPException(status_code=500, detail=f"Admin upgrade failed: {str(e)}")


@router.get("/context-preview/{user_id}")
async def preview_user_context(
    user_id: str,
    x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key"),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Preview assembled user context for debugging (Story 6.2)

    **Admin only** - requires X-Admin-Key header

    Returns:
        {
            "data": {
                "context": {
                    "user_id": "uuid",
                    "goals": [...],
                    "recent_activity": {...},
                    "journal": [...],
                    "identity": {...},
                    "metrics": {...},
                    "recent_wins": [...]
                },
                "assembly_time_ms": 287
            },
            "meta": {
                "timestamp": "2025-12-23T10:00:00Z"
            }
        }

    Usage:
        curl -H "X-Admin-Key: your_key" http://localhost:8000/api/admin/context-preview/user_123
    """
    # Verify admin key (basic auth for MVP - upgrade to proper auth later)
    import os
    expected_admin_key = os.getenv('ADMIN_API_KEY', 'dev_admin_key')

    if not x_admin_key or x_admin_key != expected_admin_key:
        logger.warning(f"Unauthorized admin access attempt for user {user_id}")
        raise HTTPException(status_code=401, detail="Unauthorized - invalid or missing X-Admin-Key header")

    logger.info(f"Admin context preview request for user {user_id}")

    # Build context
    start_time = time.time()
    context_builder = ContextBuilderService(supabase)

    try:
        context = await context_builder.build_context(user_id)
        assembly_time_ms = int((time.time() - start_time) * 1000)

        if context is None:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found or context building failed")

        logger.info(f"Context preview assembled in {assembly_time_ms}ms for user {user_id}")

        return {
            "data": {
                "context": context,
                "assembly_time_ms": assembly_time_ms,
            },
            "meta": {
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        }

    except Exception as e:
        logger.error(f"Failed to build context for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Context building failed: {str(e)}")

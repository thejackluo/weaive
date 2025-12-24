"""
Admin API - System monitoring and maintenance endpoints

Story: 0.9 - AI-Powered Image Service
"""

import logging
import time
from datetime import date, datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Header, Query
from supabase import Client

from app.core.deps import get_supabase_client
from app.services.context_builder import ContextBuilderService  # Story 6.2
from app.services.cost_monitor import check_daily_cost_threshold, get_daily_ai_cost

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/check-cost-threshold")
async def check_cost_threshold(
    target_date: Optional[str] = Query(None, description="Date to check (YYYY-MM-DD), defaults to today"),
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
    target_date: Optional[str] = Query(None, description="Date to check (YYYY-MM-DD), defaults to today"),
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

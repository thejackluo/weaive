"""
Admin API - System monitoring and maintenance endpoints

Story: 0.9 - AI-Powered Image Service
"""

import logging
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from supabase import Client

from app.core.deps import get_supabase_client
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

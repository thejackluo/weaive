"""
Insights API Router (MVP AI Feature)

Provides AI-generated insights for dashboard and thread screens.
Uses ContextBuilderService + AIService with mvp_coach personality.

Endpoints:
- GET /api/insights/thread - Daily insights for thread home screen
- GET /api/insights/dashboard - Weekly summary for dashboard
"""

import logging
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.deps import get_current_user, get_supabase_client
from app.services.context_builder import ContextBuilderService
from app.services.insights.thread_insights_service import ThreadInsightsService
from supabase import Client as SupabaseClient

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/insights",
    tags=["insights"]
)


# ============================================================
# Response Models
# ============================================================


class ThreadInsightsResponse(BaseModel):
    """Thread insights response."""
    data: Dict
    meta: Dict


class DashboardInsightsResponse(BaseModel):
    """Dashboard insights response."""
    data: Dict
    meta: Dict


# ============================================================
# Thread Insights Endpoint
# ============================================================


@router.get("/thread", response_model=ThreadInsightsResponse)
async def get_thread_insights(
    current_user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_supabase_client)
):
    """
    Get daily insights for thread home screen.

    Returns:
        {
            data: {
                todays_focus: { id, title, reason },
                streak_status: { current_streak, milestone_proximity, message },
                pattern_insight: { pattern_type, description, suggestion },
                quick_win: { id, title, reason },
                ai_message: "sarcastic coach message",
                generated_at: "2025-12-31T10:00:00Z"
            },
            meta: { timestamp, cached }
        }

    **Caching:**
    - Cache for 1 hour (insights update as binds are completed)
    - Cache key: user_id + date + hour

    **Personality:**
    - Uses mvp_coach (sarcastic but supportive)
    - Adjusts tone based on streak status and completion rate

    **Performance:**
    - Target: <1s response time
    - Uses parallel queries in ContextBuilderService
    """
    try:
        user_id = current_user["sub"]  # JWT token uses "sub" field for user ID
        logger.info(f"Fetching thread insights for user {user_id}")

        # Build user context (parallel queries)
        context_builder = ContextBuilderService(db)
        context = await context_builder.build_context(user_id)

        # Generate thread insights
        insights_service = ThreadInsightsService(db)
        insights = await insights_service.generate_insights(user_id, context)

        return {
            "data": insights,
            "meta": {
                "timestamp": insights["generated_at"],
                "cached": False,  # TODO: Implement caching in future iteration
            }
        }

    except Exception as e:
        logger.error(f"Failed to get thread insights for user {current_user['sub']}: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "INSIGHTS_GENERATION_FAILED",
                "message": "Failed to generate thread insights. Please try again."
            }
        )


# ============================================================
# Dashboard Insights Endpoint (TODO)
# ============================================================


@router.get("/dashboard", response_model=DashboardInsightsResponse)
async def get_dashboard_insights(
    current_user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_supabase_client)
):
    """
    Get weekly summary insights for dashboard.

    **Status:** 🚧 NOT IMPLEMENTED - Planned for post-MVP

    **Planned Features:**
    - Weekly completion rate trend (up/down from last week)
    - Pattern detection (time-of-day, day-of-week preferences)
    - Biggest win this week (highest streak, most completions)
    - AI-generated encouragement based on personality

    **Caching Strategy (when implemented):**
    - Cache for 24 hours (weekly summary, updated daily)

    **Personality (when implemented):**
    - Uses mvp_coach (sarcastic but supportive)

    **Returns:**
    - 501 Not Implemented with clear message

    **Note:** Frontend should handle 501 gracefully and show placeholder UI
    """
    logger.info(f"Dashboard insights requested by user {current_user['sub']} but not yet implemented")

    raise HTTPException(
        status_code=501,
        detail={
            "error": "NOT_IMPLEMENTED",
            "message": "Dashboard insights are planned for post-MVP. Check back soon!"
        }
    )

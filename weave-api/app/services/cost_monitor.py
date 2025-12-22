"""
Cost Monitoring Service - Track AI spending and alert on thresholds

Story: 0.9 - AI-Powered Image Service
Budget: $90/month ($3/day) at 10K users
Free Tier: $0.15/day per user (5 image analyses at $0.03/ea)

Alerts:
- WARNING: $4/day (80% of budget)
- CRITICAL: $5/day (>100% of budget, emergency shutdown)
"""

import logging
import os
from datetime import date, datetime
from typing import Dict, Optional

import httpx
from supabase import Client

logger = logging.getLogger(__name__)

# Cost thresholds
DAILY_BUDGET_LIMIT = 3.00  # $3/day normal budget
WARNING_THRESHOLD = 4.00  # $4/day = 133% of budget
CRITICAL_THRESHOLD = 5.00  # $5/day = 166% of budget (emergency)

# Slack webhook URL (from environment)
SLACK_WEBHOOK_URL = os.getenv("SLACK_COST_ALERT_WEBHOOK_URL")


async def get_daily_ai_cost(
    supabase: Client,
    target_date: Optional[date] = None,
) -> Dict[str, float]:
    """
    Get total AI cost for a given date (all users combined)

    Args:
        supabase: Supabase client
        target_date: Date to check (defaults to today UTC)

    Returns:
        {
            "total_cost": 4.23,
            "gemini_cost": 2.10,
            "openai_cost": 2.13,
            "image_analyses": 150,
            "text_analyses": 0,
        }
    """
    if target_date is None:
        target_date = datetime.utcnow().date()

    # Query ai_runs table for all AI operations on this date
    response = (
        supabase.table("ai_runs")
        .select("operation, provider, total_cost")
        .gte("created_at", f"{target_date}T00:00:00Z")
        .lt("created_at", f"{target_date}T23:59:59Z")
        .execute()
    )

    if not response.data:
        return {
            "total_cost": 0.0,
            "gemini_cost": 0.0,
            "openai_cost": 0.0,
            "image_analyses": 0,
            "text_analyses": 0,
        }

    # Aggregate costs by provider and operation
    total_cost = 0.0
    gemini_cost = 0.0
    openai_cost = 0.0
    image_analyses = 0
    text_analyses = 0

    for run in response.data:
        cost = float(run.get("total_cost", 0))
        provider = run.get("provider", "")
        operation = run.get("operation", "")

        total_cost += cost

        if "gemini" in provider.lower():
            gemini_cost += cost
        elif "openai" in provider.lower() or "gpt" in provider.lower():
            openai_cost += cost

        if operation == "image_vision":
            image_analyses += 1
        elif operation in ["triad_generation", "journal_feedback", "onboarding"]:
            text_analyses += 1

    return {
        "total_cost": round(total_cost, 2),
        "gemini_cost": round(gemini_cost, 2),
        "openai_cost": round(openai_cost, 2),
        "image_analyses": image_analyses,
        "text_analyses": text_analyses,
    }


async def send_slack_alert(
    level: str,
    cost: float,
    threshold: float,
    details: Dict[str, float],
) -> bool:
    """
    Send cost alert to Slack webhook

    Args:
        level: "WARNING" or "CRITICAL"
        cost: Current daily cost
        threshold: Threshold exceeded
        details: Cost breakdown (gemini, openai, image_analyses, etc.)

    Returns:
        True if alert sent successfully
    """
    if not SLACK_WEBHOOK_URL:
        logger.warning("Slack webhook not configured. Skipping alert.")
        return False

    # Build alert message
    emoji = "⚠️" if level == "WARNING" else "🚨"
    color = "#ff9800" if level == "WARNING" else "#f44336"  # Orange or red

    message = {
        "attachments": [
            {
                "color": color,
                "blocks": [
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": f"{emoji} {level}: AI Cost Threshold Exceeded",
                        },
                    },
                    {
                        "type": "section",
                        "fields": [
                            {"type": "mrkdwn", "text": f"*Current Cost:*\n${cost:.2f}"},
                            {
                                "type": "mrkdwn",
                                "text": f"*Threshold:*\n${threshold:.2f}",
                            },
                            {
                                "type": "mrkdwn",
                                "text": f"*Budget:*\n${DAILY_BUDGET_LIMIT:.2f}/day",
                            },
                            {
                                "type": "mrkdwn",
                                "text": f"*Over Budget:*\n{((cost / DAILY_BUDGET_LIMIT - 1) * 100):.0f}%",
                            },
                        ],
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": (
                                "*Cost Breakdown:*\n"
                                f"• Gemini: ${details['gemini_cost']:.2f}\n"
                                f"• OpenAI: ${details['openai_cost']:.2f}\n"
                                f"• Image Analyses: {details['image_analyses']} calls\n"
                                f"• Text Analyses: {details['text_analyses']} calls"
                            ),
                        },
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": (
                                f"*Action Required:* {'Review usage patterns' if level == 'WARNING' else '🚨 EMERGENCY: Consider disabling AI features'}"
                            ),
                        },
                    },
                ],
            }
        ]
    }

    # Send webhook
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                SLACK_WEBHOOK_URL,
                json=message,
                timeout=10,
            )
            response.raise_for_status()
            logger.info(f"✅ Slack alert sent: {level} at ${cost:.2f}")
            return True
    except Exception as e:
        logger.error(f"Failed to send Slack alert: {e}")
        return False


async def check_daily_cost_threshold(
    supabase: Client,
    target_date: Optional[date] = None,
) -> Optional[str]:
    """
    Check if daily cost exceeds thresholds and send alerts

    Returns:
        Alert level sent ("WARNING", "CRITICAL", or None)
    """
    # Get daily cost breakdown
    details = await get_daily_ai_cost(supabase, target_date)
    cost = details["total_cost"]

    logger.info(
        f"💰 Daily AI cost: ${cost:.2f} (Gemini: ${details['gemini_cost']:.2f}, "
        f"OpenAI: ${details['openai_cost']:.2f}, Images: {details['image_analyses']})"
    )

    # Check thresholds
    if cost >= CRITICAL_THRESHOLD:
        logger.error(f"🚨 CRITICAL: Daily cost ${cost:.2f} exceeds ${CRITICAL_THRESHOLD:.2f}")
        await send_slack_alert("CRITICAL", cost, CRITICAL_THRESHOLD, details)
        return "CRITICAL"
    elif cost >= WARNING_THRESHOLD:
        logger.warning(f"⚠️ WARNING: Daily cost ${cost:.2f} exceeds ${WARNING_THRESHOLD:.2f}")
        await send_slack_alert("WARNING", cost, WARNING_THRESHOLD, details)
        return "WARNING"
    else:
        logger.debug(f"✅ Daily cost ${cost:.2f} within budget (${DAILY_BUDGET_LIMIT:.2f})")
        return None


# Example cron job usage (run every hour):
# 0 * * * * curl -X POST http://localhost:8000/api/admin/check-cost-threshold

"""
Tiered AI Rate Limiting (Story 6.1)

Enforces separate limits for premium vs free AI models.

Rate limits (FREE tier):
- Premium models (Claude Sonnet): 10 messages/day
- Free models (Haiku, GPT-4o-mini): 40 messages/day
- Total: 50 messages/day max
- Monthly cap: 500 messages/month

Rate limits (PRO tier):
- Monthly cap: 2,500-5,000 messages/month (5-10x free)

Rate limits (ADMIN tier):
- UNLIMITED (for testing, support)

Usage tracking:
- Uses counter columns in user_profiles (NOT ai_runs table)
- Counters reset at midnight user timezone (daily)
- Counters reset on 1st of month (monthly)
"""

import logging
from datetime import date, datetime
from enum import Enum
from typing import Dict

from fastapi import HTTPException
from supabase import Client as SupabaseClient

logger = logging.getLogger(__name__)


class ModelTier(str, Enum):
    """AI model tiers for rate limiting."""
    PREMIUM = "premium"  # Claude Sonnet (expensive, high quality)
    FREE = "free"  # Claude Haiku, GPT-4o-mini (cheap, fast)


class SubscriptionTier(str, Enum):
    """User subscription tiers."""
    FREE = "free"
    PRO = "pro"
    ADMIN = "admin"


class TieredRateLimiter:
    """
    Enforces tiered rate limits for AI generation (premium vs free models).

    Limits (FREE tier):
    - Premium models: 10/day
    - Free models: 40/day
    - Monthly cap: 500/month

    Limits (PRO tier):
    - Monthly cap: 2,500-5,000/month (5-10x free)

    Limits (ADMIN tier):
    - Unlimited

    Tracking:
    - Uses counter columns in user_profiles for O(1) lookups
    - Separate counters for premium vs free models
    - Monthly counter tracks total across all models
    """

    # Rate limit constants (FREE tier)
    FREE_PREMIUM_DAILY_LIMIT = 10
    FREE_FREE_DAILY_LIMIT = 40
    FREE_MONTHLY_LIMIT = 500

    # Rate limit constants (PRO tier)
    PRO_MONTHLY_LIMIT = 5000  # Can be 2500-5000 based on pro level

    def __init__(self, db: SupabaseClient):
        """
        Initialize tiered rate limiter.

        Args:
            db: Supabase client for querying user_profiles
        """
        self.db = db

    def check_rate_limit(
        self,
        user_id: str,
        model: str,
        subscription_tier: str = 'free',
        bypass_admin_key: bool = False
    ) -> None:
        """
        Check if user can make an AI call within their tiered rate limit.

        Args:
            user_id: User ID (user_profiles.id, NOT auth.uid)
            model: AI model identifier (e.g., 'claude-3-7-sonnet-20250219')
            subscription_tier: User subscription tier ('free', 'pro', 'admin')
            bypass_admin_key: True if request has valid X-Admin-Key header

        Raises:
            HTTPException 429: If rate limit exceeded
        """
        # Admin bypass (X-Admin-Key header)
        if bypass_admin_key or subscription_tier == 'admin':
            logger.debug(f"Admin bypass for user {user_id}: unlimited access")
            return

        # Determine model tier
        model_tier = self._get_model_tier(model)

        # Get user's current usage
        try:
            result = self.db.table('user_profiles') \
                .select('ai_premium_messages_today, ai_free_messages_today, ai_messages_this_month, ai_messages_month_reset, subscription_tier') \
                .eq('id', user_id) \
                .single() \
                .execute()

            user_data = result.data
            if not user_data:
                logger.error(f"User {user_id} not found in user_profiles")
                raise HTTPException(status_code=404, detail={
                    "code": "USER_NOT_FOUND",
                    "message": "User profile not found"
                })

            premium_used = user_data.get('ai_premium_messages_today', 0)
            free_used = user_data.get('ai_free_messages_today', 0)
            monthly_used = user_data.get('ai_messages_this_month', 0)
            monthly_reset_date = user_data.get('ai_messages_month_reset')
            actual_tier = user_data.get('subscription_tier', subscription_tier)

        except HTTPException:
            raise  # Re-raise HTTP exceptions
        except Exception as e:
            logger.error(f"Error fetching user {user_id} usage: {e}")
            # Fail open (don't block users on database errors)
            return

        # Check if monthly counter needs reset (1st of month)
        if monthly_reset_date:
            reset_date = date.fromisoformat(monthly_reset_date) if isinstance(monthly_reset_date, str) else monthly_reset_date
            if datetime.now().date().day == 1 and reset_date < datetime.now().date():
                logger.info(f"Monthly counter needs reset for user {user_id}")
                # Reset will be handled by cron job, but don't block user

        # Check monthly cap first
        monthly_limit = self._get_monthly_limit(actual_tier)
        if monthly_used >= monthly_limit:
            reset_date = self._get_next_month_start()
            logger.warning(f"⚠️  User {user_id} exceeded monthly cap: {monthly_used}/{monthly_limit}")
            raise HTTPException(status_code=429, detail={
                "code": "RATE_LIMIT_EXCEEDED",
                "message": f"You've used {monthly_limit} messages this month. Resets on {reset_date.strftime('%B 1')}.",
                "limit_type": "monthly",
                "used": monthly_used,
                "limit": monthly_limit,
                "resets_at": reset_date.isoformat()
            })

        # Check daily limits by model tier
        if model_tier == ModelTier.PREMIUM:
            daily_limit = self.FREE_PREMIUM_DAILY_LIMIT if actual_tier == 'free' else 999999  # Pro has high limit
            if premium_used >= daily_limit:
                reset_time = self._get_next_midnight()
                logger.warning(f"⚠️  User {user_id} exceeded premium daily limit: {premium_used}/{daily_limit}")
                raise HTTPException(status_code=429, detail={
                    "code": "RATE_LIMIT_EXCEEDED",
                    "message": f"You've used {daily_limit} premium messages today. Resets at midnight.",
                    "limit_type": "daily_premium",
                    "used": premium_used,
                    "limit": daily_limit,
                    "resets_at": reset_time.isoformat()
                })

        else:  # FREE model tier
            daily_limit = self.FREE_FREE_DAILY_LIMIT if actual_tier == 'free' else 999999  # Pro has high limit
            if free_used >= daily_limit:
                reset_time = self._get_next_midnight()
                logger.warning(f"⚠️  User {user_id} exceeded free daily limit: {free_used}/{daily_limit}")
                raise HTTPException(status_code=429, detail={
                    "code": "RATE_LIMIT_EXCEEDED",
                    "message": f"You've used {daily_limit} free messages today. Resets at midnight.",
                    "limit_type": "daily_free",
                    "used": free_used,
                    "limit": daily_limit,
                    "resets_at": reset_time.isoformat()
                })

        logger.debug(
            f"Rate limit check passed for user {user_id}: "
            f"premium={premium_used}/{daily_limit if model_tier == ModelTier.PREMIUM else 'N/A'}, "
            f"free={free_used}/{daily_limit if model_tier == ModelTier.FREE else 'N/A'}, "
            f"monthly={monthly_used}/{monthly_limit}"
        )

    def increment_usage(
        self,
        user_id: str,
        model: str,
        bypass_admin_key: bool = False
    ) -> None:
        """
        Increment user's AI usage counters after successful AI call.

        Args:
            user_id: User ID (user_profiles.id)
            model: AI model identifier
            bypass_admin_key: True if admin bypass (don't increment)
        """
        # Don't track admin usage
        if bypass_admin_key:
            return

        model_tier = self._get_model_tier(model)

        try:
            if model_tier == ModelTier.PREMIUM:
                # Increment premium counter + monthly counter
                self.db.rpc('increment_ai_usage', {
                    'p_user_id': user_id,
                    'p_premium': True
                }).execute()
                logger.debug(f"Incremented premium usage for user {user_id}")

            else:  # FREE model
                # Increment free counter + monthly counter
                self.db.rpc('increment_ai_usage', {
                    'p_user_id': user_id,
                    'p_premium': False
                }).execute()
                logger.debug(f"Incremented free usage for user {user_id}")

        except Exception as e:
            logger.error(f"Error incrementing usage for user {user_id}: {e}")
            # Don't fail the request if increment fails

    def get_usage_stats(
        self,
        user_id: str,
        subscription_tier: str = 'free'
    ) -> Dict:
        """
        Get user's current AI usage statistics.

        Args:
            user_id: User ID
            subscription_tier: User subscription tier

        Returns:
            Dict with usage stats:
            {
                "premium_today": {"used": 5, "limit": 10},
                "free_today": {"used": 20, "limit": 40},
                "monthly": {"used": 150, "limit": 500},
                "tier": "free" | "pro" | "admin"
            }
        """
        try:
            result = self.db.table('user_profiles') \
                .select('ai_premium_messages_today, ai_free_messages_today, ai_messages_this_month, subscription_tier') \
                .eq('id', user_id) \
                .single() \
                .execute()

            user_data = result.data
            if not user_data:
                return {
                    "error": "User not found",
                    "premium_today": {"used": 0, "limit": 0},
                    "free_today": {"used": 0, "limit": 0},
                    "monthly": {"used": 0, "limit": 0},
                    "tier": subscription_tier
                }

            actual_tier = user_data.get('subscription_tier', subscription_tier)
            monthly_limit = self._get_monthly_limit(actual_tier)

            # Pro tier has high daily limits (effectively unlimited)
            premium_limit = self.FREE_PREMIUM_DAILY_LIMIT if actual_tier == 'free' else 999999
            free_limit = self.FREE_FREE_DAILY_LIMIT if actual_tier == 'free' else 999999

            return {
                "premium_today": {
                    "used": user_data.get('ai_premium_messages_today', 0),
                    "limit": premium_limit
                },
                "free_today": {
                    "used": user_data.get('ai_free_messages_today', 0),
                    "limit": free_limit
                },
                "monthly": {
                    "used": user_data.get('ai_messages_this_month', 0),
                    "limit": monthly_limit
                },
                "tier": actual_tier
            }

        except Exception as e:
            logger.error(f"Error getting usage stats for user {user_id}: {e}")
            return {
                "error": str(e),
                "premium_today": {"used": 0, "limit": 0},
                "free_today": {"used": 0, "limit": 0},
                "monthly": {"used": 0, "limit": 0},
                "tier": subscription_tier
            }

    def _get_model_tier(self, model: str) -> ModelTier:
        """
        Determine if model is premium or free tier.

        Premium models: Claude Sonnet
        Free models: Claude Haiku, GPT-4o-mini, GPT-4o

        Args:
            model: AI model identifier

        Returns:
            ModelTier enum (PREMIUM or FREE)
        """
        model_lower = model.lower()

        # Premium: Claude Sonnet
        if 'sonnet' in model_lower:
            return ModelTier.PREMIUM

        # Free: Haiku, GPT-4o-mini, GPT-4o
        # (GPT-4o is more expensive but we'll treat as free for now)
        return ModelTier.FREE

    def _get_monthly_limit(self, subscription_tier: str) -> int:
        """Get monthly message limit for user's subscription tier."""
        if subscription_tier == 'admin':
            return 999999  # Effectively unlimited
        elif subscription_tier == 'pro':
            return self.PRO_MONTHLY_LIMIT
        else:  # free
            return self.FREE_MONTHLY_LIMIT

    def _get_next_midnight(self) -> datetime:
        """Get next midnight for daily reset time."""
        now = datetime.now()
        tomorrow = now.replace(hour=0, minute=0, second=0, microsecond=0)
        if now.hour > 0 or now.minute > 0:
            tomorrow = tomorrow + timedelta(days=1)
        return tomorrow

    def _get_next_month_start(self) -> datetime:
        """Get 1st day of next month for monthly reset time."""
        now = datetime.now()
        if now.month == 12:
            return datetime(now.year + 1, 1, 1)
        else:
            return datetime(now.year, now.month + 1, 1)

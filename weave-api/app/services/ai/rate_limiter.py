"""
Tier-Based AI Rate Limiting

Enforces role and tier-based rate limits to prevent abuse and control costs.

Rate limits:
- Admin users (role='admin'): UNLIMITED (for testing, support)
- Paid users (tier='paid'): 10 AI calls/hour
- Free users (tier='free'): 10 AI calls/day (stricter for cost control)
"""

import logging
from datetime import datetime, timedelta
from typing import Optional

from supabase import Client as SupabaseClient

logger = logging.getLogger(__name__)


class RateLimitError(Exception):
    """
    Raised when user exceeds their tier-based rate limit.

    Attributes:
        message: Error description
        user_id: User who exceeded limit
        user_tier: User's tier (free/paid)
        limit: Rate limit that was exceeded
        retry_after: When user can try again
    """
    def __init__(
        self,
        message: str,
        user_id: str,
        user_tier: str,
        limit: str,
        retry_after: Optional[datetime] = None
    ):
        self.message = message
        self.user_id = user_id
        self.user_tier = user_tier
        self.limit = limit
        self.retry_after = retry_after
        super().__init__(self.message)


class RateLimiter:
    """
    Enforces tier-based rate limits for AI generation.

    Limits:
    - Admin: Unlimited (always returns True)
    - Paid: 10 calls/hour
    - Free: 10 calls/day (stricter for cost control)
    """

    # Rate limit constants
    ADMIN_LIMIT = None  # Unlimited
    PAID_HOURLY_LIMIT = 10
    FREE_DAILY_LIMIT = 10

    def __init__(self, db: SupabaseClient):
        """
        Initialize rate limiter.

        Args:
            db: Supabase client for querying ai_runs table
        """
        self.db = db

    def check_user_limit(
        self,
        user_id: str,
        user_role: str = 'user',
        user_tier: str = 'free',
        module: Optional[str] = None
    ) -> bool:
        """
        Check if user can make an AI call within their rate limit.

        Args:
            user_id: User ID
            user_role: User role ('admin' or 'user')
            user_tier: User tier ('free' or 'paid')
            module: AI module (optional, for logging)

        Returns:
            True if user can proceed, False if rate limit exceeded

        Raises:
            RateLimitError: If user exceeds their tier limit
        """
        # Admin users have unlimited access
        if user_role == 'admin':
            logger.debug(f"Admin user {user_id}: unlimited access")
            return True

        # Check tier-specific limits
        if user_tier == 'paid':
            return self._check_hourly_limit(user_id, module)
        else:  # free tier
            return self._check_daily_limit(user_id, module)

    def _check_hourly_limit(
        self,
        user_id: str,
        module: Optional[str] = None
    ) -> bool:
        """
        Check if paid user is within 10 calls/hour limit.

        Args:
            user_id: User ID
            module: AI module (optional, for logging)

        Returns:
            True if under limit

        Raises:
            RateLimitError: If exceeded 10 calls in last hour
        """
        try:
            # Query ai_runs in last hour
            one_hour_ago = datetime.now() - timedelta(hours=1)
            one_hour_ago_str = one_hour_ago.isoformat()

            result = self.db.table('ai_runs') \
                .select('id', count='exact') \
                .eq('user_id', user_id) \
                .gte('created_at', one_hour_ago_str) \
                .execute()

            call_count = result.count or 0

            logger.debug(
                f"Paid user {user_id}: {call_count}/{self.PAID_HOURLY_LIMIT} calls in last hour"
            )

            if call_count >= self.PAID_HOURLY_LIMIT:
                retry_after = datetime.now() + timedelta(hours=1)
                logger.warning(
                    f"⚠️  Paid user {user_id} exceeded hourly limit: "
                    f"{call_count}/{self.PAID_HOURLY_LIMIT}"
                )
                raise RateLimitError(
                    f"Rate limit exceeded: {self.PAID_HOURLY_LIMIT} calls/hour for paid users",
                    user_id=user_id,
                    user_tier='paid',
                    limit=f'{self.PAID_HOURLY_LIMIT} calls/hour',
                    retry_after=retry_after
                )

            return True

        except RateLimitError:
            raise  # Re-raise rate limit errors

        except Exception as e:
            logger.error(f"Error checking hourly limit for {user_id}: {e}")
            return True  # Fail open (don't block on error)

    def _check_daily_limit(
        self,
        user_id: str,
        module: Optional[str] = None
    ) -> bool:
        """
        Check if free user is within 10 calls/day limit.

        Args:
            user_id: User ID
            module: AI module (optional, for logging)

        Returns:
            True if under limit

        Raises:
            RateLimitError: If exceeded 10 calls today
        """
        try:
            # Query ai_runs for today
            today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            today_start_str = today_start.isoformat()

            result = self.db.table('ai_runs') \
                .select('id', count='exact') \
                .eq('user_id', user_id) \
                .gte('created_at', today_start_str) \
                .execute()

            call_count = result.count or 0

            logger.debug(
                f"Free user {user_id}: {call_count}/{self.FREE_DAILY_LIMIT} calls today"
            )

            if call_count >= self.FREE_DAILY_LIMIT:
                # Retry after midnight
                tomorrow = today_start + timedelta(days=1)
                logger.warning(
                    f"⚠️  Free user {user_id} exceeded daily limit: "
                    f"{call_count}/{self.FREE_DAILY_LIMIT}"
                )
                raise RateLimitError(
                    f"Rate limit exceeded: {self.FREE_DAILY_LIMIT} calls/day for free users",
                    user_id=user_id,
                    user_tier='free',
                    limit=f'{self.FREE_DAILY_LIMIT} calls/day',
                    retry_after=tomorrow
                )

            return True

        except RateLimitError:
            raise  # Re-raise rate limit errors

        except Exception as e:
            logger.error(f"Error checking daily limit for {user_id}: {e}")
            return True  # Fail open

    def get_user_remaining_calls(
        self,
        user_id: str,
        user_role: str = 'user',
        user_tier: str = 'free'
    ) -> dict:
        """
        Get remaining calls for user within current period.

        Args:
            user_id: User ID
            user_role: User role ('admin' or 'user')
            user_tier: User tier ('free' or 'paid')

        Returns:
            Dict with remaining calls and reset time
        """
        if user_role == 'admin':
            return {
                'remaining': None,  # Unlimited
                'limit': None,
                'period': 'unlimited',
                'resets_at': None,
            }

        try:
            if user_tier == 'paid':
                # Hourly limit
                one_hour_ago = datetime.now() - timedelta(hours=1)
                one_hour_ago_str = one_hour_ago.isoformat()

                result = self.db.table('ai_runs') \
                    .select('id', count='exact') \
                    .eq('user_id', user_id) \
                    .gte('created_at', one_hour_ago_str) \
                    .execute()

                used = result.count or 0
                remaining = max(0, self.PAID_HOURLY_LIMIT - used)
                resets_at = datetime.now() + timedelta(hours=1)

                return {
                    'remaining': remaining,
                    'limit': self.PAID_HOURLY_LIMIT,
                    'period': 'hour',
                    'resets_at': resets_at.isoformat(),
                }

            else:  # free tier
                # Daily limit
                today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
                today_start_str = today_start.isoformat()

                result = self.db.table('ai_runs') \
                    .select('id', count='exact') \
                    .eq('user_id', user_id) \
                    .gte('created_at', today_start_str) \
                    .execute()

                used = result.count or 0
                remaining = max(0, self.FREE_DAILY_LIMIT - used)
                resets_at = today_start + timedelta(days=1)

                return {
                    'remaining': remaining,
                    'limit': self.FREE_DAILY_LIMIT,
                    'period': 'day',
                    'resets_at': resets_at.isoformat(),
                }

        except Exception as e:
            logger.error(f"Error getting remaining calls for {user_id}: {e}")
            return {
                'remaining': 0,
                'limit': 0,
                'period': 'unknown',
                'resets_at': None,
                'error': str(e),
            }

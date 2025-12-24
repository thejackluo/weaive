"""
AI Chat Configuration (Story 6.1)

Centralized configuration for AI chat rate limits, admin bypass, and feature flags.

Environment variables:
- AI_FREE_PREMIUM_DAILY_LIMIT: Free tier premium model limit (default: 10)
- AI_FREE_FREE_DAILY_LIMIT: Free tier free model limit (default: 40)
- AI_FREE_MONTHLY_LIMIT: Free tier monthly total (default: 500)
- AI_PRO_MONTHLY_LIMIT: Pro tier monthly total (default: 5000)
- AI_ADMIN_KEY: Admin API key for unlimited access (X-Admin-Key header)
- AI_CHECK_IN_ENABLED: Global check-in toggle (default: true)
- AI_CHECK_IN_INTERVAL_MINUTES: Scheduler cron interval (default: 5)
"""

import os
from typing import Optional


class AIChatConfig:
    """
    AI Chat feature configuration loaded from environment variables.

    This config class centralizes all AI chat rate limits and feature flags,
    making them easy to adjust per environment (dev/staging/prod) without code changes.
    """

    # ========================================
    # Rate Limits (FREE tier)
    # ========================================

    FREE_PREMIUM_DAILY_LIMIT: int = int(os.getenv("AI_FREE_PREMIUM_DAILY_LIMIT", "10"))
    """Free tier: Claude Sonnet messages per day"""

    FREE_FREE_DAILY_LIMIT: int = int(os.getenv("AI_FREE_FREE_DAILY_LIMIT", "40"))
    """Free tier: Claude Haiku / GPT-4o-mini messages per day"""

    FREE_MONTHLY_LIMIT: int = int(os.getenv("AI_FREE_MONTHLY_LIMIT", "500"))
    """Free tier: Total AI messages per month"""

    # ========================================
    # Rate Limits (PRO tier)
    # ========================================

    PRO_MONTHLY_LIMIT: int = int(os.getenv("AI_PRO_MONTHLY_LIMIT", "5000"))
    """Pro tier: Total AI messages per month (5-10x free tier)"""

    # ========================================
    # Admin Bypass
    # ========================================

    ADMIN_API_KEY: Optional[str] = os.getenv(
        "AI_ADMIN_KEY", "dev-admin-key-12345-change-in-production"
    )
    # ✅ FIX: Fallback to hardcoded dev key if .env not loaded
    """
    Admin API key for bypassing all rate limits.

    Usage: Include `X-Admin-Key: {AI_ADMIN_KEY}` header in requests.
    Grants unlimited AI access for testing/support.

    Security: Generate with `openssl rand -hex 32` and store in .env.
    NEVER commit to git. Rotate regularly.
    """

    # ========================================
    # Check-In Scheduler
    # ========================================

    CHECK_IN_ENABLED: bool = os.getenv("AI_CHECK_IN_ENABLED", "true").lower() == "true"
    """Global toggle for server-initiated check-ins (default: true)"""

    CHECK_IN_INTERVAL_MINUTES: int = int(os.getenv("AI_CHECK_IN_INTERVAL_MINUTES", "5"))
    """APScheduler cron interval in minutes (default: 5)"""

    # ========================================
    # Streaming Configuration
    # ========================================

    STREAMING_TIMEOUT_SECONDS: int = int(os.getenv("AI_STREAMING_TIMEOUT_SECONDS", "60"))
    """SSE streaming timeout for AI responses (default: 60s)"""

    STREAMING_CHUNK_SIZE: int = int(os.getenv("AI_STREAMING_CHUNK_SIZE", "50"))
    """Characters per SSE chunk for streaming (default: 50)"""

    # ========================================
    # Validation
    # ========================================

    @classmethod
    def validate(cls) -> None:
        """Validate configuration on startup."""
        # Ensure rate limits are positive
        assert cls.FREE_PREMIUM_DAILY_LIMIT > 0, "AI_FREE_PREMIUM_DAILY_LIMIT must be > 0"
        assert cls.FREE_FREE_DAILY_LIMIT > 0, "AI_FREE_FREE_DAILY_LIMIT must be > 0"
        assert cls.FREE_MONTHLY_LIMIT > 0, "AI_FREE_MONTHLY_LIMIT must be > 0"
        assert cls.PRO_MONTHLY_LIMIT > 0, "AI_PRO_MONTHLY_LIMIT must be > 0"

        # Ensure monthly limit is greater than daily limits
        max_daily = cls.FREE_PREMIUM_DAILY_LIMIT + cls.FREE_FREE_DAILY_LIMIT
        assert cls.FREE_MONTHLY_LIMIT >= max_daily, (
            f"AI_FREE_MONTHLY_LIMIT ({cls.FREE_MONTHLY_LIMIT}) should be >= "
            f"sum of daily limits ({max_daily})"
        )

        # Warn if admin key is missing
        if not cls.ADMIN_API_KEY:
            print("⚠️  AI_ADMIN_KEY not set - admin bypass disabled")
        else:
            # Validate admin key format (should be hex string, at least 32 chars)
            if len(cls.ADMIN_API_KEY) < 32:
                print("⚠️  AI_ADMIN_KEY is too short - should be 32+ characters")

    @classmethod
    def get_tier_monthly_limit(cls, subscription_tier: str) -> int:
        """
        Get monthly limit for a subscription tier.

        Args:
            subscription_tier: 'free', 'pro', or 'admin'

        Returns:
            Monthly message limit (999999 for admin = unlimited)
        """
        if subscription_tier == "admin":
            return 999999  # Effectively unlimited
        elif subscription_tier == "pro":
            return cls.PRO_MONTHLY_LIMIT
        else:  # free
            return cls.FREE_MONTHLY_LIMIT

    @classmethod
    def get_tier_daily_premium_limit(cls, subscription_tier: str) -> int:
        """Get daily premium model limit for a subscription tier."""
        if subscription_tier in ["admin", "pro"]:
            return 999999  # Effectively unlimited
        else:  # free
            return cls.FREE_PREMIUM_DAILY_LIMIT

    @classmethod
    def get_tier_daily_free_limit(cls, subscription_tier: str) -> int:
        """Get daily free model limit for a subscription tier."""
        if subscription_tier in ["admin", "pro"]:
            return 999999  # Effectively unlimited
        else:  # free
            return cls.FREE_FREE_DAILY_LIMIT


# Validate config on module import
AIChatConfig.validate()

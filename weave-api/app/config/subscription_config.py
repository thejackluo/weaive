"""
Subscription Configuration Module
Story 9.4: App Store Readiness - AC 8

Centralized subscription configuration following Story 6.1's config management pattern.
Environment-aware settings for Apple IAP, Superwall, and subscription tiers.
"""

import os
from typing import Optional


class SubscriptionConfig:
    """Subscription feature configuration loaded from environment variables."""

    # Apple IAP Configuration
    APPLE_SHARED_SECRET: str = os.getenv(
        "APPLE_SHARED_SECRET", ""
    )  # For receipt verification
    APPLE_TEAM_ID: str = os.getenv("APPLE_TEAM_ID", "")
    BUNDLE_ID: str = os.getenv("BUNDLE_ID", "com.weavelight.app")

    # Subscription Product IDs (must match App Store Connect)
    PRODUCT_ID_MONTHLY: str = "com.weavelight.app.pro.monthly"
    PRODUCT_ID_ANNUAL: str = "com.weavelight.app.pro.annual"
    PRODUCT_ID_TRIAL: str = "com.weavelight.app.trial.10day"

    # Subscription Tiers → Rate Limits (matches TieredRateLimiter)
    FREE_TIER_MONTHLY_LIMIT: int = 500  # AI messages/month
    PRO_TIER_MONTHLY_LIMIT: int = 5000  # AI messages/month (10x free)

    # Receipt Verification URLs
    APPLE_SANDBOX_URL: str = "https://sandbox.itunes.apple.com/verifyReceipt"
    APPLE_PRODUCTION_URL: str = "https://buy.itunes.apple.com/verifyReceipt"
    USE_SANDBOX: bool = os.getenv("IAP_SANDBOX", "true").lower() == "true"

    # Superwall Configuration (Phase 2 - optional, post-launch)
    SUPERWALL_API_KEY: Optional[str] = os.getenv("SUPERWALL_API_KEY", None)
    SUPERWALL_ENABLED: bool = (
        os.getenv("SUPERWALL_ENABLED", "false").lower() == "true"
    )

    @classmethod
    def validate(cls) -> None:
        """Validate config on startup - catches misconfiguration early."""
        if not cls.APPLE_SHARED_SECRET:
            # Only required in production
            if os.getenv("ENV", "development") == "production":
                raise ValueError("APPLE_SHARED_SECRET required in production")

        assert (
            cls.PRO_TIER_MONTHLY_LIMIT > cls.FREE_TIER_MONTHLY_LIMIT
        ), "Pro tier limit must be higher than free tier"

    @classmethod
    def get_receipt_verification_url(cls) -> str:
        """Get the appropriate Apple receipt verification URL based on environment."""
        return cls.APPLE_SANDBOX_URL if cls.USE_SANDBOX else cls.APPLE_PRODUCTION_URL

    @classmethod
    def is_valid_product_id(cls, product_id: str) -> bool:
        """Check if product ID is valid (matches our known products)."""
        valid_products = {
            cls.PRODUCT_ID_MONTHLY,
            cls.PRODUCT_ID_ANNUAL,
            cls.PRODUCT_ID_TRIAL,
        }
        return product_id in valid_products

    @classmethod
    def get_tier_monthly_limit(cls, tier: str) -> int:
        """Get monthly AI message limit for a given tier."""
        if tier == "pro" or tier == "admin":
            return cls.PRO_TIER_MONTHLY_LIMIT
        return cls.FREE_TIER_MONTHLY_LIMIT


# Validate on module import (fail fast if misconfigured)
SubscriptionConfig.validate()

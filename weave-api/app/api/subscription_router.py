"""
Subscription API Router
Story 9.4: App Store Readiness - AC 1 (Phase 1: Manual IAP)

Handles Apple IAP receipt verification and subscription tier updates.
Integrates with TieredRateLimiter (no new middleware needed).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from supabase import Client
import requests
from typing import Optional
from datetime import datetime, timedelta

from app.core.supabase import get_supabase_client
from app.core.auth import get_current_user
from app.config.subscription_config import SubscriptionConfig

router = APIRouter(prefix="/api/subscription", tags=["subscription"])


# ============================================================================
# Request/Response Models
# ============================================================================


class VerifyReceiptRequest(BaseModel):
    """Request model for receipt verification."""

    receipt: str  # Base64-encoded receipt data from Apple
    product_id: str  # Product ID purchased


class VerifyReceiptResponse(BaseModel):
    """Response model for receipt verification."""

    success: bool
    subscription_tier: str
    expires_at: Optional[str] = None
    product_id: Optional[str] = None
    message: Optional[str] = None


class AppleReceiptResponse(BaseModel):
    """Apple's receipt verification response structure (simplified)."""

    status: int  # 0 = valid, non-zero = error
    latest_receipt_info: Optional[list] = None
    pending_renewal_info: Optional[list] = None


# ============================================================================
# Receipt Verification Endpoint
# ============================================================================


@router.post("/verify-receipt", response_model=VerifyReceiptResponse)
async def verify_receipt(
    request: VerifyReceiptRequest,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_supabase_client),
):
    """
    Verify Apple IAP receipt and update user's subscription tier.

    Steps:
    1. Validate product ID
    2. Send receipt to Apple for verification
    3. Parse response and extract subscription info
    4. Update user_profiles.subscription_tier
    5. Return updated subscription status

    Auth: JWT required (user must be logged in)
    Rate limit: No limit (subscription verification is critical)
    """
    # Extract user ID from JWT
    auth_user_id = user["sub"]

    # Step 1: Validate product ID
    if not SubscriptionConfig.is_valid_product_id(request.product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid product_id: {request.product_id}",
        )

    # Step 2: Send receipt to Apple for verification
    apple_url = SubscriptionConfig.get_receipt_verification_url()

    try:
        apple_response = requests.post(
            apple_url,
            json={
                "receipt-data": request.receipt,
                "password": SubscriptionConfig.APPLE_SHARED_SECRET,
                "exclude-old-transactions": True,
            },
            timeout=10,
        )
        apple_response.raise_for_status()
        apple_data = apple_response.json()
    except requests.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to verify receipt with Apple: {str(e)}",
        )

    # Step 3: Parse Apple response
    receipt_status = apple_data.get("status", -1)

    # Status 21007 = sandbox receipt sent to production (retry with sandbox)
    if receipt_status == 21007 and not SubscriptionConfig.USE_SANDBOX:
        # Retry with sandbox URL
        try:
            apple_response = requests.post(
                SubscriptionConfig.APPLE_SANDBOX_URL,
                json={
                    "receipt-data": request.receipt,
                    "password": SubscriptionConfig.APPLE_SHARED_SECRET,
                    "exclude-old-transactions": True,
                },
                timeout=10,
            )
            apple_response.raise_for_status()
            apple_data = apple_response.json()
            receipt_status = apple_data.get("status", -1)
        except requests.RequestException:
            pass  # Use original error

    if receipt_status != 0:
        # Receipt invalid or error occurred
        error_messages = {
            21000: "App Store cannot read receipt",
            21002: "Receipt data malformed",
            21003: "Receipt cannot be authenticated",
            21004: "Shared secret does not match",
            21005: "Receipt server temporarily unavailable",
            21006: "Receipt valid but subscription expired",
            21007: "Sandbox receipt sent to production",
            21008: "Production receipt sent to sandbox",
            21010: "Account not found or deleted",
        }

        error_msg = error_messages.get(
            receipt_status, f"Unknown error: {receipt_status}"
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Receipt verification failed: {error_msg}",
        )

    # Step 4: Extract subscription info
    latest_receipt_info = apple_data.get("latest_receipt_info", [])
    if not latest_receipt_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No subscription info found in receipt",
        )

    # Get most recent transaction
    latest_transaction = latest_receipt_info[-1]

    # Extract expiry date (milliseconds since epoch)
    expires_at_ms = int(
        latest_transaction.get("expires_date_ms", 0)
    )  # Changed from expires_date to expires_date_ms
    if expires_at_ms == 0:
        # No expiry date (one-time purchase or trial)
        # Default to 30 days from now
        expires_at = datetime.utcnow() + timedelta(days=30)
    else:
        expires_at = datetime.utcfromtimestamp(expires_at_ms / 1000)

    # Determine subscription tier
    subscription_tier = "pro"  # Default for all paid subscriptions

    # Step 5: Update user_profiles table
    try:
        # First, get user_profiles.id from auth_user_id
        user_profile = (
            db.table("user_profiles")
            .select("id")
            .eq("auth_user_id", auth_user_id)
            .single()
            .execute()
        )

        if not user_profile.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found"
            )

        user_id = user_profile.data["id"]

        # Update subscription tier and expiry
        db.table("user_profiles").update(
            {
                "subscription_tier": subscription_tier,
                "subscription_expires_at": expires_at.isoformat(),
                "subscription_product_id": request.product_id,
            }
        ).eq("id", user_id).execute()

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update subscription tier: {str(e)}",
        )

    # Step 6: Return success response
    return VerifyReceiptResponse(
        success=True,
        subscription_tier=subscription_tier,
        expires_at=expires_at.isoformat(),
        product_id=request.product_id,
        message="Subscription activated successfully",
    )


# ============================================================================
# Subscription Status Endpoint (moved from user_router.py)
# ============================================================================


class SubscriptionStatusResponse(BaseModel):
    """Response model for subscription status."""

    subscription_tier: str
    subscription_expires_at: Optional[str] = None
    subscription_product_id: Optional[str] = None
    is_expired: bool = False
    monthly_limit: int


@router.get("/status", response_model=SubscriptionStatusResponse)
async def get_subscription_status(
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_supabase_client),
):
    """
    Get current user's subscription status.

    Returns subscription tier, expiry date, and rate limits.
    Used by frontend to display current plan and enforce feature access.

    Auth: JWT required
    """
    # Extract user ID from JWT
    auth_user_id = user["sub"]

    # Fetch user profile with subscription info
    try:
        user_profile = (
            db.table("user_profiles")
            .select(
                "subscription_tier, subscription_expires_at, subscription_product_id"
            )
            .eq("auth_user_id", auth_user_id)
            .single()
            .execute()
        )

        if not user_profile.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found"
            )

        profile_data = user_profile.data

        # Check if subscription is expired
        expires_at = profile_data.get("subscription_expires_at")
        is_expired = False

        if expires_at:
            expiry_date = datetime.fromisoformat(
                expires_at.replace("Z", "+00:00")
            )  # Handle Z suffix
            is_expired = expiry_date < datetime.utcnow()

            # If expired, downgrade to free tier
            if is_expired and profile_data.get("subscription_tier") == "pro":
                db.table("user_profiles").update({"subscription_tier": "free"}).eq(
                    "auth_user_id", auth_user_id
                ).execute()
                profile_data["subscription_tier"] = "free"

        # Get monthly limit for tier
        tier = profile_data.get("subscription_tier", "free")
        monthly_limit = SubscriptionConfig.get_tier_monthly_limit(tier)

        return SubscriptionStatusResponse(
            subscription_tier=tier,
            subscription_expires_at=expires_at,
            subscription_product_id=profile_data.get("subscription_product_id"),
            is_expired=is_expired,
            monthly_limit=monthly_limit,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch subscription status: {str(e)}",
        )

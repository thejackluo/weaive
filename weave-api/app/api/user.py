"""User API endpoints (Story 0.3: Authentication Flow, Story 1.5: Profile Creation, Story 6.1: Push Notifications)"""

import logging
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from supabase import Client

from app.core.deps import get_current_user, get_optional_user, get_supabase_client
from app.models.user_profile import UserProfileCreate, UserProfileResponse
from app.services import user_profile

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/user")


# Pydantic model for push token request
class PushTokenRequest(BaseModel):
    expo_push_token: str


@router.get("/me")
async def get_current_user_info(user: dict = Depends(get_current_user)):
    """
    Get current authenticated user information.

    This is a protected endpoint that requires a valid JWT token.

    **Authentication Required:**
    - Include JWT token in Authorization header: `Bearer <token>`

    **Returns:**
    - user_id: User's unique ID (UUID)
    - email: User's email address
    - role: User's role (authenticated, anon, etc.)
    - iat: Token issued at (Unix timestamp)
    - exp: Token expires at (Unix timestamp)

    **Status Codes:**
    - 200: Success
    - 401: Unauthorized (missing, invalid, or expired token)
    - 500: Server error (JWT secret not configured)

    **Example Response:**
    ```json
    {
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "role": "authenticated",
      "iat": 1703001600,
      "exp": 1703088000
    }
    ```
    """
    logger.info(f"✅ Protected endpoint accessed by user: {user.get('sub')}")

    return {
        "user_id": user.get("sub"),
        "email": user.get("email"),
        "role": user.get("role", "authenticated"),
        "iat": user.get("iat"),
        "exp": user.get("exp"),
    }


@router.get("/profile")
async def get_user_profile(user: dict = Depends(get_current_user)):
    """
    Get user profile (placeholder for future implementation).

    This endpoint demonstrates how to use the JWT authentication
    dependency in other protected endpoints.

    **Authentication Required:**
    - Include JWT token in Authorization header: `Bearer <token>`

    **Status Codes:**
    - 200: Success
    - 401: Unauthorized
    """
    logger.info(f"✅ Profile accessed by user: {user.get('sub')}")

    # TODO: Implement actual profile fetching from database
    return {
        "user_id": user.get("sub"),
        "email": user.get("email"),
        "message": "Profile endpoint - to be implemented in future stories",
    }


@router.get("/optional-auth-example")
async def optional_auth_example(user: dict | None = Depends(get_optional_user)):
    """
    Example endpoint that works with or without authentication.

    Demonstrates the get_optional_user() dependency that doesn't
    require authentication but provides user info if token is present.

    **Authentication Optional:**
    - Works without Authorization header
    - Provides user info if valid token is included

    **Returns:**
    - Different responses for authenticated vs. anonymous users
    """
    if user:
        logger.info(f"✅ Optional auth endpoint accessed by user: {user.get('sub')}")
        return {
            "message": f"Hello, {user.get('email')}!",
            "authenticated": True,
            "user_id": user.get("sub"),
        }
    else:
        logger.info("✅ Optional auth endpoint accessed anonymously")
        return {
            "message": "Hello, anonymous user!",
            "authenticated": False,
        }


@router.post(
    "/profile",
    response_model=UserProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_profile(
    profile_data: UserProfileCreate,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Create user profile after successful authentication (Story 1.5).

    This endpoint should be called immediately after successful OAuth to create
    the user's profile in the user_profiles table.

    **Authentication Required:**
    - Include JWT token in Authorization header: `Bearer <token>`
    - The auth_user_id is extracted from the JWT 'sub' field (cannot be spoofed)

    **Request Body:**
    - display_name: User display name (optional)
    - timezone: IANA timezone (default: UTC)
    - locale: User locale (default: en-US)

    **Status Codes:**
    - 201: Profile created successfully
    - 200: Profile already exists (idempotent)
    - 401: Unauthorized (missing or invalid JWT token)
    - 422: Request body validation error
    - 500: Server error (database failure)

    **Example Request:**
    ```json
    {
      "display_name": "John Doe",
      "timezone": "America/Los_Angeles"
    }
    ```

    **Example Response:**
    ```json
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "auth_user_id": "auth-user-123",
      "display_name": "John Doe",
      "timezone": "America/Los_Angeles",
      "locale": "en-US",
      "created_at": "2025-12-19T19:00:00Z",
      "updated_at": "2025-12-19T19:00:00Z"
    }
    ```
    """
    # Extract auth_user_id from JWT token (from 'sub' field)
    # This ensures users can only create profiles for themselves
    auth_user_id = user.get("sub")
    if not auth_user_id:
        logger.error("❌ JWT payload missing 'sub' field")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )

    logger.info(f"✅ Creating profile for authenticated user: {auth_user_id}")

    try:
        profile = await user_profile.create_user_profile(
            supabase=supabase,
            auth_user_id=auth_user_id,
            display_name=profile_data.display_name,
            timezone=profile_data.timezone,
            locale=profile_data.locale,
        )

        return UserProfileResponse(**profile)

    except Exception as e:
        logger.error(f"❌ Error creating user profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user profile: {str(e)}",
        )


@router.post("/push-token", status_code=status.HTTP_200_OK)
async def save_push_token(
    request: PushTokenRequest,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Save Expo push token for the authenticated user (Story 6.1).

    This endpoint saves the device's Expo push token to enable server-initiated
    push notifications for check-ins.

    **Authentication Required:**
    - Include JWT token in Authorization header: `Bearer <token>`

    **Request Body:**
    - expo_push_token: Expo push token (format: ExponentPushToken[...])

    **Status Codes:**
    - 200: Push token saved successfully
    - 401: Unauthorized (missing or invalid JWT token)
    - 404: User profile not found
    - 422: Invalid push token format
    - 500: Server error (database failure)

    **Example Request:**
    ```json
    {
      "expo_push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
    }
    ```

    **Example Response:**
    ```json
    {
      "message": "Push token saved successfully",
      "user_id": "550e8400-e29b-41d4-a716-446655440000"
    }
    ```
    """
    auth_user_id = user.get("sub")
    if not auth_user_id:
        logger.error("❌ JWT payload missing 'sub' field")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )

    if not request.expo_push_token.startswith("ExponentPushToken["):
        logger.error(f"❌ Invalid push token format: {request.expo_push_token}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid Expo push token format",
        )

    logger.info(f"💾 Saving push token for user: {auth_user_id}")

    try:
        profile_result = (
            supabase.table("user_profiles")
            .select("id")
            .eq("auth_user_id", auth_user_id)
            .single()
            .execute()
        )

        if not profile_result.data:
            logger.error(f"❌ User profile not found for auth_user_id: {auth_user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )

        user_id = profile_result.data["id"]

        supabase.table("user_profiles").update({"expo_push_token": request.expo_push_token}).eq(
            "id", user_id
        ).execute()

        logger.info(f"✅ Push token saved for user: {user_id}")

        return {"message": "Push token saved successfully", "user_id": user_id}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error saving push token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save push token: {str(e)}",
        )


@router.get("/stats")
async def get_user_stats(
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Get computed user statistics (US-5.1, US-5.4: Level, Streak, Character State).

    Returns:
    - data: User stats object
    - meta: Metadata with timestamp

    Data format:
    {
      "level": 5,                         // Computed from total active days
      "current_streak": 12,               // Consecutive days with completions
      "weave_character_state": "thread",  // "strand" | "thread" | "weave"
      "total_completions": 145,           // Total subtask completions
      "total_active_days": 42             // Total days with active_day_with_proof=true
    }

    Character state mapping:
    - Level 1-3: "strand" (simple line)
    - Level 4-7: "thread" (woven lines)
    - Level 8+: "weave" (complex pattern)
    """
    if not supabase:
        logger.error("❌ Supabase client not configured")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database not configured",
        )

    auth_user_id = user.get("sub")
    if not auth_user_id:
        logger.error("❌ JWT payload missing 'sub' field (user ID)")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    logger.info(f"[USER_STATS] Request from auth_user_id: {auth_user_id}")

    try:
        user_profile_response = (
            supabase.table("user_profiles")
            .select("id")
            .eq("auth_user_id", auth_user_id)
            .single()
            .execute()
        )

        if not user_profile_response.data:
            logger.error(f"❌ No user profile found for auth_user_id: {auth_user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )

        user_id = user_profile_response.data["id"]
        logger.debug(f"✅ Resolved user_id: {user_id} for auth_user_id: {auth_user_id}")

        aggregates_response = (
            supabase.table("daily_aggregates")
            .select("local_date, active_day_with_proof, completed_count")
            .eq("user_id", user_id)
            .order("local_date", desc=False)
            .execute()
        )

        aggregates = aggregates_response.data or []
        logger.info(f"📊 Found {len(aggregates)} days of data for user stats")

        total_active_days = sum(1 for agg in aggregates if agg.get("active_day_with_proof"))
        level = (total_active_days // 10) + 1 if total_active_days > 0 else 1
        total_completions = sum(agg.get("completed_count", 0) for agg in aggregates)

        current_streak = 0
        today = date.today()

        # Create a set of active dates for fast lookup
        active_dates = {agg["local_date"] for agg in aggregates if agg.get("active_day_with_proof")}

        for i in range(len(aggregates) + 1):
            check_date = (today - timedelta(days=i)).isoformat()
            if check_date in active_dates:
                current_streak += 1
            else:
                break

        if level <= 3:
            character_state = "strand"
        elif level <= 7:
            character_state = "thread"
        else:
            character_state = "weave"

        logger.info(
            f"✅ User stats computed: level={level}, streak={current_streak}, "
            f"character={character_state}, completions={total_completions}"
        )

        return {
            "data": {
                "level": level,
                "current_streak": current_streak,
                "weave_character_state": character_state,
                "total_completions": total_completions,
                "total_active_days": total_active_days,
            },
            "meta": {
                "timestamp": today.isoformat(),
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching user stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user stats",
        )

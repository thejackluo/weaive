"""User API endpoints (Story 0.3: Authentication Flow)"""

import logging

from fastapi import APIRouter, Depends

from app.core.deps import get_current_user, get_optional_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/user")


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

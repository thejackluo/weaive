"""Dependency injection for database, AI clients, etc."""

import logging
from functools import lru_cache
from typing import Optional

import jwt
from anthropic import Anthropic
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from openai import OpenAI
from supabase import Client, create_client

from app.core.config import settings
from app.services.ai.ai_service import AIService

logger = logging.getLogger(__name__)

# HTTPBearer scheme for extracting JWT from Authorization header
security = HTTPBearer()

# Global AI service instance (initialized once)
_ai_service_instance: Optional[AIService] = None


@lru_cache(maxsize=1)
def get_supabase_client() -> Optional[Client]:
    """Get Supabase client instance (lazy initialization)."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        return None
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


@lru_cache(maxsize=1)
def get_openai_client() -> Optional[OpenAI]:
    """Get OpenAI client instance (lazy initialization)."""
    if not settings.OPENAI_API_KEY:
        return None
    return OpenAI(api_key=settings.OPENAI_API_KEY)


@lru_cache(maxsize=1)
def get_anthropic_client() -> Optional[Anthropic]:
    """Get Anthropic client instance (lazy initialization)."""
    if not settings.ANTHROPIC_API_KEY:
        return None
    return Anthropic(api_key=settings.ANTHROPIC_API_KEY)


def get_ai_service() -> Optional[AIService]:
    """
    Get AI service instance (lazy initialization, singleton pattern).

    Story 4.1: Used for journal feedback generation
    Story 4.3: Used for daily recap and insights

    Returns:
        AIService instance or None if Supabase is not configured
    """
    global _ai_service_instance

    if _ai_service_instance is None:
        supabase = get_supabase_client()
        if supabase is None:
            logger.warning("⚠️  AI Service not initialized: Supabase client unavailable")
            return None

        # Initialize AI service with all available providers
        _ai_service_instance = AIService(
            db=supabase,
            bedrock_region=getattr(settings, 'AWS_REGION', 'us-east-1'),
            openai_key=settings.OPENAI_API_KEY,
            anthropic_key=settings.ANTHROPIC_API_KEY
        )
        logger.info("✅ AI Service initialized")

    return _ai_service_instance


# ============================================================================
# Authentication & Authorization (Story 0.3)
# ============================================================================


def verify_jwt_token(token: str) -> dict:
    """
    Verify and decode Supabase JWT token.

    Args:
        token: JWT token from Authorization header

    Returns:
        dict: Decoded JWT payload containing user information

    Raises:
        HTTPException: If token is invalid, expired, or JWT secret is not configured
    """
    if not settings.SUPABASE_JWT_SECRET:
        logger.error(
            "❌ SUPABASE_JWT_SECRET is not configured. Cannot verify JWT tokens. "
            "Set this in .env for Story 0.3+."
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication is not configured on the server",
        )

    try:
        # Decode and verify JWT using Supabase JWT secret
        # Supabase uses HS256 algorithm by default
        # Add 60s leeway to handle clock skew between mobile device and server
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",  # Supabase default audience
            leeway=60,  # Allow 60s clock skew tolerance (critical for mobile apps)
        )

        logger.debug(f"✅ JWT verified for user: {payload.get('sub')}")
        return payload

    except jwt.ExpiredSignatureError:
        logger.warning("⚠️  JWT token has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"⚠️  Invalid JWT token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    FastAPI dependency to get current authenticated user from JWT token.

    This dependency:
    1. Extracts JWT from Authorization header (Bearer token)
    2. Verifies and decodes the JWT
    3. Returns the user payload

    Usage in protected endpoints:
    ```python
    @app.get("/api/protected")
    async def protected_route(user: dict = Depends(get_current_user)):
        return {"user_id": user["sub"], "email": user["email"]}
    ```

    Args:
        credentials: HTTP Authorization credentials (injected by FastAPI)

    Returns:
        dict: Decoded JWT payload with user information:
            - sub: User ID (UUID)
            - email: User email
            - role: User role (authenticated, anon, etc.)
            - iat: Issued at timestamp
            - exp: Expiry timestamp

    Raises:
        HTTPException: 401 if token is missing, invalid, or expired
    """
    token = credentials.credentials
    payload = verify_jwt_token(token)

    # Extract user ID from JWT payload
    user_id = payload.get("sub")
    if not user_id:
        logger.error("❌ JWT payload missing 'sub' field (user ID)")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    return payload


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    ),
) -> Optional[dict]:
    """
    FastAPI dependency to optionally get current authenticated user.

    Unlike get_current_user(), this dependency does NOT raise an error if
    no token is provided. Useful for endpoints that have different behavior
    for authenticated vs. anonymous users.

    Usage:
    ```python
    @app.get("/api/optional-auth")
    async def optional_auth_route(user: Optional[dict] = Depends(get_optional_user)):
        if user:
            return {"message": f"Hello, {user['email']}"}
        else:
            return {"message": "Hello, anonymous user"}
    ```

    Args:
        credentials: HTTP Authorization credentials (optional)

    Returns:
        dict | None: Decoded JWT payload if token is valid, None if no token provided

    Raises:
        HTTPException: 401 only if token is provided but invalid/expired
    """
    if not credentials:
        return None

    token = credentials.credentials
    return verify_jwt_token(token)

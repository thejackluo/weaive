"""
Tests for authentication and security (Story 0.3, 1.5).

Tests cover:
- JWT authentication (valid, invalid, expired tokens)
- User profile creation with JWT extraction
- Concurrent profile creation (race condition handling)
- Analytics event tracking with optional auth
"""

import asyncio
import os
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch

import jwt
import pytest
from fastapi.testclient import TestClient
from supabase import Client

from app.core.config import settings
from app.main import app

client = TestClient(app)


# ============================================================================
# Test Fixtures
# ============================================================================


@pytest.fixture
def mock_supabase():
    """Mock Supabase client for testing."""
    mock = MagicMock(spec=Client)
    return mock


@pytest.fixture
def valid_jwt_token():
    """Generate a valid JWT token for testing."""
    if not settings.SUPABASE_JWT_SECRET:
        pytest.skip("SUPABASE_JWT_SECRET not configured")

    payload = {
        "sub": "test-user-123",
        "email": "test@example.com",
        "role": "authenticated",
        "iat": datetime.now(timezone.utc).timestamp(),
        "exp": (datetime.now(timezone.utc) + timedelta(hours=1)).timestamp(),
        "aud": "authenticated",
    }

    token = jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")
    return token


@pytest.fixture
def expired_jwt_token():
    """Generate an expired JWT token for testing."""
    if not settings.SUPABASE_JWT_SECRET:
        pytest.skip("SUPABASE_JWT_SECRET not configured")

    payload = {
        "sub": "test-user-123",
        "email": "test@example.com",
        "role": "authenticated",
        "iat": (datetime.now(timezone.utc) - timedelta(hours=2)).timestamp(),
        "exp": (datetime.now(timezone.utc) - timedelta(hours=1)).timestamp(),
        "aud": "authenticated",
    }

    token = jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")
    return token


# ============================================================================
# Authentication Tests
# ============================================================================


def test_protected_endpoint_without_auth():
    """Test that protected endpoint rejects requests without auth token."""
    response = client.get("/api/user/me")

    assert response.status_code == 401  # FastAPI HTTPBearer returns 401 for missing auth
    assert "detail" in response.json()


def test_protected_endpoint_with_invalid_token():
    """Test that protected endpoint rejects invalid JWT tokens."""
    response = client.get(
        "/api/user/me",
        headers={"Authorization": "Bearer invalid-token-12345"},
    )

    assert response.status_code == 401
    assert "Invalid authentication token" in response.json()["detail"]


def test_protected_endpoint_with_expired_token(expired_jwt_token):
    """Test that protected endpoint rejects expired JWT tokens."""
    response = client.get(
        "/api/user/me",
        headers={"Authorization": f"Bearer {expired_jwt_token}"},
    )

    assert response.status_code == 401
    assert "expired" in response.json()["detail"].lower()


def test_protected_endpoint_with_valid_token(valid_jwt_token):
    """Test that protected endpoint accepts valid JWT tokens."""
    response = client.get(
        "/api/user/me",
        headers={"Authorization": f"Bearer {valid_jwt_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == "test-user-123"
    assert data["email"] == "test@example.com"
    assert data["role"] == "authenticated"


def test_optional_auth_endpoint_without_token():
    """Test that optional auth endpoint works without token."""
    response = client.get("/api/user/optional-auth-example")

    assert response.status_code == 200
    data = response.json()
    assert data["authenticated"] is False
    assert "anonymous" in data["message"].lower()


def test_optional_auth_endpoint_with_valid_token(valid_jwt_token):
    """Test that optional auth endpoint works with valid token."""
    response = client.get(
        "/api/user/optional-auth-example",
        headers={"Authorization": f"Bearer {valid_jwt_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["authenticated"] is True
    assert data["user_id"] == "test-user-123"


# ============================================================================
# User Profile Creation Tests
# ============================================================================


def test_create_profile_without_auth():
    """Test that profile creation requires authentication."""
    response = client.post(
        "/api/user/profile",
        json={"display_name": "Test User", "timezone": "America/Los_Angeles"},
    )

    # Should return 401 (missing auth) instead of accepting auth_user_id from body
    assert response.status_code == 401


def test_create_profile_with_invalid_token():
    """Test that profile creation rejects invalid JWT tokens."""
    response = client.post(
        "/api/user/profile",
        headers={"Authorization": "Bearer invalid-token"},
        json={"display_name": "Test User"},
    )

    assert response.status_code == 401


@patch("app.services.user_profile.create_user_profile")
def test_create_profile_with_valid_token(mock_create_profile, valid_jwt_token):
    """Test that profile creation extracts auth_user_id from JWT."""
    # Mock the service to return a profile
    mock_create_profile.return_value = {
        "id": "550e8400-e29b-41d4-a716-446655440010",  # Valid UUID
        "auth_user_id": "test-user-123",
        "display_name": "Test User",
        "timezone": "America/Los_Angeles",
        "locale": "en-US",
        "created_at": "2025-12-20T00:00:00Z",
        "updated_at": "2025-12-20T00:00:00Z",
    }

    response = client.post(
        "/api/user/profile",
        headers={"Authorization": f"Bearer {valid_jwt_token}"},
        json={"display_name": "Test User", "timezone": "America/Los_Angeles"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["auth_user_id"] == "test-user-123"  # Extracted from JWT, not request body
    assert data["display_name"] == "Test User"

    # Verify service was called with auth_user_id from JWT
    mock_create_profile.assert_called_once()
    call_kwargs = mock_create_profile.call_args[1]
    assert call_kwargs["auth_user_id"] == "test-user-123"


# ============================================================================
# Race Condition Tests
# ============================================================================


@pytest.mark.asyncio
@patch("app.services.user_profile.logger")
async def test_concurrent_profile_creation(mock_logger, mock_supabase):
    """Test that concurrent profile creation handles race conditions gracefully."""
    from app.services.user_profile import create_user_profile

    auth_user_id = "concurrent-test-user"
    call_count = 0

    # Mock Supabase responses to simulate race condition
    def mock_insert_then_duplicate(*args, **kwargs):
        nonlocal call_count
        call_count += 1

        if call_count == 1:
            # First call succeeds
            mock_result = MagicMock()
            mock_result.data = [
                {
                    "id": "550e8400-e29b-41d4-a716-446655440011",  # Valid UUID
                    "auth_user_id": auth_user_id,
                    "display_name": "Test User",
                    "timezone": "UTC",
                    "locale": "en-US",
                }
            ]
            return mock_result
        else:
            # Second call gets duplicate key error
            raise Exception("duplicate key value violates unique constraint")

    mock_supabase.table.return_value.insert.return_value.execute = mock_insert_then_duplicate

    # Mock SELECT for fallback when duplicate is detected
    mock_select_result = MagicMock()
    mock_select_result.data = [
        {
            "id": "550e8400-e29b-41d4-a716-446655440011",  # Valid UUID
            "auth_user_id": auth_user_id,
            "display_name": "Test User",
            "timezone": "UTC",
            "locale": "en-US",
        }
    ]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = (
        mock_select_result
    )

    # Create two concurrent profile creation tasks
    task1 = create_user_profile(mock_supabase, auth_user_id, "Test User")
    task2 = create_user_profile(mock_supabase, auth_user_id, "Test User 2")

    # Run both tasks (one should handle duplicate gracefully)
    results = await asyncio.gather(task1, task2, return_exceptions=True)

    # Both should return successfully (no exceptions)
    assert len(results) == 2
    assert all(not isinstance(r, Exception) for r in results)

    # Both should return the same profile
    assert results[0]["auth_user_id"] == auth_user_id
    assert results[1]["auth_user_id"] == auth_user_id


# ============================================================================
# Analytics Event Tests
# ============================================================================


def test_track_analytics_event_without_auth():
    """Test that analytics events can be tracked without authentication (pre-auth events)."""
    with patch("app.services.analytics.track_event") as mock_track:
        mock_track.return_value = {
            "id": "550e8400-e29b-41d4-a716-446655440000",  # Valid UUID
            "event_name": "onboarding_started",
            "user_id": None,
            "timestamp": "2025-12-20T00:00:00Z",
        }

        response = client.post(
            "/api/analytics/events",
            json={
                "event_name": "onboarding_started",
                "event_data": {"device_type": "iPhone 14"},
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["event_name"] == "onboarding_started"
        assert data["user_id"] is None  # Pre-auth event


def test_track_analytics_event_with_user_id():
    """Test that analytics events can include user_id for authenticated events."""
    with patch("app.services.analytics.track_event") as mock_track:
        mock_track.return_value = {
            "id": "550e8400-e29b-41d4-a716-446655440001",  # Valid UUID
            "event_name": "goal_created",
            "user_id": "550e8400-e29b-41d4-a716-446655440002",  # Valid UUID
            "timestamp": "2025-12-20T00:00:00Z",
        }

        response = client.post(
            "/api/analytics/events",
            json={
                "event_name": "goal_created",
                "user_id": "550e8400-e29b-41d4-a716-446655440002",  # Valid UUID
                "event_data": {"goal_type": "habit"},
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["event_name"] == "goal_created"
        assert str(data["user_id"]) == "550e8400-e29b-41d4-a716-446655440002"


def test_track_analytics_event_invalid_name():
    """Test that analytics endpoint returns 422 for invalid event names (Pydantic validation)."""
    # Event name too long (>100 chars)
    response = client.post(
        "/api/analytics/events",
        json={"event_name": "a" * 101, "event_data": {}},
    )

    assert response.status_code == 422  # Pydantic validation errors return 422
    # Check that the error is about validation
    assert "detail" in response.json()


# ============================================================================
# Security Best Practices Tests
# ============================================================================


def test_cannot_create_profile_for_different_user(valid_jwt_token):
    """Test that users cannot create profiles for other users by spoofing request."""
    # Even if client tries to send a different auth_user_id, it should be ignored
    # and the JWT's sub field should be used instead
    with patch("app.services.user_profile.create_user_profile") as mock_create:
        mock_create.return_value = {
            "id": "550e8400-e29b-41d4-a716-446655440012",  # Valid UUID
            "auth_user_id": "test-user-123",  # From JWT
            "display_name": "Test User",
            "timezone": "UTC",
            "locale": "en-US",
            "created_at": "2025-12-20T00:00:00Z",
            "updated_at": "2025-12-20T00:00:00Z",
        }

        response = client.post(
            "/api/user/profile",
            headers={"Authorization": f"Bearer {valid_jwt_token}"},
            json={
                "display_name": "Malicious User",
                # No auth_user_id in request body - removed from model
            },
        )

        assert response.status_code == 201

        # Verify that the service was called with JWT's user_id, not request body
        call_kwargs = mock_create.call_args[1]
        assert call_kwargs["auth_user_id"] == "test-user-123"  # From JWT sub field


def test_jwt_secret_not_configured():
    """Test that endpoints fail gracefully when JWT secret is not configured."""
    with patch.dict(os.environ, {"SUPABASE_JWT_SECRET": ""}):
        # Force reload settings
        with patch("app.core.deps.settings") as mock_settings:
            mock_settings.SUPABASE_JWT_SECRET = None

            response = client.get(
                "/api/user/me",
                headers={"Authorization": "Bearer some-token"},
            )

            assert response.status_code == 500
            assert "not configured" in response.json()["detail"].lower()

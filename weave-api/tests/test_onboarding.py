"""
Tests for onboarding endpoints (Stories 1.2, 1.3, 1.6).

Tests cover:
- Painpoint selection (Story 1.2)
- Identity bootup data submission (Story 1.6)
  - Valid data with authentication
  - Missing authentication
  - Invalid name format
  - Invalid personality type
  - Invalid trait selection (wrong count, invalid traits, duplicates)
  - User profile not found
"""

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
def valid_identity_bootup_payload():
    """Valid payload for identity bootup endpoint."""
    return {
        "preferred_name": "Alex",
        "core_personality": "supportive_direct",
        "identity_traits": ["Disciplined", "Focused", "Resilient"],
    }


# ============================================================================
# Story 1.6: Identity Bootup Tests
# ============================================================================


def test_identity_bootup_without_auth():
    """Test that identity bootup endpoint requires authentication."""
    payload = {
        "preferred_name": "Alex",
        "core_personality": "supportive_direct",
        "identity_traits": ["Disciplined", "Focused", "Resilient"],
    }

    response = client.post("/api/onboarding/identity-bootup", json=payload)

    assert response.status_code == 401  # Unauthorized
    assert "detail" in response.json()


@patch("app.services.onboarding.store_identity_bootup")
def test_identity_bootup_success(
    mock_store, valid_jwt_token, valid_identity_bootup_payload
):
    """Test successful identity bootup data submission."""
    # Mock the service layer response
    mock_store.return_value = {
        "success": True,
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "preferred_name": "Alex",
        "core_personality": "supportive_direct",
        "identity_traits": ["Disciplined", "Focused", "Resilient"],
        "personality_selected_at": datetime.now(timezone.utc).isoformat(),
    }

    # Make request
    response = client.post(
        "/api/onboarding/identity-bootup",
        json=valid_identity_bootup_payload,
        headers={"Authorization": f"Bearer {valid_jwt_token}"},
    )

    # Assertions
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["preferred_name"] == "Alex"
    assert data["core_personality"] == "supportive_direct"
    assert data["identity_traits"] == ["Disciplined", "Focused", "Resilient"]
    assert "personality_selected_at" in data
    assert "user_id" in data


def test_identity_bootup_invalid_name_too_long(valid_jwt_token):
    """Test identity bootup with name exceeding 50 characters."""
    payload = {
        "preferred_name": "A" * 51,  # 51 characters
        "core_personality": "supportive_direct",
        "identity_traits": ["Disciplined", "Focused", "Resilient"],
    }

    response = client.post(
        "/api/onboarding/identity-bootup",
        json=payload,
        headers={"Authorization": f"Bearer {valid_jwt_token}"},
    )

    assert response.status_code == 422  # Validation error
    assert "detail" in response.json()


def test_identity_bootup_invalid_name_special_chars(valid_jwt_token):
    """Test identity bootup with invalid special characters in name."""
    payload = {
        "preferred_name": "Alex@123!",  # Invalid characters
        "core_personality": "supportive_direct",
        "identity_traits": ["Disciplined", "Focused", "Resilient"],
    }

    response = client.post(
        "/api/onboarding/identity-bootup",
        json=payload,
        headers={"Authorization": f"Bearer {valid_jwt_token}"},
    )

    assert response.status_code == 422  # Validation error
    assert "detail" in response.json()


def test_identity_bootup_invalid_personality(valid_jwt_token):
    """Test identity bootup with invalid personality type."""
    payload = {
        "preferred_name": "Alex",
        "core_personality": "invalid_personality",  # Invalid type
        "identity_traits": ["Disciplined", "Focused", "Resilient"],
    }

    response = client.post(
        "/api/onboarding/identity-bootup",
        json=payload,
        headers={"Authorization": f"Bearer {valid_jwt_token}"},
    )

    assert response.status_code == 422  # Validation error
    assert "detail" in response.json()


def test_identity_bootup_too_few_traits(valid_jwt_token):
    """Test identity bootup with too few traits (< 3)."""
    payload = {
        "preferred_name": "Alex",
        "core_personality": "supportive_direct",
        "identity_traits": ["Disciplined", "Focused"],  # Only 2 traits
    }

    response = client.post(
        "/api/onboarding/identity-bootup",
        json=payload,
        headers={"Authorization": f"Bearer {valid_jwt_token}"},
    )

    assert response.status_code == 422  # Validation error
    assert "detail" in response.json()


def test_identity_bootup_too_many_traits(valid_jwt_token):
    """Test identity bootup with too many traits (> 5)."""
    payload = {
        "preferred_name": "Alex",
        "core_personality": "supportive_direct",
        "identity_traits": [
            "Disciplined",
            "Focused",
            "Resilient",
            "Creative",
            "Confident",
            "Calm",  # 6 traits
        ],
    }

    response = client.post(
        "/api/onboarding/identity-bootup",
        json=payload,
        headers={"Authorization": f"Bearer {valid_jwt_token}"},
    )

    assert response.status_code == 422  # Validation error
    assert "detail" in response.json()


def test_identity_bootup_invalid_trait(valid_jwt_token):
    """Test identity bootup with invalid trait name."""
    payload = {
        "preferred_name": "Alex",
        "core_personality": "supportive_direct",
        "identity_traits": [
            "Disciplined",
            "Focused",
            "InvalidTrait",  # Not in allowed list
        ],
    }

    response = client.post(
        "/api/onboarding/identity-bootup",
        json=payload,
        headers={"Authorization": f"Bearer {valid_jwt_token}"},
    )

    assert response.status_code == 422  # Validation error
    assert "detail" in response.json()


def test_identity_bootup_duplicate_traits(valid_jwt_token):
    """Test identity bootup with duplicate traits."""
    payload = {
        "preferred_name": "Alex",
        "core_personality": "supportive_direct",
        "identity_traits": [
            "Disciplined",
            "Focused",
            "Disciplined",  # Duplicate
        ],
    }

    response = client.post(
        "/api/onboarding/identity-bootup",
        json=payload,
        headers={"Authorization": f"Bearer {valid_jwt_token}"},
    )

    assert response.status_code == 422  # Validation error
    assert "detail" in response.json()


@patch("app.services.onboarding.store_identity_bootup")
def test_identity_bootup_user_not_found(
    mock_store, valid_jwt_token, valid_identity_bootup_payload
):
    """Test identity bootup when user profile doesn't exist."""
    # Mock service to raise ValueError for user not found
    mock_store.side_effect = ValueError("User profile not found for auth_user_id: test-user-123")

    # Make request
    response = client.post(
        "/api/onboarding/identity-bootup",
        json=valid_identity_bootup_payload,
        headers={"Authorization": f"Bearer {valid_jwt_token}"},
    )

    # Assertions
    assert response.status_code == 404  # Not found
    assert "detail" in response.json()
    assert "not found" in response.json()["detail"].lower()


def test_identity_bootup_missing_fields(valid_jwt_token):
    """Test identity bootup with missing required fields."""
    payload = {
        "preferred_name": "Alex",
        # Missing core_personality and identity_traits
    }

    response = client.post(
        "/api/onboarding/identity-bootup",
        json=payload,
        headers={"Authorization": f"Bearer {valid_jwt_token}"},
    )

    assert response.status_code == 422  # Validation error
    assert "detail" in response.json()

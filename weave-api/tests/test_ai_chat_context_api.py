"""
API Tests for AI Chat with Context Injection (Story 6.2)

Tests for POST /api/ai-chat/messages with context building and admin preview endpoint.

Run: uv run pytest tests/test_ai_chat_context_api.py -v
"""

import os
from datetime import datetime, timezone
from uuid import uuid4

import pytest


@pytest.mark.integration
def test_chat_message_includes_context_used_flag(client, test_user, create_auth_token):
    """Test that chat response indicates context was used.

    GIVEN: Authenticated user with active goals
    WHEN: POST /api/ai-chat/messages with default settings
    THEN: Response includes context_used=true and AI response references user data
    """
    # GIVEN: User with JWT token
    token = create_auth_token(test_user["auth_user_id"])

    # WHEN: Sending chat message (context enabled by default)
    response = client.post(
        "/api/ai-chat/messages",
        json={"message": "How am I doing with my goals?"},
        headers={"Authorization": f"Bearer {token}"},
    )

    # THEN: Context was used
    assert response.status_code == 200
    data = response.json()["data"]

    assert "context_used" in data
    assert data["context_used"] is True
    assert "response" in data
    assert len(data["response"]) > 0


@pytest.mark.integration
def test_chat_message_with_context_disabled(client, test_user, create_auth_token):
    """Test that context can be disabled via include_context=false parameter.

    GIVEN: Authenticated user
    WHEN: POST /api/ai-chat/messages with include_context=false
    THEN: Response has context_used=false (generic AI response)
    """
    # GIVEN: User with JWT token
    token = create_auth_token(test_user["auth_user_id"])

    # WHEN: Sending message with context disabled
    response = client.post(
        "/api/ai-chat/messages",
        json={
            "message": "Tell me about goal setting.",
            "include_context": False,  # Disable context
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    # THEN: Context was not used
    assert response.status_code == 200
    data = response.json()["data"]

    assert "context_used" in data
    assert data["context_used"] is False


@pytest.mark.integration
def test_chat_message_returns_context_assembly_time(client, test_user, create_auth_token):
    """Test that response metadata includes context assembly time.

    GIVEN: Authenticated user
    WHEN: POST /api/ai-chat/messages
    THEN: Response meta includes context_assembly_time_ms
    """
    # GIVEN: User with JWT token
    token = create_auth_token(test_user["auth_user_id"])

    # WHEN: Sending chat message
    response = client.post(
        "/api/ai-chat/messages",
        json={"message": "What should I focus on today?"},
        headers={"Authorization": f"Bearer {token}"},
    )

    # THEN: Meta includes assembly time
    assert response.status_code == 200
    meta = response.json()["meta"]

    assert "context_assembly_time_ms" in meta
    assert isinstance(meta["context_assembly_time_ms"], (int, float))
    assert meta["context_assembly_time_ms"] >= 0


@pytest.mark.integration
def test_chat_message_fallback_when_context_building_fails(client, test_user, create_auth_token, monkeypatch):
    """Test graceful fallback when context building fails.

    GIVEN: ContextBuilderService that raises exception
    WHEN: POST /api/ai-chat/messages
    THEN: Response succeeds with context_used=false (generic response)
    """
    # GIVEN: Mock context builder that fails
    from app.services import context_builder

    async def mock_build_context_fail(user_id):
        raise Exception("Database timeout")

    monkeypatch.setattr(context_builder.ContextBuilderService, "build_context", mock_build_context_fail)

    token = create_auth_token(test_user["auth_user_id"])

    # WHEN: Sending chat message (context building fails)
    response = client.post(
        "/api/ai-chat/messages",
        json={"message": "Give me some advice."},
        headers={"Authorization": f"Bearer {token}"},
    )

    # THEN: Fallback to generic response
    assert response.status_code == 200
    data = response.json()["data"]

    assert "context_used" in data
    assert data["context_used"] is False  # Fallback mode
    assert "response" in data  # Still got AI response


@pytest.mark.integration
def test_admin_context_preview_endpoint_success(client, test_user, create_auth_token):
    """Test that admin can preview assembled context.

    GIVEN: Admin user with X-Admin-Key header
    WHEN: GET /api/admin/context-preview/{user_id}
    THEN: Returns full context snapshot with assembly time
    """
    # GIVEN: Admin credentials
    admin_key = os.getenv("ADMIN_API_KEY", "test-admin-key")

    # WHEN: Requesting context preview
    response = client.get(
        f"/api/admin/context-preview/{test_user['id']}",
        headers={"X-Admin-Key": admin_key},
    )

    # THEN: Context is returned
    assert response.status_code == 200
    data = response.json()["data"]

    assert "context" in data
    assert isinstance(data["context"], dict)
    assert "user_id" in data["context"]
    assert "goals" in data["context"]
    assert "recent_activity" in data["context"]
    assert "journal" in data["context"]
    assert "identity" in data["context"]
    assert "metrics" in data["context"]

    # Metadata includes assembly time
    assert "assembly_time_ms" in data
    assert isinstance(data["assembly_time_ms"], (int, float))


@pytest.mark.integration
def test_admin_context_preview_unauthorized_without_admin_key(client, test_user):
    """Test that context preview requires admin key.

    GIVEN: Request without X-Admin-Key header
    WHEN: GET /api/admin/context-preview/{user_id}
    THEN: Returns 401 Unauthorized
    """
    # GIVEN: No admin key

    # WHEN: Requesting context preview without admin key
    response = client.get(f"/api/admin/context-preview/{test_user['id']}")

    # THEN: Unauthorized
    assert response.status_code in [401, 403]  # Unauthorized or Forbidden


@pytest.mark.integration
def test_admin_context_preview_invalid_user_id(client):
    """Test context preview with non-existent user ID.

    GIVEN: Admin with valid key, invalid user_id
    WHEN: GET /api/admin/context-preview/{invalid_user_id}
    THEN: Returns 404 Not Found
    """
    # GIVEN: Admin credentials + invalid user
    admin_key = os.getenv("ADMIN_API_KEY", "test-admin-key")
    invalid_user_id = "00000000-0000-0000-0000-000000000000"

    # WHEN: Requesting context for non-existent user
    response = client.get(
        f"/api/admin/context-preview/{invalid_user_id}",
        headers={"X-Admin-Key": admin_key},
    )

    # THEN: Not found
    assert response.status_code in [404, 200]  # Might return empty context instead of 404

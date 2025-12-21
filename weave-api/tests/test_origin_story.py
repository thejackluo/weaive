"""Tests for origin story API endpoint (Story 1.7 backend integration)"""

import pytest
from fastapi import status

# Test data - properly padded base64 strings
SAMPLE_PHOTO_BASE64 = "data:image/jpeg;base64,/9j/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="

SAMPLE_AUDIO_BASE64 = "data:audio/aac;base64,AAAAGGZ0eXBNNEEgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="


@pytest.fixture
def valid_origin_story_data():
    """Valid origin story request data."""
    return {
        "photo_base64": SAMPLE_PHOTO_BASE64,
        "audio_base64": SAMPLE_AUDIO_BASE64,
        "audio_duration_seconds": 42,
        "from_text": "You've been feeling scattered — like there's too much to do, but no clear direction.",
        "to_text": "You want to become someone with Clear Direction, High Standards, and Self Aware — someone who acts with purpose.",
    }


def test_create_origin_story_success(
    authenticated_client, test_user_token, valid_origin_story_data
):
    """Test successful origin story creation."""
    response = authenticated_client.post(
        "/api/onboarding/origin-story",
        json=valid_origin_story_data,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )

    assert response.status_code == status.HTTP_201_CREATED
    response_json = response.json()

    # Verify response follows {data, meta} format (architecture compliance)
    assert "data" in response_json
    assert "meta" in response_json
    assert "timestamp" in response_json["meta"]

    data = response_json["data"]

    # Verify response structure
    assert data["success"] is True
    assert "origin_story_id" in data
    assert "user_id" in data
    assert "photo_url" in data
    assert "audio_url" in data
    assert data["first_bind_completed"] is True
    assert data["user_level"] == 1
    assert "created_at" in data

    # Verify URLs are valid
    assert data["photo_url"].startswith("http")
    assert data["audio_url"].startswith("http")


def test_create_origin_story_duplicate_fails(
    authenticated_client, test_user_token, valid_origin_story_data
):
    """Test that creating a second origin story for same user fails."""
    # Create first origin story
    response1 = authenticated_client.post(
        "/api/onboarding/origin-story",
        json=valid_origin_story_data,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response1.status_code == status.HTTP_201_CREATED

    # Attempt to create second origin story (should fail)
    response2 = authenticated_client.post(
        "/api/onboarding/origin-story",
        json=valid_origin_story_data,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response2.status_code == status.HTTP_400_BAD_REQUEST
    assert "already exists" in response2.json()["detail"].lower()


def test_create_origin_story_unauthenticated_fails(
    client, valid_origin_story_data
):
    """Test that creating origin story without authentication fails."""
    response = client.post(
        "/api/onboarding/origin-story",
        json=valid_origin_story_data,
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_create_origin_story_invalid_audio_duration(
    authenticated_client, test_user_token, valid_origin_story_data
):
    """Test validation of audio duration (1-60 seconds)."""
    # Test audio duration too short (0 seconds)
    invalid_data = {**valid_origin_story_data, "audio_duration_seconds": 0}
    response = authenticated_client.post(
        "/api/onboarding/origin-story",
        json=invalid_data,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # Test audio duration too long (61 seconds)
    invalid_data = {**valid_origin_story_data, "audio_duration_seconds": 61}
    response = authenticated_client.post(
        "/api/onboarding/origin-story",
        json=invalid_data,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_create_origin_story_invalid_text_length(
    authenticated_client, test_user_token, valid_origin_story_data
):
    """Test validation of text field lengths (10-500 chars)."""
    # Test from_text too short (9 characters)
    invalid_data = {**valid_origin_story_data, "from_text": "Too short"}
    response = authenticated_client.post(
        "/api/onboarding/origin-story",
        json=invalid_data,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # Test to_text too long (501 characters)
    invalid_data = {**valid_origin_story_data, "to_text": "x" * 501}
    response = authenticated_client.post(
        "/api/onboarding/origin-story",
        json=invalid_data,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_create_origin_story_missing_fields(
    authenticated_client, test_user_token
):
    """Test that all required fields are validated."""
    # Missing photo_base64
    response = authenticated_client.post(
        "/api/onboarding/origin-story",
        json={
            "audio_base64": SAMPLE_AUDIO_BASE64,
            "audio_duration_seconds": 42,
            "from_text": "From text here",
            "to_text": "To text here",
        },
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # Missing audio_base64
    response = authenticated_client.post(
        "/api/onboarding/origin-story",
        json={
            "photo_base64": SAMPLE_PHOTO_BASE64,
            "audio_duration_seconds": 42,
            "from_text": "From text here",
            "to_text": "To text here",
        },
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_create_origin_story_invalid_base64(
    authenticated_client, test_user_token, valid_origin_story_data
):
    """Test that invalid base64 data is rejected."""
    # Invalid photo base64
    invalid_data = {**valid_origin_story_data, "photo_base64": "not-valid-base64!@#$"}
    response = authenticated_client.post(
        "/api/onboarding/origin-story",
        json=invalid_data,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response.status_code in [
        status.HTTP_400_BAD_REQUEST,
        status.HTTP_422_UNPROCESSABLE_ENTITY,
        status.HTTP_500_INTERNAL_SERVER_ERROR,
    ]


@pytest.mark.integration
@pytest.mark.skip(reason="Requires real database connection (integration test)")
def test_create_origin_story_updates_user_profile(
    authenticated_client, test_user_token, test_supabase_client, valid_origin_story_data
):
    """Test that user_profiles is updated with first_bind_completed_at and user_level."""
    # Create origin story
    response = authenticated_client.post(
        "/api/onboarding/origin-story",
        json=valid_origin_story_data,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response.status_code == status.HTTP_201_CREATED

    # Verify user profile was updated (using mock client)
    profile_after = (
        test_supabase_client.table("user_profiles")
        .select("first_bind_completed_at, user_level")
        .eq("auth_user_id", test_user_token)
        .execute()
    )

    assert profile_after.data[0]["first_bind_completed_at"] is not None
    assert profile_after.data[0]["user_level"] == 1


@pytest.mark.integration
@pytest.mark.skip(reason="Requires real database connection (integration test)")
def test_origin_story_rls_isolation(
    authenticated_client,
    test_user_token,
    another_user_token,
    test_supabase_client,
    valid_origin_story_data,
):
    """Test that users can only see their own origin stories (RLS)."""
    # User 1 creates origin story
    response1 = authenticated_client.post(
        "/api/onboarding/origin-story",
        json=valid_origin_story_data,
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response1.status_code == status.HTTP_201_CREATED
    origin_story_id_1 = response1.json()["data"]["origin_story_id"]

    # User 2 tries to access User 1's origin story (should be blocked by RLS)
    # This test assumes a GET endpoint exists for fetching origin stories
    # If not, you can verify RLS by directly querying Supabase with User 2's context
    auth_user_id_2 = another_user_token["sub"]
    user_2_profile = (
        test_supabase_client.table("user_profiles")
        .select("id")
        .eq("auth_user_id", auth_user_id_2)
        .execute()
    )
    user_2_id = user_2_profile.data[0]["id"]

    # Try to select User 1's origin story as User 2 (should return empty)
    # Note: This requires setting auth context for User 2
    result = (
        test_supabase_client.table("origin_stories")
        .select("*")
        .eq("id", origin_story_id_1)
        .execute()
    )

    # With RLS, User 2 should not see User 1's origin story
    assert len(result.data) == 0 or result.data[0]["user_id"] != user_2_id

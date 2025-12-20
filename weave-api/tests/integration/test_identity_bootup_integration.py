"""
Integration tests for identity bootup endpoint (Story 1.6).

These tests verify the FULL STACK behavior:
- Real HTTP requests to API
- Real JWT authentication
- Real database writes to Supabase
- Data persistence and retrieval

Run with: pytest tests/integration/test_identity_bootup_integration.py -v -m integration

Requirements:
- Supabase test database configured
- SUPABASE_URL and SUPABASE_SERVICE_KEY in environment
- Test user profiles created in database
"""

from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient
from supabase import Client, create_client

from app.core.config import settings
from app.main import app
from tests.support.factories.user_factory import create_test_jwt, create_test_user

client = TestClient(app)


# ============================================================================
# Fixtures
# ============================================================================


@pytest.fixture
def test_user_with_token(test_supabase_client: Client):
    """
    Create a real test user in Supabase and generate a valid JWT token.

    This fixture:
    1. Creates a test user in auth.users
    2. Creates user_profiles entry
    3. Generates a valid JWT token
    4. Yields (user_id, auth_user_id, jwt_token)
    5. Cleans up user after test
    """
    # Create test user with real database write
    user_data = create_test_user(test_supabase_client)
    user_id = user_data["user_id"]
    auth_user_id = user_data["auth_user_id"]
    email = user_data["email"]

    # Generate JWT token for this user
    jwt_token = create_test_jwt(auth_user_id, email)

    yield {
        "user_id": user_id,
        "auth_user_id": auth_user_id,
        "email": email,
        "jwt_token": jwt_token,
    }

    # Cleanup: Delete user from user_profiles and auth.users
    # NOTE: This requires admin privileges
    try:
        test_supabase_client.table("user_profiles").delete().eq("id", user_id).execute()
        # TODO: Delete from auth.users using admin API if available
    except Exception as e:
        print(f"Warning: Failed to cleanup user {user_id}: {e}")


@pytest.fixture
def valid_identity_bootup_data():
    """Valid identity bootup payload matching acceptance criteria."""
    return {
        "preferred_name": "Alex",
        "core_personality": "supportive_direct",
        "identity_traits": ["Clear Direction", "High Standards", "Self Aware"],
    }


# ============================================================================
# Integration Tests - Happy Path
# ============================================================================


@pytest.mark.integration
def test_identity_bootup_full_stack_success(test_user_with_token, valid_identity_bootup_data):
    """
    Test FULL STACK: API → Service → Database → Response

    GIVEN: A real authenticated user
    WHEN: User submits valid identity bootup data
    THEN: Data is written to database and success response returned
    """
    # GIVEN: Authenticated user with JWT token
    jwt_token = test_user_with_token["jwt_token"]
    user_id = test_user_with_token["user_id"]

    # WHEN: Submit identity bootup data to API
    response = client.post(
        "/api/onboarding/identity-bootup",
        json=valid_identity_bootup_data,
        headers={"Authorization": f"Bearer {jwt_token}"},
    )

    # THEN: API returns 200 success
    assert response.status_code == 200
    data = response.json()

    # THEN: Response contains all submitted data
    assert data["success"] is True
    assert data["preferred_name"] == "Alex"
    assert data["core_personality"] == "supportive_direct"
    assert data["identity_traits"] == ["Clear Direction", "High Standards", "Self Aware"]
    assert "personality_selected_at" in data
    assert data["user_id"] == user_id

    # THEN: Verify data was written to database
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    db_result = supabase.table("user_profiles").select("*").eq("id", user_id).single().execute()

    assert db_result.data is not None
    assert db_result.data["preferred_name"] == "Alex"
    assert db_result.data["core_personality"] == "supportive_direct"
    assert db_result.data["identity_traits"] == ["Clear Direction", "High Standards", "Self Aware"]
    assert db_result.data["personality_selected_at"] is not None


@pytest.mark.integration
def test_identity_bootup_with_minimum_traits(test_user_with_token):
    """
    Test identity bootup with exactly 3 traits (required count).

    GIVEN: A real authenticated user
    WHEN: User selects exactly 3 traits
    THEN: Data is accepted and written to database
    """
    # GIVEN
    jwt_token = test_user_with_token["jwt_token"]
    user_id = test_user_with_token["user_id"]

    payload = {
        "preferred_name": "Min",
        "core_personality": "tough_warm",
        "identity_traits": ["Decisive Action", "Consistent Effort", "Continuous Growth"],  # Exactly 3
    }

    # WHEN
    response = client.post(
        "/api/onboarding/identity-bootup",
        json=payload,
        headers={"Authorization": f"Bearer {jwt_token}"},
    )

    # THEN
    assert response.status_code == 200
    data = response.json()
    assert len(data["identity_traits"]) == 3

    # Verify in database
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    db_result = supabase.table("user_profiles").select("identity_traits").eq("id", user_id).single().execute()
    assert len(db_result.data["identity_traits"]) == 3


@pytest.mark.integration
def test_identity_bootup_with_too_many_traits(test_user_with_token):
    """
    Test identity bootup with more than 3 traits (validation error expected).

    GIVEN: A real authenticated user
    WHEN: User selects more than 3 traits
    THEN: 422 validation error is returned
    """
    # GIVEN
    jwt_token = test_user_with_token["jwt_token"]

    payload = {
        "preferred_name": "Max",
        "core_personality": "supportive_direct",
        "identity_traits": [
            "Clear Direction",
            "Intentional Time",
            "Decisive Action",
            "Consistent Effort",
        ],  # 4 traits - too many
    }

    # WHEN
    response = client.post(
        "/api/onboarding/identity-bootup",
        json=payload,
        headers={"Authorization": f"Bearer {jwt_token}"},
    )

    # THEN
    assert response.status_code == 422


@pytest.mark.integration
def test_identity_bootup_with_apostrophe_in_name(test_user_with_token):
    """
    Test identity bootup with apostrophe in name (e.g., O'Brien).

    GIVEN: A real authenticated user
    WHEN: User enters name with apostrophe
    THEN: Name is accepted and written to database
    """
    # GIVEN
    jwt_token = test_user_with_token["jwt_token"]
    user_id = test_user_with_token["user_id"]

    payload = {
        "preferred_name": "O'Brien",  # Apostrophe allowed
        "core_personality": "supportive_direct",
        "identity_traits": ["Clear Direction", "High Standards", "Self Aware"],
    }

    # WHEN
    response = client.post(
        "/api/onboarding/identity-bootup",
        json=payload,
        headers={"Authorization": f"Bearer {jwt_token}"},
    )

    # THEN
    assert response.status_code == 200
    data = response.json()
    assert data["preferred_name"] == "O'Brien"

    # Verify in database
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    db_result = supabase.table("user_profiles").select("preferred_name").eq("id", user_id).single().execute()
    assert db_result.data["preferred_name"] == "O'Brien"


@pytest.mark.integration
def test_identity_bootup_with_hyphen_in_name(test_user_with_token):
    """
    Test identity bootup with hyphen in name (e.g., Mary-Jane).

    GIVEN: A real authenticated user
    WHEN: User enters name with hyphen
    THEN: Name is accepted and written to database
    """
    # GIVEN
    jwt_token = test_user_with_token["jwt_token"]
    user_id = test_user_with_token["user_id"]

    payload = {
        "preferred_name": "Mary-Jane",  # Hyphen allowed
        "core_personality": "tough_warm",
        "identity_traits": ["Decisive Action", "Intentional Time", "Emotionally Grounded"],
    }

    # WHEN
    response = client.post(
        "/api/onboarding/identity-bootup",
        json=payload,
        headers={"Authorization": f"Bearer {jwt_token}"},
    )

    # THEN
    assert response.status_code == 200
    data = response.json()
    assert data["preferred_name"] == "Mary-Jane"

    # Verify in database
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    db_result = supabase.table("user_profiles").select("preferred_name").eq("id", user_id).single().execute()
    assert db_result.data["preferred_name"] == "Mary-Jane"


@pytest.mark.integration
def test_identity_bootup_tough_warm_personality(test_user_with_token):
    """
    Test identity bootup with 'tough_warm' personality type.

    GIVEN: A real authenticated user
    WHEN: User selects tough_warm personality
    THEN: Personality is stored correctly in database
    """
    # GIVEN
    jwt_token = test_user_with_token["jwt_token"]
    user_id = test_user_with_token["user_id"]

    payload = {
        "preferred_name": "Tough",
        "core_personality": "tough_warm",  # Second personality option
        "identity_traits": ["Consistent Effort", "Continuous Growth", "Emotionally Grounded"],
    }

    # WHEN
    response = client.post(
        "/api/onboarding/identity-bootup",
        json=payload,
        headers={"Authorization": f"Bearer {jwt_token}"},
    )

    # THEN
    assert response.status_code == 200
    data = response.json()
    assert data["core_personality"] == "tough_warm"

    # Verify in database
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    db_result = supabase.table("user_profiles").select("core_personality").eq("id", user_id).single().execute()
    assert db_result.data["core_personality"] == "tough_warm"


# ============================================================================
# Integration Tests - Data Isolation & Idempotency
# ============================================================================


@pytest.mark.integration
def test_identity_bootup_data_isolation_between_users():
    """
    Test that identity bootup data is isolated between different users.

    GIVEN: Two different authenticated users
    WHEN: Both users submit identity bootup data
    THEN: Each user's data is stored separately without interference
    """
    # TODO: Create two test users
    # TODO: Submit different identity data for each
    # TODO: Verify both users have correct independent data
    pytest.skip("Requires multi-user fixture implementation")


@pytest.mark.integration
def test_identity_bootup_idempotency_update(test_user_with_token):
    """
    Test that identity bootup can be updated (idempotent operation).

    GIVEN: A user who already submitted identity bootup data
    WHEN: User submits new identity bootup data
    THEN: Previous data is overwritten with new data
    """
    # GIVEN: First submission
    jwt_token = test_user_with_token["jwt_token"]
    user_id = test_user_with_token["user_id"]

    first_payload = {
        "preferred_name": "First",
        "core_personality": "supportive_direct",
        "identity_traits": ["Clear Direction", "High Standards", "Self Aware"],
    }

    response1 = client.post(
        "/api/onboarding/identity-bootup",
        json=first_payload,
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert response1.status_code == 200

    # WHEN: Second submission with different data
    second_payload = {
        "preferred_name": "Second",
        "core_personality": "tough_warm",
        "identity_traits": ["Decisive Action", "Intentional Time", "Emotionally Grounded"],
    }

    response2 = client.post(
        "/api/onboarding/identity-bootup",
        json=second_payload,
        headers={"Authorization": f"Bearer {jwt_token}"},
    )

    # THEN: Second submission succeeds
    assert response2.status_code == 200
    data = response2.json()
    assert data["preferred_name"] == "Second"
    assert data["core_personality"] == "tough_warm"
    assert data["identity_traits"] == ["Decisive Action", "Intentional Time", "Emotionally Grounded"]

    # THEN: Database has only the second submission (overwritten)
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    db_result = supabase.table("user_profiles").select("*").eq("id", user_id).single().execute()

    assert db_result.data["preferred_name"] == "Second"
    assert db_result.data["core_personality"] == "tough_warm"
    assert db_result.data["identity_traits"] == ["Decisive Action", "Intentional Time", "Emotionally Grounded"]


# ============================================================================
# Integration Tests - All 8 Allowed Traits
# ============================================================================


@pytest.mark.integration
@pytest.mark.parametrize(
    "trait",
    [
        "Clear Direction",
        "Intentional Time",
        "Decisive Action",
        "Consistent Effort",
        "High Standards",
        "Continuous Growth",
        "Self Aware",
        "Emotionally Grounded",
    ],
)
def test_identity_bootup_all_allowed_traits(test_user_with_token, trait):
    """
    Test that all 8 allowed traits are accepted by the API.

    GIVEN: A real authenticated user
    WHEN: User selects a trait from the allowed list
    THEN: Trait is accepted and stored in database
    """
    # GIVEN
    jwt_token = test_user_with_token["jwt_token"]
    user_id = test_user_with_token["user_id"]

    # Select 3 traits including the parameterized trait
    other_traits = ["Clear Direction", "High Standards"]  # Default traits
    if trait in other_traits:
        # If parameterized trait is in defaults, use different ones
        other_traits = ["Decisive Action", "Self Aware"]

    payload = {
        "preferred_name": "TraitTest",
        "core_personality": "supportive_direct",
        "identity_traits": [trait, other_traits[0], other_traits[1]],
    }

    # WHEN
    response = client.post(
        "/api/onboarding/identity-bootup",
        json=payload,
        headers={"Authorization": f"Bearer {jwt_token}"},
    )

    # THEN
    assert response.status_code == 200
    data = response.json()
    assert trait in data["identity_traits"]

    # Verify in database
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    db_result = supabase.table("user_profiles").select("identity_traits").eq("id", user_id).single().execute()
    assert trait in db_result.data["identity_traits"]


# ============================================================================
# Integration Tests - Error Cases (Real Database)
# ============================================================================


@pytest.mark.integration
def test_identity_bootup_without_authentication():
    """
    Test that identity bootup requires authentication (no JWT token).

    GIVEN: No authentication token provided
    WHEN: Request is made to identity bootup endpoint
    THEN: 401 Unauthorized is returned
    """
    # GIVEN: Valid payload but no auth token
    payload = {
        "preferred_name": "NoAuth",
        "core_personality": "supportive_direct",
        "identity_traits": ["Clear Direction", "High Standards", "Self Aware"],
    }

    # WHEN
    response = client.post("/api/onboarding/identity-bootup", json=payload)

    # THEN
    assert response.status_code == 401
    assert "detail" in response.json()


@pytest.mark.integration
def test_identity_bootup_with_invalid_jwt():
    """
    Test that identity bootup rejects invalid JWT tokens.

    GIVEN: An invalid JWT token
    WHEN: Request is made with invalid token
    THEN: 401 Unauthorized is returned
    """
    # GIVEN: Valid payload but invalid token
    payload = {
        "preferred_name": "BadToken",
        "core_personality": "supportive_direct",
        "identity_traits": ["Clear Direction", "High Standards", "Self Aware"],
    }

    # WHEN
    response = client.post(
        "/api/onboarding/identity-bootup",
        json=payload,
        headers={"Authorization": "Bearer invalid_token_12345"},
    )

    # THEN
    assert response.status_code == 401
    assert "detail" in response.json()


# ============================================================================
# Timestamp Verification
# ============================================================================


@pytest.mark.integration
def test_identity_bootup_personality_timestamp_set(test_user_with_token, valid_identity_bootup_data):
    """
    Test that personality_selected_at timestamp is set correctly.

    GIVEN: A real authenticated user
    WHEN: User submits identity bootup data
    THEN: personality_selected_at is set to current time
    """
    # GIVEN
    jwt_token = test_user_with_token["jwt_token"]
    user_id = test_user_with_token["user_id"]
    before_timestamp = datetime.now(timezone.utc)

    # WHEN
    response = client.post(
        "/api/onboarding/identity-bootup",
        json=valid_identity_bootup_data,
        headers={"Authorization": f"Bearer {jwt_token}"},
    )

    after_timestamp = datetime.now(timezone.utc)

    # THEN
    assert response.status_code == 200
    data = response.json()
    personality_timestamp = datetime.fromisoformat(data["personality_selected_at"].replace("Z", "+00:00"))

    # Timestamp should be between before and after
    assert before_timestamp <= personality_timestamp <= after_timestamp

    # Verify in database
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    db_result = supabase.table("user_profiles").select("personality_selected_at").eq("id", user_id).single().execute()
    assert db_result.data["personality_selected_at"] is not None

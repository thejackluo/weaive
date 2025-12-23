"""Tests for journal entry API endpoints.

This test suite follows ATDD (Acceptance Test-Driven Development) principles.
All tests are initially FAILING (RED phase) and will guide implementation.

Story: 4.1 - Daily Reflection Entry
Coverage: AC #7, #9, #13 (Data Storage, Error Handling, Custom Responses)
"""

from datetime import date, timedelta

from fastapi.testclient import TestClient

from app.main import app
from tests.factories import create_test_journal_entry

client = TestClient(app)


class TestJournalEntryCreation:
    """Test suite for POST /api/journal-entries endpoint.

    These tests validate the core journal entry creation flow (AC #7).
    """

    def test_create_journal_entry_with_default_questions_only(
        self, client, create_auth_token, test_user
    ):
        """GIVEN: Valid journal entry data with only default questions
        WHEN: POST /api/journal-entries is called
        THEN: Journal entry is created successfully with 201 status

        Validates: AC #7 (Data Storage)
        """
        # GIVEN: Valid request payload
        payload = {
            "local_date": date.today().isoformat(),
            "fulfillment_score": 7,
            "default_responses": {
                "today_reflection": "Today was productive. I completed my morning routine and made progress on my goals.",
                "tomorrow_focus": "Tomorrow I will finish the presentation for the team meeting.",
            },
            "custom_responses": {},
        }

        # WHEN: Creating journal entry via API
        token = create_auth_token(user_id="test-user-123")
        response = client.post(
            "/api/journal-entries", json=payload, headers={"Authorization": f"Bearer {token}"}
        )

        # THEN: Entry created successfully
        assert response.status_code == 201
        data = response.json()

        # Validate response structure
        assert "data" in data
        assert "meta" in data

        # Validate journal entry data
        journal = data["data"]
        assert "id" in journal
        assert journal["fulfillment_score"] == 7
        assert (
            journal["default_responses"]["today_reflection"]
            == payload["default_responses"]["today_reflection"]
        )
        assert journal["local_date"] == payload["local_date"]

        # Validate metadata
        assert "timestamp" in data["meta"]

    def test_create_journal_entry_with_custom_questions(self, client, create_auth_token, test_user):
        """GIVEN: Valid journal entry with custom question responses
        WHEN: POST /api/journal-entries is called
        THEN: Custom responses are stored correctly in JSONB field

        Validates: AC #13 (Custom Responses Storage)
        """
        # GIVEN: Payload with custom questions
        payload = {
            "local_date": date.today().isoformat(),
            "fulfillment_score": 8,
            "default_responses": {
                "today_reflection": "Great day!",
                "tomorrow_focus": "Finish project",
            },
            "custom_responses": {
                "uuid-123": {"question_text": "Did I stick to my diet?", "response": "Yes"},
                "uuid-456": {"question_text": "Rate my energy level", "response": 9},
            },
        }

        # WHEN: Creating journal entry
        token = create_auth_token(user_id="test-user-123")
        response = client.post(
            "/api/journal-entries", json=payload, headers={"Authorization": f"Bearer {token}"}
        )

        # THEN: Custom responses stored correctly
        assert response.status_code == 201
        data = response.json()

        journal = data["data"]
        assert journal["custom_responses"]["uuid-123"]["question_text"] == "Did I stick to my diet?"
        assert journal["custom_responses"]["uuid-123"]["response"] == "Yes"
        assert journal["custom_responses"]["uuid-456"]["response"] == 9

    def test_create_journal_entry_with_minimal_data(self, client, create_auth_token, test_user):
        """GIVEN: Minimal valid data (only fulfillment score)
        WHEN: POST /api/journal-entries is called
        THEN: Entry created with empty default/custom responses

        Validates: AC #7 (default_responses can be empty)
        """
        # GIVEN: Minimal payload
        payload = {
            "local_date": date.today().isoformat(),
            "fulfillment_score": 5,
            "default_responses": {"today_reflection": "", "tomorrow_focus": ""},
            "custom_responses": {},
        }

        # WHEN: Creating journal entry
        token = create_auth_token(user_id="test-user-123")
        response = client.post(
            "/api/journal-entries", json=payload, headers={"Authorization": f"Bearer {token}"}
        )

        # THEN: Entry created successfully (fulfillment score is the only required field)
        assert response.status_code == 201
        data = response.json()

        journal = data["data"]
        assert journal["fulfillment_score"] == 5
        assert journal["default_responses"]["today_reflection"] == ""

    def test_journal_entry_updates_daily_aggregates(self, client, create_auth_token, test_user):
        """GIVEN: User submits journal entry for today
        WHEN: POST /api/journal-entries succeeds
        THEN: daily_aggregates.has_journal is set to true for today

        Validates: AC #7 (Update daily_aggregates)
        """
        # GIVEN: Valid journal entry
        payload = {
            "local_date": date.today().isoformat(),
            "fulfillment_score": 7,
            "default_responses": {
                "today_reflection": "Good day",
                "tomorrow_focus": "Continue momentum",
            },
            "custom_responses": {},
        }

        # WHEN: Creating journal entry
        token = create_auth_token(user_id="test-user-123")
        response = client.post(
            "/api/journal-entries", json=payload, headers={"Authorization": f"Bearer {token}"}
        )

        # THEN: Entry created and daily_aggregates updated
        assert response.status_code == 201

        # TODO: Query daily_aggregates table to verify has_journal = true
        # This requires database test fixtures


class TestJournalEntryValidation:
    """Test suite for request validation (AC #7, #9)."""

    def test_fulfillment_score_required(self, client, create_auth_token, test_user):
        """GIVEN: Journal entry without fulfillment_score
        WHEN: POST /api/journal-entries is called
        THEN: Returns 422 validation error

        Validates: AC #7 (fulfillment_score is required)
        """
        # GIVEN: Missing fulfillment_score
        payload = {
            "local_date": date.today().isoformat(),
            "default_responses": {"today_reflection": "Good day"},
            "custom_responses": {},
        }

        # WHEN: Creating journal entry
        token = create_auth_token(user_id="test-user-123")
        response = client.post(
            "/api/journal-entries", json=payload, headers={"Authorization": f"Bearer {token}"}
        )

        # THEN: Validation error
        assert response.status_code == 422
        error = response.json()
        assert "error" in error
        assert "fulfillment_score" in error["error"]["message"].lower()

    def test_fulfillment_score_range_validation(self, client, create_auth_token, test_user):
        """GIVEN: fulfillment_score outside 1-10 range
        WHEN: POST /api/journal-entries is called
        THEN: Returns 422 validation error

        Validates: AC #7 (fulfillment_score must be 1-10)
        """
        # Test score too low
        payload_low = {
            "local_date": date.today().isoformat(),
            "fulfillment_score": 0,
            "default_responses": {},
            "custom_responses": {},
        }

        token = create_auth_token(user_id="test-user-123")
        response = client.post(
            "/api/journal-entries", json=payload_low, headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 422

        # Test score too high
        payload_high = {
            "local_date": date.today().isoformat(),
            "fulfillment_score": 11,
            "default_responses": {},
            "custom_responses": {},
        }

        token = create_auth_token(user_id="test-user-123")
        response = client.post(
            "/api/journal-entries", json=payload_high, headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 422

    def test_local_date_required(self, client, create_auth_token, test_user):
        """GIVEN: Journal entry without local_date
        WHEN: POST /api/journal-entries is called
        THEN: Returns 422 validation error

        Validates: AC #7 (local_date is required)
        """
        # GIVEN: Missing local_date
        payload = {"fulfillment_score": 7, "default_responses": {}, "custom_responses": {}}

        # WHEN: Creating journal entry
        token = create_auth_token(user_id="test-user-123")
        response = client.post(
            "/api/journal-entries", json=payload, headers={"Authorization": f"Bearer {token}"}
        )

        # THEN: Validation error
        assert response.status_code == 422


class TestJournalEntryDuplicateHandling:
    """Test suite for duplicate entry handling (AC #7, #9)."""

    def test_duplicate_journal_entry_for_same_day(self, client, create_auth_token, test_user):
        """GIVEN: User already has journal entry for today
        WHEN: POST /api/journal-entries for same date
        THEN: Returns 409 Conflict with helpful error message

        Validates: AC #7 (unique constraint on user_id + local_date)
        Validates: AC #9 (duplicate entry error handling)
        """
        token = create_auth_token(user_id="test-user-123")

        # GIVEN: First journal entry created
        payload = {
            "local_date": date.today().isoformat(),
            "fulfillment_score": 7,
            "default_responses": {"today_reflection": "First entry"},
            "custom_responses": {},
        }

        first_response = client.post(
            "/api/journal-entries", json=payload, headers={"Authorization": f"Bearer {token}"}
        )
        assert first_response.status_code == 201

        # WHEN: Attempting to create second entry for same date
        payload["default_responses"]["today_reflection"] = "Second entry attempt"

        second_response = client.post(
            "/api/journal-entries", json=payload, headers={"Authorization": f"Bearer {token}"}
        )

        # THEN: Conflict error with helpful message
        assert second_response.status_code == 409
        error = second_response.json()

        assert "error" in error
        assert error["error"]["code"] == "DUPLICATE_JOURNAL_ENTRY"
        assert "already reflected today" in error["error"]["message"].lower()


class TestJournalEntryErrorHandling:
    """Test suite for error scenarios (AC #9)."""

    def test_unauthorized_request(self, client, create_auth_token, test_user):
        """GIVEN: Request without valid authentication token
        WHEN: POST /api/journal-entries is called
        THEN: Returns 401 Unauthorized

        Validates: AC #9 (authentication required)
        """
        # GIVEN: No auth token
        payload = {
            "local_date": date.today().isoformat(),
            "fulfillment_score": 7,
            "default_responses": {},
            "custom_responses": {},
        }

        # WHEN: Creating journal entry without auth
        response = client.post("/api/journal-entries", json=payload)

        # THEN: Unauthorized error
        assert response.status_code == 401

    def test_invalid_json_payload(self, client, create_auth_token, test_user):
        """GIVEN: Malformed JSON in request body
        WHEN: POST /api/journal-entries is called
        THEN: Returns 422 Unprocessable Entity (FastAPI's validation error)

        Validates: AC #9 (input validation)
        """
        # WHEN: Sending invalid JSON
        token = create_auth_token(user_id="test-user-123")
        response = client.post(
            "/api/journal-entries",
            data="invalid json data",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        )

        # THEN: Validation error (FastAPI returns 422 for invalid JSON)
        assert response.status_code == 422


class TestJournalEntryCustomResponseValidation:
    """Test suite for custom question response validation (AC #13)."""

    def test_custom_responses_with_text_type(self, client, create_auth_token, test_user):
        """GIVEN: Custom question with text response
        WHEN: POST /api/journal-entries is called
        THEN: Text response stored as string in JSONB

        Validates: AC #13 (text type custom responses)
        """
        # GIVEN: Text custom question
        payload = {
            "local_date": date.today().isoformat(),
            "fulfillment_score": 7,
            "default_responses": {},
            "custom_responses": {
                "uuid-text": {
                    "question_text": "What did I learn today?",
                    "response": "I learned about TDD and failing tests first",
                }
            },
        }

        # WHEN: Creating journal entry
        token = create_auth_token(user_id="test-user-123")
        response = client.post(
            "/api/journal-entries", json=payload, headers={"Authorization": f"Bearer {token}"}
        )

        # THEN: Text response stored correctly
        assert response.status_code == 201
        data = response.json()

        custom_resp = data["data"]["custom_responses"]["uuid-text"]
        assert isinstance(custom_resp["response"], str)
        assert custom_resp["response"] == "I learned about TDD and failing tests first"

    def test_custom_responses_with_numeric_type(self, client, create_auth_token, test_user):
        """GIVEN: Custom question with numeric response (1-10 slider)
        WHEN: POST /api/journal-entries is called
        THEN: Numeric response stored as integer in JSONB

        Validates: AC #13 (numeric type custom responses)
        """
        # GIVEN: Numeric custom question
        payload = {
            "local_date": date.today().isoformat(),
            "fulfillment_score": 7,
            "default_responses": {},
            "custom_responses": {
                "uuid-numeric": {"question_text": "Rate my productivity (1-10)", "response": 8}
            },
        }

        # WHEN: Creating journal entry
        token = create_auth_token(user_id="test-user-123")
        response = client.post(
            "/api/journal-entries", json=payload, headers={"Authorization": f"Bearer {token}"}
        )

        # THEN: Numeric response stored correctly
        assert response.status_code == 201
        data = response.json()

        custom_resp = data["data"]["custom_responses"]["uuid-numeric"]
        assert isinstance(custom_resp["response"], int)
        assert custom_resp["response"] == 8

    def test_custom_responses_with_boolean_type(self, client, create_auth_token, test_user):
        """GIVEN: Custom question with yes/no response
        WHEN: POST /api/journal-entries is called
        THEN: Boolean response stored correctly in JSONB

        Validates: AC #13 (yes/no type custom responses)
        """
        # GIVEN: Yes/No custom question
        payload = {
            "local_date": date.today().isoformat(),
            "fulfillment_score": 7,
            "default_responses": {},
            "custom_responses": {
                "uuid-bool": {
                    "question_text": "Did I exercise today?",
                    "response": "Yes",  # or True, depending on implementation
                }
            },
        }

        # WHEN: Creating journal entry
        token = create_auth_token(user_id="test-user-123")
        response = client.post(
            "/api/journal-entries", json=payload, headers={"Authorization": f"Bearer {token}"}
        )

        # THEN: Boolean response stored correctly
        assert response.status_code == 201
        data = response.json()

        custom_resp = data["data"]["custom_responses"]["uuid-bool"]
        assert custom_resp["response"] in ["Yes", "No", True, False]


class TestJournalEntryRetrieval:
    """Edge case: Journal entry retrieval and pre-population (Issue #9)"""

    def test_retrieve_existing_journal_entry_for_today(self, client, create_auth_token, test_user):
        """GIVEN: User already created a journal entry for today
        WHEN: GET /api/journal-entries?local_date=2025-12-20 is called
        THEN: Existing journal entry is returned with all saved responses

        Validates: Issue #9 - Journal pre-population edge case
        Purpose: Enable form pre-population when user returns to edit today's journal
        """
        # GIVEN: User already created a journal entry for today
        today = date.today().isoformat()
        _ = create_test_journal_entry(
            local_date=today,
            fulfillment_score=8,
            default_responses={
                "today_reflection": "Great day with lots of progress!",
                "tomorrow_focus": "Continue momentum on project",
            },
            custom_responses={"uuid-123": {"question_text": "Did I meditate?", "response": "Yes"}},
        )

        # Simulate existing entry in database (will be mocked in real implementation)
        # For now, just test the GET endpoint returns correct format

        # WHEN: Retrieving journal entry for today
        token = create_auth_token(user_id="test-user-123")
        response = client.get(
            "/api/journal-entries/today", headers={"Authorization": f"Bearer {token}"}
        )

        # THEN: Existing journal entry is returned
        assert response.status_code == 200
        data = response.json()

        assert data["data"]["local_date"] == today
        assert data["data"]["fulfillment_score"] == 8
        assert (
            data["data"]["default_responses"]["today_reflection"]
            == "Great day with lots of progress!"
        )
        assert data["data"]["custom_responses"]["uuid-123"]["response"] == "Yes"

    def test_retrieve_journal_entry_when_none_exists(self, client, create_auth_token, test_user):
        """GIVEN: No journal entry exists for today
        WHEN: GET /api/journal-entries?local_date=2025-12-20 is called
        THEN: 404 Not Found is returned (form should show empty state)

        Validates: Issue #9 - Empty state handling
        """
        # GIVEN: No journal entry exists for today

        # WHEN: Attempting to retrieve non-existent journal entry
        token = create_auth_token(user_id="test-user-123")
        response = client.get(
            "/api/journal-entries/today", headers={"Authorization": f"Bearer {token}"}
        )

        # THEN: 404 Not Found
        assert response.status_code == 404
        error = response.json()
        assert error["error"]["code"] == "JOURNAL_ENTRY_NOT_FOUND"
        assert "No journal entry found for" in error["error"]["message"]


class TestJournalEntryTimezoneEdgeCases:
    """Edge case: Timezone handling near midnight (Issue #9)"""

    def test_timezone_edge_case_journal_local_date(self, client, create_auth_token, test_user):
        """GIVEN: User in PST (UTC-8) submits journal at 11:58 PM PST (7:58 AM UTC next day)
        WHEN: POST /api/journal-entries with local_date="2025-12-20"
        THEN: Journal entry saved with local_date="2025-12-20" (not 2025-12-21)

        Validates: Issue #9 - Timezone edge case
        Purpose: Ensure user's local_date is respected, not server UTC date
        Critical: Prevents duplicate entry conflicts due to timezone differences
        """
        # GIVEN: User in PST timezone submitting near midnight
        # User's local time: 2025-12-20 11:58 PM PST
        # Server UTC time: 2025-12-21 07:58 AM UTC
        user_local_date = "2025-12-20"

        payload = {
            "local_date": user_local_date,
            "fulfillment_score": 9,
            "default_responses": {
                "today_reflection": "Late night reflection before bed",
                "tomorrow_focus": "Start fresh tomorrow",
            },
            "custom_responses": {},
        }

        # WHEN: Creating journal entry with user's local date
        token = create_auth_token(user_id="test-user-123")
        response = client.post(
            "/api/journal-entries", json=payload, headers={"Authorization": f"Bearer {token}"}
        )

        # THEN: Journal entry saved with user's local_date (not server UTC date)
        assert response.status_code == 201
        data = response.json()

        # CRITICAL: local_date must match what user sent, not server's UTC date
        assert data["data"]["local_date"] == user_local_date
        assert data["data"]["fulfillment_score"] == 9

        # GIVEN: User tries to submit another entry for same local_date
        # (e.g., if they navigate back and try to submit again)
        # WHEN: Attempting duplicate submission
        duplicate_response = client.post(
            "/api/journal-entries", json=payload, headers={"Authorization": f"Bearer {token}"}
        )

        # THEN: Duplicate entry prevented (unique constraint on user_id + local_date)
        assert duplicate_response.status_code == 409
        error = duplicate_response.json()
        assert error["error"]["code"] == "DUPLICATE_JOURNAL_ENTRY"

    def test_local_date_validation_range(self, client, create_auth_token, test_user):
        """GIVEN: User submits journal entry with invalid local_date
        WHEN: local_date is more than 7 days in past or in future
        THEN: 422 Validation Error

        Validates: Issue #9 - Timezone edge case
        Purpose: Prevent backdating abuse and future date submissions
        """
        # GIVEN: local_date in future
        future_date = (date.today() + timedelta(days=1)).isoformat()

        payload = {
            "local_date": future_date,
            "fulfillment_score": 7,
            "default_responses": {},
            "custom_responses": {},
        }

        # WHEN: Attempting to create journal entry for future date
        token = create_auth_token(user_id="test-user-123")
        response = client.post(
            "/api/journal-entries", json=payload, headers={"Authorization": f"Bearer {token}"}
        )

        # THEN: Validation error
        assert response.status_code == 422
        error = response.json()
        assert "local_date" in error["error"]["message"].lower()
        assert "future" in error["error"]["message"].lower()

        # GIVEN: local_date too far in past (>7 days)
        old_date = (date.today() - timedelta(days=8)).isoformat()
        payload["local_date"] = old_date

        # WHEN: Attempting to create journal entry for old date
        token = create_auth_token(user_id="test-user-123")
        response = client.post(
            "/api/journal-entries", json=payload, headers={"Authorization": f"Bearer {token}"}
        )

        # THEN: Validation error
        assert response.status_code == 422
        error = response.json()
        assert "local_date" in error["error"]["message"].lower()


# Additional test TODOs that require database fixtures:
# - test_journal_entry_persists_to_database()
# - test_daily_aggregates_updated_correctly()
# - test_multiple_users_can_journal_same_date()
# - test_journal_entry_includes_user_id()

"""Tests for journal entry API endpoints.

This test suite follows ATDD (Acceptance Test-Driven Development) principles.
All tests are initially FAILING (RED phase) and will guide implementation.

Story: 4.1 - Daily Reflection Entry
Coverage: AC #7, #9, #13 (Data Storage, Error Handling, Custom Responses)
"""

import pytest
from datetime import date
from fastapi.testclient import TestClient


from app.main import app
from tests.factories import create_test_user, create_test_journal_entry


client = TestClient(app)


class TestJournalEntryCreation:
    """Test suite for POST /api/journal-entries endpoint.

    These tests validate the core journal entry creation flow (AC #7).
    """

    def test_create_journal_entry_with_default_questions_only(self, client):
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
                "tomorrow_focus": "Tomorrow I will finish the presentation for the team meeting."
            },
            "custom_responses": {}
        }

        # WHEN: Creating journal entry via API
        response = client.post(
            "/api/journal-entries",
            json=payload,
            headers={"Authorization": "Bearer test-token"}
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
        assert journal["default_responses"]["today_reflection"] == payload["default_responses"]["today_reflection"]
        assert journal["local_date"] == payload["local_date"]

        # Validate metadata
        assert "timestamp" in data["meta"]

    def test_create_journal_entry_with_custom_questions(self, client):
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
                "tomorrow_focus": "Finish project"
            },
            "custom_responses": {
                "uuid-123": {
                    "question_text": "Did I stick to my diet?",
                    "response": "Yes"
                },
                "uuid-456": {
                    "question_text": "Rate my energy level",
                    "response": 9
                }
            }
        }

        # WHEN: Creating journal entry
        response = client.post(
            "/api/journal-entries",
            json=payload,
            headers={"Authorization": "Bearer test-token"}
        )

        # THEN: Custom responses stored correctly
        assert response.status_code == 201
        data = response.json()

        journal = data["data"]
        assert journal["custom_responses"]["uuid-123"]["question_text"] == "Did I stick to my diet?"
        assert journal["custom_responses"]["uuid-123"]["response"] == "Yes"
        assert journal["custom_responses"]["uuid-456"]["response"] == 9

    def test_create_journal_entry_with_minimal_data(self, client):
        """GIVEN: Minimal valid data (only fulfillment score)
        WHEN: POST /api/journal-entries is called
        THEN: Entry created with empty default/custom responses

        Validates: AC #7 (default_responses can be empty)
        """
        # GIVEN: Minimal payload
        payload = {
            "local_date": date.today().isoformat(),
            "fulfillment_score": 5,
            "default_responses": {
                "today_reflection": "",
                "tomorrow_focus": ""
            },
            "custom_responses": {}
        }

        # WHEN: Creating journal entry
        response = client.post(
            "/api/journal-entries",
            json=payload,
            headers={"Authorization": "Bearer test-token"}
        )

        # THEN: Entry created successfully (fulfillment score is the only required field)
        assert response.status_code == 201
        data = response.json()

        journal = data["data"]
        assert journal["fulfillment_score"] == 5
        assert journal["default_responses"]["today_reflection"] == ""

    def test_journal_entry_updates_daily_aggregates(self, client):
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
                "tomorrow_focus": "Continue momentum"
            },
            "custom_responses": {}
        }

        # WHEN: Creating journal entry
        response = client.post(
            "/api/journal-entries",
            json=payload,
            headers={"Authorization": "Bearer test-token"}
        )

        # THEN: Entry created and daily_aggregates updated
        assert response.status_code == 201

        # TODO: Query daily_aggregates table to verify has_journal = true
        # This requires database test fixtures


class TestJournalEntryValidation:
    """Test suite for request validation (AC #7, #9)."""

    def test_fulfillment_score_required(self, client):
        """GIVEN: Journal entry without fulfillment_score
        WHEN: POST /api/journal-entries is called
        THEN: Returns 422 validation error

        Validates: AC #7 (fulfillment_score is required)
        """
        # GIVEN: Missing fulfillment_score
        payload = {
            "local_date": date.today().isoformat(),
            "default_responses": {"today_reflection": "Good day"},
            "custom_responses": {}
        }

        # WHEN: Creating journal entry
        response = client.post(
            "/api/journal-entries",
            json=payload,
            headers={"Authorization": "Bearer test-token"}
        )

        # THEN: Validation error
        assert response.status_code == 422
        error = response.json()
        assert "error" in error
        assert "fulfillment_score" in error["error"]["message"].lower()

    def test_fulfillment_score_range_validation(self, client):
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
            "custom_responses": {}
        }

        response = client.post(
            "/api/journal-entries",
            json=payload_low,
            headers={"Authorization": "Bearer test-token"}
        )

        assert response.status_code == 422

        # Test score too high
        payload_high = {
            "local_date": date.today().isoformat(),
            "fulfillment_score": 11,
            "default_responses": {},
            "custom_responses": {}
        }

        response = client.post(
            "/api/journal-entries",
            json=payload_high,
            headers={"Authorization": "Bearer test-token"}
        )

        assert response.status_code == 422

    def test_local_date_required(self, client):
        """GIVEN: Journal entry without local_date
        WHEN: POST /api/journal-entries is called
        THEN: Returns 422 validation error

        Validates: AC #7 (local_date is required)
        """
        # GIVEN: Missing local_date
        payload = {
            "fulfillment_score": 7,
            "default_responses": {},
            "custom_responses": {}
        }

        # WHEN: Creating journal entry
        response = client.post(
            "/api/journal-entries",
            json=payload,
            headers={"Authorization": "Bearer test-token"}
        )

        # THEN: Validation error
        assert response.status_code == 422


class TestJournalEntryDuplicateHandling:
    """Test suite for duplicate entry handling (AC #7, #9)."""

    def test_duplicate_journal_entry_for_same_day(self, client):
        """GIVEN: User already has journal entry for today
        WHEN: POST /api/journal-entries for same date
        THEN: Returns 409 Conflict with helpful error message

        Validates: AC #7 (unique constraint on user_id + local_date)
        Validates: AC #9 (duplicate entry error handling)
        """
        # GIVEN: First journal entry created
        payload = {
            "local_date": date.today().isoformat(),
            "fulfillment_score": 7,
            "default_responses": {"today_reflection": "First entry"},
            "custom_responses": {}
        }

        first_response = client.post(
            "/api/journal-entries",
            json=payload,
            headers={"Authorization": "Bearer test-token"}
        )
        assert first_response.status_code == 201

        # WHEN: Attempting to create second entry for same date
        payload["default_responses"]["today_reflection"] = "Second entry attempt"

        second_response = client.post(
            "/api/journal-entries",
            json=payload,
            headers={"Authorization": "Bearer test-token"}
        )

        # THEN: Conflict error with helpful message
        assert second_response.status_code == 409
        error = second_response.json()

        assert "error" in error
        assert error["error"]["code"] == "DUPLICATE_JOURNAL_ENTRY"
        assert "already reflected today" in error["error"]["message"].lower()


class TestJournalEntryErrorHandling:
    """Test suite for error scenarios (AC #9)."""

    def test_unauthorized_request(self, client):
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
            "custom_responses": {}
        }

        # WHEN: Creating journal entry without auth
        response = client.post("/api/journal-entries", json=payload)

        # THEN: Unauthorized error
        assert response.status_code == 401

    def test_invalid_json_payload(self, client):
        """GIVEN: Malformed JSON in request body
        WHEN: POST /api/journal-entries is called
        THEN: Returns 400 Bad Request

        Validates: AC #9 (input validation)
        """
        # WHEN: Sending invalid JSON
        response = client.post(
            "/api/journal-entries",
            data="invalid json data",
            headers={"Authorization": "Bearer test-token", "Content-Type": "application/json"}
        )

        # THEN: Bad request error
        assert response.status_code == 400


class TestJournalEntryCustomResponseValidation:
    """Test suite for custom question response validation (AC #13)."""

    def test_custom_responses_with_text_type(self, client):
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
                    "response": "I learned about TDD and failing tests first"
                }
            }
        }

        # WHEN: Creating journal entry
        response = client.post(
            "/api/journal-entries",
            json=payload,
            headers={"Authorization": "Bearer test-token"}
        )

        # THEN: Text response stored correctly
        assert response.status_code == 201
        data = response.json()

        custom_resp = data["data"]["custom_responses"]["uuid-text"]
        assert isinstance(custom_resp["response"], str)
        assert custom_resp["response"] == "I learned about TDD and failing tests first"

    def test_custom_responses_with_numeric_type(self, client):
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
                "uuid-numeric": {
                    "question_text": "Rate my productivity (1-10)",
                    "response": 8
                }
            }
        }

        # WHEN: Creating journal entry
        response = client.post(
            "/api/journal-entries",
            json=payload,
            headers={"Authorization": "Bearer test-token"}
        )

        # THEN: Numeric response stored correctly
        assert response.status_code == 201
        data = response.json()

        custom_resp = data["data"]["custom_responses"]["uuid-numeric"]
        assert isinstance(custom_resp["response"], int)
        assert custom_resp["response"] == 8

    def test_custom_responses_with_boolean_type(self, client):
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
                    "response": "Yes"  # or True, depending on implementation
                }
            }
        }

        # WHEN: Creating journal entry
        response = client.post(
            "/api/journal-entries",
            json=payload,
            headers={"Authorization": "Bearer test-token"}
        )

        # THEN: Boolean response stored correctly
        assert response.status_code == 201
        data = response.json()

        custom_resp = data["data"]["custom_responses"]["uuid-bool"]
        assert custom_resp["response"] in ["Yes", "No", True, False]


# Additional test TODOs that require database fixtures:
# - test_journal_entry_persists_to_database()
# - test_daily_aggregates_updated_correctly()
# - test_multiple_users_can_journal_same_date()
# - test_journal_entry_includes_user_id()

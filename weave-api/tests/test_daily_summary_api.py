"""
Tests for Daily Summary API

Tests AC #1-3 from tech-spec:
- AC #1: API returns consolidated data
- AC #2: Empty state handling
- AC #3: Future date blocked
"""

import pytest
from datetime import date, timedelta
from fastapi import status


def test_get_daily_summary_with_full_data(client, create_auth_token):
    """
    AC #1: API Endpoint Returns Consolidated Data

    Given: User has binds + journal for a date
    When: GET /api/daily-summary/{date}
    Then: Returns 200 with complete structure
    """
    target_date = "2025-12-30"

    token = create_auth_token(user_id="test-user-123")
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get(f"/api/daily-summary/{target_date}", headers=headers)

    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert "data" in data
    assert "meta" in data

    # Validate structure
    summary = data["data"]
    assert summary["date"] == target_date
    assert "aggregates" in summary
    assert "binds" in summary
    assert "journal_entry" in summary or summary.get("journal_entry") is None

    # Validate aggregates structure
    aggregates = summary["aggregates"]
    assert "completed_count" in aggregates
    assert "total_binds" in aggregates
    assert "has_proof" in aggregates
    assert "has_journal" in aggregates

    # Validate binds structure (if present)
    if summary["binds"]:
        bind = summary["binds"][0]
        assert "id" in bind
        assert "title" in bind
        assert "goal_name" in bind
        assert "goal_color" in bind
        assert "completed" in bind
        assert "captures" in bind


def test_get_daily_summary_empty_state(client, create_auth_token):
    """
    AC #2: Empty State Handling

    Given: User has no binds or journal for a date
    When: Navigate to daily detail
    Then: Returns 200 with empty arrays
    """
    # Use a date far in the past with no data
    target_date = "2020-01-01"

    token = create_auth_token(user_id="test-user-123")
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get(f"/api/daily-summary/{target_date}", headers=headers)

    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    summary = data["data"]

    # Should return empty data, not 404
    assert summary["date"] == target_date
    assert summary["aggregates"]["total_binds"] == 0
    assert summary["aggregates"]["completed_count"] == 0
    assert summary["binds"] == []
    assert summary["journal_entry"] is None


def test_get_daily_summary_future_date_blocked(client, create_auth_token):
    """
    AC #3: Future Date Blocked

    Given: Today is 2025-12-30
    When: Request future date
    Then: Returns 400 error
    """
    # Use tomorrow's date
    tomorrow = (date.today() + timedelta(days=1)).isoformat()

    token = create_auth_token(user_id="test-user-123")
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get(f"/api/daily-summary/{tomorrow}", headers=headers)

    assert response.status_code == status.HTTP_400_BAD_REQUEST

    error = response.json()
    assert "error" in error
    assert "Cannot access future dates" in error["error"]["message"]


def test_get_daily_summary_invalid_date_format(client, create_auth_token):
    """
    Test: Invalid date format returns 400

    Given: Invalid date format
    When: GET /api/daily-summary/{invalid_date}
    Then: Returns 400 with validation error
    """
    invalid_date = "12-30-2025"  # Wrong format (should be YYYY-MM-DD)

    token = create_auth_token(user_id="test-user-123")
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get(f"/api/daily-summary/{invalid_date}", headers=headers)

    assert response.status_code == status.HTTP_400_BAD_REQUEST

    error = response.json()
    assert "error" in error
    assert "Invalid date format" in error["error"]["message"]


def test_get_daily_summary_unauthorized(client):
    """
    Test: Unauthorized request returns 401

    Given: No auth token
    When: GET /api/daily-summary/{date}
    Then: Returns 401
    """
    target_date = "2025-12-30"

    response = client.get(f"/api/daily-summary/{target_date}")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED

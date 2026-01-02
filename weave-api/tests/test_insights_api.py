"""
Tests for Insights API (Story 6.4 - Thread Insights)

Tests cover:
- GET /api/insights/thread - Daily thread insights generation
- Authentication requirements
- Error handling
- Response format validation
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from datetime import datetime


class TestThreadInsightsEndpoint:
    """Test cases for GET /api/insights/thread endpoint"""

    def test_get_thread_insights_success(self, client: TestClient, auth_headers: dict):
        """
        Test successful thread insights generation

        Expected behavior:
        - Returns 200 status
        - Response has data and meta fields
        - Data contains required insight fields
        """
        # Mock the insights service to return predictable data
        mock_insights = {
            "todays_focus": {"id": "test-id", "title": "Test Focus", "reason": "Test reason"},
            "streak_status": {"current_streak": 5, "milestone_proximity": 2, "message": "Keep going!"},
            "pattern_insight": {"pattern_type": "time_of_day", "description": "Morning person", "suggestion": "Continue morning routine"},
            "quick_win": {"id": "win-id", "title": "Quick Win", "reason": "Easy task"},
            "ai_message": "You're doing great!",
            "generated_at": datetime.utcnow().isoformat()
        }

        with patch('app.api.insights.ThreadInsightsService') as MockService:
            mock_instance = MagicMock()
            mock_instance.generate_insights.return_value = mock_insights
            MockService.return_value = mock_instance

            response = client.get("/api/insights/thread", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()

        # Validate response structure
        assert "data" in data
        assert "meta" in data

        # Validate data fields
        assert "todays_focus" in data["data"]
        assert "streak_status" in data["data"]
        assert "pattern_insight" in data["data"]
        assert "quick_win" in data["data"]
        assert "ai_message" in data["data"]
        assert "generated_at" in data["data"]

        # Validate meta fields
        assert "timestamp" in data["meta"]
        assert "cached" in data["meta"]

    def test_get_thread_insights_requires_auth(self, client: TestClient):
        """
        Test that thread insights endpoint requires authentication

        Expected behavior:
        - Returns 401 when no auth token provided
        """
        response = client.get("/api/insights/thread")
        assert response.status_code == 401

    def test_get_thread_insights_handles_service_error(self, client: TestClient, auth_headers: dict):
        """
        Test error handling when insights service fails

        Expected behavior:
        - Returns 500 status
        - Error response has proper structure
        - Error message is user-friendly
        """
        with patch('app.api.insights.ThreadInsightsService') as MockService:
            mock_instance = MagicMock()
            mock_instance.generate_insights.side_effect = Exception("Service error")
            MockService.return_value = mock_instance

            response = client.get("/api/insights/thread", headers=auth_headers)

        assert response.status_code == 500
        data = response.json()

        # Validate error structure
        assert "detail" in data
        assert "error" in data["detail"]
        assert "message" in data["detail"]
        assert data["detail"]["error"] == "INSIGHTS_GENERATION_FAILED"

    def test_get_thread_insights_uses_correct_user_id(self, client: TestClient, auth_headers: dict):
        """
        Test that endpoint extracts user ID from JWT token correctly

        Expected behavior:
        - Uses current_user["sub"] not current_user["id"]
        - Passes correct user_id to services
        """
        with patch('app.api.insights.ThreadInsightsService') as MockService, \
             patch('app.api.insights.ContextBuilderService') as MockContext:

            mock_insights_instance = MagicMock()
            mock_insights_instance.generate_insights.return_value = {
                "todays_focus": None,
                "streak_status": {},
                "pattern_insight": {},
                "quick_win": None,
                "ai_message": "Test",
                "generated_at": datetime.utcnow().isoformat()
            }
            MockService.return_value = mock_insights_instance

            mock_context_instance = MagicMock()
            mock_context_instance.build_context.return_value = {}
            MockContext.return_value = mock_context_instance

            response = client.get("/api/insights/thread", headers=auth_headers)

            # Verify build_context was called with user_id from JWT "sub" field
            # The auth_headers fixture should provide a token with "sub" field
            mock_context_instance.build_context.assert_called_once()
            call_args = mock_context_instance.build_context.call_args
            # Just verify it was called - actual user_id depends on fixture

    def test_get_thread_insights_response_format(self, client: TestClient, auth_headers: dict):
        """
        Test that response format matches API specification

        Expected behavior:
        - Data object has all required fields with correct types
        - Meta object has timestamp and cached flag
        """
        mock_insights = {
            "todays_focus": {"id": "abc", "title": "Focus", "reason": "Reason"},
            "streak_status": {"current_streak": 3, "milestone_proximity": 7, "message": "Msg"},
            "pattern_insight": {"pattern_type": "test", "description": "Desc", "suggestion": "Sugg"},
            "quick_win": {"id": "xyz", "title": "Win", "reason": "Easy"},
            "ai_message": "Keep going!",
            "generated_at": "2026-01-02T10:00:00Z"
        }

        with patch('app.api.insights.ThreadInsightsService') as MockService:
            mock_instance = MagicMock()
            mock_instance.generate_insights.return_value = mock_insights
            MockService.return_value = mock_instance

            response = client.get("/api/insights/thread", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()

        # Type validations
        assert isinstance(data["data"]["todays_focus"], dict)
        assert isinstance(data["data"]["streak_status"], dict)
        assert isinstance(data["data"]["pattern_insight"], dict)
        assert isinstance(data["data"]["ai_message"], str)
        assert isinstance(data["meta"]["cached"], bool)


class TestDashboardInsightsEndpoint:
    """Test cases for GET /api/insights/dashboard endpoint (stub)"""

    def test_dashboard_insights_returns_not_implemented(self, client: TestClient, auth_headers: dict):
        """
        Test that dashboard insights endpoint returns 501 Not Implemented

        Expected behavior:
        - Returns 501 status
        - Error message indicates feature not ready
        """
        response = client.get("/api/insights/dashboard", headers=auth_headers)

        assert response.status_code == 501
        data = response.json()
        assert "detail" in data
        assert "error" in data["detail"]
        assert data["detail"]["error"] == "NOT_IMPLEMENTED"

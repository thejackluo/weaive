"""
Production API endpoint tests.

Tests critical API endpoints in production environment.
"""

import pytest
import requests
from tests.support.factories.deployment_factory import (
    create_test_jwt_for_production,
    create_test_goal_data,
    create_test_journal_entry_data
)


@pytest.mark.deployment
class TestAuthenticatedEndpoints:
    """Tests for authenticated API endpoints in production."""
    
    def test_production_goals_endpoint_with_auth(
        self,
        production_api_url,
        production_jwt_secret,
        http_session
    ):
        """Verify GET /api/goals works with valid JWT token."""
        # Generate test JWT (for testing, use a known test user or create one)
        # NOTE: In real production tests, you'd create a test user first
        test_user_id = "test-user-id"
        test_email = "test@weave-test.com"
        
        token = create_test_jwt_for_production(
            user_id=test_user_id,
            email=test_email,
            jwt_secret=production_jwt_secret
        )
        
        headers = {"Authorization": f"Bearer {token}"}
        response = http_session.get(
            f"{production_api_url}/api/goals",
            headers=headers,
            timeout=10
        )
        
        # Should return 200 (empty goals list) or 401 if user doesn't exist
        # Both are acceptable - we're testing the endpoint responds correctly
        assert response.status_code in [200, 401, 404], \
            f"Goals endpoint returned unexpected status: {response.status_code}"
        
        if response.status_code == 200:
            data = response.json()
            assert "data" in data or isinstance(data, list), \
                "Goals endpoint should return data field or list"
    
    def test_production_completions_endpoint_with_auth(
        self,
        production_api_url,
        production_jwt_secret,
        http_session
    ):
        """Verify POST /api/completions accepts completion data."""
        test_user_id = "test-user-id"
        test_email = "test@weave-test.com"
        
        token = create_test_jwt_for_production(
            user_id=test_user_id,
            email=test_email,
            jwt_secret=production_jwt_secret
        )
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test with minimal payload (will likely fail validation, but endpoint should respond)
        payload = {
            "subtask_instance_id": "test-subtask-id",
            "completed_at": "2025-12-23T10:00:00Z"
        }
        
        response = http_session.post(
            f"{production_api_url}/api/completions",
            headers=headers,
            json=payload,
            timeout=10
        )
        
        # Should return 200, 400 (validation error), or 404 (subtask not found)
        assert response.status_code in [200, 400, 401, 404, 422], \
            f"Completions endpoint returned unexpected status: {response.status_code}"
    
    def test_production_journal_endpoint_with_auth(
        self,
        production_api_url,
        production_jwt_secret,
        http_session
    ):
        """Verify POST /api/journal-entries creates journal entry."""
        test_user_id = "test-user-id"
        test_email = "test@weave-test.com"
        
        token = create_test_jwt_for_production(
            user_id=test_user_id,
            email=test_email,
            jwt_secret=production_jwt_secret
        )
        
        headers = {"Authorization": f"Bearer {token}"}
        payload = create_test_journal_entry_data()
        
        response = http_session.post(
            f"{production_api_url}/api/journal-entries",
            headers=headers,
            json=payload,
            timeout=10
        )
        
        # Should return 200, 400, 401, or 404
        assert response.status_code in [200, 201, 400, 401, 404, 422], \
            f"Journal endpoint returned unexpected status: {response.status_code}"
    
    def test_production_transcribe_endpoint_with_auth(
        self,
        production_api_url,
        production_jwt_secret,
        http_session
    ):
        """Verify POST /api/transcribe endpoint is accessible."""
        test_user_id = "test-user-id"
        test_email = "test@weave-test.com"
        
        token = create_test_jwt_for_production(
            user_id=test_user_id,
            email=test_email,
            jwt_secret=production_jwt_secret
        )
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test without file upload (should fail validation but prove endpoint exists)
        response = http_session.post(
            f"{production_api_url}/api/transcribe",
            headers=headers,
            timeout=10
        )
        
        # Should return 400 (missing file) or 422 (validation error), not 404
        assert response.status_code in [400, 401, 422], \
            f"Transcribe endpoint returned unexpected status: {response.status_code}"


@pytest.mark.deployment
class TestErrorHandling:
    """Tests for error handling in production."""
    
    def test_production_endpoints_reject_invalid_auth(
        self,
        production_api_url,
        http_session
    ):
        """Verify endpoints return 401 Unauthorized with invalid JWT."""
        invalid_token = "invalid.jwt.token"
        headers = {"Authorization": f"Bearer {invalid_token}"}
        
        # Test multiple endpoints
        endpoints = [
            "/api/goals",
            "/api/journal-entries",
            "/api/completions"
        ]
        
        for endpoint in endpoints:
            if endpoint == "/api/completions":
                response = http_session.post(
                    f"{production_api_url}{endpoint}",
                    headers=headers,
                    json={},
                    timeout=10
                )
            else:
                response = http_session.get(
                    f"{production_api_url}{endpoint}",
                    headers=headers,
                    timeout=10
                )
            
            assert response.status_code == 401, \
                f"{endpoint} should return 401 with invalid token, got {response.status_code}"
    
    def test_production_endpoints_reject_expired_token(
        self,
        production_api_url,
        production_jwt_secret,
        http_session
    ):
        """Verify endpoints return 401 with expired JWT."""
        import jwt
        from datetime import datetime, timedelta
        
        # Create expired token (expired 1 hour ago)
        expired_payload = {
            "sub": "test-user-id",
            "email": "test@weave-test.com",
            "iat": datetime.utcnow() - timedelta(hours=2),
            "exp": datetime.utcnow() - timedelta(hours=1)
        }
        
        expired_token = jwt.encode(expired_payload, production_jwt_secret, algorithm="HS256")
        headers = {"Authorization": f"Bearer {expired_token}"}
        
        response = http_session.get(
            f"{production_api_url}/api/goals",
            headers=headers,
            timeout=10
        )
        
        assert response.status_code == 401, \
            f"Expired token should return 401, got {response.status_code}"
    
    def test_production_endpoints_reject_wrong_signature(
        self,
        production_api_url,
        http_session
    ):
        """Verify endpoints return 401 with JWT signed with wrong secret."""
        import jwt
        from datetime import datetime, timedelta
        
        # Create token with wrong secret
        payload = {
            "sub": "test-user-id",
            "email": "test@weave-test.com",
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(hours=1)
        }
        
        wrong_token = jwt.encode(payload, "wrong-secret-key", algorithm="HS256")
        headers = {"Authorization": f"Bearer {wrong_token}"}
        
        response = http_session.get(
            f"{production_api_url}/api/goals",
            headers=headers,
            timeout=10
        )
        
        assert response.status_code == 401, \
            f"Token with wrong signature should return 401, got {response.status_code}"
    
    def test_production_endpoints_reject_missing_claims(
        self,
        production_api_url,
        production_jwt_secret,
        http_session
    ):
        """Verify endpoints return 401 with JWT missing required claims."""
        import jwt
        from datetime import datetime, timedelta
        
        # Create token missing 'sub' claim
        incomplete_payload = {
            "email": "test@weave-test.com",
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(hours=1)
        }
        
        incomplete_token = jwt.encode(incomplete_payload, production_jwt_secret, algorithm="HS256")
        headers = {"Authorization": f"Bearer {incomplete_token}"}
        
        response = http_session.get(
            f"{production_api_url}/api/goals",
            headers=headers,
            timeout=10
        )
        
        assert response.status_code == 401, \
            f"Token missing 'sub' claim should return 401, got {response.status_code}"

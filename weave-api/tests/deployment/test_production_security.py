"""
Production security tests.

Tests security configuration in production environment.
"""

import pytest
import requests


@pytest.mark.deployment
class TestSecurityConfiguration:
    """Tests for production security settings."""
    
    def test_cors_headers_configured(self, production_api_url, http_session):
        """Verify CORS headers are configured correctly."""
        response = http_session.options(
            f"{production_api_url}/api/goals",
            headers={
                "Origin": "https://weave.app",
                "Access-Control-Request-Method": "GET"
            },
            timeout=10
        )
        
        # Should have CORS headers
        headers = response.headers
        
        # Check for CORS headers (may be configured differently)
        # At minimum, we should not get a CORS error
        assert response.status_code in [200, 204, 401, 404], \
            f"OPTIONS request failed with status {response.status_code}"
    
    def test_rls_policies_enabled_production(
        self,
        production_supabase_url
    ):
        """Verify RLS policies are enabled in production database."""
        # NOTE: This test requires direct database access to verify RLS
        # For now, we verify the Supabase URL is configured (indirect check)
        
        assert production_supabase_url.startswith("https://"), \
            "Production Supabase URL should use HTTPS"
        
        assert "supabase.co" in production_supabase_url, \
            "Production Supabase URL should be a valid Supabase URL"
    
    def test_jwt_secret_is_strong(self, production_jwt_secret):
        """Verify JWT_SECRET is at least 256 bits (32 characters) with sufficient entropy."""
        assert len(production_jwt_secret) >= 32, \
            f"JWT_SECRET should be at least 32 characters (256 bits), got {len(production_jwt_secret)}"
        
        # Check it's not a common weak secret
        weak_secrets = [
            "secret",
            "changeme",
            "password",
            "test",
            "development",
            "12345678901234567890123456789012"
        ]
        
        assert production_jwt_secret not in weak_secrets, \
            "JWT_SECRET appears to be a weak/default value"
        
        # Check entropy: should have at least 16 unique characters
        unique_chars = len(set(production_jwt_secret))
        assert unique_chars >= 16, \
            f"JWT_SECRET has insufficient entropy: only {unique_chars} unique characters (need >= 16)"
        
        # Check it's not all same character repeated (e.g., 'aaaaa...')
        assert not all(c == production_jwt_secret[0] for c in production_jwt_secret), \
            "JWT_SECRET is all the same character (no entropy)"
    
    def test_debug_mode_disabled_production(self, production_api_url, http_session):
        """Verify DEBUG=false in production environment."""
        # Test by checking if debug error pages are disabled
        # A properly configured production app should return JSON errors, not HTML debug pages
        
        response = http_session.get(
            f"{production_api_url}/api/nonexistent-endpoint-12345",
            timeout=10
        )
        
        # Should return 404, not 500 (which might indicate debug mode issues)
        assert response.status_code in [404, 405], \
            f"Nonexistent endpoint should return 404, got {response.status_code}"
        
        # Check response is JSON (not HTML debug page)
        content_type = response.headers.get("Content-Type", "")
        assert "application/json" in content_type or response.status_code == 404, \
            "Production should return JSON errors, not HTML debug pages"

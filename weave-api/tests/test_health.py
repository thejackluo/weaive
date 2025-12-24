"""Test for health endpoint."""

from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    """Test health endpoint returns 200 OK with service info."""
    with patch("app.core.deps.get_supabase_client") as mock_supabase:
        # Mock successful database connection
        mock_client = MagicMock()
        mock_client.table().select().limit().execute.return_value.data = [{"id": "test"}]
        mock_supabase.return_value = mock_client

        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()

        # Check required fields
        assert data["status"] == "healthy"
        assert data["service"] == "weave-api"
        assert data["version"] == "0.1.0"
        assert data["database"] == "connected"
        assert "timestamp" in data

        # Check optional debug fields
        assert "port" in data
        assert "environment" in data


def test_health_endpoint_database_failure():
    """Test health endpoint returns 503 when database connection fails."""
    from app.core.deps import get_supabase_client

    # Create mock client that throws exception
    def mock_get_failing_supabase():
        mock_client = MagicMock()
        mock_table = MagicMock()
        mock_select = MagicMock()
        mock_limit = MagicMock()

        # Chain the mocks properly
        mock_client.table.return_value = mock_table
        mock_table.select.return_value = mock_select
        mock_select.limit.return_value = mock_limit
        mock_limit.execute.side_effect = Exception("Connection refused")

        return mock_client

    # Override dependency at app level
    app.dependency_overrides[get_supabase_client] = mock_get_failing_supabase

    try:
        response = client.get("/health")
        assert response.status_code == 503
        data = response.json()

        assert data["status"] == "unhealthy"
        assert "database" in data["error"].lower()
    finally:
        # Clean up dependency override
        app.dependency_overrides.clear()


def test_root_endpoint():
    """Test root endpoint returns welcome message."""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()
    assert response.json()["message"] == "Weave API - Foundation Ready"

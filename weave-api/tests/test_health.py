"""Test for health endpoint."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    """Test health endpoint returns 200 OK with service info."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()

    # Check required fields
    assert data["status"] == "ok"
    assert data["service"] == "weave-api"
    assert data["version"] == "0.1.0"

    # Check optional debug fields
    assert "port" in data
    assert "environment" in data


def test_root_endpoint():
    """Test root endpoint returns welcome message."""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()
    assert response.json()["message"] == "Weave API - Foundation Ready"

"""
Test Template for Weave Backend API
Story 1.5.2: Backend API/Model Standardization

This template provides standardized patterns for writing integration tests for API endpoints.
Replace {resource}, {resources}, {Resource} placeholders with your resource name.

Example:
- {resource} = goal
- {resources} = goals
- {Resource} = Goal

Usage:
1. Copy this template to tests/test_{resource}_api.py
2. Replace all {placeholders} with your resource name
3. Implement test cases based on your endpoint logic
4. Run: uv run pytest tests/test_{resource}_api.py -v
"""

import pytest
from fastapi.testclient import TestClient
from datetime import datetime
from uuid import UUID

from app.main import app

# Import schemas for type hints and validation
# from app.schemas.{resource} import {Resource}Create, {Resource}Update, {Resource}Response


# ============================================================================
# TEST CLIENT SETUP
# ============================================================================

client = TestClient(app)


# ============================================================================
# FIXTURES (Define shared test data)
# ============================================================================

@pytest.fixture
def auth_headers(test_user_jwt):
    """
    Fixture providing authenticated request headers

    Uses test_user_jwt fixture from conftest.py
    """
    return {
        "Authorization": f"Bearer {test_user_jwt}",
        "Content-Type": "application/json"
    }


@pytest.fixture
def sample_{resource}_data():
    """
    Fixture providing sample {resource} data for testing

    Returns:
        dict: Valid {resource} creation data
    """
    return {
        "title": "Test {Resource}",
        "description": "This is a test {resource}",
        "emoji": "📝",
        "status": "active",
        "priority": 3
    }


@pytest.fixture
def created_{resource}(auth_headers, sample_{resource}_data):
    """
    Fixture that creates a {resource} and returns it

    Use this when tests need an existing {resource} to work with.

    Yields:
        dict: Created {resource} data

    Cleanup:
        Deletes the {resource} after test completes
    """
    # Create {resource}
    response = client.post(
        "/api/{resources}",
        json=sample_{resource}_data,
        headers=auth_headers
    )
    assert response.status_code == 201
    {resource} = response.json()["data"]

    yield {resource}

    # Cleanup: Delete {resource} after test
    client.delete(
        f"/api/{resources}/{{resource}['id']}",
        headers=auth_headers
    )


# ============================================================================
# LIST ENDPOINT TESTS - GET /api/{resources}
# ============================================================================

def test_list_{resources}_not_implemented(auth_headers):
    """
    Test that {resources} list endpoint returns 501 Not Implemented

    This test validates the endpoint stub before implementation.
    Remove this test once the endpoint is fully implemented.

    Epic X, Story X.X: [Story Name]
    """
    response = client.get("/api/{resources}", headers=auth_headers)

    # Verify 501 status for unimplemented endpoint
    assert response.status_code == 501

    # Verify error response format
    data = response.json()
    assert "error" in data
    assert data["error"] == "NOT_IMPLEMENTED"
    assert "Epic" in data.get("epic", "")
    assert "Story" in data.get("story", "")


def test_list_{resources}_success(auth_headers):
    """
    Test successful listing of {resources}

    This test should be implemented once the endpoint is ready.

    Epic X, Story X.X: [Story Name]
    """
    pytest.skip("Endpoint not yet implemented")

    response = client.get("/api/{resources}", headers=auth_headers)

    assert response.status_code == 200

    # Verify response format
    data = response.json()
    assert "data" in data
    assert "meta" in data
    assert isinstance(data["data"], list)

    # Verify meta fields
    meta = data["meta"]
    assert "total" in meta
    assert "page" in meta
    assert "per_page" in meta
    assert "timestamp" in meta


def test_list_{resources}_pagination(auth_headers):
    """
    Test pagination parameters

    Epic X, Story X.X: [Story Name]
    """
    pytest.skip("Endpoint not yet implemented")

    # Test custom pagination
    response = client.get(
        "/api/{resources}?page=2&per_page=5",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["meta"]["page"] == 2
    assert data["meta"]["per_page"] == 5


def test_list_{resources}_unauthorized():
    """
    Test that listing {resources} requires authentication

    Epic X, Story X.X: [Story Name]
    """
    pytest.skip("Endpoint not yet implemented")

    # No auth headers
    response = client.get("/api/{resources}")

    assert response.status_code == 401
    assert response.json()["error"] == "UNAUTHORIZED"


# ============================================================================
# GET BY ID TESTS - GET /api/{resources}/{id}
# ============================================================================

def test_get_{resource}_not_implemented(auth_headers):
    """
    Test that get {resource} endpoint returns 501 Not Implemented

    Epic X, Story X.X: [Story Name]
    """
    response = client.get(
        "/api/{resources}/test-id",
        headers=auth_headers
    )

    assert response.status_code == 501
    data = response.json()
    assert data["error"] == "NOT_IMPLEMENTED"


def test_get_{resource}_success(auth_headers, created_{resource}):
    """
    Test successfully getting a {resource} by ID

    Epic X, Story X.X: [Story Name]
    """
    pytest.skip("Endpoint not yet implemented")

    {resource}_id = created_{resource}["id"]
    response = client.get(
        f"/api/{resources}/{{resource}_id}",
        headers=auth_headers
    )

    assert response.status_code == 200

    # Verify response format
    data = response.json()
    assert "data" in data
    assert "meta" in data

    # Verify {resource} data
    {resource} = data["data"]
    assert {resource}["id"] == {resource}_id
    assert "title" in {resource}
    assert "created_at" in {resource}


def test_get_{resource}_not_found(auth_headers):
    """
    Test getting non-existent {resource} returns 404

    Epic X, Story X.X: [Story Name]
    """
    pytest.skip("Endpoint not yet implemented")

    fake_id = "00000000-0000-0000-0000-000000000000"
    response = client.get(
        f"/api/{resources}/{fake_id}",
        headers=auth_headers
    )

    assert response.status_code == 404
    assert response.json()["error"] == "NOT_FOUND"


def test_get_{resource}_wrong_user(auth_headers, other_user_auth_headers, created_{resource}):
    """
    Test that users cannot access other users' {resources}

    Epic X, Story X.X: [Story Name]
    """
    pytest.skip("Endpoint not yet implemented")

    {resource}_id = created_{resource}["id"]

    # Try to access with different user's token
    response = client.get(
        f"/api/{resources}/{{resource}_id}",
        headers=other_user_auth_headers
    )

    # Should return 404 (not 403) to avoid information leakage
    assert response.status_code == 404


# ============================================================================
# CREATE TESTS - POST /api/{resources}
# ============================================================================

def test_create_{resource}_not_implemented(auth_headers, sample_{resource}_data):
    """
    Test that create {resource} endpoint returns 501 Not Implemented

    Epic X, Story X.X: [Story Name]
    """
    response = client.post(
        "/api/{resources}",
        json=sample_{resource}_data,
        headers=auth_headers
    )

    assert response.status_code == 501
    data = response.json()
    assert data["error"] == "NOT_IMPLEMENTED"


def test_create_{resource}_success(auth_headers, sample_{resource}_data):
    """
    Test successfully creating a {resource}

    Epic X, Story X.X: [Story Name]
    """
    pytest.skip("Endpoint not yet implemented")

    response = client.post(
        "/api/{resources}",
        json=sample_{resource}_data,
        headers=auth_headers
    )

    assert response.status_code == 201

    # Verify response format
    data = response.json()
    assert "data" in data
    assert "meta" in data

    # Verify created {resource}
    {resource} = data["data"]
    assert "id" in {resource}
    assert {resource}["title"] == sample_{resource}_data["title"]
    assert "created_at" in {resource}

    # Cleanup
    client.delete(
        f"/api/{resources}/{{resource}['id']}",
        headers=auth_headers
    )


def test_create_{resource}_validation_error(auth_headers):
    """
    Test that invalid data returns validation error

    Epic X, Story X.X: [Story Name]
    """
    pytest.skip("Endpoint not yet implemented")

    # Missing required field
    invalid_data = {
        "description": "Missing title field"
    }

    response = client.post(
        "/api/{resources}",
        json=invalid_data,
        headers=auth_headers
    )

    assert response.status_code == 400
    assert response.json()["error"] == "VALIDATION_ERROR"


def test_create_{resource}_business_rule_error(auth_headers, sample_{resource}_data):
    """
    Test that business rule violations return appropriate error

    Example: Max 3 active goals limit

    Epic X, Story X.X: [Story Name]
    """
    pytest.skip("Endpoint not yet implemented")

    # Create 3 {resources} (assuming limit is 3)
    for i in range(3):
        response = client.post(
            "/api/{resources}",
            json=sample_{resource}_data,
            headers=auth_headers
        )
        assert response.status_code == 201

    # Try to create 4th {resource} (should fail)
    response = client.post(
        "/api/{resources}",
        json=sample_{resource}_data,
        headers=auth_headers
    )

    assert response.status_code == 400
    # Check for specific business error code
    # assert response.json()["error"] == "GOAL_LIMIT_EXCEEDED"


# ============================================================================
# UPDATE TESTS - PUT /api/{resources}/{id}
# ============================================================================

def test_update_{resource}_not_implemented(auth_headers):
    """
    Test that update {resource} endpoint returns 501 Not Implemented

    Epic X, Story X.X: [Story Name]
    """
    update_data = {"title": "Updated Title"}
    response = client.put(
        "/api/{resources}/test-id",
        json=update_data,
        headers=auth_headers
    )

    assert response.status_code == 501
    data = response.json()
    assert data["error"] == "NOT_IMPLEMENTED"


def test_update_{resource}_success(auth_headers, created_{resource}):
    """
    Test successfully updating a {resource}

    Epic X, Story X.X: [Story Name]
    """
    pytest.skip("Endpoint not yet implemented")

    {resource}_id = created_{resource}["id"]
    update_data = {
        "title": "Updated {Resource} Title",
        "priority": 5
    }

    response = client.put(
        f"/api/{resources}/{{resource}_id}",
        json=update_data,
        headers=auth_headers
    )

    assert response.status_code == 200

    # Verify updated fields
    {resource} = response.json()["data"]
    assert {resource}["title"] == update_data["title"]
    assert {resource}["priority"] == update_data["priority"]


def test_update_{resource}_partial_update(auth_headers, created_{resource}):
    """
    Test partial update (only some fields)

    Epic X, Story X.X: [Story Name]
    """
    pytest.skip("Endpoint not yet implemented")

    {resource}_id = created_{resource}["id"]
    original_title = created_{resource}["title"]

    # Update only priority, not title
    update_data = {"priority": 1}

    response = client.put(
        f"/api/{resources}/{{resource}_id}",
        json=update_data,
        headers=auth_headers
    )

    assert response.status_code == 200

    # Verify only priority changed
    {resource} = response.json()["data"]
    assert {resource}["priority"] == 1
    assert {resource}["title"] == original_title  # Unchanged


# ============================================================================
# DELETE TESTS - DELETE /api/{resources}/{id}
# ============================================================================

def test_delete_{resource}_not_implemented(auth_headers):
    """
    Test that delete {resource} endpoint returns 501 Not Implemented

    Epic X, Story X.X: [Story Name]
    """
    response = client.delete(
        "/api/{resources}/test-id",
        headers=auth_headers
    )

    assert response.status_code == 501
    data = response.json()
    assert data["error"] == "NOT_IMPLEMENTED"


def test_delete_{resource}_success(auth_headers, created_{resource}):
    """
    Test successfully soft deleting a {resource}

    Epic X, Story X.X: [Story Name]
    """
    pytest.skip("Endpoint not yet implemented")

    {resource}_id = created_{resource}["id"]

    response = client.delete(
        f"/api/{resources}/{{resource}_id}",
        headers=auth_headers
    )

    assert response.status_code == 200

    # Verify delete confirmation
    data = response.json()["data"]
    assert data["deleted"] is True
    assert data["id"] == {resource}_id

    # Verify {resource} no longer accessible
    get_response = client.get(
        f"/api/{resources}/{{resource}_id}",
        headers=auth_headers
    )
    assert get_response.status_code == 404


# ============================================================================
# COVERAGE TARGET: 80%+
# ============================================================================

"""
Test Coverage Guidelines:

✅ Happy Path Tests (must have):
- Successful GET, POST, PUT, DELETE
- Valid response format verification
- Authentication working correctly

✅ Error Case Tests (must have):
- 401 Unauthorized (missing/invalid token)
- 404 Not Found (non-existent resource)
- 400 Validation Error (invalid input)
- Business rule violations

✅ Edge Case Tests (should have):
- Pagination boundaries
- Empty result sets
- Large payloads
- Special characters in input
- Concurrent requests

✅ Security Tests (critical):
- Users cannot access other users' resources
- Soft delete works correctly
- RLS policies enforced
"""


# ============================================================================
# RUNNING TESTS
# ============================================================================

"""
Run all tests:
    uv run pytest tests/test_{resource}_api.py -v

Run specific test:
    uv run pytest tests/test_{resource}_api.py::test_create_{resource}_success -v

Run with coverage:
    uv run pytest tests/test_{resource}_api.py --cov=app.api.{resources} --cov-report=html

Run only implemented tests (skip stubs):
    uv run pytest tests/test_{resource}_api.py -v -m "not skip"
"""

"""
Integration Tests for Captures API
Story: 0.9 - AI-Powered Image Service
"""

import io
from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest
from PIL import Image

from app.services.images import VisionAnalysisResult

# ============================================================================
# FIXTURES
# ============================================================================


@pytest.fixture
def test_image_bytes():
    """Generate test JPEG image"""
    img = Image.new("RGB", (800, 600), color="red")
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="JPEG", quality=80)
    return img_bytes.getvalue()


@pytest.fixture
def mock_vision_result():
    """Mock successful vision analysis"""
    return VisionAnalysisResult(
        provider="gemini-3-flash-preview",
        validation_score=85,
        is_verified=True,
        ocr_text="Test workout log",
        categories=[
            {"label": "gym", "confidence": 0.92},
            {"label": "workspace", "confidence": 0.15},
        ],
        quality_score=4,
        input_tokens=560,
        output_tokens=200,
        cost_usd=0.0009,
        duration_ms=1500,
        timestamp="2025-12-21T10:30:00Z",
    )


# ============================================================================
# UPLOAD ENDPOINT TESTS
# ============================================================================


@pytest.mark.asyncio
async def test_upload_image_success(
    client,
    test_image_bytes,
    user_fixture,
    mock_vision_result,
):
    """Test successful image upload with AI analysis"""
    with patch("app.api.captures.get_vision_service") as mock_vision:
        # Mock vision service
        mock_service = AsyncMock()
        mock_service.analyze_image.return_value = (mock_vision_result, True)
        mock_vision.return_value = mock_service

        # Prepare upload
        files = {"file": ("test.jpg", test_image_bytes, "image/jpeg")}
        data = {
            "local_date": "2025-12-21",
            "note": "Test proof photo",
            "run_ai_analysis": "true",
        }

        response = client.post(
            "/api/captures/upload",
            files=files,
            data=data,
            headers={"Authorization": f"Bearer {user_fixture['token']}"},
        )

        assert response.status_code == 200
        result = response.json()

        assert "data" in result
        assert "id" in result["data"]
        assert "storage_key" in result["data"]
        assert "signed_url" in result["data"]
        assert result["data"]["ai_verified"] is True
        assert result["data"]["ai_analysis"] is not None
        assert result["data"]["ai_analysis"]["validation_score"] == 85


@pytest.mark.asyncio
async def test_upload_image_without_ai_analysis(client, test_image_bytes, user_fixture):
    """Test image upload without AI analysis"""
    files = {"file": ("test.jpg", test_image_bytes, "image/jpeg")}
    data = {
        "local_date": "2025-12-21",
        "run_ai_analysis": "false",
    }

    response = client.post(
        "/api/captures/upload",
        files=files,
        data=data,
        headers={"Authorization": f"Bearer {user_fixture['token']}"},
    )

    assert response.status_code == 200
    result = response.json()

    assert result["data"]["ai_analysis"] is None
    assert result["data"]["ai_verified"] is False


@pytest.mark.asyncio
async def test_upload_rate_limit_exceeded(client, test_image_bytes, user_fixture):
    """Test rate limit enforcement (5 images/day)"""
    # Mock daily_aggregates to show 5 uploads already
    with patch("app.middleware.rate_limit.get_or_create_daily_aggregate") as mock_agg:
        mock_agg.return_value = {
            "upload_count": 5,
            "upload_size_mb": 4.0,
            "ai_vision_count": 3,
        }

        files = {"file": ("test.jpg", test_image_bytes, "image/jpeg")}
        data = {"local_date": "2025-12-21"}

        response = client.post(
            "/api/captures/upload",
            files=files,
            data=data,
            headers={"Authorization": f"Bearer {user_fixture['token']}"},
        )

        assert response.status_code == 429
        result = response.json()
        assert result["detail"]["error"]["code"] == "RATE_LIMIT_EXCEEDED"
        assert "Retry-After" in response.headers


@pytest.mark.asyncio
async def test_upload_file_too_large(client, user_fixture):
    """Test file size validation (10MB max)"""
    # Create 11MB fake image
    large_image = b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * (11 * 1024 * 1024)

    files = {"file": ("large.jpg", large_image, "image/jpeg")}
    data = {"local_date": "2025-12-21"}

    response = client.post(
        "/api/captures/upload",
        files=files,
        data=data,
        headers={"Authorization": f"Bearer {user_fixture['token']}"},
    )

    assert response.status_code == 413
    result = response.json()
    assert result["detail"]["error"]["code"] == "FILE_TOO_LARGE"


# ============================================================================
# LIST/RETRIEVAL TESTS
# ============================================================================


@pytest.mark.asyncio
async def test_list_images_success(client, user_fixture):
    """Test listing user's images"""
    response = client.get(
        "/api/captures/images?page=1&per_page=20",
        headers={"Authorization": f"Bearer {user_fixture['token']}"},
    )

    assert response.status_code == 200
    result = response.json()

    assert "data" in result
    assert "meta" in result
    assert "total" in result["meta"]
    assert "page" in result["meta"]
    assert "per_page" in result["meta"]
    assert "has_next" in result["meta"]


@pytest.mark.asyncio
async def test_list_images_with_filters(client, user_fixture):
    """Test listing images with goal filter"""
    goal_id = str(uuid4())

    response = client.get(
        f"/api/captures/images?goal_id={goal_id}&page=1",
        headers={"Authorization": f"Bearer {user_fixture['token']}"},
    )

    assert response.status_code == 200


# ============================================================================
# DELETE TESTS
# ============================================================================


@pytest.mark.asyncio
async def test_delete_image_success(client, user_fixture, test_image_bytes):
    """Test successful image deletion"""
    # First upload an image
    with patch("app.api.captures.get_vision_service") as mock_vision:
        mock_service = AsyncMock()
        mock_service.analyze_image.return_value = (None, False)
        mock_vision.return_value = mock_service

        files = {"file": ("test.jpg", test_image_bytes, "image/jpeg")}
        data = {"local_date": "2025-12-21", "run_ai_analysis": "false"}

        upload_response = client.post(
            "/api/captures/upload",
            files=files,
            data=data,
            headers={"Authorization": f"Bearer {user_fixture['token']}"},
        )

        assert upload_response.status_code == 200
        image_id = upload_response.json()["data"]["id"]

        # Now delete it
        delete_response = client.delete(
            f"/api/captures/images/{image_id}",
            headers={"Authorization": f"Bearer {user_fixture['token']}"},
        )

        assert delete_response.status_code == 200
        assert delete_response.json()["data"]["success"] is True


@pytest.mark.asyncio
async def test_delete_image_not_found(client, user_fixture):
    """Test deleting non-existent image"""
    fake_id = str(uuid4())

    response = client.delete(
        f"/api/captures/images/{fake_id}",
        headers={"Authorization": f"Bearer {user_fixture['token']}"},
    )

    assert response.status_code == 404
    result = response.json()
    assert result["detail"]["error"]["code"] == "IMAGE_NOT_FOUND"


# ============================================================================
# USAGE ENDPOINT TESTS
# ============================================================================


@pytest.mark.asyncio
async def test_get_upload_usage(client, user_fixture):
    """Test getting current upload usage"""
    with patch("app.middleware.rate_limit.get_or_create_daily_aggregate") as mock_agg:
        mock_agg.return_value = {
            "upload_count": 2,
            "upload_size_mb": 1.5,
            "ai_vision_count": 1,
        }

        response = client.get(
            "/api/captures/usage",
            headers={"Authorization": f"Bearer {user_fixture['token']}"},
        )

        assert response.status_code == 200
        result = response.json()

        assert result["data"]["upload_count"] == 2
        assert result["data"]["upload_size_mb"] == 1.5
        assert result["data"]["ai_vision_count"] == 1
        assert "local_date" in result["data"]

"""
Unit Tests for Vision Service
Story: 0.9 - AI-Powered Image Service
"""

import pytest
from unittest.mock import Mock, patch, AsyncMock
from uuid import uuid4

from app.services.images import (
    VisionAnalysisResult,
    VisionProvider,
    VisionProviderError,
    VisionService,
    calculate_cost,
)


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture
def mock_image_bytes():
    """Mock image bytes (fake JPEG data)"""
    return b'\xff\xd8\xff\xe0\x00\x10JFIF' + b'\x00' * 1000  # Fake JPEG header + data


@pytest.fixture
def mock_vision_result():
    """Mock successful vision analysis result"""
    return VisionAnalysisResult(
        provider="test-provider",
        validation_score=85,
        is_verified=True,
        ocr_text="Test OCR text",
        categories=[
            {"label": "gym", "confidence": 0.92},
            {"label": "workspace", "confidence": 0.15},
        ],
        quality_score=4,
        input_tokens=560,
        output_tokens=200,
        cost_usd=0.0012,
        duration_ms=1500,
        timestamp="2025-12-21T10:30:00Z",
    )


class MockVisionProvider(VisionProvider):
    """Mock vision provider for testing"""

    def __init__(self, name: str, available: bool = True, should_fail: bool = False):
        self.name = name
        self.available = available
        self.should_fail = should_fail
        self.call_count = 0

    def get_provider_name(self) -> str:
        return self.name

    def is_available(self) -> bool:
        return self.available

    async def analyze_image(self, image_bytes, bind_description=None, context=None):
        self.call_count += 1

        if self.should_fail:
            raise VisionProviderError(self.name, "Mock failure", retryable=True)

        return VisionAnalysisResult(
            provider=self.name,
            validation_score=85,
            is_verified=True,
            ocr_text="Mock OCR",
            categories=[{"label": "gym", "confidence": 0.9}],
            quality_score=4,
            input_tokens=560,
            output_tokens=200,
            cost_usd=0.0012,
            duration_ms=1000,
            timestamp="2025-12-21T10:30:00Z",
        )


# ============================================================================
# VISION ANALYSIS RESULT TESTS
# ============================================================================

def test_vision_analysis_result_to_dict(mock_vision_result):
    """Test converting result to JSONB-compatible dict"""
    result_dict = mock_vision_result.to_dict()

    assert result_dict["provider"] == "test-provider"
    assert result_dict["validation_score"] == 85
    assert result_dict["is_verified"] is True
    assert result_dict["ocr_text"] == "Test OCR text"
    assert len(result_dict["categories"]) == 2
    assert result_dict["quality_score"] == 4
    assert "timestamp" in result_dict


def test_vision_analysis_result_to_ai_run_log(mock_vision_result):
    """Test converting result to ai_runs table format"""
    user_id = uuid4()
    local_date = "2025-12-21"

    log = mock_vision_result.to_ai_run_log(user_id, local_date)

    assert log["user_id"] == str(user_id)
    assert log["operation_type"] == "image_analysis"
    assert log["model"] == "test-provider"
    assert log["input_tokens"] == 560
    assert log["output_tokens"] == 200
    assert log["cost_usd"] == 0.0012
    assert log["duration_ms"] == 1500
    assert log["local_date"] == local_date
    assert log["status"] == "success"


# ============================================================================
# VISION SERVICE TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_vision_service_primary_provider_success(mock_image_bytes):
    """Test successful analysis with primary provider"""
    primary = MockVisionProvider("primary", available=True)
    fallback = MockVisionProvider("fallback", available=True)

    service = VisionService(primary, fallback)

    result, success = await service.analyze_image(mock_image_bytes)

    assert success is True
    assert result is not None
    assert result.provider == "primary"
    assert primary.call_count == 1
    assert fallback.call_count == 0  # Fallback not called


@pytest.mark.asyncio
async def test_vision_service_fallback_on_primary_failure(mock_image_bytes):
    """Test fallback to secondary provider when primary fails"""
    primary = MockVisionProvider("primary", available=True, should_fail=True)
    fallback = MockVisionProvider("fallback", available=True)

    service = VisionService(primary, fallback)

    result, success = await service.analyze_image(mock_image_bytes)

    assert success is True
    assert result is not None
    assert result.provider == "fallback"
    assert primary.call_count == 1
    assert fallback.call_count == 1


@pytest.mark.asyncio
async def test_vision_service_graceful_degradation_all_fail(mock_image_bytes):
    """Test graceful degradation when all providers fail"""
    primary = MockVisionProvider("primary", available=True, should_fail=True)
    fallback = MockVisionProvider("fallback", available=True, should_fail=True)

    service = VisionService(primary, fallback)

    result, success = await service.analyze_image(mock_image_bytes)

    assert success is False
    assert result is None
    assert primary.call_count == 1
    assert fallback.call_count == 1


@pytest.mark.asyncio
async def test_vision_service_no_providers_available(mock_image_bytes):
    """Test service with no providers configured"""
    service = VisionService()

    result, success = await service.analyze_image(mock_image_bytes)

    assert success is False
    assert result is None


@pytest.mark.asyncio
async def test_vision_service_skip_unavailable_providers(mock_image_bytes):
    """Test service skips unavailable providers"""
    primary = MockVisionProvider("primary", available=False)
    fallback = MockVisionProvider("fallback", available=True)

    service = VisionService(primary, fallback)

    result, success = await service.analyze_image(mock_image_bytes)

    assert success is True
    assert result.provider == "fallback"
    assert primary.call_count == 0  # Skipped because unavailable
    assert fallback.call_count == 1


# ============================================================================
# COST CALCULATION TESTS
# ============================================================================

def test_calculate_cost_gemini():
    """Test cost calculation for Gemini 3.0 Flash"""
    input_tokens = 560
    output_tokens = 200

    cost = calculate_cost("gemini-3-flash-preview", input_tokens, output_tokens)

    # Expected: (560 * 0.50 + 200 * 3.00) / 1,000,000 = 0.00088
    assert cost == pytest.approx(0.0009, abs=0.0001)


def test_calculate_cost_gpt4o():
    """Test cost calculation for GPT-4o Vision"""
    input_tokens = 560
    output_tokens = 200

    cost = calculate_cost("gpt-4o", input_tokens, output_tokens)

    # Expected: (560 * 2.50 + 200 * 10.00) / 1,000,000 = 0.0034
    assert cost == pytest.approx(0.0034, abs=0.0001)


def test_calculate_cost_unknown_provider():
    """Test cost calculation returns 0 for unknown provider"""
    cost = calculate_cost("unknown-provider", 1000, 1000)
    assert cost == 0.0


# ============================================================================
# VISION PROVIDER ERROR TESTS
# ============================================================================

def test_vision_provider_error_creation():
    """Test VisionProviderError creation"""
    error = VisionProviderError("test-provider", "Test error message", retryable=True)

    assert error.provider == "test-provider"
    assert error.message == "Test error message"
    assert error.retryable is True
    assert str(error) == "test-provider: Test error message"


def test_vision_provider_error_non_retryable():
    """Test non-retryable error"""
    error = VisionProviderError("test-provider", "API key invalid", retryable=False)

    assert error.retryable is False

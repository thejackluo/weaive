"""
Unit Tests for Error Handling Utilities (Story 1.5.2)
Tests verify error response formatting and utility functions.

AC-5: Error Handling Patterns
RED Phase: Tests will fail until utilities are implemented.
Generated: 2025-12-23
"""
from app.core.errors import AppException, format_error_response


def test_format_error_response_with_required_fields():
    """
    GIVEN: Error code and message
    WHEN: Calling format_error_response utility
    THEN: Returns dict with correct structure

    AC-5: Error response format utility
    """
    result = format_error_response(
        code="VALIDATION_ERROR",
        message="Invalid input data",
        retryable=False
    )

    # THEN: Response has correct structure
    assert "error" in result
    assert result["error"]["code"] == "VALIDATION_ERROR"
    assert result["error"]["message"] == "Invalid input data"
    assert result["error"]["retryable"] is False


def test_format_error_response_retryable_default():
    """
    GIVEN: Error code and message (no retryable specified)
    WHEN: Calling format_error_response utility
    THEN: retryable defaults to False

    AC-5: Default error response behavior
    """
    result = format_error_response(
        code="NOT_FOUND",
        message="Resource not found"
    )

    assert result["error"]["retryable"] is False


def test_app_exception_with_custom_status_code():
    """
    GIVEN: AppException with custom status code
    WHEN: Creating exception instance
    THEN: Exception has correct attributes

    AC-5: Custom exception class
    """
    exc = AppException(
        code="RATE_LIMIT_EXCEEDED",
        message="Too many requests",
        status_code=429,
        retryable=True
    )

    assert exc.code == "RATE_LIMIT_EXCEEDED"
    assert exc.message == "Too many requests"
    assert exc.status_code == 429
    assert exc.retryable is True


def test_standard_error_codes():
    """
    GIVEN: Standard error codes defined in Story 1.5.2
    WHEN: Using format_error_response with these codes
    THEN: All codes are valid and formatted correctly

    AC-5: Standard error code validation
    """
    error_codes = [
        ("VALIDATION_ERROR", "Invalid input"),
        ("NOT_FOUND", "Resource not found"),
        ("UNAUTHORIZED", "Missing auth"),
        ("FORBIDDEN", "Insufficient permissions"),
        ("RATE_LIMIT_EXCEEDED", "Too many requests"),
        ("INTERNAL_ERROR", "Server error"),
        ("NOT_IMPLEMENTED", "Endpoint stub")
    ]

    for code, message in error_codes:
        result = format_error_response(code, message)
        assert result["error"]["code"] == code
        assert result["error"]["message"] == message


def test_error_response_json_serializable():
    """
    GIVEN: Error response dict from format_error_response
    WHEN: Converting to JSON
    THEN: All values are JSON-serializable (str, bool, int)

    AC-5: Error response must be JSON-serializable for API responses
    """
    import json

    result = format_error_response(
        code="VALIDATION_ERROR",
        message="Test error",
        retryable=True
    )

    # THEN: Can serialize to JSON without error
    json_str = json.dumps(result)
    assert isinstance(json_str, str)

    # THEN: Can deserialize back to dict
    deserialized = json.loads(json_str)
    assert deserialized["error"]["code"] == "VALIDATION_ERROR"

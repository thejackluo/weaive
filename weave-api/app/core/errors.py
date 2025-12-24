"""
Error Handling Utilities for Weave Backend
Story 1.5.2: Backend API/Model Standardization

Provides standardized error codes, custom exceptions, and error formatting
for consistent API error responses across all endpoints.
"""

from typing import Any, Dict, Optional
from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
import logging

logger = logging.getLogger(__name__)


# ============================================================================
# STANDARD ERROR CODES
# ============================================================================

class ErrorCode:
    """
    Standard error codes for API responses

    Use these constants for consistent error handling across all endpoints.
    """

    # Client Errors (4xx)
    VALIDATION_ERROR = "VALIDATION_ERROR"  # 400 - Invalid request data
    UNAUTHORIZED = "UNAUTHORIZED"  # 401 - Missing/invalid authentication
    FORBIDDEN = "FORBIDDEN"  # 403 - Insufficient permissions
    NOT_FOUND = "NOT_FOUND"  # 404 - Resource not found
    CONFLICT = "CONFLICT"  # 409 - Resource already exists
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"  # 429 - Too many requests
    UNPROCESSABLE_ENTITY = "UNPROCESSABLE_ENTITY"  # 422 - Semantic error

    # Business Logic Errors (400)
    GOAL_LIMIT_EXCEEDED = "GOAL_LIMIT_EXCEEDED"  # Max 3 active goals
    INVALID_STATUS_TRANSITION = "INVALID_STATUS_TRANSITION"  # Invalid state change
    DUPLICATE_RESOURCE = "DUPLICATE_RESOURCE"  # Resource already exists
    DEPENDENCY_NOT_MET = "DEPENDENCY_NOT_MET"  # Missing required dependency
    INVALID_DATE_RANGE = "INVALID_DATE_RANGE"  # Invalid date range
    INSUFFICIENT_QUOTA = "INSUFFICIENT_QUOTA"  # Quota/limit exceeded

    # Server Errors (5xx)
    INTERNAL_ERROR = "INTERNAL_ERROR"  # 500 - Unexpected server error
    NOT_IMPLEMENTED = "NOT_IMPLEMENTED"  # 501 - Endpoint stub
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"  # 503 - Service down
    GATEWAY_TIMEOUT = "GATEWAY_TIMEOUT"  # 504 - Upstream timeout

    # External Service Errors (502/503)
    DATABASE_ERROR = "DATABASE_ERROR"  # Database connection/query failed
    AI_SERVICE_ERROR = "AI_SERVICE_ERROR"  # AI service unavailable
    STORAGE_ERROR = "STORAGE_ERROR"  # File storage error
    EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR"  # Third-party API error


# ============================================================================
# HTTP STATUS CODE MAPPING
# ============================================================================

ERROR_STATUS_CODES = {
    # Client Errors
    ErrorCode.VALIDATION_ERROR: status.HTTP_400_BAD_REQUEST,
    ErrorCode.UNAUTHORIZED: status.HTTP_401_UNAUTHORIZED,
    ErrorCode.FORBIDDEN: status.HTTP_403_FORBIDDEN,
    ErrorCode.NOT_FOUND: status.HTTP_404_NOT_FOUND,
    ErrorCode.CONFLICT: status.HTTP_409_CONFLICT,
    ErrorCode.RATE_LIMIT_EXCEEDED: status.HTTP_429_TOO_MANY_REQUESTS,
    ErrorCode.UNPROCESSABLE_ENTITY: status.HTTP_422_UNPROCESSABLE_ENTITY,

    # Business Logic Errors
    ErrorCode.GOAL_LIMIT_EXCEEDED: status.HTTP_400_BAD_REQUEST,
    ErrorCode.INVALID_STATUS_TRANSITION: status.HTTP_400_BAD_REQUEST,
    ErrorCode.DUPLICATE_RESOURCE: status.HTTP_409_CONFLICT,
    ErrorCode.DEPENDENCY_NOT_MET: status.HTTP_400_BAD_REQUEST,
    ErrorCode.INVALID_DATE_RANGE: status.HTTP_400_BAD_REQUEST,
    ErrorCode.INSUFFICIENT_QUOTA: status.HTTP_400_BAD_REQUEST,

    # Server Errors
    ErrorCode.INTERNAL_ERROR: status.HTTP_500_INTERNAL_SERVER_ERROR,
    ErrorCode.NOT_IMPLEMENTED: status.HTTP_501_NOT_IMPLEMENTED,
    ErrorCode.SERVICE_UNAVAILABLE: status.HTTP_503_SERVICE_UNAVAILABLE,
    ErrorCode.GATEWAY_TIMEOUT: status.HTTP_504_GATEWAY_TIMEOUT,

    # External Service Errors
    ErrorCode.DATABASE_ERROR: status.HTTP_503_SERVICE_UNAVAILABLE,
    ErrorCode.AI_SERVICE_ERROR: status.HTTP_503_SERVICE_UNAVAILABLE,
    ErrorCode.STORAGE_ERROR: status.HTTP_503_SERVICE_UNAVAILABLE,
    ErrorCode.EXTERNAL_API_ERROR: status.HTTP_502_BAD_GATEWAY,
}


# ============================================================================
# RETRYABLE ERROR CODES
# ============================================================================

# Errors that client can retry
RETRYABLE_ERROR_CODES = {
    ErrorCode.RATE_LIMIT_EXCEEDED,
    ErrorCode.INTERNAL_ERROR,
    ErrorCode.SERVICE_UNAVAILABLE,
    ErrorCode.GATEWAY_TIMEOUT,
    ErrorCode.DATABASE_ERROR,
    ErrorCode.AI_SERVICE_ERROR,
    ErrorCode.STORAGE_ERROR,
    ErrorCode.EXTERNAL_API_ERROR,
}


# ============================================================================
# CUSTOM EXCEPTION CLASSES
# ============================================================================

class AppException(Exception):
    """
    Base exception class for application errors

    Use this for business logic errors that should be returned to the client.

    Example:
        if goal_count >= 3:
            raise AppException(
                code=ErrorCode.GOAL_LIMIT_EXCEEDED,
                message="Maximum 3 active goals allowed",
                status_code=400
            )
    """

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        retryable: bool = False,
        details: Optional[Dict[str, Any]] = None
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.retryable = retryable or (code in RETRYABLE_ERROR_CODES)
        self.details = details or {}
        super().__init__(message)


class ValidationException(AppException):
    """Exception for validation errors"""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            code=ErrorCode.VALIDATION_ERROR,
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            retryable=False,
            details=details
        )


class NotFoundException(AppException):
    """Exception for resource not found errors"""

    def __init__(self, resource: str, resource_id: str):
        super().__init__(
            code=ErrorCode.NOT_FOUND,
            message=f"{resource} with ID {resource_id} not found",
            status_code=status.HTTP_404_NOT_FOUND,
            retryable=False,
            details={"resource": resource, "id": resource_id}
        )


class UnauthorizedException(AppException):
    """Exception for authentication errors"""

    def __init__(self, message: str = "Authentication required"):
        super().__init__(
            code=ErrorCode.UNAUTHORIZED,
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            retryable=False
        )


class ForbiddenException(AppException):
    """Exception for authorization errors"""

    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(
            code=ErrorCode.FORBIDDEN,
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            retryable=False
        )


class RateLimitException(AppException):
    """Exception for rate limiting"""

    def __init__(self, message: str = "Rate limit exceeded", retry_after: Optional[int] = None):
        details = {"retry_after": retry_after} if retry_after else {}
        super().__init__(
            code=ErrorCode.RATE_LIMIT_EXCEEDED,
            message=message,
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            retryable=True,
            details=details
        )


class ServiceUnavailableException(AppException):
    """Exception for service unavailable errors"""

    def __init__(self, service_name: str, message: Optional[str] = None):
        super().__init__(
            code=ErrorCode.SERVICE_UNAVAILABLE,
            message=message or f"{service_name} is currently unavailable",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            retryable=True,
            details={"service": service_name}
        )


# ============================================================================
# ERROR RESPONSE FORMATTING
# ============================================================================

def format_error_response(
    code: str,
    message: str,
    retryable: bool = False,
    details: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Format standard error response

    Args:
        code: Error code (use ErrorCode constants)
        message: Human-readable error message
        retryable: Whether client should retry
        details: Optional additional error details

    Returns:
        Standardized error response dict

    Example:
        return JSONResponse(
            status_code=400,
            content=format_error_response(
                code=ErrorCode.VALIDATION_ERROR,
                message="Invalid email format",
                details={"field": "email"}
            )
        )
    """
    response = {
        "error": code,
        "message": message,
        "retryable": retryable
    }

    if details:
        response["details"] = details

    return response


def format_validation_error(exc: ValidationError) -> Dict[str, Any]:
    """
    Format Pydantic validation errors

    Args:
        exc: Pydantic ValidationError

    Returns:
        Formatted validation error response
    """
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })

    return format_error_response(
        code=ErrorCode.VALIDATION_ERROR,
        message="Validation error",
        retryable=False,
        details={"errors": errors}
    )


# ============================================================================
# EXCEPTION HANDLERS (Register in main.py)
# ============================================================================

async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """
    Global handler for AppException

    Register in main.py:
        app.add_exception_handler(AppException, app_exception_handler)
    """
    logger.error(
        f"AppException: {exc.code} - {exc.message}",
        extra={
            "code": exc.code,
            "status_code": exc.status_code,
            "path": request.url.path,
            "method": request.method
        }
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=format_error_response(
            code=exc.code,
            message=exc.message,
            retryable=exc.retryable,
            details=exc.details
        )
    )


async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
) -> JSONResponse:
    """
    Global handler for Pydantic validation errors

    Register in main.py:
        app.add_exception_handler(RequestValidationError, validation_exception_handler)
    """
    logger.warning(
        f"Validation error: {request.url.path}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "errors": exc.errors()
        }
    )

    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=format_error_response(
            code=ErrorCode.VALIDATION_ERROR,
            message="Request validation failed",
            retryable=False,
            details={"errors": errors}
        )
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Global handler for unexpected exceptions

    Register in main.py:
        app.add_exception_handler(Exception, generic_exception_handler)
    """
    logger.exception(
        f"Unhandled exception: {str(exc)}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "exception_type": type(exc).__name__
        }
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=format_error_response(
            code=ErrorCode.INTERNAL_ERROR,
            message="An unexpected error occurred",
            retryable=True
        )
    )


# ============================================================================
# USAGE EXAMPLES
# ============================================================================

"""
Example 1: Raise business logic error in router

@router.post("/api/goals", status_code=201)
async def create_goal(data: GoalCreate, user: dict = Depends(get_current_user)):
    auth_user_id = user["sub"]

    # Check goal limit
    count = await get_active_goal_count(auth_user_id)
    if count >= 3:
        raise AppException(
            code=ErrorCode.GOAL_LIMIT_EXCEEDED,
            message="Maximum 3 active goals allowed",
            status_code=400,
            details={"current_count": count, "max_allowed": 3}
        )

    # Create goal...


Example 2: Raise not found error

@router.get("/api/goals/{goal_id}")
async def get_goal(goal_id: str, user: dict = Depends(get_current_user)):
    goal = await get_goal_by_id(goal_id, user["sub"])

    if not goal:
        raise NotFoundException(resource="Goal", resource_id=goal_id)

    return {"data": goal}


Example 3: Raise validation error with details

@router.post("/api/journal-entries")
async def create_journal_entry(data: JournalCreate, user: dict = Depends(get_current_user)):
    if data.fulfillment_score < 0 or data.fulfillment_score > 10:
        raise ValidationException(
            message="Fulfillment score must be between 0 and 10",
            details={"field": "fulfillment_score", "value": data.fulfillment_score}
        )


Example 4: Handle external service errors

@router.post("/api/ai/chat")
async def ai_chat(message: str, user: dict = Depends(get_current_user)):
    try:
        response = await call_ai_service(message)
        return {"data": response}
    except Exception as e:
        logger.error(f"AI service error: {e}")
        raise ServiceUnavailableException(
            service_name="AI Service",
            message="AI service is temporarily unavailable. Please try again later."
        )


Example 5: Return 501 for unimplemented endpoints

@router.get("/api/future-feature")
async def future_feature():
    raise HTTPException(
        status_code=501,
        detail=format_error_response(
            code=ErrorCode.NOT_IMPLEMENTED,
            message="This endpoint has not been developed",
            details={
                "epic": "Epic X: Feature Name",
                "story": "Story X.X: Endpoint Name"
            }
        )
    )
"""


# ============================================================================
# REGISTRATION (Add to main.py)
# ============================================================================

"""
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from app.core.errors import (
    AppException,
    app_exception_handler,
    validation_exception_handler,
    generic_exception_handler
)

app = FastAPI()

# Register exception handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)
"""

import logging
import os

from fastapi import FastAPI, Request, status
from fastapi.exceptions import HTTPException, RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import (
    admin,
    ai_chat_router,
    ai_router,
    analytics,
    binds,
    captures,
    goals,
    health,
    journal_router,
    onboarding,
    stats,
    transcribe,
    user,
)
from app.core.config import settings
from app.services.tools import register_default_tools

# Log environment status on startup
logger = logging.getLogger(__name__)
logger.info("=" * 60)
logger.info("ENVIRONMENT VARIABLES CHECK")
logger.info("=" * 60)
logger.info(f"OPENAI_API_KEY: {'✅ Set' if os.getenv('OPENAI_API_KEY') else '❌ Not set'}")
logger.info(f"ANTHROPIC_API_KEY: {'✅ Set' if os.getenv('ANTHROPIC_API_KEY') else '❌ Not set'}")
logger.info(f"ASSEMBLYAI_API_KEY: {'✅ Set' if os.getenv('ASSEMBLYAI_API_KEY') else '❌ Not set'}")
logger.info("=" * 60)

app = FastAPI(
    title="Weave API",
    description="Backend API for Weave MVP",
    version="0.1.0"
)


@app.on_event("startup")
async def startup_event():
    """Initialize tools and services on app startup."""
    logger.info("🚀 Registering AI tools...")
    register_default_tools()
    logger.info("✅ AI tools registered successfully")

# Custom error handler for standard error response format
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """
    Convert FastAPI HTTPException to standard error response format.

    Standard format: {"error": {"code": "ERROR_CODE", "message": "..."}}
    """
    # Map HTTP status codes to error codes
    error_code_map = {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        422: "VALIDATION_ERROR",
        500: "INTERNAL_SERVER_ERROR",
    }

    error_code = error_code_map.get(exc.status_code, "UNKNOWN_ERROR")

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": error_code,
                "message": exc.detail if isinstance(exc.detail, str) else str(exc.detail),
            }
        },
    )


# Custom handler for Pydantic validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Convert Pydantic RequestValidationError to standard error response format.

    Standard format: {"error": {"code": "VALIDATION_ERROR", "message": "..."}}
    """
    # Extract validation error details
    errors = exc.errors()
    error_messages = []

    for error in errors:
        field = " -> ".join(str(loc) for loc in error["loc"] if loc not in ["body", "query", "path"])
        message = error["msg"]
        error_messages.append(f"{field}: {message}" if field else message)

    combined_message = "; ".join(error_messages)

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": combined_message,
            }
        },
    )

# CORS - Environment-based configuration
# ⚠️ SECURITY WARNING: NEVER use ALLOWED_ORIGINS="*" in production!
# Set ALLOWED_ORIGINS in .env to specific domains in production
# Example: ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
allowed_origins = (
    settings.ALLOWED_ORIGINS.split(",")
    if settings.ALLOWED_ORIGINS != "*"
    else ["*"]
)

# Runtime check: Warn if using wildcard CORS in production-like environments
if allowed_origins == ["*"] and settings.ENV in ["production", "prod", "staging"]:
    import logging
    logging.warning(
        "⚠️  SECURITY RISK: CORS is set to allow all origins (*) in a production-like environment! "
        "This should NEVER be used in production. Set ALLOWED_ORIGINS to specific domains."
    )

# SECURITY: Disable credentials when using wildcard origins
# allow_credentials=True with origins=["*"] is a security vulnerability
# Credentials (cookies, auth headers) should only be allowed with specific origins
allow_credentials = allowed_origins != ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_credentials,  # Only true when origins are restricted
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["health"])
app.include_router(user.router, tags=["user"])
app.include_router(analytics.router, tags=["analytics"])
app.include_router(onboarding.router, tags=["onboarding"])
app.include_router(ai_router.router, tags=["ai"])
app.include_router(ai_chat_router.router, tags=["ai-chat"])  # Story 6.1: AI Chat with streaming
app.include_router(journal_router.router, prefix="/api", tags=["journal"])
app.include_router(transcribe.router, tags=["stt"])
app.include_router(goals.router, tags=["goals"])
app.include_router(captures.router, tags=["captures"])
app.include_router(stats.router, tags=["stats"])  # Progress visualization stats
app.include_router(binds.router, tags=["binds"])  # Thread: Today's binds (US-3.1)
app.include_router(admin.router, tags=["admin"])  # Cost monitoring and system maintenance

@app.get("/")
async def root():
    return {"message": "Weave API - Foundation Ready"}

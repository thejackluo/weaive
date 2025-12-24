import logging
import os

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    account_router,
    admin,
    ai_chat_router,
    ai_router,
    analytics,
    binds,
    captures,
    goals,
    health,
    journal_router,
    memories_router,
    notifications,
    onboarding,
    stats,
    subscription_router,
    transcribe,
    user,
)
from app.core.config import settings
from app.core.errors import (
    AppException,
    app_exception_handler,
    generic_exception_handler,
    validation_exception_handler,
)

# Log environment status on startup
logger = logging.getLogger(__name__)
logger.info("=" * 60)
logger.info("ENVIRONMENT VARIABLES CHECK")
logger.info("=" * 60)
logger.info(f"OPENAI_API_KEY: {'✅ Set' if os.getenv('OPENAI_API_KEY') else '❌ Not set'}")
logger.info(f"ANTHROPIC_API_KEY: {'✅ Set' if os.getenv('ANTHROPIC_API_KEY') else '❌ Not set'}")
logger.info(f"ASSEMBLYAI_API_KEY: {'✅ Set' if os.getenv('ASSEMBLYAI_API_KEY') else '❌ Not set'}")
logger.info("=" * 60)

app = FastAPI(title="Weave API", description="Backend API for Weave MVP", version="0.1.0")

# Register standardized exception handlers (Story 0.8 via Story 1.5.2)
# These handlers provide consistent error response format across all endpoints
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)


# CORS - Environment-based configuration
# ⚠️ SECURITY WARNING: NEVER use ALLOWED_ORIGINS="*" in production!
# Set ALLOWED_ORIGINS in .env to specific domains in production
# Example: ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
allowed_origins = settings.ALLOWED_ORIGINS.split(",") if settings.ALLOWED_ORIGINS != "*" else ["*"]

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
app.include_router(subscription_router.router, tags=["subscription"])  # Story 9.4: Apple IAP
app.include_router(account_router.router, tags=["account"])  # Story 9.4: GDPR account management
app.include_router(notifications.router, tags=["notifications"])  # Epic 7: Push notifications
app.include_router(memories_router.router, prefix="/api", tags=["memories"])  # Goal memories
app.include_router(admin.router, tags=["admin"])  # Cost monitoring and system maintenance


@app.get("/")
async def root():
    return {"message": "Weave API - Foundation Ready"}


# Railway deployment support: Bind to dynamic PORT environment variable
if __name__ == "__main__":
    import uvicorn

    # Railway provides dynamic PORT env var
    port = int(os.getenv("PORT", 8000))

    # CRITICAL: Must bind to 0.0.0.0 (not 127.0.0.1) for Railway
    # Railway's proxy requires the app to listen on all interfaces
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=False,  # Disable reload in production
        log_level="info",
    )

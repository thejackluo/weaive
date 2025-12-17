from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import health
from app.core.config import settings

app = FastAPI(
    title="Weave API",
    description="Backend API for Weave MVP",
    version="0.1.0"
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["health"])

@app.get("/")
async def root():
    return {"message": "Weave API - Foundation Ready"}

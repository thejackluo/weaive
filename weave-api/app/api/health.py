import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from supabase import Client

from app.core.deps import get_supabase_client

router = APIRouter()


@router.get("/health")
async def health_check(supabase: Client = Depends(get_supabase_client)):
    """
    Health check endpoint for Railway and monitoring.

    Verifies:
    - Backend is running
    - Database connection is active

    Returns:
        dict: Status and timestamp if healthy

    Raises:
        HTTPException: 503 if database connection fails
    """
    # Get port from environment (useful for multi-instance debugging)
    port = int(os.getenv("PORT", "8000"))
    env = os.getenv("ENV", "development")

    try:
        # Test database connection with minimal query
        supabase.table("user_profiles").select("id").limit(1).execute()

        # Connection successful
        return {
            "status": "healthy",
            "service": "weave-api",
            "version": "0.1.0",
            "database": "connected",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "port": port,
            "environment": env,
        }
    except Exception as e:
        # Database connection failed - return 503 with proper format
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": f"Database connection failed: {str(e)}",
                "service": "weave-api",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        )

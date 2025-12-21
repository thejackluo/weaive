import os

from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring.

    Returns service status and instance information.
    Useful for debugging multi-worktree setups with different backend ports.
    """
    # Get port from environment (useful for multi-instance debugging)
    port = int(os.getenv("PORT", "8000"))
    env = os.getenv("ENV", "development")

    return {
        "status": "ok",
        "service": "weave-api",
        "version": "0.1.0",
        "port": port,
        "environment": env
    }

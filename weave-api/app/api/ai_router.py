"""
AI Generation Router - Streaming & Non-Streaming Endpoints

Provides FastAPI endpoints for AI generation with:
- Non-streaming: POST /api/ai/generate (returns complete response)
- Streaming: POST /api/ai/generate/stream (Server-Sent Events, real-time chunks)

Both endpoints use the same AI service with fallback chain and cost tracking.
"""

import asyncio
import json
import logging
from enum import Enum
from functools import lru_cache
from typing import AsyncGenerator, Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.core.deps import get_current_user, get_supabase_client
from app.services.ai.ai_service import AIService
from app.services.ai.base import AIProviderError, AIResponse
from app.services.ai.rate_limiter import RateLimitError
from app.services.context_builder import ContextBuilderService  # Story 6.2

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["ai"])


# AI Module Enum (matches database ai_module type)
class AIModule(str, Enum):
    """Valid AI module identifiers."""
    ONBOARDING = "onboarding"
    TRIAD = "triad"
    RECAP = "recap"
    DREAM_SELF = "dream_self"
    WEEKLY_INSIGHTS = "weekly_insights"
    GOAL_BREAKDOWN = "goal_breakdown"
    CHAT = "chat"


# Request/Response Models
class AIGenerateRequest(BaseModel):
    """Request body for AI generation."""
    module: AIModule = Field(..., description="AI module (onboarding, triad, recap, dream_self, weekly_insights, goal_breakdown, chat)")
    prompt: str = Field(..., description="User input prompt")
    model: Optional[str] = Field(None, description="Override default model (gpt-4o-mini, claude-3-5-haiku, etc.)")
    max_tokens: Optional[int] = Field(2000, description="Maximum tokens to generate")
    temperature: Optional[float] = Field(None, description="Sampling temperature (0.0-1.0)")
    system: Optional[str] = Field(None, description="System message to prepend")
    include_context: bool = Field(True, description="Include user context for personalized responses (Story 6.2)")


class AIGenerateResponse(BaseModel):
    """Response body for AI generation."""
    content: str
    input_tokens: int
    output_tokens: int
    model: str
    cost_usd: float
    provider: str
    cached: bool
    run_id: Optional[str]
    context_used: bool = Field(False, description="Whether user context was injected (Story 6.2)")
    context_assembly_time_ms: Optional[int] = Field(None, description="Time to assemble context in milliseconds")


# Dependency Injection (Singleton Pattern)
@lru_cache()
def get_ai_service() -> AIService:
    """
    Get configured AI service instance (singleton).

    Uses @lru_cache() to ensure only one AIService instance is created
    and reused across all requests. This prevents repeatedly initializing
    provider clients and improves performance.
    """
    import os

    from dotenv import load_dotenv

    load_dotenv()

    openai_key = os.getenv('OPENAI_API_KEY')
    anthropic_key = os.getenv('ANTHROPIC_API_KEY')
    aws_region = os.getenv('AWS_REGION', 'us-east-1')

    db = get_supabase_client()

    return AIService(
        db=db,
        bedrock_region=aws_region,
        openai_key=openai_key,
        anthropic_key=anthropic_key,
    )


# Non-Streaming Endpoint
@router.post("/generate", response_model=AIGenerateResponse)
async def generate_ai(
    request: AIGenerateRequest,
    current_user: dict = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Generate AI completion (non-streaming).

    **Fallback chain:** Bedrock → OpenAI → Anthropic → Deterministic

    **Rate limits:**
    - Admin: Unlimited
    - Paid: 10 calls/hour
    - Free: 10 calls/day

    **Budget limits:**
    - Total: $83.33/day
    - Free user: $0.02/day
    - Paid user: $0.10/day

    **Response time:** 1-3 seconds (Bedrock/OpenAI), <100ms (cache hit)
    """
    try:
        user_id = current_user['id']
        user_role = current_user.get('role', 'user')
        user_tier = current_user.get('tier', 'free')

        logger.info(f"AI generate request: user={user_id}, module={request.module}, model={request.model}, include_context={request.include_context}")

        # Build user context (Story 6.2)
        user_context = None
        context_assembly_time_ms = None
        if request.include_context:
            import time
            start_time = time.time()

            db = get_supabase_client()
            context_builder = ContextBuilderService(db)
            user_context = await context_builder.build_context(user_id)

            context_assembly_time_ms = int((time.time() - start_time) * 1000)
            logger.info(f"Context assembled in {context_assembly_time_ms}ms")

        # Generate with AI service (handles fallback, caching, budgets, rate limits)
        response: AIResponse = ai_service.generate(
            user_id=user_id,
            user_role=user_role,
            user_tier=user_tier,
            module=request.module,
            prompt=request.prompt,
            user_context=user_context,  # Pass context to AIService
            model=request.model,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            system=request.system,
        )

        return AIGenerateResponse(
            content=response.content,
            input_tokens=response.input_tokens,
            output_tokens=response.output_tokens,
            model=response.model,
            cost_usd=response.cost_usd,
            provider=response.provider,
            cached=response.cached,
            run_id=response.run_id,
            context_used=user_context is not None,
            context_assembly_time_ms=context_assembly_time_ms,
        )

    except AIProviderError as e:
        logger.error(f"AI provider error: {e}")
        raise HTTPException(status_code=503, detail=f"AI service temporarily unavailable: {e}")

    except RateLimitError as e:
        # Rate limit exceeded - return 429 with retry_after
        logger.warning(f"Rate limit exceeded: {e}")
        raise HTTPException(
            status_code=429,
            detail={
                "error": "rate_limit_exceeded",
                "message": str(e),
                "user_tier": e.user_tier,
                "limit": e.limit,
                "retry_after": e.retry_after.isoformat() if e.retry_after else None
            }
        )

    except Exception as e:
        logger.error(f"Unexpected error in AI generation: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Streaming Endpoint (Server-Sent Events)
@router.post("/generate/stream")
async def generate_ai_stream(
    request: AIGenerateRequest,
    current_user: dict = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Generate AI completion with real-time streaming (Server-Sent Events).

    **Stream format (SSE):**
    ```
    data: {"type": "start", "model": "claude-3-5-haiku"}\n\n
    data: {"type": "chunk", "content": "Hello"}\n\n
    data: {"type": "chunk", "content": " world"}\n\n
    data: {"type": "done", "input_tokens": 10, "output_tokens": 5, "cost_usd": 0.00001}\n\n
    ```

    **Frontend example:**
    ```typescript
    const es = new EventSource('/api/ai/generate/stream', {
      headers: { 'Authorization': `Bearer ${token}` },
      method: 'POST',
      body: JSON.stringify({ module: 'triad', prompt: 'Generate my daily plan' }),
    });

    es.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chunk') {
        setContent(prev => prev + data.content);  // Append word-by-word
      }
    });
    ```

    **Use cases:**
    - Dream Self chat (real-time conversation)
    - Onboarding (show AI thinking process)
    - Long-form generation (weekly insights)
    """
    try:
        user_id = current_user['id']
        user_role = current_user.get('role', 'user')
        user_tier = current_user.get('tier', 'free')

        logger.info(f"AI stream request: user={user_id}, module={request.module}, model={request.model}")

        # Create streaming generator
        async def event_stream() -> AsyncGenerator[str, None]:
            """Generate Server-Sent Events stream."""
            try:
                # Start event
                yield f"data: {json.dumps({'type': 'start', 'module': request.module})}\n\n"

                # Generate with streaming (uses Anthropic's native streaming)
                async for chunk in ai_service.generate_stream(
                    user_id=user_id,
                    user_role=user_role,
                    user_tier=user_tier,
                    module=request.module,
                    prompt=request.prompt,
                    model=request.model,
                    max_tokens=request.max_tokens,
                    temperature=request.temperature,
                    system=request.system,
                ):
                    # Chunk event (word-by-word or sentence-by-sentence)
                    if chunk.get('type') == 'chunk':
                        yield f"data: {json.dumps({'type': 'chunk', 'content': chunk['content']})}\n\n"
                        await asyncio.sleep(0)  # Yield control to event loop

                    # Done event (final metadata)
                    elif chunk.get('type') == 'done':
                        yield f"data: {json.dumps({'type': 'done', 'input_tokens': chunk['input_tokens'], 'output_tokens': chunk['output_tokens'], 'cost_usd': chunk['cost_usd'], 'provider': chunk['provider'], 'run_id': chunk.get('run_id')})}\n\n"

            except AIProviderError as e:
                logger.error(f"AI provider error during streaming: {e}")
                yield f"data: {json.dumps({'type': 'error', 'message': f'AI service error: {e}'})}\n\n"

            except RateLimitError as e:
                logger.warning(f"Rate limit exceeded during streaming: {e}")
                yield f"data: {json.dumps({'type': 'error', 'message': str(e), 'code': 'RATE_LIMIT_EXCEEDED', 'retry_after': e.retry_after.isoformat() if e.retry_after else None})}\n\n"

            except Exception as e:
                logger.error(f"Unexpected error during streaming: {e}")
                yield f"data: {json.dumps({'type': 'error', 'message': 'Internal server error'})}\n\n"

        # Return SSE stream
        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",  # Disable nginx buffering
            }
        )

    except Exception as e:
        logger.error(f"Failed to start streaming: {e}")
        raise HTTPException(status_code=500, detail="Failed to start streaming")


# Health Check Endpoint
@router.get("/health")
async def ai_health_check(ai_service: AIService = Depends(get_ai_service)):
    """
    Check AI service health and provider status.

    Returns:
    - Available providers
    - Daily cost usage
    - Budget status
    """
    try:
        from app.services.ai.cost_tracker import CostTracker

        db = get_supabase_client()
        cost_tracker = CostTracker(db)

        daily_cost = cost_tracker.get_total_daily_cost()
        budget_pct = (daily_cost / cost_tracker.DAILY_BUDGET_USD) * 100

        return {
            "status": "healthy",
            "providers": {
                "bedrock": "available",
                "openai": "available",
                "anthropic": "available",
                "deterministic": "available",
            },
            "budget": {
                "daily_cost_usd": daily_cost,
                "daily_budget_usd": cost_tracker.DAILY_BUDGET_USD,
                "usage_pct": round(budget_pct, 2),
                "exceeded": daily_cost >= cost_tracker.DAILY_BUDGET_USD,
            },
        }

    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "degraded",
            "error": str(e),
        }

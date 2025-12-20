"""
AI Service Abstraction Layer

Provides unified interface for multiple AI providers with automatic fallback chains.
Primary provider: AWS Bedrock (best runway with AWS credits)
Fallback chain: Bedrock → OpenAI → Anthropic → Deterministic

Key features:
- Dual cost tracking (application-wide + per-user)
- Role-based rate limiting (admin unlimited, paid 10/hour, free 10/day)
- Budget enforcement with auto-throttle
- 24-hour caching with input_hash
- Extensible deterministic templates for ultimate fallback
"""

from .ai_service import AIService
from .anthropic_provider import AnthropicProvider
from .base import AIProvider, AIProviderError, AIResponse
from .bedrock_provider import BedrockProvider
from .cost_tracker import CostTracker
from .deterministic_provider import DeterministicProvider
from .openai_provider import OpenAIProvider
from .rate_limiter import RateLimiter, RateLimitError

__all__ = [
    "AIProvider",
    "AIResponse",
    "AIProviderError",
    "AIService",
    "BedrockProvider",
    "OpenAIProvider",
    "AnthropicProvider",
    "DeterministicProvider",
    "CostTracker",
    "RateLimiter",
    "RateLimitError",
]

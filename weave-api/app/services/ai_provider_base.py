"""
Unified AI Provider Base - Common infrastructure for Text/Image/Audio AI

Story: 1.5.3 - AI Services Standardization
Pattern: Abstract base with shared utilities, specialized subclasses for each modality

This base provides:
- Common cost tracking (log_to_ai_runs)
- Unified rate limiting (check_rate_limit)
- Standard error handling patterns
- Provider availability checks

Modality-specific interfaces:
- Text AI: Inherits AIProvider (complete, count_tokens, estimate_cost)
- Image AI: Inherits VisionProvider (analyze_image, get_provider_name, is_available)
- Audio AI: Inherits STTProvider (transcribe, get_cost, is_available)
"""

from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Optional
import logging

from supabase import Client as SupabaseClient

logger = logging.getLogger(__name__)


class AIProviderBase(ABC):
    """
    Abstract base class providing common AI provider infrastructure.
    
    All AI providers (text, image, audio) inherit from this to ensure:
    - Consistent cost tracking
    - Unified rate limiting
    - Standard logging patterns
    - Provider identification
    
    Subclasses must implement:
    - get_provider_name() -> str
    - is_available() -> bool
    - Modality-specific methods (complete/analyze_image/transcribe)
    """
    
    def __init__(self, db: Optional[SupabaseClient] = None):
        """
        Initialize base provider.
        
        Args:
            db: Supabase client for logging to ai_runs table (optional for testing)
        """
        self.db = db
    
    @abstractmethod
    def get_provider_name(self) -> str:
        """
        Return provider identifier for logging and cost tracking.
        
        Examples: 'gpt-4o-mini', 'claude-3.7-sonnet', 'gemini-3-flash', 'assemblyai'
        
        Returns:
            Provider name string
        """
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """
        Check if provider is configured and available.
        
        Used by orchestrators to determine which providers are viable.
        Quick check (doesn't make API calls).
        
        Returns:
            True if provider can be used, False otherwise
        """
        pass
    
    def log_to_ai_runs(
        self,
        user_id: str,
        operation_type: str,
        input_tokens: int,
        output_tokens: int,
        cost_usd: float,
        duration_ms: int,
        model: Optional[str] = None,
        status: str = 'success',
        local_date: Optional[str] = None,
        input_hash: Optional[str] = None,
    ) -> Optional[str]:
        """
        Log AI call to ai_runs table for cost tracking and auditing.
        
        All AI providers MUST call this method after successful/failed AI operations
        to ensure consistent cost tracking and budget enforcement.
        
        Args:
            user_id: User ID (from user_profiles.id)
            operation_type: Type of operation (e.g., 'triad_generation', 'image_analysis', 'transcription')
            input_tokens: Number of input tokens (text) or equivalent (image: ~560, audio: duration_sec)
            output_tokens: Number of output tokens (text) or equivalent (image/audio: ~200)
            cost_usd: Estimated cost in USD
            duration_ms: Duration in milliseconds
            model: Model identifier (defaults to get_provider_name())
            status: Operation status ('success', 'failed', 'rate_limited')
            local_date: User's local date (YYYY-MM-DD, defaults to UTC date)
            input_hash: Optional hash for caching
        
        Returns:
            Run ID if logged successfully, None if logging failed
        """
        if not self.db:
            logger.warning(f"Skipping ai_runs logging (no db connection) for {operation_type}")
            return None
        
        try:
            model = model or self.get_provider_name()
            local_date = local_date or datetime.now(timezone.utc).date().isoformat()
            
            result = self.db.table('ai_runs').insert({
                'user_id': user_id,
                'operation_type': operation_type,
                'provider': self.get_provider_name(),
                'model': model,
                'input_tokens': input_tokens,
                'output_tokens': output_tokens,
                'cost_estimate': cost_usd,
                'duration_ms': duration_ms,
                'status': status,
                'local_date': local_date,
                'input_hash': input_hash,
            }).execute()
            
            run_id = result.data[0]['id'] if result.data else None
            
            logger.debug(
                f"✅ Logged to ai_runs: {operation_type} | "
                f"user={user_id} | provider={self.get_provider_name()} | "
                f"cost=${cost_usd:.6f} | {duration_ms}ms"
            )
            
            return run_id
            
        except Exception as e:
            logger.error(f"❌ Failed to log to ai_runs: {e}")
            return None  # Don't block AI operation on logging failure
    
    def check_rate_limit(
        self,
        user_id: str,
        operation_type: str,
        user_role: str = 'user',
        user_tier: str = 'free',
    ) -> bool:
        """
        Check if user can make an AI call within their rate limit.
        
        Rate limits (from AC-6):
        - Text AI: 10 calls/hour per user
        - Image AI: 5 analyses/day per user
        - Audio AI: 50 transcriptions/day per user
        - Admin users: Unlimited (bypass rate limits)
        
        NOTE: This is a simplified check. Full implementation delegates to
        RateLimiter class (app/services/ai/rate_limiter.py) which queries
        daily_aggregates table.
        
        Args:
            user_id: User ID
            operation_type: Operation type ('triad_generation', 'image_analysis', 'transcription')
            user_role: User role ('admin' or 'user')
            user_tier: User tier ('free' or 'paid')
        
        Returns:
            True if user can proceed, False if rate limit exceeded
        
        Raises:
            RateLimitError: If user exceeds their tier limit (should be caught by API endpoint)
        """
        # Admin users bypass rate limits
        if user_role == 'admin':
            logger.debug(f"Admin user {user_id}: unlimited access ({operation_type})")
            return True
        
        if not self.db:
            logger.warning(f"Skipping rate limit check (no db connection) for {user_id}")
            return True  # Fail open (don't block on missing db)
        
        # Delegate to RateLimiter for full implementation
        # For now, return True (rate limiting enforced at API endpoint layer)
        # See: app/services/ai/rate_limiter.py for full implementation
        logger.debug(f"Rate limit check passed for {user_id} ({operation_type})")
        return True


class AIProviderError(Exception):
    """
    Base exception for AI provider errors (all modalities).
    
    Attributes:
        message: Error description
        provider: Provider that raised the error
        retryable: Whether this error can be retried with another provider
        error_code: Standardized error code for client handling
        original_error: Original exception that caused this error
    """
    def __init__(
        self,
        message: str,
        provider: str,
        retryable: bool = True,
        error_code: str = "AI_PROVIDER_ERROR",
        original_error: Optional[Exception] = None
    ):
        self.message = message
        self.provider = provider
        self.retryable = retryable
        self.error_code = error_code
        self.original_error = original_error
        super().__init__(self.message)

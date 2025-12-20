"""
AI Service Orchestrator

Main interface for all AI generation with 4-tier fallback chain.
Coordinates providers, cost tracking, rate limiting, caching, and budget enforcement.

Fallback chain: Bedrock (AWS) → OpenAI → Anthropic → Deterministic

Features:
- Automatic fallback on provider failures
- 24-hour caching with input_hash
- Dual cost tracking (application-wide + per-user)
- Role-based rate limiting (admin unlimited, paid 10/hour, free 10/day)
- Budget enforcement with auto-throttle
- Comprehensive logging to ai_runs table
"""

import hashlib
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from supabase import Client as SupabaseClient

from .anthropic_provider import AnthropicProvider
from .base import AIProviderError, AIResponse
from .bedrock_provider import BedrockProvider
from .cost_tracker import CostTracker
from .deterministic_provider import DeterministicProvider
from .openai_provider import OpenAIProvider
from .rate_limiter import RateLimiter, RateLimitError

logger = logging.getLogger(__name__)


class AIServiceError(Exception):
    """Raised when AI service encounters unrecoverable error."""
    pass


class AIService:
    """
    Unified AI service with fallback chain and cost controls.

    Usage:
        service = AIService(db, bedrock_region, openai_key, anthropic_key)
        response = service.generate(
            user_id='user_123',
            user_role='user',
            user_tier='free',
            module='triad',
            prompt='Generate tomorrow's 3 tasks...'
        )
    """

    def __init__(
        self,
        db: SupabaseClient,
        bedrock_region: str = 'us-east-1',
        openai_key: Optional[str] = None,
        anthropic_key: Optional[str] = None
    ):
        """
        Initialize AI service with all providers.

        Args:
            db: Supabase client
            bedrock_region: AWS region for Bedrock (default: us-east-1)
            openai_key: OpenAI API key (optional, if available)
            anthropic_key: Anthropic API key (optional, if available)
        """
        self.db = db
        self.cost_tracker = CostTracker(db)
        self.rate_limiter = RateLimiter(db)

        # Initialize providers (4-tier fallback chain)
        self.providers = []

        # 1. Bedrock (PRIMARY)
        try:
            self.providers.append(('bedrock', BedrockProvider(region=bedrock_region)))
            logger.info("✅ Bedrock provider initialized (PRIMARY)")
        except Exception as e:
            logger.warning(f"⚠️  Bedrock initialization failed: {e}")

        # 2. OpenAI (FALLBACK #1)
        if openai_key:
            try:
                self.providers.append(('openai', OpenAIProvider(api_key=openai_key)))
                logger.info("✅ OpenAI provider initialized (FALLBACK #1)")
            except Exception as e:
                logger.warning(f"⚠️  OpenAI initialization failed: {e}")

        # 3. Anthropic (FALLBACK #2)
        if anthropic_key:
            try:
                self.providers.append(('anthropic', AnthropicProvider(api_key=anthropic_key)))
                logger.info("✅ Anthropic provider initialized (FALLBACK #2)")
            except Exception as e:
                logger.warning(f"⚠️  Anthropic initialization failed: {e}")

        # 4. Deterministic (ULTIMATE FALLBACK - always succeeds)
        self.providers.append(('deterministic', DeterministicProvider()))
        logger.info("✅ Deterministic provider initialized (ULTIMATE FALLBACK)")

        logger.info(f"🚀 AI Service initialized with {len(self.providers)} providers")

    def generate(
        self,
        user_id: str,
        user_role: str = 'user',
        user_tier: str = 'free',
        module: str = 'triad',
        prompt: str = '',
        **kwargs
    ) -> AIResponse:
        """
        Generate AI response with automatic fallback chain.

        Args:
            user_id: User ID (from user_profiles.id)
            user_role: User role ('admin' or 'user')
            user_tier: User tier ('free' or 'paid')
            module: AI module ('onboarding', 'triad', 'recap', 'dream_self', 'weekly_insights')
            prompt: User input text
            **kwargs: Additional parameters (model, temperature, max_tokens, variant, template vars)

        Returns:
            AIResponse with content, tokens, cost

        Raises:
            RateLimitError: If user exceeds rate limit
            AIServiceError: If all providers fail (shouldn't happen with Deterministic)
        """
        logger.info(f"🎯 AI generation request: user={user_id}, module={module}, role={user_role}, tier={user_tier}")

        # 1. Check rate limit
        try:
            self.rate_limiter.check_user_limit(user_id, user_role, user_tier, module)
        except RateLimitError:
            logger.warning(f"🚫 Rate limit exceeded for user {user_id}")
            raise

        # 2. Check cache
        input_hash = self._compute_hash(prompt, module, kwargs.get('model', 'auto'))
        cached_response = self._check_cache(user_id, input_hash)
        if cached_response:
            logger.info(f"⚡ Cache hit for user {user_id}, module {module}")
            return cached_response

        # 3. Check budgets (dual: total + per-user)
        budget_exceeded = self._check_budgets(user_id, user_tier)

        # 4. Determine providers to try
        if budget_exceeded:
            # Budget exceeded - skip paid providers, use deterministic only
            logger.warning(f"💰 Budget exceeded, using deterministic fallback for user {user_id}")
            providers_to_try = [('deterministic', self.providers[-1][1])]  # Last provider is always deterministic
        else:
            # Budget OK - try all providers
            providers_to_try = self.providers

        # 5. Try fallback chain
        errors = []
        for provider_name, provider in providers_to_try:
            try:
                # Create ai_runs record
                run_id = self._create_run(user_id, module, input_hash, provider_name)

                logger.info(f"🔄 Trying provider: {provider_name}")

                # Call provider
                response = provider.complete(
                    prompt=prompt,
                    module=module,
                    **kwargs
                )

                # Update run as success
                self._update_run_success(run_id, response, module)

                # Record cost
                if response.cost_usd > 0:
                    self.cost_tracker.record_cost(
                        run_id,
                        response.input_tokens,
                        response.output_tokens,
                        response.model,
                        response.cost_usd
                    )

                # Create artifact
                self._create_artifact(run_id, user_id, module, response)

                logger.info(
                    f"✅ {provider_name} success: ${response.cost_usd:.6f}, "
                    f"{response.input_tokens} in + {response.output_tokens} out tokens"
                )

                response.run_id = run_id
                return response

            except AIProviderError as e:
                # Provider failed, log and try next
                self._update_run_failure(run_id, str(e))
                errors.append(f"{provider_name}: {e.message}")
                logger.warning(f"❌ {provider_name} failed: {e.message}")

                if not e.retryable:
                    logger.error(f"🛑 {provider_name} error is not retryable, skipping remaining fallbacks")
                    break

                continue  # Try next provider

            except Exception as e:
                # Unexpected error
                self._update_run_failure(run_id, f"Unexpected error: {e}")
                errors.append(f"{provider_name}: Unexpected error: {e}")
                logger.error(f"💥 {provider_name} unexpected error: {e}")
                continue

        # All providers failed (shouldn't happen with Deterministic)
        error_msg = f"All providers failed: {'; '.join(errors)}"
        logger.error(f"🚨 {error_msg}")
        raise AIServiceError(error_msg)

    async def generate_stream(
        self,
        user_id: str,
        user_role: str = 'user',
        user_tier: str = 'free',
        module: str = 'triad',
        prompt: str = '',
        **kwargs
    ):
        """
        Generate AI response with real-time streaming (async generator).

        Yields chunks as they arrive from the AI provider (word-by-word or sentence-by-sentence).
        Uses Anthropic's native streaming API for providers that support it.

        Args:
            user_id: User ID (from user_profiles.id)
            user_role: User role ('admin' or 'user')
            user_tier: User tier ('free' or 'paid')
            module: AI module ('onboarding', 'triad', 'recap', 'dream_self', 'weekly_insights')
            prompt: User input text
            **kwargs: Additional parameters (model, temperature, max_tokens)

        Yields:
            Dict with:
            - {'type': 'chunk', 'content': 'word or sentence'} - During generation
            - {'type': 'done', 'input_tokens': N, 'output_tokens': M, 'cost_usd': X, 'provider': 'anthropic', 'run_id': 'uuid'} - Final metadata

        Raises:
            RateLimitError: If user exceeds rate limit
            AIServiceError: If streaming not supported or all providers fail
        """
        logger.info(f"🌊 AI streaming request: user={user_id}, module={module}, role={user_role}, tier={user_tier}")

        # 1. Check rate limit
        try:
            self.rate_limiter.check_user_limit(user_id, user_role, user_tier, module)
        except RateLimitError:
            logger.warning(f"🚫 Rate limit exceeded for user {user_id}")
            raise

        # 2. Check budgets (dual: total + per-user)
        budget_exceeded = self._check_budgets(user_id, user_tier)

        if budget_exceeded:
            logger.warning("💰 Budget exceeded, streaming not available")
            # Fallback to deterministic (no streaming, just return full response)
            deterministic = self.providers[-1][1]  # Last provider is always deterministic
            response = deterministic.complete(prompt=prompt, module=module, **kwargs)

            # Yield as single chunk
            yield {'type': 'chunk', 'content': response.content}
            yield {
                'type': 'done',
                'input_tokens': response.input_tokens,
                'output_tokens': response.output_tokens,
                'cost_usd': 0.0,
                'provider': 'deterministic',
            }
            return

        # 3. Try streaming with Anthropic provider (supports native streaming)
        anthropic_provider = None
        for provider_name, provider in self.providers:
            if provider_name == 'anthropic':
                anthropic_provider = provider
                break

        if not anthropic_provider:
            logger.error("🚨 Anthropic provider not available for streaming")
            raise AIServiceError("Streaming not available (Anthropic provider required)")

        # 4. Create ai_runs record
        input_hash = self._compute_hash(prompt, module, kwargs.get('model', 'auto'))
        run_id = self._create_run(user_id, module, input_hash, 'anthropic')

        try:
            # Stream from Anthropic
            logger.info("🔄 Streaming with Anthropic provider")

            # Use Anthropic's streaming API

            client = anthropic_provider.client

            # Prepare request
            model = kwargs.get('model', 'claude-3-5-sonnet-20241022')
            max_tokens = kwargs.get('max_tokens', 2000)
            temperature = kwargs.get('temperature')
            system = kwargs.get('system')

            # Build request params
            request_params = {
                'model': model,
                'max_tokens': max_tokens,
                'messages': [{'role': 'user', 'content': prompt}],
            }

            if temperature is not None:
                request_params['temperature'] = temperature

            if system is not None:
                if isinstance(system, str):
                    request_params['system'] = [{'type': 'text', 'text': system}]
                elif isinstance(system, list):
                    request_params['system'] = system

            # Stream completion
            full_content = []
            input_tokens = 0
            output_tokens = 0

            with client.messages.stream(**request_params) as stream:
                for text in stream.text_stream:
                    # Yield each text chunk
                    full_content.append(text)
                    yield {'type': 'chunk', 'content': text}

                # Get final message with usage
                final_message = stream.get_final_message()
                input_tokens = final_message.usage.input_tokens
                output_tokens = final_message.usage.output_tokens

            # Calculate cost
            cost_usd = anthropic_provider.estimate_cost(input_tokens, output_tokens, model)

            # Update run as success
            complete_content = ''.join(full_content)
            response = AIResponse(
                content=complete_content,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                model=model,
                cost_usd=cost_usd,
                provider='anthropic',
                cached=False,
                run_id=run_id,
            )

            self._update_run_success(run_id, response, module)

            # Record cost
            if cost_usd > 0:
                self.cost_tracker.record_cost(
                    run_id,
                    input_tokens,
                    output_tokens,
                    model,
                    cost_usd
                )

            # Create artifact
            self._create_artifact(run_id, user_id, module, response)

            logger.info(
                f"✅ Anthropic streaming success: ${cost_usd:.6f}, "
                f"{input_tokens} in + {output_tokens} out tokens"
            )

            # Yield final metadata
            yield {
                'type': 'done',
                'input_tokens': input_tokens,
                'output_tokens': output_tokens,
                'cost_usd': cost_usd,
                'provider': 'anthropic',
                'run_id': run_id,
            }

        except Exception as e:
            # Stream failed
            self._update_run_failure(run_id, str(e))
            logger.error(f"💥 Anthropic streaming failed: {e}")

            # Yield error event
            yield {
                'type': 'error',
                'message': f"Streaming failed: {e}",
                'run_id': run_id,
            }

    def _compute_hash(self, prompt: str, module: str, model: str) -> str:
        """
        Compute SHA-256 hash of prompt + module + model for caching.

        Args:
            prompt: User input
            module: AI module
            model: Model identifier

        Returns:
            64-character hex hash
        """
        data = f"{prompt}|{module}|{model}"
        return hashlib.sha256(data.encode()).hexdigest()

    def _check_cache(self, user_id: str, input_hash: str) -> Optional[AIResponse]:
        """
        Check for cached response within 24 hours.

        Args:
            user_id: User ID
            input_hash: Input hash

        Returns:
            Cached AIResponse or None
        """
        try:
            # Query ai_runs for matching hash within 24 hours
            cutoff = datetime.now() - timedelta(hours=24)
            cutoff_str = cutoff.isoformat()

            result = self.db.table('ai_runs') \
                .select('*, ai_artifacts(*)') \
                .eq('user_id', user_id) \
                .eq('input_hash', input_hash) \
                .eq('status', 'success') \
                .gte('created_at', cutoff_str) \
                .order('created_at', desc=True) \
                .limit(1) \
                .execute()

            if not result.data:
                return None

            run = result.data[0]
            artifacts = run.get('ai_artifacts', [])

            if not artifacts:
                return None

            artifact = artifacts[0]

            # Build cached response
            content = artifact.get('json', {}).get('content', '')

            return AIResponse(
                content=content,
                input_tokens=run.get('input_tokens', 0),
                output_tokens=run.get('output_tokens', 0),
                model=run.get('model', 'unknown'),
                cost_usd=0.0,  # No cost for cache hit
                provider='cache',
                cached=True,
                run_id=run.get('id'),
            )

        except Exception as e:
            logger.error(f"Error checking cache: {e}")
            return None  # Fail open (don't block on cache error)

    def _check_budgets(self, user_id: str, user_tier: str) -> bool:
        """
        Check if EITHER total OR user budget is exceeded.

        Args:
            user_id: User ID
            user_tier: User tier ('free' or 'paid')

        Returns:
            True if either budget exceeded
        """
        # Check total budget
        if self.cost_tracker.is_total_budget_exceeded():
            return True

        # Check per-user budget
        if self.cost_tracker.is_user_budget_exceeded(user_id, user_tier):
            return True

        return False

    def _create_run(
        self,
        user_id: str,
        module: str,
        input_hash: str,
        provider: str
    ) -> str:
        """
        Create ai_runs record with status='running'.

        Args:
            user_id: User ID
            module: AI module
            input_hash: Input hash
            provider: Provider name

        Returns:
            Run ID
        """
        try:
            result = self.db.table('ai_runs') \
                .insert({
                    'user_id': user_id,
                    'module': module,
                    'input_hash': input_hash,
                    'provider': provider,
                    'status': 'running',
                    'model': 'unknown',  # Will update on success
                }) \
                .execute()

            run_id = result.data[0]['id']
            logger.debug(f"Created ai_run: {run_id}")
            return run_id

        except Exception as e:
            logger.error(f"Error creating ai_run: {e}")
            # Generate temporary ID (won't persist, but allows flow to continue)
            return f"temp_{datetime.now().timestamp()}"

    def _update_run_success(
        self,
        run_id: str,
        response: AIResponse,
        module: str
    ) -> None:
        """
        Update ai_runs record with success status and usage.

        Args:
            run_id: Run ID
            response: AIResponse
            module: AI module
        """
        try:
            self.db.table('ai_runs') \
                .update({
                    'status': 'success',
                    'model': response.model,
                    'input_tokens': response.input_tokens,
                    'output_tokens': response.output_tokens,
                    'cost_estimate': response.cost_usd,
                }) \
                .eq('id', run_id) \
                .execute()

        except Exception as e:
            logger.error(f"Error updating ai_run {run_id}: {e}")

    def _update_run_failure(self, run_id: str, error: str) -> None:
        """
        Update ai_runs record with failure status.

        Args:
            run_id: Run ID
            error: Error message
        """
        try:
            self.db.table('ai_runs') \
                .update({
                    'status': 'failed',
                    'error_message': error[:500],  # Truncate long errors
                }) \
                .eq('id', run_id) \
                .execute()

        except Exception as e:
            logger.error(f"Error updating ai_run {run_id} failure: {e}")

    def _create_artifact(
        self,
        run_id: str,
        user_id: str,
        module: str,
        response: AIResponse
    ) -> None:
        """
        Create ai_artifacts record with generated content.

        Args:
            run_id: Run ID
            user_id: User ID
            module: AI module
            response: AIResponse
        """
        try:
            self.db.table('ai_artifacts') \
                .insert({
                    'run_id': run_id,
                    'user_id': user_id,
                    'type': 'message',
                    'json': {
                        'content': response.content,
                        'model': response.model,
                        'provider': response.provider,
                    }
                }) \
                .execute()

        except Exception as e:
            logger.error(f"Error creating ai_artifact for run {run_id}: {e}")

    def get_stats(self) -> Dict[str, Any]:
        """
        Get AI service statistics.

        Returns:
            Dict with cost stats, rate limit info, provider health
        """
        return {
            'cost_stats': self.cost_tracker.get_cost_stats(days=7),
            'providers': [name for name, _ in self.providers],
            'total_daily_cost': self.cost_tracker.get_total_daily_cost(),
            'daily_budget': self.cost_tracker.DAILY_BUDGET_USD,
        }

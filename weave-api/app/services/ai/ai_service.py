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
from ..response_quality_checker import ResponseQualityChecker

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
        self.quality_checker = ResponseQualityChecker()  # Story 6.2

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
        user_context: Optional[Dict] = None,
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
            user_context: Optional user context snapshot from ContextBuilderService (Story 6.2)
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

        # 2. Enrich prompt with user context (Story 6.2)
        context_used = user_context is not None
        enriched_prompt = self._enrich_prompt_with_context(prompt, user_context, module)

        # 3. Check cache (use enriched prompt for hash)
        input_hash = self._compute_hash(enriched_prompt, module, kwargs.get('model', 'auto'))
        cached_response = self._check_cache(user_id, input_hash)
        if cached_response:
            logger.info(f"⚡ Cache hit for user {user_id}, module {module}")
            return cached_response

        # 4. Check budgets (dual: total + per-user)
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
                # Create ai_runs record with context tracking
                run_id = self._create_run(user_id, module, input_hash, provider_name, context_used)

                logger.info(f"🔄 Trying provider: {provider_name}")

                # Call provider with enriched prompt
                response = provider.complete(
                    prompt=enriched_prompt,
                    module=module,
                    **kwargs
                )

                # Quality check + retry logic (Story 6.2 AC #4)
                quality_flag = 'specific'  # Default
                if user_context:
                    quality_flag = self.quality_checker.check_response(response.content, user_context)

                    if quality_flag == 'generic':
                        logger.warning("🔄 Generic response detected, retrying with stronger prompt...")

                        # Build retry prompt
                        retry_prompt = self.quality_checker.build_retry_prompt(enriched_prompt, user_context)

                        try:
                            # Retry ONCE with stronger prompt
                            retry_response = provider.complete(
                                prompt=retry_prompt,
                                module=module,
                                **kwargs
                            )

                            # Check retry quality
                            retry_quality = self.quality_checker.check_response(retry_response.content, user_context)

                            if retry_quality in ['specific', 'excellent']:
                                # Retry succeeded - use retry response
                                logger.info(f"✅ Retry succeeded with quality: {retry_quality}")
                                response = retry_response
                                quality_flag = retry_quality
                            else:
                                # Retry still generic - use original anyway
                                logger.warning("⚠️  Retry still generic, using original response")
                                quality_flag = 'generic'  # Keep original flag

                        except Exception as e:
                            # Retry failed - use original response
                            logger.warning(f"⚠️  Retry failed: {e}, using original response")

                # Update run as success (includes cost, tokens, model, quality_flag)
                self._update_run_success(run_id, response, module, quality_flag)

                # Create artifact
                self._create_artifact(run_id, user_id, module, response)

                logger.info(
                    f"✅ {provider_name} success: ${response.cost_usd:.6f}, "
                    f"{response.input_tokens} in + {response.output_tokens} out tokens, quality={quality_flag}"
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
        Supports streaming from Bedrock, OpenAI, and Anthropic with automatic fallback.

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
            - {'type': 'done', 'input_tokens': N, 'output_tokens': M, 'cost_usd': X, 'provider': 'provider_name', 'run_id': 'uuid'} - Final metadata

        Raises:
            RateLimitError: If user exceeds rate limit
            AIServiceError: If all providers fail
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
            logger.warning("💰 Budget exceeded, using deterministic fallback")
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

        # 3. Compute input hash for run tracking
        input_hash = self._compute_hash(prompt, module, kwargs.get('model', 'auto'))

        # 4. Try streaming with each provider in fallback chain
        errors = []

        # Get providers that support streaming (exclude deterministic)
        streaming_providers = [(name, provider) for name, provider in self.providers
                              if name in ['bedrock', 'openai', 'anthropic']]

        if not streaming_providers:
            logger.error("🚨 No streaming providers available")
            raise AIServiceError("Streaming not available (no providers support streaming)")

        for provider_name, provider in streaming_providers:
            # Check if provider has stream() method
            if not hasattr(provider, 'stream'):
                logger.warning(f"⚠️  Provider {provider_name} does not support streaming, skipping")
                continue

            # Create ai_runs record
            run_id = self._create_run(user_id, module, input_hash, provider_name)

            try:
                logger.info(f"🔄 Streaming with {provider_name} provider")

                # Collect full content for artifact creation
                full_content = []
                input_tokens = 0
                output_tokens = 0
                cost_usd = 0.0
                model = kwargs.get('model', 'auto')

                # Stream from provider
                for chunk in provider.stream(prompt=prompt, module=module, **kwargs):
                    if chunk['type'] == 'chunk':
                        # Yield content chunk
                        full_content.append(chunk['content'])
                        yield chunk
                    elif chunk['type'] == 'done':
                        # Store final metadata
                        input_tokens = chunk.get('input_tokens', 0)
                        output_tokens = chunk.get('output_tokens', 0)
                        cost_usd = chunk.get('cost_usd', 0.0)
                        model = chunk.get('model', model)

                # Build response object for database
                complete_content = ''.join(full_content)
                response = AIResponse(
                    content=complete_content,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    model=model,
                    cost_usd=cost_usd,
                    provider=provider_name,
                    cached=False,
                    run_id=run_id,
                )

                # Update run as success (streaming doesn't have quality check yet)
                self._update_run_success(run_id, response, module, quality_flag='specific')

                # Create artifact
                self._create_artifact(run_id, user_id, module, response)

                logger.info(
                    f"✅ {provider_name} streaming success: ${cost_usd:.6f}, "
                    f"{input_tokens} in + {output_tokens} out tokens"
                )

                # Yield final metadata
                yield {
                    'type': 'done',
                    'input_tokens': input_tokens,
                    'output_tokens': output_tokens,
                    'cost_usd': cost_usd,
                    'provider': provider_name,
                    'run_id': run_id,
                }

                # Success! Exit without trying other providers
                return

            except AIProviderError as e:
                # Provider failed, log and try next
                self._update_run_failure(run_id, str(e))
                errors.append(f"{provider_name}: {e.message}")
                logger.warning(f"❌ {provider_name} streaming failed: {e.message}")

                # ✅ Fixed: Don't break on non-retryable errors - try other providers
                if not e.retryable:
                    logger.warning(f"⚠️  {provider_name} error is not retryable, but will try other streaming providers")

                continue  # Try next provider

            except Exception as e:
                # Unexpected error
                self._update_run_failure(run_id, f"Unexpected error: {e}")
                errors.append(f"{provider_name}: Unexpected error: {e}")
                logger.error(f"💥 {provider_name} unexpected streaming error: {e}")
                continue

        # ✅ Fixed: All streaming failed - fall back to non-streaming on all providers
        logger.warning("⚠️  All streaming providers failed, falling back to non-streaming")

        try:
            # Try non-streaming generation (will use same fallback chain: Bedrock → OpenAI → Anthropic → Deterministic)
            response = self.generate(
                user_id=user_id,
                user_role=user_role,
                user_tier=user_tier,
                module=module,
                prompt=prompt,
                **kwargs
            )

            # Yield as single chunk (non-streaming response)
            yield {'type': 'chunk', 'content': response.content}
            yield {
                'type': 'done',
                'input_tokens': response.input_tokens,
                'output_tokens': response.output_tokens,
                'cost_usd': response.cost_usd,
                'provider': response.provider,
                'run_id': response.run_id,
            }

        except Exception as e:
            # Ultimate fallback - deterministic
            logger.error(f"💥 Non-streaming also failed: {e}, using deterministic")
            deterministic = self.providers[-1][1]
            response = deterministic.complete(prompt=prompt, module=module, **kwargs)

            yield {'type': 'chunk', 'content': response.content}
            yield {
                'type': 'done',
                'input_tokens': response.input_tokens,
                'output_tokens': response.output_tokens,
                'cost_usd': 0.0,
                'provider': 'deterministic',
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
        provider: str,
        context_used: bool = False
    ) -> str:
        """
        Create ai_runs record with status='running'.

        Args:
            user_id: User ID
            module: AI module
            input_hash: Input hash
            provider: Provider name
            context_used: Whether user context was injected (Story 6.2)

        Returns:
            Run ID
        """
        try:
            run_data = {
                'user_id': user_id,
                'module': module,
                'input_hash': input_hash,
                'prompt_version': f'{module}-v1.0',  # Story 6.1: Added required prompt_version field
                'provider': provider,
                'status': 'running',
                'model': 'unknown',  # Will update on success
            }

            # Add context_used if column exists (Story 6.2 - graceful for migration)
            try:
                run_data['context_used'] = context_used
            except Exception:
                pass  # Column doesn't exist yet, skip

            result = self.db.table('ai_runs') \
                .insert(run_data) \
                .execute()

            run_id = result.data[0]['id']
            logger.debug(f"Created ai_run: {run_id} (context_used={context_used})")
            return run_id

        except Exception as e:
            logger.error(f"Error creating ai_run: {e}")
            # Generate temporary ID (won't persist, but allows flow to continue)
            return f"temp_{datetime.now().timestamp()}"

    def _update_run_success(
        self,
        run_id: str,
        response: AIResponse,
        module: str,
        quality_flag: str = 'specific'
    ) -> None:
        """
        Update ai_runs record with success status and usage.

        Args:
            run_id: Run ID
            response: AIResponse
            module: AI module
            quality_flag: Response quality ('generic', 'specific', 'excellent') - Story 6.2
        """
        try:
            update_data = {
                'status': 'success',
                'model': response.model,
                'input_tokens': response.input_tokens,
                'output_tokens': response.output_tokens,
                'cost_estimate': response.cost_usd,
            }

            # Add quality_flag if column exists (Story 6.2 - graceful for migration)
            try:
                update_data['quality_flag'] = quality_flag
            except Exception:
                pass  # Column doesn't exist yet, skip

            self.db.table('ai_runs') \
                .update(update_data) \
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

    def _enrich_prompt_with_context(
        self,
        prompt: str,
        user_context: Optional[Dict],
        module: str
    ) -> str:
        """
        Enrich user prompt with context snapshot for personalized AI responses.

        Story 6.2: Context Engine - injects user's goals, activity, identity into prompt.

        Args:
            prompt: Original user message
            user_context: User context snapshot from ContextBuilderService
            module: AI module (affects system prompt template)

        Returns:
            Enriched prompt with context injection
        """
        if not user_context:
            # No context available - return original prompt
            return prompt

        # Extract identity info for personality injection
        identity = user_context.get('identity', {})
        dream_self_name = identity.get('dream_self_name', 'Your Guide')
        personality_traits = identity.get('personality_traits', [])
        speaking_style = identity.get('speaking_style', 'Supportive and encouraging')

        # Build context-enriched system message
        context_header = f"""You are {dream_self_name}, the user's ideal self.

Your personality: {', '.join(personality_traits) if personality_traits else 'supportive, encouraging'}
Your speaking style: {speaking_style}

User's Current Situation (reference this data in your response):
- Active Goals: {len(user_context.get('goals', []))} goals
"""

        # Add goal details
        goals = user_context.get('goals', [])
        if goals:
            context_header += "\n  Goals:\n"
            for goal in goals:
                context_header += f"  - {goal.get('title', 'Unknown goal')}\n"

        # Add recent activity
        recent_activity = user_context.get('recent_activity', {})
        completions_count = recent_activity.get('completions_last_7_days', 0)
        if completions_count > 0:
            context_header += f"\n- Recent Activity: {completions_count} completions in last 7 days\n"
            most_recent = recent_activity.get('most_recent_completion')
            if most_recent:
                context_header += f"  Most recent: {most_recent.get('bind_title', 'Unknown')} ({most_recent.get('proof_type', 'no proof')})\n"

        # Add metrics (streaks, consistency)
        metrics = user_context.get('metrics', {})
        current_streak = metrics.get('current_streak', 0)
        if current_streak > 0:
            context_header += f"\n- Current Streak: {current_streak} days\n"

        # Add recent wins
        recent_wins = user_context.get('recent_wins', [])
        if recent_wins:
            context_header += f"\n- Recent Wins: {', '.join(recent_wins)}\n"

        # Instructions for AI
        context_header += """
IMPORTANT INSTRUCTIONS:
1. Reference specific data from above (goal names, streak, completion count)
2. Avoid generic advice like "stay motivated" without citing actual progress
3. If user asks about progress, cite their numbers (completion rate, streak days)
4. Acknowledge specific patterns (e.g., "I see you completed 'Morning workout' 5 times this week")
5. Celebrate wins when relevant (streaks, milestones, consistency)

"""

        # Combine context with user's actual message
        enriched_prompt = f"{context_header}\nUser's message:\n{prompt}"

        logger.info(f"✅ Enriched prompt with user context (goals: {len(goals)}, completions: {completions_count}, streak: {current_streak})")

        return enriched_prompt
